---
name: headroom-compression
description: Compress tool outputs, logs, JSON, code and files before they reach the LLM via the Headroom proxy running locally on port 8787. Use when token costs are high, context is bloated with repetitive tool output (grep results, build logs, large JSON), or when the user mentions headroom, compression, token savings, or cheaper agents. Also covers headroom CLI usage (wrap, doctor, dashboard, stats, learn) and the headroom MCP server tools (headroom_compress, headroom_retrieve, headroom_stats).
---

# Headroom — compression de contexte pour agents

Headroom est installé et **tourne en permanence** sur cette machine : un proxy local
sur `http://127.0.0.1:8787` (LaunchAgent `ai.headroom.proxy`, backend OpenRouter)
qui compresse le trafic des agents avant l'envoi au LLM. Tout tourne en local,
rien ne part ailleurs.

## État & diagnostic

```bash
headroom doctor          # santé : proxy, agents routés, économies
curl -s http://127.0.0.1:8787/health      # le proxy répond-il ?
curl -s http://127.0.0.1:8787/stats | python3 -m json.tool | head -40   # tokens économisés
headroom dashboard       # UI vivante (http://127.0.0.1:8787/dashboard)
```

Champs clés de `/stats` : `compression.total_tokens_saved_all_layers`,
`compression.avg_compression_pct`, `cost.total_saved_usd`.

## Router un agent à travers le proxy

```bash
headroom wrap opencode --no-proxy --no-serena   # session OpenCode compressée
headroom wrap claude --no-proxy                 # session Claude Code compressée
headroom unwrap opencode                        # revenir en arrière
```

Dans la session, utiliser un modèle préfixé `headroom/…` (ex. `headroom/gpt-4.1`) :
c'est le signal « passe par le compresseur ». Sans proxy déjà lancé, retirer
`--no-proxy` (le wrap démarre le sien).

## Gains attendus

- Sorties de **recherche de code** (grep/read massifs) : ~20 %
- **JSON / logs répétitifs** : 60–95 %
- Prose dense : peu. Le compteur `/stats` fait foi pour la charge réelle.

## Notes machine (à jour au 24/09/2026)

- CLI v0.35.0 (`~/.local/bin/headroom`) — la 0.38 exige `onnxruntime>=1.24`, sans
  wheel macOS Intel ; ne pas tenter la mise à jour sur cette machine.
- Le proxy doit être lancé avec les clés chargées (le LaunchAgent source
  `~/.secrets`). Redémarrage manuel :
  `launchctl kickstart -k gui/$(id -u)/ai.headroom.proxy`
- Arrêt : `launchctl bootout gui/$(id -u)/ai.headroom.proxy`
- Code source cloné : `~/projects/headroom` · fiche : `~/projects/REPOS.md`
- Test réel sur le hub Seeker : 531 621 → 526 213 tokens (5 408 économisés) sur
  une tâche d'exploration ; les charges répétitives (logs/JSON) compressent beaucoup plus.

## Quand l'utiliser (règles de décision)

1. L'utilisateur demande des économies de tokens / coûts → proposer `headroom wrap`.
2. Une session va lire beaucoup de logs/JSON/grep → router via le proxy.
3. Diagnostic « l'agent est lent / cher » → `headroom doctor` d'abord.
4. Ne jamais compresser ce qui doit rester exact octet pour octet (clés, diffs courts).
