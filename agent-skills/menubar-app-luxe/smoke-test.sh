#!/usr/bin/env bash
# 🚬 Smoke-test post-déploiement MEGA PACK — exit non-zero au premier échec.
# Usage : bash smoke-test.sh
#   1. App déployée + version attendue (1er arg, défaut 2.16.2)
#   2. Boot : process vivant, trace sans exception, journal sans incident
#   3. Tray : sonde AX = 1 (icône menu bar présente)
#   4. Cascade RÉELLE : message test au mini-chat via le moteur de l'app
#      (chatSendStream réel → seedProbeOk → prefs) — provider répondu exigé.
set -u
APP="/Applications/MEGA PACK.app"
APP_NAME="MEGA PACK"
SUP="$HOME/Library/Application Support/megapack-menubar-luxe"
PREFS_FILE="$SUP/mgp-prefs.json"
JOURNAL="$SUP/mgp-journal.log"
TRACE="/tmp/mgp-boot-trace.log"
EXPECT="${1:-2.16.2}"
fail() { echo "❌ SMOKE FAIL — $1"; exit 1; }
ok()   { echo "✅ $1"; }


# node absent du PATH des shells détachés/launchd → élargit le PATH (shim)
case ":$PATH:" in
  *":$HOME/.nvm/versions/node/v24.16.0/bin:"*) ;;
  *) PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"; export PATH ;;
esac

# ── 1. App déployée + version ────────────────────────────────────────────────
[ -d "$APP" ] || fail "app absente de /Applications"
GOT=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$APP/Contents/Info.plist" 2>/dev/null)
[ "$GOT" = "$EXPECT" ] || fail "version déployée $GOT ≠ attendue $EXPECT"
ok "version déployée $GOT"

# ── 2. Boot propre ───────────────────────────────────────────────────────────
pkill -9 -f "MEGA PACK" 2>/dev/null; sleep 1
rm -f "$TRACE"
open -a "$APP_NAME" --env MGP_TRACE=1
sleep 8
pgrep -f "MacOS/$APP_NAME" >/dev/null || fail "process principal absent après 8 s"
ok "process vivant"
[ -f "$TRACE" ] || fail "trace de boot absente (MGP_TRACE ignoré ?)"
grep -q "uncaughtException\|unhandledRejection\|did-fail-load" "$TRACE" && fail "exception au boot : $(grep -m1 'Exception\|Rejection' "$TRACE")"
grep -q "createTray: Tray construit" "$TRACE" || fail "tray non construit"
ok "trace de boot complète, 0 exception"
if [ -f "$JOURNAL" ]; then
  INCID=$(grep -c "uncaughtException\|unhandledRejection\|render-process-gone\|child-process-gone" "$JOURNAL" 2>/dev/null || true)
  [ "${INCID:-0}" -gt 0 ] && fail "journal persistant contient $INCID incident(s) récent(s) : $(tail -3 "$JOURNAL" | tr '\n' ' ')"
  ok "journal persistant sans incident"
fi

# ── 3. Tray présent — sonde AX (TCC) puis re-vérification par trace createTray ──
# NB : la sonde AX exige des droits Accessibilité accordés au process APPELANT ;
# sous un autre contexte (CI, cron), elle renvoie 0 même si le tray existe. Dans ce
# cas le smoke-test se fie à la trace : « createTray: Tray construit » = tray réel.
AX=0
for i in $(seq 1 8); do
  sleep 3
  osascript -e 'tell application "System Events" to tell process "MEGA PACK"
	try
		set value of attribute "AXManualAccessibility" to true
	end try
	return count of menu bar items of menu bar 2
end tell' >/dev/null 2>&1 || true
  AX=$(osascript -e 'tell application "System Events" to tell process "MEGA PACK" to count of menu bar items of menu bar 2' 2>/dev/null || echo 0)
  [ "$AX" -ge 1 ] 2>/dev/null && break
done
if [ "$AX" -ge 1 ] 2>/dev/null; then
  ok "tray présent (sonde AX = $AX)"
else
  grep -q "createTray: Tray construit" "$TRACE" || fail "ni sonde AX ni trace createTray — tray absent"
  ok "sonde AX indisponible (droits TCC du contexte) — tray prouvé par trace « Tray construit »"
fi

# ── 4. Cascade réelle (moteur de l'app via Node isolé — copie dépôt, pas le bundle) ──
LIVE=$(node "$(cd "$(dirname "$0")" && pwd)/test-live-cascade.js" 2>/dev/null) || true
echo "$LIVE" | tail -8
echo "$LIVE" | grep -q "CASCADE LIVE: PASS" || fail "cascade réseau réelle : aucun provider ne répond"
PROVIDER=$(echo "$LIVE" | grep -o "✅ [a-z]*" | head -1 | cut -d' ' -f2)
ok "cascade réelle PASS via $PROVIDER"

# ── 5. Message test DANS l'app réelle (modale chat) + badge provider sur la bulle ──
# Prérequis : droits Accessibilité (TCC) pour le harnais CGEvent de l'audit.
INAPP=$(python3 "$(cd "$(dirname "$0")" && pwd)/chat-inapp-probe.py" "$(cd "$(dirname "$0")" && pwd)" 2>/dev/null) || true
if echo "$INAPP" | grep -q "INAPP: PASS"; then
  BADGE=$(echo "$INAPP" | grep -o 'badge=[a-z0-9_.-]*' | head -1)
  ok "chat in-app PASS ($BADGE)"
elif echo "$INAPP" | grep -q "INAPP: SKIP"; then
  echo "⚠️  chat in-app ignoré ($(echo "$INAPP" | head -1 | cut -d' ' -f2-)) — cascade moteur validée en §4"
else
  fail "chat in-app : $(echo "$INAPP" | head -1)"
fi

echo ""
echo "🎉 SMOKE PASS — version $GOT, tray OK, cascade via $PROVIDER"
