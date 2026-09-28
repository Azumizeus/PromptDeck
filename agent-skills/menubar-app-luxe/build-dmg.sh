#!/usr/bin/env bash
# 💿 DMG de distribution pour l'app Luxe — 3 variantes (x64, arm64, universel).
# Usage : bash build-dmg.sh            (les 3, ~3-5 min avec runtimes en cache)
#         bash build-dmg.sh x64|arm64|universal
#
# L'app Luxe 2.19.x (resize IPC, 📌, 3 feux, LLM scrollable) est construite par
# build-app.sh ; le LISEZMOI bilingue FR/EN vient de menubar-app/build-app.sh
# (write_lisezmoi, source unique) et le guide ⌘⌥/ de ../../MODE-EMPLOI.md.
set -euo pipefail
MBA="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="MEGA PACK"
DOC="$MBA/../../MODE-EMPLOI.md"

# write_lisezmoi : source unique = menubar-app/build-app.sh (extraction à chaud)
# APP_VERSION = version de l'app embarquée (Luxe), pas celle de menubar-app.
APP_VERSION="$(node -p "require('$MBA/package.json').version")"
eval "$(awk '/^write_lisezmoi\(\) \{/{f=1} f{print} f&&/^\}$/{exit}' "$MBA/../menubar-app/build-app.sh")"
declare -F write_lisezmoi >/dev/null || { echo "✗ write_lisezmoi introuvable dans menubar-app/build-app.sh" >&2; exit 1; }

# hdiutil_retry : hdiutil create échoue par « Ressource occupée » quand la charge
# machine grimpe pendant la compression (VM/Docker, sauvegardes…). On réessaie
# 3 fois espacées de 60 s avant d'abandonner — la release ne doit pas mourir pour
# un pic de charge transitoire.
hdiutil_retry() { # $1 = dmg de sortie, $2… = arguments hdiutil create
  local out="$1"; shift
  local attempt=1
  until hdiutil create -volname "$APP_NAME" -srcfolder "$root" -ov -format UDZO "$out" >/dev/null 2>&1; do
    if [ "$attempt" -ge 3 ]; then
      echo "❌ hdiutil create a échoué après 3 tentatives : $out" >&2
      return 1
    fi
    echo "  ⏳ hdiutil occupé (tentative $attempt/3) — nouvel essai dans 60 s…"
    sleep 60
    attempt=$((attempt + 1))
  done
}

build_one() { # $1 = runtime (local|arm64) · $2 = nom DMG · $3 = universal ? (yes|no)
  local rt="$1" dmgname="$2" uni="${3:-no}"
  local outdir="dist/MEGA PACK-darwin-$dmgname"
  bash "$MBA/build-app.sh" --runtime "$rt" --out "$outdir/$APP_NAME.app"
  if [[ -f "$DOC" ]]; then
    cp "$DOC" "$outdir/$APP_NAME.app/Contents/Resources/MODE-EMPLOI.md"
    codesign --force --sign - "$outdir/$APP_NAME.app" >/dev/null 2>&1 || true
  fi
  local root="$outdir/dmg-root"
  rm -rf "$root"; mkdir -p "$root"
  cp -R "$outdir/$APP_NAME.app" "$root/"
  ln -s /Applications "$root/Applications"
  write_lisezmoi "$root" $([[ "$uni" == yes ]] && echo universal || echo "")
  hdiutil_retry "dist/$APP_NAME-darwin-$dmgname.dmg"
  codesign --force --sign - "dist/$APP_NAME-darwin-$dmgname.dmg" >/dev/null 2>&1 || true
  rm -rf "$root"
  echo "✅ dist/$APP_NAME-darwin-$dmgname.dmg ($(du -sh "dist/$APP_NAME-darwin-$dmgname.dmg" | cut -f1))"
}

# Universel : lipo des snapshots x64+arm64 (même logique que menubar-app/build-app.sh)
build_universal() {
  local app64="dist/MEGA PACK-darwin-x64/$APP_NAME.app"
  local appar="dist/MEGA PACK-darwin-arm64/$APP_NAME.app"
  local uni="dist/MEGA PACK.app"
  [[ -d "$app64" && -d "$appar" ]] || { echo "construis d'abord x64 + arm64" >&2; exit 1; }
  rm -rf "$uni"; cp -R "$app64" "$uni"
  local n=0
  while IFS= read -r -d '' abs; do
    rel="${abs#$app64/}"
    if lipo -create "$app64/$rel" "$appar/$rel" -output "$uni/$rel" 2>/dev/null; then n=$((n+1)); fi
  done < <(find "$app64" -type f -print0)
  echo "• lipo : $n binaires fusionnés"
  [[ "$n" -ge 10 ]] || { echo "❌ fusion universelle insuffisante ($n)" >&2; exit 1; }
  (cd "$appar" && find . -type f) | while IFS= read -r rel; do
    rel="${rel#./}"; [[ -f "$uni/$rel" ]] || cp "$appar/$rel" "$uni/$rel"
  done
  codesign --force --sign - "$uni" >/dev/null 2>&1 || true
  lipo -info "$uni/Contents/MacOS/$APP_NAME"
  local root="dist/dmg-root-universal"
  rm -rf "$root"; mkdir -p "$root"
  cp -R "$uni" "$root/"
  ln -s /Applications "$root/Applications"
  write_lisezmoi "$root" universal
  [[ -f "$DOC" ]] && cp "$DOC" "$root/$APP_NAME.app/Contents/Resources/MODE-EMPLOI.md"
  hdiutil_retry "dist/$APP_NAME-universal.dmg"
  codesign --force --sign - "dist/$APP_NAME-universal.dmg" >/dev/null 2>&1 || true
  rm -rf "$root"
  echo "✅ dist/$APP_NAME-universal.dmg ($(du -sh "dist/$APP_NAME-universal.dmg" | cut -f1))"
}

cd "$MBA"
case "${1:-all}" in
  x64)       build_one local x64 no ;;
  arm64)     build_one arm64 arm64 no ;;
  universal) build_universal ;;
  all)       build_one local x64 no
             build_one arm64 arm64 no
             build_universal ;;
  *) echo "usage : build-dmg.sh [x64|arm64|universal]" >&2; exit 1 ;;
esac

echo ""
echo "── SHA-256 ──"
for v in x64 arm64 universal; do
  f="dist/$APP_NAME-darwin-$v.dmg"; [[ "$v" == universal ]] && f="dist/$APP_NAME-universal.dmg"
  if [[ -f "$f" ]]; then printf '%s | %s | %s\n' "$(basename "$f")" "$(du -sh "$f" | cut -f1)" "$(shasum -a 256 "$f" | cut -d' ' -f1)"; fi
done
