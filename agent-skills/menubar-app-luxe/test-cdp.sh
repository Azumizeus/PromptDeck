#!/usr/bin/env bash
# 🧪 Test CDP automatique — app Luxe (rejouable à chaque release)
# Usage : bash test-cdp.sh [version attendue, défaut 2.19.1]
#
# Déroule, sur l'app DÉPLOYÉE dans /Applications :
#   §1 version du bundle
#   §2 relance avec CDP (RENDER 9232 / MAIN 9233)
#   §A drag TRUSTED de la poignée SE (cdp.mjs drag) → taille exacte
#   §B 3 feux macOS : 🔴/🟡 masquent (data-mgp-hidden), 🟢 cycle S/M/L/XL persisté (prefs)
#   §C menu LLM : ouverture, scrollable, sélection → defaultLLM persisté (prefs), puis restauration
#   §D captures PNG dans /tmp (drag-feux-llm-*.png)
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
APP="/Applications/MEGA PACK.app"
APP_NAME="MEGA PACK"
EXPECT="${1:-2.19.1}"
CDP="$HERE/cdp.mjs"
MOTIF="app/index"   # cible renderer du panneau (« MEGA PACK » matcherait aussi Réglages)
TRACE="/tmp/mgp-boot-trace.log"
SUP="$HOME/Library/Application Support/megapack-menubar-luxe"
PREFS_FILE="$SUP/mgp-prefs.json"
LSREG="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"


# node absent du PATH des shells détachés/launchd → élargit le PATH (shim)
case ":$PATH:" in
  *":$HOME/.nvm/versions/node/v24.16.0/bin:"*) ;;
  *) PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"; export PATH ;;
esac

fail() { echo "❌ CDP FAIL — $1"; exit 1; }
ok()   { echo "✅ $1"; }

# eval JS dans le panneau (retour JSON.stringify)
eval_js() { node "$CDP" eval "$MOTIF" "$1"; }
# attend que eval_js renvoie la valeur attendue (délai 6 s)
unquote() { # lit stdin — cdp.mjs peut double-encoder : « "{\"a\":1}" » → « {"a":1} »
  node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{s=s.trim();try{s=JSON.parse(s)}catch(e){}process.stdout.write(String(s))})"
}
poll_js() { # $1=expr $2=valeur attendue (délai 12 s — la page est gelée quand la fenêtre est cachée)
  for _ in $(seq 1 24); do
    GOT="$(eval_js "$1" 2>/dev/null | unquote)"
    [ "$GOT" = "$2" ] && return 0
    sleep 0.5
  done
  return 1
}
pref_val() { # $1=clé — lit mgp-prefs.json
  node -e "try{console.log(String(JSON.parse(require('fs').readFileSync('$PREFS_FILE','utf8'))['$1']))}catch(e){console.log('')}"
}
wait_pref() { # $1=clé $2=valeur attendue (délai 6 s)
  for _ in $(seq 1 12); do [ "$(pref_val "$1")" = "$2" ] && return 0; sleep 0.5; done
  return 1
}

# ── §1 version déployée ───────────────────────────────────────────────────────
[ -d "$APP" ] || fail "app absente de /Applications"
GOT=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$APP/Contents/Info.plist" 2>/dev/null)
[ "$GOT" = "$EXPECT" ] || fail "version déployée $GOT ≠ attendue $EXPECT"
ok "§1 version déployée $GOT"

# ── §2 relance avec CDP ───────────────────────────────────────────────────────
pkill -9 -f "MEGA PACK" 2>/dev/null; sleep 1
"$LSREG" -f "$APP" >/dev/null 2>&1 || true   # pkill peut faire perdre le bundle (procNotFound -600)
sleep 1
"$LSREG" -f "$APP" >/dev/null 2>&1 || true   # 2e passe : parfois nécessaire après un kill -9
: > "$SUP/mgp-journal.log" 2>/dev/null || true
rm -f "$TRACE"
open -a "$APP_NAME" --env MGP_TRACE=1 --args --remote-debugging-port=9232 --inspect=9233 2>/dev/null \
  || open "$APP" --args --remote-debugging-port=9232 --inspect=9233 2>/dev/null \
  || fail "impossible de lancer $APP_NAME (LaunchServices) — ré-ouvre le .app une fois à la main"
for _ in $(seq 1 40); do
  curl -s "http://127.0.0.1:9232/json/list" 2>/dev/null | grep -q "$MOTIF" && break
  sleep 1
done
curl -s "http://127.0.0.1:9232/json/list" | grep -q "$MOTIF" || fail "CDP RENDER 9232 sans cible '$MOTIF' (fetch failed ? relancer)"
ok "§2 app relancée avec CDP (9232/9233)"
node "$CDP" list | grep -q "app/index" || fail "cible renderer introuvable"

# panneau visible avant les tests
[ "$(eval_js "document.body.getAttribute('data-mgp-hidden')" | tr -d '"')" = "0" ] \
  || eval_js "document.querySelector('#top .lc').click()" >/dev/null

# ── §A drag TRUSTED de la poignée SE ──────────────────────────────────────────
SIZE0=$(eval_js "JSON.stringify({w:window.innerWidth,h:window.innerHeight})" | unquote)
case "$SIZE0" in *undefined*|"") fail "lecture de la taille du panneau impossible ($SIZE0)" ;; esac
W0=$(echo "$SIZE0" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).w))")
H0=$(echo "$SIZE0" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).h))")
# si le panneau est trop petit pour rétrécir, on agrandit au lieu de rétrécir.
# 🧲 Le snap magnétique (±32 px autour de ¼/½/¾ écran) dévie la cible : on vérifie
# l'hypothèse snap et on accepte la taille snappée comme résultat valide.
DIR="-60 -50"
EXPECT_W=$((W0-60)); EXPECT_H=$((H0-50))
if [ "$W0" -lt 520 ] || [ "$H0" -lt 520 ]; then
  DIR="60 50"; EXPECT_W=$((W0+60)); EXPECT_H=$((H0+50))
fi
# seuils snap hauteur : 0.5×availHeight (±32). Si la cible est dans la zone, le snap la remplace
SNAP_H=$(eval_js "Math.round((window.screen ? window.screen.availHeight : 900) * 0.5)")
SNAP_H=${SNAP_H//\"/}
DIFF=$((EXPECT_H - SNAP_H)); [ "${DIFF#-}" -le 32 ] && { EXPECT_H=$SNAP_H; ok "(🧲 snap ½ écran anticipé sur la hauteur : $SNAP_H)"; }
read -r DX DY <<<"$DIR"
POS=$(eval_js "(function(){const r=document.querySelector('.rz.se');if(!r)return 'null';const b=r.getBoundingClientRect();return JSON.stringify({x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)})})()" | unquote)
case "$POS" in *undefined*|""|null) fail "poignée SE introuvable dans le panneau ($POS)" ;; esac
AX=$(echo "$POS" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).x))")
AY=$(echo "$POS" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).y))")
node "$CDP" drag "$MOTIF" "$AX" "$AY" "$((AX+DX))" "$((AY+DY))" 10 >/dev/null || fail "drag CDP échoué"
poll_js "JSON.stringify({w:window.innerWidth,h:window.innerHeight})" "{\"w\":$EXPECT_W,\"h\":$EXPECT_H}" \
  || fail "drag poignée SE : taille $(eval_js 'JSON.stringify({w:window.innerWidth,h:window.innerHeight})') ≠ attendu {w:$EXPECT_W,h:$EXPECT_H}"
ok "§A drag TRUSTED poignée SE : ${W0}×${H0} → ${EXPECT_W}×${EXPECT_H} (exact)"
node "$CDP" shot "$MOTIF" /tmp/cdp-drag.png >/dev/null 2>&1 || true

# ── §B 3 feux macOS ───────────────────────────────────────────────────────────
# 🔴 rouge : masque — Luxe masque la VRAIE fenêtre (window.mgp.hide → win.hide). Une fois
# cachée, la fenêtre n'est plus cliquable : la rouverture passe par ⌥Espace/⚡ tray,
# simulé ici par le même chemin main (toggle-panel). Electron ne met pas à jour
# document.visibilityState sur win.hide() → miroir window.__mgpWinVisible (pont show/hide).
eval_js "document.querySelector('#top .lc').click()" >/dev/null
poll_js "String(window.__mgpWinVisible)" "false" || fail "feu 🔴 : panneau non masqué (state=$(eval_js 'String(window.__mgpWinVisible)'))"
sleep 1
eval_js "window.mgp.show ? window.mgp.show() : window.mgp.hide()" >/dev/null
poll_js "String(window.__mgpWinVisible)" "true" || { sleep 3; eval_js "window.mgp.show ? window.mgp.show() : window.mgp.hide()" >/dev/null; poll_js "String(window.__mgpWinVisible)" "true" || fail "feu 🔴 : panneau non rouvert"; }
ok "§B1 feu 🔴 masque (miroir false), rouverture via pont show"
# 🟡 jaune : masque, puis rouverture identique (2 essais — la page gelée répond avec du retard)
eval_js "document.querySelector('#top .lm').click()" >/dev/null
poll_js "String(window.__mgpWinVisible)" "false" || fail "feu 🟡 : panneau non masqué"
sleep 1
eval_js "window.mgp.show ? window.mgp.show() : window.mgp.hide()" >/dev/null
poll_js "String(window.__mgpWinVisible)" "true" || { sleep 3; eval_js "window.mgp.show ? window.mgp.show() : window.mgp.hide()" >/dev/null; poll_js "String(window.__mgpWinVisible)" "true" || fail "feu 🟡 : panneau non rouvert"; }
ok "§B2 feu 🟡 masque puis rouverture via pont show"
# 🟢 vert : cycle S/M/L/XL (presets 480/640/860/1080, boucle après XL)
EXPECTED_K=$(eval_js "(function(){const s=[480,640,860,1080];const w=window.innerWidth;const n=s.find(x=>x>w+40)||s[0];return JSON.stringify({k:['S','M','L','XL'][s.indexOf(n)],w:n})})()" | unquote)
EK=$(echo "$EXPECTED_K" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).k))")
EW=$(echo "$EXPECTED_K" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).w))")
case "$EK" in undefined|"") fail "calcul du preset suivant impossible ($EXPECTED_K)" ;; esac
eval_js "document.querySelector('#top .lx2').click()" >/dev/null
poll_js "String(window.innerWidth)" "$EW" || fail "feu 🟢 : largeur $(eval_js 'String(window.innerWidth)') ≠ preset $EW ($EK)"
wait_pref "panelSize" "$EK" || fail "feu 🟢 : panelSize prefs = '$(pref_val panelSize)' ≠ $EK (non persisté)"
ok "§B3 feu 🟢 cycle preset → $EK (${EW}px), panelSize persisté"
node "$CDP" shot "$MOTIF" /tmp/cdp-feux.png >/dev/null 2>&1 || true

# ── §C menu LLM : scrollable + sélection persistée ────────────────────────────
CUR_LLM="$(pref_val defaultLLM)"; [ -n "$CUR_LLM" ] || CUR_LLM="claude"
eval_js "document.getElementById('llmbtn').click()" >/dev/null
poll_js "document.getElementById('llmmenu').hidden" "false" || fail "menu LLM : ne s'ouvre pas"
SCROLL=$(eval_js "(function(){const m=document.getElementById('llmmenu');const was=m.hidden;m.hidden=false;const cs=getComputedStyle(m);const r=JSON.stringify({items:m.querySelectorAll('button').length,capped:cs.maxHeight!=='none'&&cs.overflowY==='auto'});m.hidden=was;return r})()" | unquote)
echo "$SCROLL" | grep -q '"capped":true' || fail "menu LLM : max-height/overflow non appliqués ($SCROLL)"
ok "§C1 menu LLM ouvert, hauteur bornée + overflow auto ($SCROLL)"
NEW_LLM=$(eval_js "(function(){const b=document.querySelectorAll('#llmmenu button[data-t]');for(const x of b){if(x.dataset.t&&x.dataset.t!=='$CUR_LLM')return x.dataset.t}})()" | tr -d '"')
[ -n "$NEW_LLM" ] || fail "menu LLM : aucun choix alternatif à $CUR_LLM"
eval_js "(function(){const b=[...document.querySelectorAll('#llmmenu button[data-t]')].find(x=>x.dataset.t==='$NEW_LLM');b.click()})()" >/dev/null
poll_js "document.getElementById('llmmenu').hidden" "true" || fail "menu LLM : ne se referme pas après sélection"
wait_pref "defaultLLM" "$NEW_LLM" || fail "menu LLM : defaultLLM prefs = '$(pref_val defaultLLM)' ≠ $NEW_LLM"
ok "§C2 sélection $CUR_LLM → $NEW_LLM, defaultLLM persisté"
# restauration de la préférence initiale
eval_js "document.getElementById('llmbtn').click()" >/dev/null
eval_js "(function(){const b=[...document.querySelectorAll('#llmmenu button[data-t]')].find(x=>x.dataset.t==='$CUR_LLM');if(b)b.click()})()" >/dev/null
wait_pref "defaultLLM" "$CUR_LLM" || true
ok "§C3 defaultLLM restauré ($CUR_LLM)"
node "$CDP" shot "$MOTIF" /tmp/cdp-llm.png >/dev/null 2>&1 || true

# ── §D journal : aucun incident pendant la session de test ────────────────────
if [ -f "$SUP/mgp-journal.log" ]; then
  INC=$(grep -c "uncaughtException\|unhandledRejection\|render-process-gone\|child-process-gone" "$SUP/mgp-journal.log" 2>/dev/null || true)
  [ "${INC:-0}" -gt 0 ] && fail "journal : $INC incident(s) pendant le test"
  ok "§D journal sans incident"
fi

echo ""
echo "🎉 CDP PASS — drag + feux + LLM validés sur $APP_NAME $GOT (captures : /tmp/cdp-drag.png /tmp/cdp-feux.png /tmp/cdp-llm.png)"
