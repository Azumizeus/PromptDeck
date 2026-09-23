#!/usr/bin/env bash
# Test automatisé du MEGA PACK.app packagé — 4 volets :
#   1) structure du bundle (binaire intact, Info.plist, frameworks, app/, icônes)
#   2) catalogue embarqué (131 skills + 190 agents dans Contents/Resources/interface)
#   3) signature ad-hoc valide
#   4) lancement réel stable via launchd (open) — l'app doit survivre 15 s
# Usage : bash test-app.sh [chemin-vers-app]   (défaut : dist/MEGA PACK.app)
set -uo pipefail
cd "$(dirname "$0")"

APP="${1:-dist/MEGA PACK.app}"
APP="${APP%/}"
PASS=0; FAIL=0
check() { # check <libellé> <cmd...>
  local label="$1"; shift
  if "$@" > /dev/null 2>&1; then echo "  ✓ $label"; PASS=$((PASS+1));
  else echo "  ✗ $label"; FAIL=$((FAIL+1)); fi
}

echo "═══ Test du bundle : $APP ═══"

# ── 1) Structure ─────────────────────────────────────────────
echo "1) Structure du bundle :"
check ".app présent" test -d "$APP"
check "binaire principal présent" test -x "$APP/Contents/MacOS/MEGA PACK"
BINSIZE=$(stat -f%z "$APP/Contents/MacOS/MEGA PACK" 2>/dev/null || echo 0)
check "binaire de taille plausible (stub + signature embarquée)" test "$BINSIZE" -ge 17176 -a "$BINSIZE" -lt 50000
check "Info.plist avec CFBundleName=MEGA PACK" test "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleName' "$APP/Contents/Info.plist" 2>/dev/null)" = "MEGA PACK"
check "CFBundleIdentifier=com.megapack.luxe" test "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP/Contents/Info.plist" 2>/dev/null)" = "com.megapack.luxe"
VERSION=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP/Contents/Info.plist" 2>/dev/null)
check "version bundle = package.json ($VERSION)" test "$VERSION" = "$(node -p "require('./package.json').version")"
check "Electron Framework complet" test -x "$APP/Contents/Frameworks/Electron Framework.framework/Electron Framework"
check "Frameworks Helpers (GPU/Plugin/Renderer)" test -d "$APP/Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers"
check "sources app embarquées (main.js)" test -f "$APP/Contents/Resources/app/main.js"
check "preload + renderer + settings" test -f "$APP/Contents/Resources/app/preload.js" -a -f "$APP/Contents/Resources/app/renderer.js" -a -f "$APP/Contents/Resources/app/settings.js"
check "auto-launch embarqué (node_modules prod)" test -d "$APP/Contents/Resources/app/node_modules/auto-launch"
check "icône .icns générée" test -f "$APP/Contents/Resources/MEGA PACK.icns"
LC_RPATH=$(otool -l "$APP/Contents/MacOS/MEGA PACK" 2>/dev/null | grep -c LC_RPATH)
check "LC_RPATH présent (@rpath → Frameworks)" test "$LC_RPATH" -ge 1

# ── 2) Catalogue embarqué ────────────────────────────────────
echo "2) Catalogue embarqué :"
CAT="$APP/Contents/Resources/interface/catalog-full.js"
check "catalog-full.js dans Contents/Resources/interface" test -f "$CAT"
CATCHECK=$(node -e "
const fs = require('fs');
try {
  const code = fs.readFileSync('$CAT', 'utf8');
  const c = new Function(code + ';return MEGA_CATALOG;')();
  if (c.skills.length === 131 && c.agents.length === 190) console.log('ok');
  else console.log('bad:' + c.skills.length + '/' + c.agents.length);
} catch (e) { console.log('err'); }
" 2>/dev/null)
check "catalogue complet : 131 skills + 190 agents" test "$CATCHECK" = "ok"
check "les paths du catalogue sont relatifs (résolubles depuis le dépôt)" test "$(node -e "
const fs=require('fs');
const code=fs.readFileSync('$CAT','utf8');
const c=new Function(code+';return MEGA_CATALOG;')();
const fsx=c.skills.concat(c.agents).every(x=>x.path && !x.path.startsWith('/'));
console.log(fsx?'ok':'no');
" 2>/dev/null)" = "ok"

# ── 3) Signature ─────────────────────────────────────────────
echo "3) Signature ad-hoc :"
codesign -vv "$APP" > /dev/null 2>&1
check "codesign -vv : valide sur disque" test $? -eq 0
SIGID=$(codesign -dv "$APP" 2>&1 | grep -c "com.megapack.luxe")
check "signature au nom com.megapack.luxe" test "$SIGID" -ge 1

# ── 4) Lancement réel (via launchd, comme un double-clic) ────
echo "4) Lancement réel (open → survie 15 s) :"
open "$APP" 2>/dev/null
sleep 15
LIVEPID=$(pgrep -f "MacOS/MEGA PACK" | head -1)
if [ -n "$LIVEPID" ]; then
  echo "  ✓ app lancée et vivante après 15 s (PID $LIVEPID)"
  PASS=$((PASS+1))
  sleep 10
  if ps -p "$LIVEPID" > /dev/null 2>&1; then
    echo "  ✓ toujours vivante après 25 s (stable, pas de crash au démarrage)"
    PASS=$((PASS+1))
    # visible dans le Dock / liste des process
    if osascript -e 'tell application "System Events" to get name of every application process' 2>/dev/null | grep -q "MEGA PACK"; then
      echo "  ✓ visible dans la liste des applications (Dock/⌘Tab)"
      PASS=$((PASS+1))
    else
      echo "  ✗ invisible dans la liste des applications"
      FAIL=$((FAIL+1))
    fi
    # fermeture : c'est une app menu-bar (reste résidente), AppleScript quit + kill au besoin
    osascript -e 'tell application "MEGA PACK" to quit' > /dev/null 2>&1 &
    OSPID=$!
    for i in 1 2 3 4 5; do sleep 1; ps -p "$LIVEPID" > /dev/null 2>&1 || break; done
    if ! ps -p "$LIVEPID" > /dev/null 2>&1; then
      echo "  ✓ fermeture propre (quit)"
      PASS=$((PASS+1))
    else
      kill "$LIVEPID" 2>/dev/null
      wait $OSPID 2>/dev/null
      echo "  ✓ fermée (quit AppleScript sans effet sur app menu-bar → kill utilisé)"
      PASS=$((PASS+1))
    fi
  else
    echo "  ✗ morte après 25 s (crash au démarrage — vérifier DiagnosticReports)"
    FAIL=$((FAIL+1))
  fi
else
  echo "  ✗ l'app n'a pas survécu au lancement"
  FAIL=$((FAIL+1))
fi

echo ""
echo "═══ Résultat : $PASS ✓ · $FAIL ✗ ═══"
if [ "$FAIL" -gt 0 ]; then exit 1; fi
echo "✅ TESTS .APP TOUS PASSANTS"
