# MEGA PACK — Skills & Agents pour Claude Desktop et OpenCode

> **Version :** 1.2.0 (23 septembre 2026)
> **Base :** addyosmani/agent-skills v0.6.9 → v0.7.0 (méga pack) → v0.7.1 (+ Cloudflare security-audit) → **v0.7.2 (synchronisation amont 0.6.10)** + intégration Seeker Team + Skill Game Dev
> **Total :** 132 skills · 190 agents · 10 slash commands

## Ce qui a été intégré au dossier maître `agent-skills/`

### 0. Skill sécurité Cloudflare → `skills/security-audit/` (1 skill, v0.7.1 — 23 sept. 2026)

Source : [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) (MIT).
Skill d'audit de sécurité multi-phases qui orchestre des agents isolés : reconnaissance
(`architecture.md`, `coverage-ledger.json`), chasse guidée par couverture, validation
adversariale (le vérificateur n'est jamais le découvreur), sortie structurée `findings.json`
(validée par `report-schema.json` + validateurs Node zero-dependency), vérification
indépendante des enregistrements et rapport neutre (`REPORT.md`, `FINDINGS-DETAIL.md`,
`NEEDS-VALIDATION.md`). 15 guides de classes d'attaques inclus (web/protocole/auth,
client-side, supply-chain, cloud/déploiement, RPC/messaging, IA & LLM, memory-safety/binaire,
desktop/mobile/IPC, épuisement de ressources, isolation multi-tenant…). Mode « guidance »
par défaut ; les 6 phases complètes ne s'exécutent que sur demande explicite d'audit ou de
test d'intrusion. Tests des validateurs : 34 + 31 ✔.

### 0-bis. Synchronisation amont 0.6.9 → 0.6.10 (v0.7.2 — 23 sept. 2026)

Les 25 skills lifecycle du maître sont alignés sur la release amont [Agent Skills
0.6.10](https://github.com/addyosmani/agent-skills/releases/tag/0.6.10) :

- **13 SKILL.md patchés** (context-engineering, spec/planning, incremental, TDD, debugging,
  docs/ADRs, doubt/source/constraint-driven, git-workflow, observability, shipping,
  using-agent-skills) — complétude des gardes-fous « plan incomplet » et contexte.
- **security-and-hardening** : description 0.6.10 (vocabulaire de routage « auditing an input
  handler », « OWASP Top Ten ») appliquée sur le corps méga-pack (patterns OWASP inline
  + `references/security-checklist.md`), qui est conservé.
- **hooks/** : `hooks.json` supprimé — le plugin Claude Code n'enregistre plus le hook
  SessionStart (fin du double-routage, ~3,5k tokens/session économisés) ; `session-start.sh`
  reste disponible en opt-in pour les hôtes sans routage natif, avec envelope
  `hookSpecificOutput` standard et fallback `jq is required`. Les ajouts méga-pack
  (`SDD-CACHE.md`, `sdd-cache-pre.sh`, `sdd-cache-post.sh`) sont conservés.
- **`simplify-ignore.sh`** : plus de perte de travail au Stop — expansion du contenu courant
  au lieu de la restauration aveugle du backup, fallback `.recovered`.
- **scripts** (skill-lint, run-evals, validate-reference-links + leurs tests) et
  **CI** (`--min-rank1 95`, test skill-lint, test hook payload) alignés 0.6.10.
- **docs** : codex-setup (progressive disclosure, plus de préchargement du meta-skill),
  gemini-cli-setup (10 commands), CONTRIBUTING (règle « Write the Procedure, Not the
  Workaround »).
- **Non intégré volontairement** : les sections Project Structure / tableaux portables du
  README amont (le README méga-pack décrit 132 skills + 190 agents) et la suppression du
  dossier `evals/` amont (le maître garde ses evals et scripts opérationnels).

### 1. Skills de protocoles Solana → `skills/solana-protocols/` (46 skills)

Les packs sources (`skill/skills/helius`, `light-protocol`, `pyth-skill`, `solana-kit`,
`surfpool`, `vulnhunter`) contiennent **exactement les mêmes 47 skills** (vérifié par md5
des SKILL.md). Après déduplication et retrait du skill `example-skill` (modèle de démo),
**42 skills uniques** ont été ajoutés — `jupiter`, `metaplex`, `quicknode`, `light-protocol`
et `solana-kit` existant déjà ailleurs dans le maître.

Liste : `arcium`, `birdeye`, `carbium`, `coingecko`, `ct-alpha`, `debridge`, `dflow`,
`glam`, `helius`, `helius-dflow`, `helius-phantom`, `inco`, `jupiter`, `kamino`, `lavarage`,
`lifi`, `light-protocol`, `lulo`, `magicblock`, `manifest`, `marginfi`, `metaplex`,
`metengine`, `meteora`, `orca`, `phantom-connect`, `phantom-wallet-mcp`, `phoenix`,
`pinocchio-development`, `pumpfun`, `pyth`, `quicknode`, `ranger-finance`, `raydium`,
`sanctum`, `sol-incinerator`, `solana-agent-kit`, `solana-kit`, `solana-kit-migration`,
`squads`, `surfpool`, `svm`, `switchboard`, `vulnhunter`, `wallet-analysis`, `zz-code-recon`.

### 2. Skills game design → `skills/game-design/` (7 skills)

Source : `Skill Game Dev/`. Le skill projet `Mobile Development for Solana Games` a été
renommé `seeker-strike-mobile` (nom de skill valide : minuscules et tirets uniquement).

| Skill | Rôle |
|-------|------|
| `seeker-strike-mobile` | Conventions mobile/Solana Seeker Strike (Canvas 2D, WebView, SKR/GC) |
| `game-audio-direction` | Identité musicale, boucles, mixage |
| `motion-design-system` | Motion UI, transitions, feedback |
| `pixel-art-audio-direction` | Direction pixel art + audio |
| `pixel-art-palette-discipline` | Palette, grille, contraste |
| `visual-design-premium` | Direction visuelle premium |
| `visual-rendering-game-feel` | Rendu 2D, bloom, game feel |

### 3. Agents uniques → `agents/` (2 agents)

- `agents/specialized/mica-compliance-specialist.md` — conformité MiCA/RGPD/AML crypto UE
- `agents/game-development/tokenomics-designer.md` — tokenomics de crypto-games

### 4. Corrections et résolution de collisions de `name:`

- `skills/lightprotocol-skills/agent-dev-orchestrator/skill.md` → renommé `SKILL.md`
  (convention obligatoire, sinon le skill est invisible).
- `solana-protocols/metaplex` : `metaplex` → `metaplex-protocol` (collision avec
  `metaplex-skill/metaplex`, qui reste la référence `metaplex` avec le CLI `mplx`).
- `solana-protocols/jupiter` : `integrating-jupiter` → `jupiter-api` (collision avec
  `integrating-jupiter/integrating-jupiter`).
- `solana-development/solana-compression` : `solana-compression` → `zk-compression-light`
  (collision avec `lightprotocol-skills/solana-compression`).

Vérification finale : 0 collision de `name:` sur les 132 skills installés
(`name: CI` apparaît 2× dans des fichiers de référence internes — uv-reference et
python-dev — mais aucun SKILL.md racine n'est en collision).

### Non intégré (déjà présent ou redondant)

- `skill/agents/` : 35 des 37 agents existaient déjà dans le maître (mêmes noms).
- `skill/skills/blockchain-skills`, `metaplex-skill`, `solana-anchor-claude-skill`,
  `solana-dev-skill`, `solana-game-skill`, `integrating-jupiter`, `lightprotocol-skills` :
  déjà dans le maître sous le même nom.

## 🖱️ Interface d'activation (boutons) — `interface/`

Catalogue interactif des 132 skills + 190 agents, activables par bouton dans **tout LLM** :

- **`interface/mega-pack-launcher.html`** — launcheur autonome (double-clic) : recherche,
  filtres 36 catégories, bouton ⚡ Activer (copie le prompt d'activation), composeur
  multi-sélection, **thème clair/sombre persistant**, **interface FR/EN persistante**, menu
  **🌐 Ouvrir dans LLM** (Claude/ChatGPT/Perplexity/Copilot avec prompt pré-rempli) et
  **export de commands installables** (zips Claude + OpenCode). Voir `interface/LISEZMOI-INTERFACE.md`.
- **`interface/mega-pack-panel.user.js`** — userscript Tampermonkey : panneau flottant
  permanent sur tous les sites de chat (Ctrl+Shift+K), injection directe dans la zone
  de texte du LLM.
- **`interface/mega-pack-bookmarklet.html`** — bookmarklet sans extension.
- **`interface/catalog-full.js`** — catalogue JSON pour intégrations custom.
- **`build-interface.py`** — régénère le catalogue après modification du maître.

## 🧭 App menu-bar macOS — `menubar-app/`

Application Electron résidente dans la barre de menus : recherche globale des 132 skills +
190 agents, activation en 1 clic, ouverture directe dans Claude/ChatGPT.

```bash
cd menubar-app && npm install && npm start   # icône ⚡ dans la menu bar
npm run build                                # .app autonome (Intel x64)
```

Raccourcis : **⌘Espace** panneau · **↑↓/⏎** copier · **⌘⏎** Claude · **⇧⏎** ChatGPT ·
**⌘⇧Espace** réglages (thème clair/sombre, FR/EN).

## Installation Claude Desktop / Claude Code

### Option A — global (tous les projets), recommandé

```bash
# Skills (132)
mkdir -p ~/.claude/skills
cp -R "/Users/mickaeldunoyer/Desktop/Skill Install/agent-skills/skills/"* ~/.claude/skills/

# Agents (190)
mkdir -p ~/.claude/agents
cp -R "/Users/mickaeldunoyer/Desktop/Skill Install/agent-skills/agents/"* ~/.claude/agents/
```

### Option B — plugin marketplace locale

```
/plugin marketplace add /Users/mickaeldunoyer/Desktop/Skill\ Install/agent-skills
/plugin install agent-skills@addy-agent-skills
```

## Installation OpenCode

```bash
# Skills (132) — global
mkdir -p ~/.config/opencode/skills
cp -R "/Users/mickaeldunoyer/Desktop/Skill Install/agent-skills/skills/"* ~/.config/opencode/skills/

# Agent persona + AGENTS.md projet (optionnel)
mkdir -p ~/.config/opencode/agent
```

OpenCode découvre aussi les chemins `~/.claude/skills/` et `~/.agents/skills/`.

## Comptage de contrôle

| Ensemble | Attendu |
|----------|---------|
| SKILL.md dans `skills/` | 132 |
| Agents `.md` dans `agents/` | 190 |
| Slash commands (`.claude/commands/` + `commands/`) | 10 + 10 |
| Fichiers `interface/` | 4 (launcher, userscript, bookmarklet, catalogue) |
| App menu-bar `menubar-app/` | main.js + preload + renderer + réglages + icônes tray |

## Mise à jour

1. Modifier/copier les nouveaux skills dans `agent-skills/skills/<categorie>/<skill>/`.
2. Documenter dans `README.md` (sections Blockchain/Solana et Game Design).
3. Bump version dans `.claude-plugin/plugin.json`, `plugin.json`, `.claude-plugin/marketplace.json`.
4. Réinstaller : `cp -R skills/* ~/.claude/skills/ && cp -R skills/* ~/.config/opencode/skills/`.
