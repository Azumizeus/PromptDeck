# Mode d'emploi — NEXUS & SEEKER au quotidien

---

## 1. Qui appeler ?

| Ta situation | Appelle |
|---|---|
| Demande complexe à découper en tâches techniques | **NEXUS** |
| Tu ne sais pas si ton approche est la meilleure | **SEEKER** |
| Conflit entre deux options techniques | **NEXUS** tranche |
| Tu veux savoir ce que tu rates / angle mort | **SEEKER** |
| Priorisation d'un sprint / d'une roadmap | **SEEKER** |
| Architecture, sécurité, arbitrage final | **NEXUS** |
| Tu ne sais pas par où commencer | Les deux, ensemble — pose la question au duo |

Règle simple : **NEXUS connecte et structure, SEEKER explore et questionne.** Si tu hésites, commence par SEEKER (elle reformule et pose les bonnes questions), puis passe à NEXUS pour l'exécution.

---

## 2. Formulations qui marchent

- *"NEXUS, décompose et organise [tâche]."* → il répond avec un plan avant d'agir.
- *"NEXUS, qui doit s'occuper de [sous-tâche] ?"* → il pointe vers le bon agent/skill.
- *"SEEKER, qu'est-ce que je rate sur [sujet] ?"* → elle répond en options, pas en solution unique.
- *"SEEKER, priorise-moi ça."* → elle te rend une liste ordonnée avec la raison de chaque rang.
- *"NEXUS et SEEKER, vous êtes d'accord là-dessus ?"* → utile avant une décision importante, pour forcer le désaccord à sortir s'il existe.

Formulations à éviter : demander une action critique (trade, déploiement, envoi de fonds) en espérant que ça passe sans confirmation — ils sont conçus pour refuser et te renvoyer la question.

---

## 3. Ce qu'ils ne feront jamais (et pourquoi c'est voulu)

- Exécuter une action irréversible sans ta confirmation explicite (trade, mainnet, envoi de fonds, signature de transaction).
- Coder eux-mêmes en détail à la place d'un agent d'ingénierie spécialisé — ils délèguent et vérifient, ils ne remplacent pas les futurs spécialistes (RUSTIK, etc.).
- Passer outre un veto sécurité (CIPHER, à venir) une fois qu'il existe.
- Cacher un bug, une dette technique ou une incertitude — NEXUS le dit toujours en premier, sans filtre (c'est dans son contrat).
- Te répondre avec un pavé de texte non structuré sur une demande simple — s'ils le font, c'est un bug de personnalité, pas un comportement voulu (voir section 5).

---

## 4. Cycle de travail type avec eux

1. Tu poses la demande complète à **NEXUS** (pas de contexte manquant si possible).
2. NEXUS reformule en une phrase pour confirmer, puis découpe en 2-6 sous-tâches.
3. Pour chaque sous-tâche à composante UX/produit/pédagogie, il peut passer la main à **SEEKER** — ou tu l'appelles toi-même en parallèle.
4. Résultat synthétisé, pas une liste brute de morceaux.
5. Si un point bloque : une question claire, pas un blocage silencieux.

---

## 5. Dépannage comportemental

| Symptôme | Cause probable | Correctif |
|---|---|---|
| Réponses trop longues / trop de blabla | System prompt pas collé en entier dans Agent Studio | Recoller le system prompt complet (section 3 de la fiche agent) |
| Exécute une action sans demander confirmation | Bloc "Limites" tronqué ou oublié | Vérifier que les 4 blocs de personnalité sont bien tous présents |
| SEEKER valide tout sans challenger | Ton mal calibré, dérive vers l'agréabilité | Retester avec une demande volontairement faible pour vérifier qu'elle pousse back |
| Voix par défaut générique | Voix non re-testée après changement de prompt | Retester sur la phrase de référence de la fiche agent (section 5) |
| NEXUS et SEEKER se contredisent sans que ça avance | Normal en soi, mais il faut un mécanisme de tranchage | Rappelle la règle : décision technique finale = NEXUS, sauf terrain UX/priorisation = SEEKER |

---

## 6. Où sont les sources de vérité

- **System prompts** : dans `01-NEXUS-orchestrateur.md` et `02-SEEKER-orchestratrice.md` — pas seulement dans le dashboard three.ws, qui peut être perdu/réinitialisé.
- **État d'avancement de la fabrication** : `05-SUIVI-CREATION.md` et `agents-registry.md` (à remplir en Phase 3 de la roadmap).
- **Vue d'ensemble visuelle** : `index.html` (ouvrir dans un navigateur, tout est cliquable/cochable).
- **Ce que sait faire toute ta bibliothèque d'agents/skills** : `agent-skills/COMMANDES-ET-AGENTS.md` (267+ skills/agents recensés).

---

## 7. Prochaine étape après validation du duo

Une fois NEXUS et SEEKER validés (corps + personnalité + voix qui tournent sans bug), enchaîne sur CIPHER puis RUSTIK avec la même méthode — voir `03-ROADMAP.md`, Phase 6.
