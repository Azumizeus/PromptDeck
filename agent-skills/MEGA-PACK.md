# MEGA PACK — Skills & Agents pour Claude Desktop et OpenCode

> **Version :** 1.0.0 (19 septembre 2026)
> **Base :** addyosmani/agent-skills v0.6.9 → v0.7.0 (méga pack) + intégration Seeker Team + Skill Game Dev
> **Total :** 131 skills · 190 agents · 9 slash commands

## Ce qui a été intégré au dossier maître `agent-skills/`

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

Vérification finale : 0 collision de `name:` sur les 131 skills installés.

### Non intégré (déjà présent ou redondant)

- `skill/agents/` : 35 des 37 agents existaient déjà dans le maître (mêmes noms).
- `skill/skills/blockchain-skills`, `metaplex-skill`, `solana-anchor-claude-skill`,
  `solana-dev-skill`, `solana-game-skill`, `integrating-jupiter`, `lightprotocol-skills` :
  déjà dans le maître sous le même nom.

## 🖱️ Interface d'activation (boutons) — `interface/`

Catalogue interactif des 131 skills + 190 agents, activables par bouton dans **tout LLM** :

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

Application Electron résidente dans la barre de menus : recherche globale des 131 skills +
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
# Skills (81)
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
# Skills (81) — global
mkdir -p ~/.config/opencode/skills
cp -R "/Users/mickaeldunoyer/Desktop/Skill Install/agent-skills/skills/"* ~/.config/opencode/skills/

# Agent persona + AGENTS.md projet (optionnel)
mkdir -p ~/.config/opencode/agent
```

OpenCode découvre aussi les chemins `~/.claude/skills/` et `~/.agents/skills/`.

## Comptage de contrôle

| Ensemble | Attendu |
|----------|---------|
| SKILL.md dans `skills/` | 131 |
| Agents `.md` dans `agents/` | 190 |
| Slash commands (`.claude/commands/` + `commands/`) | 9 + 9 |
| Fichiers `interface/` | 4 (launcher, userscript, bookmarklet, catalogue) |
| App menu-bar `menubar-app/` | main.js + preload + renderer + réglages + icônes tray |

## Mise à jour

1. Modifier/copier les nouveaux skills dans `agent-skills/skills/<categorie>/<skill>/`.
2. Documenter dans `README.md` (sections Blockchain/Solana et Game Design).
3. Bump version dans `.claude-plugin/plugin.json`, `plugin.json`, `.claude-plugin/marketplace.json`.
4. Réinstaller : `cp -R skills/* ~/.claude/skills/ && cp -R skills/* ~/.config/opencode/skills/`.
