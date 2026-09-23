# Security Audit Report — agent-skills (méga-pack) · run-2

- **Cible** : `/Users/mickaeldunoyer/Desktop/Skill Install/agent-skills`
- **Source ref** : `7036ea91454e47ea762d7e7aeed61f6a7252c676` (« Fix confirmed audit findings… », worktree propre ; non-suivis hors périmètre listés plus bas)
- **Profil** : `standard` — unités par subsystem × attack class, carryforward complet du run-1
- **Skill** : security-audit (Cloudflare) · Validateurs : `validate-findings.cjs` **PASS (0)** · `validate-coverage-ledger.cjs` **PASS (17)**
- **Prior run** : run-1 (`quick`, ref `e0cda34c`) — ledger et findings intégralement reportés selon les règles de reconnaissance 1–6

## Verdict global

**Aucun nouveau finding.** Les 3 findings confirmés du run-1 sont **remédiés au ref audité** et
les 2 needs_validation sont **traités** (mitigation vérifiée + résidu documenté). La couverture
passe de 11/14 unités (profil quick) à **17/17 unités couvertes** (profil standard), dont les
2 unités deferred du run-1 (apps menubar v1 et v2), chassées pour la première fois.

## Clôture des enregistrements run-1

| Enregistrement run-1 | État au ref `7036ea9` | Preuve |
|---|---|---|
| `…@api-key-plaintext-fallback-in-prefs-json` (medium) | **Remédié** — api-set fail-closed (`no-os-encryption`), `apiKeyFor` n'expose plus le clair, migration one-shot au démarrage | unité `menubar-luxe-prefs`, `test-security-fixes.js` 24/24 |
| `…@mdsafe-preserves-dotdot-write-scope-escape` (low) | **Remédié** — `mdSafe` neutralise les segments à points, `writeItemMd`/`writeTeamMd` passent par `containedJoin` (refus absolu + `..` au sink) | unité `menubar-luxe-ipc-shell`, chaîne import-config testée |
| `…@http-server-binds-all-interfaces` (low) | **Remédié** — `--bind 127.0.0.1` ; sonde re-exécutée : `127.0.0.1:8788 (LISTEN)`, HTTP 200 loopback | unité `local-http-server`, artefact `bind-127001-probe-run2.txt` |
| `…@behavioral-executor-without-network-sandbox` (needs_validation) | **Traité** — wrapper sandbox-exec loopback-only par défaut, refus hors macOS sans `--allow-network` explicite | unité `evals-executor`, artefact `run-evals-net-test-14of14.txt` |
| `…@llm-generated-workshop-items-flow-into-later-prompts` (needs_validation) | **Traité** — `origin: 'llm-generated'` persisté + notice bilingue sur exports .md et prompts copiés ; résidu en NEEDS-VALIDATION | unité `luxe-llm-workshop` |
| 3 rejetés (userscript GM storage, prompt-md-open, contenu markdown) | Toujours valides : source inchangée sur ces points, raisons de rejet re-confirmées | unités correspondantes |

Conformément au schéma, les enregistrements remédiés ne sont **pas** réémis comme `confirmed`
dans `findings.json` de run-2 (0 enregistrement) ; leur vérification de remédiation est portée
par le ledger de couverture et ce rapport.

## Nouvelle couverture (run-2 exclusif)

- **menubar-app v1** (685 lignes) : argv `osascript` fixe (`resolveOpenCode` ne retourne que des
  chemins d'installation connus), cibles LLM par table codée + `encodeURIComponent`, handlers IPC
  typés, `contextIsolation: true` / `nodeIntegration: false`, aucune clé API persistée. L'HTML de
  `captureShots` interpole des labels non échappés mais dans une fenêtre offscreen display-only
  (même principal, rien de persisté) — pas de violation de frontière.
- **menubar-app v2** : base v1 + dossier userData isolé (`MGP_USERDATA_DIR`) — même analyse,
  redirection de prefs contrôlée par l'opérateur. Rien à signaler.

## Limitations (disclosure)

1. **Chasse inline** : cette plateforme ne fournit pas de délégation en sous-agents isolés ;
   la vague de chasse a été exécutée par le parent en lecture source seule + sondes locales
   jetables (aucun code cible exécuté hors probes `http.server`/tests unitaires). L'isolation
   write des chasseurs n'est donc pas démontrée — les futures runs sur hôte capable doivent
   déléguer.
2. **Non-suivis hors audit** : `grok svg/`, `My Claude resource vault /`,
   `menubar-app-luxe/standalone-inline.html`, `menubar-app-luxe/package-lock.json` existent au
   moment du run sans être committés ; non audités, hors ref.
3. Le profil standard reste **partiel par nature** : la couverture 17/17 porte sur les unités
   enregistrées, pas sur l'exhaustivité des surfaces possibles.

## Artefacts

`run-metadata.json` · `coverage-ledger.json` (17 unités) · `findings.json` (0) ·
`REPORT.md` · `FINDINGS-DETAIL.md` · `NEEDS-VALIDATION.md` · preuves sous
`agents/parent-inline-standard/artifacts/`.

`run_status` : **complete**.
