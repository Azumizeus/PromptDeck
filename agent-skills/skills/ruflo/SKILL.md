---
name: ruflo
license: MIT
description: Agent-harness pour déployer des essaims d'agents IA coordonnés (knowledge-graph, goals, fédération, deep-research). Use when orchestrating multiple agents on one mission.
---

# Ruflo

<!-- Ajouté le 30/09/2026 depuis le chat Telegram « dunk cash » (repo cloné). -->

## Overview

`ruvnet/ruflo` — harness Rust d'essaims d'agents : plugins `ruflo-goals` (dossier-collect, deep-research, goal-plan, research-synthesize), `ruflo-knowledge-graph` (kg-traverse, kg-extract), `ruflo-federation`… **373 skills** incluses.

## Repo local

`~/Desktop/Repo github a utiliser/ruflo/` (source : github.com/ruvnet/ruflo)

- `plugins/*/skills/` (373 SKILL.md), `CLAUDE.md` + `AGENTS.md` (mode d'emploi agents), build : `Cargo.toml`

## When to Use

- Quand une mission dépasse un seul agent (recherche multi-sources, planification à long terme).
- Avancé : à réserver aux grosses tâches — un agent simple suffit souvent.
