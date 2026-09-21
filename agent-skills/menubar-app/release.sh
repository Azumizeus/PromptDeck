#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  PromptDeck — release.sh : publie une release GitHub complète en une commande
#
#  Usage :
#    ./release.sh                    # prépare tout + affiche la commande gh finale
#    ./release.sh --create           # prépare tout + EXÉCUTE la publication (gh requis)
#    ./release.sh --dry-run          # liste seulement ce qui serait fait
#    ./release.sh --skip-dmg-check   # n'exige pas que les DMG existent (pour test du script)
#
#  Ce que fait le script :
#    1. Vérifie la version (package.json = tag git = CHANGELOG)
#    2. Zippe les 3 DMG (x64 / arm64 / universel) dans dist/release/
#    3. Génère release-notes-<version>.md depuis CHANGELOG.md
#    4. Prépare (ou exécute avec --create) :
#         gh release create v<version> <assets...> --title --notes
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

cd "$(dirname "$0")"
APP_DIR="$PWD"
DIST="$APP_DIR/dist"
RELEASE_DIR="$DIST/release"
VERSION=$(grep '"version"' package.json | head -1 | sed 's/[^0-9.]//g')
CHANGELOG="$APP_DIR/../../CHANGELOG.md"   # à la racine du dépôt (visible sur GitHub)
CREATE=0
DRY_RUN=0
SKIP_DMG=0

for arg in "$@"; do
  case "$arg" in
    --create) CREATE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --skip-dmg-check) SKIP_DMG=1 ;;
    *) echo "Argument inconnu : $arg"; exit 2 ;;
  esac
done

log() { printf '\033[1;35m⚡\033[0m %s\n' "$1"; }
ok()  { printf '\033[1;32m✓\033[0m %s\n' "$1"; }
die() { printf '\033[1;31m✗\033[0m %s\n' "$1" >&2; exit 1; }

[[ -f "$CHANGELOG" ]] || die "CHANGELOG.md introuvable à la racine du dépôt (../../CHANGELOG.md)"
[[ -n "$VERSION" ]] || die "Version illisible dans package.json"

# ── 1. Cohérence des versions ──────────────────────────────────────────────
log "Version détectée : $VERSION"

if git -C "$APP_DIR/../.." rev-parse "v$VERSION" >/dev/null 2>&1; then
  ok "Tag git v$VERSION existe (point d'ancrage de la release)"
else
  die "Tag v$VERSION absent — crée-le d'abord (voir README: Tague la v$VERSION)"
fi

grep -q "^## \[$VERSION\]" "$CHANGELOG" || die "CHANGELOG.md : pas de section [[$VERSION]]"
ok "Section CHANGELOG [$VERSION] trouvée"

# ── 2. DMG → zip ──────────────────────────────────────────────────────────
if [[ $SKIP_DMG -eq 0 ]]; then
  mkdir -p "$RELEASE_DIR"
  SHIPPED=0
  for arch in x64 arm64 universal; do
    dmg=$(find "$DIST" -maxdepth 1 -name "MEGA PACK-darwin-$arch.dmg" 2>/dev/null | head -1)
    [[ -n "$dmg" ]] || continue
    zipname="PromptDeck-v$VERSION-$arch.zip"
    if [[ $DRY_RUN -eq 1 ]]; then
      log "[dry-run] zipperait $(basename "$dmg") → $zipname"
    else
      log "Zippe $(basename "$dmg") → $zipname"
      ditto -c -k --keepParent "$dmg" "$RELEASE_DIR/$zipname"
      ok "$zipname ($(du -h "$RELEASE_DIR/$zipname" | cut -f1))"
    fi
    SHIPPED=$((SHIPPED+1))
  done
  [[ $SHIPPED -eq 3 ]] || die "3 DMG attendus (x64, arm64, universal), $SHIPPED trouvés dans dist/ — lance ./build-app.sh --arch both"
fi

# ── 3. Notes de version depuis le CHANGELOG ───────────────────────────────
NOTES="$RELEASE_DIR/release-notes-v$VERSION.md"
if [[ $DRY_RUN -eq 1 ]]; then
  log "[dry-run] générerait $NOTES"
else
  mkdir -p "$RELEASE_DIR"
  # Extrait la section [version] (du titre jusqu'à la prochaine ## [ ou fin)
  awk -v v="$VERSION" '
    $0 ~ "^## \\[" v "\\]" { insec=1; print; next }
    insec && /^## \[/      { exit }
    insec                  { print }
  ' "$CHANGELOG" > "$NOTES"
  # Bandeau d'en-tête de release
  {
    echo "# PromptDeck v$VERSION"
    echo
    echo "3 images disque disponibles — **universal** recommandé (tous les Mac) :"
    echo
    echo "- \`PromptDeck-v$VERSION-universal.zip\` — Intel + Apple Silicon"
    echo "- \`PromptDeck-v$VERSION-arm64.zip\` — Apple Silicon (M1-M4)"
    echo "- \`PromptDeck-v$VERSION-x64.zip\` — Intel"
    echo
    echo "⚠️ Signature ad-hoc non notarisée : au premier lancement, clic droit → Ouvrir"
    echo "(voir le README, section Installation)."
    echo
    echo "---"
    echo
    cat "$NOTES"
  } > "$NOTES.tmp" && mv "$NOTES.tmp" "$NOTES"
  ok "Notes générées : $(basename "$NOTES") ($(wc -l < "$NOTES" | tr -d ' ') lignes)"
fi

# ── 4. Préparation de la commande gh ──────────────────────────────────────
ASSETS=""
if [[ $SKIP_DMG -eq 0 && $DRY_RUN -eq 0 ]]; then
  for zip in "$RELEASE_DIR"/PromptDeck-v"$VERSION"-*.zip; do
    ASSETS="$ASSETS \"$zip\""
  done
fi

GHCMD="gh release create v$VERSION$ASSETS --title \"PromptDeck v$VERSION\" --notes-file \"$NOTES\""

if [[ $DRY_RUN -eq 1 ]]; then
  log "[dry-run] commande finale :"
  echo "  $GHCMD"
  exit 0
fi

if [[ $CREATE -eq 1 ]]; then
  command -v gh >/dev/null 2>&1 || die "gh (GitHub CLI) introuvable — installe-le : brew install gh && gh auth login"
  log "Publication de la release v$VERSION sur GitHub…"
  eval "$GHCMD"
  ok "Release v$VERSION publiée ! 🎉"
  log "Vérifie : gh release view v$VERSION --web"
else
  echo
  log "═══ Prêt à publier ═══"
  echo
  echo "  1. (une fois)  brew install gh && gh auth login"
  echo "  2. Vérifie le remote :  git remote -v"
  echo "  3. Publie le tag :      git push origin v$VERSION"
  echo "  4. Exécute :            ./release.sh --create"
  echo
  echo "Commande qui sera exécutée :"
  echo "  $GHCMD"
fi
