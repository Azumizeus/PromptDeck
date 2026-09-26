# Changelog — Méga-pack agent-skills

## 0.7.4 — 26 septembre 2026

### Corrigé
- **Décomptes du catalogue alignés sur le réel : 136 skills · 190 agents · 326 experts.**
  Cause racine : les skills ajoutés dans `skills/` ne déclenchaient ni régénération du
  catalogue ni mise à jour des docs — les décomptes ont dérivé en silence (131/132 annoncés,
  puis 133). Deux rattrapages : 131/132 → 133 (docs v0.7.3), puis 133 → 136 ici, car
  `llm-provider-cascade`, `headroom-compression` et `cognee-memory` (ajoutés pendant les
  versions 2.13 → 2.18 de l'app Luxe) manquaient encore au décompte, ainsi que les
  renommages `solana-dev` → `solana-dev-skill` et `solana-game` → `solana-game-skill`.
- **App Luxe (Réglages)** : le toggle « 🎈 Popup flottant au survol » ne persistait jamais —
  aucune liaison `onchange → persist()` (contrairement à keepVisible/arenaBus), la case
  revenait à son état initial à chaque réouverture. Fix + test de régression.

### Ajouté
- `scripts/verify-counts.py` : garde-fou anti-dérive — compare les décomptes réels du disque
  (mêmes règles que `build-interface.py` : tout `SKILL.md` sous `skills/`, tout `.md` sous
  `agents/`) aux mentions des docs (README, MEGA-PACK.md, INSTALL.txt, COMMANDES-ET-AGENTS.md,
  plugin.json…) et à `interface/catalog-full.js`. `--update` corrige les docs ciblés ;
  exit 1 à la moindre divergence.
- `menubar-app-luxe/test-luxe.js` §43 : vérification docs ↔ catalogue intégrée à la suite
  de tests (aucun ancien décompte dans les docs, `test-app.sh` aligné sur le réel).

### Technique
- `interface/catalog-full.js` régénéré (meta 0.7.4 — 136/190) ; launcher HTML, userscripts
  (2.10.2), bookmarklet et panel-demo-inline synchronisés.
- Versions plugin : `plugin.json`, `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`
  → 0.7.4.

## 0.7.3 — 23 septembre 2026
- Correctifs d'audit de sécurité (voir MEGA-PACK.md §0-ter).
