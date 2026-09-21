# Changelog

Toutes les évolutions notables de **PromptDeck** (anciennement MEGA PACK) sont documentées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnement [SemVer](https://semver.org/lang/fr/).

## [1.1.0] - 2026-09-21

### ✍️ Prompts personnalisés
- Création de ses propres prompts depuis le panneau (bouton **＋**, éditeur modal, ⌘⏎ pour enregistrer)
- **Tags / catégories** personnalisés : chips cliquables, recherche couvrant les tags, menu ⚡ regroupé par tag
- **Import par glisser-déposer** de fichiers `.md`/`.txt` (doublons renommés automatiquement)
- **Export en .md** depuis les Réglages (fichier `mes-prompts.md` formaté)
- 4 exemples pré-remplis au premier lancement (seed une seule fois)
- Favoris ⭐, Récents, ⌘1-⌘9 et composeur : les prompts personnalisés sont des citoyens complets

### ⌨️ Raccourcis et confort
- Raccourcis **⌘1-⌘9** pour lancer les 9 premiers favoris (désactivable dans les Réglages)
- Raccourci panneau **réparable** : ⌥Espace par défaut (⌘Espace est confisqué par Spotlight), modifiable
- Fenêtre **déplaçable/redimensionnable**, position et taille mémorisées

### 🌐 Ouverture et destinations
- **12 destinations** « Ouvrir dans » : Claude, ChatGPT, Perplexity, Copilot, DeepSeek, Z.ai, Kimi, Mammouth.ia, Freebuff (app native), OpenCode (desktop, deep-link `opencode://`), OpenCode (terminal), presse-papiers
- **LLM par défaut** choisi dans les Réglages : ⌘⏎ ouvre ta destination préférée
- Notification macOS « ⚡ Prompt copié » à chaque copie

### 🇫🇷 Bilingue FR/EN complet
- Noms et descriptions du catalogue (321 items) traduits, dans le panneau **et** les prompts générés
- Recherche **dans les deux langues** (« jupiter » trouve aussi « multi-chaînes »)
- Launcher HTML et panneau Tampermonkey v1.3.0 synchronisés

### 🚀 Réglages et cycle de vie
- Lancement automatique au démarrage du Mac (case dans les Réglages)
- Export/import de configuration complète (`megapack-config.json`)
- Menu **Aide** : ouvre le MODE-DEMPLOI.html embarqué
- **Version + date de build** affichées dans les Réglages (`build.json` horodaté)

### 📦 Packaging et qualité
- `build-app.sh --arch x64|arm64|both` : DMG Intel, Apple Silicon et **universel** (fusion `lipo` des exécutables **et** des dylibs + snapshots V8)
- Suite `test-all.sh` : 27 vérifications (syntaxe, bundles, signatures, architectures binaires, montage DMG, contenu embarqué)
- Tests logiques `test-fr.js` (10/10) et `test-custom.js` (28/28)
- Audit complet : 8 bugs corrigés, dont « Ouvrir dans » du menu ⚡ silencieusement cassé et DMG universel inutilisable sur Apple Silicon

## [1.0.0] - 2026-09-19

### 🎉 Version initiale
- App menu-bar Electron : icône ⚡, panneau de recherche sur 131 skills + 190 agents
- Multi-sélection et composeur de prompts combinés
- Menu clic droit en cascade (Favoris, Skills, Agents par catégorie)
- « Ouvrir dans » : Claude, ChatGPT, Perplexity, Copilot + presse-papiers
- Réglages thème clair/sombre + FR/EN
- Launcher HTML et panneau Tampermonkey
- Catalogue bilingue (name_fr/desc_fr) de 321 items
