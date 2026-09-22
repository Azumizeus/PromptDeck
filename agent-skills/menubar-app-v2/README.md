# ⚡ MEGA PACK V3 « Constellation » — App menu-bar macOS

> **Deux éditions monovue existent aussi** : [`../menubar-app-galaxy`](../menubar-app-galaxy)
> (🌌 Galaxie 3D seule) et [`../menubar-app-bridge`](../menubar-app-bridge)
> (🛰 Pont de commandement seul) — même moteur, une seule expérience chacune.

Deux vues inédites pour activer les **131 skills + 190 agents + tes prompts perso** :

## 🌌 Galaxie 3D
Toute la bibliothèque en étoiles navigables : **agents en orbite verte**, **skills en anneau
violet**, **✍️ perso au centre**, **⭐ favoris en constellation polaire reliée par des fils d'or**.
Fond de nébuleuses + champ d'étoiles scintillantes. La recherche déclenche un **hyper-saut** :
la caméra plonge vers les étoiles trouvées, qui se mettent à pulser.

- **⌥-glisser** (ou glisser) : incliner / orbiter · **molette** : zoom · **double-clic** : recentrer
- **Clic** sur une étoile : tirer le prompt (copié) · **⌥-clic** : ⭐ favori · **⌘-clic** : composer
- **← →** : cibler l'étoile suivante (cadre blanc pulsant) · **⏎** : tirer

## 🛰 Pont de commandement
HUD radial façon vaisseau : **4 arcs-secteurs** (👥 Agents · 🛠 Skills · ✍️ Perso · ⭐ Favoris),
cœur pulsant **MEGA PACK**, et un **CADRAN ORBITAL** : les items défilent sur un anneau sous
un réticule ▼, comme une turret de ciblage.

- **← → ou molette ou glisser** : viser · **Tab** : changer de secteur · **⏎** : tirer le prompt
- **Clic sur une chip** : tirer · **⌥-clic** : ⭐ favori · **⌘-clic** : composer

## Tiroir de résultats
La recherche ouvre un **tiroir** en surimpression (précision liste classique) ; ferme-le avec
**✕** ou **Échap** pour revenir à la scène. Tout le moteur est conservé : prompts bilingues
FR/EN, favoris ⭐, récents, composeur ⌘A, import glisser-déposer `.md`/`.txt`, collage direct,
12 destinations « Ouvrir dans », thèmes sombre/clair/contraste, ARIA.

🇬🇧 Version anglaise : [`README-EN.md`](README-EN.md)

## Lancer

```bash
npm install
npm start
```

→ une icône **⚡** apparaît dans la menu bar et dans le Dock.

## Choisir sa vue
Bascule **🌌 Galaxie / 🛰 Pont** en haut du panneau (mémorisée). Recherche, favoris et
sélection sont partagés entre les deux vues.

## Raccourcis

| Raccourci | Action |
|---|---|
| **⌥Espace** | Ouvrir/fermer le panneau (n'importe où dans macOS — modifiable dans les Réglages) |
| **⌘⇧Espace** | Fenêtre Réglages |
| **↑ / ↓** | Naviguer dans les résultats (tiroir) · cibler étoile/chip (scène) |
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

## Tests

```bash
./test-all.sh   # syntaxe + suites logiques (FR, customs, galaxie/pont) + smoke Electron offscreen
```

- `test-galaxy.js` : logique V3 en sandbox VM — hyper-saut, cadran, ciblage, tiroir
- `probe-v3.js` : smoke réel (`--shots` pour écrire `dist/probe-galaxy.png` / `probe-bridge.png`)

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
