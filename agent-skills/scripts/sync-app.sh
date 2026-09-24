#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/sync-app.sh — rafraîchit /Applications/MEGA PACK.app en une commande
#
#   ./scripts/sync-app.sh             # mode « catalog » (défaut) : remplace le
#                                     # catalogue embarqué, re-signe, relance
#   ./scripts/sync-app.sh full        # remplace TOUTE l'app par le dernier
#                                     # build menubar-app-luxe/dist/ + catalogue
#   ./scripts/sync-app.sh --rebuild   # relance build-app.sh d'abord, puis full
#
# Pourquoi re-signer : remplacer un fichier dans un bundle .app invalide le
# sceau de signature → l'app refuse de se lancer (« damaged »). Signature
# ad-hoc (identité « - »), racine uniquement — PAS de --deep (build-app.sh :
# le deep réécrit le stub du binaire principal et le corrompt).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="MEGA PACK"
APP="/Applications/$APP_NAME.app"
DIST="$REPO/menubar-app-luxe/dist/$APP_NAME.app"
CATALOG="$REPO/interface/catalog-full.js"
MODE="${1:-catalog}"

# Nombre d'items du catalogue (vérifie aussi que le fichier parse bien)
catalog_counts() {
  node -e '
    const fs = require("fs");
    const c = new Function(fs.readFileSync(process.argv[1], "utf8") + "\n;return MEGA_CATALOG;")();
    console.log(`${c.skills.length} skills · ${c.agents.length} agents`);
  ' "$1"
}

quit_app() {
  # Quitte proprement d'abord (osascript), puis pkill en secours.
  osascript -e "tell application \"$APP_NAME\" to quit" >/dev/null 2>&1 || true
  sleep 1
  pkill -f "$APP/Contents/MacOS/$APP_NAME" 2>/dev/null || true
  sleep 1
}

re_sign() {
  # Re-sceau racine ad-hoc (les composants imbriqués restent intacts → pas de --deep)
  echo "• Re-signature ad-hoc…"
  codesign --force --sign - "$APP"
  codesign -vv "$APP" >/dev/null 2>&1 || { echo "❌ signature invalide après re-sceau" >&2; exit 1; }
  echo "  ✓ signature valide"
}

relaunch() {
  echo "• Lancement…"
  open -a "$APP"
  sleep 2
  local pid
  pid=$(pgrep -f "$APP/Contents/MacOS/$APP_NAME" | head -1 || true)
  if [ -n "$pid" ]; then
    echo "✅ $APP_NAME relancée (PID $pid)"
  else
    echo "⚠️  $APP_NAME ne répond pas encore — vérifie avec : pgrep -fl \"$APP_NAME\"" >&2
  fi
}

case "$MODE" in
  catalog)
    [ -d "$APP" ] || { echo "❌ $APP introuvable — lance d'abord : $0 full" >&2; exit 1; }
    [ -f "$CATALOG" ] || { echo "❌ catalogue absent : $CATALOG" >&2; exit 1; }
    echo "Ⓜ️  MEGA PACK — mise à jour du catalogue"
    echo "• Catalogue repo : $(catalog_counts "$CATALOG")"
    quit_app
    mkdir -p "$APP/Contents/Resources/interface"
    cp "$CATALOG" "$APP/Contents/Resources/interface/catalog-full.js"
    echo "• Catalogue copié → Contents/Resources/interface/"
    re_sign
    relaunch
    ;;

  full)
    [ -d "$DIST" ] || { echo "❌ build absent : $DIST — lance d'abord : bash menubar-app-luxe/build-app.sh (ou $0 --rebuild)" >&2; exit 1; }
    [ -f "$CATALOG" ] || { echo "❌ catalogue absent : $CATALOG" >&2; exit 1; }
    echo "Ⓜ️  MEGA PACK — remplacement complet de l'app"
    echo "• Build source : $DIST ($(catalog_counts "$DIST/Contents/Resources/interface/catalog-full.js" 2>/dev/null || echo 'catalogue illisible'))"
    quit_app
    rm -rf "$APP"
    cp -R "$DIST" "$APP"
    # Catalogue repo toujours plus frais que celui du build → recopié par-dessus
    mkdir -p "$APP/Contents/Resources/interface"
    cp "$CATALOG" "$APP/Contents/Resources/interface/catalog-full.js"
    echo "• App installée + catalogue repo ($(catalog_counts "$CATALOG"))"
    re_sign
    relaunch
    ;;

  --rebuild)
    echo "Ⓜ️  MEGA PACK — rebuild complet (build-app.sh puis déploiement)"
    (cd "$REPO/menubar-app-luxe" && bash build-app.sh)
    exec "$0" full
    ;;

  *)
    echo "Usage : $0 [catalog|full|--rebuild]" >&2
    echo "  catalog   (défaut) remplace le catalogue embarqué, re-signe, relance" >&2
    echo "  full              remplace toute l'app par menubar-app-luxe/dist/" >&2
    echo "  --rebuild         rebuild (build-app.sh) puis full" >&2
    exit 2
    ;;
esac
