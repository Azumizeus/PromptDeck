# 🧭 PROTOCOLE D'UTILISATION — set d'agents & skills (megapack)

> Guide de décision : **quel agent, quel skill, sur quel hôte, quand**.
> Source de vérité des agents : [`AGENTS-CATALOGUE.md`](./AGENTS-CATALOGUE.md) (231 agents) · skills : `agent-skills/skills/` (177).
> Mis à jour : 25 septembre 2026.

---

## 1. Les 4 règles qui évitent 90 % des erreurs

1. **Un agent principal + un vérificateur, pas dix.** Un agent = un *rôle*, pas un worker. Empiler 5 rôles dégrade le résultat et coûte des tokens pour rien.
2. **Le skill discipline prime sur l'agent métier.** `test-driven-development` et `code-review-and-quality` ne sont pas des options : ils se déclenchent *toujours* sur du code.
3. **La mémoire avant l'affirmation.** Avant de répondre sur le hub (ports, stacks, providers, décisions), interroge `cognee recall`. Sinon le modèle invente — c'est observé, pas théorique.
4. **Vérifie avant d'affirmer.** Chaque chiffre de ce protocole vient d'une mesure réelle, pas de la documentation. Idem pour ton travail : `reality-checker` et `evidence-collector` existent pour ça.

---

## 2. Où sont les agents, et comment les appeler

| Hôte | Emplacement | Invocation | Automatisme |
|------|-------------|-----------|-------------|
| **OpenCode** *(ton agent principal)* | `~/.config/opencode/agents/` | `@nom-agent` dans le prompt, ou `/agents` pour lister | Délégation par l'agent principal |
| **Claude Code** | `~/.claude/agents/` | mention explicite (« utilise security-auditor ») | **Déclenchement auto par la description** — le plus Hands-off |
| **Freebuff / Codex** | `~/.agents/skills/agent-<nom>/SKILL.md` | _skills_ ciblées | Annoncés au catalogue, `triggers` par mots-clés |

Les skills portables vivent dans `agent-skills/skills/` et sont installés à côté des agents sur les trois hôtes.

---

## 3. Table de routage : tâche → agent + skills

| Si tu dois… | Agent principal | Skills à enchaîner | Hôte conseillé |
|---|---|---|---|
| **Corriger un bug** | `debugging-and-error-recovery` (skill) + `Senior Developer` | debugging → TDD (test qui reproduit) → code-review | OpenCode |
| **Ajouter une feature** | `Frontend Developer` ou `Backend Architect` | spec-driven → planning → incremental-implementation → TDD → code-review | OpenCode |
| **Revoir du code existant** | `Code Reviewer` (agent) + `code-review-and-quality` (skill) | evidence-collector (captures) → performance si UI | Claude Code (auto) |
| **Sécurité** | `Security Engineer` (ou `Security Auditor` racine) | security-audit (workflow complet) → threat modeling | Claude Code |
| **Performance web** | `web-performance-auditor` (agent racine) | performance-optimization → observability-and-instrumentation | OpenCode |
| **API / contrats** | `Backend Architect` | api-and-interface-design → deprecation-and-migration (breaking changes) | OpenCode |
| **Base de données** | `Database Optimizer` | observability (avant/après) | OpenCode |
| **UI/UX** | `UI Designer` + `UX Architect` | frontend-ui-engineering (accessibilité WCAG) → browser-testing-with-devtools | OpenCode |
| **Solana / Anchor / tokens** | `Solidity Smart Contract Engineer` (EVM) ou `Tokenomics Designer` (Solana) | `solana-dev-skill` → `solana-anchor-claude-skill` → `metaplex-skill` si NFT | OpenCode |
| **Smart contract security** | `Blockchain Security Auditor` | security-audit + MiCA si conformité EU | OpenCode |
| **Jeux (Unity/Godot/Unreal/Roblox)** | l'agent du moteur (`Unity Architect`, `Godot Gameplay Scripter`…) | `game-design` + `solana-game-skill` si economies on-chain | OpenCode |
| **Docs / ADR / README** | `Technical Writer` | documentation-and-adrs | n'importe |
| **Lancer / livrer** | `DevOps Automator` | shipping-and-launch (checklist) + observability | OpenCode |
| **CI/CD** | `DevOps Automator` | ci-cd-and-automation | OpenCode |
| **Git propre** | `Git Workflow Master` | git-workflow-and-versioning (toujours) | n'importe |
| **Requirement vague** | `Product Manager` | `interview-me` (une question à la fois) puis spec-driven | n'importe |
| **Décision d'architecture** | `Software Architect` | doubt-driven-development (revue adversariale) | Claude Code |
| **SEO / growth** | `SEO Specialist`, `Growth Hacker` | — | OpenCode |
| **Recherche marché** | `Trend Researcher`, `Investment Researcher` | source-driven-development | OpenCode |

---

## 4. Le pipeline par phases (le plus utile au quotidien)

```
1. CADRER      → interview-me (si flou)  ou  spec-driven-development (si clair)
2. PLANIFIER   → planning-and-task-breakdown  (+ doubt-driven-development si risqué)
3. IMPLÉMENTER → agent métier  +  incremental-implementation  +  test-driven-development
4. VÉRIFIER    → code-review-and-quality  +  (security-and-hardening si entrée non fiable)
5. LIVRER      → shipping-and-launch  +  git-workflow-and-versioning
```

Règles transverses :
- `constraint-driven-development` : écris tes seuils (couverture, perf, a11y) **avant**, l’agent ne doit pas les abaisser en douce.
- `doubt-driven-development` : pour tout ce qui est irréversible (auth, migration prod, déploiement).
- `source-driven-development` : si l'exactitude importe plus que la vitesse (API, SDK, framework qui évolue).
- `code-simplification` : après que ça marche, avant de merger.
- `context-engineering` : en début de session longue ou quand la qualité chute.
- `using-agent-skills` : la meta-skill qui décide quelle skill s'applique.

---

## 5. Skills par intention (copier-coller)

| Tu veux… | Skill |
|---|---|
| «faire clarifier la demande » avant de commencer | `interview-me` |
| «fais-moi un plan » | `planning-and-task-breakdown` |
| «avance par petits morceaux validables » | `incremental-implementation` |
| «écris les tests d'abord » | `test-driven-development` |
| «trouve la vraie cause » | `debugging-and-error-recovery` |
| «revois ça avant merge » | `code-review-and-quality` |
| «sécurise » | `security-and-hardening` (code) / `security-audit` (audit complet) |
| «optimise » | `performance-optimization` + observability |
| «documente la décision » | `documentation-and-adrs` |
| «migre sans casser » | `deprecation-and-migration` |
| «raccourcis tokens » | `headroom-compression` |
| «mémoire partagée » | `cognee-memory` |
| «bloque les régressions UI » | `browser-testing-with-devtools` |
| «teste dans un vrai navigateur » | idem (nécessite le MCP chrome-devtools) |
| «cadre la qualité » | `constraint-driven-development` |
| «simplifie » | `code-simplification` |

---

## 6. Mémoire partagée (cognee)

```bash
bash scripts/cognee-mcp-toggle.sh status   # état
bash scripts/cognee-mcp-toggle.sh on       # activer (le temps d'utiliser la mémoire)
bash scripts/cognee-mcp-toggle.sh off      # désactiver (défaut : coût au démarrage)
```

- **En activation** : coût ~19 s au démarrage d'OpenCode, ~314 Mo (jusqu'à 1,45 Go pic pendant l'extraction). D'où le « off » par défaut.
- **Interroger** : outil `cognee recall` (datasets `hub_architecture`, `hub_chatdeck`, `hub_agents`, `regles_memoire`).
- **Mémoriser** : outil `cognee remember`, ou en différé via `python3 scripts/cognee-deferred-add.py --dataset <d> --text "…"`.
- **Piège connu** : `list_dataset_data_json` exige un `dataset_id` (UUID), pas un nom.

---

## 7. Outils et services (état au 25/09/2026)

| Outil | Adresse / port | Usage | Coût |
|---|---|---|---|
| **OpenCode** | CLI | agent principal, 231 subagents | ~23 s de démarrage sans cognee |
| **ChatDeck** | http://localhost:5199 | chat LLM maison (Svelte 5 + TS + Vite), OpenRouter / NVIDIA / Cohere / Mistral | onglet, 0 Mo |
| **Headroom** | http://127.0.0.1:8787 | compression de tokens, LaunchAgent `ai.headroom.proxy` | ~9 % CPU à chaud |
| **cognee MCP** | stdio | mémoire partagée, 11 outils | off par défaut |
| **MCP Helius** | stdio | données Solana (npx préchauffé) | léger |
| **MCP Headroom** | stdio | outils de compression | léger |

**Clés** : tout part de `~/.secrets` (chmod 600). Ne jamais les coller dans un repo. `keys.local.json` (ChatDeck) est gitignore.

---

## 8. Contraintes de la machine (à connaître pour ne pas perdre de temps)

| Contrainte | Conséquence |
|---|---|
| **Mac Intel** | torch plafonné à **2.2.2**, numpy **< 2**, `scipy<1.14`, `onnxruntime<1.22`, `tokenizers<0.21`, `transformers==4.46.3` (cf. `~/.cognee/constraints.txt`) |
| **Nemotron 3 Super saturé** par moments | `Service temporarily overloaded` → bascule sur Cohere ou OpenRouter |
| **Cohere Command A** : max **8192** tokens de sortie | au-delà : `Bad Request` |
| **Mistral** souvent en 429 | clé en rate limit, ne pas insister |
| **OpenRouter** = provider principal | fiable, 458 modèles |
| **RAM saturée par les apps** (Claude.app, Brave, Freebuff) | un load average > 100 rend toute mesure et tout test inexploitable |

---

## 9. Ce qui n'existe plus

- **OpenHands / Agent Canvas** : supprimé le 24/09/2026 (2 Go, 200 % CPU). Les scripts de réparation `fix-openhands-*` ont également été retirés du repo le 25/09/2026 : plus rien à exécuter. Les fichiers de routage du pack public restent seulement pour sa compatibilité ; ils ne font pas partie des outils de cette installation.
- **Understudy** : testé puis désinstallé le 25/09/2026 (daemon npm cassé, tours d'agent à 1 min 55 s).

---

## 10. Aide-mémoire express

```bash
# Agents
opencode run -m cohere/command-a-03-2025 "…"   # modèle rapide
opencode run "@security-auditor revois ce diff" # agent explicite
claude "utilise test-engineer pour…"             # Claude Code, auto par description

# Mémoire
bash scripts/cognee-mcp-toggle.sh on
python3 scripts/cognee-deferred-add.py --dataset hub_x --text "…"

# Maintenance
bash scripts/cognee-mcp-toggle.sh status         # état de la mémoire partagée
node scripts/generate-agents-catalogue.js --check
(
  cd agent-skills/menubar-app
  node test-fr.js
  node test-custom.js
)
```

---

*Si ce protocole devient faux (outil supprimé, mesure périmée), corrige-le dans le même_commit que le changement — c'est le seul doc qui ne peut pas mentir.*
