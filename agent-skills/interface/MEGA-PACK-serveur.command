#!/bin/bash
# MEGA PACK — lance le serveur local et ouvre le launcher (macOS, double-clic)
DIR="$(cd "$(dirname "$0")" && pwd)"

# Si le port 8788 est déjà occupé, le serveur tourne probablement déjà.
if lsof -nP -iTCP:8788 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Serveur déjà lancé sur le port 8788 ✓"
else
  python3 -m http.server 8788 -d "$DIR" >/dev/null 2>&1 &
  echo "Serveur lancé : http://localhost:8788 ✓"
fi

open "http://localhost:8788/mega-pack-launcher.html"
