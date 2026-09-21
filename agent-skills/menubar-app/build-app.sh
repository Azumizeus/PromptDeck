#!/usr/bin/env bash
# ⚡ MEGA PACK — Build complet de l'app menu-bar en une seule commande
#
#   ./build-app.sh                        → build x64 (Intel) + relance
#   ./build-app.sh --arch arm64           → build Apple Silicon
#   ./build-app.sh --arch both            → builds x64 + arm64 + DMG
#   ./build-app.sh --no-launch            → build sans relancer
#
# Étapes automatisées :
#   1. Icônes (menu bar + app)                    [node build-icon.js]
#   2. .icns (Dock, Finder, ⌘Tab)                 [sips + iconutil]
#   3. Packaging : runtime Electron local (x64) ou officiel téléchargé (arm64)
#   4. Fichiers de l'app + catalogue embarqué + Info.plist
#   5. Signature ad-hoc (app + DMG)
#   6. DMG de distribution (glisser MEGA PACK.app → Applications)
#   7. Relance (build x64 uniquement, sauf --no-launch)

set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

APP_NAME="MEGA PACK"
BUNDLE_ID="com.megapack.menubar"
ARCH="x64"
LAUNCH=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --arch) ARCH="${2:?x64|arm64|both}"; shift 2 ;;
    --no-launch) LAUNCH=0; shift ;;
    *) echo "Usage: ./build-app.sh [--arch x64|arm64|both] [--no-launch]" >&2; exit 1 ;;
  esac
done

log() { echo "▸ $*" >&2; }  # stderr : certaines sorties sont capturées par $( )
die() { echo "✗ $*" >&2; exit 1; }

# LISEZMOI embarqué dans chaque DMG (résumé des nouveautés + installation)
write_lisezmoi() { # $1 = dossier cible · $2 = "universal" pour la variante bilingue
  {
    printf 'MEGA PACK v%s — Skills & Agents\n' "$APP_VERSION"
    if [[ "${2:-}" == "universal" ]]; then printf '\nVersion universelle : Intel + Apple Silicon.\n'; fi
    cat <<'EOF'

Installation : glissez « MEGA PACK.app » sur « Applications ».
Premier lancement : clic droit → Ouvrir (app non notarisée par l'App Store).

NOUVEAUTÉS v1.1.0
· ✍️ Prompts personnalisés : bouton ＋, tags, favoris ⭐, import .md/.txt (glisser-déposer), export .md (Réglages)
· ⭐ Favoris + raccourcis ⌘1-⌘9 · 🕘 Récents · LLM par défaut (⌘⏎)
· 12 destinations « Ouvrir dans » : Claude, ChatGPT, Perplexity, Copilot, DeepSeek, Z.ai, Kimi, Mammouth.ia, Freebuff, OpenCode (desktop + terminal), presse-papiers
· Noms/descriptions en français + recherche bilingue FR/EN (321 items)
· Lancement auto au démarrage · raccourci ⌥Espace (⌘Espace est réservé par Spotlight)
· Fenêtre déplaçable/redimensionnable (position mémorisée) · export/import de configuration JSON

USAGE
· ⚡ dans la barre de menus : clic gauche = panneau de recherche · clic droit = tout le catalogue
· ⌥Espace : recherche globale · ⌘⇧Espace : Réglages
EOF
  } > "$1/LISEZMOI.txt"
}

command -v node >/dev/null 2>&1 || die "node introuvable — installe Node.js"
command -v sips >/dev/null 2>&1 || die "sips introuvable — macOS requis"

ELECTRON_VERSION="$(node -p "require('./node_modules/electron/package.json').version")"
APP_VERSION="$(node -p "require('./package.json').version")"

# ── 0. Dépendances ────────────────────────────────────────────────────────────
if [[ ! -d node_modules/electron/dist/Electron.app ]]; then
  log "Dépendances manquantes → npm install"
  npm install
fi
[[ -d node_modules/electron/dist/Electron.app ]] || {
  log "Runtime Electron incomplet → réinstallation ciblée"
  node node_modules/electron/install.js
}

# ── 1. Icônes ─────────────────────────────────────────────────────────────────
log "Génération des icônes"
node build-icon.js
[[ -f appIcon.png && -f iconTemplate.png ]] || die "build-icon.js n'a pas produit les PNG"

# ── 2. .icns ──────────────────────────────────────────────────────────────────
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
log "Création du .icns"
mkdir -p "$TMP/icon.iconset"
for spec in "16 icon_16x16" "32 icon_16x16@2x" "32 icon_32x32" "64 icon_32x32@2x" \
            "128 icon_128x128" "256 icon_128x128@2x" "256 icon_256x256" "512 icon_256x256@2x" \
            "512 icon_512x512" "1024 icon_512x512@2x"; do
  read -r sz name <<<"$spec"
  sips -z "$sz" "$sz" appIcon.png --out "$TMP/icon.iconset/$name.png" >/dev/null
done
iconutil -c icns "$TMP/icon.iconset" -o "$TMP/app.icns"

# ── Runtime Electron par architecture ─────────────────────────────────────────
electron_src_for() { # → dossier contenant Electron.app
  local a="$1"
  if [[ "$a" == "x64" ]]; then
    echo "node_modules/electron/dist"; return
  fi
  # arm64 : zip officiel mis en cache dans ~/.cache/megapack (téléchargé une seule fois)
  local cache="$HOME/.cache/megapack/electron-v${ELECTRON_VERSION}-darwin-arm64"
  if [[ ! -d "$cache/Electron.app" ]]; then
    mkdir -p "$cache"
    local url="https://github.com/electron/electron/releases/download/v${ELECTRON_VERSION}/electron-v${ELECTRON_VERSION}-darwin-arm64.zip"
    log "Téléchargement Electron arm64 v${ELECTRON_VERSION} (~100 Mo, une seule fois)"
    curl -L --retry 3 -o "$TMP/ele-arm64.zip" "$url" || die "téléchargement échoué — vérifie la connexion"
    unzip -tqq "$TMP/ele-arm64.zip" >/dev/null || die "zip Electron arm64 corrompu"
    unzip -qq "$TMP/ele-arm64.zip" -d "$cache"
  fi
  [[ -d "$cache/Electron.app/Contents/Frameworks/Electron Framework.framework" ]] \
    || die "runtime arm64 incomplet — supprime ~/.cache/megapack et relance"
  echo "$cache"
}

# ── 3-6. Packaging d'une architecture ─────────────────────────────────────────
package_for() {
  local a="$1"
  local out="dist/MEGA PACK-darwin-$a"
  local app="$out/$APP_NAME.app"
  local ele_src; ele_src="$(electron_src_for "$a")"

  log "Packaging $a → $app"
  mkdir -p "$out"
  cp -R "$ele_src/Electron.app" "$app"
  mv "$app/Contents/MacOS/Electron" "$app/Contents/MacOS/$APP_NAME"

  mkdir -p "$app/Contents/Resources/app" "$app/Contents/Resources/interface"
  cp main.js preload.js renderer.js index.html settings.html settings.js package.json \
     iconTemplate.png iconTemplate@2x.png appIcon.png appIcon@2x.png \
     "$app/Contents/Resources/app/"
  if [[ -f ../interface/catalog-full.js ]]; then
    cp ../interface/catalog-full.js "$app/Contents/Resources/interface/"
  else
    echo "⚠️  catalog-full.js introuvable — catalogue vide (python3 build-interface.py à la racine agent-skills/)"
  fi
  # launcher HTML + guide (référencés par le menu ⚡ de l'app)
  cp ../interface/mega-pack-launcher.html ../interface/MODE-DEMPLOI.html \
     "$app/Contents/Resources/interface/" 2>/dev/null || \
     echo "⚠️  mega-pack-launcher.html / MODE-DEMPLOI.html introuvables"

  local plist="$app/Contents/Info.plist"
  /usr/libexec/PlistBuddy -c "Set :CFBundleExecutable $APP_NAME" \
                          -c "Set :CFBundleName $APP_NAME" \
                          -c "Set :CFBundleDisplayName $APP_NAME" \
                          -c "Set :CFBundleIdentifier $BUNDLE_ID" \
                          -c "Set :CFBundleIconFile app.icns" \
                          -c "Set :CFBundleShortVersionString $APP_VERSION" \
                          -c "Set :CFBundleVersion $ELECTRON_VERSION" "$plist"
  cp "$TMP/app.icns" "$app/Contents/Resources/app.icns"
  rm -f "$app/Contents/Resources/electron.icns" "$app/Contents/Resources/default_app.asar"

  # Version + date de build (affichés dans la fenêtre Réglages)
  printf '{"version":"%s","built":"%s","arch":"%s","electron":"%s"}\n' \
    "$APP_VERSION" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$a" "$ELECTRON_VERSION" \
    > "$app/Contents/Resources/app/build.json"

  log "Signature ad-hoc ($a)"
  codesign --force --deep --sign - "$app" >/dev/null 2>&1 \
    || echo "⚠️  Signature échouée (non bloquant pour un usage local)"
  codesign --verify --deep --strict "$app" 2>/dev/null && echo "  ✓ signature valide" || true

  # ── DMG de distribution ──
  log "Création du DMG ($a)"
  local dmgroot="$TMP/dmg-$a"
  mkdir -p "$dmgroot"
  cp -R "$app" "$dmgroot/"
  ln -s /Applications "$dmgroot/Applications"
  write_lisezmoi "$dmgroot"
  hdiutil create -volname "$APP_NAME" -srcfolder "$dmgroot" -ov -format UDZO \
    "dist/${APP_NAME}-darwin-${a}.dmg" >/dev/null
  codesign --force --sign - "dist/${APP_NAME}-darwin-${a}.dmg" >/dev/null 2>&1 || true

  echo "✅ $a : $(du -sh "$app" | cut -f1) · DMG $(du -sh "dist/${APP_NAME}-darwin-${a}.dmg" | cut -f1) → dist/${APP_NAME}-darwin-${a}.dmg"
}

rm -rf dist
[[ "$ARCH" == "both" ]] && ARCH="x64 arm64"
for a in $ARCH; do
  [[ "$a" == "x64" || "$a" == "arm64" ]] || die "architecture inconnue : $a (x64|arm64|both)"
  package_for "$a"
done

# ── DMG universel (x64 + arm64 fusionnés par lipo) ────────────────────────────
if [[ "$ARCH" == "x64 arm64" ]]; then
  log "Fusion universelle x64 + arm64"
  APP64="dist/MEGA PACK-darwin-x64/$APP_NAME.app"
  APPAR="dist/MEGA PACK-darwin-arm64/$APP_NAME.app"
  UNI="dist/$APP_NAME.app"
  rm -rf "$UNI"
  cp -R "$APP64" "$UNI"
  # fusion de chaque binaire Mach-O x86_64 (exécutables, dylibs, bundles…) — sinon crash arm64
  # Pas de classification préalable (file/lipo -archs diffèrent selon les systèmes — 2 échecs CI) :
  # on tente lipo -create et on ignore les échecs (non-Mach-O : la copie x64 reste en place).
  LIPO_COUNT=0
  LIPO_SKIP=0
  while IFS= read -r -d '' abs; do
    rel="${abs#$APP64/}"
    if lipo -create "$APP64/$rel" "$APPAR/$rel" -output "$UNI/$rel" 2>/dev/null; then
      LIPO_COUNT=$((LIPO_COUNT+1))
    else
      LIPO_SKIP=$((LIPO_SKIP+1))
      [[ $LIPO_SKIP -le 5 ]] && log "lipo ignoré : $rel"
    fi
  done < <(find "$APP64" -type f -print0)
  log "fusion : $LIPO_COUNT binaires fusionnés, $LIPO_SKIP ignorés (non-Mach-O / mono-arch)"
  [[ "$LIPO_COUNT" -ge 10 ]] || die "fusion universelle : $LIPO_COUNT binaires fusionnés (attendu ≥ 10)"
  # fichiers spécifiques à une arch absents de l'autre pack : les DEUX snapshots V8
  # doivent être présents dans l'app universelle (Electron choisit selon l'arch)
  (cd "$APPAR" && find . -type f) | while IFS= read -r rel; do
    rel="${rel#./}"
    [[ -f "$UNI/$rel" ]] || cp "$APPAR/$rel" "$UNI/$rel"
  done
  codesign --force --deep --sign - "$UNI" >/dev/null 2>&1 || true
  lipo -info "$UNI/Contents/MacOS/$APP_NAME" 2>/dev/null || true
  log "DMG universel"
  UROOT="$TMP/dmg-universal"
  mkdir -p "$UROOT"
  cp -R "$UNI" "$UROOT/"
  ln -s /Applications "$UROOT/Applications"
  write_lisezmoi "$UROOT" universal
  hdiutil create -volname "$APP_NAME" -srcfolder "$UROOT" -ov -format UDZO \
    "dist/${APP_NAME}-universal.dmg" >/dev/null
  codesign --force --sign - "dist/${APP_NAME}-universal.dmg" >/dev/null 2>&1 || true
  echo "✅ universel : $(du -sh "$UNI" | cut -f1) · DMG $(du -sh "dist/${APP_NAME}-universal.dmg" | cut -f1) → dist/${APP_NAME}-universal.dmg"
fi

# ── 7. Relance (x64 = cette machine) ──────────────────────────────────────────
if [[ "$LAUNCH" == "1" && ( "$ARCH" == "x64" || "$ARCH" == *"x64"* ) ]]; then
  log "Relance de l'app (x64)"
  pkill -f "$APP_NAME.app/Contents/MacOS" 2>/dev/null || true
  sleep 1
  open "dist/MEGA PACK-darwin-x64/$APP_NAME.app"
  sleep 3
  pgrep -f "$APP_NAME.app/Contents/MacOS" >/dev/null \
    && echo "✓ App en cours d'exécution — ⚡ dans la menu bar, icône dans le Dock" \
    || die "l'app ne reste pas en vie — vérifie les logs"
fi
