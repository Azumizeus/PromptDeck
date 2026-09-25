---
name: llm-provider-cascade
description: Route LLM requests through a fallback cascade of API providers (omniroute → freellm → groq → cerebras → mistral → cohere → gemini → openrouter → anthropic) so a chat, script or agent keeps working when one provider fails with 403, quota or network errors. Use when the user mentions provider cascade, fallback LLM routing, 403/quota errors on an API, multi-provider resilience, MEGA PACK chat cascade, or wants one prompt to try every configured API key (OpenCode auth.json, env vars) until one answers.
---

# LLM Provider Cascade — routeur à bascule automatique

**Objectif :** garantir une réponse LLM dès qu'*au moins une* clé API du set fonctionne.
Si le provider demandé échoue (HTTP ≥ 400, timeout, quota), la requête bascule
automatiquement vers le suivant — sans intervention.

**Ordre de la cascade** (locaux d'abord, puis cloud par coût/latence) :

```
omniroute (local) → freellm (local) → groq → cerebras → mistral → cohere
→ gemini → openrouter → anthropic
```

## When to Use

- Un chat/agent plante sur 403, quota épuisé, clé expirée ou réseau instable.
- Tu écris un script ou un outil qui doit appeler un LLM de façon fiable.
- L'utilisateur mentionne « cascade », « provider en échec », « bascule automatique ».
- Intégration MEGA PACK : le mini-chat 💬 de l'app embarque exactement cette cascade
  (`chat-send` / `chat-send-stream` dans `menubar-app-luxe/main.js`).

## Process

1. **Inventorier les clés disponibles** — sources, dans l'ordre : variables
   d'environnement (`GROQ_API_KEY`, `GEMINI_API_KEY`/`GOOGLE_API_KEY`, `MISTRAL_API_KEY`,
   `CEREBRAS_API_KEY`, `COHERE_API_KEY`, `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`,
   `FREELLMAPI_API_KEY`), override `MGP_API_KEY_<PROVIDER>`, puis `~/.local/share/opencode/auth.json`
   (config OpenCode, lu sans jamais l'imprimer).
2. **Sonder avant d'envoyer** (recommandé) : `--check` fait un ping 1 token par provider
   et met l'état de santé en cache 10 min dans `~/.cache/llm-cascade-health.json`.
3. **Router** : envoyer au premier provider vivant ; en cas d'échec, passer au suivant.
   Un seul provider par requête finale ; timeout 15 s par tentative.
4. **Tracer** : chaque réponse rapporte le provider réellement utilisé, la latence,
   et les bascules effectuées. Jamais de clé en clair dans la sortie.

### Script livré

```bash
python3 skills/llm-provider-cascade/scripts/llm-cascade.py --check          # sonde tous les providers
python3 skills/llm-provider-cascade/scripts/llm-cascade.py "Ta question"    # réponse + trace cascade
python3 skills/llm-provider-cascade/scripts/llm-cascade.py --provider groq "Question"  # départ imposé
```

Codes de sortie : `0` réponse obtenue · `1` tous providers en échec (le diagnostic
par provider est imprimé sur stderr) · `2` usage invalide.

### Règles de sécurité

- Ne jamais logger ni afficher une clé (masquée `sk-…4 derniers caractères`).
- État de santé mis en cache 10 min — ne pas sonder en boucle (quota !).
- Un provider local (omniroute :20128, freellm :8000, ollama :11434) est tenté sans clé ;
  s'il n'écoute pas, bascule immédiate sans attendre le timeout complet.

## Common Rationalizations

- « Un seul provider suffit » → faux : les quotas gratuits tombent sans prévenir ; la
  cascade est le seul moyen d'avoir un service continu.
- « Je vais réessayer le même provider en boucle » → anti-pattern : 403 ne guérit pas
  en 3 secondes ; bascule vers le suivant immédiatement.
- « Lire la clé depuis un fichier en clair » → interdit : env var ou `auth.json` uniquement,
  jamais d'impression, jamais de persistance de la clé dans une sortie.

## Red Flags

- Imprimer une clé API (même partielle au-delà de 4 caractères) dans une réponse.
- Sonder les 9 providers à chaque requête sans cache.
- Ajouter un provider sans l'ordre de la cascade documenté ici.

## Verification

- `--check` : au moins un provider doit répondre `ok` sur ce set (Gemini validé en réel
  le 25/09/2026 — « OK »).
- Script : envoyer un prompt factice et vérifier la trace `provider=` + latence.
- Dans MEGA PACK : le mini-chat 💬 doit répondre même avec Groq en 403 (cascade vers
  omniroute/freellm/gemini), visible dans la bulle (provider utilisé affiché).

## Voir aussi

- Skill `headroom-compression` : compresser le contexte *avant* l'appel — les deux se
  combinent (cascade pour la fiabilité, headroom pour le coût).
- App MEGA PACK : Réglages → Intelligence (clés chiffrées au trousseau via safeStorage).
