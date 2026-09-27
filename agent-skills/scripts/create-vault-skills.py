#!/usr/bin/env python3
"""
create-vault-skills.py — crée les 38 skills du « My Claude resource vault ».

Les 40 ajouts listés dans le vault (notes perso) : headroom existe déjà
(skills/headroom-compression) et graphify a été fusionné depuis l'ancien
layout — les 38 restants sont créés ici, conformes à docs/skill-anatomy.md
(5 sections, description avec trigger « Use when », name == dossier).

Ajoute aussi leurs traductions FR dans interface/i18n-fr.json (clé = champ
name). Ré-exécutable : un skill existant n'est jamais écrasé.
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
I18N = ROOT / "interface" / "i18n-fr.json"

# (slug, description EN avec trigger, nom FR, description FR)
SKILLS_DATA = [
    ("learn-claude-code",
     "Learning resource explaining how Claude Code agents work: subagents, hooks, skills and MCP. Use when learning or teaching the agent model before building custom workflows.",
     "Apprendre Claude Code",
     "Ressource d'apprentissage : comment fonctionnent les agents Claude Code (subagents, hooks, skills, MCP). À utiliser pour comprendre le modèle d'agents avant d'en construire."),
    ("karpathy-skills",
     "Coding discipline checks inspired by Andrej Karpathy: no over-engineering, no premature abstraction, no clever code. Use when simplifying code or reviewing design choices.",
     "Discipline Karpathy",
     "Vérifications de discipline inspirées de Karpathy : pas de sur-ingénierie, pas d'abstraction prématurée, pas de code trop malin. À utiliser pour simplifier du code ou relire des choix de conception."),
    ("superpowers",
     "Plan-build-test workflow framework with brainstorming, planning and TDD enforcement skills. Use when driving a feature from idea to tested implementation.",
     "Superpowers",
     "Cadre de workflow planifier-construire-tester avec brainstorming, planification et TDD imposé. À utiliser pour mener une fonctionnalité de l'idée au code testé."),
    ("ponytail",
     "Keep-it-simple coding discipline: small diffs, few abstractions, no speculative generality. Use when writing or reviewing code to fight over-engineering.",
     "Simplicité (Ponytail)",
     "Discipline de simplicité : petits diffs, peu d'abstractions, pas de généricité spéculative. À utiliser en écriture ou relecture de code contre la sur-ingénierie."),
    ("gstack",
     "Planning and review workflow layer with task graphs, gates and sign-offs. Use when a multi-step project needs checkpoints and structured reviews.",
     "Gstack",
     "Couche de planification et de revue : graphes de tâches, points de contrôle et validations. À utiliser quand un projet multi-étapes exige des jalons et des revues structurées."),
    ("ecc",
     "Bundles skills, persistent memory and pre-flight checks for Claude Code in one install. Use when an assistant needs structure, memory and safety checks together.",
     "ECC",
     "Regroupe skills, mémoire persistante et vérifications préalables pour Claude Code. À utiliser quand un assistant a besoin de structure, de mémoire et de garde-fous ensemble."),
    ("oh-my-claudecode",
     "Agent-team coordination patterns: orchestrator, specialists and hand-offs. Use when decomposing a project across several coding agents.",
     "Coordination d'équipes d'agents",
     "Schémas de coordination d'équipes d'agents : orchestrateur, spécialistes, passations. À utiliser pour découper un projet entre plusieurs agents de code."),
    ("archon",
     "Build repeatable coding workflows from templates: scaffold, refine, verify. Use when turning an ad-hoc process into a reusable pipeline.",
     "Archon",
     "Construit des workflows reproductibles à partir de modèles : échafaudage, raffinement, vérification. À utiliser pour transformer un processus ad-hoc en pipeline réutilisable."),
    ("taste-skill",
     "Design taste rubric for interfaces: hierarchy, spacing, contrast and restraint. Use when reviewing UI aesthetics or before shipping an interface.",
     "Go design",
     "Grille de goût pour les interfaces : hiérarchie, espacement, contraste et retenue. À utiliser en revue esthétique d'UI ou avant de livrer un écran."),
    ("anthropics-skills",
     "Curated index of Anthropic's official example skills (documents, artifacts, web tooling). Use when looking for a canonical implementation before writing a new skill.",
     "Skills officiels Anthropic",
     "Index des skills officiels d'Anthropic (documents, artifacts, outillage web). À utiliser pour chercher une implémentation canonique avant d'écrire un nouveau skill."),
    ("mattpocock-skills",
     "TypeScript-focused engineering skills on types, generics and API design. Use when writing or reviewing type-heavy TypeScript.",
     "Skills TypeScript (Matt Pocock)",
     "Skills d'ingénierie TypeScript : types, génériques, design d'API. À utiliser en écriture ou relecture de TS fortement typé."),
    ("wshobson-agents",
     "Large library of specialist subagent definitions across engineering, design and data. Use when a task needs a domain expert persona to delegate to.",
     "Agents spécialistes (wshobson)",
     "Grande bibliothèque de définitions de subagents spécialistes (ingénierie, design, data). À utiliser quand une tâche réclame une persona experte à qui déléguer."),
    ("claude-plugins",
     "Catalog of official and community Claude Code plugins with install instructions. Use when extending Claude Code before building from scratch.",
     "Plugins Claude",
     "Catalogue de plugins Claude Code officiels et communautaires avec instructions d'installation. À utiliser pour étendre Claude Code avant de réinventer."),
    ("addyosmani-skills",
     "Engineering quality checks: code review, TDD and debugging discipline. Use when enforcing workflow discipline on code tasks.",
     "Contrôles qualité (Addy Osmani)",
     "Contrôles qualité d'ingénierie : revue de code, TDD, discipline de débogage. À utiliser pour imposer une discipline de workflow sur les tâches de code."),
    ("ui-ux-pro-max",
     "Senior UI/UX guidance: design systems, accessibility, interaction patterns and copy. Use when designing or auditing product interfaces end to end.",
     "UI/UX Pro",
     "Conseils UI/UX senior : design systems, accessibilité, patterns d'interaction, contenus. À utiliser pour concevoir ou auditer des interfaces produit de bout en bout."),
    ("awesome-claude-skills",
     "Community index of Claude skills with categories and picks. Use when discovering existing skills instead of writing new ones.",
     "Annuaire de skills communautaires",
     "Index communautaire de skills Claude, classés et commentés. À utiliser pour découvrir des skills existants plutôt que d'en écrire."),
    ("planning-with-files",
     "Keep plans, decisions and progress in plain files next to the code so any agent can resume. Use when work spans multiple sessions or agents.",
     "Planification en fichiers",
     "Garde plans, décisions et avancement dans des fichiers simples à côté du code, repris par n'importe quel agent. À utiliser quand le travail s'étale sur plusieurs sessions."),
    ("claude-mem",
     "Persistent memory layer for Claude Code: recall decisions and facts across sessions. Use when the assistant should remember past work.",
     "Mémoire persistante (claude-mem)",
     "Couche de mémoire persistante pour Claude Code : se souvenir des décisions et faits entre les sessions. À utiliser quand l'assistant doit retenir le travail passé."),
    ("codegraph",
     "Map code relationships (imports, call graphs, modules) into a queryable graph. Use when navigating or refactoring an unfamiliar codebase.",
     "Graphe de code",
     "Cartographie les relations du code (imports, graphes d'appels, modules) en graphe requêtable. À utiliser pour naviguer ou refactorer une base inconnue."),
    ("repomix",
     "Pack an entire repository into one AI-friendly file with structure and headers. Use when sharing a codebase with an LLM that cannot browse files.",
     "Repomix",
     "Compile un dépôt entier en un seul fichier structuré et lisible par un LLM. À utiliser pour partager une base de code avec un modèle qui ne peut pas parcourir les fichiers."),
    ("agentmemory",
     "Give agents persistent, structured memory stores: facts, preferences and project state. Use when long-lived agents need recall beyond the context window.",
     "Mémoire d'agents",
     "Donne aux agents une mémoire persistante et structurée : faits, préférences, état projet. À utiliser quand un agent durable doit se rappeler au-delà de la fenêtre de contexte."),
    ("beads",
     "Track work items across sessions with a local issue ledger synced to git. Use when tasks outlive a single chat session.",
     "Beads (suivi de tâches)",
     "Suit les tâches entre les sessions via un registre local synchronisé à git. À utiliser quand les tâches survivent à une session de chat."),
    ("multica",
     "Assign issues from GitHub to coding agents and route results back. Use when triaging work across several AI coding agents.",
     "Multica (assignation d'issues)",
     "Assigne des issues GitHub à des agents de code et achemine leurs résultats. À utiliser pour répartir le travail entre plusieurs agents IA."),
    ("firecrawl",
     "Turn websites into clean markdown and text for LLM consumption: crawl, scrape, search. Use when an agent needs reliable web content.",
     "Firecrawl",
     "Transforme des sites web en markdown/texte propres pour les LLM : crawl, scrape, recherche. À utiliser quand un agent a besoin de contenu web fiable."),
    ("cc-switch",
     "Manage and switch between coding tool configurations: APIs, providers, settings. Use when juggling several Claude or Codex setups.",
     "CC Switch (configurations)",
     "Gère et bascule entre plusieurs configurations d'outils de code : API, providers, réglages. À utiliser quand on jongle entre plusieurs setups Claude/Codex."),
    ("context7",
     "Fetch up-to-date library documentation on demand for coding agents. Use when answers need current API docs instead of training-data guesses.",
     "Context7 (docs à jour)",
     "Récupère à la demande la documentation à jour des bibliothèques pour les agents. À utiliser quand une réponse exige des docs actuelles plutôt qu'une approximation de mémoire."),
    ("vibe-kanban",
     "Kanban board to manage agent tasks and monitor their progress. Use when orchestrating many agent jobs visually.",
     "Vibe Kanban",
     "Tableau kanban pour gérer les tâches des agents et suivre leur avancement. À utiliser pour orchestrer visuellement de nombreux travaux d'agents."),
    ("github-mcp",
     "MCP server exposing GitHub issues, PRs, repos and actions to Claude. Use when automating GitHub workflows from a chat.",
     "GitHub MCP",
     "Serveur MCP exposant issues, PR, dépôts et actions GitHub à Claude. À utiliser pour automatiser des workflows GitHub depuis un chat."),
    ("playwright-mcp",
     "MCP server letting Claude drive a real browser via Playwright. Use when testing or inspecting web apps end to end.",
     "Playwright MCP",
     "Serveur MCP permettant à Claude de piloter un vrai navigateur via Playwright. À utiliser pour tester ou inspecter des apps web de bout en bout."),
    ("serena",
     "Semantic code search and edit toolkit backed by the language server. Use when precise, symbol-level code navigation matters more than grep.",
     "Serena (navigation sémantique)",
     "Boîte à outils de recherche et d'édition sémantique du code (LSP). À utiliser quand la navigation au niveau des symboles compte plus que grep."),
    ("claude-code-router",
     "Route Claude Code requests across providers and models with rules. Use when optimizing cost, speed or availability of model calls.",
     "Routeur Claude Code",
     "Aiguise les requêtes de Claude Code entre providers et modèles selon des règles. À utiliser pour optimiser coût, vitesse ou disponibilité des appels."),
    ("awesome-mcp-servers",
     "Curated directory of MCP servers with categories and quality notes. Use when looking for a connector before building one.",
     "Annuaire de serveurs MCP",
     "Répertoire commenté de serveurs MCP, classés par catégorie. À utiliser pour chercher un connecteur existant avant d'en construire un."),
    ("system-prompts-ai",
     "Study collection of real system prompts from AI tools. Use when designing or benchmarking your own system prompts.",
     "Prompts système (étude)",
     "Collection de vrais prompts système d'outils IA pour les étudier. À utiliser pour concevoir ou comparer ses propres prompts système."),
    ("best-practice",
     "Collected best practices for Claude Code usage: CLAUDE.md, permissions, workflows. Use when tuning a personal or team setup.",
     "Bonnes pratiques Claude Code",
     "Recueil de bonnes pratiques Claude Code : CLAUDE.md, permissions, workflows. À utiliser pour régler un setup personnel ou d'équipe."),
    ("codex-plugin-cc",
     "Plugin bringing OpenAI Codex reviews into Claude Code. Use when adding a second model's review perspective to a workflow.",
     "Codex dans Claude Code",
     "Plugin qui apporte les revues d'OpenAI Codex dans Claude Code. À utiliser pour ajouter l'œil d'un second modèle à ses revues."),
    ("claude-hud",
     "Display session usage, context and cost in the terminal while coding. Use when monitoring token burn and limits during long sessions.",
     "Claude HUD (usage)",
     "Affiche usage, contexte et coût de la session dans le terminal. À utiliser pour surveiller la consommation de tokens sur les longues sessions."),
    ("rtk",
     "Trim and colorize command output so agents read less noise. Use when tool output floods the context window.",
     "RTK (sorties élaguées)",
     "Élague et colorise les sorties de commandes pour que les agents lisent moins de bruit. À utiliser quand les sorties d'outils noient la fenêtre de contexte."),
    ("caveman",
     "Style directive making Claude answer in terse, minimal replies. Use when you want much shorter answers.",
     "Caveman (réponses brèves)",
     "Consigne de style : réponses très courtes et minimales. À utiliser quand on veut des réponses bien plus brèves."),
]


def body(name, desc):
    return f"""---

# {name}

<!-- Skill issu du « My Claude resource vault » (40 ajouts recommandés pour Claude Code). -->

## Overview

{desc}

## When to Use

- {desc.rsplit("Use when", 1)[0].strip()}Use when the situation matches the description above.
- Ouvre le dépôt source indiqué dans l'Overview et suis ses instructions d'installation.

## Common Rationalizations

- « Cas simple, pas besoin de la méthode » — c'est justement pour les cas simples qu'elle est faite.
- « Pas le temps de suivre les étapes » — les étapes font gagner du temps au total.
- « Je referai la vérification plus tard » — il n'y a pas de plus tard.

## Red Flags

- Utiliser ce skill sans avoir lu la procédure du dépôt source.
- Déclarer terminé sans vérification observable.
- Empiler plusieurs skills sans savoir lequel pilote.

## Verification

- [ ] La procédure du dépôt source a été suivie de bout en bout.
- [ ] Le résultat attendu a été observé (pas seulement supposé).
- [ ] Aucune étape sautée sous pression de temps.
"""


def main():
    dry = "--dry-run" in sys.argv
    created = skipped = 0
    for slug, desc, name_fr, desc_fr in SKILLS_DATA:
        d = SKILLS / slug
        if (d / "SKILL.md").exists():
            skipped += 1
            continue
        if not dry:
            d.mkdir(parents=True, exist_ok=True)
            (d / "SKILL.md").write_text(
                f"---\nname: {slug}\nlicense: MIT\ndescription: {desc}\n---\n" + body(slug, desc),
                encoding="utf-8",
            )
        created += 1

    i18n_path = I18N
    data = json.loads(i18n_path.read_text(encoding="utf-8"))
    added = 0
    for slug, desc, name_fr, desc_fr in SKILLS_DATA:
        if slug not in data:
            data[slug] = {"name": name_fr, "desc": desc_fr}
            added += 1
    if not dry:
        i18n_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"skills créés : {created} · déjà présents : {skipped} · traductions i18n ajoutées : {added}")


if __name__ == "__main__":
    main()
