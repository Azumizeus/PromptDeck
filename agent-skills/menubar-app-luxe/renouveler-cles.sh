#!/usr/bin/env bash
# 🔑 Renouvellement sécurisé des clés Groq / Mistral / Cerebras dans auth.json OpenCode.
# Usage : bash renouveler-cles.sh        (dans TON terminal — les clés ne passent jamais
#                                         par l'historique du chat ni par un fichier de log)
# - Saisie masquée (read -s) ; Entrée vide = provider ignoré (clé actuelle conservée).
# - Écrit au format OpenCode : { "provider": { "type": "api", "key": "…" } }
# - Validation réelle (requête HTTP minimale) après écriture, provider par provider.
set -u
AUTH="$HOME/.local/share/opencode/auth.json"
# Nettoyage systématique : le .staged contient les clés en clair, il ne doit jamais survivre
trap 'rm -f "${AUTH}.staged"' EXIT

[ -f "$AUTH" ] || { echo "auth.json introuvable : $AUTH"; exit 1; }
BK="${AUTH}.backup-$(date +%Y%m%d-%H%M%S)"
cp "$AUTH" "$BK" || { echo "✗ backup impossible — arrêt, rien n'est modifié"; exit 1; }
echo "💾 backup : $(basename "$BK")"

python3 - "$AUTH" <<'PY' || { echo "✗ auth.json illisible (JSON invalide ?) — arrêt"; exit 1; }
import json, sys
auth = json.load(open(sys.argv[1]))
for p in ("groq", "mistral", "cerebras"):
    auth.setdefault(p, {"type": "api"})
json.dump(auth, open(sys.argv[1] + ".staged", "w"), indent=2)
print("staging ok")
PY

for P in groq mistral cerebras; do
  case $P in
    groq)     LABEL="Groq (console.groq.com/keys)";            ENV=GROQ_API_KEY ;;
    mistral)  LABEL="Mistral (console.mistral.ai/api-keys)";   ENV=MISTRAL_API_KEY ;;
    cerebras) LABEL="Cerebras (cloud.cerebras.ai/APIKeys)";    ENV=CEREBRAS_API_KEY ;;
  esac
  echo ""
  echo "🔑 $LABEL"
  read -rsp "  Colle la clé $P (Entrée vide = ignorer) : " K; echo ""
  [ -z "$K" ] && { echo "  ↷ ignoré"; continue; }
  # Clé passée par variable d'environnement — JAMAIS en argument (argv est visible par ps)
  MGPKEY="$K" python3 - "$AUTH" "$P" <<'PY' || { echo "  ✗ échec d'enregistrement — arrêt"; exit 1; }
import json, os, sys
auth, prov = json.load(open(sys.argv[1])), sys.argv[2]
key = os.environ["MGPKEY"]
auth.setdefault(prov, {})
auth[prov] = {"type": "api", "key": key}
json.dump(auth, open(sys.argv[1] + ".staged", "w"), indent=2)
PY
  echo "  ✓ enregistrée (staged)"
done

python3 - "$AUTH" <<'PY' || { echo "✗ échec de la mise à jour finale — arrêt"; exit 1; }
import json, sys, os, shutil
src = sys.argv[1] + ".staged"
if os.path.exists(src):
    shutil.move(src, sys.argv[1])
    print("auth.json mis à jour (backup conservé)")
else:
    print("aucune modification")
PY

echo ""
echo "═══ Validation réelle ═══"
node "$(cd "$(dirname "$0")" && pwd)/test-live-cascade.js" 2>&1 | grep -E "groq|mistral|cerebras|cohere|gemini|PASS|FAIL"
