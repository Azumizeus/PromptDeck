---
name: obscura
description: >
  Navigateur headless Rust pour agents : fetch avec rendu JS, scraping
  structuré, serveur MCP avec 37 outils de navigation (clic, formulaires,
  extraction CSS). Binaire installé sur ce Mac (Intel) dans ~/tools/obscura.
  Remplace la CLI browser-act (pas de build macOS Intel). Triggers : « scrape
  cette page », « rendu JS », « navigateur headless », « obscura ».
---

# Obscura — navigateur headless pour agents

## Overview

Repo : https://github.com/h4ckf0r0day/obscura (cloné dans `~/Desktop/Repo github a utiliser/obscura/`,
binaire v0.2.3 dans `~/tools/obscura/obscura`, lié dans `~/.local/bin/obscura`).
100 % local, build macOS **x86_64 dispo** (contrairement à browser-act).

## When to Use

- Extraire des données d'une page avec rendu JavaScript (SPA, pages dynamiques).
- Piloter un vrai navigateur depuis un agent : navigation, clics, formulaires, cookies.
- Le navigateur Freebuff/Chrome n'est pas dispo (batch, script, MCP).

## Utilisation

```bash
obscura fetch --dump-dom https://example.com     # HTML rendu
obscura fetch --markdown https://example.com     # markdown
obscura mcp                                      # serveur MCP stdio (37 outils)
```

- **MCP branché** sur opencode + ChatDesk (outils `browser_navigate`,
  `browser_extract` avec schéma CSS, `browser_evaluate`, etc.).
- Test validé le 01/10/2026 : rendu JS + extraction structurée OK
  (`quotes.toscrape.com/js` : citations + auteurs + tags en JSON).
- ⚠️ Les sites à challenge anti-bot (Trustpilot) le bloquent → utiliser le
  navigateur piloté (Freebuff) dans ces cas.

## Repo local

`~/Desktop/Repo github a utiliser/obscura/` · Ajouté le 30/09/2026 depuis le chat Telegram dunk cash.
