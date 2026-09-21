# ⚡ MEGA PACK — App menu-bar macOS

Recherche globale et activation des **131 skills + 190 agents** depuis la barre de menus.

🇬🇧 Version anglaise : [`README-EN.md`](README-EN.md)

## Lancer

```bash
npm install
npm start
```

→ une icône **⚡** apparaît dans la menu bar et dans le Dock.

## Raccourcis

| Raccourci | Action |
|---|---|
| **⌥Espace** | Ouvrir/fermer le panneau (n'importe où dans macOS — modifiable dans les Réglages) |
| **⌘⇧Espace** | Fenêtre Réglages |
| **↑ / ↓** | Naviguer dans les résultats |
| **⏎** | Copier le prompt d'activation de l'élément sélectionné |
| **⌘⏎** | Ouvrir la sélection dans le **LLM par défaut** (Réglages) |
| **⇧⏎** | Ouvrir dans ChatGPT |
| **⌘A** | Tout sélectionner (composeur) |
| **⌘,** | Réglages · **Échap** fermer le panneau |

**✍️ Prompts personnalisés** : bouton **＋** dans le panneau → nom + texte de ton prompt,
ajoutés comme les items de base (onglet ✍️, recherche, favoris ⭐, menu ⚡ « Mes prompts »
avec ✎ Éditer / 🗑 Supprimer, « Ouvrir dans » vers les 12 destinations, composeur).
**Glisse-dépose** des fichiers `.md` / `.txt` sur le panneau pour les importer
(renommage auto en cas de doublon) ; **4 exemples** sont pré-remplis au premier lancement.

Clic droit sur l'icône ⚡ : menu cascade avec ⭐ Favoris, **Skills** et **Agents**
regroupés par catégorie — chaque skill/agent ouvre un sous-menu **« Ouvrir dans »**
pour lancer le prompt dans **12 destinations** : Claude, ChatGPT, Perplexity, Copilot,
DeepSeek, Z.ai, Kimi, Mammouth.ia, l'**app Freebuff**, **OpenCode desktop**
(`opencode://`), **OpenCode terminal** — plus une option 📋 presse-papiers
(le prompt est de toute façon toujours copié).
Suivent : Ouvrir le panneau, Launcheur HTML, Réglages, Quitter.

## Réglages

Thème **clair/sombre**, langue **FR/EN**, **LLM par défaut**, **raccourci global**
(⌥Espace par défaut), **lancement au démarrage**, **raccourcis favoris** (⌘1-⌘9)
et **export/import de configuration** (JSON : favoris, récents, préférences).
Le tout mémorisé (`localStorage` + `mgp-prefs.json` pour le menu) et synchronisé
en direct avec le panneau. Le menu du tray (clic droit) suit la langue choisie.

## Packaging (.app autonome)

**Recommandé — tout-en-un** (icônes, .icns, packaging, catalogue embarqué, plist,
signature et relance en une commande) :

```bash
npm run build:app        # ou ./build-app.sh
./build-app.sh --no-launch   # build sans relancer
# → dist/MEGA PACK-darwin-x64/MEGA PACK.app
```

Le script `build-app.sh` réutilise l'Electron déjà téléchargé dans `node_modules`
(aucun téléchargement réseau), embarque le catalogue `interface/catalog-full.js`
et re-signe l'app (ad-hoc). Alternative (peut être tué en cours de route sur
certains environnements) : `npm run build` via electron-packager.

Build configuré pour **Intel x64** (votre machine). Pour Apple Silicon :
`--arch=arm64` dans `package.json`.

## Dépannage

| Problème | Solution |
|---|---|
| `Electron failed to install correctly` | `cd node_modules/electron && node install.js` |
| Zip tronqué / framework manquant | Téléchargez le zip officiel : `https://github.com/electron/electron/releases/download/v33.4.11/electron-v33.4.11-darwin-x64.zip` → extraire dans `node_modules/electron/dist` + `printf 'Electron.app/Contents/MacOS/Electron' > node_modules/electron/path.txt` |
| Le raccourci ouvre Spotlight | Change le raccourci dans les Réglages (⌥Espace recommandé — ⌘Espace est réservé par macOS) |
| Panneau ne s'ouvre pas | Relancez `npm start` — l'app est mono-instance, un second lancement la révèle |

## Catalogue

Le panneau lit `../interface/catalog-full.js` (généré par `python3 build-interface.py`
à la racine `agent-skills/`). Après mise à jour du maître, régénérez le catalogue :
l'app le recharge au prochain démarrage.
