# 🛠️ MODE D'EMPLOI — quoi utiliser, pour faire quoi, et comment

> Guide pratique du set d'agents. Pour **les règles de décision**, voir [`PROTOCOL-UTILISATION.md`](./PROTOCOL-UTILISATION.md). Pour **la liste des 231 agents**, voir [`AGENTS-CATALOGUE.md`](./AGENTS-CATALOGUE.md).
> Toutes les commandes ci-dessous sont réelles et testées sur cette machine. Mis à jour : 25 septembre 2026.

---

## En 30 secondes : le paysage

| Besoin | Outil | Commande / accès |
|---|---|---|
| Discuter avec un LLM, vite | **ChatDeck** | `http://localhost:5199` (après `npm run dev` dans `~/projects/chatdeck`) |
| Coder avec un agent | **OpenCode** | `opencode run "…"` · `opencode` en mode interactif |
| Réduire la facture tokens | **Headroom** | dashboard `http://127.0.0.1:8787/dashboard` (tourne tout seul) |
| Mémoriser / retrouver | **cognee** | outils MCP après `bash scripts/cognee-mcp-toggle.sh on` |
| Lancer les agents du pack | **PromptDeck** | ⌥Espace depuis la barre de menus |
| Ouvrir le mode d’emploi du pack | **PromptDeck** | ⌘⌥/ par défaut, configurable dans Réglages |

---

## 1. Discuter, comparer des idées, faire un brainstorming

**Quoi** : ChatDeck — 4 providers dans une seule interface.
**Comment**
```bash
cd ~/projects/chatdeck && npm run dev    # http://localhost:5199
```
- Sélecteurs en bas de l'écran : OpenRouter (défaut) / NVIDIA NIM / Cohere / Mistral.
- Modèles rapides : `GPT-4.1 mini` (OpenRouter) ou `Command A` (Cohere, < 2 s).
- Clés : déjà préchargées depuis `~/.secrets` → `keys.local.json` (gitignore). Réglages avec **⌘K**.
**Vérifier** : le badge de streaming et le texte qui s'écrit progressively.

## 2. Écrire du code dans un projet

**Quoi** : OpenCode + un agent du catalogue.
**Comment**
```bash
cd ~/projects/mon-projet
opencode run "Ajoute un endpoint GET /health qui renvoie la version — @backend-architect"
```
- L'agent s'invoque avec `@nom-agent` ; sans `@`, OpenCode choisit selon la tâche.
- Modèles : `-m cohere/command-a-03-2025` (rapide) ou `-m nvidia/nemotron-3-super-120b-a12b` (raisonnement, plus lent).
**Vérifier** : les tests du projet (`npm test`) avant d'accepter.

## 3. Corriger un bug

**Quoi** : `debugging-and-error-recovery` puis `test-driven-development`.
**Comment**
1. Reproduire : `opencode run "@senior-developer trouve la cause racine de : <symptôme>. Ne corrige rien pour l'instant."`
2. Écrire le test qui échoue, puis corriger : `opencode run "Écris d'abord un test qui reproduit <bug>, puis corrige-le."`
**Vérifier** : le test échouait avant, passe après. Ne pas accepter « ça devrait marcher ».

## 4. Ajouter une feature

**Quoi** : `spec-driven-development` → `planning-and-task-breakdown` → agent métier → `incremental-implementation`.
**Comment**
```bash
opencode run "Spécifie la feature : <description>. Ne code rien."
opencode run "Découpe cette spec en tâches validéables, de la plus petite à la plus grande."
opencode run "Implémente la tâche 1 uniquement."
```
**Vérifier** : chaque étape est mergeable seule ; le diff reste lisible.

## 5. Relire du code (avant merge)

**Quoi** : agent `Code Reviewer` + skill `code-review-and-quality`.
**Comment**
```bash
git diff --staged | opencode run "@code-reviewer revois ce diff : correction, lisibilité, architecture, sécurité, performance."
```
**Vérifier** : chaque remarque est actionnable et vérifiable — pas de « je ne crois pas » sans preuve.

## 6. Sécurité

| Contexte | Quoi | Comment |
|---|---|---|
| Écrire du code qui touche aux entrées | `security-and-hardening` | `opencode run "sécurise <fichier> : validation des entrées, auth, OWASP"` |
| Audit complet | agent `Security Auditor` + skill `security-audit` | `opencode run "@security-auditor audit complet de <dossier>"` |
| Smart contracts | `Blockchain Security Auditor` | vérifier aussi la conformité MiCA si produit public |

**Vérifier** : aucune donnée sensible dans les logs, aucune dépendance sans audit.

## 7. Solana (le cœur de tes projets)

| Tâche | Quoi |
|---|---|
| Dapp, wallet, programme Anchor | `solana-dev-skill` puis `solana-anchor-claude-skill` |
| NFT / tokenomics | `metaplex-skill`, agent `Tokenomics Designer` |
| Économie in-game on-chain | `solana-game-skill` |
| Données live (soldes, transactions) | **MCP Helius** (déjà actif) |
| Audit de programme | `Blockchain Security Auditor` |

**Comment**
```bash
opencode run "Crée un programme Anchor <nom> : @solidity-smart-contract-engineer, ou utilise le skill solana-dev-skill"
```
**Vérifier** : tests LiteSVM/Mollusk du skill, pas seulement le build.

## 8. UI / UX et test dans le vrai navigateur

**Quoi** : agents `UI Designer` / `UX Architect` + skill `frontend-ui-engineering` (WCAG inclus) + skill `browser-testing-with-devtools`.
**Comment**
```bash
opencode run "Améliore l'accessibilité de <page> : @ui-designer, respecte WCAG AA"
```
Pour tester dans un vrai navigateur : skill `browser-testing-with-devtools` (nécessite le MCP chrome-devtools + un Chrome lancé avec le port de debug, sinon le skill se met en `off`).
**Vérifier** : captures d'écran réelles, console vide, navigation clavier testée.

## 9. Performance

**Quoi** : agent racine `web-performance-auditor` + skill `performance-optimization`.
**Comment** : mesurer avant, après : `opencode run "@web-performance-auditor audite les Core Web Vitals de <page> et propose 3 corrections chiffrées"`
**Vérifier** : chiffre avant / après, pas de « ça devrait être plus rapide ».

## 10. Documentation

**Quoi** : agent `Technical Writer` + skill `documentation-and-adrs`.
**Comment** : `opencode run "@technical-writer documente <module> : README d'usage, ADR pour la décision X"`
**Vérifier** : la documentation permet à un inconnu de faire la tâche sans te poser de question.

## 11. Livrer / déployer

**Quoi** : skill `shipping-and-launch` + agent `DevOps Automator` + `git-workflow-and-versioning`.
**Comment** : toujours passer par un commit propre (`git-workflow-and-versioning`) avant toute livraison ; jamais de déploiement demandé implicitement.
**Vérifier** : plan de rollback écrit, monitoring en place.

## 12. Réduire les tokens

**Quoi** : Headroom.
**Comment**
```bash
headroom wrap opencode --no-proxy --no-serena   # une session OpenCode compressée
headroom dashboard                              # les économies en direct
headroom unwrap opencode                        # revenir au normal
```
**Vérifier** : `/stats` affiche les tokens retirés et le coût économisé.

## 13. Mémoriser une décision (mémoire partagée)

**Quoi** : cognee (local, sans clé LLM).
**Comment**
```bash
bash scripts/cognee-mcp-toggle.sh on    # le MCP doit être actif
# puis, dans la session :
#   cognee remember { "data": "ChatDeck utilise le port 5199, pas 5173", "dataset_name": "hub_chatdeck" }
#   cognee recall   { "query": "Quel port utilise ChatDeck ?", "datasets": "hub_chatdeck" }
```
En différé (l'extraction GLiNER tourne en tâche de fond) :
```bash
python3 scripts/cognee-deferred-add.py --dataset hub_x --text "…"
```
Puis **rappelle-toi de l'interroger avant de répondre** sur le hub, et de dire « mémoire vide » si elle ne répond pas.
**Vérifier** : `bash scripts/cognee-mcp-toggle.sh status`.

## 14. Comprendre un code inconnu

**Quoi** : agent `Codebase Onboarding Engineer`.
**Comment** : `opencode run "@codebase-onboarding-engineer cartographie <dossier> : points d'entrée, flux principaux, dépendances"`.
**Vérifier** : chaque affirmation est sourcée par un fichier réel.

## 15. Marketing / SEO / croissance

30 agents dédiés dans le catalogue : `SEO Specialist`, `Growth Hacker`, `TikTok Strategist`, `Agentic Search Optimizer`…
```bash
opencode run "@seo-specialist audite le SEO technique de <site> et donne les 5 corrections par impact"
```

---

## Erreurs fréquentes (et leur cause réelle)

| Symptôme | Cause | Solution |
|---|---|---|
| `Bad Request: max tokens must be ≤ 8192` | Cohere mal configuré | limite 8192, déjà corrigé dans `opencode.json` |
| `Service temporarily overloaded` | Nemotron saturé côté NVIDIA | basculer sur Cohere ou OpenRouter |
| HTTP 429 | clé Mistral en rate limit | utiliser OpenRouter |
| Réponse fausse mais crédible (ex. « port 5173 ») | l'agent n'a pas interrogé la mémoire | activer cognee et imposer « dis mémoire vide si absent » |
| `fetch failed` / CORS côté navigateur | appel direct sans proxy | passer par le proxy Vite (ChatDeck) ou le proxy MCP |
| Mesures absurdes, 5 min pour un test | la machine est saturée (load > 100) | fermer Claude.app/Brave, relancer |

---

## Le réflexe en 3 questions

1. **Quel agent ?** → table de routage du [protocole](./PROTOCOL-UTILISATION.md), sinon l'agent de la famille (Engineering / Design / Testing…).
2. **Quel skill discipline ?** → TDD avant d'écrire, code-review avant de merger, git-workflow à chaque changement.
3. **Quel outil ?** → ChatDeck pour discuter, OpenCode pour coder, Headroom pour économiser, cognee pour se souvenir.
