#!/usr/bin/env bash
# ⚡ MEGA PACK — Tous les tests en une commande : source + app packagée
#   ./test-all.sh              → tests logiques (test-fr, test-custom) + vérifs du bundle packagé
#   ./test-all.sh --skip-dmg   → sans montage du DMG universel (plus rapide)
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SKIP_DMG=0
[[ "${1:-}" == "--skip-dmg" ]] && SKIP_DMG=1

FAIL=0
section() { echo; echo "═══ $* ═══"; }
ok()   { echo "  ✓ $*"; }
bad()  { echo "  ✗ $*"; FAIL=1; }
try()  { if "$@" >/dev/null 2>&1; then ok "$*"; else bad "$*"; fi }

section "1. Syntaxe (node --check + bash -n)"
for f in main.js renderer.js preload.js settings.js test-fr.js test-custom.js test-galaxy.js build-icon.js; do
  try node --check "$f"
done
try bash -n build-app.sh

section "2. Tests logiques sur le code réel (sandbox)"
node test-fr.js  >/dev/null && ok "test-fr.js    (i18n FR + recherche bilingue)" || bad "test-fr.js"
node test-custom.js >/dev/null && ok "test-custom.js (prompts ✍️ bout en bout)" || bad "test-custom.js"
node test-galaxy.js >/dev/null && ok "test-galaxy.js (galaxie 3D + pont de commandement)" || bad "test-galaxy.js"

section "3. App packagée — fichiers critiques embarqués"
APP="dist/MEGA PACK-darwin-x64/MEGA PACK.app/Contents/Resources/app"
[[ -d "$APP" ]] || { bad "app packagée introuvable (lance ./build-app.sh)"; exit 1; }
for f in main.js renderer.js preload.js settings.html settings.js package.json build.json \
         iconTemplate.png appIcon.png; do
  [[ -f "$APP/$f" ]] && ok "$f" || bad "manquant : $f"
done
[[ -f "dist/MEGA PACK-darwin-x64/MEGA PACK.app/Contents/Resources/interface/catalog-full.js" ]] \
  && ok "catalogue embarqué (interface/catalog-full.js)" || bad "catalogue embarqué"
[[ -f "dist/MEGA PACK-darwin-x64/MEGA PACK.app/Contents/Resources/interface/mega-pack-launcher.html" ]] \
  && ok "launcher HTML embarqué" || bad "launcher HTML embarqué"

section "4. App packagée — contenu fonctionnel"
grep -q "name_fr" "$APP/renderer.js" && ok "traduction FR dans le renderer" || bad "traduction FR renderer"
grep -q "custom-save" "$APP/main.js" && ok "IPC prompts ✍️ dans le main" || bad "IPC prompts ✍️"
grep -q "desc_fr" "$APP/main.js" && ok "prompts FR localisés (menu ⚡)" || bad "prompts FR (menu)"
grep -q "return isSkill" "$APP/main.js" && bad "régression : promptFor utilise isSkill (bug #1)" || ok "promptFor corrigé (return kind)"

section "5. Signatures"
for a in x64 arm64; do
  codesign --verify --deep --strict "dist/MEGA PACK-darwin-$a/MEGA PACK.app" >/dev/null 2>&1 \
    && ok "signature $a" || bad "signature $a"
done

section "6. Architectures binaires (app + DMG universel)"
UNI="dist/MEGA PACK.app"
[[ -d "$UNI" ]] || { bad "bundle universel absent (./build-app.sh --arch both)"; FAIL=1; }
if [[ -d "$UNI" ]]; then
  # comptage sur la DESCRIPTION file -b (pas les noms de fichiers !)
  N64=$(find "dist/MEGA PACK-darwin-x64/MEGA PACK.app" -type f | while IFS= read -r f; do file -b "$f"; done | grep -c x86_64 || true)
  NAR=$(find "dist/MEGA PACK-darwin-arm64/MEGA PACK.app" -type f | while IFS= read -r f; do file -b "$f"; done | grep -c arm64 || true)
  NUNI=$(find "$UNI" -type f | while IFS= read -r f; do file -b "$f"; done | grep -c universal || true)
  echo "      binaires x86_64 (pack x64) : $N64 · arm64 (pack arm64) : $NAR · fusionnés (universel) : $NUNI"
  [[ "$NUNI" -eq "$N64" && "$NUNI" -ge 10 ]] && ok "tous les binaires Mach-O fusionnés ($NUNI/$N64)" \
    || bad "fusion incomplète : $NUNI/$N64 binaires universels"
  SNAP="Contents/Frameworks/Electron Framework.framework/Versions/A/Resources"
  [[ -f "$UNI/$SNAP/v8_context_snapshot.x86_64.bin" && -f "$UNI/$SNAP/v8_context_snapshot.arm64.bin" ]] \
    && ok "snapshots V8 des 2 archs présents (x86_64 + arm64)" || bad "snapshots V8 incomplets"
fi

section "7. DMG universel — montage + contenu"
if [[ "$SKIP_DMG" == "1" ]]; then
  echo "      (sauté : --skip-dmg)"
else
  hdiutil attach -readonly -nobrowse "dist/MEGA PACK-universal.dmg" >/dev/null
  VOL="/Volumes/MEGA PACK"
  trap 'hdiutil detach "$VOL" -quiet 2>/dev/null || true' EXIT
  for f in "MEGA PACK.app" Applications LISEZMOI.txt; do
    [[ -e "$VOL/$f" ]] && ok "$f dans le DMG" || bad "manquant dans le DMG : $f"
  done
  grep -q "v1.1.0" "$VOL/LISEZMOI.txt" && ok "LISEZMOI à jour (v1.1.0)" || bad "LISEZMOI pas à jour"
  [[ -f "$VOL/MEGA PACK.app/Contents/Resources/interface/mega-pack-launcher.html" ]] \
    && ok "launcher HTML embarqué dans le DMG" || bad "launcher absent du DMG"
  codesign --verify --deep --strict "$VOL/MEGA PACK.app" >/dev/null 2>&1 \
    && ok "signature de l'app du DMG" || bad "signature app du DMG"
  hdiutil detach "$VOL" -quiet && trap - EXIT && ok "DMG démonté"
fi

echo
if [[ "$FAIL" == "0" ]]; then echo "✅ TEST-ALL : TOUT EST VERT"; else echo "❌ TEST-ALL : DES ÉCHECS (voir ci-dessus)"; exit 1; fi
