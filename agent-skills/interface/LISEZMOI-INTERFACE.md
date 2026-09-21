# 🖱️ Interface MEGA PACK — Skills & Agents activables par bouton

> **Version :** 1.2.0 · 131 skills · 190 agents · compatible **tout LLM**
>
> 🇬🇧 Version anglaise : [`README-EN.md`](README-EN.md)

Trois façons d'activer les skills/agents dans n'importe quelle conversation (Claude Desktop, ChatGPT, Gemini, Perplexity, Mistral, OpenCode, Cursor…) :

📖 **Mode d'emploi interactif :** ouvrez [`MODE-DEMPLOI.html`](MODE-DEMPLOI.html) — FR/EN, démo du panneau, test du serveur en 1 clic, checklist de démarrage.

---

## 1️⃣ Launcheur HTML (recommandé — zéro installation)

**Fichier : `mega-pack-launcher.html`** (autonome, catalogue embarqué)

Double-cliquez pour l'ouvrir dans votre navigateur :

| Fonction | Utilisation |
|---|---|
| 🔍 **Recherche** | Tapez un mot-clé (jupiter, audit, marketing, nft…) |
| ⚡ **Activer** | Copie le prompt d'activation → collez-le dans n'importe quel chat LLM |
| ＋ **Composer** | Multi-sélection de plusieurs skills/agents → prompt combiné unique |
| 🧩 **Composeur** | Onglet dédié : copie, télécharge `.md`, ou exporte des commands installables |
| 🌐 **Ouvrir dans LLM** | Ouvre Claude/ChatGPT/Perplexity/Copilot **avec le prompt pré-rempli** (si composeur non vide, c'est le prompt combiné qui est envoyé) |
| 🌙/☀️ **Thème** | Clair / sombre, mémorisé (localStorage) |
| 🇫🇷/🇬🇧 **Langue** | Interface FR / EN, mémorisée |
| 🏷️ **Filtres** | Onglets Tout/Skills/Agents + filtre par catégorie (36 catégories) |

Testé et validé : recherche instantanée, copie presse-papiers, composeur multi-sélection,
thème/langue persistants, ouverture LLM pré-remplie, génération de ZIP de commands
(zéro dépendance — ZIP écrit à la main en JS, testé : signatures PK valides).

### Export de commands installables (onglet Composeur)

Deux boutons génèrent un `.zip` prêt à installer :

- **Commands Claude** → `megapack-commands-claude.zip` : dézippez puis
  `mkdir -p ~/.claude/commands && cp *.md ~/.claude/commands/` → utilisable avec `/nom-du-skill`
- **Commands OpenCode** → `megapack-commands-opencode.zip` : dézippez puis
  `mkdir -p ~/.config/opencode/command && cp *.md ~/.config/opencode/command/`

Un `INSTALL.txt` est inclus dans chaque zip.

---

## 2️⃣ App menu-bar macOS (recherche globale ⌘Espace)

**Dossier : `menubar-app/`** — petite app Electron résidente dans la barre de menus.

```bash
cd menubar-app
npm install
npm start          # icône ⚡ dans la menu bar
npm run build      # app .app autonome dans dist/ (Intel x64)
```

| Raccourci | Action |
|---|---|
| **⌘Espace** | Ouvre/ferme le panneau de recherche (partout dans macOS) |
| **⌘⇧Espace** | Réglages (thème, langue) |
| **↑↓ / ⏎** | Naviguer / copier le prompt du skill sélectionné |
| **⌘⏎** | Ouvrir la sélection (ou la recherche) dans Claude |
| **⇧⏎** | Ouvrir dans ChatGPT |
| **⌘A** | Tout sélectionner (composeur) · **Échap** fermer |

> Note : ⌘Espace est le raccourci Spotlight par défaut — l'app le capte en priorité quand
> elle tourne. Changez Spotlight (Réglages Système → Clavier) ou modifiez le raccourci
> dans `main.js` si vous préférez garder Spotlight.

---

## 3️⃣ Panneau flottant dans le navigateur (permanent)

### Option A — Tampermonkey (recommandé, permanent)

1. Installez l'extension [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge/Firefox/Safari).
2. Tampermonkey → **Créer un nouveau script** → collez tout le contenu de `mega-pack-panel-full.user.js` (catalogue embarqué — fonctionne seul, sans fichier externe).
3. Sauvegardez (Ctrl+S).

→ Un bouton **⚡** apparaît en bas à droite **de tous les sites** (raccourci : `Ctrl+Shift+K`).
Clic sur un skill/agent → le prompt est **injecté directement dans la zone de texte** du chat
(détection automatique : Claude, ChatGPT, Gemini, textarea génériques). Si aucune zone n'est
trouvée → copie dans le presse-papiers.

### Option B — Bookmarklet (sans extension)

1. Ouvrez `mega-pack-bookmarklet.html` dans votre navigateur.
2. Glissez le bouton **⚡ MEGA PACK** dans votre barre de favoris.
3. Sur n'importe quel chat LLM : cliquez le favori → le panneau s'ouvre.

> ⚠️ Le bookmarklet charge les fichiers depuis votre disque. Si le navigateur bloque `file://`,
> utilisez l'option A ou servez le dossier en local (voir dépannage).

---

## 4️⃣ Intégration Claude Desktop (MCP / projet)

Le catalogue est aussi un simple fichier JS :

```js
// interface/catalog-full.js
const MEGA_CATALOG = { meta: {...}, skills: [...131], agents: [...190] };
```

- **Claude Desktop** : ajoutez le dossier `agent-skills/` comme *projet* → demandez
  « Liste les skills du catalogue » ou « Active le skill jupiter ».
- **Développeurs** : `fetch('catalog-full.js')` dans n'importe quelle app pour construire
  votre propre sélecteur.

---

## 🛠️ Dépannage

| Problème | Solution |
|---|---|
| Bookmarklet ne charge pas le catalogue | `python3 -m http.server 8788` dans `interface/` puis ouvrez `http://localhost:8788/mega-pack-launcher.html` |
| Le panneau ⚡ n'apparaît pas | Vérifiez que Tampermonkey est activé sur le site (icône → 1) |
| Le prompt ne s'injecte pas dans le chat | Le site change de DOM → le fallback presse-papiers s'active ; collez manuellement |
| Catalogue vide dans le userscript | Le userscript autonome attend `window.MEGA_CATALOG` — préférez le launcher HTML |

## 🔄 Régénérer le catalogue

Après avoir ajouté/modifié des skills dans le maître :

```bash
cd agent-skills
python3 build-interface.py   # régénère interface/catalog-full.js ET synchronise le catalogue embarqué du launcher
python3 build-userscript.py  # régénère interface/mega-pack-panel-full.user.js (catalogue embarqué)
```

---

## 📁 Fichiers

| Fichier | Rôle |
|---|---|
| `mega-pack-launcher.html` | Launcheur autonome (catalogue embarqué, auto-synchronisé) |
| `catalog-full.js` | Catalogue brut JSON (pour intégrations custom) |
| `mega-pack-panel.user.js` | Userscript Tampermonkey — panneau flottant permanent (charge `catalog-full.js` à côté) |
| `mega-pack-panel-full.user.js` | Userscript Tampermonkey avec catalogue embarqué — recommandé |
| `mega-pack-bookmarklet.html` | Page d'installation du bookmarklet (bilingue FR/EN) |
| `MEGA-PACK-serveur.command` | Lanceur macOS double-clic du serveur local |
| `README-EN.md` | Version anglaise de cette doc |
| `MODE-DEMPLOI.html` | Mode d'emploi interactif (FR/EN) |
