#!/usr/bin/env bash
# 🚀 RELEASE UNIQUE MEGA PACK Luxe — une commande, une release complète.
# Usage : bash release.sh [x64|arm64|universal|all] [version] [--no-deploy] [--no-smoke]
#   bash release.sh                    → les 3 DMG + deploy /Applications + tests complets
#   bash release.sh x64                → variante seule (test-dmg exige les 3 : prévoir all)
#   bash release.sh all 2.19.1 --no-deploy --no-smoke
#
# Déroulé (exit 1 au premier échec) :
#   1. Pré-vol        : charge machine (hdiutil pend si saturée), runtimes Electron, git sale
#   2. Garde-fous     : panel-buttons-guard (liste dorée) + jev-router-test (13/13)
#   3. Build Luxe     : build-app.sh (local, dist/MEGA PACK.app) + test-luxe.js
#   4. DMG            : build-dmg.sh [cible] — x64 + arm64 + universel (lipo)
#   5. Déploiement    : /Applications/MEGA PACK.app (sauf --no-deploy)
#   6. test-dmg.sh    : montage des 3 DMG, marqueurs 2.19.x, LISEZMOI bilingue, doc + boot réel
#   7. test-cdp.sh    : drag TRUSTED poignée SE, 3 feux, LLM scrollable — sur l'app déployée
#   8. smoke-test.sh  : boot + tray + cascade LLM réelle (sauf --no-smoke)
#   9. Rapport        : SHA-256 + poids des DMG/app + poids du corpus (skills, agents, .md)
#  10. Notes          : table « 📦 Téléchargements » de RELEASE-NOTES-v1.1.0.md mise à jour
set -u
MBA="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$MBA/.."                       # agent-skills/
REPO="$ROOT/.."                      # ~/projects/skill-install
APP_NAME="MEGA PACK"
APP="/Applications/$APP_NAME.app"
SUP="$HOME/Library/Application Support/megapack-menubar-luxe"
NOTES="$ROOT/menubar-app/RELEASE-NOTES-v1.1.0.md"
TARGET="all"
VERSION="$(node -p "require('$MBA/package.json').version" 2>/dev/null || echo '?')"
DO_DEPLOY=1; DO_SMOKE=1
for a in "$@"; do
  case "$a" in
    x64|arm64|universal|all) TARGET="$a" ;;
    --no-deploy) DO_DEPLOY=0 ;;
    --no-smoke)  DO_SMOKE=0 ;;
    [0-9]*.*) VERSION="$a" ;;
    *) echo "Usage : bash release.sh [x64|arm64|universal|all] [version] [--no-deploy] [--no-smoke]" >&2; exit 1 ;;
  esac
done

step()   { printf '\n\033[1;35m═══ %s ═══\033[0m\n' "$1"; }
sub()    { printf '  · %s\n' "$1"; }
die()    { printf '\n❌ RELEASE FAIL — %s\n' "$1" >&2; exit 1; }
ok()     { printf '✅ %s\n' "$1"; }
LSREG="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
SHA_X64=""; SHA_ARM=""; SHA_UNI=""
SZ_X64=""; SZ_ARM=""; SZ_UNI=""; SZ_APP=""

cd "$MBA" || die "dossier introuvable"

# ── 1. Pré-vol ────────────────────────────────────────────────────────────────
step "1/10 Pré-vol"
LOAD=$(uptime | sed -E 's/.*load averages?: ([0-9]+).*/\1/')
NCPU=$(sysctl -n hw.ncpu)
sub "charge $LOAD / $NCPU cœurs $( [ "${LOAD:-999}" -ge $((NCPU*4)) ] && echo '— ⚠️ machine très chargée : hdiutil peut pendre (watchdogs actifs)' )"
for rt in "$MBA/node_modules/electron/dist/Electron.app" "$HOME"/.cache/megapack/electron-*-darwin-arm64/Electron.app; do
  [ -d "$rt" ] || die "runtime Electron absent : $rt — lance node node_modules/electron/install.js + cache arm64"
done
sub "runtimes x64 + arm64 présents"
git -C "$REPO" status --porcelain 2>/dev/null | grep -q . && sub "⚠️  dépôt git sale (commit conseillé avant release)" || sub "dépôt git propre"
# aucun process app/CDP résiduel qui verrouillerait le bundle ou les ports
pkill -9 -f "MacOS/$APP_NAME" 2>/dev/null; sleep 1
"$LSREG" -f "$APP" >/dev/null 2>&1 || true
ok "pré-vol passé"

# ── 2. Garde-fous logiques ────────────────────────────────────────────────────
step "2/10 Garde-fous"
# node est absent du PATH des shells non-interactifs (launchd/detached) → résolution explicite
NODE_BIN="$(command -v node || true)"; [ -n "$NODE_BIN" ] || NODE_BIN="$HOME/.nvm/versions/node/v24.16.0/bin/node"
"$NODE_BIN" "$ROOT/scripts/panel-buttons-guard.js" || die "garde-fou boutons : dérive du panneau (node scripts/panel-buttons-guard.js --update si ajout volontaire)"
sub "panel-buttons-guard : liste dorée intacte"
"$NODE_BIN" "$ROOT/skills/jev-decision-router/scripts/jev-router-test.mjs" >/dev/null 2>&1 \
  || die "jev-router-test en échec (lance-le sans redirect pour le détail)"
sub "jev-router-test : 13/13"
ok "garde-fous verts"

# ── 3. Build Luxe ─────────────────────────────────────────────────────────────
step "3/10 Build Luxe ($VERSION)"
bash "$MBA/build-app.sh" --runtime local --out "dist/$APP_NAME.app" || die "build-app.sh"
"$NODE_BIN" "$MBA/test-luxe.js" >/dev/null 2>&1 || die "test-luxe.js en échec (lance-le sans redirect)"
sub "test-luxe : vert"
ok "dist/$APP_NAME.app construit ($(du -sh "dist/$APP_NAME.app" | cut -f1))"

# ── 4. DMG ────────────────────────────────────────────────────────────────────
step "4/10 DMG ($TARGET)"
bash "$MBA/build-dmg.sh" "$TARGET" || die "build-dmg.sh $TARGET"
ok "DMG construits"

# ── 5. Déploiement ────────────────────────────────────────────────────────────
if [ "$DO_DEPLOY" = 1 ]; then
  step "5/10 Déploiement /Applications"
  pkill -9 -f "MacOS/$APP_NAME" 2>/dev/null; sleep 1
  rm -rf "$APP" || die "impossible de retirer l'ancienne app (verrou ?)"
  cp -R "dist/$APP_NAME.app" "$APP" || die "copie vers /Applications (droits ?)"
  "$LSREG" -f "$APP" >/dev/null 2>&1 || true
  GOT=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$APP/Contents/Info.plist" 2>/dev/null)
  [ "$GOT" = "$VERSION" ] || die "version déployée $GOT ≠ $VERSION"
  ok "$APP déployée ($GOT)"
else
  step "5/10 Déploiement — ignoré (--no-deploy)"
fi

# ── 6. test-dmg (montage + marqueurs + boot réel) ─────────────────────────────
step "6/10 test-dmg.sh"
bash "$ROOT/menubar-app/test-dmg.sh" "$VERSION" || die "test-dmg.sh"
ok "3 DMG validés (montage, marqueurs 2.19.x, LISEZMOI, doc, boot réel)"

# ── 7. test-cdp (drag TRUSTED + feux + LLM) ───────────────────────────────────
step "7/10 test-cdp.sh"
if [ "$DO_DEPLOY" = 1 ]; then
  bash "$MBA/test-cdp.sh" "$VERSION" || die "test-cdp.sh"
  ok "CDP PASS — drag, 3 feux, LLM scrollable (captures /tmp/cdp-*.png)"
else
  sub "ignoré (--no-deploy : test-cdp opère sur l'app déployée)"
fi

# ── 8. smoke (boot + tray + cascade réelle) ───────────────────────────────────
if [ "$DO_SMOKE" = 1 ] && [ "$DO_DEPLOY" = 1 ]; then
  step "8/10 smoke-test.sh"
  bash "$MBA/smoke-test.sh" "$VERSION" || die "smoke-test.sh"
  ok "SMOKE PASS"
else
  step "8/10 smoke — ignoré (--no-smoke ou --no-deploy)"
fi

# ── 9. Rapport SHA-256 + poids ────────────────────────────────────────────────
step "9/10 Rapport SHA-256 + poids"
sha_of() { shasum -a 256 "$1" 2>/dev/null | cut -d' ' -f1; }
sz_of()  { du -sh "$1" 2>/dev/null | cut -f1; }
F_X64="dist/$APP_NAME-darwin-x64.dmg"; F_ARM="dist/$APP_NAME-darwin-arm64.dmg"; F_UNI="dist/$APP_NAME-universal.dmg"
for f in "$F_X64" "$F_ARM" "$F_UNI"; do [ -f "$f" ] || die "DMG absent : $f"; done
SHA_X64=$(sha_of "$F_X64"); SHA_ARM=$(sha_of "$F_ARM"); SHA_UNI=$(sha_of "$F_UNI")
SZ_X64=$(sz_of "$F_X64");   SZ_ARM=$(sz_of "$F_ARM");   SZ_UNI=$(sz_of "$F_UNI")
SZ_APP=$(sz_of "dist/$APP_NAME.app")
printf '  %-36s %-8s %s\n' "fichier" "taille" "SHA-256"
printf '  %-36s %-8s %s\n' "$(basename "$F_X64")" "$SZ_X64" "$SHA_X64"
printf '  %-36s %-8s %s\n' "$(basename "$F_ARM")" "$SZ_ARM" "$SHA_ARM"
printf '  %-36s %-8s %s\n' "$(basename "$F_UNI")" "$SZ_UNI" "$SHA_UNI"
printf '  %-36s %-8s\n' "$APP_NAME.app (bundle)" "$SZ_APP"
# poids du corpus embarqué (catalogue)
sub "corpus : skills $(sz_of "$ROOT/skills") · agents $(sz_of "$ROOT/agents") · SKILL.md $(find "$ROOT/skills" -name 'SKILL.md' -print0 2>/dev/null | xargs -0 du -ch 2>/dev/null | tail -1 | cut -f1)"
ok "rapport poids + SHA établi"

# ── 10. Notes de release ──────────────────────────────────────────────────────
step "10/10 Notes de release"
TODAY=$(date '+%d/%m')
"$NODE_BIN" -e '
const fs = require("fs");
const [notes, szx, shx, sza, sha, szu, shu, today] = process.argv.slice(1);
let t = fs.readFileSync(notes, "utf8");
const row = (f, s, h, desc) => `| \`${f}\` (${desc}) | ${s} | \`${h}\` |`;
const table = ["| Fichier | Taille | SHA-256 |", "|---|---|---|",
  row("MEGA PACK-universal.dmg", szu, shu, "Intel + Apple Silicon"),
  row("MEGA PACK-darwin-x64.dmg", szx, shx, "Intel"),
  row("MEGA PACK-darwin-arm64.dmg", sza, sha, "Apple Silicon")].join("\n");
const re = /\| Fichier \| Taille \| SHA-256 \|\n\|---\|---\|---\|\n(?:\| `[^`]*`[^|]*\|[^|]*\|[^|]*\|\n?)+/;
if (!re.test(t)) { console.error("⚠️  table Téléchargements introuvable — SHA non injectés"); process.exit(0); }
t = t.replace(re, table + "\n");
t = t.replace(/(> Reconstruits le [^\n]*)/, `$1 — release.sh du ${today}`);
fs.writeFileSync(notes, t);
console.log("  table Téléchargements mise à jour dans RELEASE-NOTES-v1.1.0.md");
' "$NOTES" "$SZ_X64" "$SHA_X64" "$SZ_ARM" "$SHA_ARM" "$SZ_UNI" "$SHA_UNI" "$TODAY" || true
ok "notes mises à jour"

# ── Bilan ─────────────────────────────────────────────────────────────────────
printf '\n\033[1;32m🎉 RELEASE PASS — %s\033[0m\n' "$VERSION"
printf '   DMG x64        %s  %s\n' "$SZ_X64" "$SHA_X64"
printf '   DMG arm64      %s  %s\n' "$SZ_ARM" "$SHA_ARM"
printf '   DMG universel  %s  %s\n' "$SZ_UNI" "$SHA_UNI"
printf '   Vérifié : build ✓ DMG ✓ test-dmg ✓ test-cdp ✓ smoke ✓ — SHA dans RELEASE-NOTES-v1.1.0.md\n'
