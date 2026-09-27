#!/usr/bin/env bash
# ♻️ Repack des DMG existants : met à jour LISEZMOI.txt (bilingue, même write_lisezmoi
# que build-app.sh, extrait à chaud) et le guide MODE-EMPLOI.md embarqué — SANS rebuild.
# Usage : bash repack-dmg.sh [x64|arm64|universal]   (un seul DMG par invocation ; sans
# argument : les trois à la suite)
set -euo pipefail
MBA="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="MEGA PACK"
APP_VERSION="$(node -p "require('$MBA/package.json').version")"
DOC="$MBA/../../MODE-EMPLOI.md"

# write_lisezmoi : source unique = build-app.sh (extraction de la fonction à chaud)
eval "$(awk '/^write_lisezmoi\(\) \{/{f=1} f{print} f&&/^\}$/{exit}' "$MBA/build-app.sh")"
declare -F write_lisezmoi >/dev/null || { echo "✗ write_lisezmoi introuvable dans build-app.sh" >&2; exit 1; }
[[ -f "$DOC" ]] || { echo "⚠️  MODE-EMPLOI.md introuvable à $DOC — le guide embarqué restera inchangé" >&2; }

cleanup() { # montages/stages orphelins d'une exécution interrompue
  local m
  for m in /tmp/mgp-dmg.*; do
    [[ -d "$m" ]] && hdiutil detach "$m" >/dev/null 2>&1 || true
  done
  rm -rf /tmp/mgp-dmg.* /tmp/mgp-stage.* 2>/dev/null || true
}

repack_one() { # $1 = chemin DMG · $2 = yes pour la variante universelle
  local dmg="$1" uni="${2:-no}"
  [[ -f "$dmg" ]] || { echo "⚠️  absent : $dmg — ignoré"; return 0; }
  local mnt stage ver
  mnt="$(mktemp -d /tmp/mgp-dmg.XXXXXX)"
  stage="$(mktemp -d /tmp/mgp-stage.XXXXXX)"
  echo "▸ $(basename "$dmg") : montage…"
  hdiutil attach -readonly -nobrowse -mountpoint "$mnt" "$dmg" >/dev/null
  cp -R "$mnt/$APP_NAME.app" "$stage/"
  ln -s /Applications "$stage/Applications"
  hdiutil detach "$mnt" >/dev/null
  rmdir "$mnt" 2>/dev/null || true
  write_lisezmoi "$stage" $([[ "$uni" == yes ]] && echo universal || echo "")
  if [[ -f "$DOC" ]]; then
    cp "$DOC" "$stage/$APP_NAME.app/Contents/Resources/MODE-EMPLOI.md"
  fi
  ver="$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$stage/$APP_NAME.app/Contents/Info.plist" 2>/dev/null || echo '?')"
  echo "▸ app $ver : re-signature ad-hoc (non-deep, ressources du bundle racine seulement)…"
  codesign --force --sign - "$stage/$APP_NAME.app" >/dev/null 2>&1 || echo "⚠️  re-signature échouée (non bloquant)"
  echo "▸ création du DMG…"
  hdiutil create -volname "$APP_NAME" -srcfolder "$stage" -ov -format UDZO "$stage.dmg" >/dev/null
  codesign --force --sign - "$stage.dmg" >/dev/null 2>&1 || true
  mv "$stage.dmg" "$dmg"
  rm -rf "$stage"
  echo "✅ $(basename "$dmg") repacké (app $ver, LISEZMOI bilingue + doc à jour)"
}

cd "$MBA"
cleanup
case "${1:-all}" in
  x64)       repack_one "dist/$APP_NAME-darwin-x64.dmg" no ;;
  arm64)     repack_one "dist/$APP_NAME-darwin-arm64.dmg" no ;;
  universal) repack_one "dist/$APP_NAME-universal.dmg" yes ;;
  all)       repack_one "dist/$APP_NAME-darwin-x64.dmg" no
             repack_one "dist/$APP_NAME-darwin-arm64.dmg" no
             repack_one "dist/$APP_NAME-universal.dmg" yes ;;
  *) echo "usage : repack-dmg.sh [x64|arm64|universal]" >&2; exit 1 ;;
esac

echo ""
echo "── SHA-256 à reporter dans RELEASE-NOTES-v1.1.0.md ──"
for v in x64 arm64 universal; do
  f="dist/$APP_NAME-darwin-$v.dmg"; [[ "$v" == universal ]] && f="dist/$APP_NAME-universal.dmg"
  [[ -f "$f" ]] && printf '%s | %s | %s\n' "$(basename "$f")" "$(du -sh "$f" | cut -f1)" "$(shasum -a 256 "$f" | cut -d' ' -f1)"
done
