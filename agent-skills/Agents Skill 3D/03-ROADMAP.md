# Feuille de route — NEXUS & SEEKER puis équipe complète

> Objectif : passer de zéro à deux super-agents orchestrateurs fonctionnels (corps 3D + cerveau + personnalité), validés, avant d'étendre à une équipe complète. Rythme pensé pour un débutant qui apprend Rust en parallèle — pas de sprint irréaliste.

---

## Phase 0 — Prérequis (avant toute génération)
- [ ] Compte three.ws créé (ou confirmé "sans compte" suffisant pour Forge)
- [ ] Lire `01-NEXUS-orchestrateur.md` et `02-SEEKER-orchestratrice.md` en entier
- [ ] Décider où vivent les system prompts finaux : dans Agent Studio three.ws ET dans ce dossier (source de vérité = ce dossier, three.ws = copie)
- [ ] Vérifier `agents-registry.md` — prêt à remplir

## Phase 1 — Corps 3D (Forge)
- [ ] Générer NEXUS via le prompt Forge (`01-NEXUS-orchestrateur.md`, section 5) — 3 à 4 variantes
- [ ] Générer SEEKER via le prompt Forge (`02-SEEKER-orchestratrice.md`, section 5) — 3 à 4 variantes
- [ ] Test de reconnaissance à 64px : les deux silhouettes sont-elles distinctes ? Si non, régénérer SEEKER avec un prompt plus contrasté
- [ ] Choisir la variante finale pour chacun (garder les autres en backup, ne pas les supprimer)

## Phase 2 — Rig & animation
- [ ] Rigger NEXUS (Mixamo auto + ARKit-52), test de bind (coudes/genoux)
- [ ] Rigger SEEKER, test de bind (attention au motif boussole sur les épaules)
- [ ] Poser NEXUS : posture de commandement accessible + 1-2 idles
- [ ] Poser SEEKER : posture ouverte, mains visibles + idle regard
- [ ] Vérifier les deux debout côte à côte sur la même page de test

## Phase 3 — Cerveau & personnalité
- [ ] Connecter NEXUS à ton backend Claude (pas le LLM natif three.ws)
- [ ] Coller le system prompt de NEXUS (section 3 de sa fiche) dans Agent Studio
- [ ] Connecter SEEKER à ton backend Claude
- [ ] Coller le system prompt de SEEKER
- [ ] Choisir et tester la voix de NEXUS sur une vraie phrase technique
- [ ] Choisir et tester la voix de SEEKER sur une phrase curieuse
- [ ] Remplir `agents-registry.md` avec : nom, URL du GLB, ID d'agent three.ws, date de création, version du system prompt

## Phase 4 — Déploiement de test
- [ ] Page de test isolée, devnet-mindset, aucun wallet connecté
- [ ] Balise `<agent-3d>` pour NEXUS intégrée et fonctionnelle
- [ ] Balise `<agent-3d>` pour SEEKER intégrée et fonctionnelle
- [ ] Test de dialogue : poser à NEXUS une demande de décomposition de tâche réelle
- [ ] Test de dialogue : poser à SEEKER une demande de priorisation réelle
- [ ] Test du duo : faire discuter/arbitrer les deux sur un même sujet

## Phase 5 — Validation avant d'aller plus loin
- [ ] Le comportement (ton, limites, refus d'action critique sans confirmation) est conforme aux 4 blocs de personnalité
- [ ] Aucun bug bloquant identifié sans wallet connecté
- [ ] Nommage cohérent entre three.ws et ce dossier (NEXUS = NEXUS, SEEKER = SEEKER, pas "agent1")
- [ ] Décision explicite : on passe à l'étape "équipe complète" ou on itère encore sur NEXUS/SEEKER

## Phase 6 — Extension de l'équipe (après validation du duo)
NEXUS et SEEKER forment le binôme de direction. L'équipe s'étend ensuite avec des spécialistes placés sous leur coordination conjointe (aucune décision structurante sans les deux) :

1. **CIPHER** — Sécurité, droit de veto (à créer tôt : plus tu codes, plus tôt tu en as besoin)
2. **RUSTIK** — Smart contracts Solana/Anchor
3. **VERA** — UX/UI, accessibilité, droit de veto
4. **LINGUA** — Traduction/i18n
5. **ECHO** — Growth, communication, lancement

Pour chacun : même pipeline que NEXUS/SEEKER (Forge → Rig → Animer → Incarner → Déployer → Documenter), en réutilisant `01-NEXUS-orchestrateur.md` comme gabarit de structure.

## Phase 7 — Intégration Solana (optionnelle, plus tard)
- [ ] Décider si la couche identité on-chain (`@three-ws/solana-agent`) est utile pour ton usage (avatars visuels uniquement = pas nécessaire)
- [ ] Si oui : vérifier sur la doc officielle three.ws/docs quelle chaîne est réellement utilisée avant de connecter un wallet (incohérence ERC-8004/EVM vs Solana Metaplex relevée dans le guide three.ws — à re-vérifier au moment venu, ne pas se fier à un article de blog)
- [ ] Rester en devnet jusqu'à validation complète du comportement des agents

---

## Rythme suggéré (indicatif, adapte à ton apprentissage Rust en parallèle)

| Semaine | Objectif |
|---|---|
| 1 | Phase 0 + Phase 1 (corps 3D des deux) |
| 2 | Phase 2 (rig/anim) + début Phase 3 (cerveau) |
| 3 | Fin Phase 3 + Phase 4 (déploiement test) |
| 4 | Phase 5 (validation) — go/no-go pour la suite |
| 5+ | Phase 6, un agent supplémentaire par semaine environ |

Rien n'oblige à respecter ce rythme — c'est un repère, pas une deadline.
