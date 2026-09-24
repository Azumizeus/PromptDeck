#!/bin/bash
# ⚡ LANCER MEGA PACK ARENA — double-clic dans le Finder (ou bash LANCER-ARENA.command)
# Le jeu lit en direct l'activité de MEGA PACK : chaque agent généré dans l'Atelier
# entre dans l'arène À SON NOM. Lance d'abord MEGA PACK pour l'activité en direct.
#
# Déplacement du jeu : ce script calcule tout depuis son propre emplacement.
# SEUL ajustement possible si tu déplaces le dossier ailleurs : la variable
# ELECTRON ci-dessous (voir CHEMINS.md §3 et §4).
cd "$(dirname "$0")"

# 1) Electron local du dossier du jeu (si npm install fait ici)
if [ -x "node_modules/.bin/electron" ]; then
  exec ./node_modules/.bin/electron . --opened-from-launcher
fi
# 2) Electron du repo, un niveau au-dessus (installation par défaut)
ELECTRON="../menubar-app-luxe/node_modules/electron/dist/Electron.app"
if [ -d "$ELECTRON" ]; then
  exec open -a "$(cd "$(dirname "$ELECTRON")" && pwd)/$(basename "$ELECTRON")" --args "$(pwd)" --opened-from-launcher
fi
# 3) Dernier recours : chemin absolu à adapter (voir CHEMINS.md)
ELECTRON="/Users/mickaeldunoyer/Desktop/Skill Install/agent-skills/menubar-app-luxe/node_modules/electron/dist/Electron.app"
if [ -d "$ELECTRON" ]; then
  exec open -a "$ELECTRON" --args "$(pwd)" --opened-from-launcher
fi
echo "Electron introuvable — installe menubar-app-luxe (npm install) ou édite ELECTRON= dans ce script (voir CHEMINS.md)."
read -n 1 -s
