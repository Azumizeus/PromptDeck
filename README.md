<div align="center">

# ⚡ PromptDeck

**131 skills + 190 agents IA dans ta barre de menus macOS — en un ⌥Espace.**

Recherche instantanée, prompts personnalisés, envoi vers 12 destinations
(Claude, ChatGPT, Freebuff, OpenCode…) en un clic.

[![Version](https://img.shields.io/badge/version-1.1.0-blue)](#-installation)
[![CI](https://github.com/Azumizeus/PromptDeck/actions/workflows/ci.yml/badge.svg)](https://github.com/Azumizeus/PromptDeck/actions/workflows/ci.yml)
[![macOS](https://img.shields.io/badge/macOS-13%2B-black?logo=apple)](#-installation)
[![Architectures](https://img.shields.io/badge/arch-Intel%20%7C%20Apple%20Silicon%20%7C%20Universel-orange)](#-installation)
[![Licence](https://img.shields.io/badge/licence-MIT-green)](LICENSE)
[![Langue](https://img.shields.io/badge/langue-FR%20%7C%20EN-yellow)](#)
[![Tests](https://img.shields.io/badge/tests-65%20v%C3%A9rifications-success)](agent-skills/menubar-app/test-all.sh)

</div>

---

## ✨ C'est quoi ?

PromptDeck est une **app menu-bar macOS** (icône ⚡ en haut à droite) qui transforme
une bibliothèque de **131 skills** et **190 agents IA** en lanceur instantané :

| | |
|---|---|
| 🔍 **Recherche bilingue** | 321 items filtrés en temps réel, en français comme en anglais (« jupiter », « multi-chaînes »…) |
| ✍️ **Prompts personnalisés** | Crée tes propres prompts, avec **tags**, importés par **glisser-déposer** (.md/.txt) ou exportés en .md |
| 🌐 **12 destinations** | Claude · ChatGPT · Perplexity · Copilot · DeepSeek · Z.ai · Kimi · Mammouth.ia · Freebuff (app) · OpenCode (desktop) · OpenCode (terminal) · Presse-papiers |
| ⭐ **Favoris + ⌘1-⌘9** | Épingle tes items et lance les 9 premiers au clavier |
| 🕘 **Récents** | Tes 8 derniers prompts toujours à portée de clic |
| 🧩 **Composeur** | Multi-sélectionne skills + agents + prompts → un prompt combiné unique |
| ⚙️ **Réglages complets** | Thème clair/sombre, FR/EN, LLM par défaut, raccourci personnalisable, lancement au démarrage, export/import de config |

Le tout **100 % local** : pas de compte, pas de télémétrie, aucun envoi de données.

## 📸 Aperçu

| Recherche bilingue (⌥Espace) | Menu clic droit ⚡ | Réglages |
|:---:|:---:|:---:|
| ![Panneau de recherche PromptDeck](docs/captures/panneau.png) | ![Menu clic droit de l’icône ⚡](docs/captures/menu-clic-droit.png) | ![Fenêtre de réglages](docs/captures/reglages.png) |

*Régénérables à tout moment : `./build-app.sh` puis `npx electron . --capture-panel --capture-menu` depuis `agent-skills/menubar-app/` (rendu automatique dans `docs/captures/`).*

## 🚀 Installation

### 1. Télécharger

Va dans [**Releases**](../../releases) et télécharge **une seule** image disque :

| Fichier | Pour quel Mac |
|---|---|
| `PromptDeck-<version>-universal.dmg` | ✅ Tous les Mac (recommandé) |
| `PromptDeck-<version>-arm64.dmg` | Apple Silicon M1/M2/M3/M4 |
| `PromptDeck-<version>-x64.dmg` | Intel (2019-2020) |

### 2. Installer

Ouvre le DMG et **glisse PromptDeck.app → Applications**.

### 3. Premier lancement

Au premier lancement, macOS affiche *« PromptDeck est une app téléchargée d'Internet »*
(signature ad-hoc, non notarisée — c'est normal pour une distribution GitHub) :

1. **Clic droit** sur l'app → **Ouvrir** → **Ouvrir** (une seule fois suffit)
2. Ou : ⚙️ Réglages Système → **Confidentialité et sécurité** → **Ouvrir quand même**

L'icône ⚡ apparaît dans la barre de menus. **⌥Espace** ouvre le panneau. C'est parti.

### 4. Depuis les sources (facultatif)

```bash
git clone https://github.com/Azumizeus/PromptDeck.git
cd PromptDeck/agent-skills/menubar-app
npm install
npm start                    # mode dev
./build-app.sh --arch both   # build + DMG (x64 + arm64 + universel)
./test-all.sh                # suite complète de tests
```

## 📖 Mode d'emploi

Toute la documentation utilisateur est dans [`agent-skills/interface/MODE-DEMPLOI.html`](agent-skills/interface/MODE-DEMPLOI.html)
(ouvrable aussi depuis l'app : **clic droit sur ⚡ → Aide**).

**Raccourcis essentiels**

| Raccourci | Action |
|---|---|
| **⌥Espace** *(défaut, modifiable)* | Ouvrir/fermer le panneau |
| **↑↓ / ⏎** | Naviguer et copier le prompt |
| **⌘⏎** | Ouvrir dans ton LLM par défaut |
| **⇧⏎** | Ouvrir dans ChatGPT |
| **⌘,** | Réglages |
| **⌘1-⌘9** | Lancer les 9 premiers favoris |
| **＋** | Créer un prompt personnalisé |
| **Glisser un .md/.txt** | Importer des prompts |

## 🏗️ Structure du dépôt

```
PromptDeck/
├── agent-skills/
│   ├── menubar-app/        ← l'app Electron (main.js, renderer.js, tests, build-app.sh)
│   ├── interface/          ← launcher HTML, panneau Tampermonkey, catalogue 321 items, MODE-DEMPLOI
│   ├── skills/             ← 131 skills (SKILL.md)
│   └── agents/             ← 190 agents (fiches de rôle système)
├── skill/skills/           ← bibliothèques tierces (Solana, Jupiter, Metaplex…)
├── LICENSE                 ← MIT
└── CONTRIBUTING.md         ← guide de contribution
```

## 🧪 Tests

```bash
cd agent-skills/menubar-app
./test-all.sh             # 27 vérifications : syntaxe, bundles, signatures, architectures, DMG
node test-fr.js           # i18n : 321/321 items traduits, recherche bilingue
node test-custom.js       # prompts personnalisés : 28/28 (créer, chercher, épingler, éditer…)
```

## 🛠️ Technologies

Electron 33 · JavaScript vanilla · HTML/CSS · scripts bash (`build-app.sh` : packaging
multi-arch par `lipo`, DMG par `hdiutil`, signature ad-hoc)

## 🙏 Crédits

- Bibliothèque de skills/agents construite à partir de nombreuses sources communautaires
  (dont [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) et divers dépôts Solana) —
  chaque sous-dossier garde son fichier d'origine.
- App, interface, catalogue bilingue et packaging : [@Azumizeus](https://github.com/Azumizeus)

## 📄 Licence

[MIT](LICENSE) — libre d'utilisation, de modification et de redistribution.
