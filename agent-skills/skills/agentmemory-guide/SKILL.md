---
name: agentmemory-guide
description: >-
  Gère la mémoire persistante inter-apps de Mikael via le serveur agentmemory
  (localhost:3111, LaunchAgent com.mickael.agentmemory). Use when l'utilisateur
  demande de se souvenir de quelque chose entre les sessions, de rappeler un
  fait d'une session précédente, d'importer des transcriptions JSONL, de
  vérifier l'état du serveur de mémoire, ou mentionne agentmemory, memory_save,
  memory_recall, mémoire partagée, viewer 3113 — pour OpenCode, Freebuff,
  ChatDeck et LibreChat, qui partagent tous le même serveur.
---

# agentmemory — mémoire partagée inter-apps

Mémoire persistante **100 % locale** pour tous les agents de la machine :
un seul serveur (`@agentmemory/agentmemory` v0.9.29 sur **:3111**), quatre
clients branchés (OpenCode, Freebuff, ChatDeck, LibreChat). Un fait appris
dans une app ressort dans les autres. Captures, compression, recherche
hybride BM25 + vectoriel + graphe, replay des sessions.

## Overview

- **Serveur** : `:3111` API REST + MCP-over-REST (`/agentmemory/mcp/call`),
  `:3112` streams (WebSocket), `:3113` viewer temps réel (Replay tab).
- **Auto-start** : LaunchAgent `com.mickael.agentmemory`
  (`~/Library/LaunchAgents/com.mickael.agentmemory.plist`, RunAtLoad + KeepAlive,
  logs dans `~/Library/Logs/agentmemory.{log,err.log}`).
- **Clients** : OpenCode (`~/.config/opencode/opencode.json` → `mcp.agentmemory`,
  stdio `npx -y @agentmemory/mcp`), Freebuff (`~/.agents/mcp.json` → `mcpServers`),
  ChatDeck (connecteur HTTP auto-seedé `agentmemory` → `http://localhost:3111`,
  appelé via `connector_call`), LibreChat (conteneur : package monté
  `/app/agentmemory-npm` + shim `standalone.mjs` proxy REST, `librechat.yaml`).
- **Import** : transcriptions Claude Code JSONL via `import-jsonl`
  (déjà importées : 2 sessions, tag `jsonl-import`).
- **Binaire** : la commande globale `agentmemory` n'est pas sur le PATH ;
  lancer via `node ~/.nvm/versions/node/v24.16.0/lib/node_modules/@agentmemory/agentmemory/dist/cli.mjs …`.

## When to Use

- Avant de répondre sur un fait durable du setup (ports, providers, conventions,
  décisions) : **appelle d'abord un outil de rappel** (`memory_smart_search` via
  MCP, ou `POST /agentmemory/search`), sinon tu inventeras des valeurs crédibles.
- Quand l'utilisateur dit « souviens-toi », « retiens ça », « qu'est-ce qu'on a
  fait la dernière fois », « est-ce que tu te rappelles ».
- Pour enregistrer une décision/convension : `memory_save` avec une phrase
  **autonome et datée** (« ChatDeck utilise le port 5199 », jamais « on utilise
  ce port »).
- Pour vérifier l'état : health/liveness, sessions listées, nombre d'observations.
- Pour rejouer une session passée : viewer `:3113` → onglet Replay.

## Common Rationalizations

- « Je connais déjà la réponse, pas besoin de chercher » → Non : les configs
  changent plusieurs fois par semaine ; la mémoire est la source de vérité.
- « Le serveur doit être down, je vais répondre sans » → Non : vérifie
  (`GET /agentmemory/livez`) ; s'il est down, `launchctl kickstart -k
  gui/$UID/com.mickael.agentmemory` le relance — ne réponds jamais de mémoire.
- « Je vais tout mettre dans une seule grosse mémoire » → Non : 10 mémoires
  courtes et autonomes > 1 pavé ; la recherche hybride aime les faits atomiques.
- « Les résultats vides = bug » → Non : réponds explicitement « mémoire vide —
  je n'ai rien sur ce sujet » et propose de l'alimenter, comme pour cognee.
- « Je recrée le serveur avec npx » → Non : le LaunchAgent existe ; npx met en
  cache par version et démarre un doublon. Utilise launchd ou le CLI node direct.

## Red Flags

- Répondre un port, un provider ou une convention **sans avoir rappelé** la
  mémoire au préalable (risque d'hallucination observé).
- Utiliser `cognee recall` pour un fait agentmemory (ou l'inverse) : deux
  mémoires coexistent — agentmemory = sessions/travail des agents, cognee =
  graphe de connaissances du hub. En cas de doute, interroge les deux.
- Lancer un second serveur `agentmemory` alors que le LaunchAgent tourne déjà
  (conflit de port 3111 — vérifie `lsof -iTCP:3111 -sTCP:LISTEN`).
- Écrire dans `~/.freebuff/mcp.json` (fichier d'état app-managed avec hash de
  manifest) au lieu de `~/.agents/mcp.json` (déclaration).
- Oublier que LibreChat est **conteneurisé** : tout chemin hôte doit être
  bind-mounté, et `localhost` du conteneur ≠ Mac.

## Verification

Zéro dépendance : `node --test scripts/agentmemory-guide-test.mjs` vérifie le
SKILL.md (sections, frontmatter) et sonde le serveur vivant.

```bash
# 1. Serveur vivant ?
curl -s -m 4 http://localhost:3111/agentmemory/livez

# 2. Une session importée est bien retrouvée ? (doit citer le tag jsonl-import)
curl -s -m 6 -X POST http://localhost:3111/agentmemory/mcp/call \
  -H 'Content-Type: application/json' \
  -d '{"name":"memory_sessions","arguments":{}}' | grep -o jsonl-import | head -1

# 3. Tests du skill
node --test scripts/agentmemory-guide-test.mjs
```

Critère de réussite : livez répond `status: ok`, au moins une session
`jsonl-import` est listée, et les tests passent.
