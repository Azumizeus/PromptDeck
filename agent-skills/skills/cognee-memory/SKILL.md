---
name: cognee-memory
description: Interroge la mémoire partagée persistante des agents (serveur MCP cognee, local sur cette machine, datasets hub_architecture / hub_chatdeck / hub_agents). Use when the question porte sur l'historique, les décisions, les conventions ou la configuration du hub Mikael (projets, ports, stacks, providers, agents, scripts), quand l'utilisateur mentionne cognee, mémoire partagée, se souvenir, ou quand tu dois mémoriser une décision, une convention ou un fait durable. Contient la règle anti-hallucination : toujours appeler cognee recall avant de répondre sur le hub, et dire explicitement quand la mémoire est vide.
---

# cognee — mémoire partagée des agents

Mémoire longue persistante, **100 % locale** (ni Docker, ni clé LLM) : graphe de
connaissances Kuzu + index vectoriel LanceDB + métadonnées SQLite, servis via le
serveur MCP `cognee` (Cognee 1.30.0). Les agents OpenCode et Claude Code y ont accès.

## Règle d'or : ne jamais inventer

Les faits sur le hub de Mikael vivent dans la mémoire, pas dans les priori du modèle.
Un modèle qui répond sans avoir appelé l'outil **inventera** des valeurs crédibles
(React, Tailwind, port 5173…) : c'est observé, pas théorique.

1. Avant de répondre sur le hub, le port d'un projet, une stack, un provider :
   **appelle `cognee recall`**.
2. Si l'outil renvoie une erreur ou un résultat vide : réponds
   **« mémoire vide — je n'ai rien sur ce sujet »** et propose d'alimenter la mémoire.
3. N'hésite jamais à reformuler la query ou à tester un autre dataset : un recall
   à chaud répond en **0,6 s**.

## Datasets disponibles

| Dataset | Contenu |
|---|---|
| `hub_architecture` | `~/projects` = hub central, AGENTS.md/CLAUDE.md, `~/projects/REPOS.md`, scripts dans le repo PromptDeck, `~/.secrets` (chmod 600) |
| `hub_chatdeck` | ChatDeck : `~/projects/chatdeck`, Svelte 5 + TS + Vite, port 5199, providers, `keys.local.json` gitignore, proxy Vite anti-CORS |
| `hub_agents` | OpenCode (config, modèles, MCP helius/headroom), Headroom port 8787 + LaunchAgent, OpenHands supprimé le 25/09/2026, contraintes Mac Intel (torch 2.2.2, numpy<2) |
| `regles_memoire` | Les règles ci-dessous (auto-référentes) |
| `probe`, `ram_probe` | Datasets de contrôle des tests techniques |

## Appeler les outils

```
cognee recall   { "query": "…", "datasets": "hub_agents" }        → 0,6 s à chaud
cognee remember { "data": "…", "dataset_name": "hub_agents" }      → 20–70 s (1ᵉʳᵉ fois)
cognee forget   { … }                                              → supprimer
```

Pièges mesurés (ils coûtent du temps si on les ignore) :

- **`cognee_list_dataset_data_json` exige `dataset_id`**, pas le nom du dataset.
  Appelle d'abord `cognee_list_datasets_json` pour récupérer l'UUID.
- **Un `remember` ne se voit qu'après le pipeline complet** (extraction GLiNER +
  embeddings). Si les écritures sont envoyées dans des processus séparés ou trop
  rapides, le dataset contient des données mais `recall` répond
  « no data has been added ». **Rejoue le `remember` dans un seul appel** et
  attends `status=completed`.
- Le CLI `cognee-cli` et le serveur MCP n'ont pas toujours la même vue des
  datasets : **privilégie les outils MCP** pour lire et écrire la mémoire partagée.

## Mémoriser une décision

Appelle `cognee remember` avec une phrase **autonome et datée** : le fait doit être
compréhensible hors contexte (« ChatDeck utilise le port 5199, pas 5173 »).
Évite les pronouns et les références implicites au fil de conversation.

## Coût mesuré (IMPORTANT pour cet agent)

Le serveur MCP est **lourd** : ~31 s de démarrage, 314 Mo après `initialize`,
718 Mo après un premier `recall`, **1,45 Go au pic** pendant l'extraction GLiNER.
C'est pourquoi il est **désactivé par défaut** dans les configs agents.

```bash
bash scripts/cognee-mcp-toggle.sh status   # état
bash scripts/cognee-mcp-toggle.sh on       # activer le temps d'utiliser la mémoire
bash scripts/cognee-mcp-toggle.sh off      # désactiver (défaut au quotidien)
```

Ne demande pas à l'utilisateur de l'activer à chaque fois : rappelle le coût une fois,
puis travaille.

## Modèle de démonstration

Nemotron 3 Super (modèle par défaut d'OpenCode) est **souvent saturé** et peut répondre
`Service temporarily overloaded` ; quand c'est le cas, ce n'est pas un bug de la mémoire.
Cohere Command A est rapide mais suit mal les procédures d'outils : pour un aller-retour
mémoire fiable, demande le texte brut renvoyé par l'outil et ne te fie pas à une
phrase composée par le modèle.
