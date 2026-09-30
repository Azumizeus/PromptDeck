---
name: claude-bughunter
license: MIT
description: Suite de 83 skills de chasse aux bugs et failles (XSS, CORS, JWT, API, RAG, LLM, meme-coin audit…) par elementalsouls. Use when auditing code, hunting vulnerabilities, or reviewing a Solana/meme-coin project.
---

# Claude-BugHunter

<!-- Ajouté le 30/09/2026 depuis le chat Telegram « dunk cash » (repo cloné). -->

## Overview

83 skills de bug-hunting structurés : `hunt-xss`, `hunt-cors`, `hunt-jwt-crypto`, `hunt-api-misconfig`, `hunt-rag-vector`, `hunt-llm-ai`, `hunt-exceptional-conditions`, et surtout **`meme-coin-audit`** (audit de tokens) — directement utile pour les projets Solana de Mickael.

## Repo local

`~/Desktop/Repo github a utiliser/Claude-BugHunter/` (source : github.com/elementalsouls/Claude-BugHunter)

- Skills : `skills/hunt-*/SKILL.md` + `skills/meme-coin-audit/SKILL.md`
- Guide d'installation : `INSTALL.md`

## When to Use

- Avant de déployer un programme Anchor ou un token : lancer `meme-coin-audit` et les hunts pertinents.
- Audit sécurité d'un projet web3 ou d'une app avec API.
- Complète AEGIS-7 (partie audit sécurité).
