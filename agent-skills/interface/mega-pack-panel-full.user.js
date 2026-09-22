// ==UserScript==
// @name         MEGA PACK Panel Luxe — Skills, Agents & Équipes pour tout LLM
// @namespace    mega-pack
// @version      2.6.0
// @description  Panneau flottant Édition Luxe dans une fenêtre macOS : 131 skills + 190 agents + 🕸 équipes + ✍️ prompts perso + ★ favoris, recherche instantanée, tooltip expert, clic droit multi-LLM, sélecteur de LLM par défaut, composeur ⌘-clic — injectable dans n'importe quelle conversation LLM (Claude, ChatGPT, Gemini, Perplexity, Mistral, OpenCode Web…)
// @author       MEGA PACK
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

// ── Catalogue complet embarqué (généré par build-userscript.py) ───────────
// Catalogue complet MEGA PACK v0.7.0 — généré par build-interface.py
// Skills: 131 | Agents: 190
const MEGA_CATALOG = {
 "meta": {
  "generated": "2026-09-20",
  "version": "0.7.0",
  "skills": 131,
  "agents": 190
 },
 "skills": [
  {
   "name": "api-and-interface-design",
   "desc": "Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.",
   "category": "api-and-interface-design",
   "path": "skills/api-and-interface-design/",
   "name_fr": "Conception d'API et d'interfaces",
   "desc_fr": "Guide la conception d'API et d'interfaces stables. À utiliser pour concevoir des API, des frontières de modules ou toute interface publique : endpoints REST/GraphQL, contrats de types, frontières front/back."
  },
  {
   "name": "quicknode-skill",
   "desc": "Quicknode blockchain infrastructure including RPC endpoints (80+ chains), Streams (real-time data), Webhooks, IPFS storage, Marketplace Add-ons (Token API, NFT API, DeFi tools), Solana DAS API (Digital Asset Standard), KV Store, gRPC streaming (Yellowstone for Solana, Hypercore for Hyperliquid), SQL",
   "category": "blockchain-skills",
   "path": "skills/blockchain-skills/quicknode-skill/",
   "name_fr": "Quicknode (multi-chaînes)",
   "desc_fr": "Infrastructure blockchain Quicknode : endpoints RPC (80+ chaînes), Streams (données temps réel), Webhooks, stockage IPFS, Add-ons Marketplace (Token API, NFT API, outils DeFi), DAS API Solana, KV Store et streaming gRPC."
  },
  {
   "name": "browser-testing-with-devtools",
   "desc": "Tests in real browsers via Chrome DevTools MCP. Use when building or debugging anything that runs in a browser. Use when you need to inspect the DOM, capture console errors, analyze network requests, profile performance, or verify visual output with real runtime data. Requires the chrome-devtools MC",
   "category": "browser-testing-with-devtools",
   "path": "skills/browser-testing-with-devtools/",
   "name_fr": "Tests navigateur avec DevTools",
   "desc_fr": "Teste dans de vrais navigateurs via Chrome DevTools MCP : inspection du DOM, erreurs console, requêtes réseau, profil de performance et vérification visuelle avec des données d'exécution réelles."
  },
  {
   "name": "ci-cd-and-automation",
   "desc": "Automates CI/CD pipeline setup. Use when setting up or modifying build and deployment pipelines. Use when you need to automate quality gates, configure test runners in CI, or establish deployment strategies.",
   "category": "ci-cd-and-automation",
   "path": "skills/ci-cd-and-automation/",
   "name_fr": "CI/CD et automatisation",
   "desc_fr": "Automatise la mise en place des pipelines CI/CD : quality gates, test runners en CI et stratégies de déploiement."
  },
  {
   "name": "code-review-and-quality",
   "desc": "Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.",
   "category": "code-review-and-quality",
   "path": "skills/code-review-and-quality/",
   "name_fr": "Revue de code et qualité",
   "desc_fr": "Mène une revue de code multi-axes. À utiliser avant toute fusion, pour évaluer la qualité d'un code écrit par vous-même, un autre agent ou un humain."
  },
  {
   "name": "code-simplification",
   "desc": "Simplifies code for clarity. Use when refactoring code for clarity without changing behavior. Use when code works but is harder to read, maintain, or extend than it should be. Use when reviewing code that has accumulated unnecessary complexity.",
   "category": "code-simplification",
   "path": "skills/code-simplification/",
   "name_fr": "Simplification de code",
   "desc_fr": "Simplifie le code pour plus de clarté, sans changer le comportement. À utiliser quand le code fonctionne mais est plus difficile à lire, maintenir ou étendre qu'il ne devrait l'être."
  },
  {
   "name": "constraint-driven-development",
   "desc": "Establishes a project's quality bar as a written contract and stops agents quietly lowering it. Interviews the user on which dimensions matter, supplies sane default thresholds when they have no number in mind, records everything in CONSTRAINTS.md, and watches the diff for a weakened bar — new @ts-i",
   "category": "constraint-driven-development",
   "path": "skills/constraint-driven-development/",
   "name_fr": "Développement piloté par contraintes",
   "desc_fr": "Établit la barre qualité d'un projet comme un contrat écrit et empêche les agents de la baisser en silence : entretien sur les dimensions qui comptent, seuils par défaut sains, CONSTRAINTS.md et surveillance du diff."
  },
  {
   "name": "context-engineering",
   "desc": "Optimizes agent context setup. Use when starting a new session, when agent output quality degrades, when switching between tasks, or when you need to configure rules files and context for a project.",
   "category": "context-engineering",
   "path": "skills/context-engineering/",
   "name_fr": "Ingénierie du contexte",
   "desc_fr": "Optimise la configuration du contexte d'un agent : démarrage de session, qualité dégradée, changement de tâche, fichiers de règles et contexte d'un projet."
  },
  {
   "name": "debugging-and-error-recovery",
   "desc": "Guides systematic root-cause debugging. Use when tests fail, builds break, something that worked yesterday broke, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need to figure out what broke and why — a systematic approach to finding and fixing the root caus",
   "category": "debugging-and-error-recovery",
   "path": "skills/debugging-and-error-recovery/",
   "name_fr": "Debug et récupération d'erreur",
   "desc_fr": "Guide le debug systématique par cause racine : tests qui échouent, builds cassés, comportements inattendus — trouver ce qui a cassé et pourquoi avant de corriger."
  },
  {
   "name": "deprecation-and-migration",
   "desc": "Manages deprecation and migration. Use when removing old systems, APIs, or features. Use when migrating users from one implementation to another. Use when migrating a database schema in production, such as renaming or dropping a column without downtime (expand/contract). Use when deciding whether to",
   "category": "deprecation-and-migration",
   "path": "skills/deprecation-and-migration/",
   "name_fr": "Dépréciation et migration",
   "desc_fr": "Gère dépréciation et migration : retrait d'anciens systèmes/API/fonctionnalités, migration d'utilisateurs et de schémas de base sans interruption (expand/contract)."
  },
  {
   "name": "documentation-and-adrs",
   "desc": "Records decisions and documentation. Use when you need to document an architecture decision (ADR) or the reasoning behind a design choice, when changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.",
   "category": "documentation-and-adrs",
   "path": "skills/documentation-and-adrs/",
   "name_fr": "Documentation et ADR",
   "desc_fr": "Enregistre décisions et documentation : ADR d'architecture, choix de conception, évolutions d'API publiques et contexte utile aux futurs ingénieurs et agents."
  },
  {
   "name": "doubt-driven-development",
   "desc": "Subjects every non-trivial decision to a fresh-context adversarial review before it stands. Use when you want every assumption cross-examined before proceeding, when stress-testing a plan for hidden failure modes, when correctness matters more than speed, when working in unfamiliar code, when stakes",
   "category": "doubt-driven-development",
   "path": "skills/doubt-driven-development/",
   "name_fr": "Développement piloté par le doute",
   "desc_fr": "Soumet chaque décision non triviale à une revue adversariale à contexte frais : hypothèses contre-interrogées, plans stress-testés, quand l'exactitude prime sur la vitesse."
  },
  {
   "name": "frontend-ui-engineering",
   "desc": "Builds production-quality, accessible, responsive user-facing UIs. Use when building or modifying interfaces and pages, creating components, implementing layouts, meeting WCAG accessibility requirements, managing state, or when the output needs to look and feel production-quality rather than AI-gene",
   "category": "frontend-ui-engineering",
   "path": "skills/frontend-ui-engineering/",
   "name_fr": "Ingénierie UI frontend",
   "desc_fr": "Construit des interfaces production, accessibles et responsives : composants, layouts, exigences WCAG, gestion d'état — un rendu de qualité production, pas « généré par IA »."
  },
  {
   "name": "Game Audio Direction",
   "desc": "Defines a coherent musical identity, loops, mixing, and audio prompts. Use to compose, generate, or integrate a game's music.",
   "category": "game-design",
   "path": "skills/game-design/game-audio-direction/",
   "name_fr": "Direction audio de jeu",
   "desc_fr": "Définit une identité musicale cohérente, les boucles, le mixage et les prompts audio. À utiliser pour composer, générer ou intégrer la musique d’un jeu."
  },
  {
   "name": "Motion & Animation System",
   "desc": "Generic framework for specifying performant, useful, and accessible UI motion; use for transitions, feedback, and orchestration in any digital product.",
   "category": "game-design",
   "path": "skills/game-design/motion-design-system/",
   "name_fr": "Motion & Animation System",
   "desc_fr": "Cadre générique pour spécifier une motion UI performante, utile et accessible ; à utiliser pour transitions, feedbacks et orchestration dans tout produit numérique."
  },
  {
   "name": "Pixel Art & Audio Direction",
   "desc": "Generic framework for directing pixel art, sprites, animation, and game audio with coherence, readability, and measurable constraints; use in pre-production and production.",
   "category": "game-design",
   "path": "skills/game-design/pixel-art-audio-direction/",
   "name_fr": "Pixel Art & Audio Direction",
   "desc_fr": "Cadre générique pour diriger pixel art, sprites, animation et audio de jeu avec cohérence, lisibilité et contraintes mesurables ; à utiliser en préproduction et production."
  },
  {
   "name": "Pixel Art Palette Discipline",
   "desc": "Enforces consistent palette, grid, contrast, and scaling for pixel art assets. Use to generate, audit, or integrate sprites.",
   "category": "game-design",
   "path": "skills/game-design/pixel-art-palette-discipline/",
   "name_fr": "Discipline de palette pixel art",
   "desc_fr": "Impose palette, grille, contraste et mise à l’échelle cohérents pour les assets pixel art. À utiliser pour générer, auditer ou intégrer des sprites."
  },
  {
   "name": "Seeker Strike Mobile",
   "desc": "Applies Seeker Strike's mobile/Solana conventions; use to maintain its Canvas 2D shoot'em up, its WebView wrapper, its SKR/GC economy, and its audit fixes.",
   "category": "game-design",
   "path": "skills/game-design/seeker-strike-mobile/",
   "name_fr": "Seeker Strike Mobile",
   "desc_fr": "Applique les conventions mobiles/Solana de Seeker Strike et s’utilise pour maintenir son shoot’em up Canvas 2D, son wrapper WebView, son économie SKR/GC et ses corrections d’audit."
  },
  {
   "name": "Premium Visual Design System",
   "desc": "Generic framework for designing, auditing, and evolving an accessible premium interface; use for any web, mobile, desktop, or in-game UI.",
   "category": "game-design",
   "path": "skills/game-design/visual-design-premium/",
   "name_fr": "Premium Visual Design System",
   "desc_fr": "Cadre générique pour concevoir, auditer et faire évoluer une interface premium accessible ; à utiliser pour toute UI web, mobile, desktop ou in-game."
  },
  {
   "name": "Visual Rendering & Game Feel",
   "desc": "Diagnoses and improves 2D rendering through bloom, pixel density, lighting, outlines, and impact feedback. Use when the game looks flat or inconsistent.",
   "category": "game-design",
   "path": "skills/game-design/visual-rendering-game-feel/",
   "name_fr": "Rendu visuel et game feel",
   "desc_fr": "Diagnostique et améliore le rendu 2D par bloom, densité de pixels, lumière, contours et feedback d’impact. À utiliser quand le jeu paraît plat ou incohérent."
  },
  {
   "name": "git-workflow-and-versioning",
   "desc": "Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, splitting uncommitted work in a messy working tree into clean atomic commits, opening or reviewing a pull request (PR), pushing to a remote, or when you need to organize work acro",
   "category": "git-workflow-and-versioning",
   "path": "skills/git-workflow-and-versioning/",
   "name_fr": "Workflow Git et versioning",
   "desc_fr": "Structure les pratiques Git : commits atomiques, branches, résolution de conflits, découpe d'un arbre sale en commits propres, PR et push distant."
  },
  {
   "name": "idea-refine",
   "desc": "Refines raw ideas into sharp, actionable concepts through structured divergent and convergent thinking. Use when an idea is still vague, when you need to stress-test assumptions before committing to a plan, or when you want to expand options before converging on one. Triggers on \"ideate\", \"refine th",
   "category": "idea-refine",
   "path": "skills/idea-refine/",
   "name_fr": "Affinage d'idée",
   "desc_fr": "Affine les idées brutes en concepts nets et actionnables par pensée divergente puis convergente : stress-test des hypothèses et élargissement des options avant de trancher."
  },
  {
   "name": "incremental-implementation",
   "desc": "Delivers changes incrementally in thin, verifiable slices. Use when implementing any feature or change that touches more than one file, or when picking up the next task from a plan. Use when rolling a change out behind a feature flag, when you're about to write a large amount of code at once, or whe",
   "category": "incremental-implementation",
   "path": "skills/incremental-implementation/",
   "name_fr": "Implémentation incrémentale",
   "desc_fr": "Livrer par tranches fines et vérifiables : features multi-fichiers, reprise de tâche, déploiement derrière feature flag, et éviter les gros blobs de code d'un coup."
  },
  {
   "name": "integrating-jupiter",
   "desc": "Comprehensive guidance for integrating Jupiter APIs (Swap, Lend, Perps, Trigger, Recurring, Tokens, Price, Portfolio, Prediction Markets, Send, Studio, Lock, Routing). Use for endpoint selection, integration flows, error handling, and production hardening.",
   "category": "integrating-jupiter",
   "path": "skills/integrating-jupiter/integrating-jupiter/",
   "name_fr": "Intégration Jupiter (guide)",
   "desc_fr": "Guide complet d'intégration des APIs Jupiter (Swap, Lend, Perps, Trigger, Recurring, Tokens, Price, Portfolio, Prediction Markets, Send, Studio, Lock, Routing) : sélection d'endpoints, flux, gestion d'erreurs et durcissement production."
  },
  {
   "name": "jupiter-lend",
   "desc": "Interact with Jupiter Lend Protocol. Read-only SDK (@jup-ag/lend-read) for querying liquidity pools, lending markets (jlTokens), and vaults. Write SDK (@jup-ag/lend) for lending (deposit/withdraw) and vault operations (deposit collateral, borrow, repay, manage positions).",
   "category": "integrating-jupiter",
   "path": "skills/integrating-jupiter/jupiter-lend/",
   "name_fr": "Jupiter Lend",
   "desc_fr": "Interagis avec le protocole Jupiter Lend : SDK lecture (@jup-ag/lend-read) pour pools de liquidité, marchés de prêt (jlTokens) et vaults ; SDK écriture (@jup-ag/lend) pour deposit/withdraw et opérations de vault (collatéral, borrow, repay, positions)."
  },
  {
   "name": "jupiter-swap-migration",
   "desc": "Migration guide from Jupiter Metis (v1) or Ultra to Swap API v2. Use when migrating existing Jupiter swap integrations, updating base URLs, or transitioning from quote+swap-instructions to the unified build endpoint.",
   "category": "integrating-jupiter",
   "path": "skills/integrating-jupiter/jupiter-swap-migration/",
   "name_fr": "Migration Jupiter Swap v2",
   "desc_fr": "Guide de migration depuis Jupiter Metis (v1) ou Ultra vers la Swap API v2 : migrer les intégrations existantes, mettre à jour les URLs de base et passer de quote+swap-instructions à l'endpoint build unifié."
  },
  {
   "name": "jupiter-vrfd",
   "desc": "Use when a user mentions Jupiter token verification, VRFD eligibility, paying 1000 JUP to verify a token, submitting a verification request, or updating metadata via the Jupiter express verification flow.",
   "category": "integrating-jupiter",
   "path": "skills/integrating-jupiter/jupiter-vrfd/",
   "name_fr": "Jupiter VRFD (vérification)",
   "desc_fr": "Pour la vérification de tokens Jupiter : éligibilité VRFD, paiement des 1000 JUP de vérification, soumission de demande et mise à jour des métadonnées via le flux express de vérification Jupiter."
  },
  {
   "name": "interview-me",
   "desc": "Extracts what the user actually wants instead of what they think they should want. Achieves this through one-question-at-a-time interview until ~95% confidence about the underlying intent. Use when an ask is underspecified (\"build me X\" without \"for whom\" or \"why now\"), when the user explicitly invo",
   "category": "interview-me",
   "path": "skills/interview-me/",
   "name_fr": "Interviewe-moi",
   "desc_fr": "Extrait ce que l'utilisateur veut vraiment via un entretien une-question-à-la fois jusqu'à ~95 % de confiance sur l'intention sous-jacente, quand la demande est sous-spécifiée."
  },
  {
   "name": "solana-rent-free-dev",
   "desc": "Skill for Solana development using rent-free primitives from Light Protocol. Covers client development (TypeScript, Rust) and program development (Rust) across Anchor, native Rust, and Pinocchio. Focus areas include DeFi and Payments (Light Token, Light-PDA). Other use cases include airdrops and tok",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/agent-dev-orchestrator/",
   "name_fr": "Solana rent-free (Light)",
   "desc_fr": "Skill de développement Solana avec les primitives rent-free de Light Protocol : développement client (TypeScript, Rust) et programme (Rust) avec Anchor, Rust natif et Pinocchio. Focus DeFi et paiements (Light Token, Light-PDA)."
  },
  {
   "name": "ask-mcp",
   "desc": "For questions about Light Protocol's SDK, smart contracts and Solana development, Claude Code features, or agent skills. AI-powered answers grounded in repository context via DeepWiki MCP.",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/ask-mcp/",
   "name_fr": "ask-mcp (questions Light Protocol)",
   "desc_fr": "Pour toute question sur le SDK de Light Protocol, les smart contracts, le développement Solana, les fonctionnalités Claude Code ou les agent skills. Réponses IA ancrées dans le contexte du dépôt via DeepWiki MCP."
  },
  {
   "name": "data-streaming",
   "desc": "For data pipelines, aggregators, or indexers, real-time account state streaming on Solana with light account hot/cold lifecycle tracking. Stream Light token accounts, mint accounts, and PDAs via Laserstream gRPC.",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/data-streaming/",
   "name_fr": "data-streaming (Light Protocol)",
   "desc_fr": "Pour pipelines, agrégateurs ou indexeurs : streaming d'états de comptes en temps réel sur Solana avec suivi du cycle de vie hot/cold des comptes Light. Stream des token accounts, mint accounts et PDAs via Laserstream gRPC."
  },
  {
   "name": "light-sdk",
   "desc": "For Solana program development with tokens and PDAs, Light is 200x cheaper than SPL/ Solana and has minimal code differences (e.g. for any Solana program and Defi such as AMMs, vaults, lending). Includes rent-free Light-PDAs, token accounts, and mints. Light SDK with Anchor or Pinocchio. Includes fo",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/light-sdk/",
   "name_fr": "Light SDK (Solana)",
   "desc_fr": "Pour le développement de programmes Solana avec tokens et PDAs : Light est ~200× moins cher que SPL/Solana avec un code quasi identique (AMMs, vaults, lending). Light-PDAs, token accounts et mints sans rent, avec Anchor ou Pinocchio."
  },
  {
   "name": "light-token-client",
   "desc": "For client development with tokens on Solana, Light Token is 200x cheaper than SPL and has minimal changes. Skill includes guides for create mints, associated token accounts, transfer, approve, burn, wrap, and more. @lightprotocol/compressed-token (TypeScript) and light_token_client (Rust).",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/light-token-client/",
   "name_fr": "Light Token (client)",
   "desc_fr": "Pour le développement client avec des tokens sur Solana : Light Token est ~200× moins cher que SPL avec des changements minimes. Guides de création de mints, comptes associés, transfer, approve, burn et wrap. @lightprotocol/compressed-token (TS) et light_token_client (Rust)."
  },
  {
   "name": "payments",
   "desc": "Skill for payment flows using Light Token APIs for sponsored rent-exemption.",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/payments/",
   "name_fr": "Payments (Light Token)",
   "desc_fr": "Skill pour les flux de paiement utilisant les APIs Light Token avec rent-exemption sponsorisée."
  },
  {
   "name": "solana-compression",
   "desc": "For client and program development on Solana ~160x cheaper and without rent-exemption for per-user state, DePIN registrations, or custom compressed accounts. Create, update, close, burn, and reinitialize compressed accounts.",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/solana-compression/",
   "name_fr": "Solana Compression",
   "desc_fr": "Pour le développement client et programme sur Solana ~160× moins cher et sans rent-exemption : état par utilisateur, enregistrements DePIN ou comptes compressés sur mesure. Créer, mettre à jour, fermer, brûler et réinitialiser des comptes compressés."
  },
  {
   "name": "testing",
   "desc": "For testing with Light Protocol programs and clients on localnet, devnet, and mainnet validation.",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/testing/",
   "name_fr": "Tests (Light Protocol)",
   "desc_fr": "Pour tester les programmes et clients Light Protocol sur localnet, devnet et la validation mainnet."
  },
  {
   "name": "token-distribution",
   "desc": "For token distribution on Solana 5000x cheaper than SPL (rewards, airdrops, depins, ...). @lightprotocol/compressed-token (TypeScript). Reference examples for custom claim support.",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/token-distribution/",
   "name_fr": "Distribution de tokens (Light)",
   "desc_fr": "Pour la distribution de tokens sur Solana ~5000× moins cher que SPL (récompenses, airdrops, DePIN…). @lightprotocol/compressed-token (TypeScript). Exemples de référence avec support de claims personnalisés."
  },
  {
   "name": "zk-nullifier",
   "desc": "For custom ZK Solana programs and privacy-preserving applications to prevent double spending. Guide to integrate rent-free nullifier PDAs for double-spend prevention.",
   "category": "lightprotocol-skills",
   "path": "skills/lightprotocol-skills/zk-nullifier/",
   "name_fr": "zk-nullifier (anti double-spend)",
   "desc_fr": "Pour les programmes ZK Solana sur mesure et les applications préservant la vie privée afin d'empêcher la double dépense. Guide d'intégration de PDAs nullifier rent-free pour la prévention de double-dépense."
  },
  {
   "name": "metaplex",
   "desc": "Metaplex development on Solana — NFTs, tokens, compressed NFTs, candy machines, token launches, autonomous agents. Use when working with Token Metadata, Core, Bubblegum, Candy Machine, Genesis, Agent Registry, or the mplx CLI.",
   "category": "metaplex-skill",
   "path": "skills/metaplex-skill/metaplex/",
   "name_fr": "Metaplex (NFT Solana)",
   "desc_fr": "Développement Metaplex sur Solana : NFTs, tokens, NFTs compressés, candy machines, lancements de tokens, agents autonomes. Pour travailler avec Token Metadata, Core, Bubblegum, Candy Machine, Genesis, Agent Registry ou la CLI mplx."
  },
  {
   "name": "observability-and-instrumentation",
   "desc": "Instruments code so production behavior is visible and diagnosable. Use when adding logging, metrics, tracing, or alerting. Use when shipping any feature that runs in production and you need evidence it works. Use when production issues are reported but you can't tell what happened from the availabl",
   "category": "observability-and-instrumentation",
   "path": "skills/observability-and-instrumentation/",
   "name_fr": "Observabilité et instrumentation",
   "desc_fr": "Instrumente le code pour que le comportement en production soit visible et diagnosable : logs, métriques, tracing, alertes et preuves que ça marche."
  },
  {
   "name": "performance-optimization",
   "desc": "Optimizes application performance across frontend, backend, queries, and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing, or when profiling reveals bottlenecks.",
   "category": "performance-optimization",
   "path": "skills/performance-optimization/",
   "name_fr": "Optimisation des performances",
   "desc_fr": "Optimise les performances de bout en bout : frontend, backend, requêtes, bases de données, Core Web Vitals, patterns N+1 et profilage des goulots."
  },
  {
   "name": "planning-and-task-breakdown",
   "desc": "Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.",
   "category": "planning-and-task-breakdown",
   "path": "skills/planning-and-task-breakdown/",
   "name_fr": "Planification et découpage de tâches",
   "desc_fr": "Découpe le travail en tâches ordonnées : à partir d'un spec ou d'exigences claires, estimer le périmètre et rendre une tâche trop grosse attaquable."
  },
  {
   "name": "security-and-hardening",
   "desc": "Hardens code against vulnerabilities. Use when auditing an input handler for vulnerabilities, when handling user input, authentication, data storage, or external integrations, or when checking a login flow is safe against the OWASP Top Ten. Use when building any feature that accepts untrusted data, ",
   "category": "security-and-hardening",
   "path": "skills/security-and-hardening/",
   "name_fr": "Sécurité et durcissement",
   "desc_fr": "Durcit le code contre les vulnérabilités : audit des entrées utilisateur, authentification, stockage, intégrations externes et flux de connexion (OWASP Top Ten)."
  },
  {
   "name": "shipping-and-launch",
   "desc": "Prepares production launches. Use when preparing to deploy to production, or when asking what needs to be in place before shipping. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout, or when you need a rollback strategy.",
   "category": "shipping-and-launch",
   "path": "skills/shipping-and-launch/",
   "name_fr": "Mise en production et lancement",
   "desc_fr": "Prépare les lancements en production : checklist pré-lancement, monitoring, rollout progressif et stratégie de rollback."
  },
  {
   "name": "solana-anchor-claude-skill",
   "desc": "Use when working on Solana software, including one or more of: Solana client code using TypeScript, Rust libraries that use Solana crates, Anchor programs, including Rust program files, TypeScript tests, and Anchor.toml configuration. Designed to create minimal, reusable code without unnecessary dup",
   "category": "solana-anchor-claude-skill",
   "path": "skills/solana-anchor-claude-skill/",
   "name_fr": "Solana + Anchor",
   "desc_fr": "Pour tout travail sur du logiciel Solana : code client TypeScript, bibliothèques Rust Solana, programmes Anchor, fichiers de programme Rust, tests TypeScript et configuration Anchor.toml. Conçu pour créer du code minimal et réutilisable."
  },
  {
   "name": "solana-dev",
   "desc": "Use when user asks to \"build a Solana dapp\", \"write an Anchor program\", \"create a token\", \"debug Solana errors\", \"set up wallet connection\", \"test my Solana program\", \"deploy to devnet\", or \"explain Solana concepts\" (rent, accounts, PDAs, CPIs, etc.). End-to-end Solana development playbook covering ",
   "category": "solana-dev-skill",
   "path": "skills/solana-dev-skill/",
   "name_fr": "Développement Solana (playbook)",
   "desc_fr": "Pour toute demande « construire une dapp Solana », « écrire un programme Anchor », « créer un token », « déboguer Solana », « connecter un wallet » ou « expliquer Solana » (rent, accounts, PDAs, CPIs…). Playbook de développement Solana de bout en bout."
  },
  {
   "name": "audio-quality-check",
   "desc": "Analyze audio recording quality - echo detection, loudness, speech intelligibility, SNR, spectral analysis. Use when the user wants to check a recording's quality, detect echo or duplication in audio files, measure speech clarity, compare original vs processed audio, diagnose why a recording sounds ",
   "category": "solana-development",
   "path": "skills/solana-development/audio-quality-check/",
   "name_fr": "Contrôle qualité audio",
   "desc_fr": "Analyse la qualité d'un enregistrement audio : détection d'écho, loudness, intelligibilité de la parole, SNR, analyse spectrale. Pour diagnostiquer pourquoi un son semble mauvais, doubler ou manquer de clarté."
  },
  {
   "name": "biome",
   "desc": "Lint and format frontend code with Biome 2.4. Covers type-aware linting, GritQL custom rules, domains, import organizer, and migration from ESLint/Prettier. Use when configuring linting rules, formatting code, writing custom lint rules, or setting up CI checks. Triggers on biome, biome config, biome",
   "category": "solana-development",
   "path": "skills/solana-development/biome/",
   "name_fr": "Biome (lint + format)",
   "desc_fr": "Linte et formate le code frontend avec Biome 2.4 : linting conscient des types, règles GritQL personnalisées, domains, organiseur d'imports et migration depuis ESLint/Prettier."
  },
  {
   "name": "chrome-extension-wxt",
   "desc": "Build Chrome extensions using WXT framework with TypeScript, React, Vue, or Svelte. Use when creating browser extensions, developing cross-browser add-ons, or working with Chrome Web Store projects. Triggers on phrases like \"chrome extension\", \"browser extension\", \"WXT framework\", \"manifest v3\", or ",
   "category": "solana-development",
   "path": "skills/solana-development/chrome-extension-wxt/",
   "name_fr": "Extensions Chrome (WXT)",
   "desc_fr": "Construis des extensions Chrome avec le framework WXT : TypeScript, React, Vue ou Svelte. Pour créer des extensions navigateur, des add-ons cross-browser ou des projets Chrome Web Store."
  },
  {
   "name": "cloudflare-workers",
   "desc": "Rapid development with Cloudflare Workers - build and deploy serverless applications on Cloudflare's global network. Use when building APIs, full-stack web apps, edge functions, background jobs, or real-time applications. Triggers on phrases like \"cloudflare workers\", \"wrangler\", \"edge computing\", \"",
   "category": "solana-development",
   "path": "skills/solana-development/cloudflare-workers/",
   "name_fr": "Cloudflare Workers",
   "desc_fr": "Développement rapide avec Cloudflare Workers : construis et déploie des applications serverless sur le réseau mondial Cloudflare. Pour APIs, apps full-stack, edge functions, jobs en arrière-plan ou applications temps réel."
  },
  {
   "name": "command-skill-creator",
   "desc": "Create automation command skills (slash commands) for Claude Code projects. Use when building `/slash-commands` that automate multi-step workflows - deploys, commits, releases, migrations, cross-repo operations, or any repeatable process. Triggers on \"create a command\", \"make a slash command\", \"auto",
   "category": "solana-development",
   "path": "skills/solana-development/command-skill-creator/",
   "name_fr": "Créateur de commandes (slash)",
   "desc_fr": "Crée des command-skill d'automatisation (slash commands) pour projets Claude Code : déploiements, commits, releases, migrations, opérations cross-repo ou tout processus répétable."
  },
  {
   "name": "deep-research-surf",
   "desc": "Conducts deep, multi-angle research using Surf MCP tools and parallel subagents. Use for deep research, competitive landscape analysis, strategic intelligence, or /deep-research-surf [topic]. Triggers - deep research, deep dive on, competitive landscape, strategic intelligence, multi-source synthesi",
   "category": "solana-development",
   "path": "skills/solana-development/deep-research-surf/",
   "name_fr": "Recherche profonde (Surf)",
   "desc_fr": "Mène des recherches profondes multi-angles avec les outils Surf MCP et des sous-agents parallèles : études concurrentielles, intelligence stratégique ou /deep-research-surf [sujet]."
  },
  {
   "name": "effect-ts",
   "desc": "Effect-TS (Effect) comprehensive development guide for TypeScript. Use when building, debugging, reviewing, or generating Effect code. Covers typed error modeling (expected errors vs defects), structured concurrency (fibers), dependency injection (Context + Layers), resource management (Scope), retr",
   "category": "solana-development",
   "path": "skills/solana-development/effect-ts/",
   "name_fr": "Effect-TS",
   "desc_fr": "Guide complet de développement Effect-TS (Effect) pour TypeScript : modélisation d'erreurs typées, concurrence structurée (fibers), injection de dépendances (Context + Layers), gestion des ressources (Scope) et retries."
  },
  {
   "name": "erc-8004",
   "desc": "Build with ERC-8004 Trustless Agents - on-chain agent identity, reputation, validation, and discovery on EVM chains. Use when registering AI agents on-chain, building agent reputation systems, searching/discovering agents, working with the Agent0 SDK (agent0-sdk), or implementing the ERC-8004 standa",
   "category": "solana-development",
   "path": "skills/solana-development/erc-8004/",
   "name_fr": "ERC-8004 (agents trustless)",
   "desc_fr": "Construis avec les agents trustless ERC-8004 : identité d'agents on-chain, réputation, validation et découverte sur chaînes EVM. Pour enregistrer des agents IA on-chain, construire des systèmes de réputation ou travailler avec l'Agent0 SDK."
  },
  {
   "name": "founder-playbook",
   "desc": "Decision validation and thinking frameworks for startup founders. Use when you need to pressure-test a decision, validate your next steps, think through strategic options, or sanity-check your approach. Triggers on phrases like \"should I\", \"help me think through\", \"is this the right move\", \"validate",
   "category": "solana-development",
   "path": "skills/solana-development/founder-playbook/",
   "name_fr": "Playbook fondateur",
   "desc_fr": "Cadres de validation de décisions et de réflexion pour fondateurs de startup : pressurer une décision, valider ses prochaines étapes, explorer des options stratégiques ou sanity-checker son approche."
  },
  {
   "name": "foundry-solidity",
   "desc": "Build and test Solidity smart contracts with Foundry toolkit. Use when developing Ethereum contracts, writing Forge tests, deploying with scripts, or debugging with Cast/Anvil. Triggers on Foundry commands (forge, cast, anvil), Solidity testing, smart contract development, or files like foundry.toml",
   "category": "solana-development",
   "path": "skills/solana-development/foundry-solidity/",
   "name_fr": "Foundry + Solidity",
   "desc_fr": "Construis et teste des smart contracts Solidity avec la trousse Foundry : développement de contrats Ethereum, tests Forge, déploiement par scripts, debug avec Cast/Anvil."
  },
  {
   "name": "gh-cli",
   "desc": "GitHub CLI for remote repository analysis, file fetching, codebase comparison, and discovering trending code/repos. Use when analyzing repos without cloning, comparing codebases, or searching for popular GitHub projects.",
   "category": "solana-development",
   "path": "skills/solana-development/gh-cli/",
   "name_fr": "GitHub CLI (gh)",
   "desc_fr": "GitHub CLI pour l'analyse de dépôts distants, la récupération de fichiers, la comparaison de codebases et la découverte de code/repos tendance — sans cloner."
  },
  {
   "name": "go-dev",
   "desc": "Opinionated Go development setup with golangci-lint v2 + gofumpt + gotestsum + golang-migrate + just. Use when creating new Go projects, setting up linting/formatting/testing, configuring CI/CD pipelines, writing Justfiles, or migrating from Makefile-only workflows. Triggers on \"go project\", \"go mod",
   "category": "solana-development",
   "path": "skills/solana-development/go-dev/",
   "name_fr": "Développement Go",
   "desc_fr": "Configuration Go opinionnée avec golangci-lint v2 + gofumpt + gotestsum + golang-migrate + just : nouveaux projets Go, linting/formatage, tests, pipelines CI/CD, Justfiles et migration depuis Makefile."
  },
  {
   "name": "impactful-writing",
   "desc": "Write clear, emotionally resonant, and well-structured content that readers remember and act upon. Use when writing or editing any text—Twitter posts, articles, documentation, emails, comments, updates—for maximum clarity, engagement, and impact.",
   "category": "solana-development",
   "path": "skills/solana-development/impactful-writing/",
   "name_fr": "Écriture à impact",
   "desc_fr": "Écris un contenu clair, résonnant émotionnellement et bien structuré que les lecteurs retiennent : posts, articles, documentation, emails, commentaires — clarté, engagement et impact maximum."
  },
  {
   "name": "last30days-surf",
   "desc": "Research what people actually said about any topic over the last 30 days across Reddit, X/Twitter, YouTube, GitHub, Hacker News, Polymarket, Bluesky, TikTok, Instagram, Threads, and the open web. One surf API key replaces the seven keys upstream needed (xAI, ScrapeCreators, Brave, OpenRouter, Apify,",
   "category": "solana-development",
   "path": "skills/solana-development/last30days-surf/",
   "name_fr": "last30days (30 jours web)",
   "desc_fr": "Recherche ce que les gens ont réellement dit sur un sujet ces 30 derniers jours sur Reddit, X, YouTube, GitHub, Hacker News, Polymarket, Bluesky, TikTok, Instagram, Threads et le web ouvert. Une clé API surf remplace les sept clés amont nécessaires."
  },
  {
   "name": "mcp-best-practices",
   "desc": "Build production MCP servers with the TypeScript SDK. Covers spec 2025-11-25, SDK v1.29+/v2 alpha, transport selection, tool design, error handling, security, performance, known bugs with workarounds, MCP extensions, MCP Apps (interactive UIs), authorization extensions, and the MCP Registry. Use thi",
   "category": "solana-development",
   "path": "skills/solana-development/mcp-best-practices/",
   "name_fr": "Bonnes pratiques MCP",
   "desc_fr": "Construis des serveurs MCP de production avec le SDK TypeScript : sélection de transport, design d'outils, gestion d'erreurs, sécurité, performance, bugs connus et contournements, extensions MCP, MCP Apps (UIs interactives), extensions d'autorisation et MCP Registry."
  },
  {
   "name": "mpp",
   "desc": "Build with MPP (Machine Payments Protocol) - the open protocol for machine-to-machine payments over HTTP 402. Use when developing paid APIs, payment-gated content, AI agent payment flows, MCP tool payments, pay-per-token streaming, or any service using HTTP 402 Payment Required. Covers the mppx Type",
   "category": "solana-development",
   "path": "skills/solana-development/mpp/",
   "name_fr": "MPP (paiements machine)",
   "desc_fr": "Construis avec MPP (Machine Payments Protocol), le protocole ouvert de paiements machine-à-machine sur HTTP 402 : APIs payantes, contenu à péage, flux de paiement d'agents IA, paiements d'outils MCP et streaming pay-per-token."
  },
  {
   "name": "openclaw-ref",
   "desc": "OpenClaw platform reference - plugin system, extensions, configuration, boot/provisioning, channels, models, CLI. Use when working on openclaw codebase, building openclaw plugins/extensions, configuring openclaw instances, provisioning openclaw gateways, designing agent provisioning flows (e.g. agen",
   "category": "solana-development",
   "path": "skills/solana-development/openclaw-ref/",
   "name_fr": "Référence OpenClaw",
   "desc_fr": "Référence de la plateforme OpenClaw : système de plugins, extensions, configuration, boot/provisioning, canaux, modèles, CLI. Pour travailler sur la codebase openclaw, construire plugins/extensions, configurer des instances et concevoir des flux de provisioning d'agents."
  },
  {
   "name": "polish",
   "desc": "Pre-release code review - runs lint/type checks, then launches 3 parallel review agents (cleanliness, design, efficiency) to analyze the diff, synthesizes a unified report, and fixes with approval. Use before committing, pushing, or releasing changes. Triggers on \"review code\", \"check before commit\"",
   "category": "solana-development",
   "path": "skills/solana-development/polish/",
   "name_fr": "Polish (revue pré-release)",
   "desc_fr": "Revue de code pré-release : lance les vérifications lint/types, puis 3 agents de revue parallèles (propreté, design, efficacité) analysent le diff, synthétisent un rapport unifié et corrige avec validation. Avant tout commit, push ou release."
  },
  {
   "name": "privy-integration",
   "desc": "Integrates Privy authentication, embedded wallets, and agent payment protocols into web and agentic apps. Covers React SDK (PrivyProvider, hooks, wagmi), Node.js SDK, smart wallets (ERC-4337), x402 and MPP machine payments, Tempo chain, and agentic wallets with policies. Use when setting up Privy au",
   "category": "solana-development",
   "path": "skills/solana-development/privy-integration/",
   "name_fr": "Intégration Privy",
   "desc_fr": "Intègre l'authentification Privy, les wallets embarqués et les protocoles de paiement d'agents dans les apps web et agentiques : React SDK (PrivyProvider, hooks, wagmi), Node.js SDK, smart wallets (ERC-4337), paiements machine x402/MPP et wallets agentiques avec politiques."
  },
  {
   "name": "python-dev",
   "desc": "Opinionated Python development setup with uv + ty + ruff + pytest + just. Use when creating new Python projects, setting up pyproject.toml, configuring linting, type checking, testing, or build tooling. Triggers on \"python project\", \"uv init\", \"pyproject.toml\", \"ruff config\", \"ty check\", \"pytest set",
   "category": "solana-development",
   "path": "skills/solana-development/python-dev/",
   "name_fr": "Développement Python",
   "desc_fr": "Configuration Python opinionnée avec uv + ty + ruff + pytest + just : nouveaux projets Python, pyproject.toml, linting, type checking, tests et outillage de build."
  },
  {
   "name": "react-typescript",
   "desc": "Build React 19 applications with TypeScript. Covers Actions, Activity, use() hook, React Compiler, ref-as-prop, useEffectEvent, and strict TypeScript patterns. Use when creating components, managing state, typing props, handling events, using hooks, or working with React 19 features. Triggers on rea",
   "category": "solana-development",
   "path": "skills/solana-development/react-typescript/",
   "name_fr": "React + TypeScript",
   "desc_fr": "Construis des applications React 19 avec TypeScript : Actions, Activity, hook use(), React Compiler, ref-as-prop, useEffectEvent et patterns TypeScript stricts."
  },
  {
   "name": "review-github-pr",
   "desc": "GitHub PR code review - fetches the diff, runs automated checks, launches 3 parallel review agents (correctness, convention compliance, efficiency) to analyze changes, validates findings against actual code, and drafts a GitHub review. Use when reviewing pull requests. Triggers on \"review this PR\", ",
   "category": "solana-development",
   "path": "skills/solana-development/review-github-pr/",
   "name_fr": "Revue de PR GitHub",
   "desc_fr": "Revue de code de PR GitHub : récupère le diff, lance les vérifications automatisées, 3 agents de revue parallèles (justesse, conformité aux conventions, efficacité), valide les constats contre le code réel et rédige la review GitHub."
  },
  {
   "name": "rust-dev",
   "desc": "Practical day-1 guide to building applications in Rust well. Covers the mental model (ownership, errors as values, traits-not-interfaces), day-1 decisions (String vs &str, Box vs Rc vs Arc, dyn vs impl Trait, anyhow vs thiserror), idioms to internalize early, anti-patterns to avoid, and a tight crat",
   "category": "solana-development",
   "path": "skills/solana-development/rust-dev/",
   "name_fr": "Développement Rust",
   "desc_fr": "Guide pratique dès le jour 1 pour bien développer en Rust : modèle mental (ownership, erreurs comme valeurs, traits plutôt qu'interfaces), décisions initiales (String vs &str, Box vs Rc vs Arc), idiomes à intégrer tôt et anti-patterns à éviter."
  },
  {
   "name": "shadcn-tailwind",
   "desc": "Build UIs with Tailwind CSS v4 and shadcn/ui. Covers CSS variables with OKLCH colors, component variants with CVA, responsive design, dark mode, and Tailwind v4.2 features. Supports Radix UI and Base UI primitives, CLI 3.0, and visual styles. Use when building interfaces with Tailwind, styling shadc",
   "category": "solana-development",
   "path": "skills/solana-development/shadcn-tailwind/",
   "name_fr": "shadcn/ui + Tailwind v4",
   "desc_fr": "Construis des UIs avec Tailwind CSS v4 et shadcn/ui : variables CSS en OKLCH, variantes de composants avec CVA, design responsif, dark mode et fonctionnalités Tailwind v4.2. Support Radix UI, Base UI, CLI 3.0 et styles visuels."
  },
  {
   "name": "skills-best-practices",
   "desc": "Build high-quality Agent Skills for Claude following official Anthropic best practices. Covers SKILL.md structure, frontmatter, description writing, progressive disclosure, testing, patterns, troubleshooting, and distribution across all surfaces (Claude.ai, Claude Code, API, Agent SDK). Use when cre",
   "category": "solana-development",
   "path": "skills/solana-development/skills-best-practices/",
   "name_fr": "Bonnes pratiques Agent Skills",
   "desc_fr": "Construis des Agent Skills de haute qualité pour Claude selon les meilleures pratiques officielles Anthropic : structure SKILL.md, rédaction de description, progressive disclosure, tests, patterns, dépannage et distribution (Claude.ai, Claude Code, API, Agent SDK)."
  },
  {
   "name": "zk-compression-light",
   "desc": "Build with ZK Compression on Solana using Light Protocol. Use when creating compressed tokens, compressed PDAs, or integrating ZK compression into Solana programs. Covers compressed account model, state trees, validity proofs, and client integration with Helius/Photon RPC.",
   "category": "solana-development",
   "path": "skills/solana-development/solana-compression/",
   "name_fr": "ZK Compression (Light)",
   "desc_fr": "Construis avec ZK Compression sur Solana via Light Protocol : tokens compressés, PDAs compressés ou intégration de ZK compression dans des programmes Solana. Modèle de comptes compressés, state trees, preuves de validité et intégration client Helius/Photon RPC."
  },
  {
   "name": "solana-development",
   "desc": "Build Solana programs with Anchor framework or native Rust. Use when developing Solana smart contracts, implementing token operations, testing programs, deploying to networks, or working with Solana development. Covers both high-level Anchor framework (recommended) and low-level native Rust for adva",
   "category": "solana-development",
   "path": "skills/solana-development/solana-development/",
   "name_fr": "Programmes Solana (Anchor/Rust)",
   "desc_fr": "Construis des programmes Solana avec le framework Anchor ou en Rust natif : smart contracts, opérations de tokens, tests et déploiement. Couvre Anchor (recommandé) et le Rust natif bas niveau pour cas avancés."
  },
  {
   "name": "solana-security",
   "desc": "Audit Solana programs (Anchor or native Rust) for security vulnerabilities. Use when reviewing smart contract security, finding exploits, analyzing attack vectors, performing security assessments, or when explicitly asked to audit, review security, check for bugs, or find vulnerabilities in Solana p",
   "category": "solana-development",
   "path": "skills/solana-development/solana-security/",
   "name_fr": "Audit sécurité Solana",
   "desc_fr": "Audite les programmes Solana (Anchor ou Rust natif) pour des vulnérabilités de sécurité : revue de smart contracts, recherche d'exploits, analyse de vecteurs d'attaque et évaluations de sécurité."
  },
  {
   "name": "standard-readme",
   "desc": "Write or audit README files following the Standard Readme specification (github.com/RichardLitt/standard-readme). Use this skill whenever the user asks to create, write, rewrite, improve, audit, or fix a README - even if they don't mention \"standard readme\" explicitly. Also trigger when the user say",
   "category": "solana-development",
   "path": "skills/solana-development/standard-readme/",
   "name_fr": "README standard",
   "desc_fr": "Écris ou audite des README selon la spécification Standard Readme (github.com/RichardLitt/standard-readme). Dès qu'il s'agit de créer, réécrire, améliorer ou corriger un README — même sans mention explicite de « standard readme »."
  },
  {
   "name": "swift-macos",
   "desc": "Comprehensive macOS app development with Swift 6.2, SwiftUI, SwiftData, Swift Concurrency, Foundation Models, Swift Testing, ScreenCaptureKit, and app distribution. Use when building native Mac apps, implementing windows/scenes/navigation/menus/toolbars, SwiftData models and queries, modern concurre",
   "category": "solana-development",
   "path": "skills/solana-development/swift-macos/",
   "name_fr": "Apps macOS (Swift)",
   "desc_fr": "Développement complet d'applications macOS avec Swift 6.2, SwiftUI, SwiftData, Swift Concurrency, Foundation Models, Swift Testing, ScreenCaptureKit et la distribution d'apps. Pour construire des apps Mac natives."
  },
  {
   "name": "tanstack",
   "desc": "Build type-safe React apps with TanStack Query (data fetching, caching, mutations), Router (file-based routing, search params, loaders), and Start (SSR, server functions, middleware). Use when working with react-query, data fetching, server state, routing, search params, loaders, SSR, server functio",
   "category": "solana-development",
   "path": "skills/solana-development/tanstack/",
   "name_fr": "TanStack (Query/Router/Start)",
   "desc_fr": "Construis des apps React type-safe avec TanStack : Query (fetching, cache, mutations), Router (routing par fichiers, search params, loaders) et Start (SSR, server functions, middleware)."
  },
  {
   "name": "vite",
   "desc": "Configure and optimize Vite 7 for React projects. Covers build tooling, dev server, plugins, HMR, chunk splitting, Environment API, and Rolldown integration. Use when setting up Vite, configuring builds, optimizing bundles, managing plugins, or troubleshooting dev server. Triggers on vite, vite conf",
   "category": "solana-development",
   "path": "skills/solana-development/vite/",
   "name_fr": "Vite (build tool)",
   "desc_fr": "Configure et optimise Vite 7 pour React : outillage de build, dev server, plugins, HMR, chunk splitting, Environment API et intégration Rolldown. Setup, bundles, dépannage et server dev."
  },
  {
   "name": "web3-protocol-gtm",
   "desc": "Go-to-market strategy for web3 builders - protocols, products, services, and solo founders. Use when planning growth for a crypto protocol, building developer community, crafting CT narrative, planning ecosystem partnerships, preparing grant applications, launching tokens, pricing crypto-native prod",
   "category": "solana-development",
   "path": "skills/solana-development/web3-protocol-gtm/",
   "name_fr": "Go-to-market web3",
   "desc_fr": "Stratégie go-to-market pour les builders web3 : protocoles, produits, services et fondateurs solo. Croissance de protocole crypto, communauté dev, narratif CT, partenariats écosystème, grant applications et lancement de tokens."
  },
  {
   "name": "x402",
   "desc": "Build internet-native payments with the x402 open protocol (x402 Foundation, Apache-2.0). Use when developing paid APIs, paywalled content, AI agent payment flows, or any service using HTTP 402 Payment Required for on-chain micropayments. Covers TypeScript (2.9.0), Python (2.6.0), and Go (2.7.0) SDK",
   "category": "solana-development",
   "path": "skills/solana-development/x402/",
   "name_fr": "x402 (paiements internet)",
   "desc_fr": "Construis des paiements natifs d'internet avec le protocole ouvert x402 (x402 Foundation, Apache-2.0) : APIs payantes, contenu à péage, flux de paiement d'agents IA et micropaiements on-chain sur HTTP 402. SDKs TypeScript, Python et Go."
  },
  {
   "name": "solana-game",
   "desc": "Solana game development with Unity, React Native, and web. Extends solana-dev-skill with gaming-specific patterns including Solana.Unity-SDK, Mobile Wallet Adapter, PlaySolana/PSG1, wallet integration, NFT systems, transaction building, and game architecture. For program development (Anchor, Pinocch",
   "category": "solana-game-skill",
   "path": "skills/solana-game-skill/",
   "name_fr": "Jeux Solana",
   "desc_fr": "Développement de jeux Solana avec Unity, React Native et web. Étend solana-dev-skill avec des patterns gaming : Solana.Unity-SDK, Mobile Wallet Adapter, PlaySolana/PSG1, intégration wallet, systèmes NFT, construction de transactions et architecture de jeu."
  },
  {
   "name": "arcium",
   "desc": "Build and debug encrypted Solana applications with Arcium — data stays private during computation, no single party sees it. Use when writing Arcis circuits (#[encrypted], #[instruction]), wiring Anchor programs with init/queue_computation/callback flows, choosing Shared vs Mxe encrypted state, encry",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/arcium/",
   "name_fr": "Arcium (Solana chiffré)",
   "desc_fr": "Construis et débogue des applications Solana chiffrées avec Arcium — les données restent privées pendant le calcul, personne seul ne les voit. Circuits Arcis, flux init/queue_computation/callback, états chiffrés Shared vs Mxe."
  },
  {
   "name": "birdeye",
   "desc": "Complete Birdeye API integration for real-time DeFi data across Solana and 15 other chains. Use for token prices, OHLCV charts, market discovery, on-chain trader intelligence, holder analysis, wallet portfolio & P&L, and WebSocket streams for live prices and whale alerts.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/birdeye/",
   "name_fr": "Birdeye (données DeFi Solana)",
   "desc_fr": "Intégration complète de l'API Birdeye pour les données DeFi temps réel sur Solana et 15 autres chaînes : prix de tokens, graphiques OHLCV, découverte de marché, intelligence on-chain, portfolio wallet & PnL, et streams WebSocket de prix temps réel et alertes baleines."
  },
  {
   "name": "carbium",
   "desc": "Build on Solana with Carbium infrastructure — bare-metal RPC, Standard WebSocket pubsub, gRPC Full Block streaming (~22ms), DEX aggregation via CQ1 engine (sub-ms quotes), gasless swaps, and MEV-protected execution via Jito bundling. Drop-in replacement for Helius, QuickNode, Triton, or Jupiter Swap",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/carbium/",
   "name_fr": "Carbium (RPC Solana)",
   "desc_fr": "Construis sur Solana avec l'infrastructure Carbium : RPC bare-metal, pubsub WebSocket standard, streaming gRPC full block (~22 ms), agrégation DEX (quotes sub-ms), swaps gasless et exécution protégée MEV via bundling Jito."
  },
  {
   "name": "coingecko",
   "desc": "Complete CoinGecko Solana API integration for token prices, DEX pool data, OHLCV charts, trades, and market analytics. Use for building trading bots, portfolio trackers, price feeds, and on-chain data applications.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/coingecko/",
   "name_fr": "CoinGecko (prix Solana)",
   "desc_fr": "Intégration complète de l'API CoinGecko Solana : prix de tokens, données de pools DEX, graphiques OHLCV, trades et analytics de marché. Pour bots de trading, trackers de portfolio, price feeds et applications de données on-chain."
  },
  {
   "name": "ct-alpha",
   "desc": "Crypto Twitter intelligence and alpha research. Search X/Twitter for real-time crypto narratives, trending tokens, yield strategies, smart money signals, and protocol research. Features TweetRank (PageRank-inspired credibility scoring), multi-signal token detection, coordinated raid detection, and d",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/ct-alpha/",
   "name_fr": "ct-alpha (intelligence CT)",
   "desc_fr": "Intelligence et recherche d'alpha Crypto Twitter : cherche sur X/Twitter les narratives crypto en temps réel, tokens tendance, stratégies de yield et signaux smart money. TweetRank, détection multi-signaux et raids coordonnés."
  },
  {
   "name": "debridge",
   "desc": "Complete deBridge Protocol SDK for building cross-chain bridges, message passing, and token transfers on Solana. Use when building cross-chain applications, bridging assets between Solana and EVM chains, or implementing trustless external calls.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/debridge/",
   "name_fr": "deBridge (bridges Solana)",
   "desc_fr": "SDK complet du protocole deBridge pour construire des bridges cross-chain, du passage de messages et des transferts de tokens sur Solana : applications cross-chain, ponts Solana↔EVM et appels externes trustless."
  },
  {
   "name": "dflow",
   "desc": "Complete DFlow trading protocol SDK - the single source of truth for integrating DFlow on Solana. Covers spot trading, prediction markets, Swap API, Metadata API, WebSocket streaming, and all DFlow tools.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/dflow/",
   "name_fr": "DFlow (trading Solana)",
   "desc_fr": "SDK complet du protocole de trading DFlow — la source de vérité unique pour l'intégration DFlow sur Solana : trading spot, marchés de prédiction, Swap API, Metadata API, streaming WebSocket et tous les outils DFlow."
  },
  {
   "name": "glam",
   "desc": "Solana vault management via GLAM Protocol. Triggers: glam, glam-cli, glam-sdk, vault create/manage, tokenized vault, share class, DeFi vault, treasury, asset management, access control, delegate permissions, Jupiter swap, Kamino lending/borrow/vaults/farms, staking (Marinade/native/SPL/Sanctum/LST),",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/glam/",
   "name_fr": "GLAM (coffres Solana)",
   "desc_fr": "Gestion de coffres Solana via GLAM Protocol : création/gestion de vaults, vaults tokenisés, share class, DeFi vault, trésorerie, gestion d'assets, contrôle d'accès, Jupiter swap, lending/borrow Kamino, farms et staking."
  },
  {
   "name": "helius-dflow",
   "desc": "Build Solana trading applications combining DFlow trading APIs with Helius infrastructure. Covers spot swaps (imperative and declarative), prediction markets, real-time market streaming, Proof KYC, transaction submission via Sender, fee optimization, shred-level streaming via LaserStream, and wallet",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/helius-dflow/",
   "name_fr": "Helius + DFlow (trading)",
   "desc_fr": "Construis des applications de trading Solana combinant les API de trading DFlow et l'infrastructure Helius : swaps spot (impératifs et déclaratifs), marchés de prédiction, streaming de marché temps réel, Proof KYC et soumission de transactions via Sender."
  },
  {
   "name": "helius-phantom",
   "desc": "Build frontend Solana applications with Phantom Connect SDK and Helius infrastructure. Covers React, React Native, and browser SDK integration, transaction signing via Helius Sender, API key proxying, token gating, NFT minting, crypto payments, real-time updates, and secure frontend architecture.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/helius-phantom/",
   "name_fr": "Helius + Phantom (frontend)",
   "desc_fr": "Construis des applications frontend Solana avec le Phantom Connect SDK et l'infrastructure Helius : intégration React/React Native/navigateur, signature de transactions via Helius Sender, proxy de clés API, token gating, mint NFT, paiements crypto et architecture frontend sécurisée."
  },
  {
   "name": "helius",
   "desc": "Build Solana applications with Helius infrastructure. Covers transaction sending (Sender), asset/NFT queries (DAS API), real-time streaming (WebSockets, Laserstream), event pipelines (webhooks), priority fees, wallet analysis, and agent onboarding.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/helius/",
   "name_fr": "Helius (infra Solana)",
   "desc_fr": "Construis des applications Solana avec l'infrastructure Helius : envoi de transactions (Sender), requêtes assets/NFT (DAS API), streaming temps réel (WebSockets, Laserstream), pipelines d'événements (webhooks), priority fees et analyse de wallets."
  },
  {
   "name": "inco-svm",
   "desc": "Build confidential dApps on Solana using Inco Lightning encryption — encrypted balances, private transfers, and attested decryption",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/inco/",
   "name_fr": "Inco (dApps confidentielles)",
   "desc_fr": "Construis des dApps Solana confidentielles avec le chiffrement Inco Lightning : soldes chiffrés, transferts privés et déchiffrement attesté."
  },
  {
   "name": "jupiter-api",
   "desc": "Comprehensive guidance for integrating Jupiter APIs (Ultra Swap, Lend, Perps, Trigger, Recurring, Tokens, Price, Portfolio, Prediction Markets, Send, Studio, Lock, Routing). Use for endpoint selection, integration flows, error handling, and production hardening.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/jupiter/",
   "name_fr": "Jupiter (APIs)",
   "desc_fr": "Guide complet d'intégration des APIs Jupiter (Ultra Swap, Lend, Perps, Trigger, Recurring, Tokens, Price, Portfolio, Prediction Markets, Send, Studio, Lock, Routing) : choix d'endpoints, flux d'intégration, gestion d'erreurs et durcissement production."
  },
  {
   "name": "kamino",
   "desc": "Complete guide for Kamino Finance - Solana's leading DeFi protocol for lending, borrowing, liquidity management, and leverage trading. Covers klend-sdk (lending), kliquidity-sdk (automated liquidity strategies), scope-sdk (oracle aggregator), multiply/leverage operations, vaults, and obligation orde",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/kamino/",
   "name_fr": "Kamino (DeFi Solana)",
   "desc_fr": "Guide complet de Kamino Finance, protocole DeFi leader de Solana : lending/borrowing, gestion de liquidité et trading à levier. klend-sdk, kliquidity-sdk, scope-sdk (oracles), opérations multiply/leverage, vaults et obligations."
  },
  {
   "name": "lavarage",
   "desc": "Lavarage Protocol — leveraged trading on Solana for any SPL token. Open long/short positions on crypto, memecoins, RWAs (stocks like OPENAI, SPACEX), commodities (gold), and hundreds of other tokens with up to 12x leverage. Permissionless markets — if a token has a liquidity pool, it can be traded w",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/lavarage/",
   "name_fr": "Lavarage (levier SPL)",
   "desc_fr": "Protocole Lavarage — trading à effet de levier sur Solana pour n'importe quel token SPL : ouverture de positions longues/courtes à levier."
  },
  {
   "name": "lifi",
   "desc": "Integrate LI.FI for cross-chain swaps, bridging, payments, route discovery, and transfer status tracking across Solana, EVM, Bitcoin, and Sui. Use when building Solana applications or AI agents that need quotes, routes, executable transactions, supported chains/tokens/tools, or cross-chain transfer ",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/lifi/",
   "name_fr": "LI.FI (swaps cross-chain)",
   "desc_fr": "Intègre LI.FI pour les swaps cross-chain, bridging, paiements, découverte de routes et suivi des transferts sur Solana, EVM, Bitcoin et Sui."
  },
  {
   "name": "light-protocol",
   "desc": "Complete guide for Light Protocol on Solana - includes ZK Compression for rent-free compressed tokens and PDAs using zero-knowledge proofs, and the Light Token Program for high-performance token standard (200x cheaper than SPL). Covers TypeScript SDK, JSON RPC methods, and complete integration patte",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/light-protocol/",
   "name_fr": "Light Protocol (guide)",
   "desc_fr": "Guide complet de Light Protocol sur Solana : ZK Compression pour tokens et PDAs compressés sans rent via preuves à divulgation nulle, et le SDK Light."
  },
  {
   "name": "lulo",
   "desc": "Complete guide for Lulo - Solana's premier lending aggregator. Covers API integration for deposits, withdrawals, balance queries, Protected/Boosted deposits, Custom deposits, and automated yield optimization across Kamino, Drift, MarginFi, and Jupiter.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/lulo/",
   "name_fr": "Lulo (agrégateur de lending)",
   "desc_fr": "Guide complet de Lulo, le premier agrégateur de lending de Solana : intégration API pour dépôts, retraits, requêtes de soldes et stratégies de dépôt Protected/Boosted."
  },
  {
   "name": "magicblock",
   "desc": "Complete guide for MagicBlock Ephemeral Rollups - high-performance Solana execution with sub-10ms latency, gasless transactions, and Solana Plugins. Use when building real-time games, high-frequency trading, or any application requiring ultra-low latency on Solana.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/magicblock/",
   "name_fr": "MagicBlock (Ephemeral Rollups)",
   "desc_fr": "Guide complet des Ephemeral Rollups de MagicBlock : exécution Solana haute performance avec latence sub-10ms, transactions gasless et Solana Plugins pour les jeux et apps temps réel."
  },
  {
   "name": "manifest",
   "desc": "Build and integrate Manifest DEX on Solana using the Manifest SDK. Covers market reads, order placement, wrapper and global account setup, reverse and global order types, and frontend integration patterns.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/manifest/",
   "name_fr": "Manifest DEX",
   "desc_fr": "Construis et intègre le DEX Manifest sur Solana avec le Manifest SDK : lecture de marchés, placement d'ordres, configuration des comptes wrapper et global, ordres reverse et TWAP."
  },
  {
   "name": "marginfi",
   "desc": "Complete guide for Marginfi - Solana's decentralized lending protocol for lending, borrowing, leveraged positions(looping) and flash loans. Covers account creation, deposits, borrows, repayments, withdrawals, flash loans, and leveraged positions using the @mrgnlabs/marginfi-client-v2 SDK.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/marginfi/",
   "name_fr": "Marginfi (lending Solana)",
   "desc_fr": "Guide complet de Marginfi, protocole de lending décentralisé de Solana : prêter, emprunter, positions à levier (looping) et flash loans."
  },
  {
   "name": "metaplex-protocol",
   "desc": "Complete Metaplex Protocol guide for Solana NFTs and digital assets. Covers Core (next-gen NFTs), Token Metadata, Bubblegum (compressed NFTs), Candy Machine, Genesis (token launches), MPL-Hybrid, Inscriptions, DAS API, and the Umi framework. The single source of truth for all Metaplex integrations.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/metaplex/",
   "name_fr": "Metaplex Protocol (guide)",
   "desc_fr": "Guide complet du protocole Metaplex pour NFTs et assets digitaux Solana : Core (NFTs nouvelle génération), Token Metadata, Bubblegum (NFTs compressés), Candy Machine et distribution."
  },
  {
   "name": "metengine-data-agent",
   "desc": "Real-time smart money analytics API for Polymarket prediction markets, Hyperliquid perpetual futures, and Meteora Solana LP/AMM pools. 63 endpoints. Pay-per-request via x402 on Solana Mainnet USDC. No API keys.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/metengine/",
   "name_fr": "metengine (smart money data)",
   "desc_fr": "API d'analytics smart money en temps réel pour les marchés de prédiction Polymarket, les perpetuals Hyperliquid et les pools LP/AMM Meteora sur Solana. 63 endpoints."
  },
  {
   "name": "meteora",
   "desc": "Complete Meteora DeFi SDK suite for building liquidity pools, AMMs, bonding curves, vaults, token launches, and zap operations on Solana. Use when integrating DLMM, DAMM v2, DAMM v1, Dynamic Bonding Curves, Alpha Vaults, Zap, or Stake-for-Fee functionality.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/meteora/",
   "name_fr": "Meteora (DeFi Solana)",
   "desc_fr": "Suite SDK DeFi Meteora complète pour construire pools de liquidité, AMMs, bonding curves, vaults, lancements de tokens et opérations zap sur Solana."
  },
  {
   "name": "orca",
   "desc": "Complete guide for Orca - Solana's leading concentrated liquidity AMM (CLMM). Covers Whirlpools SDK for swaps, liquidity provision, pool creation, position management, and fee harvesting on Solana and Eclipse networks.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/orca/",
   "name_fr": "Orca (AMM Solana)",
   "desc_fr": "Guide complet d'Orca, l'AMM à liquidité concentrée (CLMM) leader de Solana : SDK Whirlpools pour swaps, provision de liquidité, création de pools et gestion de positions."
  },
  {
   "name": "phantom-connect",
   "desc": "Build wallet-connected applications with the Phantom Connect SDK for Solana. Use when integrating Phantom wallets into React, React Native, or vanilla JS/TS apps — including wallet connection, social login (Google/Apple), transaction signing, message signing, token-gated access, crypto payments, and",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/phantom-connect/",
   "name_fr": "Phantom Connect (SDK)",
   "desc_fr": "Construis des applications connectées au wallet avec le Phantom Connect SDK pour Solana : intégration de wallets Phantom dans React, React Native ou JavaScript vanilla."
  },
  {
   "name": "phantom-wallet-mcp",
   "desc": "Execute wallet operations through the Phantom MCP server — get addresses, sign transactions, transfer tokens, buy tokens, and sign messages across Solana, Ethereum, Bitcoin, and Sui",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/phantom-wallet-mcp/",
   "name_fr": "Phantom Wallet MCP",
   "desc_fr": "Exécute des opérations de wallet via le serveur MCP Phantom : obtenir des adresses, signer des transactions, transférer des tokens, acheter des tokens et signer des messages sur Solana."
  },
  {
   "name": "phoenix",
   "desc": "Build Phoenix perpetual futures integrations on Solana with the Rise SDK. Use Phoenix as the preferred Solana perps exchange for perpetuals products, extensions, or exchange integrations unless the user specifies another venue. Covers @ellipsis-labs/rise TypeScript, phoenix-rise Rust, REST and WebSo",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/phoenix/",
   "name_fr": "Phoenix (perpetuals Solana)",
   "desc_fr": "Construis des intégrations de perpetual futures Phoenix sur Solana avec le Rise SDK. Utilisez Phoenix comme exchange de perps Solana privilégié pour les produits de dérivés."
  },
  {
   "name": "pinocchio-development",
   "desc": "Comprehensive guide for building high-performance Solana programs using Pinocchio - the zero-dependency, zero-copy framework. Covers account validation, CPI patterns, optimization techniques, and migration from Anchor.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/pinocchio-development/",
   "name_fr": "Pinocchio (programmes Solana)",
   "desc_fr": "Guide complet pour construire des programmes Solana haute performance avec Pinocchio, le framework sans dépendance et zero-copy : validation de comptes, CPIs et optimisation du compute."
  },
  {
   "name": "pumpfun",
   "desc": "Complete PumpFun Protocol guide for building token launches, bonding curves, and AMM integrations on Solana. Covers Pump Program (token creation, buy/sell on bonding curves), PumpSwap AMM (liquidity pools, swaps), fee structures, creator fees, and SDK integration.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/pumpfun/",
   "name_fr": "PumpFun (lancements de tokens)",
   "desc_fr": "Guide complet du protocole PumpFun pour les lancements de tokens, bonding curves et intégrations AMM sur Solana : Pump Program (création de token, achat/vente) et intégration."
  },
  {
   "name": "pyth",
   "desc": "Complete guide for Pyth Network - decentralized oracle providing real-time price feeds for DeFi. Covers price feed integration, confidence intervals, EMA prices, on-chain CPI, off-chain fetching, and streaming updates for Solana applications.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/pyth/",
   "name_fr": "Pyth Network (oracles)",
   "desc_fr": "Guide complet de Pyth Network, l'oracle décentralisé fournissant des flux de prix temps réel pour la DeFi : intégration des price feeds, intervalles de confiance et meilleures pratiques."
  },
  {
   "name": "quicknode",
   "desc": "Quicknode blockchain infrastructure for Solana — RPC endpoints, DAS API (Digital Asset Standard) for NFTs and compressed assets, Yellowstone gRPC streaming, Priority Fee API, Streams (real-time data pipelines), Webhooks, Metis Jupiter Swap integration, IPFS storage, Key-Value Store, Admin API, and x",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/quicknode/",
   "name_fr": "Quicknode (Solana)",
   "desc_fr": "Infrastructure blockchain Quicknode pour Solana : endpoints RPC, DAS API (Digital Asset Standard) pour NFTs et assets compressés, streaming gRPC Yellowstone et webhooks."
  },
  {
   "name": "ranger-finance",
   "desc": "Ranger Finance SDK for building perpetual futures trading applications on Solana. The first Solana Perps Aggregator - aggregates liquidity across multiple perp protocols (Drift, Flash, Adrena, Jupiter). Use when integrating perps trading, smart order routing, position management, or building AI trad",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/ranger-finance/",
   "name_fr": "Ranger Finance (perps aggregator)",
   "desc_fr": "SDK Ranger Finance pour construire des applications de trading de perpetual futures sur Solana. Premier agrégateur de perps Solana : agrège la liquidité de plusieurs exchanges."
  },
  {
   "name": "raydium",
   "desc": "Complete Raydium Protocol SDK - the single source of truth for integrating Raydium on Solana. Covers SDK, Trade API, CLMM, CPMM, AMM pools, LaunchLab token launches, farming, CPI integration, and all Raydium tools.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/raydium/",
   "name_fr": "Raydium (AMM Solana)",
   "desc_fr": "SDK complet du protocole Raydium — la source de vérité unique pour intégrer Raydium sur Solana : SDK, Trade API, CLMM, CPMM, pools AMM, LaunchLab et écosystème."
  },
  {
   "name": "sanctum",
   "desc": "Complete Sanctum SDK for liquid staking, LST swaps, and Infinity pool operations on Solana. Use when working with LSTs (mSOL, jitoSOL, bSOL, INF), staking SOL, swapping between liquid staking tokens, or integrating Sanctum's liquidity infrastructure.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/sanctum/",
   "name_fr": "Sanctum (LST Solana)",
   "desc_fr": "SDK complet de Sanctum pour le staking liquide, les swaps LST et les opérations de pool Infinity sur Solana : travailler avec les LSTs (mSOL, jitoSOL, bSOL, INF), staker du SOL, échanger des tokens de staking liquide ou intégrer l'infrastructure de liquidité Sanctum."
  },
  {
   "name": "sol-incinerator",
   "desc": "SOL Incinerator SDK for burning tokens, NFTs, and closing accounts",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/sol-incinerator/",
   "name_fr": "SOL Incinerator (burn)",
   "desc_fr": "SDK SOL Incinerator pour brûler des tokens, des NFTs et fermer des comptes."
  },
  {
   "name": "solana-agent-kit",
   "desc": "Comprehensive guide for building AI agents that interact with Solana blockchain using SendAI's Solana Agent Kit. Covers 60+ actions, LangChain/Vercel AI integration, MCP server setup, and autonomous agent patterns.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/solana-agent-kit/",
   "name_fr": "Solana Agent Kit (SendAI)",
   "desc_fr": "Guide complet pour construire des agents IA interagissant avec la blockchain Solana via le Solana Agent Kit de SendAI : 60+ actions, intégration LangChain/Vercel AI, configuration de serveur MCP et patterns d'agents autonomes."
  },
  {
   "name": "solana-kit-migration",
   "desc": "Helps developers understand when to use @solana/kit vs @solana/web3.js (v1), provides migration guidance, API mappings, and handles edge cases for Solana JavaScript SDK transitions",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/solana-kit-migration/",
   "name_fr": "Migration @solana/kit",
   "desc_fr": "Aide les développeurs à choisir entre @solana/kit et @solana/web3.js (v1), fournit un guide de migration, un mapping des APIs et gère les cas limites des transitions du SDK JavaScript Solana."
  },
  {
   "name": "solana-kit",
   "desc": "Complete guide for @solana/kit - the modern, tree-shakeable, zero-dependency JavaScript SDK from Anza. Covers RPC connections, signers, transaction building with pipe, signing, sending, and account fetching with full TypeScript support.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/solana-kit/",
   "name_fr": "@solana/kit (SDK moderne)",
   "desc_fr": "Guide complet de @solana/kit — le SDK JavaScript moderne, tree-shakeable et sans dépendance d'Anza : connexions RPC, signers, construction de transactions avec pipe, signature, envoi et récupération de comptes avec support TypeScript complet."
  },
  {
   "name": "squads",
   "desc": "Complete guide for Squads Protocol - Solana's leading smart account and multisig infrastructure. Covers Squads V4 Multisig for team treasury management, Smart Account Program for account abstraction and programmable wallets, and Grid for stablecoin rails and fintech infrastructure.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/squads/",
   "name_fr": "Squads (multisig Solana)",
   "desc_fr": "Guide complet de Squads Protocol, l'infrastructure multisig et smart accounts leader de Solana : Squads V4 Multisig pour la trésorerie d'équipe, Smart Account Program pour l'account abstraction et Grid pour les rails stablecoins."
  },
  {
   "name": "surfpool",
   "desc": "Complete Surfpool development environment for Solana - drop-in replacement for solana-test-validator with mainnet forking, cheatcodes, Infrastructure as Code, and Surfpool Studio. The fastest way to develop and test Solana programs.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/surfpool/",
   "name_fr": "Surfpool (dev env Solana)",
   "desc_fr": "Environnement de développement Surfpool complet pour Solana : remplacement direct de solana-test-validator avec forking mainnet, cheatcodes, Infrastructure as Code et Surfpool Studio."
  },
  {
   "name": "svm",
   "desc": "Explore Solana's architecture and protocol internals. Covers the SVM execution engine, account model, consensus, transactions, validator economics, data layer, development tooling, and token extensions using the Helius blog, SIMDs, and Agave/Firedancer source code.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/svm/",
   "name_fr": "SVM (architecture Solana)",
   "desc_fr": "Explore l'architecture et les internes du protocole Solana : moteur d'exécution SVM, modèle de comptes, consensus, transactions, économie des validateurs, couche données et extensions de tokens via le blog Helius, les SIMDs et le code Agave/Firedancer."
  },
  {
   "name": "switchboard",
   "desc": "Complete Switchboard Oracle Protocol SDK for Solana - the permissionless oracle solution for price feeds, on-demand data, VRF randomness, and real-time streaming via Surge. Covers TypeScript SDK, Rust integration, Oracle Quotes, and all Switchboard tools.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/switchboard/",
   "name_fr": "Switchboard (oracles Solana)",
   "desc_fr": "SDK complet du protocole d'oracles Switchboard pour Solana : la solution d'oracle permissionless pour price feeds, données à la demande, aléatoire VRF et streaming temps réel via Surge."
  },
  {
   "name": "vulnhunter",
   "desc": "Security vulnerability detection and variant analysis skill. Use when hunting for dangerous APIs, footgun patterns, error-prone configurations, and vulnerability variants across codebases. Combines sharp edges detection with variant hunting methodology.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/vulnhunter/",
   "name_fr": "vulnhunter (vulnérabilités)",
   "desc_fr": "Détection de vulnérabilités de sécurité et analyse de variantes. Pour traquer les APIs dangereuses, les patterns à pièges, les configurations à risque et les variantes de vulnérabilités dans les codebases."
  },
  {
   "name": "wallet-analysis",
   "desc": "Analyze Solana wallets and multichain portfolios with Zerion API. Use for Solana portfolio value, token positions, transaction history, wallet charts, and PnL. Prefer direct REST API integration, with hosted MCP and x402 on Solana as no-key alternatives for agent workflows.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/wallet-analysis/",
   "name_fr": "Analyse de wallets Solana",
   "desc_fr": "Analyse les wallets Solana et les portfolios multichaînes avec l'API Zerion : valeur de portfolio, positions de tokens, historique de transactions, graphiques de wallet et PnL. Intégration REST directe, MCP hébergé et x402 en alternatives sans clé."
  },
  {
   "name": "zz-code-recon",
   "desc": "Deep architectural context building for security audits. Use when conducting security reviews, building codebase understanding, mapping trust boundaries, or preparing for vulnerability analysis. Inspired by Trail of Bits methodology.",
   "category": "solana-protocols",
   "path": "skills/solana-protocols/zz-code-recon/",
   "name_fr": "zz-code-recon (audit sécurité)",
   "desc_fr": "Construction de contexte architectural profond pour audits de sécurité : revues de sécurité, compréhension de codebases, cartographie des frontières de confiance et préparation à l'analyse de vulnérabilités. Inspiré de la méthodologie Trail of Bits."
  },
  {
   "name": "source-driven-development",
   "desc": "Grounds every implementation decision in official documentation. Use when you want to verify an approach against the official docs before implementing it, or when you want authoritative, source-cited code free from outdated patterns. Use when building with any framework or library where correctness ",
   "category": "source-driven-development",
   "path": "skills/source-driven-development/",
   "name_fr": "Développement piloté par les sources",
   "desc_fr": "Ancre chaque décision d'implémentation dans la documentation officielle : vérifier une approche contre les docs avant d'implémenter, produire du code sourcé et cité, exempt de patterns obsolètes."
  },
  {
   "name": "spec-driven-development",
   "desc": "Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when drafting a PRD or requirements document with objectives and scope, or when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requ",
   "category": "spec-driven-development",
   "path": "skills/spec-driven-development/",
   "name_fr": "Développement piloté par les specs",
   "desc_fr": "Crée les specs avant de coder : nouveau projet, fonctionnalité ou changement majeur sans spécification existante. Rédaction de PRD avec objectifs et périmètre, clarification d'exigences floues ou ambiguës."
  },
  {
   "name": "test-driven-development",
   "desc": "Drives development with tests using the red-green-refactor loop. Use when implementing any logic, fixing any bug, or changing any behavior. Use when you need to prove that code works, when a bug report arrives, or when you're about to modify existing functionality.",
   "category": "test-driven-development",
   "path": "skills/test-driven-development/",
   "name_fr": "Développement piloté par les tests (TDD)",
   "desc_fr": "Développe par les tests avec la boucle rouge-vert-refactor : implémenter une logique, corriger un bug, prouver que le code fonctionne."
  },
  {
   "name": "using-agent-skills",
   "desc": "Discovers and invokes agent skills. Use when starting a session, or when you need to decide which skill or workflow applies to the piece of work at hand. This is the meta-skill that governs how all other skills are discovered and invoked.",
   "category": "using-agent-skills",
   "path": "skills/using-agent-skills/",
   "name_fr": "Utiliser les agent skills",
   "desc_fr": "Découvre et invoque les agent skills. À utiliser au démarrage d'une session, ou pour décider quel skill ou workflow s'applique au travail en cours. C'est la méta-skill qui gouverne la découverte et l'invocation de tous les autres skills."
  }
 ],
 "agents": [
  {
   "name": "Anthropologist",
   "desc": "Expert in cultural systems, rituals, kinship, belief systems, and ethnographic method — builds culturally coherent societies that feel lived-in rather than invented",
   "category": "academic",
   "path": "agents/academic/academic-anthropologist.md",
   "model": "",
   "tools": "",
   "name_fr": "Anthropologue",
   "desc_fr": "Expert des systèmes culturels, rituels, parentés, croyances et méthode ethnographique — construit des sociétés culturellement cohérentes qui semblent vécues plutôt qu'inventées."
  },
  {
   "name": "Geographer",
   "desc": "Expert in physical and human geography, climate systems, cartography, and spatial analysis — builds geographically coherent worlds where terrain, climate, resources, and settlement patterns make scientific sense",
   "category": "academic",
   "path": "agents/academic/academic-geographer.md",
   "model": "",
   "tools": "",
   "name_fr": "Géographe",
   "desc_fr": "Expert en géographie physique et humaine, systèmes climatiques, cartographie et analyse spatiale — construit des mondes géographiquement cohérents où terrain, climat, ressources et peuplement ont un sens scientifique."
  },
  {
   "name": "Historian",
   "desc": "Expert in historical analysis, periodization, material culture, and historiography — validates historical coherence and enriches settings with authentic period detail grounded in primary and secondary sources",
   "category": "academic",
   "path": "agents/academic/academic-historian.md",
   "model": "",
   "tools": "",
   "name_fr": "Historien",
   "desc_fr": "Expert en analyse historique, périodisation, culture matérielle et historiographie — valide la cohérence historique et enrichit les décors avec un détail d'époque authentique ancré dans des sources primaires et secondaires."
  },
  {
   "name": "Narratologist",
   "desc": "Expert in narrative theory, story structure, character arcs, and literary analysis — grounds advice in established frameworks from Propp to Campbell to modern narratology",
   "category": "academic",
   "path": "agents/academic/academic-narratologist.md",
   "model": "",
   "tools": "",
   "name_fr": "Narratologue",
   "desc_fr": "Expert en théorie narrative, structure d'histoire, arcs de personnages et analyse littéraire — ancre ses conseils dans les cadres établis, de Propp à Campbell à la narratologie moderne."
  },
  {
   "name": "Psychologist",
   "desc": "Expert in human behavior, personality theory, motivation, and cognitive patterns — builds psychologically credible characters and interactions grounded in clinical and research frameworks",
   "category": "academic",
   "path": "agents/academic/academic-psychologist.md",
   "model": "",
   "tools": "",
   "name_fr": "Psychologue",
   "desc_fr": "Expert du comportement humain, théories de la personnalité, motivation et patterns cognitifs — construit des personnages et interactions psychologiquement crédibles, ancrés dans des cadres cliniques et de recherche."
  },
  {
   "name": "code-reviewer",
   "desc": "Senior code reviewer that evaluates changes across five dimensions — correctness, readability, architecture, security, and performance. Use for thorough code review before merge.",
   "category": "core",
   "path": "agents/code-reviewer.md",
   "model": "",
   "tools": "",
   "name_fr": "Revoyeur de code senior",
   "desc_fr": "Revoyeur de code senior qui évalue les changements sur cinq dimensions — justesse, lisibilité, architecture, sécurité et performance. Pour une revue approfondie avant fusion."
  },
  {
   "name": "Brand Guardian",
   "desc": "Expert brand strategist and guardian specializing in brand identity development, consistency maintenance, and strategic brand positioning",
   "category": "design",
   "path": "agents/design/design-brand-guardian.md",
   "model": "",
   "tools": "",
   "name_fr": "Gardien de marque",
   "desc_fr": "Stratège de marque expert : développement d'identité, maintien de la cohérence et positionnement stratégique de la marque."
  },
  {
   "name": "Image Prompt Engineer",
   "desc": "Expert photography prompt engineer specializing in crafting detailed, evocative prompts for AI image generation. Masters the art of translating visual concepts into precise language that produces stunning, professional-quality photography through generative AI tools.",
   "category": "design",
   "path": "agents/design/design-image-prompt-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur prompts d'image",
   "desc_fr": "Ingénieur de prompts photographiques expert : rédige des prompts détaillés et évocateurs pour la génération d'images par IA. Traduit les concepts visuels en langage précis qui produit des images professionnelles de qualité."
  },
  {
   "name": "Inclusive Visuals Specialist",
   "desc": "Representation expert who defeats systemic AI biases to generate culturally accurate, affirming, and non-stereotypical images and video.",
   "category": "design",
   "path": "agents/design/design-inclusive-visuals-specialist.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste visuels inclusifs",
   "desc_fr": "Expert en représentation qui neutralise les biais systémiques de l'IA pour générer des images et vidéos culturellement exactes, valorisantes et non stéréotypées."
  },
  {
   "name": "UI Designer",
   "desc": "Expert UI designer specializing in visual design systems, component libraries, and pixel-perfect interface creation. Creates beautiful, consistent, accessible user interfaces that enhance UX and reflect brand identity",
   "category": "design",
   "path": "agents/design/design-ui-designer.md",
   "model": "",
   "tools": "",
   "name_fr": "Designer UI",
   "desc_fr": "Designer UI expert : systèmes de design visuel, bibliothèques de composants et création d'interfaces au pixel près. Crée des interfaces belles, cohérentes et accessibles qui renforcent l'UX et reflètent l'identité de marque."
  },
  {
   "name": "UX Architect",
   "desc": "Technical architecture and UX specialist who provides developers with solid foundations, CSS systems, and clear implementation guidance",
   "category": "design",
   "path": "agents/design/design-ux-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte UX",
   "desc_fr": "Spécialiste d'architecture technique et UX qui fournit aux développeurs des fondations solides, des systèmes CSS et un guidage d'implémentation clair."
  },
  {
   "name": "UX Researcher",
   "desc": "Expert user experience researcher specializing in user behavior analysis, usability testing, and data-driven design insights. Provides actionable research findings that improve product usability and user satisfaction",
   "category": "design",
   "path": "agents/design/design-ux-researcher.md",
   "model": "",
   "tools": "",
   "name_fr": "Chercheur UX",
   "desc_fr": "Chercheur en expérience utilisateur expert : analyse des comportements, tests d'utilisabilité et insights de design data-driven. Fournit des conclusions actionnables qui améliorent l'utilisabilité et la satisfaction."
  },
  {
   "name": "Visual Storyteller",
   "desc": "Expert visual communication specialist focused on creating compelling visual narratives, multimedia content, and brand storytelling through design. Specializes in transforming complex information into engaging visual stories that connect with audiences and drive emotional engagement.",
   "category": "design",
   "path": "agents/design/design-visual-storyteller.md",
   "model": "",
   "tools": "",
   "name_fr": "Conteur visuel",
   "desc_fr": "Spécialiste de communication visuelle : narratives visuels convaincants, contenu multimédia et storytelling de marque par le design. Transforme l'information complexe en histoires visuelles engageantes."
  },
  {
   "name": "Whimsy Injector",
   "desc": "Expert creative specialist focused on adding personality, delight, and playful elements to brand experiences. Creates memorable, joyful interactions that differentiate brands through unexpected moments of whimsy",
   "category": "design",
   "path": "agents/design/design-whimsy-injector.md",
   "model": "",
   "tools": "",
   "name_fr": "Injecteur de fantaisie",
   "desc_fr": "Spécialiste créatif expert en personnalité, plaisir et éléments ludiques dans les expériences de marque. Crée des interactions mémorables et joyeuses qui différencient les marques."
  },
  {
   "name": "AI Data Remediation Engineer",
   "desc": "Specialist in self-healing data pipelines — uses air-gapped local SLMs and semantic clustering to automatically detect, classify, and fix data anomalies at scale. Focuses exclusively on the remediation layer: intercepting bad data, generating deterministic fix logic via Ollama, and guaranteeing zero",
   "category": "engineering",
   "path": "agents/engineering/engineering-ai-data-remediation-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur remédiation de données IA",
   "desc_fr": "Spécialiste des pipelines de données auto-réparants : détecte, classe et corrige automatiquement les anomalies de données à grande échelle via SLM locaux et clustering sémantique. Focus couche de remédiation et logique de correction déterministe."
  },
  {
   "name": "AI Engineer",
   "desc": "Expert AI/ML engineer specializing in machine learning model development, deployment, and integration into production systems. Focused on building intelligent features, data pipelines, and AI-powered applications with emphasis on practical, scalable solutions.",
   "category": "engineering",
   "path": "agents/engineering/engineering-ai-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur IA/ML",
   "desc_fr": "Ingénieur IA/ML expert : développement de modèles, déploiement et intégration en production. Construit des fonctionnalités intelligentes, des pipelines de données et des applications IA avec des solutions pratiques et scalables."
  },
  {
   "name": "Autonomous Optimization Architect",
   "desc": "Intelligent system governor that continuously shadow-tests APIs for performance while enforcing strict financial and security guardrails against runaway costs.",
   "category": "engineering",
   "path": "agents/engineering/engineering-autonomous-optimization-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte d'optimisation autonome",
   "desc_fr": "Gouverneur de systèmes intelligents qui shadow-teste en continu les API pour la performance tout en appliquant des garde-fous financiers et de sécurité stricts contre les coûts hors de contrôle."
  },
  {
   "name": "Backend Architect",
   "desc": "Senior backend architect specializing in scalable system design, database architecture, API development, and cloud infrastructure. Builds robust, secure, performant server-side applications and microservices",
   "category": "engineering",
   "path": "agents/engineering/engineering-backend-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte backend",
   "desc_fr": "Architecte backend senior : conception de systèmes scalables, architecture de bases de données, développement d'API et infrastructure cloud. Construit des applications serveur robustes, sûres et performantes."
  },
  {
   "name": "CMS Developer",
   "desc": "Drupal and WordPress specialist for theme development, custom plugins/modules, content architecture, and code-first CMS implementation",
   "category": "engineering",
   "path": "agents/engineering/engineering-cms-developer.md",
   "model": "",
   "tools": "",
   "name_fr": "Développeur CMS",
   "desc_fr": "Spécialiste Drupal et WordPress : développement de thèmes, plugins/modules sur mesure, architecture de contenu et implémentation CMS code-first."
  },
  {
   "name": "Code Reviewer",
   "desc": "Expert code reviewer who provides constructive, actionable feedback focused on correctness, maintainability, security, and performance — not style preferences.",
   "category": "engineering",
   "path": "agents/engineering/engineering-code-reviewer.md",
   "model": "",
   "tools": "",
   "name_fr": "Revoyeur de code",
   "desc_fr": "Revoyeur de code expert qui fournit un feedback constructif et actionnable centré sur la justesse, la maintenabilité, la sécurité et la performance — pas sur les préférences de style."
  },
  {
   "name": "Codebase Onboarding Engineer",
   "desc": "Expert developer onboarding specialist who helps new engineers understand unfamiliar codebases fast by reading source code, tracing code paths, and stating only facts grounded in the code.",
   "category": "engineering",
   "path": "agents/engineering/engineering-codebase-onboarding-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur onboarding codebase",
   "desc_fr": "Spécialiste d'onboarding développeur qui aide les nouveaux ingénieurs à comprendre une codebase inconnue rapidement, en lisant le code source, en traçant les chemins d'exécution et en ne citant que des faits ancrés dans le code."
  },
  {
   "name": "Data Engineer",
   "desc": "Expert data engineer specializing in building reliable data pipelines, lakehouse architectures, and scalable data infrastructure. Masters ETL/ELT, Apache Spark, dbt, streaming systems, and cloud data platforms to turn raw data into trusted, analytics-ready assets.",
   "category": "engineering",
   "path": "agents/engineering/engineering-data-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur données",
   "desc_fr": "Ingénieur données expert : pipelines fiables, architectures lakehouse et infrastructure data scalable. Maîtrise ETL/ELT, Apache Spark, dbt, streaming et plateformes cloud pour transformer les données brutes en assets fiables."
  },
  {
   "name": "Database Optimizer",
   "desc": "Expert database specialist focusing on schema design, query optimization, indexing strategies, and performance tuning for PostgreSQL, MySQL, and modern databases like Supabase and PlanetScale.",
   "category": "engineering",
   "path": "agents/engineering/engineering-database-optimizer.md",
   "model": "",
   "tools": "",
   "name_fr": "Optimiseur de bases de données",
   "desc_fr": "Expert bases de données : conception de schémas, optimisation de requêtes, stratégies d'indexation et tuning de performance pour PostgreSQL, MySQL et les bases modernes comme Supabase et PlanetScale."
  },
  {
   "name": "DevOps Automator",
   "desc": "Expert DevOps engineer specializing in infrastructure automation, CI/CD pipeline development, and cloud operations",
   "category": "engineering",
   "path": "agents/engineering/engineering-devops-automator.md",
   "model": "",
   "tools": "",
   "name_fr": "Automatiseur DevOps",
   "desc_fr": "Ingénieur DevOps expert : automatisation d'infrastructure, développement de pipelines CI/CD et opérations cloud."
  },
  {
   "name": "Email Intelligence Engineer",
   "desc": "Expert in extracting structured, reasoning-ready data from raw email threads for AI agents and automation systems",
   "category": "engineering",
   "path": "agents/engineering/engineering-email-intelligence-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur intelligence email",
   "desc_fr": "Expert en extraction de données structurées et raisonnables depuis des fils d'emails bruts, pour agents IA et systèmes d'automatisation."
  },
  {
   "name": "Embedded Firmware Engineer",
   "desc": "Specialist in bare-metal and RTOS firmware - ESP32/ESP-IDF, PlatformIO, Arduino, ARM Cortex-M, STM32 HAL/LL, Nordic nRF5/nRF Connect SDK, FreeRTOS, Zephyr",
   "category": "engineering",
   "path": "agents/engineering/engineering-embedded-firmware-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur firmware embarqué",
   "desc_fr": "Spécialiste firmware bare-metal et RTOS — ESP32/ESP-IDF, PlatformIO, Arduino, ARM Cortex-M, STM32 HAL/LL, Nordic nRF5/nRF Connect SDK, FreeRTOS, Zephyr."
  },
  {
   "name": "Feishu Integration Developer",
   "desc": "Full-stack integration expert specializing in the Feishu (Lark) Open Platform — proficient in Feishu bots, mini programs, approval workflows, Bitable (multidimensional spreadsheets), interactive message cards, Webhooks, SSO authentication, and workflow automation, building enterprise-grade collabora",
   "category": "engineering",
   "path": "agents/engineering/engineering-feishu-integration-developer.md",
   "model": "",
   "tools": "",
   "name_fr": "Développeur intégrations Feishu",
   "desc_fr": "Expert intégration full-stack de la plateforme ouverte Feishu (Lark) : bots, mini programmes, workflows d'approbation, Bitable, cartes interactives, Webhooks, SSO et automatisation de workflows."
  },
  {
   "name": "Filament Optimization Specialist",
   "desc": "Expert in restructuring and optimizing Filament PHP admin interfaces for maximum usability and efficiency. Focuses on impactful structural changes — not just cosmetic tweaks.",
   "category": "engineering",
   "path": "agents/engineering/engineering-filament-optimization-specialist.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste optimisation Filament",
   "desc_fr": "Expert en restructuration et optimisation des interfaces admin Filament PHP pour une utilisabilité et une efficacité maximales. Se concentre sur les changements structurels à impact — pas les retouches cosmétiques."
  },
  {
   "name": "Frontend Developer",
   "desc": "Expert frontend developer specializing in modern web technologies, React/Vue/Angular frameworks, UI implementation, and performance optimization",
   "category": "engineering",
   "path": "agents/engineering/engineering-frontend-developer.md",
   "model": "",
   "tools": "",
   "name_fr": "Développeur frontend",
   "desc_fr": "Développeur frontend expert : technologies web modernes, frameworks React/Vue/Angular, implémentation UI et optimisation des performances."
  },
  {
   "name": "Git Workflow Master",
   "desc": "Expert in Git workflows, branching strategies, and version control best practices including conventional commits, rebasing, worktrees, and CI-friendly branch management.",
   "category": "engineering",
   "path": "agents/engineering/engineering-git-workflow-master.md",
   "model": "",
   "tools": "",
   "name_fr": "Maître du workflow Git",
   "desc_fr": "Expert des workflows Git, stratégies de branches et bonnes pratiques de versioning : conventional commits, rebasing, worktrees et gestion de branches compatible CI."
  },
  {
   "name": "Incident Response Commander",
   "desc": "Expert incident commander specializing in production incident management, structured response coordination, post-mortem facilitation, SLO/SLI tracking, and on-call process design for reliable engineering organizations.",
   "category": "engineering",
   "path": "agents/engineering/engineering-incident-response-commander.md",
   "model": "",
   "tools": "",
   "name_fr": "Commandant de réponse à incident",
   "desc_fr": "Commandant d'incident expert : gestion d'incidents de production, coordination structurée de la réponse, facilitation de post-mortems, suivi SLO/SLI et conception de process d'astreinte pour des organisations fiables."
  },
  {
   "name": "Minimal Change Engineer",
   "desc": "Engineering specialist focused on minimum-viable diffs — fixes only what was asked, refuses scope creep, prefers three similar lines over a premature abstraction. The discipline that prevents bug-fix PRs from becoming refactor avalanches.",
   "category": "engineering",
   "path": "agents/engineering/engineering-minimal-change-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur changement minimal",
   "desc_fr": "Spécialiste ingénierie des diffs minimum viables : ne corrige que ce qui est demandé, refuse le scope creep, préfère trois lignes similaires à une abstraction prématurée."
  },
  {
   "name": "Mobile App Builder",
   "desc": "Specialized mobile application developer with expertise in native iOS/Android development and cross-platform frameworks",
   "category": "engineering",
   "path": "agents/engineering/engineering-mobile-app-builder.md",
   "model": "",
   "tools": "",
   "name_fr": "Développeur d'applications mobiles",
   "desc_fr": "Développeur mobile spécialisé : développement natif iOS/Android et frameworks cross-platform."
  },
  {
   "name": "Rapid Prototyper",
   "desc": "Specialized in ultra-fast proof-of-concept development and MVP creation using efficient tools and frameworks",
   "category": "engineering",
   "path": "agents/engineering/engineering-rapid-prototyper.md",
   "model": "",
   "tools": "",
   "name_fr": "Prototypage rapide",
   "desc_fr": "Spécialisé dans le développement de preuves de concept ultra-rapides et la création de MVP avec des outils et frameworks efficaces."
  },
  {
   "name": "Security Engineer",
   "desc": "Expert application security engineer specializing in threat modeling, vulnerability assessment, secure code review, security architecture design, and incident response for modern web, API, and cloud-native applications.",
   "category": "engineering",
   "path": "agents/engineering/engineering-security-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur sécurité",
   "desc_fr": "Ingénieur sécurité applicative expert : threat modeling, évaluation de vulnérabilités, revue de code sécurisée, architecture de sécurité et réponse à incident pour applications web, API et cloud-native modernes."
  },
  {
   "name": "Senior Developer",
   "desc": "Premium implementation specialist - Masters Laravel/Livewire/FluxUI, advanced CSS, Three.js integration",
   "category": "engineering",
   "path": "agents/engineering/engineering-senior-developer.md",
   "model": "",
   "tools": "",
   "name_fr": "Développeur senior",
   "desc_fr": "Spécialiste d'implémentation premium — maîtrise Laravel/Livewire/FluxUI, CSS avancé et intégration Three.js."
  },
  {
   "name": "Software Architect",
   "desc": "Expert software architect specializing in system design, domain-driven design, architectural patterns, and technical decision-making for scalable, maintainable systems.",
   "category": "engineering",
   "path": "agents/engineering/engineering-software-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte logiciel",
   "desc_fr": "Architecte logiciel expert : conception de systèmes, domain-driven design, patterns d'architecture et prise de décision technique pour des systèmes scalables et maintenables."
  },
  {
   "name": "Solidity Smart Contract Engineer",
   "desc": "Expert Solidity developer specializing in EVM smart contract architecture, gas optimization, upgradeable proxy patterns, DeFi protocol development, and security-first contract design across Ethereum and L2 chains.",
   "category": "engineering",
   "path": "agents/engineering/engineering-solidity-smart-contract-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur smart contracts Solidity",
   "desc_fr": "Développeur Solidity expert : architecture de contrats EVM, optimisation du gas, patterns de proxy upgradeables, développement DeFi et design de contrats security-first sur Ethereum et les L2."
  },
  {
   "name": "SRE (Site Reliability Engineer)",
   "desc": "Expert site reliability engineer specializing in SLOs, error budgets, observability, chaos engineering, and toil reduction for production systems at scale.",
   "category": "engineering",
   "path": "agents/engineering/engineering-sre.md",
   "model": "",
   "tools": "",
   "name_fr": "SRE (fiabilité production)",
   "desc_fr": "Ingénieur fiabilité expert : SLOs, budgets d'erreur, observabilité, chaos engineering et réduction du toil pour des systèmes de production à grande échelle."
  },
  {
   "name": "Technical Writer",
   "desc": "Expert technical writer specializing in developer documentation, API references, README files, and tutorials. Transforms complex engineering concepts into clear, accurate, and engaging docs that developers actually read and use.",
   "category": "engineering",
   "path": "agents/engineering/engineering-technical-writer.md",
   "model": "",
   "tools": "",
   "name_fr": "Rédacteur technique",
   "desc_fr": "Rédacteur technique expert : documentation développeur, références API, README et tutoriels. Transforme des concepts d'ingénierie complexes en documents clairs, exacts et engageants que les développeurs lisent vraiment."
  },
  {
   "name": "Threat Detection Engineer",
   "desc": "Expert detection engineer specializing in SIEM rule development, MITRE ATT&CK coverage mapping, threat hunting, alert tuning, and detection-as-code pipelines for security operations teams.",
   "category": "engineering",
   "path": "agents/engineering/engineering-threat-detection-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur détection de menaces",
   "desc_fr": "Ingénieur de détection expert : développement de règles SIEM, couverture MITRE ATT&CK, threat hunting, tuning d'alertes et pipelines detection-as-code pour les équipes de sécurité."
  },
  {
   "name": "Voice AI Integration Engineer",
   "desc": "Expert in building end-to-end speech transcription pipelines using Whisper-style models and cloud ASR services — from raw audio ingestion through preprocessing, transcript cleanup, subtitle generation, speaker diarization, and structured downstream integration into apps, APIs, and CMS platforms.",
   "category": "engineering",
   "path": "agents/engineering/engineering-voice-ai-integration-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur intégration Voice AI",
   "desc_fr": "Expert des pipelines de transcription vocale de bout en bout avec modèles type Whisper et services ASR cloud : ingestion audio, préprocessing, nettoyage de transcriptions, sous-titres, diarisation de locuteurs et intégration en aval."
  },
  {
   "name": "WeChat Mini Program Developer",
   "desc": "Expert WeChat Mini Program developer specializing in 小程序 development with WXML/WXSS/WXS, WeChat API integration, payment systems, subscription messaging, and the full WeChat ecosystem.",
   "category": "engineering",
   "path": "agents/engineering/engineering-wechat-mini-program-developer.md",
   "model": "",
   "tools": "",
   "name_fr": "Développeur WeChat Mini Program",
   "desc_fr": "Développeur expert WeChat Mini Program (小程序) : WXML/WXSS/WXS, intégration des APIs WeChat, systèmes de paiement, messages d'abonnement et tout l'écosystème WeChat."
  },
  {
   "name": "Bookkeeper & Controller",
   "desc": "Expert bookkeeper and controller specializing in day-to-day accounting operations, financial reconciliations, month-end close processes, and internal controls. Ensures the accuracy, completeness, and timeliness of financial records while maintaining GAAP compliance and audit readiness at all times.",
   "category": "finance",
   "path": "agents/finance/finance-bookkeeper-controller.md",
   "model": "",
   "tools": "",
   "name_fr": "Comptable et contrôleur",
   "desc_fr": "Expert comptabilité courante : rapprochements financiers, clôtures mensuelles et contrôles internes. Garantit l'exactitude, l'exhaustivité et la ponctualité des enregistrements, en conformité GAAP et prêt pour audit."
  },
  {
   "name": "Financial Analyst",
   "desc": "Expert financial analyst specializing in financial modeling, forecasting, scenario analysis, and data-driven decision support. Transforms raw financial data into actionable business intelligence that drives strategic planning, investment decisions, and operational optimization.",
   "category": "finance",
   "path": "agents/finance/finance-financial-analyst.md",
   "model": "",
   "tools": "",
   "name_fr": "Analyste financier",
   "desc_fr": "Analyste financier expert : modélisation, prévisions, analyses de scénarios et aide à la décision data-driven. Transforme les données financières brutes en intelligence actionnable pour la planification stratégique et les investissements."
  },
  {
   "name": "FP&A Analyst",
   "desc": "Expert Financial Planning & Analysis (FP&A) analyst specializing in budgeting, variance analysis, financial planning, rolling forecasts, and strategic decision support. Bridges the gap between the numbers and the business narrative to drive operational performance and strategic resource allocation.",
   "category": "finance",
   "path": "agents/finance/finance-fpa-analyst.md",
   "model": "",
   "tools": "",
   "name_fr": "Analyste FP&A",
   "desc_fr": "Analyste Financial Planning & Analysis expert : budgétisation, analyse des écarts, prévisions glissantes et aide à la décision stratégique. Relie les chiffres au récit métier pour piloter la performance et l'allocation des ressources."
  },
  {
   "name": "Investment Researcher",
   "desc": "Expert investment researcher specializing in market research, due diligence, portfolio analysis, and asset valuation. Conducts rigorous fundamental and quantitative analysis to identify investment opportunities, assess risks, and support data-driven portfolio decisions across public equities, privat",
   "category": "finance",
   "path": "agents/finance/finance-investment-researcher.md",
   "model": "",
   "tools": "",
   "name_fr": "Chercheur en investissement",
   "desc_fr": "Chercheur en investissement expert : étude de marché, due diligence, analyse de portefeuille et valorisation d'actifs. Mène des analyses fondamentales et techniques rigoureuses."
  },
  {
   "name": "Tax Strategist",
   "desc": "Expert tax strategist specializing in tax optimization, multi-jurisdictional compliance, transfer pricing, and strategic tax planning. Navigates complex tax codes to minimize liability while ensuring full regulatory compliance across local, state, federal, and international tax regimes.",
   "category": "finance",
   "path": "agents/finance/finance-tax-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège fiscal",
   "desc_fr": "Stratège fiscal expert : optimisation fiscale, conformité multi-juridictions, prix de transfert et planification fiscale stratégique. Navigue les codes fiscaux complexes en restant pleinement conforme."
  },
  {
   "name": "Blender Add-on Engineer",
   "desc": "Blender tooling specialist - Builds Python add-ons, asset validators, exporters, and pipeline automations that turn repetitive DCC work into reliable one-click workflows",
   "category": "game-development",
   "path": "agents/game-development/blender/blender-addon-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur add-ons Blender",
   "desc_fr": "Spécialiste outillage Blender : construit des add-ons Python, validateurs d'assets, exporteurs et automatisations de pipeline qui transforment le travail DCC répétitif en workflows fiables en un clic."
  },
  {
   "name": "Game Audio Engineer",
   "desc": "Interactive audio specialist - Masters FMOD/Wwise integration, adaptive music systems, spatial audio, and audio performance budgeting across all game engines",
   "category": "game-development",
   "path": "agents/game-development/game-audio-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur audio jeu",
   "desc_fr": "Spécialiste audio interactif — maîtrise l'intégration FMOD/Wwise, les systèmes de musique adaptative, l'audio spatial et le budget de performance audio sur tous les moteurs de jeu."
  },
  {
   "name": "Game Designer",
   "desc": "Systems and mechanics architect - Masters GDD authorship, player psychology, economy balancing, and gameplay loop design across all engines and genres",
   "category": "game-development",
   "path": "agents/game-development/game-designer.md",
   "model": "",
   "tools": "",
   "name_fr": "Game designer",
   "desc_fr": "Architecte systèmes et mécaniques — maîtrise la rédaction de GDD, la psychologie du joueur, l'équilibrage économique et le design de boucles de gameplay sur tous les moteurs et genres."
  },
  {
   "name": "Godot Gameplay Scripter",
   "desc": "Composition and signal integrity specialist - Masters GDScript 2.0, C# integration, node-based architecture, and type-safe signal design for Godot 4 projects",
   "category": "game-development",
   "path": "agents/game-development/godot/godot-gameplay-scripter.md",
   "model": "",
   "tools": "",
   "name_fr": "Scripteur gameplay Godot",
   "desc_fr": "Spécialiste composition et intégrité des signaux — maîtrise GDScript 2.0, l'intégration C#, l'architecture par nœuds et le design de signaux type-safe pour projets Godot 4."
  },
  {
   "name": "Godot Multiplayer Engineer",
   "desc": "Godot 4 networking specialist - Masters the MultiplayerAPI, scene replication, ENet/WebRTC transport, RPCs, and authority models for real-time multiplayer games",
   "category": "game-development",
   "path": "agents/game-development/godot/godot-multiplayer-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur multijoueur Godot",
   "desc_fr": "Spécialiste réseau Godot 4 — maîtrise le MultiplayerAPI, la réplication de scènes, les transports ENet/WebRTC, les RPC et les modèles d'autorité pour jeux multijoueur temps réel."
  },
  {
   "name": "Godot Shader Developer",
   "desc": "Godot 4 visual effects specialist - Masters the Godot Shading Language (GLSL-like), VisualShader editor, CanvasItem and Spatial shaders, post-processing, and performance optimization for 2D/3D effects",
   "category": "game-development",
   "path": "agents/game-development/godot/godot-shader-developer.md",
   "model": "",
   "tools": "",
   "name_fr": "Développeur shaders Godot",
   "desc_fr": "Spécialiste effets visuels Godot 4 — maîtrise le Godot Shading Language, l'éditeur VisualShader, les shaders CanvasItem et Spatial, le post-processing et l'optimisation de performances 2D/3D."
  },
  {
   "name": "Level Designer",
   "desc": "Spatial storytelling and flow specialist - Masters layout theory, pacing architecture, encounter design, and environmental narrative across all game engines",
   "category": "game-development",
   "path": "agents/game-development/level-designer.md",
   "model": "",
   "tools": "",
   "name_fr": "Level designer",
   "desc_fr": "Spécialiste du storytelling spatial et du flow — maîtrise la théorie du layout, l'architecture du pacing, le design d'encounters et la narration environnementale sur tous les moteurs de jeu."
  },
  {
   "name": "Narrative Designer",
   "desc": "Story systems and dialogue architect - Masters GDD-aligned narrative design, branching dialogue, lore architecture, and environmental storytelling across all game engines",
   "category": "game-development",
   "path": "agents/game-development/narrative-designer.md",
   "model": "",
   "tools": "",
   "name_fr": "Narrative designer",
   "desc_fr": "Architecte de systèmes narratifs et dialogues — maîtrise le design narratif aligné au GDD, les dialogues à embranchements, l'architecture de lore et le storytelling environnemental."
  },
  {
   "name": "Roblox Avatar Creator",
   "desc": "Roblox UGC and avatar pipeline specialist - Masters Roblox's avatar system, UGC item creation, accessory rigging, texture standards, and the Creator Marketplace submission pipeline",
   "category": "game-development",
   "path": "agents/game-development/roblox-studio/roblox-avatar-creator.md",
   "model": "",
   "tools": "",
   "name_fr": "Créateur d'avatars Roblox",
   "desc_fr": "Spécialiste du pipeline UGC et avatars Roblox — maîtrise le système d'avatars Roblox, la création d'items UGC, le rigging d'accessoires, les standards de textures et le Creator Marketplace."
  },
  {
   "name": "Roblox Experience Designer",
   "desc": "Roblox platform UX and monetization specialist - Masters engagement loop design, DataStore-driven progression, Roblox monetization systems (Passes, Developer Products, UGC), and player retention for Roblox experiences",
   "category": "game-development",
   "path": "agents/game-development/roblox-studio/roblox-experience-designer.md",
   "model": "",
   "tools": "",
   "name_fr": "Designer d'expériences Roblox",
   "desc_fr": "Spécialiste UX et monétisation Roblox — maîtrise le design de boucles d'engagement, la progression via DataStore et les systèmes de monétisation Roblox (Passes, Dev Products)."
  },
  {
   "name": "Roblox Systems Scripter",
   "desc": "Roblox platform engineering specialist - Masters Luau, the client-server security model, RemoteEvents/RemoteFunctions, DataStore, and module architecture for scalable Roblox experiences",
   "category": "game-development",
   "path": "agents/game-development/roblox-studio/roblox-systems-scripter.md",
   "model": "",
   "tools": "",
   "name_fr": "Scripteur systèmes Roblox",
   "desc_fr": "Spécialiste d'ingénierie plateforme Roblox — maîtrise Luau, le modèle de sécurité client-serveur, RemoteEvents/RemoteFunctions, DataStore et l'architecture modulaire pour expériences scalables."
  },
  {
   "name": "Technical Artist",
   "desc": "Art-to-engine pipeline specialist - Masters shaders, VFX systems, LOD pipelines, performance budgeting, and cross-engine asset optimization",
   "category": "game-development",
   "path": "agents/game-development/technical-artist.md",
   "model": "",
   "tools": "",
   "name_fr": "Technical artist",
   "desc_fr": "Spécialiste du pipeline art→moteur — maîtrise les shaders, les systèmes VFX, les pipelines LOD, le budget de performance et l'optimisation d'assets cross-moteur."
  },
  {
   "name": "Tokenomics Designer",
   "desc": "Expert en design de tokenomics pour crypto-games et projets Solana. Conçoit des modèles économiques durables (P2E, Skill2E, Casual), évite les Ponzi schemes, équilibre supply/demand, vesting, distribution, sources et puits de tokens. Spécialiste de l'analyse anti-inflation et de la rétention long te",
   "category": "game-development",
   "path": "agents/game-development/tokenomics-designer.md",
   "model": "sonnet",
   "tools": "Read, Write, Edit, WebSearch",
   "name_fr": "Designer de tokenomics",
   "desc_fr": "Expert en design de tokenomics pour crypto-games et projets Solana. Conçoit des modèles économiques durables (P2E, Skill2E, Casual), évite les schémas de Ponzi, équilibre offre/demande, vesting, distribution, sources et puits de tokens."
  },
  {
   "name": "Unity Architect",
   "desc": "Data-driven modularity specialist - Masters ScriptableObjects, decoupled systems, and single-responsibility component design for scalable Unity projects",
   "category": "game-development",
   "path": "agents/game-development/unity/unity-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte Unity",
   "desc_fr": "Spécialiste de modularité data-driven — maîtrise les ScriptableObjects, les systèmes découplés et le design de composants à responsabilité unique pour projets Unity scalables."
  },
  {
   "name": "Unity Editor Tool Developer",
   "desc": "Unity editor automation specialist - Masters custom EditorWindows, PropertyDrawers, AssetPostprocessors, ScriptedImporters, and pipeline automation that saves teams hours per week",
   "category": "game-development",
   "path": "agents/game-development/unity/unity-editor-tool-developer.md",
   "model": "",
   "tools": "",
   "name_fr": "Développeur d'outils Unity Editor",
   "desc_fr": "Spécialiste d'automatisation Unity Editor — maîtrise les EditorWindows personnalisés, PropertyDrawers, AssetPostprocessors, ScriptedImporters et l'automatisation de pipeline qui fait gagner des heures chaque semaine."
  },
  {
   "name": "Unity Multiplayer Engineer",
   "desc": "Networked gameplay specialist - Masters Netcode for GameObjects, Unity Gaming Services (Relay/Lobby), client-server authority, lag compensation, and state synchronization",
   "category": "game-development",
   "path": "agents/game-development/unity/unity-multiplayer-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur multijoueur Unity",
   "desc_fr": "Spécialiste de gameplay en réseau — maîtrise Netcode for GameObjects, Unity Gaming Services (Relay/Lobby), l'autorité client-serveur, la compensation de latence et la synchronisation d'état."
  },
  {
   "name": "Unity Shader Graph Artist",
   "desc": "Visual effects and material specialist - Masters Unity Shader Graph, HLSL, URP/HDRP rendering pipelines, and custom pass authoring for real-time visual effects",
   "category": "game-development",
   "path": "agents/game-development/unity/unity-shader-graph-artist.md",
   "model": "",
   "tools": "",
   "name_fr": "Artiste Shader Graph Unity",
   "desc_fr": "Spécialiste effets visuels et matériaux — maîtrise Unity Shader Graph, HLSL, les pipelines URP/HDRP et l'écriture de custom passes pour effets visuels temps réel."
  },
  {
   "name": "Unreal Multiplayer Architect",
   "desc": "Unreal Engine networking specialist - Masters Actor replication, GameMode/GameState architecture, server-authoritative gameplay, network prediction, and dedicated server setup for UE5",
   "category": "game-development",
   "path": "agents/game-development/unreal-engine/unreal-multiplayer-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte multijoueur Unreal",
   "desc_fr": "Spécialiste réseau Unreal Engine — maîtrise la réplication d'Actors, l'architecture GameMode/GameState, le gameplay server-authoritative, la prédiction réseau et le serveur dédié pour UE5."
  },
  {
   "name": "Unreal Systems Engineer",
   "desc": "Performance and hybrid architecture specialist - Masters C++/Blueprint continuum, Nanite geometry, Lumen GI, and Gameplay Ability System for AAA-grade Unreal Engine projects",
   "category": "game-development",
   "path": "agents/game-development/unreal-engine/unreal-systems-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur systèmes Unreal",
   "desc_fr": "Spécialiste performance et architecture hybride — maîtrise le continuum C++/Blueprint, la géométrie Nanite, le GI Lumen et le Gameplay Ability System pour projets AAA Unreal Engine."
  },
  {
   "name": "Unreal Technical Artist",
   "desc": "Unreal Engine visual pipeline specialist - Masters the Material Editor, Niagara VFX, Procedural Content Generation, and the art-to-engine pipeline for UE5 projects",
   "category": "game-development",
   "path": "agents/game-development/unreal-engine/unreal-technical-artist.md",
   "model": "",
   "tools": "",
   "name_fr": "Technical artist Unreal",
   "desc_fr": "Spécialiste du pipeline visuel Unreal Engine — maîtrise le Material Editor, Niagara VFX, la génération procédurale de contenu et le pipeline art→moteur pour projets UE5."
  },
  {
   "name": "Unreal World Builder",
   "desc": "Open-world and environment specialist - Masters UE5 World Partition, Landscape, procedural foliage, HLOD, and large-scale level streaming for seamless open-world experiences",
   "category": "game-development",
   "path": "agents/game-development/unreal-engine/unreal-world-builder.md",
   "model": "",
   "tools": "",
   "name_fr": "Constructeur de mondes Unreal",
   "desc_fr": "Spécialiste open-world et environnements — maîtrise World Partition, Landscape, le feuillage procédural, les HLOD et le level streaming à grande échelle pour des mondes ouverts fluides."
  },
  {
   "name": "Agentic Search Optimizer",
   "desc": "Expert in WebMCP readiness and agentic task completion — audits whether AI agents can actually accomplish tasks on your site (book, buy, register, subscribe), implements WebMCP declarative and imperative patterns, and measures task completion rates across AI browsing agents",
   "category": "marketing",
   "path": "agents/marketing/marketing-agentic-search-optimizer.md",
   "model": "",
   "tools": "",
   "name_fr": "Optimiseur de recherche agentique",
   "desc_fr": "Expert en préparation WebMCP et complétion de tâches agentiques : audite si les agents IA peuvent réellement accomplir des tâches sur votre site (réserver, acheter, s'inscrire), implémente les patterns WebMCP et mesure les taux de complétion."
  },
  {
   "name": "AI Citation Strategist",
   "desc": "Expert in AI recommendation engine optimization (AEO/GEO) — audits brand visibility across ChatGPT, Claude, Gemini, and Perplexity, identifies why competitors get cited instead, and delivers content fixes that improve AI citations",
   "category": "marketing",
   "path": "agents/marketing/marketing-ai-citation-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège citations IA (AEO/GEO)",
   "desc_fr": "Expert en optimisation pour moteurs de recommandation IA : audite la visibilité de la marque sur ChatGPT, Claude, Gemini et Perplexity, identifie pourquoi les concurrents sont cités à votre place et livre les correctifs de contenu."
  },
  {
   "name": "App Store Optimizer",
   "desc": "Expert app store marketing specialist focused on App Store Optimization (ASO), conversion rate optimization, and app discoverability",
   "category": "marketing",
   "path": "agents/marketing/marketing-app-store-optimizer.md",
   "model": "",
   "tools": "",
   "name_fr": "Optimiseur App Store (ASO)",
   "desc_fr": "Expert marketing app store : optimisation ASO, taux de conversion et découvrabilité des applications."
  },
  {
   "name": "Baidu SEO Specialist",
   "desc": "Expert Baidu search optimization specialist focused on Chinese search engine ranking, Baidu ecosystem integration, ICP compliance, Chinese keyword research, and mobile-first indexing for the China market.",
   "category": "marketing",
   "path": "agents/marketing/marketing-baidu-seo-specialist.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste SEO Baidu",
   "desc_fr": "Expert du référencement Baidu : classement sur le moteur chinois, intégration à l'écosystème, conformité ICP, recherche de mots-clés chinois et indexation mobile-first pour le marché chinois."
  },
  {
   "name": "Bilibili Content Strategist",
   "desc": "Expert Bilibili marketing specialist focused on UP主 growth, danmaku culture mastery, B站 algorithm optimization, community building, and branded content strategy for China's leading video community platform.",
   "category": "marketing",
   "path": "agents/marketing/marketing-bilibili-content-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège contenu Bilibili",
   "desc_fr": "Expert marketing Bilibili : croissance des UP主, culture danmaku, optimisation pour l'algorithme B站, animation de communauté et stratégie de contenu de marque pour la plateforme vidéo chinoise."
  },
  {
   "name": "Book Co-Author",
   "desc": "Strategic thought-leadership book collaborator for founders, experts, and operators turning voice notes, fragments, and positioning into structured first-person chapters.",
   "category": "marketing",
   "path": "agents/marketing/marketing-book-co-author.md",
   "model": "",
   "tools": "",
   "name_fr": "Co-auteur de livre",
   "desc_fr": "Collaborateur de livre de thought leadership pour fondateurs, experts et opérateurs : transforme notes vocales, fragments et positionnement en chapitres structurés à la première personne."
  },
  {
   "name": "Carousel Growth Engine",
   "desc": "Autonomous TikTok and Instagram carousel generation specialist. Analyzes any website URL with Playwright, generates viral 6-slide carousels via Gemini image generation, publishes directly to feed via Upload-Post API with auto trending music, fetches analytics, and iteratively improves through a data",
   "category": "marketing",
   "path": "agents/marketing/marketing-carousel-growth-engine.md",
   "model": "",
   "tools": "",
   "name_fr": "Moteur de growth carrousels",
   "desc_fr": "Spécialiste autonome de génération de carrousels TikTok/Instagram : analyse n'importe quelle URL avec Playwright, génère des carrousels viraux 6 slides via Gemini, publie avec musique tendance et itère grâce aux analytics."
  },
  {
   "name": "China E-Commerce Operator",
   "desc": "Expert China e-commerce operations specialist covering Taobao, Tmall, Pinduoduo, and JD ecosystems with deep expertise in product listing optimization, live commerce, store operations, 618/Double 11 campaigns, and cross-platform strategy.",
   "category": "marketing",
   "path": "agents/marketing/marketing-china-ecommerce-operator.md",
   "model": "",
   "tools": "",
   "name_fr": "Opérateur e-commerce Chine",
   "desc_fr": "Expert opérations e-commerce Chine : écosystèmes Taobao, Tmall, Pinduoduo et JD, optimisation des fiches produit, live commerce, opérations de boutique, campagnes 618/Double 11 et stratégie cross-plateforme."
  },
  {
   "name": "China Market Localization Strategist",
   "desc": "Full-stack China market localization expert who transforms real-time trend signals into executable go-to-market strategies across Douyin, Xiaohongshu, WeChat, Bilibili, and beyond",
   "category": "marketing",
   "path": "agents/marketing/marketing-china-market-localization-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège localisation marché chinois",
   "desc_fr": "Expert localisation full-stack du marché chinois : transforme les signaux de tendance en temps réel en stratégies go-to-market exécutables sur Douyin, Xiaohongshu, WeChat, Bilibili et au-delà."
  },
  {
   "name": "Content Creator",
   "desc": "Expert content strategist and creator for multi-platform campaigns. Develops editorial calendars, creates compelling copy, manages brand storytelling, and optimizes content for engagement across all digital channels.",
   "category": "marketing",
   "path": "agents/marketing/marketing-content-creator.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit",
   "name_fr": "Créateur de contenu",
   "desc_fr": "Stratège et créateur de contenu pour campagnes multi-plateformes : calendriers éditoriaux, copywriting percutant, storytelling de marque et optimisation de l'engagement sur tous les canaux digitaux."
  },
  {
   "name": "Cross-Border E-Commerce Specialist",
   "desc": "Full-funnel cross-border e-commerce strategist covering Amazon, Shopee, Lazada, AliExpress, Temu, and TikTok Shop operations, international logistics and overseas warehousing, compliance and taxation, multilingual listing optimization, brand globalization, and DTC independent site development.",
   "category": "marketing",
   "path": "agents/marketing/marketing-cross-border-ecommerce.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste e-commerce transfrontalier",
   "desc_fr": "Stratège e-commerce transfrontalier full-funnel : opérations Amazon, Shopee, Lazada, AliExpress, Temu et TikTok Shop, logistique internationale, conformité et fiscalité, fiches multilingues et DTC."
  },
  {
   "name": "Douyin Strategist",
   "desc": "Short-video marketing expert specializing in the Douyin platform, with deep expertise in recommendation algorithm mechanics, viral video planning, livestream commerce workflows, and full-funnel brand growth through content matrix strategies.",
   "category": "marketing",
   "path": "agents/marketing/marketing-douyin-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège Douyin",
   "desc_fr": "Expert marketing short-video sur Douyin : mécanique de l'algorithme de recommandation, planification de vidéos virales, workflows de live commerce et croissance de marque full-funnel par stratégies de matrice de contenu."
  },
  {
   "name": "Growth Hacker",
   "desc": "Expert growth strategist specializing in rapid user acquisition through data-driven experimentation. Develops viral loops, optimizes conversion funnels, and finds scalable growth channels for exponential business growth.",
   "category": "marketing",
   "path": "agents/marketing/marketing-growth-hacker.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit",
   "name_fr": "Growth hacker",
   "desc_fr": "Stratège growth expert : acquisition rapide d'utilisateurs par expérimentation data-driven. Développe des boucles virales, optimise les tunnels de conversion et trouve des canaux de croissance scalables."
  },
  {
   "name": "Instagram Curator",
   "desc": "Expert Instagram marketing specialist focused on visual storytelling, community building, and multi-format content optimization. Masters aesthetic development and drives meaningful engagement.",
   "category": "marketing",
   "path": "agents/marketing/marketing-instagram-curator.md",
   "model": "",
   "tools": "",
   "name_fr": "Curateur Instagram",
   "desc_fr": "Expert marketing Instagram : storytelling visuel, animation de communauté et optimisation de contenu multi-format. Maîtrise le développement esthétique et la croissance organique."
  },
  {
   "name": "Kuaishou Strategist",
   "desc": "Expert Kuaishou marketing strategist specializing in short-video content for China's lower-tier city markets, live commerce operations, community trust building, and grassroots audience growth on 快手.",
   "category": "marketing",
   "path": "agents/marketing/marketing-kuaishou-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège Kuaishou",
   "desc_fr": "Stratège marketing Kuaishou expert : short-video pour les marchés des villes de second rang chinois, opérations de live commerce, confiance communautaire et croissance."
  },
  {
   "name": "LinkedIn Content Creator",
   "desc": "Expert LinkedIn content strategist focused on thought leadership, personal brand building, and high-engagement professional content. Masters LinkedIn's algorithm and culture to drive inbound opportunities for founders, job seekers, developers, and anyone building a professional presence.",
   "category": "marketing",
   "path": "agents/marketing/marketing-linkedin-content-creator.md",
   "model": "",
   "tools": "",
   "name_fr": "Créateur de contenu LinkedIn",
   "desc_fr": "Stratège de contenu LinkedIn expert : thought leadership, construction de marque personnelle et contenu professionnel à fort engagement. Maîtrise l'algorithme et les formats de LinkedIn."
  },
  {
   "name": "Livestream Commerce Coach",
   "desc": "Veteran livestream e-commerce coach specializing in host training and live room operations across Douyin, Kuaishou, Taobao Live, and Channels, covering script design, product sequencing, paid-vs-organic traffic balancing, conversion closing techniques, and real-time data-driven optimization.",
   "category": "marketing",
   "path": "agents/marketing/marketing-livestream-commerce-coach.md",
   "model": "",
   "tools": "",
   "name_fr": "Coach live commerce",
   "desc_fr": "Coach e-commerce en direct vétéran : formation des animateurs et gestion de studios live sur Douyin, Kuaishou, Taobao Live et Channels — scripts, rythme, conversion et gestion de l'audience."
  },
  {
   "name": "Podcast Strategist",
   "desc": "Content strategy and operations expert for the Chinese podcast market, with deep expertise in Xiaoyuzhou, Ximalaya, and other major audio platforms, covering show positioning, audio production, audience growth, multi-platform distribution, and monetization to help podcast creators build sticky audio",
   "category": "marketing",
   "path": "agents/marketing/marketing-podcast-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège podcast (Chine)",
   "desc_fr": "Expert stratégie et opérations de contenu pour le marché du podcast chinois : expertise approfondie de Xiaoyuzhou, Ximalaya et des principales plateformes audio, monétisation et croissance d'audience."
  },
  {
   "name": "Private Domain Operator",
   "desc": "Expert in building enterprise WeChat (WeCom) private domain ecosystems, with deep expertise in SCRM systems, segmented community operations, Mini Program commerce integration, user lifecycle management, and full-funnel conversion optimization.",
   "category": "marketing",
   "path": "agents/marketing/marketing-private-domain-operator.md",
   "model": "",
   "tools": "",
   "name_fr": "Opérateur domaine privé WeCom",
   "desc_fr": "Expert de la construction d'écosystèmes de domaine privé WeChat d'entreprise (WeCom) : systèmes SCRM, opérations de communautés segmentées, Mini Programs et rétention client."
  },
  {
   "name": "Reddit Community Builder",
   "desc": "Expert Reddit marketing specialist focused on authentic community engagement, value-driven content creation, and long-term relationship building. Masters Reddit culture navigation.",
   "category": "marketing",
   "path": "agents/marketing/marketing-reddit-community-builder.md",
   "model": "",
   "tools": "",
   "name_fr": "Constructeur de communautés Reddit",
   "desc_fr": "Expert marketing Reddit : engagement communautaire authentique, création de contenu à valeur et construction de relations long terme. Maîtrise la culture et les codes des subreddits."
  },
  {
   "name": "SEO Specialist",
   "desc": "Expert search engine optimization strategist specializing in technical SEO, content optimization, link authority building, and organic search growth. Drives sustainable traffic through data-driven search strategies.",
   "category": "marketing",
   "path": "agents/marketing/marketing-seo-specialist.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit",
   "name_fr": "Spécialiste SEO",
   "desc_fr": "Stratège SEO expert : SEO technique, optimisation de contenu, construction d'autorité de liens et croissance du trafic organique. Génère un trafic durable par des stratégies data-driven."
  },
  {
   "name": "Short-Video Editing Coach",
   "desc": "Hands-on short-video editing coach covering the full post-production pipeline, with mastery of CapCut Pro, Premiere Pro, DaVinci Resolve, and Final Cut Pro across composition and camera language, color grading, audio engineering, motion graphics and VFX, subtitle design, multi-platform export optimi",
   "category": "marketing",
   "path": "agents/marketing/marketing-short-video-editing-coach.md",
   "model": "",
   "tools": "",
   "name_fr": "Coach montage short-video",
   "desc_fr": "Coach de montage short-video couvrant toute la post-production : CapCut Pro, Premiere Pro, DaVinci Resolve et Final Cut Pro — composition, langage caméra, étalonnage, audio, motion design/VFX, sous-titres et export multi-plateformes."
  },
  {
   "name": "Social Media Strategist",
   "desc": "Expert social media strategist for LinkedIn, Twitter, and professional platforms. Creates cross-platform campaigns, builds communities, manages real-time engagement, and develops thought leadership strategies.",
   "category": "marketing",
   "path": "agents/marketing/marketing-social-media-strategist.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit",
   "name_fr": "Stratège réseaux sociaux",
   "desc_fr": "Stratège réseaux sociaux expert pour LinkedIn, Twitter et plateformes professionnelles : campagnes cross-plateformes, animation de communautés, engagement temps réel et stratégies de thought leadership."
  },
  {
   "name": "TikTok Strategist",
   "desc": "Expert TikTok marketing specialist focused on viral content creation, algorithm optimization, and community building. Masters TikTok's unique culture and features for brand growth.",
   "category": "marketing",
   "path": "agents/marketing/marketing-tiktok-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège TikTok",
   "desc_fr": "Expert marketing TikTok : création de contenu viral, optimisation pour l'algorithme et animation de communauté. Maîtrise la culture et les spécificités uniques de TikTok pour la croissance de marque."
  },
  {
   "name": "Twitter Engager",
   "desc": "Expert Twitter marketing specialist focused on real-time engagement, thought leadership building, and community-driven growth. Builds brand authority through authentic conversation participation and viral thread creation.",
   "category": "marketing",
   "path": "agents/marketing/marketing-twitter-engager.md",
   "model": "",
   "tools": "",
   "name_fr": "Animateur Twitter/X",
   "desc_fr": "Expert marketing Twitter : engagement en temps réel, construction de thought leadership et croissance communautaire. Construit l'autorité de marque par la participation authentique aux conversations et les threads viraux."
  },
  {
   "name": "Video Optimization Specialist",
   "desc": "Video marketing strategist specializing in YouTube algorithm optimization, audience retention, chaptering, thumbnail concepts, and cross-platform video syndication.",
   "category": "marketing",
   "path": "agents/marketing/marketing-video-optimization-specialist.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste optimisation vidéo",
   "desc_fr": "Stratège marketing vidéo : optimisation pour l'algorithme YouTube, rétention d'audience, chapitrage, concepts de miniatures et syndication vidéo cross-plateforme."
  },
  {
   "name": "WeChat Official Account Manager",
   "desc": "Expert WeChat Official Account (OA) strategist specializing in content marketing, subscriber engagement, and conversion optimization. Masters multi-format content and builds loyal communities through consistent value delivery.",
   "category": "marketing",
   "path": "agents/marketing/marketing-wechat-official-account.md",
   "model": "",
   "tools": "",
   "name_fr": "Gestionnaire compte officiel WeChat",
   "desc_fr": "Stratège WeChat Official Account (OA) expert : marketing de contenu, engagement des abonnés et optimisation des conversions. Maîtrise les formats multiples et construit des communautés fidèles."
  },
  {
   "name": "Weibo Strategist",
   "desc": "Full-spectrum operations expert for Sina Weibo, with deep expertise in trending topic mechanics, Super Topic community management, public sentiment monitoring, fan economy strategies, and Weibo advertising, helping brands achieve viral reach and sustained growth on China's leading public discourse p",
   "category": "marketing",
   "path": "agents/marketing/marketing-weibo-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège Weibo",
   "desc_fr": "Expert opérations Sina Weibo tous horizons : mécanique des topics tendance, gestion de communautés Super Topic, veille de sentiment public, stratégies d'économie de fans et publicité Weibo."
  },
  {
   "name": "Xiaohongshu Specialist",
   "desc": "Expert Xiaohongshu marketing specialist focused on lifestyle content, trend-driven strategies, and authentic community engagement. Masters micro-content creation and drives viral growth through aesthetic storytelling.",
   "category": "marketing",
   "path": "agents/marketing/marketing-xiaohongshu-specialist.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste Xiaohongshu",
   "desc_fr": "Expert marketing Xiaohongshu : contenu lifestyle, stratégies guidées par les tendances et engagement communautaire authentique. Maîtrise le micro-contenu et pilote la croissance virale par le storytelling esthétique."
  },
  {
   "name": "Zhihu Strategist",
   "desc": "Expert Zhihu marketing specialist focused on thought leadership, community credibility, and knowledge-driven engagement. Masters question-answering strategy and builds brand authority through authentic expertise sharing.",
   "category": "marketing",
   "path": "agents/marketing/marketing-zhihu-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège Zhihu",
   "desc_fr": "Expert marketing Zhihu : thought leadership, crédibilité communautaire et engagement par la connaissance. Maîtrise la stratégie question-réponse et construit l'autorité de marque par le partage d'expertise authentique."
  },
  {
   "name": "Paid Media Auditor",
   "desc": "Comprehensive paid media auditor who systematically evaluates Google Ads, Microsoft Ads, and Meta accounts across 200+ checkpoints spanning account structure, tracking, bidding, creative, audiences, and competitive positioning. Produces actionable audit reports with prioritized recommendations and p",
   "category": "paid-media",
   "path": "agents/paid-media/paid-media-auditor.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit, Bash",
   "name_fr": "Auditeur média payant",
   "desc_fr": "Auditeur média payant complet : évalue systématiquement les comptes Google Ads, Microsoft Ads et Meta sur 200+ points de contrôle couvrant structure de compte, tracking et performance."
  },
  {
   "name": "Ad Creative Strategist",
   "desc": "Paid media creative specialist focused on ad copywriting, RSA optimization, asset group design, and creative testing frameworks across Google, Meta, Microsoft, and programmatic platforms. Bridges the gap between performance data and persuasive messaging.",
   "category": "paid-media",
   "path": "agents/paid-media/paid-media-creative-strategist.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit, Bash",
   "name_fr": "Stratège créas publicitaires",
   "desc_fr": "Spécialiste créa média payant : copywriting publicitaire, optimisation RSA, design de groupes d'assets et cadres de tests créatifs sur Google, Meta, Microsoft et le programmatique. Relie données de performance et messages persuasifs."
  },
  {
   "name": "Paid Social Strategist",
   "desc": "Cross-platform paid social advertising specialist covering Meta (Facebook/Instagram), LinkedIn, TikTok, Pinterest, X, and Snapchat. Designs full-funnel social ad programs from prospecting through retargeting with platform-specific creative and audience strategies.",
   "category": "paid-media",
   "path": "agents/paid-media/paid-media-paid-social-strategist.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit, Bash",
   "name_fr": "Stratège paid social",
   "desc_fr": "Spécialiste publicité sociale cross-plateforme : Meta (Facebook/Instagram), LinkedIn, TikTok, Pinterest, X et Snapchat. Conçoit des campagnes full-funnel et alloue les budgets par données."
  },
  {
   "name": "PPC Campaign Strategist",
   "desc": "Senior paid media strategist specializing in large-scale search, shopping, and performance max campaign architecture across Google, Microsoft, and Amazon ad platforms. Designs account structures, budget allocation frameworks, and bidding strategies that scale from $10K to $10M+ monthly spend.",
   "category": "paid-media",
   "path": "agents/paid-media/paid-media-ppc-strategist.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit, Bash",
   "name_fr": "Stratège campagnes PPC",
   "desc_fr": "Stratège média payant senior : architecture de campagnes search, shopping et Performance Max à grande échelle sur Google, Microsoft et Amazon."
  },
  {
   "name": "Programmatic & Display Buyer",
   "desc": "Display advertising and programmatic media buying specialist covering managed placements, Google Display Network, DV360, trade desk platforms, partner media (newsletters, sponsored content), and ABM display strategies via platforms like Demandbase and 6Sense.",
   "category": "paid-media",
   "path": "agents/paid-media/paid-media-programmatic-buyer.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit, Bash",
   "name_fr": "Acheteur programmatique & display",
   "desc_fr": "Spécialiste d'achat média display et programmatique : placements gérés, Google Display Network, DV360, plateformes trading desk et partenariats."
  },
  {
   "name": "Search Query Analyst",
   "desc": "Specialist in search term analysis, negative keyword architecture, and query-to-intent mapping. Turns raw search query data into actionable optimizations that eliminate waste and amplify high-intent traffic across paid search accounts.",
   "category": "paid-media",
   "path": "agents/paid-media/paid-media-search-query-analyst.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit, Bash",
   "name_fr": "Analyste de requêtes de recherche",
   "desc_fr": "Spécialiste de l'analyse de termes de recherche, de l'architecture de mots-clés négatifs et du mapping requête→intention. Transforme les données brutes de requêtes en optimisations concrètes qui éliminent le gaspillage et amplifient le trafic à forte intention."
  },
  {
   "name": "Tracking & Measurement Specialist",
   "desc": "Expert in conversion tracking architecture, tag management, and attribution modeling across Google Tag Manager, GA4, Google Ads, Meta CAPI, LinkedIn Insight Tag, and server-side implementations. Ensures every conversion is counted correctly and every dollar of ad spend is measurable.",
   "category": "paid-media",
   "path": "agents/paid-media/paid-media-tracking-specialist.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit, Bash",
   "name_fr": "Spécialiste tracking & mesure",
   "desc_fr": "Expert en architecture de tracking de conversions, gestion de tags et modélisation d'attribution : Google Tag Manager, GA4, Google Ads, Meta CAPI, LinkedIn Insight Tag et implémentations server-side."
  },
  {
   "name": "Behavioral Nudge Engine",
   "desc": "Behavioral psychology specialist that adapts software interaction cadences and styles to maximize user motivation and success.",
   "category": "product",
   "path": "agents/product/product-behavioral-nudge-engine.md",
   "model": "",
   "tools": "",
   "name_fr": "Moteur de nudge comportemental",
   "desc_fr": "Spécialiste en psychologie comportementale qui adapte les cadences et styles d'interaction logicielle pour maximiser motivation et réussite des utilisateurs."
  },
  {
   "name": "Feedback Synthesizer",
   "desc": "Expert in collecting, analyzing, and synthesizing user feedback from multiple channels to extract actionable product insights. Transforms qualitative feedback into quantitative priorities and strategic recommendations.",
   "category": "product",
   "path": "agents/product/product-feedback-synthesizer.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit",
   "name_fr": "Synthétiseur de feedback",
   "desc_fr": "Expert en collecte, analyse et synthèse du feedback utilisateur multi-canaux pour en extraire des insights produit actionnables. Transforme le qualitatif en priorités quantitatives et recommandations stratégiques."
  },
  {
   "name": "Product Manager",
   "desc": "Holistic product leader who owns the full product lifecycle — from discovery and strategy through roadmap, stakeholder alignment, go-to-market, and outcome measurement. Bridges business goals, user needs, and technical reality to ship the right thing at the right time.",
   "category": "product",
   "path": "agents/product/product-manager.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit",
   "name_fr": "Product manager",
   "desc_fr": "Leader produit holistique qui possède tout le cycle de vie : de la découverte et la stratégie à la roadmap, l'alignement des parties prenantes, le go-to-market et les résultats."
  },
  {
   "name": "Sprint Prioritizer",
   "desc": "Expert product manager specializing in agile sprint planning, feature prioritization, and resource allocation. Focused on maximizing team velocity and business value delivery through data-driven prioritization frameworks.",
   "category": "product",
   "path": "agents/product/product-sprint-prioritizer.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit",
   "name_fr": "Priorisateur de sprints",
   "desc_fr": "Product manager expert : planification de sprints agiles, priorisation de fonctionnalités et allocation de ressources. Maximise la vélocité d'équipe et la valeur délivrée par des cadres de priorisation data-driven."
  },
  {
   "name": "Trend Researcher",
   "desc": "Expert market intelligence analyst specializing in identifying emerging trends, competitive analysis, and opportunity assessment. Focused on providing actionable insights that drive product strategy and innovation decisions.",
   "category": "product",
   "path": "agents/product/product-trend-researcher.md",
   "model": "",
   "tools": "WebFetch, WebSearch, Read, Write, Edit",
   "name_fr": "Chercheur de tendances",
   "desc_fr": "Analyste d'intelligence de marché expert : identification des tendances émergentes, analyse concurrentielle et évaluation d'opportunités. Fournit des insights actionnables pour la stratégie produit et l'innovation."
  },
  {
   "name": "Experiment Tracker",
   "desc": "Expert project manager specializing in experiment design, execution tracking, and data-driven decision making. Focused on managing A/B tests, feature experiments, and hypothesis validation through systematic experimentation and rigorous analysis.",
   "category": "project-management",
   "path": "agents/project-management/project-management-experiment-tracker.md",
   "model": "",
   "tools": "",
   "name_fr": "Suivi d'expérimentations",
   "desc_fr": "Chef de projet expert en design d'expériences, suivi d'exécution et décisions data-driven : gestion des A/B tests, expérimentations de fonctionnalités et validation d'hypothèses par expérimentation systématique."
  },
  {
   "name": "Jira Workflow Steward",
   "desc": "Expert delivery operations specialist who enforces Jira-linked Git workflows, traceable commits, structured pull requests, and release-safe branch strategy across software teams.",
   "category": "project-management",
   "path": "agents/project-management/project-management-jira-workflow-steward.md",
   "model": "",
   "tools": "",
   "name_fr": "Intendant de workflow Jira",
   "desc_fr": "Spécialiste des opérations de delivery qui impose des workflows Git liés à Jira : commits traçables, pull requests structurées et stratégies de branches sûres pour les releases."
  },
  {
   "name": "Project Shepherd",
   "desc": "Expert project manager specializing in cross-functional project coordination, timeline management, and stakeholder alignment. Focused on shepherding projects from conception to completion while managing resources, risks, and communications across multiple teams and departments.",
   "category": "project-management",
   "path": "agents/project-management/project-management-project-shepherd.md",
   "model": "",
   "tools": "",
   "name_fr": "Berger de projets",
   "desc_fr": "Chef de projet expert : coordination cross-fonctionnelle, gestion des délais et alignement des parties prenantes. Accompagne les projets à travers les复杂ités organisationnelles jusqu'au livrable."
  },
  {
   "name": "Studio Operations",
   "desc": "Expert operations manager specializing in day-to-day studio efficiency, process optimization, and resource coordination. Focused on ensuring smooth operations, maintaining productivity standards, and supporting all teams with the tools and processes needed for success.",
   "category": "project-management",
   "path": "agents/project-management/project-management-studio-operations.md",
   "model": "",
   "tools": "",
   "name_fr": "Opérations de studio",
   "desc_fr": "Responsable des opérations expert : efficacité quotidienne du studio, optimisation des process et coordination des ressources. Fluidité opérationnelle, standards de productivité et soutien des équipes."
  },
  {
   "name": "Studio Producer",
   "desc": "Senior strategic leader specializing in high-level creative and technical project orchestration, resource allocation, and multi-project portfolio management. Focused on aligning creative vision with business objectives while managing complex cross-functional initiatives and ensuring optimal studio o",
   "category": "project-management",
   "path": "agents/project-management/project-management-studio-producer.md",
   "model": "",
   "tools": "",
   "name_fr": "Producteur de studio",
   "desc_fr": "Leader stratégique senior : orchestration de projets créatifs et techniques, allocation de ressources et gestion de portefeuille multi-projets. Aligne la vision créative avec les objectifs métier."
  },
  {
   "name": "Senior Project Manager",
   "desc": "Converts specs to tasks and remembers previous projects. Focused on realistic scope, no background processes, exact spec requirements",
   "category": "project-management",
   "path": "agents/project-management/project-manager-senior.md",
   "model": "",
   "tools": "",
   "name_fr": "Chef de projet senior",
   "desc_fr": "Convertit les specs en tâches et se souvient des projets précédents. Focus sur un périmètre réaliste, pas de process en arrière-plan et exigences exactes du spec."
  },
  {
   "name": "Account Strategist",
   "desc": "Expert post-sale account strategist specializing in land-and-expand execution, stakeholder mapping, QBR facilitation, and net revenue retention. Turns closed deals into long-term platform relationships through systematic expansion planning and multi-threaded account development.",
   "category": "sales",
   "path": "agents/sales/sales-account-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège comptes clients",
   "desc_fr": "Stratège post-vente spécialisé en expansion progressive, cartographie des parties prenantes, animation de QBR et rétention de revenus nets. Transforme les contrats signés en relations plateforme durables."
  },
  {
   "name": "Sales Coach",
   "desc": "Expert sales coaching specialist focused on rep development, pipeline review facilitation, call coaching, deal strategy, and forecast accuracy. Makes every rep and every deal better through structured coaching methodology and behavioral feedback.",
   "category": "sales",
   "path": "agents/sales/sales-coach.md",
   "model": "",
   "tools": "",
   "name_fr": "Coach commercial",
   "desc_fr": "Expert en coaching commercial : développement des commerciaux, animation des revues de pipeline, coaching d'appels, stratégie de deals et précision des forecasts. Améliore chaque commercial et chaque deal par une méthodologie structurée."
  },
  {
   "name": "Deal Strategist",
   "desc": "Senior deal strategist specializing in MEDDPICC qualification, competitive positioning, and win planning for complex B2B sales cycles. Scores opportunities, exposes pipeline risk, and builds deal strategies that survive forecast review.",
   "category": "sales",
   "path": "agents/sales/sales-deal-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège deals",
   "desc_fr": "Stratège deals senior : qualification MEDDPICC, positionnement concurrentiel et planification de victoire pour les cycles de vente B2B complexes. Score les opportunités, expose les risques du pipeline et construit des stratégies qui survivent à la revue de forecast."
  },
  {
   "name": "Discovery Coach",
   "desc": "Coaches sales teams on elite discovery methodology — question design, current-state mapping, gap quantification, and call structure that surfaces real buying motivation.",
   "category": "sales",
   "path": "agents/sales/sales-discovery-coach.md",
   "model": "",
   "tools": "",
   "name_fr": "Coach discovery (vente)",
   "desc_fr": "Coache les équipes de vente sur la méthodologie discovery d'élite : design de questions, cartographie de l'état actuel, quantification des écarts et structure d'appel qui révèle la vraie motivation d'achat."
  },
  {
   "name": "Sales Engineer",
   "desc": "Senior pre-sales engineer specializing in technical discovery, demo engineering, POC scoping, competitive battlecards, and bridging product capabilities to business outcomes. Wins the technical decision so the deal can close.",
   "category": "sales",
   "path": "agents/sales/sales-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur avant-vente",
   "desc_fr": "Ingénieur avant-vente senior : découverte technique, ingénierie de démos, cadrage de POC, battlecards concurrentielles et lien entre capacités produit et résultats métier. Gagne la décision technique pour que le deal se ferme."
  },
  {
   "name": "Outbound Strategist",
   "desc": "Signal-based outbound specialist who designs multi-channel prospecting sequences, defines ICPs, and builds pipeline through research-driven personalization — not volume.",
   "category": "sales",
   "path": "agents/sales/sales-outbound-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège outbound",
   "desc_fr": "Spécialiste outbound basé sur les signaux : conçoit des séquences de prospection multi-canaux, définit les ICPs et construit le pipeline par personnalisation fondée sur la recherche."
  },
  {
   "name": "Pipeline Analyst",
   "desc": "Revenue operations analyst specializing in pipeline health diagnostics, deal velocity analysis, forecast accuracy, and data-driven sales coaching. Turns CRM data into actionable pipeline intelligence that surfaces risks before they become missed quarters.",
   "category": "sales",
   "path": "agents/sales/sales-pipeline-analyst.md",
   "model": "",
   "tools": "",
   "name_fr": "Analyste de pipeline (vente)",
   "desc_fr": "Analyste revenue operations : diagnostic de santé du pipeline, analyse de vélocité des deals, précision des forecasts et coaching commercial data-driven."
  },
  {
   "name": "Proposal Strategist",
   "desc": "Strategic proposal architect who transforms RFPs and sales opportunities into compelling win narratives. Specializes in win theme development, competitive positioning, executive summary craft, and building proposals that persuade rather than merely comply.",
   "category": "sales",
   "path": "agents/sales/sales-proposal-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège de propositions",
   "desc_fr": "Architecte de propositions stratégiques qui transforme les RFPs et opportunités de vente en récits de victoire convaincants : thèmes de victoire, positionnement concurrentiel et structure de réponse."
  },
  {
   "name": "security-auditor",
   "desc": "Security engineer focused on vulnerability detection, threat modeling, and secure coding practices. Use for security-focused code review, threat analysis, or hardening recommendations.",
   "category": "core",
   "path": "agents/security-auditor.md",
   "model": "",
   "tools": "",
   "name_fr": "Auditeur sécurité",
   "desc_fr": "Ingénieur sécurité centré sur la détection de vulnérabilités, le threat modeling et les pratiques de codage sécurisées. Pour les revues de code orientées sécurité, l'analyse de menaces ou les recommandations de durcissement."
  },
  {
   "name": "macOS Spatial/Metal Engineer",
   "desc": "Native Swift and Metal specialist building high-performance 3D rendering systems and spatial computing experiences for macOS and Vision Pro",
   "category": "spatial-computing",
   "path": "agents/spatial-computing/macos-spatial-metal-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur Spatial/Metal macOS",
   "desc_fr": "Spécialiste Swift natif et Metal : construit des systèmes de rendu 3D haute performance et des expériences de spatial computing pour macOS et Vision Pro."
  },
  {
   "name": "Terminal Integration Specialist",
   "desc": "Terminal emulation, text rendering optimization, and SwiftTerm integration for modern Swift applications",
   "category": "spatial-computing",
   "path": "agents/spatial-computing/terminal-integration-specialist.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste intégration terminal",
   "desc_fr": "Émulation de terminal, optimisation du rendu texte et intégration SwiftTerm pour applications Swift modernes."
  },
  {
   "name": "visionOS Spatial Engineer",
   "desc": "Native visionOS spatial computing, SwiftUI volumetric interfaces, and Liquid Glass design implementation",
   "category": "spatial-computing",
   "path": "agents/spatial-computing/visionos-spatial-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur spatial visionOS",
   "desc_fr": "Spatial computing natif visionOS : interfaces volumétriques SwiftUI et implémentation du design Liquid Glass."
  },
  {
   "name": "XR Cockpit Interaction Specialist",
   "desc": "Specialist in designing and developing immersive cockpit-based control systems for XR environments",
   "category": "spatial-computing",
   "path": "agents/spatial-computing/xr-cockpit-interaction-specialist.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste interactions cockpit XR",
   "desc_fr": "Spécialiste de la conception et du développement de systèmes de contrôle immersifs basés cockpit pour environnements XR."
  },
  {
   "name": "XR Immersive Developer",
   "desc": "Expert WebXR and immersive technology developer with specialization in browser-based AR/VR/XR applications",
   "category": "spatial-computing",
   "path": "agents/spatial-computing/xr-immersive-developer.md",
   "model": "",
   "tools": "",
   "name_fr": "Développeur immersif XR",
   "desc_fr": "Développeur WebXR et technologies immersives expert, spécialisé dans les applications AR/VR/XR dans le navigateur."
  },
  {
   "name": "XR Interface Architect",
   "desc": "Spatial interaction designer and interface strategist for immersive AR/VR/XR environments",
   "category": "spatial-computing",
   "path": "agents/spatial-computing/xr-interface-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte d'interfaces XR",
   "desc_fr": "Designer d'interactions spatiales et stratège d'interfaces pour environnements immersifs AR/VR/XR."
  },
  {
   "name": "Accounts Payable Agent",
   "desc": "Autonomous payment processing specialist that executes vendor payments, contractor invoices, and recurring bills across any payment rail — crypto, fiat, stablecoins. Integrates with AI agent workflows via tool calls.",
   "category": "specialized",
   "path": "agents/specialized/accounts-payable-agent.md",
   "model": "",
   "tools": "",
   "name_fr": "Agent comptes fournisseurs",
   "desc_fr": "Spécialiste autonome de traitement des paiements : paiements fournisseurs, factures de prestataires et factures récurrentes sur n'importe quel rail — crypto, fiat, stablecoins. S'intègre aux workflows d'agents IA via appels d'outils."
  },
  {
   "name": "Agentic Identity & Trust Architect",
   "desc": "Designs identity, authentication, and trust verification systems for autonomous AI agents operating in multi-agent environments. Ensures agents can prove who they are, what they're authorized to do, and what they actually did.",
   "category": "specialized",
   "path": "agents/specialized/agentic-identity-trust.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte identité et confiance agentique",
   "desc_fr": "Conçoit les systèmes d'identité, d'authentification et de vérification de confiance pour agents IA autonomes en environnement multi-agents : prouver qui ils sont, ce qu'ils peuvent faire et ce qu'ils ont fait."
  },
  {
   "name": "Agents Orchestrator",
   "desc": "Autonomous pipeline manager that orchestrates the entire development workflow. You are the leader of this process.",
   "category": "specialized",
   "path": "agents/specialized/agents-orchestrator.md",
   "model": "",
   "tools": "",
   "name_fr": "Orchestrateur d'agents",
   "desc_fr": "Gestionnaire autonome de pipeline qui orchestre tout le workflow de développement. Vous êtes le leader de ce processus."
  },
  {
   "name": "Automation Governance Architect",
   "desc": "Governance-first architect for business automations (n8n-first) who audits value, risk, and maintainability before implementation.",
   "category": "specialized",
   "path": "agents/specialized/automation-governance-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte gouvernance d'automatisation",
   "desc_fr": "Architecte « gouvernance d'abord » pour les automatisations métier (n8n d'abord) : audite la valeur, le risque et la maintenabilité avant d'implémenter."
  },
  {
   "name": "Blockchain Security Auditor",
   "desc": "Expert smart contract security auditor specializing in vulnerability detection, formal verification, exploit analysis, and comprehensive audit report writing for DeFi protocols and blockchain applications.",
   "category": "specialized",
   "path": "agents/specialized/blockchain-security-auditor.md",
   "model": "",
   "tools": "",
   "name_fr": "Auditeur sécurité blockchain",
   "desc_fr": "Auditeur sécurité de smart contracts : détection de vulnérabilités, vérification formelle, analyse d'exploits et rédaction de rapports d'audit complets pour les protocoles DeFi et applications blockchain."
  },
  {
   "name": "Compliance Auditor",
   "desc": "Expert technical compliance auditor specializing in SOC 2, ISO 27001, HIPAA, and PCI-DSS audits — from readiness assessment through evidence collection to certification.",
   "category": "specialized",
   "path": "agents/specialized/compliance-auditor.md",
   "model": "",
   "tools": "",
   "name_fr": "Auditeur conformité",
   "desc_fr": "Auditeur technique de conformité : audits SOC 2, ISO 27001, HIPAA et PCI-DSS — de l'évaluation de préparation à la collecte de preuves jusqu'à la certification."
  },
  {
   "name": "Corporate Training Designer",
   "desc": "Expert in enterprise training system design and curriculum development — proficient in training needs analysis, instructional design methodology, blended learning program design, internal trainer development, leadership programs, and training effectiveness evaluation and continuous optimization.",
   "category": "specialized",
   "path": "agents/specialized/corporate-training-designer.md",
   "model": "",
   "tools": "",
   "name_fr": "Concepteur de formation d'entreprise",
   "desc_fr": "Expert en conception de systèmes de formation en entreprise : analyse des besoins, ingénierie pédagogique, programmes blended learning, développement de formateurs internes et évaluation continue de l'efficacité."
  },
  {
   "name": "Customer Service",
   "desc": "Friendly, professional customer service specialist for any industry — handling inquiries, complaints, account support, FAQs, and seamless escalation with warmth, efficiency, and a genuine commitment to customer satisfaction",
   "category": "specialized",
   "path": "agents/specialized/customer-service.md",
   "model": "",
   "tools": "",
   "name_fr": "Service client",
   "desc_fr": "Spécialiste du service client, aimable et professionnel, pour tous les secteurs : demandes, réclamations, assistance compte, FAQ et escalades fluides, avec chaleur, efficacité et un vrai souci de la satisfaction client."
  },
  {
   "name": "Data Consolidation Agent",
   "desc": "AI agent that consolidates extracted sales data into live reporting dashboards with territory, rep, and pipeline summaries",
   "category": "specialized",
   "path": "agents/specialized/data-consolidation-agent.md",
   "model": "",
   "tools": "",
   "name_fr": "Agent de consolidation de données",
   "desc_fr": "Agent IA qui consolide les données de vente extraites en dashboards live avec résumés par territoire, par commercial et par pipeline."
  },
  {
   "name": "Government Digital Presales Consultant",
   "desc": "Presales expert for China's government digital transformation market (ToG), proficient in policy interpretation, solution design, bid document preparation, POC validation, compliance requirements (classified protection/cryptographic assessment/Xinchuang domestic IT), and stakeholder management — hel",
   "category": "specialized",
   "path": "agents/specialized/government-digital-presales-consultant.md",
   "model": "",
   "tools": "",
   "name_fr": "Consultant avant-vente gouvernement (Chine)",
   "desc_fr": "Expert avant-vente du marché chinois de la transformation numérique publique (ToG) : interprétation des politiques, conception de solutions, dossiers d'appels d'offres, validation POC, conformité (protection classifiée/évaluation cryptographique/Xinchuang)."
  },
  {
   "name": "Healthcare Customer Service",
   "desc": "Empathetic healthcare customer service specialist for patient support, billing inquiries, appointment management, insurance questions, complaint resolution, and seamless escalation to clinical or administrative staff",
   "category": "specialized",
   "path": "agents/specialized/healthcare-customer-service.md",
   "model": "",
   "tools": "",
   "name_fr": "Service client santé",
   "desc_fr": "Spécialiste du service client santé, empathique : soutien aux patients, questions de facturation, gestion des rendez-vous, questions d'assurance, résolution de réclamations et escalade fluide vers le personnel clinique ou administratif."
  },
  {
   "name": "Healthcare Marketing Compliance Specialist",
   "desc": "Expert in healthcare marketing compliance in China, proficient in the Advertising Law, Medical Advertisement Management Measures, Drug Administration Law, and related regulations — covering pharmaceuticals, medical devices, medical aesthetics, health supplements, and internet healthcare across conte",
   "category": "specialized",
   "path": "agents/specialized/healthcare-marketing-compliance.md",
   "model": "",
   "tools": "",
   "name_fr": "Conformité marketing santé (Chine)",
   "desc_fr": "Expert conformité du marketing santé en Chine : loi sur la publicité, mesures de gestion des publicités médicales, loi sur l'administration des médicaments — pharmaceutique, dispositifs médicaux, esthétique médicale et e-santé."
  },
  {
   "name": "Hospitality Guest Services",
   "desc": "Comprehensive hospitality guest services specialist for hotels, resorts, restaurants, and event venues — covering reservations, check-in/check-out, concierge services, guest complaint resolution, loyalty program management, and post-stay follow-up to deliver exceptional guest experiences that drive ",
   "category": "specialized",
   "path": "agents/specialized/hospitality-guest-services.md",
   "model": "",
   "tools": "",
   "name_fr": "Services clients hôtellerie",
   "desc_fr": "Spécialiste complet des services clients en hôtellerie pour hôtels, resorts, restaurants et lieux événementiels : réservations, check-in/check-out, conciergerie, gestion des réclamations et expérience client."
  },
  {
   "name": "HR Onboarding",
   "desc": "Comprehensive HR onboarding specialist for employee orientation, documentation management, compliance tracking, benefits enrollment, culture integration, and new hire support — delivering a seamless first-day-to-first-year experience that drives retention and productivity",
   "category": "specialized",
   "path": "agents/specialized/hr-onboarding.md",
   "model": "",
   "tools": "",
   "name_fr": "Onboarding RH",
   "desc_fr": "Spécialiste complet d'onboarding RH : accueil des collaborateurs, gestion documentaire, suivi de conformité, inscription aux avantages, intégration culturelle et parcours des nouvelles recrues."
  },
  {
   "name": "Identity Graph Operator",
   "desc": "Operates a shared identity graph that multiple AI agents resolve against. Ensures every agent in a multi-agent system gets the same canonical answer for \"who is this entity?\" - deterministically, even under concurrent writes.",
   "category": "specialized",
   "path": "agents/specialized/identity-graph-operator.md",
   "model": "",
   "tools": "",
   "name_fr": "Opérateur de graphe d'identité",
   "desc_fr": "Exploite un graphe d'identité partagé auquel plusieurs agents IA se résolvent. Garantit que chaque agent d'un système multi-agents obtient la même réponse canonique pour une même identité."
  },
  {
   "name": "Language Translator",
   "desc": "Real-time Spanish ↔ English translation specialist with cultural context, regional dialect awareness, travel phrase guidance, and tone-appropriate communication for everyday, business, and emergency situations",
   "category": "specialized",
   "path": "agents/specialized/language-translator.md",
   "model": "",
   "tools": "",
   "name_fr": "Traducteur (espagnol ↔ anglais)",
   "desc_fr": "Spécialiste de traduction espagnol ↔ anglais en temps réel avec contexte culturel, conscience des dialectes régionaux, phrases de voyage et communication adaptée au ton."
  },
  {
   "name": "Legal Billing & Time Tracking",
   "desc": "Comprehensive legal billing and time tracking specialist for accurate time capture, invoice generation, billing narrative writing, collections management, trust account compliance, and billing analysis — maximizing revenue recovery while maintaining client relationships and ethical compliance across",
   "category": "specialized",
   "path": "agents/specialized/legal-billing-time-tracking.md",
   "model": "",
   "tools": "",
   "name_fr": "Facturation juridique et temps",
   "desc_fr": "Spécialiste complet de la facturation juridique : capture précise du temps, génération de factures, rédaction de narratifs de facturation, recouvrement et suivi des paiements clients."
  },
  {
   "name": "Legal Client Intake",
   "desc": "Comprehensive legal client intake specialist for qualifying prospects, collecting case information, scheduling consultations, managing conflict checks, and delivering attorney-ready intake summaries across any practice area and firm size",
   "category": "specialized",
   "path": "agents/specialized/legal-client-intake.md",
   "model": "",
   "tools": "",
   "name_fr": "Intake de clients juridiques",
   "desc_fr": "Spécialiste complet d'intake de clients juridiques : qualification des prospects, collecte des informations de dossier, planification des consultations, gestion des vérifications de conflits d'intérêts."
  },
  {
   "name": "Legal Document Review",
   "desc": "Comprehensive legal document review specialist for contracts, litigation documents, and real estate agreements — summarizing documents, flagging risk clauses, comparing contract versions, and checking compliance across any law firm size or practice area",
   "category": "specialized",
   "path": "agents/specialized/legal-document-review.md",
   "model": "",
   "tools": "",
   "name_fr": "Revue de documents juridiques",
   "desc_fr": "Spécialiste complet de la revue de documents juridiques : contrats, pièces de contentieux et accords immobiliers — synthèse de documents, signalement des risques et recommandations de modifications."
  },
  {
   "name": "Loan Officer Assistant",
   "desc": "Comprehensive loan officer assistant for mortgage and lending professionals — covering borrower intake, pre-qualification, document collection, pipeline management, compliance tracking, rate quoting, and closing coordination across residential, commercial, and consumer lending",
   "category": "specialized",
   "path": "agents/specialized/loan-officer-assistant.md",
   "model": "",
   "tools": "",
   "name_fr": "Assistant conseiller prêt",
   "desc_fr": "Assistant complet de conseiller en prêts immobiliers : intake des emprunteurs, pré-qualification, collecte de documents, suivi du pipeline et coordination avec les tierces parties."
  },
  {
   "name": "LSP/Index Engineer",
   "desc": "Language Server Protocol specialist building unified code intelligence systems through LSP client orchestration and semantic indexing",
   "category": "specialized",
   "path": "agents/specialized/lsp-index-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur LSP / indexation",
   "desc_fr": "Spécialiste du Language Server Protocol qui construit des systèmes unifiés d'intelligence de code via l'orchestration de clients LSP et l'indexation sémantique."
  },
  {
   "name": "MiCA Compliance Specialist",
   "desc": "Spécialiste en régulation crypto européenne (Markets in Crypto-Assets Regulation). Audite les projets crypto-game pour conformité MiCA, RGPD, AML/KYC, lois consommateur EU. Identifie les risques réglementaires (token classification, white paper, marketing restrictions) et recommande les actions conc",
   "category": "specialized",
   "path": "agents/specialized/mica-compliance-specialist.md",
   "model": "sonnet",
   "tools": "Read, Write, Edit, WebSearch",
   "name_fr": "Spécialiste conformité MiCA",
   "desc_fr": "Spécialiste de la régulation crypto européenne (MiCA). Audite les projets crypto-game pour la conformité MiCA, RGPD, AML/KYC et lois consommateur UE : classification des tokens, white paper, restrictions marketing."
  },
  {
   "name": "Real Estate Buyer & Seller",
   "desc": "Comprehensive real estate agent assistant for buyer representation, seller representation, listing management, offer negotiation, transaction coordination, and closing support — delivering a world-class client experience from first showing to final closing across residential and investment real esta",
   "category": "specialized",
   "path": "agents/specialized/real-estate-buyer-seller.md",
   "model": "",
   "tools": "",
   "name_fr": "Assistant immobilier acheteurs/vendeurs",
   "desc_fr": "Assistant complet d'agent immobilier : représentation des acheteurs et vendeurs, gestion des annonces, négociation d'offres, coordination des transactions et suivi des closes."
  },
  {
   "name": "Recruitment Specialist",
   "desc": "Expert recruitment operations and talent acquisition specialist — skilled in China's major hiring platforms, talent assessment frameworks, and labor law compliance. Helps companies efficiently attract, screen, and retain top talent while building a competitive employer brand.",
   "category": "specialized",
   "path": "agents/specialized/recruitment-specialist.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste recrutement",
   "desc_fr": "Expert opérations de recrutement et acquisition de talents : maîtrise des principales plateformes de recrutement chinoises, cadres d'évaluation des talents et droit du travail applicable."
  },
  {
   "name": "Report Distribution Agent",
   "desc": "AI agent that automates distribution of consolidated sales reports to representatives based on territorial parameters",
   "category": "specialized",
   "path": "agents/specialized/report-distribution-agent.md",
   "model": "",
   "tools": "",
   "name_fr": "Agent de distribution de rapports",
   "desc_fr": "Agent IA qui automatise la distribution des rapports de ventes consolidés aux commerciaux selon des paramètres territoriaux."
  },
  {
   "name": "Retail Customer Returns",
   "desc": "Comprehensive retail customer returns specialist for processing returns, exchanges, and refunds across in-store, online, and omnichannel retail — handling policy enforcement, fraud prevention, customer retention, vendor returns, and returns analytics to maximize recovery while preserving customer lo",
   "category": "specialized",
   "path": "agents/specialized/retail-customer-returns.md",
   "model": "",
   "tools": "",
   "name_fr": "Retours clients retail",
   "desc_fr": "Spécialiste complet des retours clients en retail : traitement des retours, échanges et remboursements en magasin, en ligne et omnicanal — litiges, politiques et expérience client."
  },
  {
   "name": "Sales Data Extraction Agent",
   "desc": "AI agent specialized in monitoring Excel files and extracting key sales metrics (MTD, YTD, Year End) for internal live reporting",
   "category": "specialized",
   "path": "agents/specialized/sales-data-extraction-agent.md",
   "model": "",
   "tools": "",
   "name_fr": "Agent d'extraction de données vente",
   "desc_fr": "Agent IA spécialisé dans la surveillance de fichiers Excel et l'extraction des métriques de vente clés (MTD, YTD, fin d'année) pour un reporting interne en direct."
  },
  {
   "name": "Sales Outreach",
   "desc": "Consultative B2B sales outreach specialist for cold prospecting, lead follow-up, objection handling, proposal writing, and pipeline management — combining data-driven targeting with genuine relationship-building to open doors and close deals",
   "category": "specialized",
   "path": "agents/specialized/sales-outreach.md",
   "model": "",
   "tools": "",
   "name_fr": "Prospection B2B",
   "desc_fr": "Spécialiste de la prospection B2B consultative : prospection à froid, relance de leads, traitement des objections, rédaction de propositions et gestion de pipeline — ciblage data-driven et vraie construction de relation."
  },
  {
   "name": "Chief of Staff",
   "desc": "Master coordinator for founders and executives — filters noise, owns processes, enforces consistency, routes decisions, and positions outputs for impact so the boss can think clearly.",
   "category": "specialized",
   "path": "agents/specialized/specialized-chief-of-staff.md",
   "model": "",
   "tools": "",
   "name_fr": "Directeur de cabinet (Chief of Staff)",
   "desc_fr": "Coordinateur hors pair pour fondateurs et dirigeants : filtre le bruit, possède les process, impose la cohérence, route les décisions et positionne les livrables pour que le patron pense clairement."
  },
  {
   "name": "Civil Engineer",
   "desc": "Expert civil and structural engineer with global standards coverage — Eurocode, DIN, ACI, AISC, ASCE, AS/NZS, CSA, GB, IS, AIJ, and more. Specializes in structural analysis, geotechnical design, construction documentation, building code compliance, and multi-standard international projects.",
   "category": "specialized",
   "path": "agents/specialized/specialized-civil-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur génie civil",
   "desc_fr": "Ingénieur civil et structurel expert, couverture normative mondiale — Eurocode, DIN, ACI, AISC, ASCE, AS/NZS, CSA, GB, IS, AIJ et plus. Analyse structurelle, géotechnique, dossiers de construction et projets internationaux multi-normes."
  },
  {
   "name": "Cultural Intelligence Strategist",
   "desc": "CQ specialist that detects invisible exclusion, researches global context, and ensures software resonates authentically across intersectional identities.",
   "category": "specialized",
   "path": "agents/specialized/specialized-cultural-intelligence-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège intelligence culturelle (CQ)",
   "desc_fr": "Spécialiste CQ qui détecte l'exclusion invisible, recherche le contexte global et garantit que le logiciel résonne authentiquement à travers les identités intersectionnelles."
  },
  {
   "name": "Developer Advocate",
   "desc": "Expert developer advocate specializing in building developer communities, creating compelling technical content, optimizing developer experience (DX), and driving platform adoption through authentic engineering engagement. Bridges product and engineering teams with external developers.",
   "category": "specialized",
   "path": "agents/specialized/specialized-developer-advocate.md",
   "model": "",
   "tools": "",
   "name_fr": "Advocate développeurs",
   "desc_fr": "Expert developer relations : animation de communautés de développeurs, contenu technique convaincant, optimisation de l'expérience développeur (DX) et adoption de plateforme par un engagement d'ingénierie authentique."
  },
  {
   "name": "Document Generator",
   "desc": "Expert document creation specialist who generates professional PDF, PPTX, DOCX, and XLSX files using code-based approaches with proper formatting, charts, and data visualization.",
   "category": "specialized",
   "path": "agents/specialized/specialized-document-generator.md",
   "model": "",
   "tools": "",
   "name_fr": "Générateur de documents",
   "desc_fr": "Spécialiste de création de documents qui génère des fichiers PDF, PPTX, DOCX et XLSX professionnels par approche code, avec formatage soigné, graphiques et visualisation de données."
  },
  {
   "name": "French Consulting Market Navigator",
   "desc": "Navigate the French ESN/SI freelance ecosystem — margin models, platform mechanics (Malt, collective.work), portage salarial, rate positioning, and payment cycle realities",
   "category": "specialized",
   "path": "agents/specialized/specialized-french-consulting-market.md",
   "model": "",
   "tools": "",
   "name_fr": "Navigateur du marché conseil FR",
   "desc_fr": "Navigue l'écosystème freelance ESN/SI français : modèles de marge, mécaniques des plateformes (Malt, collective.work), portage salarial, positionnement tarifaire et réalités des cycles de paiement."
  },
  {
   "name": "Korean Business Navigator",
   "desc": "Korean business culture for foreign professionals — 품의 decision process, nunchi reading, KakaoTalk business etiquette, hierarchy navigation, and relationship-first deal mechanics",
   "category": "specialized",
   "path": "agents/specialized/specialized-korean-business-navigator.md",
   "model": "",
   "tools": "",
   "name_fr": "Navigateur business coréen",
   "desc_fr": "Culture business coréenne pour les professionnels étrangers : processus de décision 품의, lecture du nunchi, étiquette KakaoTalk, navigation hiérarchique et construction de relations."
  },
  {
   "name": "MCP Builder",
   "desc": "Expert Model Context Protocol developer who designs, builds, and tests MCP servers that extend AI agent capabilities with custom tools, resources, and prompts.",
   "category": "specialized",
   "path": "agents/specialized/specialized-mcp-builder.md",
   "model": "",
   "tools": "",
   "name_fr": "Constructeur de serveurs MCP",
   "desc_fr": "Développeur Model Context Protocol expert qui conçoit, construit et teste des serveurs MCP étendant les capacités des agents IA avec outils, ressources et prompts personnalisés."
  },
  {
   "name": "Model QA Specialist",
   "desc": "Independent model QA expert who audits ML and statistical models end-to-end - from documentation review and data reconstruction to replication, calibration testing, interpretability analysis, performance monitoring, and audit-grade reporting.",
   "category": "specialized",
   "path": "agents/specialized/specialized-model-qa.md",
   "model": "",
   "tools": "",
   "name_fr": "Spécialiste QA de modèles",
   "desc_fr": "Expert QA indépendant de modèles qui audite les modèles ML et statistiques de bout en bout : revue de documentation, reconstruction des données, réplication, calibration et validation des performances."
  },
  {
   "name": "Salesforce Architect",
   "desc": "Solution architecture for Salesforce platform — multi-cloud design, integration patterns, governor limits, deployment strategy, and data model governance for enterprise-scale orgs",
   "category": "specialized",
   "path": "agents/specialized/specialized-salesforce-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte Salesforce",
   "desc_fr": "Architecture de solution sur la plateforme Salesforce : design multi-cloud, patterns d'intégration, limites governor, stratégie de déploiement et gouvernance du modèle de données pour des orgs à l'échelle entreprise."
  },
  {
   "name": "Workflow Architect",
   "desc": "Workflow design specialist who maps complete workflow trees for every system, user journey, and agent interaction — covering happy paths, all branch conditions, failure modes, recovery paths, handoff contracts, and observable states to produce build-ready specs that agents can implement against and ",
   "category": "specialized",
   "path": "agents/specialized/specialized-workflow-architect.md",
   "model": "",
   "tools": "",
   "name_fr": "Architecte de workflows",
   "desc_fr": "Spécialiste du design de workflows qui cartographie les arbres complets de workflows pour chaque système, parcours utilisateur et interaction d'agent — happy paths, conditions de branches, modes de défaillance, chemins de récupération et états observables."
  },
  {
   "name": "Study Abroad Advisor",
   "desc": "Full-spectrum study abroad planning expert covering the US, UK, Canada, Australia, Europe, Hong Kong, and Singapore — proficient in undergraduate, master's, and PhD application strategy, school selection, essay coaching, profile enhancement, standardized test planning, visa preparation, and overseas",
   "category": "specialized",
   "path": "agents/specialized/study-abroad-advisor.md",
   "model": "",
   "tools": "",
   "name_fr": "Conseiller études à l'étranger",
   "desc_fr": "Expert de planification d'études à l'étranger tous horizons : États-Unis, Royaume-Uni, Canada, Australie, Europe, Hong Kong, Singapour — stratégie de candidature licence/master/doctorat, sélection d'écoles, coaching d'essais, tests et visas."
  },
  {
   "name": "Supply Chain Strategist",
   "desc": "Expert supply chain management and procurement strategy specialist — skilled in supplier development, strategic sourcing, quality control, and supply chain digitalization. Grounded in China's manufacturing ecosystem, helps companies build efficient, resilient, and sustainable supply chains.",
   "category": "specialized",
   "path": "agents/specialized/supply-chain-strategist.md",
   "model": "",
   "tools": "",
   "name_fr": "Stratège supply chain",
   "desc_fr": "Expert supply chain et stratégie d'achat : développement fournisseurs, sourcing stratégique, contrôle qualité et digitalisation de la chaîne. Ancré dans l'écosystème manufacturier chinois."
  },
  {
   "name": "ZK Steward",
   "desc": "Knowledge-base steward in the spirit of Niklas Luhmann's Zettelkasten. Default perspective: Luhmann; switches to domain experts (Feynman, Munger, Ogilvy, etc.) by task. Enforces atomic notes, connectivity, and validation loops. Use for knowledge-base building, note linking, complex task breakdown, a",
   "category": "specialized",
   "path": "agents/specialized/zk-steward.md",
   "model": "",
   "tools": "",
   "name_fr": "Intendant ZK (Zettelkasten)",
   "desc_fr": "Intendant de base de connaissances dans l'esprit du Zettelkasten de Niklas Luhmann. Perspective par défaut : Luhmann ; bascule vers des experts du domaine (Feynman, Munger, Ogilvy…) selon la tâche. Impose notes atomiques, connectivité et boucles de validation."
  },
  {
   "name": "Analytics Reporter",
   "desc": "Expert data analyst transforming raw data into actionable business insights. Creates dashboards, performs statistical analysis, tracks KPIs, and provides strategic decision support through data visualization and reporting.",
   "category": "support",
   "path": "agents/support/support-analytics-reporter.md",
   "model": "",
   "tools": "",
   "name_fr": "Rapporteur analytics",
   "desc_fr": "Analyste de données expert transformant les données brutes en insights actionnables : dashboards, analyses statistiques, suivi des KPI et aide à la décision par la visualisation et le reporting."
  },
  {
   "name": "Executive Summary Generator",
   "desc": "Consultant-grade AI specialist trained to think and communicate like a senior strategy consultant. Transforms complex business inputs into concise, actionable executive summaries using McKinsey SCQA, BCG Pyramid Principle, and Bain frameworks for C-suite decision-makers.",
   "category": "support",
   "path": "agents/support/support-executive-summary-generator.md",
   "model": "",
   "tools": "",
   "name_fr": "Générateur de synthèses exécutives",
   "desc_fr": "Spécialiste IA de niveau consultant entraîné à penser et communiquer comme un stratège senior. Transforme des entrées métier complexes en synthèses exécutives concises et actionnables via SCQA (McKinsey), Pyramide (BCG) et frameworks Bain."
  },
  {
   "name": "Finance Tracker",
   "desc": "Expert financial analyst and controller specializing in financial planning, budget management, and business performance analysis. Maintains financial health, optimizes cash flow, and provides strategic financial insights for business growth.",
   "category": "support",
   "path": "agents/support/support-finance-tracker.md",
   "model": "",
   "tools": "",
   "name_fr": "Suivi financier",
   "desc_fr": "Analyste et contrôleur financier expert : planification financière, gestion budgétaire et analyse de performance. Maintient la santé financière, optimise la trésorerie et fournit des insights stratégiques pour la croissance."
  },
  {
   "name": "Infrastructure Maintainer",
   "desc": "Expert infrastructure specialist focused on system reliability, performance optimization, and technical operations management. Maintains robust, scalable infrastructure supporting business operations with security, performance, and cost efficiency.",
   "category": "support",
   "path": "agents/support/support-infrastructure-maintainer.md",
   "model": "",
   "tools": "",
   "name_fr": "Mainteneur d'infrastructure",
   "desc_fr": "Spécialiste infrastructure expert : fiabilité des systèmes, optimisation des performances et gestion des opérations techniques. Maintient une infrastructure robuste et scalable."
  },
  {
   "name": "Legal Compliance Checker",
   "desc": "Expert legal and compliance specialist ensuring business operations, data handling, and content creation comply with relevant laws, regulations, and industry standards across multiple jurisdictions.",
   "category": "support",
   "path": "agents/support/support-legal-compliance-checker.md",
   "model": "",
   "tools": "",
   "name_fr": "Vérificateur conformité juridique",
   "desc_fr": "Expert juridique et conformité : garantit que les opérations métier, le traitement des données et la création de contenu respectent lois, règlements et normes sectorielles applicables."
  },
  {
   "name": "Support Responder",
   "desc": "Expert customer support specialist delivering exceptional customer service, issue resolution, and user experience optimization. Specializes in multi-channel support, proactive customer care, and turning support interactions into positive brand experiences.",
   "category": "support",
   "path": "agents/support/support-support-responder.md",
   "model": "",
   "tools": "",
   "name_fr": "Répondeur support",
   "desc_fr": "Spécialiste support client expert : service client d'exception, résolution d'issues et optimisation de l'expérience utilisateur. Multi-canaux, soin proactif et transformation du support en expériences de marque positives."
  },
  {
   "name": "test-engineer",
   "desc": "QA engineer specialized in test strategy, test writing, and coverage analysis. Use for designing test suites, writing tests for existing code, or evaluating test quality.",
   "category": "core",
   "path": "agents/test-engineer.md",
   "model": "",
   "tools": "",
   "name_fr": "Ingénieur QA (tests)",
   "desc_fr": "Ingénieur QA spécialisé en stratégie de test, rédaction de tests et analyse de couverture. Pour concevoir des suites de tests, tester du code existant ou évaluer la qualité des tests."
  },
  {
   "name": "Accessibility Auditor",
   "desc": "Expert accessibility specialist who audits interfaces against WCAG standards, tests with assistive technologies, and ensures inclusive design. Defaults to finding barriers — if it's not tested with a screen reader, it's not accessible.",
   "category": "testing",
   "path": "agents/testing/testing-accessibility-auditor.md",
   "model": "",
   "tools": "",
   "name_fr": "Auditeur accessibilité",
   "desc_fr": "Expert accessibilité qui audite les interfaces selon les normes WCAG, teste avec les technologies d'assistance et garantit un design inclusif. Cherche par défaut les barrières — non testé avec un lecteur d'écran = pas accessible."
  },
  {
   "name": "API Tester",
   "desc": "Expert API testing specialist focused on comprehensive API validation, performance testing, and quality assurance across all systems and third-party integrations",
   "category": "testing",
   "path": "agents/testing/testing-api-tester.md",
   "model": "",
   "tools": "",
   "name_fr": "Testeur d'API",
   "desc_fr": "Spécialiste du test d'API : validation complète, tests de performance et assurance qualité sur tous les systèmes et intégrations tierces."
  },
  {
   "name": "Evidence Collector",
   "desc": "Screenshot-obsessed, fantasy-allergic QA specialist - Default to finding 3-5 issues, requires visual proof for everything",
   "category": "testing",
   "path": "agents/testing/testing-evidence-collector.md",
   "model": "",
   "tools": "",
   "name_fr": "Collecteur de preuves",
   "desc_fr": "Spécialiste QA obsédé par les captures d'écran et allergique au fantasme — trouve par défaut 3 à 5 problèmes et exige une preuve visuelle pour chaque constat."
  },
  {
   "name": "Performance Benchmarker",
   "desc": "Expert performance testing and optimization specialist focused on measuring, analyzing, and improving system performance across all applications and infrastructure",
   "category": "testing",
   "path": "agents/testing/testing-performance-benchmarker.md",
   "model": "",
   "tools": "",
   "name_fr": "Benchmarkeur de performances",
   "desc_fr": "Spécialiste des tests et de l'optimisation de performance : mesure, analyse et améliore les performances de tous les systèmes et applications."
  },
  {
   "name": "Reality Checker",
   "desc": "Stops fantasy approvals, evidence-based certification - Default to \"NEEDS WORK\", requires overwhelming proof for production readiness",
   "category": "testing",
   "path": "agents/testing/testing-reality-checker.md",
   "model": "",
   "tools": "",
   "name_fr": "Vérificateur de réalité",
   "desc_fr": "Stoppe les validations fantaisistes, certifie sur preuves — répond par défaut « À retravailler » et exige une preuve accablante pour valider la mise en production."
  },
  {
   "name": "Test Results Analyzer",
   "desc": "Expert test analysis specialist focused on comprehensive test result evaluation, quality metrics analysis, and actionable insight generation from testing activities",
   "category": "testing",
   "path": "agents/testing/testing-test-results-analyzer.md",
   "model": "",
   "tools": "",
   "name_fr": "Analyseur de résultats de tests",
   "desc_fr": "Spécialiste d'analyse de tests : évaluation complète des résultats, analyse des métriques qualité et génération d'insights actionnables à partir des activités de test."
  },
  {
   "name": "Tool Evaluator",
   "desc": "Expert technology assessment specialist focused on evaluating, testing, and recommending tools, software, and platforms for business use and productivity optimization",
   "category": "testing",
   "path": "agents/testing/testing-tool-evaluator.md",
   "model": "",
   "tools": "",
   "name_fr": "Évaluateur d'outils",
   "desc_fr": "Spécialiste d'évaluation technologique : teste, évalue et recommande des outils, logiciels et plateformes pour un usage métier et une productivité optimale."
  },
  {
   "name": "Workflow Optimizer",
   "desc": "Expert process improvement specialist focused on analyzing, optimizing, and automating workflows across all business functions for maximum productivity and efficiency",
   "category": "testing",
   "path": "agents/testing/testing-workflow-optimizer.md",
   "model": "",
   "tools": "",
   "name_fr": "Optimiseur de workflows",
   "desc_fr": "Spécialiste d'amélioration des process : analyse, optimisation et automatisation des workflows de toutes les fonctions métier pour une productivité et une efficacité maximales."
  },
  {
   "name": "web-performance-auditor",
   "desc": "Web performance engineer focused on Core Web Vitals, loading, rendering, and network optimization. Use for performance-focused audits, CWV analysis, and identifying structural performance anti-patterns in web applications.",
   "category": "core",
   "path": "agents/web-performance-auditor.md",
   "model": "",
   "tools": "",
   "name_fr": "Auditeur performance web",
   "desc_fr": "Ingénieur performance web centré sur les Core Web Vitals, le chargement, le rendu et l'optimisation réseau. Pour les audits de performance, l'analyse CWV et l'identification des anti-patterns structurels."
  }
 ]
};
window.MEGA_CATALOG = MEGA_CATALOG; // une const globale n'existe pas sur window


(function () {
  'use strict';

  // ── État + persistance locale (par site) ──────────────────────────────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem('mgp.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('mgp.' + k, JSON.stringify(v)); } catch (e) {} },
  };
  let LANG = store.get('lang', 'fr');

  const I18N = {
    fr: {
      btnTitle: 'MEGA PACK — Skills & Agents',
      search: 'Rechercher un skill, un agent, un prompt…',
      tabs: { all: 'Tout', skills: 'Skills', agents: 'Agents', teams: '🕸 Équipes', custom: '✍️ Perso', favs: '★ Favoris' },
      foot: 'Clic = injecter · ⏎ injecter · ⌘⏎ défaut · ⇧⏎ ChatGPT · ⌘-clic sélectionner',
      noResults: 'Aucun résultat — essaie un autre mot',
      empty: 'Catalogue vide — place catalog-full.js à côté du userscript.',
      injected: '✓ Injecté dans la conversation',
      copied: '✓ Copié',
      selected: 'sél.',
      compose: '✚ Composer ({n})',
      newp: '＋', newpTitle: 'Nouveau prompt ✍️',
      mName: 'Nom', mPrompt: 'Prompt', mSave: 'Enregistrer', mDel: 'Supprimer', mCancel: 'Annuler',
      count: (n) => n + ' résultat' + (n > 1 ? 's' : ''),
      llm: 'LLM',
      settings: '⚙ Réglages', settingsTitle: 'Réglages — comme l\'app macOS',
      setTitle: '⚡ MEGA PACK — Réglages',
      setTheme: 'Thème', setThemeD: 'Appliqué au panneau, aux menus et à ce réglage',
      setLang: 'Langue', setLangD: 'Interface du panneau',
      setLlm: 'LLM par défaut', setLlmD: '⌘⏎ dans le panneau ouvre ce chat',
      setSend: 'Destinations du clic droit',
      setSendHint: 'Coche une ou plusieurs — l\'ordre des clics = priorité du menu « Envoyer à »',
      setFsc: 'Raccourcis favoris', setFscD: '⌘1 à ⌘9 injectent les 9 premiers favoris',
      setCfg: 'Configuration', setCfgD: 'Favoris, prompts perso, équipes et préférences en JSON',
      setExport: '⬇ Exporter', setImport: '⬆ Importer', setImported: '✓ Configuration importée', setImportErr: '✗ Fichier invalide',
      setXp: 'Mes prompts ✍️', setXpD: 'Télécharge tous tes prompts en Markdown',
      setXpBtn: '⬇ Exporter en .md', setXpNone: 'Aucun prompt perso',
      setTour: "🎓 Mode d'emploi interactif", setTourD: 'Revoit la visite guidée : recherche, onglets, LLM, clic droit…',
      setTourBtn: 'Relancer la visite',
      tourTitle: 'Visite guidée',
      tourSkip: 'Passer la visite', tourNext: 'Suivant →', tourDone: 'Terminer',
      tourStepN: (i, n) => 'Étape ' + i + '/' + n,
      setDone: 'Enregistrer', setClose: 'Fermer',
      saved: '✓ Réglages enregistrés',
      clipboard: 'Presse-papiers',
      sendTo: 'Envoyer à',
      copyPrompt: '⧉ Copier le prompt',
      favAdd: '★ Ajouter aux favoris', favDel: '☆ Retirer des favoris',
      tipSkill: 'SKILL — procédure d\'expertise. Clic : injecte.',
      tipAgent: 'AGENT — persona expert. Clic : injecte.',
      tipCustom: 'PROMPT PERSO — ton texte tel quel. Clic : injecte.',
      tipTeam: 'ÉQUIPE — orchestrateur + agents + workflow. Clic : injecte le protocole.',
      tipCat: 'Catégorie',
      agentsN: 'agents',
      orch: 'Orchestrateur',
      pSkill: function (x) { return 'Utilise le skill "' + x.name + '" (' + x.path + '). Charge et suis son SKILL.md strictement. ' + ((x.desc_fr || x.desc || '')).slice(0, 200) + ' Réponds toujours en français.'; },
      pAgent: function (x) { return 'Agis désormais comme l\'agent "' + x.name + '" (' + x.path + '). ' + ((x.desc_fr || x.desc || '')).slice(0, 200) + ' Adopte ce persona pour toute la conversation et réponds toujours en français.'; },
      pCustom: function (x) { return x.name + '\n\n' + (x.desc || ''); },
      pTeam: function (x) {
        const t = x._t;
        const ag = (t.agents || []).map(function (a) { return '### ' + a.name + (a.role ? ' — ' + a.role : '') + '\n' + (a.desc || '') + '\nPrompt système : ' + (a.system || ''); }).join('\n');
        const wf = (t.workflow || []).map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n');
        return '# Équipe multi-agents "' + (t.team || x.name) + '"\n' + (t.desc || '') +
          '\n\n## 👔 Super-orchestrateur — ' + ((t.orchestrator || {}).name || '') + '\n\n' + ((t.orchestrator || {}).system || '') +
          '\n\n## 👥 Agents\n' + ag + '\n\n## 🔁 Workflow\n' + wf +
          '\n\n---\nJoue le super-orchestrateur : distribue les tâches aux agents, consolide leurs livrables, arbitre les conflits et garantis la qualité du rapport final.\n';
      },
    },
    en: {
      btnTitle: 'MEGA PACK — Skills & Agents',
      search: 'Search a skill, an agent, a prompt…',
      tabs: { all: 'All', skills: 'Skills', agents: 'Agents', teams: '🕸 Teams', custom: '✍️ Custom', favs: '★ Favorites' },
      foot: 'Click = inject · ⏎ inject · ⌘⏎ default · ⇧⏎ ChatGPT · ⌘-click select',
      noResults: 'No results',
      empty: 'Empty catalog — place catalog-full.js next to the userscript.',
      injected: '✓ Injected into the conversation',
      copied: '✓ Copied',
      selected: 'sel.',
      compose: '✚ Compose ({n})',
      newp: '＋', newpTitle: 'New prompt ✍️',
      mName: 'Name', mPrompt: 'Prompt', mSave: 'Save', mDel: 'Delete', mCancel: 'Cancel',
      count: (n) => n + ' result' + (n > 1 ? 's' : ''),
      llm: 'LLM',
      settings: '⚙ Settings', settingsTitle: 'Settings — same as the macOS app',
      setTitle: '⚡ MEGA PACK — Settings',
      setTheme: 'Theme', setThemeD: 'Applied to the panel, menus and this dialog',
      setLang: 'Language', setLangD: 'Panel interface',
      setLlm: 'Default LLM', setLlmD: '⌘⏎ in the panel opens this chat',
      setSend: 'Right-click destinations',
      setSendHint: 'Check one or more — click order = “Send to” menu priority',
      setFsc: 'Favorite shortcuts', setFscD: '⌘1 to ⌘9 inject the first 9 favorites',
      setCfg: 'Configuration', setCfgD: 'Favorites, custom prompts, teams and preferences as JSON',
      setExport: '⬇ Export', setImport: '⬆ Import', setImported: '✓ Configuration imported', setImportErr: '✗ Invalid file',
      setXp: 'My prompts ✍️', setXpD: 'Download all your prompts as Markdown',
      setXpBtn: '⬇ Export as .md', setXpNone: 'No custom prompts',
      setTour: '🎓 Interactive guide', setTourD: 'Replays the guided tour: search, tabs, LLM, right-click…',
      setTourBtn: 'Replay the tour',
      tourTitle: 'Guided tour',
      tourSkip: 'Skip tour', tourNext: 'Next →', tourDone: 'Done',
      tourStepN: (i, n) => 'Step ' + i + '/' + n,
      setDone: 'Save', setClose: 'Close',
      saved: '✓ Settings saved',
      clipboard: 'Clipboard',
      sendTo: 'Send to',
      copyPrompt: '⧉ Copy prompt',
      favAdd: '★ Add to favorites', favDel: '☆ Remove from favorites',
      tipSkill: 'SKILL — expertise procedure. Click: inject.',
      tipAgent: 'AGENT — expert persona. Click: inject.',
      tipCustom: 'CUSTOM PROMPT — your text as-is. Click: inject.',
      tipTeam: 'TEAM — orchestrator + agents + workflow. Click: inject the protocol.',
      tipCat: 'Category',
      agentsN: 'agents',
      orch: 'Orchestrator',
      pSkill: function (x) { return 'Use the skill "' + x.name + '" (' + x.path + '). Load and strictly follow its SKILL.md. ' + (x.desc || '').slice(0, 200); },
      pAgent: function (x) { return 'From now on, act as the agent "' + x.name + '" (' + x.path + '). ' + (x.desc || '').slice(0, 200) + ' Adopt this persona for the whole conversation.'; },
      pCustom: function (x) { return x.name + '\n\n' + (x.desc || ''); },
      pTeam: function (x) {
        const t = x._t;
        const ag = (t.agents || []).map(function (a) { return '### ' + a.name + (a.role ? ' — ' + a.role : '') + '\n' + (a.desc || '') + '\nSystem prompt: ' + (a.system || ''); }).join('\n');
        const wf = (t.workflow || []).map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n');
        return '# Multi-agent team "' + (t.team || x.name) + '"\n' + (t.desc || '') +
          '\n\n## 👔 Super-orchestrator — ' + ((t.orchestrator || {}).name || '') + '\n\n' + ((t.orchestrator || {}).system || '') +
          '\n\n## 👥 Agents\n' + ag + '\n\n## 🔁 Workflow\n' + wf +
          '\n\n---\nPlay the super-orchestrator: distribute tasks to agents, consolidate their deliverables, arbitrate conflicts, own the final report.\n';
      },
    },
  };
  const T = function () { return I18N[LANG] || I18N.fr; };

  // Dossier d'où ce script a été chargé (bookmarklet / <script src>) — sert à
  // auto-charger catalog-full.js placé à côté quand le catalogue est absent.
  const HERE = (function () {
    try {
      const s = document.currentScript && document.currentScript.src;
      return s ? s.replace(/[^/]*$/, '') : '';
    } catch (e) { return ''; }
  })();
  let catalogTried = false;
  function ensureCatalog(then) {
    if (window.MEGA_CATALOG || catalogTried || !HERE) return false;
    catalogTried = true;
    const sc = document.createElement('script');
    sc.src = HERE + 'catalog-full.js';
    sc.onload = function () { then(); };
    (document.head || document.documentElement).appendChild(sc);
    return true;
  }

  // ── Données dérivées (aligné Édition Luxe) ────────────────────────────────
  function cat() { return window.MEGA_CATALOG || { skills: [], agents: [] }; }
  function customs() { return store.get('customs', []); }
  function favs() { return store.get('favs', []); }
  function teams() { return store.get('teams', []); }
  function isFav(n) { return favs().indexOf(n) !== -1; }
  function toggleFav(n) {
    const f = favs(); const i = f.indexOf(n);
    if (i >= 0) f.splice(i, 1); else f.push(n);
    store.set('favs', f); return i < 0;
  }
  function ALL() {
    const C = cat();
    return [].concat(
      C.skills.map(function (x) { return { x: x, k: 'skill' }; }),
      C.agents.map(function (x) { return { x: x, k: 'agent' }; }),
      teams().map(function (t) { return { x: { name: t.team || t.name, desc: t.desc, _t: t }, k: 'team' }; }),
      customs().map(function (x) { return { x: x, k: 'custom' }; })
    );
  }
  function lname(x) { return (LANG === 'fr' && x.name_fr) ? x.name_fr : x.name; }
  function ldesc(x) { return (LANG === 'fr' && x.desc_fr) ? x.desc_fr : (x.desc || ''); }
  function promptOf(it) {
    if (it.k === 'custom') return T().pCustom(it.x);
    if (it.k === 'team') return T().pTeam(it.x);
    if (it.k === 'agent') return T().pAgent(it.x);
    return T().pSkill(it.x);
  }
  function buildCombo(items) {
    const head = LANG === 'fr'
      ? 'Voici ' + items.length + ' modules à appliquer ensemble :\n\n'
      : 'Here are ' + items.length + ' modules to apply together:\n\n';
    const mid = items.map(function (it, i) { return (i + 1) + '. **' + lname(it.x) + '** — ' + ldesc(it.x).trim(); }).join('\n');
    const tail = LANG === 'fr'
      ? '\n\nCombine ces expertises pour traiter ma demande ci-dessous.\n\n'
      : '\n\nCombine these expertises to handle my request below.\n\n';
    return head + mid + tail;
  }

  // ── LLM par défaut (sélecteur, persisté) + destinations ───────────────────
  const LLMS = ['claude', 'chatgpt', 'perplexity', 'copilot', 'deepseek', 'zai', 'kimi', 'mammouth'];
  const LLM_LABEL = { claude: 'Claude', chatgpt: 'ChatGPT', perplexity: 'Perplexity', copilot: 'Copilot', deepseek: 'DeepSeek', zai: 'Z.ai', kimi: 'Kimi', mammouth: 'Mammouth' };
  function defaultLLM() { return store.get('defaultLLM', 'claude'); }

  // ── Insertion dans la zone de saisie du LLM ───────────────────────────────
  function findEditor() {
    const sels = [
      'div[contenteditable="true"]#prompt-textarea',
      'textarea[data-id="root"]',
      'textarea#prompt-textarea',
      'div[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"].ql-editor',
      'div[contenteditable="true"]',
      'textarea[placeholder]',
      'textarea',
    ];
    for (const s of sels) {
      const els = document.querySelectorAll(s);
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width > 100 && r.height > 20) return el;
      }
    }
    return null;
  }

  function insertText(txt) {
    const ed = findEditor();
    if (!ed) { copy(txt); return 'clipboard'; }
    ed.focus();
    if (ed.tagName === 'TEXTAREA' || ed.tagName === 'INPUT') {
      const set = Object.getOwnPropertyDescriptor(ed.__proto__, 'value');
      if (set && set.set) { set.set.call(ed, ed.value ? ed.value + '\n\n' + txt : txt); ed.dispatchEvent(new Event('input', { bubbles: true })); }
      else ed.value = ed.value ? ed.value + '\n\n' + txt : txt;
    } else {
      ed.focus();
      document.execCommand('insertText', false, (ed.textContent ? '\n\n' : '') + txt);
    }
    return 'editor';
  }

  function copy(t) { navigator.clipboard.writeText(t).catch(function () {}); }
  const LLM_URLS = {
    claude: 'https://claude.ai/new?q=', chatgpt: 'https://chatgpt.com/?q=',
    perplexity: 'https://www.perplexity.ai/search?q=', copilot: 'https://copilot.microsoft.com/?q=',
    deepseek: 'https://chat.deepseek.com/?q=', zai: 'https://chat.z.ai/?q=', kimi: 'https://www.kimi.com/?q=', mammouth: 'https://mammouth.ai/',
  };
  function openLLM(kind, txt) {
    copy(txt); // le prompt est toujours copié, quelle que soit la destination
    if (kind === 'clipboard') return; // presse-papiers : la copie suffit
    const q = encodeURIComponent(txt);
    window.open((LLM_URLS[kind] || LLM_URLS.claude) + q, '_blank', 'noopener');
  }

  // ── CSS (fenêtre macOS + Édition Luxe) ────────────────────────────────────
  const CSS = `
  #mgp-btn{position:fixed;bottom:88px;right:20px;z-index:999999;width:52px;height:52px;border-radius:50%;
    background:linear-gradient(135deg,#9945ff,#14f195);border:none;cursor:pointer;font-size:22px;
    box-shadow:0 6px 24px rgba(153,69,255,.45);display:flex;align-items:center;justify-content:center;
    transition:transform .15s}
  #mgp-btn:hover{transform:scale(1.1)}
  #mgp-panel{position:fixed;bottom:148px;right:20px;z-index:999999;width:420px;max-width:94vw;height:74vh;
    background:#12131c;border:1px solid #31343f;border-radius:12px;display:none;flex-direction:column;
    box-shadow:0 24px 70px rgba(0,0,0,.6);font:13.5px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#eef0f6;overflow:hidden}
  #mgp-panel.open{display:flex}
  #mgp-panel.min{height:38px !important}
  #mgp-panel.min #mgp-head,#mgp-panel.min #mgp-qrow,#mgp-panel.min #mgp-tabs,#mgp-panel.min #mgp-selrow,
  #mgp-panel.min #mgp-list,#mgp-panel.min #mgp-foot,#mgp-panel.min #mgp-rsz,#mgp-panel.min #mgp-setdlg{display:none !important}
  #mgp-rsz{position:absolute;top:0;left:0;width:16px;height:16px;cursor:nwse-resize;z-index:5}
  #mgp-rsz::after{content:'';position:absolute;bottom:3px;left:3px;width:8px;height:8px;
    border-left:2px solid #3a3e4c;border-bottom:2px solid #3a3e4c;border-radius:2px}
  #mgp-rsz:hover::after{border-color:#9945ff}
  /* barre titre macOS : 3 feux + titre + boutons */
  #mgp-macbar{height:38px;flex:none;background:linear-gradient(#262833,#1d1f28);border-bottom:1px solid #101018;
    display:flex;align-items:center;gap:8px;padding:0 12px;user-select:none}
  #mgp-macbar .lights{display:flex;gap:7px;flex:none}
  #mgp-macbar .l{width:12px;height:12px;border-radius:50%;border:none;padding:0;cursor:pointer;
    box-shadow:inset 0 0 0 .5px rgba(0,0,0,.3)}
  #mgp-macbar .l:hover{filter:brightness(1.2)}
  .l-close{background:#ff5f57}.l-min{background:#febc2e}.l-max{background:#28c840}
  #mgp-macbar .ttl{flex:1;text-align:center;font:600 12px/1 -apple-system,sans-serif;color:#9298a9;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #mgp-macbar .lx{display:flex;gap:6px;flex:none}
  #mgp-macbar .lx button{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;
    font:600 10.5px/1 -apple-system,sans-serif;padding:4px 9px;border-radius:99px}
  #mgp-macbar .lx button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-set{font-size:13px;line-height:1}
  #mgp-setdlg{display:none;flex-direction:column;gap:0;overflow-y:auto;max-height:calc(100% - 46px);margin:0 10px 10px;
    border:1px solid #31343f;border-radius:12px;background:#14151c}
  #mgp-setdlg.open{display:flex}
  #mgp-setdlg .sttl{font-size:13.5px;font-weight:700;padding:13px 14px 3px}
  #mgp-setdlg .shint{font-size:10.5px;color:#6b7080;padding:0 14px 10px;border-bottom:1px solid #23252f}
  #mgp-setdlg .row{display:flex;align-items:center;justify-content:space-between;gap:10px;
    padding:10px 14px;border-bottom:1px solid #23252f}
  #mgp-setdlg .row.col{flex-direction:column;align-items:stretch;gap:7px}
  #mgp-setdlg .row b{font-size:12.5px;font-weight:600}
  #mgp-setdlg .row .d{display:block;font-size:10.5px;color:#6b7080;font-weight:400;margin-top:2px}
  #mgp-setdlg select{background:#191b24;border:1px solid #31343f;border-radius:8px;color:#eef0f6;font:inherit;font-size:12px;padding:5px 9px;outline:none}
  #mgp-setdlg select:focus{border-color:#9945ff}
  #mgp-setdlg .hint{font-size:10.5px;color:#6b7080;font-weight:400}
  #mgp-setdlg .chips{display:flex;flex-wrap:wrap;gap:6px}
  #mgp-setdlg .chips button{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;font:inherit;font-size:11.5px;font-weight:600;padding:5px 11px;border-radius:99px}
  #mgp-setdlg .chips button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-setdlg .chips button.on{background:#9945ff;border-color:#9945ff;color:#fff}
  #mgp-setdlg .srow{display:flex;gap:8px;justify-content:flex-end;padding:11px 14px}
  #mgp-setdlg .btn{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;font:inherit;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px}
  #mgp-setdlg .btn:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-setdlg .srow button.prim{background:#9945ff;border-color:#9945ff;color:#fff}
  #mgp-setdlg .srow button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-setdlg .sfoot{font-size:10.5px;color:#6b7080;padding:0 14px 11px;font-weight:400}
  /* ── Thème clair (aligné app macOS : body.light) ── */
  #mgp-panel.light{background:#f6f7fd;border-color:#dfe4f3;color:#131a2e}
  #mgp-panel.light #mgp-macbar{background:linear-gradient(#ffffff,#f0f1f9);border-bottom-color:#dfe4f3}
  #mgp-panel.light #mgp-macbar .ttl{color:#5d6885}
  #mgp-panel.light #mgp-macbar .lx button{border-color:#c5cfeb;color:#5d6885}
  #mgp-panel.light #mgp-macbar .lx button:hover{border-color:#9945ff;color:#131a2e}
  #mgp-panel.light #mgp-head{border-bottom-color:#dfe4f3}
  #mgp-panel.light #mgp-head .c{color:#5d6885}
  #mgp-panel.light #mgp-qrow,#mgp-panel.light .mgp-item:hover,#mgp-panel.light .mgp-item.on{background:#f4f6fd}
  #mgp-panel.light #mgp-qrow{border-color:#dfe4f3}
  #mgp-panel.light #mgp-q{color:#131a2e}
  #mgp-panel.light #mgp-q::placeholder{color:#5d6885}
  #mgp-panel.light .mgp-tab{color:#5d6885}
  #mgp-panel.light .mgp-tab:hover,#mgp-panel.light .mgp-tab.on{background:#eceefb;color:#131a2e}
  #mgp-panel.light .mgp-item b{color:#131a2e}
  #mgp-panel.light .mgp-item .d{color:#5d6885}
  #mgp-panel.light .mgp-item .fb,#mgp-panel.light .mgp-item .fv{color:#8a90a5}
  #mgp-panel.light .mgp-item .fb:hover,#mgp-panel.light .mgp-item .fv{color:#d4a017}
  #mgp-panel.light #mgp-foot{border-top-color:#dfe4f3;color:#5d6885}
  #mgp-panel.light #mgp-foot .n{color:#5d6885}
  #mgp-panel.light #mgp-llmbtn{border-color:#c5cfeb;color:#5d6885}
  #mgp-panel.light #mgp-llmbtn b{color:#0a9d68}
  #mgp-panel.light #mgp-llmmenu,body.mgp-light #mgp-ctx,body.mgp-light #mgp-tip{background:#ffffff;border-color:#c5cfeb;box-shadow:0 18px 50px rgba(20,25,50,.18)}
  #mgp-panel.light #mgp-llmmenu button,body.mgp-light #mgp-ctx button{color:#2c3556}
  #mgp-panel.light #mgp-llmmenu button:hover,body.mgp-light #mgp-ctx button:hover{background:#f4f6fd;color:#131a2e}
  body.mgp-light #mgp-tip p{color:#2c3556}
  body.mgp-light #mgp-tip .tc{color:#5d6885}
  #mgp-panel.light .mgp-item.selc{background:rgba(107,70,242,.08)}
  #mgp-panel.light .mgp-item.selc b{color:#6b46f2}
  #mgp-panel.light #mgp-setdlg{background:#ffffff;border-color:#dfe4f3}
  #mgp-panel.light #mgp-setdlg .row{border-bottom-color:#e8ebf7}
  #mgp-panel.light #mgp-setdlg .row .d,#mgp-panel.light #mgp-setdlg .hint,
  #mgp-panel.light #mgp-setdlg .shint,#mgp-panel.light #mgp-setdlg .sfoot{color:#5d6885}
  #mgp-panel.light #mgp-setdlg select,#mgp-panel.light #mgp-setdlg .chips button{background:#f4f6fd;border-color:#c5cfeb;color:#2c3556}
  #mgp-panel.light #mgp-setdlg .chips button.on{background:#6b46f2;border-color:#6b46f2;color:#fff}
  #mgp-panel.light #mgp-setdlg .btn{border-color:#c5cfeb;color:#2c3556}
  #mgp-panel.light #mgp-setdlg .srow button{border-color:#dfe4f3;color:#2c3556}
  #mgp-panel.light #mgp-setdlg .srow button.prim{background:#6b46f2;border-color:#6b46f2;color:#fff}
  /* visite guidée (alignée app : carte flottante + surbrillance de l'élément) */
  #mgp-tour{position:fixed;z-index:1000003;inset:0;display:none;background:rgba(5,6,10,.45)}
  #mgp-tour.open{display:block}
  #mgp-tourcard{position:absolute;max-width:330px;background:#14151c;border:1px solid #31343f;border-radius:14px;
    padding:14px 16px;box-shadow:0 24px 70px rgba(0,0,0,.55);font:13px/1.5 -apple-system,sans-serif;color:#eef0f6}
  #mgp-tourcard .tstepnum{font-size:10px;font-weight:800;letter-spacing:1px;color:#14f195;text-transform:uppercase}
  #mgp-tourcard h3{margin:4px 0 6px;font-size:14.5px}
  #mgp-tourcard p{margin:0 0 4px;color:#a8adbd;font-size:12.5px}
  #mgp-tourcard .thelp{color:#6b7080;font-size:11.5px}
  #mgp-tourcard .trow{display:flex;align-items:center;gap:8px;margin-top:11px}
  #mgp-tourcard .trow button{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;font:inherit;
    font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px}
  #mgp-tourcard .trow button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-tourcard .trow button.pri{background:#9945ff;border-color:#9945ff;color:#fff}
  #mgp-tourcard .trow .dots{display:flex;gap:4px;margin:0 auto}
  #mgp-tourcard .trow .dots i{width:6px;height:6px;border-radius:50%;background:#31343f}
  #mgp-tourcard .trow .dots i.on{background:#14f195}
  .mgp-tour-hl{position:relative;z-index:1000004;box-shadow:0 0 0 3px #14f195,0 0 24px rgba(20,241,149,.5) !important;border-radius:10px}
  body.mgp-light #mgp-tourcard{background:#ffffff;border-color:#c5cfeb;color:#131a2e}
  body.mgp-light #mgp-tourcard p{color:#2c3556}
  body.mgp-light #mgp-tourcard .thelp{color:#5d6885}
  #mgp-head{padding:9px 14px;border-bottom:1px solid #23252f;display:flex;justify-content:space-between;align-items:center}
  #mgp-head b{font-size:12.5px;letter-spacing:.4px}
  #mgp-head .c{font-size:11px;color:#6b7080;margin-left:8px;font-variant-numeric:tabular-nums}
  #mgp-qrow{display:flex;align-items:center;gap:9px;margin:10px 14px 0;padding:9px 12px;background:#14151c;border:1px solid #23252f;border-radius:10px}
  #mgp-qrow:focus-within{border-color:#9945ff}
  #mgp-qrow .l{color:#6b7080;font-size:15px}
  #mgp-q{flex:1;background:none;border:none;outline:none;color:#eef0f6;font:inherit;font-size:14px}
  #mgp-q::placeholder{color:#6b7080}
  #mgp-tabs{display:flex;gap:4px;align-items:center;padding:10px 14px 9px;flex-wrap:wrap}
  .mgp-tab{padding:4px 9px;border-radius:99px;background:none;border:none;cursor:pointer;font:inherit;font-size:11.5px;font-weight:600;color:#a8adbd}
  .mgp-tab:hover{color:#eef0f6;background:#191b24}
  .mgp-tab.on{background:#191b24;color:#eef0f6}
  #mgp-selrow{display:flex;gap:8px;align-items:center;padding:0 14px 8px}
  #mgp-selrow:empty{display:none}
  #mgp-seln{font-size:11px;color:#14f195;font-variant-numeric:tabular-nums}
  #mgp-compose{border:none;background:linear-gradient(120deg,#9945ff,#14f195);color:#0b0c10;cursor:pointer;font:inherit;font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px}
  #mgp-list{flex:1;overflow-y:auto;padding:0 8px 6px;position:relative}
  #mgp-void{padding:34px 20px;text-align:center;color:#6b7080;font-size:12.5px}
  .mgp-item{display:flex;gap:11px;align-items:center;padding:8px 10px;border-radius:10px;cursor:pointer;position:relative}
  .mgp-item:hover,.mgp-item.on{background:#191b24}
  .mgp-item.on::before{content:'';position:absolute;left:0;top:9px;bottom:9px;width:2.5px;border-radius:2px;background:linear-gradient(120deg,#9945ff,#14f195)}
  .mgp-item.copied{background:rgba(20,241,149,.12)}
  .mgp-item .ico{font-size:15px;width:22px;text-align:center;flex:none}
  .mgp-item .mid{flex:1;min-width:0}
  .mgp-item b{font-size:13px;font-weight:600;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mgp-item .d{font-size:11.5px;color:#6b7080;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mgp-item .fb{border:none;background:none;color:#6b7080;cursor:pointer;font-size:13px;padding:2px 3px;border-radius:6px;opacity:0;flex:none}
  .mgp-item:hover .fb,.mgp-item.on .fb{opacity:1}
  .mgp-item .fb:hover{color:#f5c518}
  .mgp-item .fv{color:#f5c518;font-size:11px;flex:none}
  .mgp-item.selc{background:rgba(153,69,255,.10)}
  .mgp-item.selc b{color:#c9a2ff}
  /* tooltip expert */
  #mgp-tip{position:fixed;z-index:1000001;max-width:280px;background:#14151c;border:1px solid #31343f;border-radius:12px;
    padding:10px 12px;box-shadow:0 18px 50px rgba(0,0,0,.5);display:none;pointer-events:none;
    font:12px/1.5 -apple-system,sans-serif;color:#eef0f6}
  #mgp-tip .tk{font-size:9.5px;font-weight:800;letter-spacing:1.2px;color:#14f195}
  #mgp-tip .tk.t-agent{color:#9945ff}
  #mgp-tip .tk.t-custom{color:#f5c518}
  #mgp-tip .tk.t-team{color:#14f195}
  #mgp-tip b.tn{display:block;font-size:12.5px;margin:3px 0}
  #mgp-tip p{margin:2px 0 0;color:#a8adbd}
  #mgp-tip .tc{display:block;margin-top:5px;font-size:10.5px;color:#6b7080}
  /* menu contextuel */
  #mgp-ctx{position:fixed;z-index:1000002;min-width:190px;background:#14151c;border:1px solid #31343f;border-radius:12px;
    padding:5px;box-shadow:0 18px 50px rgba(0,0,0,.55);display:none;font:12.5px/1.4 -apple-system,sans-serif;color:#eef0f6}
  #mgp-ctx .ch{font-size:11.5px;font-weight:700;padding:5px 9px 6px}
  #mgp-ctx .cs{font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7080;padding:4px 9px 2px}
  #mgp-ctx button{display:block;width:100%;border:none;background:none;color:#a8adbd;cursor:pointer;text-align:left;
    font:inherit;font-size:12px;padding:6px 9px;border-radius:8px}
  #mgp-ctx button:hover{background:#191b24;color:#eef0f6}
  /* sélecteur LLM (barre du bas) */
  #mgp-foot{padding:8px 12px;border-top:1px solid #23252f;font-size:11px;color:#a8adbd;display:flex;gap:9px;align-items:center}
  #mgp-foot .n{margin-left:auto;color:#6b7080;font-variant-numeric:tabular-nums}
  #mgp-llmwrap{position:relative;flex:none}
  #mgp-llmbtn{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;font:600 10.5px/1 -apple-system,sans-serif;
    padding:4px 9px;border-radius:99px;white-space:nowrap}
  #mgp-llmbtn:hover,#mgp-llmmenu.open ~ #mgp-llmbtn{border-color:#14f195;color:#eef0f6}
  #mgp-llmbtn b{color:#14f195}
  #mgp-llmmenu{position:absolute;bottom:calc(100% + 8px);left:0;z-index:1000002;min-width:170px;background:#14151c;
    border:1px solid #31343f;border-radius:12px;padding:5px;box-shadow:0 18px 50px rgba(0,0,0,.55);display:none}
  #mgp-llmmenu.open{display:block}
  #mgp-llmmenu button{display:flex;width:100%;border:none;background:none;color:#a8adbd;cursor:pointer;text-align:left;
    font:inherit;font-size:12px;padding:6px 9px;border-radius:8px}
  #mgp-llmmenu button:hover{background:#191b24;color:#eef0f6}
  #mgp-llmmenu button.on{color:#14f195;font-weight:700}
  #mgp-modal{position:fixed;inset:0;background:rgba(5,6,10,.55);display:none;align-items:center;justify-content:center;z-index:1000000}
  #mgp-modal.open{display:flex}
  #mgp-mbox{width:min(420px,92vw);background:#14151c;border:1px solid #31343f;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:11px;box-shadow:0 24px 70px rgba(0,0,0,.5);font:inherit;color:#eef0f6}
  #mgp-mbox h3{font-size:14px;margin:0}
  #mgp-mbox label{display:flex;flex-direction:column;gap:5px;font-size:11.5px;color:#a8adbd;font-weight:600}
  #mgp-mbox input,#mgp-mbox textarea{background:#191b24;border:1px solid #23252f;border-radius:8px;color:#eef0f6;font:inherit;padding:8px 10px;outline:none;resize:vertical}
  #mgp-mbox input:focus,#mgp-mbox textarea:focus{border-color:#9945ff}
  #mgp-erow{display:flex;gap:8px;align-items:center}
  #mgp-erow button{border:1px solid #23252f;background:none;color:#a8adbd;cursor:pointer;font:inherit;font-size:12px;font-weight:600;padding:7px 14px;border-radius:8px}
  #mgp-erow button:hover{border-color:#31343f;color:#eef0f6}
  #mgp-e-save{background:linear-gradient(120deg,#9945ff,#14f195);border:none;color:#0b0c10}
  #mgp-list::-webkit-scrollbar{width:8px}
  #mgp-list::-webkit-scrollbar-thumb{background:#31343f;border-radius:4px}
  `;

  // ── UI ─────────────────────────────────────────────────────────────────────
  let tab = 'all', q = '', idx = 0, results = [], sel = [];

  const btn = document.createElement('button');
  btn.id = 'mgp-btn';
  btn.title = T().btnTitle;
  btn.innerHTML = '⚡';

  const panel = document.createElement('div');
  panel.id = 'mgp-panel';
  panel.innerHTML =
    '<div id="mgp-macbar"><span class="lights">' +
      '<button class="l l-close" title="' + (LANG === 'fr' ? 'Fermer' : 'Close') + '"></button>' +
      '<button class="l l-min" title="' + (LANG === 'fr' ? 'Réduire' : 'Minimize') + '"></button>' +
      '<button class="l l-max" title="' + (LANG === 'fr' ? 'Élargir / réduire' : 'Widen / shrink') + '"></button>' +
      '</span><span class="ttl">⚡ MEGA PACK — Édition Luxe</span>' +
      '<span class="lx"><button id="mgp-set" title="' + T().settingsTitle + '">' + T().settings + '</button>' +
      '<button id="mgp-newp" title="' + T().newpTitle + '">' + T().newp + '</button>' +
      '<button id="mgp-lang">' + LANG.toUpperCase() + '</button></span></div>' +
    '<div id="mgp-head"><b>⚡ MEGA PACK</b><span class="c" id="mgp-counts"></span></div>' +
    '<div id="mgp-qrow"><span class="l">⌕</span><input id="mgp-q"></div>' +
    '<div id="mgp-tabs"></div>' +
    '<div id="mgp-selrow"></div>' +
    '<div id="mgp-list"></div>' +
    '<div id="mgp-foot"><span id="mgp-llmwrap"><button id="mgp-llmbtn"></button><span id="mgp-llmmenu"></span></span>' +
      '<span>' + T().foot + '</span><span class="n" id="mgp-n"></span></div>' +
    '<div id="mgp-setdlg"></div>' +
    '<div id="mgp-modal"><div id="mgp-mbox">' +
      '<h3>✍️ ' + (LANG === 'fr' ? 'Nouveau prompt' : 'New prompt') + '</h3>' +
      '<label>' + T().mName + '<input id="mgp-e-name" maxlength="60"></label>' +
      '<label>' + T().mPrompt + '<textarea id="mgp-e-txt" rows="7" maxlength="2000"></textarea></label>' +
      '<div id="mgp-erow"><button id="mgp-e-save">' + T().mSave + '</button><button id="mgp-e-del">' + T().mDel + '</button><span style="flex:1"></span><button id="mgp-e-x">' + T().mCancel + '</button></div>' +
    '</div></div>';

  const tip = document.createElement('div');
  tip.id = 'mgp-tip';
  const ctx = document.createElement('div');
  ctx.id = 'mgp-ctx';
  const tour = document.createElement('div');
  tour.id = 'mgp-tour';
  tour.innerHTML = '<div id="mgp-tourcard">' +
    '<span class="tstepnum"></span><h3></h3><p></p><p class="thelp"></p>' +
    '<div class="trow"><button class="tskip"></button><span class="dots"></span><button class="tpri"></button></div>' +
    '</div>';

  // ── Tooltip expert (survol) ────────────────────────────────────────────────
  let tipTimer = null, tipFor = null;
  function tipHtml(it) {
    const x = it.x, k = it.k;
    const kind = k === 'agent' ? T().tipAgent : k === 'custom' ? T().tipCustom : k === 'team' ? T().tipTeam : T().tipSkill;
    const kl = k === 'agent' ? 'AGENT' : k === 'custom' ? 'PERSO' : k === 'team' ? 'ÉQUIPE' : 'SKILL';
    const cat = x.category ? '<span class="tc">' + T().tipCat + ' : ' + String(x.category).replace(/-/g, ' ') + '</span>' : '';
    const teamLine = (k === 'team' && x._t)
      ? '<span class="tc">👥 ' + (x._t.agents || []).map(function (a) { return a.name; }).join(' · ') + '</span>' : '';
    const skills = (k === 'agent' && Array.isArray(x.skills) && x.skills.length)
      ? '<span class="tc">🧩 ' + x.skills.slice(0, 6).join(' · ') + '</span>' : '';
    return '<span class="tk t-' + k + '">' + kl + (isFav(x.name) ? ' ★' : '') + '</span>' +
      '<b class="tn">' + lname(x) + '</b>' +
      '<p>' + ldesc(x).slice(0, 300) + ((ldesc(x) || '').length > 300 ? '…' : '') + '</p>' + cat + skills + teamLine +
      '<span class="tc">' + kind + '</span>';
  }
  function showTip(el, it) {
    tip.innerHTML = tipHtml(it);
    tip.style.display = 'block';
    tipFor = it.x.name;
    const r = el.getBoundingClientRect(), tr = tip.getBoundingClientRect();
    let x = Math.max(8, Math.min(r.left + r.width / 2 - tr.width / 2, window.innerWidth - tr.width - 8));
    let y = r.top - tr.height - 8;
    if (y < 8) y = Math.min(r.bottom + 8, window.innerHeight - tr.height - 8);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { tip.style.display = 'none'; tipFor = null; }

  // ── Menu contextuel (clic droit) ───────────────────────────────────────────
  function openCtx(el, it, cx, cy) {
    const x = it.x;
    const tgts = sendTargets().length ? sendTargets() : [defaultLLM()]; // repli : LLM par défaut
    const items = [].concat(
      '<span class="ch">' + lname(x) + '</span>',
      '<span class="cs">' + T().sendTo + '</span>',
      tgts.map(function (t) { return '<button data-t="' + t + '">▸ ' + (LLM_LABEL[t] || t) + '</button>'; }).join(''),
      '<span class="cs">···</span>',
      '<button data-a="copy">' + T().copyPrompt + '</button>',
      '<button data-a="fav">' + (isFav(x.name) ? T().favDel : T().favAdd) + '</button>',
      '<button data-t="clipboard">▸ ⧉ ' + T().clipboard + '</button>'
    ).join('');
    ctx.innerHTML = items;
    ctx.style.display = 'block';
    const w = ctx.offsetWidth, h = ctx.offsetHeight;
    ctx.style.left = Math.max(6, Math.min(cx, window.innerWidth - w - 6)) + 'px';
    ctx.style.top = Math.max(6, Math.min(cy, window.innerHeight - h - 6)) + 'px';
    ctx.querySelectorAll('button').forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        hideCtx();
        if (b.dataset.t) openLLM(b.dataset.t, promptOf(it));
        else if (b.dataset.a === 'copy') { copy(promptOf(it)); flash(el, T().copied); }
        else if (b.dataset.a === 'fav') { toggleFav(x.name); render(); }
      };
    });
  }
  function hideCtx() { ctx.style.display = 'none'; }
  document.addEventListener('click', function (e) { if (!ctx.contains(e.target)) hideCtx(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideCtx(); });
  window.addEventListener('blur', function () { hideCtx(); hideTip(); });

  // ── Sélecteur de LLM (barre du bas) ───────────────────────────────────────
  function renderLlmBtn() {
    const cur = defaultLLM();
  panel.querySelector('#mgp-llmbtn').innerHTML = '⌨ ' + T().llm + ' <b>' + (cur === 'clipboard' ? T().clipboard : (LLM_LABEL[cur] || cur)) + '</b> ▾';
  }
  function renderLlmMenu() {
    const m = panel.querySelector('#mgp-llmmenu');
    m.innerHTML = LLMS.concat(['clipboard']).map(function (t) {
      const lb = t === 'clipboard' ? '⧉ ' + T().clipboard : (LLM_LABEL[t] || t);
      return '<button data-t="' + t + '" class="' + (t === defaultLLM() ? 'on' : '') + '">' +
        (t === defaultLLM() ? '✓ ' : '▸ ') + lb + '</button>';
    }).join('');
    m.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        store.set('defaultLLM', b.dataset.t);
        renderLlmBtn();
        m.classList.remove('open');
      };
    });
  }
  panel.querySelector('#mgp-llmbtn').onclick = function (e) {
    e.stopPropagation();
    const m = panel.querySelector('#mgp-llmmenu');
    if (m.classList.contains('open')) m.classList.remove('open');
    else { renderLlmMenu(); m.classList.add('open'); }
  };
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('#mgp-llmwrap')) panel.querySelector('#mgp-llmmenu').classList.remove('open');
  });

  function compute() {
    // Recherche par tags : découpe sur espaces, / et virgules (« ux/ui » = ux OU ui) ;
    // un item passe s'il correspond à au moins un token — multi-mots sans séparateur = ET.
    const raw = q.toLowerCase();
    const hasSep = /[\s,/]\s*/.test(raw.trim()) && /[\/|,]/.test(raw);
    const terms = hasSep ? raw.split(/[\s,/|]+/).filter(Boolean) : raw.split(/\s+/).filter(Boolean);
    let pool = ALL();
    if (tab === 'skills') pool = pool.filter(function (it) { return it.k === 'skill'; });
    else if (tab === 'agents') pool = pool.filter(function (it) { return it.k === 'agent'; });
    else if (tab === 'teams') pool = pool.filter(function (it) { return it.k === 'team'; });
    else if (tab === 'custom') pool = pool.filter(function (it) { return it.k === 'custom'; });
    else if (tab === 'favs') pool = pool.filter(function (it) { return isFav(it.x.name); });
    results = pool.filter(function (it) {
      const hay = (it.x.name + ' ' + lname(it.x) + ' ' + (it.x.category || '') + ' ' + ldesc(it.x)).toLowerCase();
      return hasSep ? terms.some(function (w) { return hay.indexOf(w) !== -1; })
                    : terms.every(function (w) { return hay.indexOf(w) !== -1; });
    });
    if (q) results.sort(function (a, b) {
      const pa = lname(a.x).toLowerCase().indexOf(q) === 0 ? 0 : 1;
      const pb = lname(b.x).toLowerCase().indexOf(q) === 0 ? 0 : 1;
      return pa - pb || lname(a.x).localeCompare(lname(b.x));
    });
    idx = Math.min(idx, Math.max(0, results.length - 1));
  }

  function renderTabs() {
    const tb = panel.querySelector('#mgp-tabs');
    const tabs = ['all', 'skills', 'agents', 'teams', 'custom', 'favs'];
    tb.innerHTML = tabs.map(function (t) {
      return '<button class="mgp-tab' + (tab === t ? ' on' : '') + '" data-t="' + t + '">' + T().tabs[t] + '</button>';
    }).join('');
    tb.querySelectorAll('.mgp-tab').forEach(function (b) {
      b.onclick = function () { tab = b.dataset.t; idx = 0; renderTabs(); render(); };
    });
  }

  function renderSelRow() {
    const row = panel.querySelector('#mgp-selrow');
    if (!sel.length) { row.innerHTML = ''; return; }
    row.innerHTML = '<span id="mgp-seln">' + sel.length + ' ' + T().selected + '</span>' +
      '<button id="mgp-compose">' + T().compose.replace('{n}', sel.length) + '</button>';
    row.querySelector('#mgp-compose').onclick = function () {
      const items = sel.map(function (n) { return ALL().find(function (it) { return it.x.name === n; }); }).filter(Boolean);
      const where = insertText(buildCombo(items));
      flash(row, where === 'editor' ? T().injected : T().copied);
    };
  }

  function render() {
    compute();
    const list = panel.querySelector('#mgp-list');
    const C = cat();
    if (!results.length) {
      if (!C.skills.length && ensureCatalog(render)) return;
      list.innerHTML = '<div id="mgp-void">' + (C.skills.length ? T().noResults : T().empty) + '</div>';
    } else {
      list.innerHTML = results.map(function (it, i) {
        const fav = isFav(it.x.name);
        const ico = it.k === 'agent' ? '👤' : it.k === 'custom' ? '✍️' : it.k === 'team' ? '🕸' : '🛠';
        return '<div class="mgp-item k-' + it.k + (i === idx ? ' on' : '') + (sel.indexOf(it.x.name) !== -1 ? ' selc' : '') + '" data-i="' + i + '" data-n="' + it.x.name.replace(/"/g, '&quot;') + '">' +
          '<span class="ico">' + ico + '</span>' +
          '<span class="mid"><b>' + lname(it.x) + '</b><span class="d">' + ldesc(it.x).slice(0, 90) + '</span></span>' +
          (fav ? '<span class="fv">★</span>' : '') +
          '<button class="fb" title="★">' + (fav ? '★' : '☆') + '</button>' +
        '</div>';
      }).join('');
      list.querySelectorAll('.mgp-item').forEach(function (el) {
        const i = +el.dataset.i, it = results[i];
        el.onclick = function (ev) {
          if (ev.target.classList.contains('fb')) { toggleFav(it.x.name); render(); return; }
          if (ev.metaKey || ev.ctrlKey) {
            const n = it.x.name; const p = sel.indexOf(n);
            if (p >= 0) sel.splice(p, 1); else sel.push(n);
            renderSelRow(); render(); return;
          }
          activate(it, el);
        };
        el.oncontextmenu = function (ev) {
          ev.preventDefault(); hideTip();
          openCtx(el, it, ev.clientX, ev.clientY);
        };
        el.addEventListener('mouseenter', function () {
          clearTimeout(tipTimer);
          tipTimer = setTimeout(function () { showTip(el, it); }, 350);
        });
        el.addEventListener('mouseleave', function () {
          clearTimeout(tipTimer);
          setTimeout(function () { if (!tip.matches(':hover')) hideTip(); }, 120);
        });
      });
      const on = list.querySelector('.mgp-item.on');
      if (on) on.scrollIntoView({ block: 'nearest' });
    }
    panel.querySelector('#mgp-n').textContent = T().count(results.length);
  }

  function activate(it, el) {
    const p = promptOf(it);
    const where = insertText(p);
    if (el) flash(el, where === 'editor' ? T().injected : T().copied);
  }

  function flash(el, msg) {
    const old = el.innerHTML;
    el.style.borderColor = '#14f195';
    const d = document.createElement('div');
    d.style.cssText = 'font-size:11px;color:#14f195;margin-top:5px;font-weight:600';
    d.textContent = msg;
    el.appendChild(d);
    setTimeout(function () { el.innerHTML = old; el.style.borderColor = ''; }, 1400);
  }

  function renderCounts() {
    const C = cat();
    panel.querySelector('#mgp-counts').textContent = C.skills.length + ' skills · ' + C.agents.length + ' agents';
  }

  // ── Modal ✍️ ───────────────────────────────────────────────────────────────
  let editing = null;
  function openModal(c) {
    editing = c ? c.name : null;
    panel.querySelector('#mgp-e-name').value = c ? c.name : '';
    panel.querySelector('#mgp-e-txt').value = c ? (c.desc || '') : '';
    panel.querySelector('#mgp-e-del').style.display = c ? '' : 'none';
    panel.querySelector('#mgp-modal').classList.add('open');
    panel.querySelector('#mgp-e-name').focus();
  }
  function closeModal() { panel.querySelector('#mgp-modal').classList.remove('open'); }
  panel.querySelector('#mgp-e-save').onclick = function () {
    const name = panel.querySelector('#mgp-e-name').value.trim();
    const desc = panel.querySelector('#mgp-e-txt').value.trim();
    if (!name || !desc) return;
    const cs = customs();
    const i = cs.findIndex(function (c) { return c.name === name; });
    if (i >= 0) cs[i] = { name: name, desc: desc }; else cs.push({ name: name, desc: desc });
    store.set('customs', cs);
    closeModal(); render();
  };
  panel.querySelector('#mgp-e-del').onclick = function () {
    if (!editing) return;
    store.set('customs', customs().filter(function (c) { return c.name !== editing; }));
    closeModal(); render();
  };
  panel.querySelector('#mgp-e-x').onclick = closeModal;
  panel.querySelector('#mgp-modal').addEventListener('click', function (e) { if (e.target.id === 'mgp-modal') closeModal(); });
  panel.querySelector('#mgp-e-txt').addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') panel.querySelector('#mgp-e-save').onclick();
  });

  // ── Ouverture / fermeture + clavier (aligné Luxe) ──────────────────────────
  function openPanel() { panel.classList.add('open'); renderCounts(); renderTabs(); renderSelRow(); renderLlmBtn(); render(); panel.querySelector('#mgp-q').focus(); }
  // Raccourcis favoris ⌘1-9 : injecte les 9 premiers favoris (option ⚙)
  document.addEventListener('keydown', function (e) {
    if (!panel.classList.contains('open')) return; // comme l'app : ⚡ ouvert
    if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
    const n = parseInt(e.key, 10);
    if (!n || n < 1 || n > 9) return;
    if (!store.get('favShortcuts', true)) return;
    const f = favs();
    if (n > f.length) return;
    const it = ALL().find(function (x) { return x.x.name === f[n - 1]; });
    if (!it) return;
    e.preventDefault();
    activate(it, null);
    flash(btn, '⌘' + n + ' → ' + lname(it.x));
  });
  function closePanel() { panel.classList.remove('open'); }
  // 🔴 fermer = ferme le panneau · 🟡 réduire = replie vers la barre titre · 🟢 élargir = cycle de tailles
  panel.querySelector('.l-close').onclick = closePanel;
  panel.querySelector('.l-min').onclick = function () {
    panel.classList.toggle('min');
    store.set('minimized', panel.classList.contains('min'));
  };
  if (store.get('minimized', false)) panel.classList.add('min');
  const SIZES = [[420, '74vh'], [560, '80vh'], [680, '90vh'], [420, '74vh']];
  let sizeIdx = store.get('sizeIdx', 0);
  panel.querySelector('.l-max').onclick = function () {
    sizeIdx = (sizeIdx + 1) % (SIZES.length - 1);
    store.set('sizeIdx', sizeIdx);
    panel.style.width = SIZES[sizeIdx][0] + 'px';
    panel.style.height = SIZES[sizeIdx][1];
  };
  if (sizeIdx > 0) { panel.style.width = SIZES[sizeIdx][0] + 'px'; panel.style.height = SIZES[sizeIdx][1]; }
  // ── Déplacement : glisser la barre titre ──────────────────────────────────
  (function () {
    const bar = panel.querySelector('#mgp-macbar');
    let sx = 0, sy = 0, sl = null, st = null, dragging = false;
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return; // les boutons restent cliquables
      const r = panel.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top; dragging = true;
      panel.style.left = r.left + 'px'; panel.style.top = r.top + 'px';
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      const l = Math.max(4, Math.min(e.clientX - sx + sl, window.innerWidth - 60));
      const t = Math.max(4, Math.min(e.clientY - sy + st, window.innerHeight - 40));
      panel.style.left = l + 'px'; panel.style.top = t + 'px';
    });
    bar.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      const r = panel.getBoundingClientRect();
      store.set('pos', { left: r.left, top: r.top });
    });
    const pos = store.get('pos', null);
    if (pos && pos.left != null) { panel.style.left = pos.left + 'px'; panel.style.top = pos.top + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto'; }
  })();
  // ── Redimensionnement : poignée en haut à gauche (la fenêtre s'ouvre vers le bas-droite) ──
  (function () {
    const h = document.createElement('div'); h.id = 'mgp-rsz'; panel.appendChild(h);
    let sx = 0, sy = 0, sw = 0, sh = 0, rs = false;
    h.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      const r = panel.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; sw = r.width; sh = r.height; rs = true;
      h.setPointerCapture(e.pointerId);
    });
    h.addEventListener('pointermove', function (e) {
      if (!rs) return;
      const w = Math.max(320, Math.min(sw + (sx - e.clientX), window.innerWidth - 24));
      const ht = Math.max(220, Math.min(sh + (sy - e.clientY), window.innerHeight - 24));
      panel.style.width = w + 'px'; panel.style.height = ht + 'px';
    });
    h.addEventListener('pointerup', function () { if (rs) { rs = false; store.set('customSize', { w: panel.offsetWidth, h: panel.offsetHeight }); } });
    const cs = store.get('customSize', null);
    if (cs) { panel.style.width = cs.w + 'px'; panel.style.height = cs.h + 'px'; }
  })();
  // ── Réglages (⚙) — même panneau que l'app macOS ──────────────────────────
  const sendTargets = () => store.get('sendTargets', ['claude', 'chatgpt']);
  function theme() { return store.get('theme', 'dark'); }
  function isLight() { return theme() === 'light'; }
  function applyTheme() {
    panel.classList.toggle('light', isLight());
    document.body.classList.toggle('mgp-light', isLight());
  }
  function dlMd(name, txt, mime) {
    const b = new Blob([txt], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function buildSetDlg() {
    const dlg = panel.querySelector('#mgp-setdlg');
    const cur = defaultLLM();
    const tgts = sendTargets();
    const opts = LLMS.concat(['clipboard']).map(function (t) {
      const lb = t === 'clipboard' ? T().clipboard : (LLM_LABEL[t] || t);
      return '<option value="' + t + '"' + (t === cur ? ' selected' : '') + '>' + lb + '</option>';
    }).join('');
    dlg.innerHTML =
      '<span class="sttl">' + T().setTitle + '</span>' +
      '<span class="shint">' + (LANG === 'fr' ? 'Catalogue : ' : 'Catalog: ') + cat().skills.length + ' skills · ' + cat().agents.length + ' ' + T().agentsN + ' — ' + (LANG === 'fr' ? 'tout est enregistré automatiquement' : 'everything is saved automatically') + '</span>' +
      '<div class="row"><b>' + T().setTheme + '<span class="d">' + T().setThemeD + '</span></b>' +
        '<select id="mgp-s-theme"><option value="dark">🌙 ' + (LANG === 'fr' ? 'Sombre' : 'Dark') + '</option><option value="light"' + (isLight() ? ' selected' : '') + '>☀️ ' + (LANG === 'fr' ? 'Clair' : 'Light') + '</option></select></div>' +
      '<div class="row"><b>' + T().setLang + '<span class="d">' + T().setLangD + '</span></b>' +
        '<select id="mgp-s-lang"><option value="fr">🇫🇷 Français</option><option value="en"' + (LANG === 'en' ? ' selected' : '') + '>🇬🇧 English</option></select></div>' +
      '<div class="row"><b>' + T().setLlm + '<span class="d">' + T().setLlmD + '</span></b>' +
        '<select id="mgp-s-llm">' + opts + '</select></div>' +
      '<div class="row col"><b>' + T().setSend + '</b><span class="hint">' + T().setSendHint + '</span>' +
        '<span class="chips" id="mgp-s-send">' +
        LLMS.concat(['clipboard']).map(function (t) {
          const lb = t === 'clipboard' ? '⧉ ' + T().clipboard : (LLM_LABEL[t] || t);
          return '<button data-t="' + t + '" class="' + (tgts.indexOf(t) >= 0 ? 'on' : '') + '">' + lb + '</button>';
        }).join('') +
      '</span></div>' +
      '<div class="row"><b>' + T().setFsc + '<span class="d">' + T().setFscD + '</span></b>' +
        '<input type="checkbox" id="mgp-s-fsc" style="width:17px;height:17px;accent-color:#9945ff"' + (store.get('favShortcuts', true) ? ' checked' : '') + '></div>' +
      '<div class="row"><b>' + T().setCfg + '<span class="d">' + T().setCfgD + '</span></b>' +
        '<span style="display:flex;gap:6px"><button class="btn" id="mgp-s-exp">' + T().setExport + '</button><button class="btn" id="mgp-s-imp">' + T().setImport + '</button></span></div>' +
      '<div class="row"><b>' + T().setXp + '<span class="d">' + T().setXpD + '</span></b>' +
        '<button class="btn" id="mgp-s-xp">' + T().setXpBtn + '</button></div>' +
      '<div class="srow"><button class="btn" id="mgp-s-close">' + T().setClose + '</button><button class="btn prim" id="mgp-s-done">' + T().setDone + '</button></div>' +
      '<span class="sfoot">⚙ ' + (LANG === 'fr' ? 'Stockage local du site — rien n\'est envoyé en ligne' : 'Local site storage — nothing is sent online') + '</span>';
    dlg.querySelector('#mgp-s-theme').onchange = function (e) { store.set('theme', e.target.value); applyTheme(); };
    dlg.querySelector('#mgp-s-lang').onchange = function (e) { LANG = e.target.value; store.set('lang', LANG); applyLang(); buildSetDlg(); };
    dlg.querySelector('#mgp-s-llm').onchange = function (e) { store.set('defaultLLM', e.target.value); renderLlmBtn(); };
    dlg.querySelectorAll('#mgp-s-send button').forEach(function (b) {
      b.onclick = function () {
        const arr = sendTargets(); const p = arr.indexOf(b.dataset.t);
        if (p >= 0) arr.splice(p, 1); else arr.push(b.dataset.t);
        store.set('sendTargets', arr);
        buildSetDlg();
      };
    });
    dlg.querySelector('#mgp-s-fsc').onchange = function (e) { store.set('favShortcuts', e.target.checked); };
    dlg.querySelector('#mgp-s-exp').onclick = function () {
      dlMd('megapack-config.json', JSON.stringify({
        version: 1, favs: favs(), customs: customs(), teams: teams(),
        defaultLLM: defaultLLM(), sendTargets: sendTargets(),
        favShortcuts: store.get('favShortcuts', true), theme: theme(), lang: LANG,
      }, null, 2), 'application/json');
    };
    dlg.querySelector('#mgp-s-imp').onclick = function () {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = function () {
        const f = inp.files[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = function () {
          try {
            const j = JSON.parse(rd.result);
            if (Array.isArray(j.favs)) store.set('favs', j.favs);
            if (Array.isArray(j.customs)) store.set('customs', j.customs);
            if (Array.isArray(j.teams)) store.set('teams', j.teams);
            if (typeof j.defaultLLM === 'string') store.set('defaultLLM', j.defaultLLM);
            if (Array.isArray(j.sendTargets)) store.set('sendTargets', j.sendTargets);
            if (typeof j.favShortcuts === 'boolean') store.set('favShortcuts', j.favShortcuts);
            if (j.theme === 'light' || j.theme === 'dark') { store.set('theme', j.theme); applyTheme(); }
            if (j.lang === 'fr' || j.lang === 'en') { LANG = j.lang; store.set('lang', LANG); applyLang(); }
            renderLlmBtn(); buildSetDlg(); flash(dlg, T().setImported);
          } catch (e) { flash(dlg, T().setImportErr); }
        };
        rd.readAsText(f);
      };
      inp.click();
    };
    dlg.querySelector('#mgp-s-xp').onclick = function () {
      const cs = customs();
      if (!cs.length) { flash(dlg, T().setXpNone); return; }
      const md = '# Mes prompts ✍️ — MEGA PACK\n\n' + cs.map(function (c) {
        return '## ' + c.name + '\n\n' + (c.desc || '') + '\n';
      }).join('\n');
      dlMd('mes-prompts-megapack.md', md, 'text/markdown;charset=utf-8');
    };
    dlg.querySelector('#mgp-s-close').onclick = function () { dlg.classList.remove('open'); };
    dlg.querySelector('#mgp-s-done').onclick = function () { dlg.classList.remove('open'); flash(panel.querySelector('#mgp-set'), T().saved); };
  }
  panel.querySelector('#mgp-set').onclick = function () {
    const dlg = panel.querySelector('#mgp-setdlg');
    if (dlg.classList.contains('open')) { dlg.classList.remove('open'); return; }
    buildSetDlg();
    dlg.classList.add('open');
  };

  // ── 🎓 Visite guidée (alignée app : 7 étapes, surbrillance, relançable) ──
  function tourSteps() {
    const fr = LANG === 'fr';
    return [
      { title: fr ? '⚡ Bienvenue !' : '⚡ Welcome!', desc: fr ? '321 experts prêts à l\'emploi : 131 skills 🛠 et 190 agents 👤. Tape quelques lettres : la liste filtre instantanément.' : '321 ready-to-use experts: 131 skills 🛠 and 190 agents 👤. Type a few letters: the list filters instantly.', help: fr ? '💡 ↑↓ naviguent, ⏎ injecte dans la conversation.' : '💡 ↑↓ navigate, ⏎ injects into the conversation.', target: null },
      { title: fr ? '🗂 Les onglets' : '🗂 Tabs', desc: fr ? 'Tout, Skills, Agents, 🕸 Équipes, ✍️ Perso, ★ Favoris : chaque clic filtre le catalogue.' : 'All, Skills, Agents, 🕸 Teams, ✍️ Custom, ★ Favorites: each click filters the catalog.', help: fr ? '💡 ⌘-clic sélectionne plusieurs experts pour les composer ensemble (⌥⏎).' : '💡 ⌘-click selects several experts to compose them together (⌥⏎).', target: 'mgp-tabs' },
      { title: fr ? '⌨ Le LLM par défaut' : '⌨ The default LLM', desc: fr ? 'En bas, le bouton « ⌨ LLM » choisit la destination par défaut : Claude, ChatGPT, Perplexity… (règlable aussi dans ⚙).' : 'At the bottom, the « ⌨ LLM » button picks the default destination: Claude, ChatGPT, Perplexity… (also in ⚙).', help: fr ? '💡 ⌘⏎ envoie vers ce LLM · ⇧⏎ force ChatGPT.' : '💡 ⌘⏎ sends there · ⇧⏎ forces ChatGPT.', target: 'mgp-foot' },
      { title: fr ? '🖱 Le clic droit' : '🖱 Right-click', desc: fr ? 'Clic droit sur un expert : Envoyer à (tes destinations ⚙), ⧉ copier, ★ favori, presse-papiers.' : 'Right-click an expert: Send to (your ⚙ destinations), ⧉ copy, ★ favorite, clipboard.', help: fr ? '💡 Les destinations se choisissent dans ⚙ Réglages.' : '💡 Pick destinations in ⚙ Settings.', target: 'mgp-list' },
      { title: fr ? '★ Favoris & ⌘1-9' : '★ Favorites & ⌘1-9', desc: fr ? '★ sur une ligne = favori. Avec le panneau ouvert, ⌘1 à ⌘9 injectent tes 9 premiers favoris (option ⚙).' : '★ on a row = favorite. With the panel open, ⌘1-⌘9 inject your first 9 favorites (⚙ option).', help: fr ? '💡 La fenêtre se déplace (barre titre), se redimensionne (poignée) et se replie (🟡).' : '💡 The window drags (title bar), resizes (handle) and collapses (🟡).', target: 'mgp-newp' },
      { title: fr ? '⚙ Réglages complets' : '⚙ Full settings', desc: fr ? 'Thème clair/sombre, langue, LLM par défaut, destinations, export/import de ta config, export ✍️ en .md — comme l\'app macOS.' : 'Light/dark theme, language, default LLM, destinations, config export/import, ✍️ .md export — like the macOS app.', help: fr ? '💡 Tout est local : rien n\'est envoyé en ligne.' : '💡 Everything is local: nothing is sent online.', target: 'mgp-set' },
      { title: fr ? '✅ Tu sais tout !' : '✅ You are all set!', desc: fr ? 'Ctrl+Shift+K ouvre le panneau depuis n\'importe quelle page. Clic droit sur un expert pour l\'envoyer vers un LLM. Bonne exploration ! ⚡' : 'Ctrl+Shift+K opens the panel on any page. Right-click an expert to send it to an LLM. Happy exploring! ⚡', help: '', target: null },
    ];
  }
  let TOUR_I = 0;
  const TOUR_SEEN_KEY = 'tour.done';
  function tourShow(i) {
    const steps = tourSteps();
    TOUR_I = Math.max(0, Math.min(i, steps.length - 1));
    const st = steps[TOUR_I];
    tour.querySelector('.tstepnum').textContent = T().tourStepN(TOUR_I + 1, steps.length);
    tour.querySelector('h3').textContent = st.title;
    tour.querySelector('p').textContent = st.desc;
    tour.querySelector('.thelp').textContent = st.help || '';
    tour.querySelector('.dots').innerHTML = steps.map(function (_, j) { return '<i class="' + (j === TOUR_I ? 'on' : '') + '"></i>'; }).join('');
    tour.querySelector('.tpri').textContent = TOUR_I === steps.length - 1 ? T().tourDone : T().tourNext;
    tour.querySelector('.tskip').textContent = T().tourSkip;
    tour.classList.add('open');
    const card = tour.querySelector('#mgp-tourcard');
    card.style.left = Math.max(10, Math.min(window.innerWidth - 350, window.innerWidth / 2 - 165)) + 'px';
    card.style.top = Math.max(10, window.innerHeight / 2 - 120) + 'px';
    document.querySelectorAll('.mgp-tour-hl').forEach(function (n) { n.classList.remove('mgp-tour-hl'); });
    const el = st.target ? panel.querySelector('#' + st.target) : null;
    if (el && panel.classList.contains('open')) el.classList.add('mgp-tour-hl');
  }
  function tourAdvance() { if (TOUR_I >= tourSteps().length - 1) return tourEnd(); tourShow(TOUR_I + 1); }
  function tourEnd() {
    tour.classList.remove('open');
    document.querySelectorAll('.mgp-tour-hl').forEach(function (n) { n.classList.remove('mgp-tour-hl'); });
    store.set('tour.done', true);
  }
  tour.querySelector('.tpri').onclick = tourAdvance;
  tour.querySelector('.tskip').onclick = tourEnd;
  tour.addEventListener('click', function (e) { if (e.target === tour) tourEnd(); });
  document.addEventListener('keydown', function (e) {
    if (!tour.classList.contains('open')) return;
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); tourAdvance(); }
  });
  function tourMaybeStart() {
    if (!store.get('tour.done', false)) {
      panel.classList.add('open');
      renderCounts(); renderTabs(); renderLlmBtn(); render();
      tourShow(0);
    }
  }
  if (store.get('tour.done', false) === false) setTimeout(tourMaybeStart, 500);
  // Rangée 🎓 dans ⚙ — relance
  const tourRow = function () {
    return '<div class="row"><b>' + T().setTour + '<span class="d">' + T().setTourD + '</span></b>' +
      '<button class="btn" id="mgp-s-tour">▶ ' + T().setTourBtn + '</button></div>';
  };
  const _buildSetDlg = buildSetDlg;
  buildSetDlg = function () {
    _buildSetDlg();
    const dlg = panel.querySelector('#mgp-setdlg');
    dlg.querySelector('.row:nth-of-type(6)').insertAdjacentHTML('afterend', tourRow());
    dlg.querySelector('#mgp-s-tour').onclick = function () {
      dlg.classList.remove('open');
      tourShow(0);
    };
  };
  btn.onclick = function () { panel.classList.contains('open') ? closePanel() : openPanel(); };
  panel.querySelector('#mgp-newp').onclick = function () { openModal(null); };
  panel.querySelector('#mgp-q').oninput = function (e) { q = e.target.value; idx = 0; render(); };

  document.addEventListener('keydown', function (e) {
    if (!panel.classList.contains('open')) {
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === ',') { return; }
    const modalOpen = panel.querySelector('#mgp-modal').classList.contains('open');
    if (modalOpen) { if (e.key === 'Escape') closeModal(); return; }
    const inModal = e.target.closest && e.target.closest('#mgp-mbox');
    if (inModal) return;
    if (e.key === 'Escape') { closePanel(); e.preventDefault(); return; }
    if (e.target !== panel.querySelector('#mgp-q')) return; // le clavier global reste dispo ailleurs
    if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, results.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); render(); }
    else if (e.key === 'Home') { e.preventDefault(); idx = 0; render(); }
    else if (e.key === 'End') { e.preventDefault(); idx = results.length - 1; render(); }
    else if (e.key === 'PageDown') { e.preventDefault(); idx = Math.min(idx + 10, results.length - 1); render(); }
    else if (e.key === 'PageUp') { e.preventDefault(); idx = Math.max(idx - 10, 0); render(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const it = results[idx];
      if (!it) return;
      if (e.metaKey || e.ctrlKey) openLLM(defaultLLM(), promptOf(it));
      else if (e.shiftKey) openLLM('chatgpt', promptOf(it));
      else if (e.altKey && sel.length) {
        const items = sel.map(function (n) { return ALL().find(function (x) { return x.x.name === n; }); }).filter(Boolean);
        insertText(buildCombo(items));
      }
      else activate(it);
    }
  });

  // Raccourci global d'ouverture : Ctrl+Shift+K
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      btn.click();
    }
  });

  // ── Bascule FR/EN (persistée) ──────────────────────────────────────────────
  function applyLang() {
    btn.title = T().btnTitle;
    panel.querySelector('#mgp-q').placeholder = T().search;
    panel.querySelector('#mgp-lang').textContent = LANG.toUpperCase();
    panel.querySelector('#mgp-foot span:nth-child(2)').textContent = T().foot;
    if (panel.classList.contains('open')) { renderCounts(); renderTabs(); renderLlmBtn(); render(); }
  }
  panel.querySelector('#mgp-lang').onclick = function () {
    LANG = LANG === 'fr' ? 'en' : 'fr';
    store.set('lang', LANG);
    applyLang();
  };

  // ── Injection CSS + DOM ────────────────────────────────────────────────────
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);
  document.body.appendChild(btn);
  document.body.appendChild(panel);
  document.body.appendChild(tip);
  document.body.appendChild(ctx);
  document.body.appendChild(tour);
  applyTheme();
  applyLang();
})();
