# NEEDS-VALIDATION — agent-skills run-2

Aucun enregistrement `needs_validation` nouveau. Les 2 items du run-1 sont traités
(voir REPORT.md) ; leurs **résidus** — faits hors source ou hors capacité de ce run —
sont listés ici pour le propriétaire ou une future run `deep`.

## NV-2/R — Résidu de la mitigation de provenance (workshop LLM)

- **Ce qui est établi en source** : les items créés via l'Atelier portent
  `origin: 'llm-generated'` + `generatedWith` (main.js:1037 et :1275) ; la notice
  bilingue est prépendée aux exports `.md` (`mdForItem`, `teamMd`) et aux prompts
  copiés (`renderer.js:193-200`).
- **Ce qui reste hors garantie** :
  1. `import-config` accepte un JSON externe dont les items (`customs`, etc.) n'ont
     pas de champ `origin` — aucun notice ne les couvrira s'ils sont alimentés par
     du contenu généré ailleurs.
  2. Les items créés **avant** l'introduction du marqueur ne porteront jamais
     `origin` (aucune migration rétrospective possible : l'information n'existe pas).
  3. La notice vit dans l'app et les fichiers exportés ; un copier-coller via une
     autre voie (édition manuelle du JSON de prefs) la contourne.
- **Plan de validation propriétaire** : si ce périmètre compte, étendre la notice au
  rendu de la liste d'atelier (badge visuel), et ajouter `origin: 'imported'` dans
  `import-config` pour distinguer l'import manuel du généré.
- **Statut** : résidu documenté, non bloquant — la frontière principale (contenu
  LLM → prompt rejoué sans avertissement) est fermée au ref audité.

## NV-1/R — Résidu de la sandbox réseau de l'executor d'evals

- **Ce qui est établi** (source + exécution locale au ref audité) : sur macOS,
  `run-evals.js --behavioral` exécute executor et grader sous
  `/usr/bin/sandbox-exec` avec profil `(deny network-outbound)` + exceptions
  loopback/unix-socket (run-evals.js:61-67, wrap en :562 et :609) ; hors support,
  le run est refusé sauf `--allow-network` explicite. Tests : 14/14 + sonde live
  (loopback 200, externe bloqué exit 7).
- **Ce qui reste hors garantie** :
  1. Le profil Seatbelt ne contraint que le **réseau sortant** : filesystem et
     process restent ceux du run (déjà bornés par le workspace jetable + timeout,
     mais pas par un sandbox fichier).
  2. Les plateformes sans équivalent `sandbox-exec` vérifié dans ce dépôt (Linux :
     aucun wrapper bwrap/nsjtl implémenté) doivent passer `--allow-network` ou
     n'executent pas de tier-3.
  3. `--allow-network` reste un flag opérateur sans second contrôle (pas de
     confirm interactif, pas de trace dédiée).
- **Plan de validation propriétaire** : ajouter un wrapper Linux (bwrap
  `--unshare-net`) et un journal des runs `--allow-network` si le tier-3 doit tourner
  hors macOS.
- **Statut** : résidu documenté, non bloquant — le finding run-1 (exécution CI sans
  politique réseau) est fermé.

## Plateforme — chasse sans délégation isolée (limitation de run)

- Cette exécution (agent parent unique, pas de sous-agents isolés disponibles)
  ne démontre pas l'isolation d'écriture des chasseurs prévue par le skill.
  Les sondes exécutées (`http.server` jetable, suites de tests unitaires) sont
  restées dans les bornes de `scratch`/artefacts du run et n'ont touché ni la
  cible ni le réseau externe — vérifié par `git status` propre sur la cible.
- **Conséquence** : pour une run `deep` (ou en cas de candidate critique), déporter
  les vagues de chasse sur un hôte avec délégation isolée ; le présent ledger et
  les unités restent réutilisables tels quels.
