# 🗺 Tous les chemins de MEGA PACK ARENA — pour le déplacer sans rien casser

**Règle d'or** : le jeu ne dépend d'aucun chemin absolu codé en dur dans son code.
Il lit tout dans le dossier userData partagé (indépendant de son emplacement).
Les **deux seuls liens physiques** sont dans le lanceur (→ Electron) — tout le reste
suit automatiquement.

## 1. Le dossier du jeu (déplaçable où tu veux)

```
agent-skills/arena-app/          ← LE DOSSIER DU JEU (déplaçable)
├── main.js                  ← process Electron (watcher du bus)
├── preload.js               ← pont IPC
├── index.html               ← scène + journal + HUD
├── renderer.js              ← arène/course vectorielles
├── package.json             ← manifeste
├── LANCER-ARENA.command     ← double-clic (calcule ses chemins tout seul)
└── CHEMINS.md               ← ce fichier
```

Tu peux déplacer ce dossier **n'importe où** (Bureau, Applications, un disque externe) :
le lanceur utilise `cd "$(dirname "$0")"` → tous les chemins internes sont relatifs.

## 2. Le dossier de données (NE PAS déplacer — partagé avec MEGA PACK)

```
~/Library/Application Support/megapack-menubar-luxe/   ← DONNÉES PARTAGÉES
├── arena-events.ndjson   ← LE BUS : le jeu lit ici, MEGA PACK écrit ici
├── mgp-prefs.json        ← prefs MEGA PACK (customs ✍️ lus au lancement)
├── my-agents.json        ← agents de l'Atelier → roster des fighters
├── my-skills.json        ← skills → véhicules du garage
└── my-trash.json         ← corbeille
```

C'est ce dossier qui fait le lien entre les deux apps — il est fixé par macOS
(`app.setPath('userData')` résolu vers le même nom des deux côtés). Ne le déplace pas.

## 3. Le runtime Electron (2 liens à vérifier si tu déplaces le jeu)

Le jeu réutilise l'Electron déjà installé par l'app Luxe :

```
<racine-du-repo>/menubar-app-luxe/node_modules/electron/dist/Electron.app
```

Le lanceur le cherche **un niveau au-dessus du dossier du jeu** (`../menubar-app-luxe/...`).
Si tu déplaces `arena-app/` ailleurs, mets à jour la variable `ELECTRON` en haut de
`LANCER-ARENA.command` — c'est le SEUL endroit à modifier :

```bash
ELECTRON="/chemin/vers/menubar-app-luxe/node_modules/electron/dist/Electron.app"
```

(ou installe Electron localement : `cd arena-app && npm install` → le lanceur
s'en sert automatiquement via `npx electron .`)

## 4. Recette de déplacement complète

```bash
# 1. Quitter le jeu (⌘Q) et MEGA PACK (menu ⚡ → Quitter)
# 2. Déplacer le dossier :
mv "/Users/mickaeldunoyer/projects/skill-install/agent-skills/arena-app" "/Applications/MEGA PACK ARENA"
# 3. Éditer LANCER-ARENA.command → ELECTRON="/chemin/absolu/.../Electron.app"
# 4. Relancer : double-clic sur LANCER-ARENA.command
# Vérification : le journal affiche « Connecté au bus » et le roster des agents.
```

⚠️ Après un déplacement, macOS peut redemander l'autorisation « fichiers du dossier
Bureau/Documents » — accepter une fois, c'est tout.

## 5. Dépannage rapide

| Symptôme | Cause | Correctif |
|---|---|---|
| « ⚠️ Init impossible » | userData pas encore créé | lance MEGA PACK une fois puis relance ARENA |
| Roster vide | pas d'agent dans l'Atelier | 🛠 Atelier → génère un agent |
| Pas de spawn en direct | MEGA PACK fermé ou bus OFF | ouvre MEGA PACK ; Réglages → « Bus d'événements ARENA » coché |
| `Electron introuvable` | repo déplacé/renommé | corriger `ELECTRON=` dans LANCER-ARENA.command |
