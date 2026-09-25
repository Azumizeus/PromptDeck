#!/usr/bin/env python3
"""LLM Provider Cascade — routeur à bascule automatique (skill llm-provider-cascade).

Essaie les providers dans l'ordre de la cascade jusqu'à obtenir une réponse.
Sources de clés : variables d'environnement, MGP_API_KEY_<PROVIDER>,
~/.local/share/opencode/auth.json (config OpenCode, lue sans jamais être affichée).

Usage :
  llm-cascade.py --check                      # sonde tous les providers (santé, cache 10 min)
  llm-cascade.py "Ta question"                # réponse + trace (provider, latence, bascules)
  llm-cascade.py --provider groq "Question"   # départ imposé, cascade ensuite
  llm-cascade.py --system "Tu es utile." "Q"  # message système

Codes de sortie : 0 ok · 1 tous en échec · 2 usage.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

# Ordre de la cascade : locaux d'abord, puis cloud par coût/latence.
CASCADE = [
    ("omniroute",  "http://127.0.0.1:20128/v1/chat/completions", "auto/best-fast",         False),
    ("freellm",    "http://127.0.0.1:8000/v1/chat/completions",  "auto",                   False),
    ("groq",       "https://api.groq.com/openai/v1/chat/completions", "openai/gpt-oss-20b", True),
    ("cerebras",   "https://api.cerebras.ai/v1/chat/completions", "gpt-oss-120b",           True),
    ("mistral",    "https://api.mistral.ai/v1/chat/completions", "mistral-small-latest",    True),
    ("cohere",     "https://api.cohere.com/compatibility/v1/chat/completions", "command-r-plus-08-2024", True),
    ("gemini",     "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", "gemini-flash-latest", True),
    ("openrouter", "https://openrouter.ai/api/v1/chat/completions", "meta-llama/llama-3.3-70b-instruct", True),
    ("anthropic",  "https://api.anthropic.com/v1/messages", "claude-haiku-4-20250514",        True),
]
ENV_KEYS = {
    "groq": ("GROQ_API_KEY",),
    "cerebras": ("CEREBRAS_API_KEY",),
    "mistral": ("MISTRAL_API_KEY",),
    "cohere": ("COHERE_API_KEY",),
    "gemini": ("GEMINI_API_KEY", "GOOGLE_API_KEY"),
    "openrouter": ("OPENROUTER_API_KEY",),
    "anthropic": ("ANTHROPIC_API_KEY",),
    "freellm": ("FREELLMAPI_API_KEY",),
}
HEALTH_CACHE = os.path.expanduser("~/.cache/llm-cascade-health.json")
CACHE_TTL = 10 * 60          # 10 min
TIMEOUT = 15                 # s par tentative


def opencode_keys():
    """Clés de ~/.local/share/opencode/auth.json — lues, jamais imprimées.
    Format réel : { "<nom>": {"type": "api", "key": "sk-…"} } avec des noms
    aliasés (freellmapi, mistral-direct, google…) remappés vers nos providers."""
    p = os.path.expanduser("~/.local/share/opencode/auth.json")
    try:
        raw = json.load(open(p))
    except Exception:
        return {}
    aliases = {
        "freellm": ("freellm", "freellmapi"),
        "mistral": ("mistral", "mistral-direct"),
        "cerebras": ("cerebras", "cerebras-direct"),
        "cohere": ("cohere", "cohere-direct"),
        "gemini": ("gemini", "google", "google-direct"),
        "groq": ("groq",),
        "openrouter": ("openrouter",),
        "anthropic": ("anthropic",),
        "omniroute": ("omniroute",),
    }
    out = {}
    for provider, names in aliases.items():
        for name in names:
            entry = raw.get(name)
            if isinstance(entry, dict):
                key = entry.get("key") or entry.get("api_key")
                if key:
                    out[provider] = key
                    break
    return out


def key_for(provider):
    """Clé du provider : MGP_API_KEY_<P> > env dédiées > auth.json OpenCode."""
    ov = os.environ.get("MGP_API_KEY_" + provider.upper())
    if ov:
        return ov
    for env in ENV_KEYS.get(provider, ()):
        if os.environ.get(env):
            return os.environ[env]
    return OPCODE_KEYS.get(provider, "")


OPCODE_KEYS = opencode_keys()


def load_health():
    try:
        d = json.load(open(HEALTH_CACHE))
        if time.time() - d.get("at", 0) < CACHE_TTL:
            return d.get("providers", {})
    except Exception:
        pass
    return {}


def save_health(providers):
    try:
        os.makedirs(os.path.dirname(HEALTH_CACHE), exist_ok=True)
        json.dump({"at": time.time(), "providers": providers}, open(HEALTH_CACHE, "w"))
    except Exception:
        pass


def request_once(provider, base, model, needs_key, messages, stream=False):
    """Une requête vers un provider. Lève RuntimeError en cas d'échec HTTP/réseau."""
    if needs_key and not key_for(provider):
        raise RuntimeError("pas de clé (env / MGP_API_KEY_* / opencode auth.json)")
    if provider == "anthropic":
        payload = {"model": model, "max_tokens": 1024, "messages": messages}
        headers = {"x-api-key": key_for(provider), "anthropic-version": "2023-06-01"}
    else:
        payload = {"model": model, "messages": messages, "max_tokens": 1024}
        headers = {}
        if needs_key:
            headers["Authorization"] = "Bearer " + key_for(provider)
    req = urllib.request.Request(
        base,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            body = json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError("HTTP %d" % e.code)
    except Exception as e:
        raise RuntimeError(type(e).__name__)
    latency = round(time.time() - t0, 2)
    if provider == "anthropic":
        text = "".join(c.get("text", "") for c in body.get("content", []))
    else:
        text = (body.get("choices") or [{}])[0].get("message", {}).get("content", "")
    if not text:
        raise RuntimeError("réponse vide")
    return text, latency


def run(messages, start=None):
    """Cascade complète. Retourne (texte, provider_utilisé, latence, bascules)."""
    health = load_health()
    order = CASCADE
    if start:
        idx = [i for i, c in enumerate(CASCADE) if c[0] == start]
        if not idx:
            print("provider inconnu : %s" % start, file=sys.stderr)
            sys.exit(2)
        order = [CASCADE[idx[0]]] + [c for c in CASCADE if c[0] != start]
    failures, fallbacks = [], []
    for provider, base, model, needs_key in order:
        if health.get(provider) == "down":
            failures.append((provider, "cache: down"))
            continue
        try:
            text, latency = request_once(provider, base, model, needs_key, messages)
            health[provider] = "ok"
            save_health(health)
            return text, provider, latency, fallbacks
        except RuntimeError as e:
            failures.append((provider, str(e)))
            fallbacks.append(provider)
            health[provider] = "down"
            save_health(health)
    print("── Tous les providers ont échoué ──", file=sys.stderr)
    for p, why in failures:
        print("  ✗ %-10s %s" % (p, why), file=sys.stderr)
    sys.exit(1)


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)
    start, system = None, ""
    if args[0] == "--provider":
        start = args[1]
        args = args[2:]
    if args and args[0] == "--system":
        system, args = args[1], args[2:]
    if args and args[0] == "--check":
        check()
        return
    if not args:
        print(__doc__)
        sys.exit(2)
    messages = ([{"role": "system", "content": system}] if system else []) + [
        {"role": "user", "content": " ".join(args)}
    ]
    text, provider, latency, fallbacks = run(messages, start)
    print(text)
    trace = "provider=%s latency=%ss" % (provider, latency)
    if fallbacks:
        trace += " | bascules après : %s" % " → ".join(fallbacks)
    print("\n── %s ──" % trace, file=sys.stderr)


def check():
    """Sonde chaque provider (ping 1 token) — état de santé affiché et mis en cache."""
    health = load_health()
    ok = 0
    for provider, base, model, needs_key in CASCADE:
        if health.get(provider) and provider not in ():
            state = health[provider]
        else:
            try:
                _, _ = request_once(provider, base, model, needs_key,
                                    [{"role": "user", "content": "ping"}])
                state = "ok"
            except RuntimeError as e:
                state = "down (%s)" % e
            health[provider] = "down" if state != "ok" else "ok"
        mark = "✓" if state == "ok" else "✗"
        key = "clé:oui" if (not needs_key or key_for(provider)) else "clé:NON"
        print("  %s %-10s %-8s %s" % (mark, provider, key, state if state != "ok" else ""))
        ok += state == "ok"
    save_health(health)
    print("── %d/%d providers opérationnels ──" % (ok, len(CASCADE)))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
