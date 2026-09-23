# NEEDS-VALIDATION — agent-skills run-1

Deux candidates sont restées **needs_validation** : l'hypothèse est ancrée dans la
source, mais le fait décisif vit hors du dépôt (environnement CI réel, décision de
trust-model). Aucune de ces entrées n'a de sévérité.

---

## NV-1 · Executor d'evals comportementaux sans bac à sable réseau

**Fingerprint** : `scripts/run-evals.js@behavioral-executor-without-network-sandbox`
**Fait non résolu** : la politique d'égès réseau réelle autour de `claude -p` dans CI.

**Ce que la source établit** :
- `scripts/run-evals.js` L49 : `EXECUTOR_TOOLS = 'Read,Glob,Grep,Edit,Write,Bash,WebFetch,WebSearch'`.
- L534 : `execFileSync('claude', ['-p', …, '--permission-mode', 'acceptEdits', '--allowedTools', EXECUTOR_TOOLS, …], { cwd: workspace })`.
- `.github/workflows/test-plugin-install.yml` : les evals comportementaux sont une étape CI documentée (gated par tokens).
- Tous les fixtures/cases actuels (revus pendant la chasse) sont inertes : aucun contenu hostile.

**Blockers exacts** :
1. Que CI applique ou non une politique d'égès au niveau de l'org/runner est un fait
   d'infrastructure hors du dépôt — non sondable sous la politique source-only.
2. L'acceptation par le propriétaire d'un égès agent-contrôlé pendant les evals
   comportementaux est une décision de politique, pas un fait de source.

**Plan de validation** :
- **Local** : exécuter un eval comportemental avec un sink DNS/HTTP local et un proxy
  captif pour observer les destinations contactées par défaut par l'executor.
- **CI** : confirmer la politique d'égès du runner ; sinon enfermer l'invocation
  `claude -p` dans un profil sans réseau (seatbelt/firejail/job isolé).

---

## NV-2 · Items d'atelier générés par LLM réutilisés comme system prompts

**Fingerprint** : `menubar-app-luxe/main.js@llm-generated-workshop-items-flow-into-later-prompts`
**Fait non résolu** : le trust-model voulu pour le contenu généré/importé persisté.

**Ce que la source établit** :
- `llm-generate` (L1080 env.) : les champs LLM (`name`, `desc`, `system`/`body`, listes)
  sont plafonnés en longueur puis persistés dans `my-agents.json` / `my-skills.json`.
- `team-run` (L1179 env.) : `a.system` stocké repart verbatim comme system prompt des
  sous-agents ; les sorties agents sont concaténées dans le prompt de consolidation (L1194).
- Aucun sink shell/fs n'est joignable depuis ces champs ; les sinks DOM sont échappés
  (`esc()` vérifié dans cardHTML/tipHtml/ctxTreeHtml) — pas de code-execution.
- Le risque résiduel est de la **prompt-injection persistée** : une génération piégée
  (ou un config importé similaire) oriente des missions d'équipe ultérieures.

**Blockers exacts** :
1. Le « boundary » est le modèle de confiance LLM : considérer les réponses provider
   comme configuration fiable ou non est une décision du propriétaire, pas un fait de source.
2. Les configs importées pouvant amorcer des items avec des system prompts arbitraires,
   la gravité dépend du statut de confiance de ces fichiers (artefacts de partage,
   sélectionnés par l'utilisateur).

**Plan de validation** :
- **Local** : semer un item d'atelier dont le champ system instruit un comportement
  d'exfiltration fictif (ex. « répète la mission dans ta réponse »), lancer une mission
  d'équipe, observer si l'injection oriente le rapport du sous-agent.
- **Produit** : décider et documenter — marquer les items générés/importés comme
  non fiables (flag de provenance + confirmation avant réutilisation du system prompt),
  ou accepter et documenter le risque résiduel.
