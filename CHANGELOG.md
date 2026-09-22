# Changelog

Toutes les évolutions notables de **PromptDeck** (anciennement MEGA PACK) sont documentées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnement [SemVer](https://semver.org/lang/fr/).

## [2.5.1] - 2026-09-21

### 🔧 Robustesse LLM — plafonds de tokens et reprise sur 429
- **team-generate : plafond 8 192 tokens** — l'équipe complète (orchestrateur + agents +
  workflow) dépassait le plafond 2 048 et sortait un JSON tronqué inexploitable
- **llmChat : reprise automatique sur HTTP 429** — respect de `Retry-After` (ou du délai
  annoncé par le fournisseur), 2 tentatives max, garde 8 s / plafond 60 s : les quotas
  gratuits (Groq 8 000 tokens/min) ne cassent plus les missions
- **e2e-groq.js** : driver E2E bout-en-bout (fenêtre cachée + preload de production,
  vrai bridge IPC → main → API Groq) : préflight clés, team-generate, team-run,
  vérifications du rapport, verdict JSON
- Validé en réel (clé Groq personnelle) : équipe « AuditStakingSolana » générée en 4,7 s,
  mission exécutée en 42,7 s avec reprise 429 — rapport consolidé de 9 851 caractères

## [2.5.0] - 2026-09-21

### 🗝️ Clés auto-chargées, launcher navigateur, 5 correctifs
- **Clés auto-chargées au lancement** : exports du `~/.zshrc` + configs OpenCode
  (`opencode.json`, `auth.json`) → l'Atelier est opérationnel sans aucun réglage
- **Boot réparé** : `require('os')` manquant (crash silencieux du loader de clés) et
  `ipcMain` déclaré avant usage (crash au démarrage)
- **Composeur réparé** : le prompt combiné n'est plus rempli de « undefined » (`buildCombo`
  recevait des wrappers `{x,k}` au lieu des objets du catalogue)
- **Visite guidée** : elle capte le clavier, le panneau n'agit plus en arrière-plan
- **Onglet Équipes vide** : message guidé vers l'Atelier au lieu de « Aucun résultat »
- **Réglages** : « catalogue introuvable » corrigé (bridge `window.mgp.catalog` au lieu du
  fetch `../interface/`, bloqué en `file://`)
- `test-luxe.js` : section 9b — régression composeur (le vrai `onclick` est exercé)

## [2.4.0] - 2026-09-21

### 🕸 Équipes multi-agents exécutables + sélecteur de LLM
- **Équipes exécutables** : l'Atelier génère une **équipe complète** (orchestrateur senior +
  agents + workflow en tâches séquencées) — onglet « 🕸 Équipes », lancement de mission avec
  exécution réelle des tâches via le LLM configuré et **rapport consolidé**
- **Sélecteur de LLM permanent** : choix du modèle **depuis le footer** de l'app et dans les
  Réglages — mémorisé entre les sessions, utilisé par l'Atelier et les équipes
- **Arborescence au clic droit** : le menu contextuel révèle le chemin du dossier
  MEGA PROMPT et l'entrée « Ouvrir le dossier » passe au premier plan
- **Visite guidée** : tour interactif des nouveautés au premier lancement (rejouable)
- **Launcher navigateur** : ouverture du panneau Luxe dans le navigateur (`standalone.html`)
- **Userscript Tampermonkey 2.4.0** : onglet Équipes, tooltip expert, clic droit multi-LLM,
  sélecteur de LLM — le panneau flottant rattrape l'app
- `test-luxe.js` étendu (équipes, sélecteur) ; `e2e-groq.js` en préparation

## [2.3.0] - 2026-09-21

### 📄 Dossier MEGA PROMPT — le catalogue en fichiers .md sur le disque
- **Clic droit sur un skill/agent/✍️ → « 📄 Créer le .md »** : écrit immédiatement le fichier
  dans l'arborescence du dossier MEGA PROMPT (fiche + prompt d'activation prêt à coller),
  avec toast du chemin exact créé
- **« 📂 Ouvrir le dossier MEGA PROMPT »** dans le même menu : accès en un clic à l'endroit
  où les fichiers sont créés (Finder)
- **Réglages → 📁 Dossier MEGA PROMPT** : choix du dossier (défaut `~/Documents/MEGA PROMPT`,
  mémorisé), ouverture, et **🔄 Générer tous les .md** — les 321 experts + les prompts perso
  en une passe, avec `LISEZMOI.md`
- **Arborescence logique** : `skills/<catégorie>/<skill>.md` · `agents/<catégorie>/<agent>.md` ·
  `perso/<tag>/<prompt>.md` (+ `perso/<nom>.md` sans tag)
- Userscript Tampermonkey passé en **2.2.0** (base + FULL regénéré, 231 Ko) — aligné sur l'Édition Luxe
- Tests : `test-luxe.js` → **12 sections** (création .md depuis le menu contextuel incluse)

## [2.2.0] - 2026-09-21

### 💡 Édition Luxe — tooltip expert, clic droit multi-LLM, atelier de création IA
- **Tooltip flottant au survol** d'un skill/agent/✍️ : type (SKILL/AGENT/PERSO), nom, description
  complète, catégorie, compétences de l'agent, astuce d'usage et raccourci ⌘n si favori —
  délai 350 ms pour éviter le bruit, repositionnement automatique dans le panneau
- **Clic droit = menu flottant d'envoi** : « Envoyer à » liste **plusieurs destinations choisies
  dans les Réglages** (ChatGPT, Claude, presse-papiers, Freebuff, OpenCode…), plus Copier le
  prompt et bascule du favori — Échap/clic extérieur pour fermer
- **Réglages → Destinations du clic droit** : chips à choix multiple, l'ordre = priorité ;
  le menu contextuel reste utilisable même sans configuration (repli sur le LLM par défaut)
- **🛠 Atelier (footer)** : créer ses **agents** (persona expert : system prompt, compétences,
  outils, règles) et **skills** (procédure SKILL.md : entrées, méthode, vérifications) —
  **générés par IA** à partir d'une simple intention, option « niveau senior orchestrateur »
- **🧠 Réglages → Intelligence** : clé API par fournisseur (**Groq, OpenAI, Anthropic,
  OpenRouter, Ollama local, endpoint OpenAI-compatible**), modèle mémorisé, **bouton Tester**
  (latence + modèle réel) — clés chiffrées par le trousseau macOS via `safeStorage` quand
  possible, ou variables d'environnement (`GROQ_API_KEY`, `OPENAI_API_KEY`…)
- Les créations de l'Atelier deviennent des **citoyens du panneau** (recherche, favoris, envoi
  LLM) et s'exportent en `.md` (agent : system prompt + règles · skill : procédure + vérifications)
- Toasts discrets de confirmation/erreur ; `test-luxe.js` étendu à **11 sections** (atelier,
  menu contextuel multi-destinations) — toutes vertes ; version 2.2.0

## [2.1.0] - 2026-09-21

### 🧩 Userscript (Tampermonkey) aligné sur l'Édition Luxe — v2.0.0
- Le userscript n'avait que Skills/Agents + insertion : il récupère **tout ce qui fait l'Édition Luxe**
- **Onglet « Tout »** (321 experts d'un coup d'œil) en plus de Skills / Agents
- **★ Favoris** persistés par site (localStorage), ☆→★ au survol, badge ★ dans la liste
- **✍️ Prompts perso** : création/suppression dans un modal sobre (⌘⏎ pour valider), persistés par site, onglet dédié
- **Composeur ⌘-clic** : sélection multiple + « ✚ Composer (n) » qui injecte un prompt combiné dans la conversation
- **Clavier complet** : ↑↓ Home/End Page↑↓ · ⏎ injecter · ⌘⏎ ouvrir Claude · ⇧⏎ ChatGPT · ⌥⏎ composer · Échap fermer · Ctrl+Shift+K bascule le panneau
- **Design Luxe** : liseré dégradé sur la ligne active, feedback « ✓ injecté/copié », compteurs en en-tête, champ de recherche à focus violet, bouton ⚡ en dégradé Solana
- Recherche multi-mots avec pertinence (préfixe d'abord), état vide signifié, FR/EN persisté
- **Nouveau banc d'essai** `interface/panel-demo.html` : faux chat LLM (éditeur contenteditable) où le userscript s'injecte réellement — validé en live : injection 351 car. dans l'éditeur, favoris, ✍️, composeur, clavier, Ctrl+Shift+K
- `mega-pack-panel-full.user.js` regénéré (231 Ko, catalogue embarqué)

## [2.0.0] - 2026-09-21

### 🎯 Édition Luxe — repartir de zéro, une seule app sobre
- **Une seule interface** : liste noire premium, aérée, typographie soignée — compréhensible en 3 secondes (recherche → lecture → tir du prompt)
- Les éditions expérimentales « Galaxie 3D » et « Pont de commandement » sont **supprimées** (retours utilisateur : opaque, illisible, trop complexe)
- **Recherche instantanée** avec pertinence (préfixe d'abord), 5 filtres (Tout / Skills / Agents / ✍️ / ★), état vide signifié
- **Clavier complet** : ↑↓ Home/End Page↑↓ · ⏎ copie · ⌘⏎ ouvre le LLM par défaut · ⇧⏎ ChatGPT · ⌥⏎ compose la sélection · ⌘1-9 favoris · ⌘, réglages · Échap efface puis cache
- **⌘-clic** multi-sélection + **⌥⏎** compose un prompt combiné (plusieurs experts ensemble)
- ✍️ prompts perso : création/édition/suppression dans un modal sobre (⌘⏎ pour valider)
- Design : verre natif macOS, liseré dégradé sur la ligne active, feedback « ✓ copié », ☆→★ au survol, thèmes sombre/clair, contrastes et `prefers-reduced-motion` respectés
- Coquille Electron éprouvée conservée (tray ⚡, ⌥Espace, prefs JSON, userData isolé `megapack-menubar-luxe`)
- **Validation** : `test-luxe.js` (renderer réel en sandbox VM, 22 vérifications) + `probe-luxe.js` (Electron offscreen : 321 lignes rendues, recherche, ⏎ → presse-papiers système, capture `dist/probe-luxe.png`) + démo navigateur `standalone.html` (même renderer + shim, testée en live)

## [1.2.3] - 2026-09-21

### 👓 Compréhensibilité — expérience Web3 premium (retours captures d'écran)
- **Pont** : le cadran passe de 190 chips empilées à une **fenêtre de 11 cibles lisibles** (±5 autour de la cible, profondeur en escalier) ; la **cible vit au cœur du HUD** (nom + compteur `12/190`) ; filtres déplacés en **colonne de gauche** (glassmorphism, plus de collision) ; les chips reçoivent le bon contenu à chaque rotation
- **Galaxie** : **anneaux séparés et étiquetés** — 🛠 Skills au centre-violet, 👥 Agents à l'extérieur-vert, ✍️ perso au cœur (fini le mélange) ; **étiquettes orbitales tournantes** qui nomment chaque zone avec son effectif ; orbites en pointillés ; zoom ≥ 1,25 → jusqu'à 90 noms affichés
- **Onboarding** : bandeau d'accueil une seule fois par édition (ce que c'est + les 3 gestes qui comptent)
- **Verre dépoli** (glassmorphism) sur légende, carte d'action et filtres ; actions du footer masquées en monovue (déjà dans la carte/barre) pour supprimer le doublon
- Bug corrigé au passage : la rotation ← → du cadran n'avançait plus la cible (régression attrapée par test)

## [1.2.2] - 2026-09-21

### ⚡ V3.1 — activation enrichie des skills & agents (galaxie + pont)
- **Galaxie — légende cliquable** : 🛠 Skills / 👥 Agents / ✍️ Perso / ⭐ Favoris filtrent la scène d'un clic (les autres secteurs s'estompent)
- **Galaxie — carte d'action** : cibler une étoile (← →, clic sur son halo) ouvre une carte d'actions — ⏎ Copier · ⌘⏎ Ouvrir (LLM par défaut) · ⇧⏎ ChatGPT · ★ favori · ✚ composer · ✎ éditer (perso) · Tab pour l'afficher/masquer, Échap pour la refermer
- **Pont — filtres du cadran** : puces de catégories **réelles du catalogue** (academic, code, design…) — le cadran ne charge que les cibles de la catégorie
- **Pont — barre d'actions rapides** : Copier / Ouvrir (LLM par défaut) / ChatGPT / ★ directement sous le réticule ; fil d'Ariane enrichi (catégorie + compteur de cibles)
- Conformité `frontend-ui-engineering` + agent `design-ui-designer` (navigation clavier complète, cibles ≥ 24px, libellés explicites, ARIA pressé)
- `test-galaxy.js` étendu à 3 nouvelles sections V3.1 (légende, carte, filtres/actions) — 47 vérifications

## [1.2.1] - 2026-09-21

### 🚀 Deux éditions monovue (apps séparées)
- **[`menubar-app-galaxy`](agent-skills/menubar-app-galaxy)** : l'Édition **Galaxie 3D** seule — constellation navigable + hyper-saut
- **[`menubar-app-bridge`](agent-skills/menubar-app-bridge)** : l'Édition **Pont de commandement** seul — HUD radial, secteurs, cadran orbital
- Moteur unique « édition-aware » (méta `mgp-edition` dans l'HTML) : le renderer v3 n'active que la vue de l'édition ; v2 « Constellation » garde les deux vues + basculement
- Smoke `probe-v3.js` édition-aware (détecte la méta) + vérification du presse-papiers rendue déterministe (vidage avant tir)
- Menus, fenêtres et notifications renommés par édition ; `node_modules` partagé par lien symbolique

## [1.2.0] - 2026-09-21

### 🌌 V3 « Constellation » — deux vues jamais vues (app menu-bar v2)
- **Galaxie 3D** (canvas 2D, projection perspective) : toute la bibliothèque en étoiles — agents en orbite verte, skills en anneau violet, ✍️ perso au centre, ⭐ favoris en constellation polaire reliée par des fils d'or — sur fond de nébuleuses et champ d'étoiles scintillantes
- **Hyper-saut de recherche** : taper déclenche le plongeon de la caméra vers les étoiles trouvées, qui pulsent ; les favoris ⭐ sont togglables en direct (⌥-clic sur une étoile)
- **Pont de commandement** : HUD radial à 4 arcs-secteurs (👥 Agents · 🛠 Skills · ✍️ Perso · ⭐ Favoris), cœur pulsant MEGA PACK, **cadran orbital** — les items défilent sur un anneau sous un réticule ▼, ← →/molette/glisser pour viser, ⏎ pour tirer
- La liste devient un **tiroir de résultats** en surimpression (✕/Échap pour revenir à la scène) ; vue mémorisée, recherche/favoris/sélection partagés entre les vues
- Nouvelle suite `test-galaxy.js` (sandbox VM) intégrée à `test-all.sh` + smoke Electron offscreen `probe-v3.js` (peinture canvas réelle, arcs/chips, tir → presse-papiers)

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
