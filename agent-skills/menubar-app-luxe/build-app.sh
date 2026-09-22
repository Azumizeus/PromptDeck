#!/usr/bin/env bash
# Construit dist/MEGA PACK.app à partir de l'app Luxe + Electron déjà téléchargé.
# Usage : bash build-app.sh
set -euo pipefail
cd "$(dirname "$0")"

APP_NAME="MEGA PACK"
OUT="dist/$APP_NAME.app"
CONTENTS="$OUT/Contents"

# 1. Squelette
rm -rf "$OUT"
mkdir -p "$CONTENTS/MacOS" "$CONTENTS/Resources" "$CONTENTS/Frameworks"

# 2. Copie du shell Electron (node_modules/electron/dist/Electron.app)
ELECTRON_APP="node_modules/electron/dist/Electron.app"
ELECTRON_CONT="$ELECTRON_APP/Contents"
if [ ! -d "$ELECTRON_CONT" ]; then
  echo "Electron absent — lance d'abord : node node_modules/electron/install.js" >&2
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
for f in main.js preload.js renderer.js index.html settings.html settings.js \
         launcher.html mac-chrome.js standalone.html appIcon.png appIcon@2x.png \
         iconTemplate.png iconTemplate@2x.png package.json; do
  [ -f "$f" ] && cp "$f" "$APP_DIR/"
done
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
VERSION=$(node -p "require('./package.json').version")
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
#    le stub et le corrompt. Chaque helper/framework est signé individuellement.
echo "• Signature ad-hoc…"
find "$CONTENTS/Frameworks" -name '*.app' -maxdepth 3 -type d 2>/dev/null | while read -r h; do
  codesign --force --sign - "$h" 2>/dev/null || true
done
for fw in "$CONTENTS/Frameworks"/*.framework; do
  [ -e "$fw" ] || continue
  codesign --force --sign - "$fw" 2>/dev/null || true
done
codesign --force --sign - "$OUT" 2>/dev/null || true

echo "✅ $OUT construit ($(du -sh "$OUT" | cut -f1))"
