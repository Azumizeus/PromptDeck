# Security Audit Report — agent-skills (méga-pack)

- **Cible** : `/Users/mickaeldunoyer/Desktop/Skill Install/agent-skills`
- **Source ref** : `e0cda34c64b34e45218d3aeb5fb2be790f0d76f9` (2026-09-23, worktree propre)
- **Profil** : `quick` — **couverture partielle par définition** (une vague de chasse, une passe)
- **Skill** : security-audit (Cloudflare) · Validateurs : `validate-findings.cjs` PASS · `validate-coverage-ledger.cjs` PASS
- **Artefacts** : `findings.json` (8 enregistrements) · `coverage-ledger.json` (14 unités) · `FINDINGS-DETAIL.md` · `NEEDS-VALIDATION.md`

## Synthèse

| Verdict | Nombre |
|---|---|
| **confirmed** | 3 (1 medium, 2 low) |
| **needs_validation** | 2 |
| **rejected** | 3 |
| Unités couvertes | 11 / 14 (2 deferred, 1 not_applicable) |

Aucune vulnérabilité critique ou haute n'a été confirmée. Le dépôt est un pack de
contenu (markdown, scripts générateurs, une app menu-bar) ; les surfaces exécutables
(hooks shell, scripts CI Node, scripts Python, scripts de build) ont été chassées et
sont propres : pas d'eval de contenu dépôt, pas d'interpolation de chaînes dans des
commandes, pas de secret commis, pas de dépendance exécutée à l'installation.

## Findings confirmés

1. **[medium] Clés API stockées en clair dans mgp-prefs.json quand safeStorage est indisponible**
   (`menubar-app-luxe/main.js@…@api-key-plaintext-fallback-in-prefs-json`) — le fallback
   silencieux contourne la protection keychain ; aucun secret n'était stocké au moment
   de l'audit. Correctif : refuser la persistance en clair (fail closed).
2. **[low] mdSafe préserve `..` — écriture hors du sous-dossier `perso/` via un config JSON importé**
   (`…@mdsafe-preserves-dotdot-write-scope-escape`) — reproduction sandboxée ; l'échappée
   est plafonnée à la racine du promptDir (même principal). Correctif : invariant de
   containment au sink + rejet des segments à points.
3. **[low] Le serveur local du launcher écoute sur toutes les interfaces**
   (`interface/MEGA-PACK-serveur.command@http-server-binds-all-interfaces`) — `python3
   -m http.server 8788` sans `--bind` ; contenu public servi au LAN. Correctif :
   `--bind 127.0.0.1`.

## À valider par le propriétaire (2)

- Les evals comportementaux exécutent `claude -p` avec Bash/WebFetch/WebSearch dans CI
  sans bac à sable réseau (politique d'exécution à confirmer).
- Les items d'atelier générés par LLM persistent et redeviennent des system prompts
  dans les missions d'équipe (modèle de confiance à décider).

## Couverture (déclaration)

Profil **quick** : 11/14 unités couvertes —
`build-scripts-py`, `hooks-shell`, `evals-executor` (candidate), `interface-userscript-keys`,
`local-http-server` (candidate), `menubar-luxe-prefs` (candidate), `menubar-luxe-ipc-shell`
(candidate), `menubar-luxe-mdopen`, `luxe-electron-webprefs`, `lifecycle-skills-md` (candidate),
`node-scripts-ci`, `pack-agents-md` — plus **2 unités deferred** (apps legacy `menubar-app`,
`menubar-app-v2`) et **1 unité not_applicable** (endpoints distants vivants, non sondables
sous la politique source-only). **Aucune affirmation de couverture exhaustive** : une
première passe quick trouve typiquement la moitié des vulnérabilités que des exécutions
répétées découvrent ; les 132 skills/190 agents sont du contenu revu en vrac (grep + échantillonnage),
pas fichier par fichier.

### Hors périmètre (out of scope implicite du profil quick)

- Audit dynamique des providers LLM distants et des schémas d'URL custom (`freebuff://`, `opencode://`).
- Contenu `node_modules/` et `.git/` (non revu, exclus de la cible).
- Les archives `grok svg/` et `My Claude resource vault /` (non suivis, hors source ref).
- Revue de la chaîne d'approvisionnement GitHub (branches/PR du remote `Azumizeus/PromptDeck`) — gouvernance, pas source.

## Méthode

Chasse par 11 chasseurs isolés (un par unité de couverture, IDs canoniques), validation
adversariale de 8 candidates, 3 reproductions locales sous les règles de sandbox du skill
(bind probe lsof, harness Node mdSafe, inspection 0644 des prefs — lectures seules, nettoyées),
vérification indépendante des 3 confirmés avec correction des numéros de ligne
(lignes vérifiées : main.js L220/234/243/317/330/1280/1284/1289/1338, serveur.command L9/L13).
Le code cible n'a pas été modifié (worktree propre avant/après, `git status` vérifié).
