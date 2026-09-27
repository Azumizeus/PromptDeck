#!/usr/bin/env bash
# 📦 Validation d'installation des DMG Luxe — rejouable à chaque release.
# Usage : bash test-dmg.sh [version attendue, défaut 2.19.1]
#
#   §1 Chaque DMG Luxe (menubar-app-luxe/dist) : montage readonly →
#      CFBundleShortVersionString = attendue, marqueurs 2.19.x dans le bundle
#      (panelGeometry, feux, presets), LISEZMOI.txt bilingue, MODE-EMPLOI.md à jour
#   §2 Boot réel de la variante adaptée à cette machine : copie dans /tmp,
#      lsregister, lancement MGP_TRACE=1, process vivant, trace sans exception,
#      tray construit, puis arrêt propre.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="MEGA PACK"
EXPECT="${1:-2.19.1}"
DIST="$HERE/../menubar-app-luxe/dist"
LSREG="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
TRACE="/tmp/mgp-boot-trace.log"

fail() { echo "❌ DMG FAIL — $1"; exit 1; }
ok()   { echo "✅ $1"; }
ver_of() { /usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$1/Contents/Info.plist" 2>/dev/null || echo '?'; }
attach_dmg() { # $1=dmg $2=mountpoint — hdiutil parfois pendeur (agent diskimages) : 2 tentatives, watchdog 60 s
  local try pid i rc
  for try in 1 2; do
    hdiutil attach -readonly -nobrowse -mountpoint "$2" "$1" >/dev/null 2>&1 &
    pid=$!; i=0; rc=1
    while kill -0 $pid 2>/dev/null; do
      i=$((i+1)); if [ $i -gt 60 ]; then kill -9 $pid 2>/dev/null; break; fi
      sleep 1
    done
    wait $pid 2>/dev/null; rc=$?
    [ -d "$2/$APP_NAME.app" ] && return 0   # succès : le point de montage contient l'app
    hdiutil detach "$2" >/dev/null 2>&1 || true
    sleep 3
  done
  return 1
}

# ── §1 chaque DMG : montage, version, LISEZMOI bilingue, doc synchronisée ──────
MNT="$(mktemp -d /tmp/mgp-testdmg.XXXXXX)"
for f in "$DIST/$APP_NAME-darwin-x64.dmg" "$DIST/$APP_NAME-darwin-arm64.dmg" "$DIST/$APP_NAME-universal.dmg"; do
  [ -f "$f" ] || fail "DMG absent : $f"
  attach_dmg "$f" "$MNT" || fail "montage impossible (>90 s ou erreur) : $(basename "$f")"
  V="$(ver_of "$MNT/$APP_NAME.app")"
  [ "$V" = "$EXPECT" ] || fail "$(basename "$f") : version bundle $V ≠ $EXPECT"
  RES="$MNT/$APP_NAME.app/Contents/Resources"
  MK=0; grep -rql "panelGeometry" "$RES/app/main.js" "$RES/app/preload.js" 2>/dev/null && MK=$((MK+1))
  grep -q "light lc" "$RES/app/renderer.js" 2>/dev/null && MK=$((MK+1))
  grep -q "rzCyclePreset" "$RES/app/renderer.js" 2>/dev/null && MK=$((MK+1))
  [ "$MK" = "3" ] || fail "$(basename "$f") : marqueurs Luxe 2.19.x manquants ($MK/3 : resize IPC, feux, presets)"
  LZ="$MNT/LISEZMOI.txt"
  [ -f "$LZ" ] || fail "$(basename "$f") : LISEZMOI.txt absent"
  grep -q "═══════════════ FRANÇAIS ═══════════════" "$LZ" || fail "$(basename "$f") : LISEZMOI sans section FR"
  grep -q "═══════════════ ENGLISH ═══════════════" "$LZ" || fail "$(basename "$f") : LISEZMOI sans section EN"
  grep -q "Correctifs 2.19.x" "$LZ" || fail "$(basename "$f") : LISEZMOI sans correctifs 2.19.x"
  DOC="$RES/MODE-EMPLOI.md"
  [ -f "$DOC" ] || fail "$(basename "$f") : MODE-EMPLOI.md non embarqué"
  grep -q "mémo fenêtre (correctifs 2.19.x)" "$DOC" || fail "$(basename "$f") : doc ⌘⌥/ non synchronisée"
  ok "$(basename "$f") : app $EXPECT, marqueurs 2.19.x 3/3, LISEZMOI bilingue, doc à jour"
  hdiutil detach "$MNT" >/dev/null
done
rmdir "$MNT" 2>/dev/null || true

# ── §2 boot réel de la variante adaptée à cette machine ────────────────────────
ARCH_MAC="$(uname -m)"; [ "$ARCH_MAC" = "arm64" ] && DMG="$DIST/$APP_NAME-darwin-arm64.dmg" || DMG="$DIST/$APP_NAME-darwin-x64.dmg"
echo "— boot réel depuis $(basename "$DMG") —"
MNT="$(mktemp -d /tmp/mgp-testdmg.XXXXXX)"
attach_dmg "$DMG" "$MNT" || fail "montage boot impossible (>90 s ou erreur)"
BOOTDIR="$(mktemp -d /tmp/mgp-boot.XXXXXX)"
BOOT="$BOOTDIR/$APP_NAME.app"
rm -rf "$BOOT"
cp -R "$MNT/$APP_NAME.app" "$BOOT"
hdiutil detach "$MNT" >/dev/null
rmdir "$MNT" 2>/dev/null || true

pkill -9 -f "$APP_NAME" 2>/dev/null; sleep 1   # pattern large : copie /tmp incluse (lock singleton)
rm -rf /tmp/mgp-boot.* 2>/dev/null || true
"$LSREG" -f "$BOOT" >/dev/null 2>&1 || true
: > "$HOME/Library/Application Support/megapack-menubar-luxe/mgp-journal.log" 2>/dev/null || true
rm -f "$TRACE"
MGP_TRACE=1 "$BOOT/Contents/MacOS/$APP_NAME" >/dev/null 2>&1 &
sleep 12
pgrep -f "MacOS/$APP_NAME" >/dev/null || fail "copie DMG : process absent après 12 s (trace : $(tail -2 "$TRACE" 2>/dev/null | tr '\n' ' '))"
ok "copie DMG lancée, process vivant"
[ -f "$TRACE" ] || fail "trace absente (MGP_TRACE ignoré)"
grep -q "uncaughtException\|unhandledRejection\|did-fail-load" "$TRACE" && fail "exception au boot : $(grep -m1 'Exception\|Rejection' "$TRACE")"
grep -q "createTray: Tray construit" "$TRACE" || fail "tray non construit"
ok "trace de boot complète, tray construit"

pkill -f "MacOS/$APP_NAME" 2>/dev/null || true
sleep 1
rm -rf "$BOOTDIR"
echo ""
echo "🎉 DMG PASS — 3 DMG validés (version $EXPECT, marqueurs 2.19.x, LISEZMOI bilingue, doc ⌘⌥/) + boot réel OK"
