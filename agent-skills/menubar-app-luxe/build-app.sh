#!/usr/bin/env bash
# Construit dist/MEGA PACK.app à partir de l'app Luxe + Electron déjà téléchargé.
# Usage : bash build-app.sh [--runtime local|arm64] [--out dist/<nom>.app]
#   --runtime local : runtime Electron de node_modules (arch de cette machine ; x64 ici)
#   --runtime arm64 : runtime officiel arm64 mis en cache (~/.cache/megapack, voir menubar-app/build-app.sh)
#   --out           : dossier/nom de sortie (défaut dist/MEGA PACK.app)
set -e -o pipefail

# node absent du PATH des shells détachés/launchd → résolution explicite
NODE_BIN="$(command -v node || true)"; [ -n "$NODE_BIN" ] || NODE_BIN="$HOME/.nvm/versions/node/v24.16.0/bin/node"
cd "$(dirname "$0")"

APP_NAME="MEGA PACK"
RUNTIME="local"
OUT="dist/$APP_NAME.app"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --runtime) RUNTIME="${2:?local|arm64}"; shift 2 ;;
    --out) OUT="${2:?dist/<nom>.app}"; shift 2 ;;
    *) echo "Usage : bash build-app.sh [--runtime local|arm64] [--out dist/<nom>.app]" >&2; exit 1 ;;
  esac
done
case "$RUNTIME" in
  local) ELECTRON_APP="node_modules/electron/dist/Electron.app" ;;
  arm64)
    EV=$("$NODE_BIN" -p "require('./node_modules/electron/package.json').version")
    ELECTRON_APP="$HOME/.cache/megapack/electron-v${EV}-darwin-arm64/Electron.app"
    if [[ ! -d "$ELECTRON_APP" ]]; then
      # repli : n'importe quel runtime arm64 déjà en cache (l'app Luxe tourne en 31 comme en 33)
      CACHED=$(ls -d "$HOME"/.cache/megapack/electron-*-darwin-arm64 2>/dev/null | tail -1 || true)
      [[ -n "${CACHED:-}" ]] && ELECTRON_APP="$CACHED/Electron.app"
    fi
    ;;
  *) echo "runtime inconnu : $RUNTIME (local|arm64)" >&2; exit 1 ;;
esac
[[ -d "$ELECTRON_APP" ]] || { echo "runtime absent : $ELECTRON_APP" >&2; exit 1; }
CONTENTS="$OUT/Contents"

# 1. Squelette
rm -rf "$OUT"
mkdir -p "$CONTENTS/MacOS" "$CONTENTS/Resources" "$CONTENTS/Frameworks"

# 2. Copie du shell Electron ($ELECTRON_APP)
ELECTRON_CONT="$ELECTRON_APP/Contents"
if [ ! -d "$ELECTRON_CONT" ]; then
  echo "Electron absent ($ELECTRON_CONT) — lance d'abord : node node_modules/electron/install.js" >&2
  exit 1
fi
echo "• Copie du shell Electron…"
cp "$ELECTRON_CONT/Info.plist" "$CONTENTS/Info.plist"
cp -R "$ELECTRON_CONT/Frameworks/" "$CONTENTS/Frameworks/"
cp -R "$ELECTRON_CONT/Resources/" "$CONTENTS/Resources/"
rm -f "$CONTENTS/MacOS/Electron"
rm -rf "$CONTENTS/Resources/default_app.asar"

# 3. Code de l'app ( sources + node_modules prod ) → Contents/Resources/app
echo "• Copie des sources de l'app…"
APP_DIR="$CONTENTS/Resources/app"
mkdir -p "$APP_DIR"
# theme.js : CSS injecté par le renderer — OBLIGATOIRE. Sans lui, la fenêtre
# transparent:true n'a aucun fond (#app{n'a plus background:rgba…}) et l'app
# devient entièrement invisible. Piège historique du build (run du 24/09/2026).
for f in main.js preload.js renderer.js theme.js demo-shim.js index.html settings.html settings.js \
         launcher.html mac-chrome.js standalone.html appIcon.png appIcon@2x.png \
         iconTemplate.png iconTemplate@2x.png package.json; do
  [ -f "$f" ] && cp "$f" "$APP_DIR/"
done
# Catalogue embarqué : interface/catalog-full.js attendu dans Contents/Resources/interface
# (candidat n°2 de preload.js/main.js en mode packagé) — copié AVANT le garde-fou,
# car launcher.html référence « ../interface/catalog-full.js ».
mkdir -p "$CONTENTS/Resources/interface"
cp "../interface/catalog-full.js" "$CONTENTS/Resources/interface/catalog-full.js"
# Guide ⌘⌥/ embarqué (source unique : MODE-EMPLOI.md à la racine du pack) — vérifié par test-all.sh
if [ -f "../../MODE-EMPLOI.md" ]; then
  cp "../../MODE-EMPLOI.md" "$CONTENTS/Resources/MODE-EMPLOI.md"
else
  echo "⚠️  MODE-EMPLOI.md introuvable — aide contextuelle indisponible" >&2
fi
# Skill jev-decision-router embarqué (bouton 🧭 du panneau — routage typé local)
if [ -f "../skills/jev-decision-router/scripts/jev-router.mjs" ]; then
  cp "../skills/jev-decision-router/scripts/jev-router.mjs" "$APP_DIR/"
else
  echo "⚠️  jev-router.mjs introuvable — bouton 🧭 inopérant" >&2
fi

# Garde-fou : chaque .js/.css local référencé par les .html embarqués DOIT exister
# dans le bundle (sinon CSP 'self' → 404 silencieux → page sans style/inerte).
# « ../ » se résout depuis Resources/ (l'app vit dans Resources/app), le reste depuis app/.
for h in "$APP_DIR"/*.html; do
  for src in $(grep -o 'src="[^"]*"\|href="[^"]*\.js"' "$h" | sed -E 's/^(src|href)="//; s/"$//' | grep -v '^[a-z]*://'); do
    case "$src" in
      ../*) target="$CONTENTS/Resources/${src#../}" ;;
      *)    target="$APP_DIR/$src" ;;
    esac
    if [ ! -f "$target" ]; then
      echo "❌ $(basename "$h") référence « $src » absent du bundle — build annulé" >&2
      exit 1
    fi
  done
done

echo "• Vérification : $(ls "$APP_DIR" | wc -l | tr -d ' ') fichiers dans Resources/app (theme.js présent : $([ -f "$APP_DIR/theme.js" ] && echo oui || echo NON))"

# lib/ (modules requis par main.js : md-writer pour le containment des .md)
if [ -d lib ]; then
  mkdir -p "$APP_DIR/lib"
  for f in lib/*.js; do [ -f "$f" ] && cp "$f" "$APP_DIR/lib/"; done
fi
# node_modules de production uniquement (auto-launch)
mkdir -p "$APP_DIR/node_modules"
for dep in auto-launch; do
  if [ -d "node_modules/$dep" ]; then
    mkdir -p "$APP_DIR/node_modules/$dep"
    (cd "node_modules/$dep" && tar cf - --exclude '.DS_Store' .) | (cd "$APP_DIR/node_modules/$dep" && tar xf -)
  fi
done

# 4. Binaire renommé (le nom du process = nom de l'app dans la barre des menus)
echo "• Binaire $APP_NAME…"
cp "$ELECTRON_CONT/MacOS/Electron" "$CONTENTS/MacOS/$APP_NAME"
chmod +x "$CONTENTS/MacOS/$APP_NAME"

# 5. Info.plist : identité + nom affiché + icône
PLIST="$CONTENTS/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable $APP_NAME" "$PLIST" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Add :CFBundleExecutable string $APP_NAME" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleName $APP_NAME" "$PLIST" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Add :CFBundleName string $APP_NAME" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $APP_NAME" "$PLIST" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string $APP_NAME" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.megapack.luxe" "$PLIST" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Add :CFBundleIdentifier string com.megapack.luxe" "$PLIST"
VERSION=$("$NODE_BIN" -p "require('./package.json').version")
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "$PLIST" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Add :CFBundleShortVersionString string $VERSION" "$PLIST"

# 6. Icône .icns si possible (sinon l'icône Electron par défaut reste)
if command -v sips >/dev/null 2>&1 && [ -f appIcon.png ]; then
  echo "• Icône…"
  ICONSET="$(mktemp -d)/icon.iconset"
  mkdir -p "$ICONSET"
  sips -z 16 16     appIcon.png  --out "$ICONSET/icon_16x16.png"     >/dev/null
  sips -z 32 32     appIcon.png  --out "$ICONSET/icon_16x16@2x.png"  >/dev/null
  sips -z 32 32     appIcon.png  --out "$ICONSET/icon_32x32.png"     >/dev/null
  sips -z 64 64     appIcon.png  --out "$ICONSET/icon_32x32@2x.png"  >/dev/null
  sips -z 128 128   appIcon.png  --out "$ICONSET/icon_128x128.png"   >/dev/null
  sips -z 256 256   appIcon.png  --out "$ICONSET/icon_128x128@2x.png" >/dev/null
  sips -z 256 256   appIcon.png  --out "$ICONSET/icon_256x256.png"   >/dev/null
  sips -z 512 512   appIcon.png  --out "$ICONSET/icon_256x256@2x.png" >/dev/null
  sips -z 512 512   appIcon.png  --out "$ICONSET/icon_512x512.png"   >/dev/null
  cp appIcon@2x.png "$ICONSET/icon_512x512@2x.png" 2>/dev/null || true
  iconutil -c icns "$ICONSET" -o "$CONTENTS/Resources/$APP_NAME.icns" 2>/dev/null || true
  if [ -f "$CONTENTS/Resources/$APP_NAME.icns" ]; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleIconFile $APP_NAME" "$PLIST" 2>/dev/null || \
    /usr/libexec/PlistBuddy -c "Add :CFBundleIconFile string $APP_NAME" "$PLIST"
  fi
fi

# 7. Signature ad-hoc — de l'intérieur vers l'extérieur (obligatoire quand on a modifié
#    Info.plist). On ne touche PAS au binaire principal avec --deep : le deep re-écrit
#    le stub et le corrompt.
#    NB : pas de `find | while` ici — avec pipefail, un find sans résultat fait échouer
#    le pipeline et le for s'arrête après le premier tour. On passe par des glob.
# 6b. Élagage des paquets de langues (lproj) — l'app est FR/EN, Electron en embarque 164+109.
#     ⚠️ On conserve en.lproj + fr.lproj (et fr-CA) dans CHAQUE frameworks imbriqué. À faire
#     AVANT la signature ad-hoc (sinon invalidation). ~26 Mo économisés sur le bundle.
echo "• Élagage des langues (en/fr conservées)…"
KEEP='(en|fr)(-CA)?\\.lproj'
SAVED0=$(du -sk "$CONTENTS" | cut -f1)
find "$CONTENTS" -name '*.lproj' -type d | grep -Ev "/(en|fr)(-CA)?\.lproj$" | while IFS= read -r d; do rm -rf "$d"; done
echo "  → $(( (SAVED0 - $(du -sk "$CONTENTS" | cut -f1)) / 1024 )) Mo économisés"

echo "• Signature ad-hoc…"
shopt -s nullglob
for h in "$CONTENTS/Frameworks/"*.app; do
  codesign --force --sign - "$h" 2>/dev/null || echo "  ⚠ helper non signé : $h"
done
for fw in "$CONTENTS/Frameworks/"*.framework; do
  # les binaires nus (chrome_crashpad_handler…) DOIVENT être signés avant leur .framework
  for b in "$fw/Versions/A/Helpers/"*; do
    [ -f "$b" ] && [ -x "$b" ] && codesign --force --sign - "$b" 2>/dev/null
  done
  codesign --force --sign - "$fw" 2>/dev/null || echo "  ⚠ framework non signé : $fw"
done
shopt -u nullglob
codesign --force --sign - "$OUT" || { echo "❌ échec codesign racine" >&2; exit 1; }
# vérification immédiate : la signature doit être valide, sinon échec du build
codesign -vv "$OUT" > /dev/null 2>&1 || { echo "❌ signature invalide après build" >&2; exit 1; }
echo "  ✓ signature valide"

echo "✅ $OUT construit ($(du -sh "$OUT" | cut -f1))"
