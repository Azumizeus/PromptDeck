---
name: browser-act-skills
license: MIT
description: 103 skills d'automatisation navigateur Browser-Act : social-listening (X, Instagram, Trustpilot, WeChat…), scraping de profils, veille de marque. Use when a task needs reading or acting on web/social data.
---

# Browser-Act Skills

<!-- Ajouté le 30/09/2026 depuis le chat Telegram « dunk cash » (repo cloné). -->

## Overview

`browser-act/skills` — skills browser-use packagées : `social-listening/x-tweet-search`, `instagram-post-comments`, `trustpilot-reviews`, `threads-user-posts`, forge pour créer ses propres skills (`browser-act-skill-forge`).

## Repo local

`~/Desktop/Repo github a utiliser/skills/` (source : github.com/browser-act/skills)

- `browser-act/SKILL.md` (socle), `solutions/social-listening/*/SKILL.md`, `docs/`

## Verdict install (30/09/2026)

- La CLI officielle `browser-act-cli` n'a **pas de build macOS Intel** (wheels : arm64, Linux x64/arm64, Windows) → pas installable sur ce Mac.
- **Les recettes restent valides sans la CLI** : patterns d'URL + scripts d'extraction, testés le 30/09 sur Trustpilot (avis extraits via navigateur local) ✓. À utiliser avec le pilotage navigateur de l'agent (Freebuff/ChatDesk) plutôt que la CLI.
- **Remplacement : obscura** (github.com/h4ckf0r0day/obscura, cloné dans `~/Desktop/Repo github a utiliser/obscura/`) — headless browser Rust avec build **x86_64-macos** ✓, installé le 01/10 dans `~/tools/obscura/` (lien `~/.local/bin/obscura`). `obscura fetch --dump text|html|markdown <url>`, `--stealth`, `obscura mcp` (serveur MCP intégré !). Testé le 01/10 : rendu JS OK (quotes.toscrape.com/js) ; Trustpilot le bloque (challenge anti-bot) — utiliser le navigateur piloté pour les sites protégés.

## When to Use

- Veille X/Instagram (complète myzoe/Zoe côté Reels), monitoring de mentions, collecte de commentaires.
- S'appuie sur le stack browser-use existant (sidecar :8788, CDP :9222).
