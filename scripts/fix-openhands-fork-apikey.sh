#!/usr/bin/env bash
# fix-openhands-fork-apikey.sh — Répare les conversations OpenHands dont le fork a perdu la clé LLM
#
# Problème connu : quand une conversation OpenHands (Agent Canvas) est forkée
# (« (branch) » dans l'app), l'état figé de la copie —
# ~/.openhands/agent-canvas/conversations/<id>/base_state.json — peut perdre le
# champ `api_key` du LLM (agent + condenser) alors que le modèle et la base_url
# sont conservés. LiteLLM reçoit alors tout sauf la clé et chaque message
# échoue avec :
#   litellm.AuthenticationError: AuthenticationError: OpenAIException -
#   The api_key client option must be set either by passing api_key to the
#   client or by setting the OPENAI_API_KEY environment variable
#
# Ce script :
#   1. scanne conversations/ et conversations-archive/ pour repérer tout nœud
#      LLM (dict avec `model` + `base_url`) dont `api_key` est absente/null —
#      en ignorant les nœuds branchés sur une provider connection
#      (provider_connection_id), qui s'authentinent autrement ;
#   2. associe chaque fichier cassé au profil ~/.openhands/profiles/*.json
#      correspondant (même modèle), vérifie que le token chiffré se déchiffre
#      bien avec la clé maître (sha256 de secret-key.txt, base64) ;
#   3. en --apply : arrête le conteneur, sauvegarde chaque base_state.json
#      (suffixe horodaté, jamais écrasé), réinjecte le token chiffré du profil
#      dans tous les nœuds LLM cassés du fichier, redémarre le conteneur et
#      attend le health check (le backend peut mettre plusieurs minutes à
#      démarrer sous charge) ;
#   4. re-scanne après redémarrage : s'il reste des nœuds cassés, le script
#      échoue (exit 1).
#
# Option --set-model <id> : bascule aussi le modèle des nœuds réparés
# (utile quand le modèle d'origine est saturé côté fournisseur, ex.
# « Worker local total request limit reached » sur integrate.api.nvidia.com).
# Option --from-model <id> : avec --set-model, ne bascule que les nœuds dont
# le modèle actuel vaut <id> (les autres gardent leur modèle).
#
# Sans profil correspondant à un modèle cassé, le script utilise à titre de
# repli le LLM du settings.json global (s'il a une clé vérifiable) et le
# signale clairement — à vérifier avant --apply.
#
# Usage :
#   bash scripts/fix-openhands-fork-apikey.sh                # scan seul (dry-run)
#   bash scripts/fix-openhands-fork-apikey.sh --apply        # réparation complète
#   bash scripts/fix-openhands-fork-apikey.sh --apply --set-model openai/nvidia/nemotron-3-super-120b-a12b
#   bash scripts/fix-openhands-fork-apikey.sh --apply --no-restart  # sans redémarrer
#   bash scripts/fix-openhands-fork-apikey.sh --json         # rapport machine-readable
#
# En --json, stdout ne contient QUE l'objet JSON final (logs sur stderr) ;
# en cas d'erreur : {"ok":false,"error":"..."} + exit 1.
#
# Variables d'environnement : CONTAINER, OH_DIR (voir ci-dessous).

set -euo pipefail

CONTAINER="${CONTAINER:-openhands-canvas}"
OH_DIR="${OH_DIR:-$HOME/.openhands}"
CONV_DIR="$OH_DIR/agent-canvas/conversations"
ARCH_DIR="$OH_DIR/agent-canvas/conversations-archive"
SECRET_KEY_FILE="$OH_DIR/agent-canvas/secret-key.txt"
PROFILES_DIR="$OH_DIR/profiles"
SETTINGS_FILE="$OH_DIR/settings.json"
HEALTH_URL="${HEALTH_URL:-http://localhost:8000/health}"
APPLY=0
RESTART=1
SET_MODEL=""
FROM_MODEL=""
JSON_OUT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply) APPLY=1 ;;
    --no-restart) RESTART=0 ;;
    --json) JSON_OUT=1 ;;
    --set-model) SET_MODEL="${2:?--set-model attend un identifiant de modèle}"; shift ;;
    --from-model) FROM_MODEL="${2:?--from-model attend un identifiant de modèle}"; shift ;;
    -h|--help) sed -n '2,50p' "$0" | grep -E '^#( |$)' | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) printf '❌ option inconnue : %s (voir --help)\n' "$1" >&2; exit 2 ;;
  esac
  shift
done

if [[ $JSON_OUT -eq 1 ]]; then
  log() { printf '▸ %s\n' "$*" >&2; }
  ok()  { printf '✅ %s\n' "$*" >&2; }
else
  log() { printf '▸ %s\n' "$*"; }
  ok()  { printf '✅ %s\n' "$*"; }
fi
warn() { printf '⚠️  %s\n' "$*" >&2; }
die()  {
  printf '❌ %s\n' "$*" >&2
  if [[ $JSON_OUT -eq 1 ]] && command -v python3 >/dev/null; then
    printf '{"ok":false,"error":%s}\n' "$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$*")"
  fi
  exit 1
}

# Compose et imprime le rapport JSON final (mode --json uniquement).
compose_json() { # $1 = mode (dry-run|apply), $2 = remaining ('auto' = somme des nœuds cassés)
  python3 - "$REPORT_FILE" "$INJECT_FILE" "$1" "$2" "${FROM_MODEL:+1}" <<'PYEOF'
import json, sys
report_file, inject_file, mode, remaining, has_from_model = sys.argv[1:6]
r = json.load(open(report_file))
inject = {}
try:
    for e in json.load(open(inject_file)):
        inject[e['file']] = e
except Exception:
    pass
files = []
for b in r.get('broken_files', []):
    e = dict(b)
    ie = inject.get(b['file'])
    if mode == 'apply' and ie is not None:
        e['repaired'] = ie.get('fixed', 0) > 0
        e['set_model'] = ie.get('set_model')
    else:
        e['repaired'] = False
        e.pop('set_model', None)
    files.append(e)
if remaining == 'auto':
    remaining = sum(f['nodes'] for f in files)
out = {
    'ok': int(remaining) == 0 or has_from_model == '1',
    'mode': mode,
    'broken_file_count': r.get('broken_file_count', 0),
    'profiles_verified': r.get('profiles_verified', []),
    'invalid_profiles': r.get('invalid_profiles', []),
    'unreadable_files': r.get('unreadable_files', []),
    'files': files,
    'remaining_broken_nodes': int(remaining),
}
print(json.dumps(out, indent=2, ensure_ascii=False))
PYEOF
}

# docker n'est requis que pour arrêter/redémarrer le conteneur — le scan et
# l'injection (--apply --no-restart, dry-run) fonctionnent sans.
if [[ $APPLY -eq 1 && $RESTART -eq 1 ]]; then
  command -v docker >/dev/null || die "docker introuvable (requis pour l'arrêt/redémarrage du conteneur ; --no-restart s'en affranchit)"
  docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER" \
    || die "conteneur $CONTAINER introuvable (docker ps -a)"
fi
command -v python3 >/dev/null || die "python3 introuvable"
python3 -c 'import cryptography' 2>/dev/null || die "module python3 « cryptography » requis sur l'hôte (pip install cryptography)"
[[ -f "$SECRET_KEY_FILE" ]] || die "clé maître introuvable : $SECRET_KEY_FILE"
[[ -d "$CONV_DIR" ]] || die "dossier conversations introuvable : $CONV_DIR"

# ─── 1. Scan : conversations avec api_key manquante + profils disponibles ────
STATE_FILE=$(mktemp)
REPORT_FILE=$(mktemp)
INJECT_FILE=$(mktemp)
trap 'rm -f "$STATE_FILE" "$REPORT_FILE" "$INJECT_FILE"' EXIT

log "1/4 — scan des conversations (nœuds LLM sans api_key) + profils"
python3 - "$OH_DIR" "$STATE_FILE" "$REPORT_FILE" "$JSON_OUT" <<'PYEOF'
import base64, glob, hashlib, json, os, sys
from cryptography.fernet import Fernet, InvalidToken

oh_dir, state_file, report_file = sys.argv[1], sys.argv[2], sys.argv[3]
human = sys.stderr if sys.argv[4] == '1' else sys.stdout
conv_dir = os.path.join(oh_dir, 'agent-canvas', 'conversations')
arch_dir = os.path.join(oh_dir, 'agent-canvas', 'conversations-archive')
secret_key_file = os.path.join(oh_dir, 'agent-canvas', 'secret-key.txt')

with open(secret_key_file) as f:
    master = f.read().strip()
fernet = Fernet(base64.urlsafe_b64encode(hashlib.sha256(master.encode()).digest()))

def is_llm_node(o):
    return isinstance(o, dict) and 'model' in o and 'base_url' in o

def walk(o):
    if isinstance(o, dict):
        if is_llm_node(o):
            yield o
        else:
            for v in o.values():
                yield from walk(v)
    elif isinstance(o, list):
        for x in o:
            yield from walk(x)

def decrypt_prefix(token):
    try:
        return 'ok', fernet.decrypt(token.encode()).decode()
    except (InvalidToken, ValueError):
        return 'bad', None

# Profils : fichiers de profiles/ + LLM global du settings.json.
# Liste de candidats (jamais de dict clé=modèle : deux profils du même modèle
# ne doivent pas se masquer silencieusement — le premier VÉRIFIÉ gagne).
candidates = []
for p in glob.glob(os.path.join(oh_dir, 'profiles', '*.json')):
    try:
        d = json.load(open(p))
    except Exception:
        continue
    if isinstance(d, dict) and d.get('model') and d.get('api_key'):
        candidates.append({'model': d['model'], 'token': d['api_key'], 'source': os.path.basename(p)})
try:
    s = json.load(open(os.path.join(oh_dir, 'settings.json')))
    llm = s['agent_settings']['llm']
    if llm.get('model') and llm.get('api_key'):
        candidates.append({'model': llm['model'], 'token': llm['api_key'], 'source': 'settings.json (global)'})
except Exception:
    pass

verified = []
invalid_profiles = []
for info in candidates:
    st, pt = decrypt_prefix(info['token'])
    if st == 'ok':
        info['plaintext_prefix'] = pt[:8]
        verified.append(info)
    else:
        invalid_profiles.append({'source': info['source'], 'model': info['model']})
        print(f"   ⚠️  profil {info['source']} (modèle {info['model']}) : token illisible avec la clé maître — ignoré", file=human)

by_model = {}
for info in verified:
    by_model.setdefault(info['model'], info)

if not verified:
    print('   ❌ aucun profil avec token vérifiable — rien à réinjecter', file=human)
    sys.exit(1)

files = sorted(
    glob.glob(os.path.join(conv_dir, '*', 'base_state.json'))
    + glob.glob(os.path.join(arch_dir, '*', 'base_state.json'))
)
broken_files = 0
broken_entries = []
unreadable_files = []
found_any = False
for path in files:
    rel = os.path.relpath(path, oh_dir)
    try:
        d = json.load(open(path))
    except Exception as e:
        unreadable_files.append({'file': rel, 'error': str(e)})
        print(f"   ⚠️  illisible : {rel} ({e})", file=human)
        continue
    file_broken = []
    seen_models = set()
    for node in walk(d):
        model = node.get('model')
        if node.get('api_key'):
            continue
        if node.get('provider_connection_id'):
            continue  # auth via provider connection : autre mécanisme, pas un fork cassé
        found_any = True
        seen_models.add(model)
        file_broken.append(model)
    if not file_broken:
        continue
    broken_files += 1
    prof = None
    for m in sorted(seen_models):
        if m in by_model:
            prof = by_model[m]
            break
    exact = prof is not None
    if prof is None:
        prof = verified[0]
    src_desc = 'profil exact' if exact else f"repli : {prof['source']}"
    broken_entries.append({
        'file': rel,
        'models': sorted(seen_models),
        'nodes': len(file_broken),
        'source': prof['source'],
        'source_kind': 'exact-profile' if exact else 'fallback',
    })
    print(f"   🩹 {rel}", file=human)
    for m in sorted(seen_models):
        print(f"      modèle : {m}", file=human)
    print(f"      {len(file_broken)} nœud(s) sans clé — source : {prof['source']} ({src_desc}, clé « {prof.get('plaintext_prefix', '?')}… »)", file=human)
    with open(state_file, 'a') as sf:
        sf.write(f"{path}\t{prof['token']}\n")

if not found_any:
    print('   rien à réparer : toutes les conversations ont leur clé.', file=human)
if verified:
    print(f"   ({len(verified)} profil(s) vérifiable(s) : {', '.join(sorted(i['model'] for i in verified))})", file=human)

json.dump({
    'profiles_verified': sorted({i['model'] for i in verified}),
    'invalid_profiles': invalid_profiles,
    'unreadable_files': unreadable_files,
    'broken_file_count': broken_files,
    'broken_files': broken_entries,
}, open(report_file, 'w'), indent=2)
print(f"RÉSULTAT: {broken_files} fichier(s) à réparer", file=human, flush=True)
PYEOF
scan_ok=$?
[[ $scan_ok -eq 0 ]] || die "échec du scan"
if [[ ! -s "$STATE_FILE" ]]; then
  if [[ $JSON_OUT -eq 1 ]]; then
    compose_json "$( [[ $APPLY -eq 1 ]] && echo apply || echo dry-run )" 0
    exit 0
  fi
  ok "aucune conversation à réparer — rien à faire."
  exit 0
fi

# ─── 2. Réparation : stop → sauvegarde → injection → start ───────────────────
if [[ $APPLY -ne 1 ]]; then
  warn "dry-run : rien n'a été modifié. Relance avec --apply pour réparer $(wc -l < "$STATE_FILE" | tr -d ' ') fichier(s)."
  if [[ $JSON_OUT -eq 1 ]]; then compose_json "dry-run" auto; exit 0; fi
  exit 0
fi

if [[ $RESTART -eq 1 ]]; then
  log "2/4 — arrêt du conteneur $CONTAINER"
  docker stop "$CONTAINER" >/dev/null
else
  warn "2/4 — --no-restart : le conteneur tourne ; l'état étant caché en mémoire par le backend, la réparation ne prendra effet qu'après un redémarrage de l'app/du conteneur."
fi

log "3/4 — injection de la clé chiffrée (sauvegarde .bak-fix-apikey-<ts> par fichier)"
STAMP=$(date +%Y%m%d-%H%M%S)
python3 - "$STATE_FILE" "$STAMP" "$SET_MODEL" "$FROM_MODEL" "$OH_DIR" "$INJECT_FILE" "$JSON_OUT" <<'PYEOF'
import json, os, sys
state_file, stamp, set_model, from_model = sys.argv[1], sys.argv[2], sys.argv[3] or None, sys.argv[4] or None
oh_dir, inject_file = sys.argv[5], sys.argv[6]
human = sys.stderr if sys.argv[7] == '1' else sys.stdout
results = []

for line in open(state_file):
    line = line.rstrip('\n')
    if not line:
        continue
    path, token = line.split('\t', 1)
    backup = f"{path}.bak-fix-apikey-{stamp}"
    if os.path.exists(backup):
        print(f"   ⚠️  sauvegarde déjà présente, non écrasée : {os.path.basename(backup)}", file=human)
    else:
        with open(path) as src, open(backup, 'w') as dst:
            dst.write(src.read())

    d = json.load(open(path))

    def is_llm_node(o):
        return isinstance(o, dict) and 'model' in o and 'base_url' in o

    def walk(o):
        if isinstance(o, dict):
            if is_llm_node(o):
                yield o
            else:
                for v in o.values():
                    yield from walk(v)
        elif isinstance(o, list):
            for x in o:
                yield from walk(x)

    fixed = 0
    for node in walk(d):
        if node.get('api_key') or node.get('provider_connection_id'):
            continue
        if set_model and from_model and node.get('model') != from_model:
            continue
        if set_model:
            node['model'] = set_model
        node['api_key'] = token
        fixed += 1
    if fixed == 0:
        print(f"   — rien modifié : {os.path.relpath(path, os.path.expanduser('~'))}", file=human)
        os.remove(backup)  # sauvegarde inutile, fichier intact
        results.append({'file': os.path.relpath(path, oh_dir), 'fixed': 0, 'set_model': set_model})
        continue
    json.dump(d, open(path, 'w'), indent=2, ensure_ascii=False)
    print(f"   ✅ {os.path.relpath(path, os.path.expanduser('~'))} ({fixed} nœud(s), clé + modèle{' ' + set_model if set_model else ''})", file=human)
    results.append({'file': os.path.relpath(path, oh_dir), 'fixed': fixed, 'set_model': set_model})

json.dump(results, open(inject_file, 'w'), indent=2)
PYEOF
inject_ok=$?
[[ $inject_ok -eq 0 ]] || { [[ $RESTART -eq 1 ]] && docker start "$CONTAINER" >/dev/null 2>&1 || true; die "échec de l'injection"; }

# ─── 3. Redémarrage + health check ───────────────────────────────────────────
if [[ $RESTART -eq 1 ]]; then
  log "4/4 — redémarrage du conteneur (peut prendre plusieurs minutes sous charge)"
  docker start "$CONTAINER" >/dev/null
  HEALTH_OK=0
  for i in $(seq 1 45); do
    sleep 10
    H=$(curl -s --max-time 3 "$HEALTH_URL" 2>/dev/null || true)
    if [[ "$H" == *'"ok"'* ]]; then
      ok "health OK après ~$((i * 10)) s : $H"
      HEALTH_OK=1
      break
    fi
    printf '.' >&2
  done
  [[ $HEALTH_OK -eq 1 ]] || die "health non OK après 7 min 30 : le backend n'a pas répondu sur $HEALTH_URL (docker logs $CONTAINER pour diagnostic)"
else
  log "4/4 — --no-restart : redémarre le conteneur (docker start $CONTAINER) ou relance l'app pour appliquer la réparation."
fi

# ─── 4. Vérification finale : re-scan ────────────────────────────────────────
REMAINING=$(mktemp)
python3 - "$OH_DIR" "$REMAINING" "$JSON_OUT" <<'PYEOF' || die "échec du re-scan final"
import glob, json, os, sys
oh_dir, out = sys.argv[1], sys.argv[2]
human = sys.stderr if sys.argv[3] == '1' else sys.stdout
count = 0
for base in ('agent-canvas/conversations', 'agent-canvas/conversations-archive'):
    for path in glob.glob(os.path.join(oh_dir, base, '*', 'base_state.json')):
        try:
            d = json.load(open(path))
        except Exception:
            continue
        stack = [d]
        while stack:
            o = stack.pop()
            if isinstance(o, dict):
                if 'model' in o and 'base_url' in o and not o.get('api_key') and not o.get('provider_connection_id'):
                    count += 1
                    print(path, file=open(out, 'a'))
                stack.extend(o.values())
            elif isinstance(o, list):
                stack.extend(o)
if count:
    print(f"{count} nœud(s) cassé(s) restant(s)", file=human)
PYEOF
REMAINING_COUNT=$(wc -l < "$REMAINING" | tr -d ' ')
if [[ "$REMAINING_COUNT" -gt 0 ]]; then
  if [[ -n "$FROM_MODEL" ]]; then
    warn "des nœuds sans api_key subsistent — attendu avec --from-model : les nœuds hors filtre sont laissés tels quels."
  else
    rm -f "$REMAINING"
    die "des nœuds sans api_key subsistent après réparation — inspecte les fichiers listés ci-dessus"
  fi
fi
rm -f "$REMAINING"

if [[ $JSON_OUT -eq 1 ]]; then compose_json "apply" "$REMAINING_COUNT"; exit 0; fi
ok "Terminé. Rouvre la conversation dans OpenHands et renvoie ton message — le prochain tour part avec la clé (et le modèle) réparés."
