---
name: mempalace
license: MIT
description: MemPalace — mémoire IA locale 100 % offline (palais de tiroirs, recherche BM25 + embeddings ONNX locaux, MCP). INSTALLÉ le 30/09/2026 : CLI + palais ~/projects/memoire-mickael, branché MCP sur opencode/ChatDesk/Claude Desktop. Use when an agent needs to recall tool decisions, repos, or past setup — or to store long-term memory without any server.
---

# MemPalace

<!-- Ajouté le 30/09/2026 depuis le chat Telegram « dunk cash » (repo cloné). -->

## Overview

`MemPalace/mempalace` (Python, distribution PyPI `mempalace`) — mémoire locale : chaque doc miné est découpé en tiroirs (drawers) dans un « palais », recherche en langage naturel. **Installé le 30/09** : `uv tool install mempalace` (v3.10.0).

## Repo local

- `~/Desktop/Repo github a utiliser/mempalace/` (source : github.com/MemPalace/mempalace)
- **Palais actif : `~/projects/memoire-mickael/`** — 92 tiroirs minés depuis les inventaires d'outils (repos Telegram, index maître, listes). Voir son `README.md`.
- MCP : `mempalace-light-mcp` sur opencode + ChatDesk (env `MEMPALACE_PALACE_PATH`), `mempalace-mcp` sur Claude Desktop (`--palace`). ⚠️ bug 3.10.0 : le light refuse `--palace` en argument.

## When to Use

- Retrouver un outil/décision/repos déjà documenté : « cherche dans mempalace » (outil MCP `palace_query` côté agents).
- Étendre la mémoire : déposer un .md dans `~/projects/memoire-mickael/` puis `mempalace mine ~/projects/memoire-mickael`.
- Comparer avec agentmemory :3111 avant d'ajouter un second système — ne pas dupliquer.
