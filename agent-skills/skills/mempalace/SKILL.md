---
name: mempalace
license: MIT
description: MemPalace — mémoire IA locale (binaire Rust, 100 % offline) : stockage, recall, task memory. Alternative/complément local à agentmemory. Use when an agent needs persistent local memory without a server.
---

# MemPalace

<!-- Ajouté le 30/09/2026 depuis le chat Telegram « dunk cash » (repo cloné). -->

## Overview

`MemPalace/mempalace` — mémoire IA locale en Rust (Cargo), avec variants de skills : `mempalace`, `mempalace-recall`, `mempalace-task` (15 SKILL.md selon la surface : Claude plugin, antigravity, openclaw…).

## Repo local

`~/Desktop/Repo github a utiliser/mempalace/` (source : github.com/MemPalace/mempalace)

- `skills/mempalace*/SKILL.md`, build : `cargo build --release`, doc : `CLAUDE.md`

## When to Use

- Comparer avec agentmemory :3111 avant d'ajouter un second système de mémoire — ne pas dupliquer.
- Cas d'usage : mémoire 100 % offline sans serveur, pour un agent isolé.
