---
name: browser-use-guide
description: >-
  Référence du serveur MCP browser-use (venv ~/tools/browser-use-venv, v0.13.10)
  partagé par 4 clients : OpenCode, Freebuff, ChatDeck, Claude Desktop. Use when
  il faut naviguer/cliquer/extraire le contenu d'une page web depuis un agent,
  diagnostiquer un serveur browser-use qui ne répond pas, brancher un nouveau
  client MCP, activer le mode agent autonome (retry_with_browser_use_agent et
  sa clé LLM OpenRouter), ou qu'une tâche demande du contrôle de navigateur
  réel (Chrome visible, CDP :9222).
---

# browser-use — navigateur réel partagé par les agents

Un seul serveur MCP **browser-use** (`browser-use[cli]` 0.13.10, venv
`~/tools/browser-use-venv`, commande `browser-use --mcp`) pilote le Chrome
réel de la machine via CDP (`127.0.0.1:9222`) et est branché sur 4 clients :
OpenCode, Freebuff, ChatDeck, Claude Desktop. 16 outils : contrôle direct
(navigate, click, type, get_state, extract_content…), gestion d'onglets, et
un mode **agent autonome** (`retry_with_browser_use_agent`) qui délègue une
tâche entière à un agent browser-use avec LLM.

## Overview

- **Binaire** : `/Users/mickaeldunoyer/tools/browser-use-venv/bin/browser-use`
  (Python 3.12 via uv — le Python système 3.9 est inutilisable). L'extra
  `[cli]` est **requis** pour le mode `--mcp`.
- **Serveur MCP** : `browser-use --mcp` (stdio, JSON-RPC), lancé par chaque
  client à la demande. `browser-use --version` / `browser-use doctor` pour
  diagnostiquer (chrome running, daemon alive, active browser connections).
- **Configs clients** (backup `.bak-browser-use` avant chaque modif) :
  OpenCode `~/.config/opencode/opencode.json` → `mcp["browser-use"]`
  (type local, timeout 180000) · Freebuff `~/.agents/mcp.json` →
  `mcpServers` (⚠️ ne jamais toucher `~/.freebuff/mcp.json`, app-managed) ·
  ChatDeck `~/.chatdeck/mcp-servers.local.json` (tableau d'entrées,
  timeoutMs 180000) · Claude Desktop `~/Library/Application
  Support/Claude/claude_desktop_config.json` → `mcpServers` (test réel
  pending : nécessite un redémarrage de l'app par l'utilisateur).
- **Les 16 outils** : `browser_navigate` (arg `url`), `browser_click`
  (index ou coordonnées), `browser_type`, `browser_get_state`,
  `browser_extract_content` (⚠️ arg `query` obligatoire), `browser_get_html`,
  `browser_screenshot`, `browser_scroll`, `browser_go_back`,
  `browser_list_tabs`, `browser_switch_tab`, `browser_close_tab`,
  `browser_list_sessions`, `browser_close_session`, `browser_close_all`,
  `retry_with_browser_use_agent` (args : `task` requis, `max_steps`,
  `model`, `allowed_domains`, `use_vision`).
- **Mode autonome** : la clé LLM est lue dans l'`env` du serveur
  (`OPENAI_API_KEY` + `OPENAI_BASE_URL` + `BROWSER_USE_LLM_MODEL`) ou dans
  `~/.config/browseruse/config.json` (bloc `llm`, placeholder par défaut ;
  le champ `base_url` y est ignoré — passer par l'env). Setup validé :
  clé OpenRouter + `google/gemini-2.5-flash` (vision + JSON structuré OK,
  agent réel a lu le titre d'example.com).
- **Diagnostic** : le daemon browser-harness peut mourir
  (`browser-use doctor` → FAIL) — `browser-use --reload` puis relancer un
  appel ; si macOS affiche la feuille « Allow remote debugging? », lancer
  `browser-use mac-approve`. Les backends gratuite de OmniRoute refusent ou
  n'acceptent pas les images (dva/ = pas d'images, ddgw/ = rate-limit) :
  utiliser OpenRouter pour l'autonomie.

## When to Use

- Quand un agent doit agir sur le web réel : naviguer, cliquer, remplir un
  formulaire, extraire du contenu rendu (JS), faire une capture d'écran.
- Pour brancher un nouveau client MCP : copier la déclaration d'un client
  existant (commande du venv + `--mcp`), faire un `.bak` avant modif,
  tester le handshake `initialize` + `tools/list` (16 outils attendus).
- Quand `retry_with_browser_use_agent` répond « OPENAI_API_KEY not set » :
  l'env LLM du serveur est absente — la (re)mettre dans la config du client.
- Pour diagnostiquer : `browser-use doctor` d'abord, puis un
  `browser_navigate` minimal vers https://example.com via MCP.
- Pour choisir entre contrôle direct et autonome : outils directs pour une
  séquence connue et scriptable ; agent autonome en dernier recours pour
  une page imprévisible (c'est sa doc officielle : « only use as a last
  resort »).

## Common Rationalizations

- « Je vais utiliser un autre outil de navigateur » → Non : browser-use est
  déjà branché sur 4 clients et partagé ; un second serveur ferait doublon
  et coûterait de la maintenance.
- « Le mode autonome marche avec n'importe quel modèle » → Non : il faut
  vision + JSON structuré fiable ; les backends gratuit testés (dva/, ddgw/,
  auto/) échouent — OpenRouter `google/gemini-2.5-flash` est le setup validé.
- « Pas besoin de tester, la config est bonne » → Non : tester toujours en
  réel (navigate example.com via MCP, ou agent autonome 5 étapes) ; un
  handshake OK ne prouve pas que le Chrome réel répond.
- « Je peux mettre la clé dans config.json » → Partiellement faux : la clé
  oui (`OPENAI_API_KEY` écrase le placeholder), mais `base_url` du
  config.json est **ignoré** (champ non déclaré dans LLMEntry) — le
  `OPENAI_BASE_URL` doit venir de l'env du serveur.
- « Le serveur est mort, je réinstalle » → Non : 90 % du temps c'est le
  daemon browser-harness (`browser-use --reload` suffit) ou l'approbation
  macOS (`browser-use mac-approve`).

## Red Flags

- Toucher `~/.freebuff/mcp.json` (fichier d'état app-managed avec hash de
  manifest) au lieu de `~/.agents/mcp.json` (déclaration).
- Modifier une config client sans backup `.bak-browser-use` préalable.
- Appeler `browser_extract_content` sans l'argument `query` (erreur immédiate).
- Supposer qu'un modèle « gratuit » gérera les captures d'écran de l'agent
  autonome : erreur `unsupported_image_block` ou hallucination au lieu du
  JSON attendu.
- Lancer plusieurs serveurs/daemons browser-use en parallèle (conflits CDP
  sur :9222) — un seul daemon, vérifié par `browser-use doctor`.
- Tester Claude Desktop en éditant sa config sans redémarrage de l'app :
  l'app ne relit pas le fichier à chaud — le test réel reste pending jusqu'au
  redémarrage par l'utilisateur.

## Verification

Zéro dépendance : `node --test scripts/browser-use-guide-test.mjs` vérifie
SKILL.md (frontmatter, 5 sections, doc des 4 clients + 16 outils) et sonde
l'environnement réel (binaire présent, --version, handshake MCP) — skip
propre si le venv est absent (machine tierce).

```bash
# 1. Binaire et version
/Users/mickaeldunoyer/tools/browser-use-venv/bin/browser-use --version

# 2. Santé complète (chrome running, daemon alive, connections)
/Users/mickaeldunoyer/tools/browser-use-venv/bin/browser-use doctor

# 3. Navigation réelle via MCP (n'importe quel client branché)
#    → tools/call browser_navigate {url: "https://example.com"} doit répondre
#      "Navigated to: https://example.com"

# 4. Mode autonome (clé LLM requise dans l'env du serveur)
#    → tools/call retry_with_browser_use_agent
#      {task: "Va sur https://example.com et renvoie le titre exact de la page.",
#       max_steps: 10} doit finir par "Success: True" + le titre.

# 5. Tests du skill
node --test skills/browser-use-guide/scripts/browser-use-guide-test.mjs
node skills/validate-skills.js   # 180/180 attendu
```

Critère de réussite : doctor OK (daemon alive), navigation example.com
répond, et les tests du skill passent.
