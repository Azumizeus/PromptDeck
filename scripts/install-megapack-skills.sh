#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# install-megapack-skills.sh — Installe les skills du megapack (repo PromptDeck)
# dans le hub ~/projects (4 emplacements) + global OpenHands ~/.openhands/skills.
#
# Depuis la fusion de l'ancien layout `skill/` dans `agent-skills/skills/`, la
# source est unique : tout dossier (plat ou sous une catégorie, ex.
# skills/solana-protocols/birdeye/) contenant un SKILL.md est installé,
# dédupliqué par nom (1re occurrence dans l'ordre de tri).
# Conflits historiques résolus en amont : metaplex (variante pack dédié) et
# integrating-jupiter (skills/ du pack, pas les .plugins) ont été retenus lors
# de la fusion — ce script ne fait plus de tri de variantes.
# Idempotent : merge sans effacer, met à jour en place ce qui existe.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO/agent-skills/skills"
P="$HOME/projects"
G="$HOME/.openhands/skills"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

say() { printf '%s\n' "$*"; }
ok()  { printf '  ✓ %s\n' "$*"; }

[ -d "$SRC" ] || { say "✗ Source introuvable : $SRC"; exit 1; }
say "── Installation megapack skills (dédupliqué depuis agent-skills/skills) ──"

# 1. Collecte : tout SKILL.md à 1 ou 2 niveaux de profondeur, dédupliqué par nom
seen_list=""
while IFS= read -r f; do
  d=$(dirname "$f")
  name=$(basename "$d")
  case "$seen_list" in *" $name "*) continue ;; esac
  seen_list="$seen_list $name "
  rm -rf "$STAGE/$name"
  cp -R "$d" "$STAGE/$name"
done < <(find "$SRC" -maxdepth 3 -name SKILL.md | sort)
ok "$(printf '%s' "$seen_list" | wc -w | tr -d ' ') skills collectées"

# 2. Alignement name == dossier (OpenHands indexe par le champ name:)
RENAME="agent-dev-orchestrator:solana-rent-free-dev inco:inco-svm metengine:metengine-data-agent"
for pair in $RENAME; do
  a="${pair%%:*}"; b="${pair##*:}"
  if [ -d "$STAGE/$a" ] && [ ! -d "$STAGE/$b" ]; then mv "$STAGE/$a" "$STAGE/$b"; fi
done

# 3. Compte
N=$(find "$STAGE" -maxdepth 2 -name 'SKILL.md' | wc -l | tr -d ' ')
say "  → $N skills dédupliquées prêtes"

# 4. Déploiement : hub (4 emplacements, merge sans effacer) + global OpenHands
for d in ".openhands/skills" ".claude/skills" ".opencode/skills" ".agents/skills"; do
  mkdir -p "$P/$d"
  cp -R "$STAGE/"* "$P/$d/" 2>/dev/null || true
  say "  ✓ $P/$d → $(ls "$P/$d" | wc -l | tr -d ' ') skills"
done
mkdir -p "$G"
cp -R "$STAGE/"* "$G/" 2>/dev/null || true
say "  ✓ $G → $(ls "$G" | wc -l | tr -d ' ') skills"

say "── Terminé ──"
