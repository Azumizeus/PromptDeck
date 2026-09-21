# 📚 Guide Complet des Commandes, Agents et Skills

> **Dernière mise à jour :** 19 septembre 2026
> **Total :** 131 skills et 190 agents disponibles (mega pack)

---

## 📋 Table des matières

1. [Skills OpenCode (131)](#skills-opencode)
2. [Agent Personas Claude Desktop (190)](#agent-personas)
3. [Slash Commands (9)](#slash-commands)
4. [Mapping Intention → Skill](#mapping-intention)
5. [Exemples d'utilisation](#exemples)

---

## 🛠️ Skills OpenCode {#skills-opencode}

### Skills de base (agent-skills)

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `spec-driven-development` | Spécification avant code | Nouveau projet, fonctionnalité |
| `planning-and-task-breakdown` | Découpage en tâches | Planification |
| `incremental-implementation` | Implémentation incrémentale | Tout changement > 1 fichier |
| `test-driven-development` | TDD red-green-refactor | Logique, bugs |
| `code-review-and-quality` | Revue sur 5 axes | Avant merge |
| `code-simplification` | Simplification du code | Code complexe |
| `debugging-and-error-recovery` | Débogage systématique | Tests échoués, bugs |
| `security-and-hardening` | Sécurité OWASP | Input utilisateur, auth |
| `performance-optimization` | Optimisation perf | Core Web Vitals, requêtes |
| `api-and-interface-design` | Conception d'APIs | Design API |
| `frontend-ui-engineering` | UI/UX production | Interfaces utilisateur |
| `context-engineering` | Optimisation contexte agent | Début de session |
| `source-driven-development` | Basé sur docs officielles | Frameworks |
| `doubt-driven-development` | Revue adversariale | Décisions critiques |
| `git-workflow-and-versioning` | Git trunk-based | Tout changement |
| `ci-cd-and-automation` | Pipelines CI/CD | Build/deploy |
| `deprecation-and-migration` | Dépréciation | Suppression d'APIs |
| `documentation-and-adrs` | Documentation | Décisions archi |
| `observability-and-instrumentation` | Observabilité | Logging, métriques |
| `shipping-and-launch` | Mise en production | Déploiement |
| `constraint-driven-development` | Barre qualité | Standards |
| `idea-refine` | Structuration d'idées | Idées vagues |
| `interview-me` | Extraction besoins | Requirements floues |
| `using-agent-skills` | Découvre quel skill | Début de session |

---

### Skills Blockchain/Solana (C:\agents_skills)

#### QuickNode

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `quicknode-skill` | Infrastructure QuickNode (80+ chaînes, RPC, Streams, Webhooks, IPFS) | Intégration blockchain multi-chaîne |

#### Jupiter (DEX)

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `integrating-jupiter` | Intégration Jupiter Suite (swaps, DCA, limit orders, perps) | DéFi, échange de tokens |
| `jupiter-lend` | Jupiter Lend (prêts, emprunts, vaults, jlTokens) | Protocole de lending |
| `jupiter-vrfd` | Vérification de tokens Jupiter | Soumettre demandes de vérification |
| `jupiter-swap-migration` | Migration vers Swap API v2 | Metis/Ultra → v2 |

#### Light Protocol (Rent-free)

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `light-sdk` | SDK Solana avec tokens/PDAs 200x moins chers | Développement Solana optimisé |
| `light-token-client` | Client Light Token (create, transfer, burn, etc.) | Gestion de tokens |
| `payments` | Paiements via Light Token API | Transactions sponsorisées |
| `data-streaming` | Streaming Laserstream gRPC | État en temps réel |
| `token-distribution` | Distribution de tokens 5000x moins chère | Airdrops |
| `zk-nullifier` | Programmes ZK personnalisés | Privacy |
| `solana-compression` | État compressé (~160x moins cher) | Scalabilité |
| `testing` | Tests Light Protocol | Localnet/devnet |
| `ask-mcp` | Q&A IA sur Light SDK | Assistance |
| `agent-dev-orchestrator` | Orchestrateur | Cas non couverts |

#### Metaplex (NFT/Tokens)

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `metaplex` | Infra NFT/tokens Solana (Agent Registry, Genesis, Core, Token Metadata, Bubblegum, Candy Machine) | Création NFT/tokens |

#### Solana Anchor

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `solana-anchor-claude-skill` | Guide Anchor/Rust 2026 (best practices, anti-patterns) | Programmes Anchor |

#### Solana Development (Solana Foundation)

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `solana-dev-skill` | Développement Solana complet (UI, SDK, Programmes, Testing, Codegen, Sécurité) | Stack Solana complet |

#### Solana Development (tenequm - 34 skills)

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `solana-development` | Développement Solana Anchor + native Rust | Programmes Solana |
| `solana-compression` | ZK Compression Light Protocol | Scalabilité |
| `solana-security` | Audits de sécurité Solana | Sécurité |
| `foundry-solidity` | Ethereum Foundry/Solidity | Smart contracts EVM |
| `react-typescript` | React 19 + TypeScript | Frontend |
| `shadcn-tailwind` | shadcn/ui + Tailwind | UI components |
| `tanstack` | TanStack Router/Query | Data loading |
| `vite` | Vite bundler | Build tool |
| `rust-dev` | Rust async/traits/errors | Rust |
| `go-dev` | Go testing/linting | Go |
| `python-dev` | Python pytest/ruff/uv | Python |
| `effect-ts` | Effect TypeScript | FP patterns |
| `swift-macos` | Swift/macOS/Vision Pro | Apple |
| `biome` | Biome linter | Linting |
| `gh-cli` | GitHub CLI | Git/GitHub |
| `cloudflare-workers` | Cloudflare Workers | Edge computing |
| `chrome-extension-wxt` | Chrome Extension WXT | Extensions |
| `x402` | Paiements internet-natifs | Micropaiements |
| `erc-8004` | Identité on-chain agent | Agents IA |
| `mpp` | Machine Payments Protocol | Paiements machines |
| `privy-integration` | Auth + wallets Privy | Auth Web3 |
| `deep-research-surf` | Recherche approfondie | Recherche web |
| `last30days-surf` | Tendances 30 derniers jours | Veille |
| `impactful-writing` | Écriture percutante | Contenu |
| `founder-playbook` | Playbook fondateur | Startup |
| `standard-readme` | README standard | Documentation |
| `command-skill-creator` | Créateur de skills | Développement skills |
| `skills-best-practices` | Best practices skills | Création skills |
| `openclaw-ref` | Référence OpenClaw | OpenClaw |
| `mcp-best-practices` | Best practices MCP | Serveurs MCP |
| `polish` | Revue de code avancée | Qualité code |
| `review-github-pr` | Revue PR GitHub | Pull requests |
| `audio-quality-check` | Vérification audio | Audio |

#### Solana Game Skill

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `solana-game-skill` | Jeux vidéo Solana (Unity, React Native, PlaySolana, paiements, testing) | Game dev Solana |

#### Protocoles Solana (solana-protocols — 46 skills, dédupliqués)

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `jupiter` | Jupiter APIs : Ultra Swap, Lend, Perps, Trigger, Recurring, Price, Portfolio, Send | Intégration DeFi Jupiter |
| `helius` | RPC Helius, API enhanced, webhooks, DAS API | RPC et indexation |
| `quicknode` | QuickNode RPC, add-ons, streams | Infrastructure RPC |
| `metaplex` | NFT/tokens Metaplex (frais digests + docs officielles) | NFT/tokens |
| `pyth` | Oracles Pyth : price feeds, Hermes | Prix on-chain/off-chain |
| `light-protocol` | ZK compression, état rent-free | Compressed accounts |
| `solana-kit` | @solana/kit (web3.js v3) | Nouveau code client |
| `solana-kit-migration` | Migration web3.js → @solana/kit | Upgrade client |
| `solana-agent-kit` | SendAI Agent Kit | Agents IA on-chain |
| `surfpool` | Devnet forké sur état mainnet | Tests réalistes |
| `vulnhunter` | Audit sécurité programmes | Review avant deploy |
| `svm` | Solana Virtual Machine | Rollups/forks SVM |
| `pinocchio-development` | Framework Pinocchio minimaliste | Programmes Rust légers |
| `arcium` | Calcul chiffré on-chain | Confidentialité |
| `inco` | Inco confidential computing | Confidentialité |
| `switchboard` | Oracles + VRF | Randomness on-chain |
| `birdeye` | Market data, trading API | Données de marché |
| `coingecko` | API CoinGecko | Prix et stats |
| `meteora` | DLMM, vaults | Liquidité dynamique |
| `orca` | Whirlpools AMM concentré | Pools de liquidité |
| `raydium` | AMM v4/CPMM | Swaps, pools |
| `phoenix` | Orderbook spot | Trading on-chain |
| `manifest` | DEX spot | Trading |
| `kamino` | Lending, vaults | Lending |
| `marginfi` | Lending, marge | Protocoles de marge |
| `lulo` | Flexlend yield | Yield lending |
| `sanctum` | LST, stake pools | Liquid staking |
| `squads` | Multisig/MPC | Gouvernance trésorerie |
| `pumpfun` | Launchpad tokens | Lancement token |
| `debridge` | Bridge cross-chain | Transferts inter-chaînes |
| `lifi` | Routage cross-chain | Agrégation bridges |
| `magicblock` | Rollups éphémères, ERN | Jeux on-chain temps réel |
| `phantom-connect` | Connexion wallet Phantom | Connexion wallet |
| `phantom-wallet-mcp` | Phantom via MCP | Agents avec wallet |
| `wallet-analysis` | Analyse wallets, clusters, flows | Investigation on-chain |
| `dflow` | Order flow | Flow de paiement trading |
| `lavarage` | Trading à levier | Perpslévrier |
| `ranger-finance` | Perps | Trading à marge |
| `carbium` | Trading | DEX |
| `ct-alpha` | Signaux trading | Veille marché |
| `glam` | Gestion d'actifs on-chain | Asset management |
| `helius-dflow` | Staking flow | Staking |
| `helius-phantom` | Intégration Helius/Phantom | Wallet + RPC |
| `metengine` | Mint engines | Émission de tokens |
| `sol-incinerator` | Burn tokens/rent | Nettoyage on-chain |
| `zz-code-recon` | Reconnaissance de code | Audit de code |

> **Déduplication :** ces 46 skills étaient dupliqués 6× dans les packs sources
> (helius, light-protocol, pyth-skill, solana-kit, surfpool, vulnhunter — md5 identiques).
> Une seule copie est conservée dans `skills/solana-protocols/`.

#### Game Design (game-design — 7 skills)

| Skill | Description | Quand l'utiliser |
|-------|-------------|------------------|
| `seeker-strike-mobile` | Conventions mobile/Solana Seeker Strike (Canvas 2D, WebView, SKR/GC) | Mobile Solana game |
| `game-audio-direction` | Identité musicale, boucles, mixage, prompts audio | Bande-son de jeu |
| `motion-design-system` | Motion UI, transitions, feedback, orchestration | Transitions et juice |
| `pixel-art-audio-direction` | Direction pixel art + audio cohérente | Préproduction pixel art |
| `pixel-art-palette-discipline` | Palette, grille, contraste, mise à l'échelle | Assets pixel art |
| `visual-design-premium` | Direction visuelle premium accessible | UI premium |
| `visual-rendering-game-feel` | Bloom, densité pixels, lumière, feedback d'impact | Rendu 2D, game feel |

---

## 👥 Agent Personas Claude Desktop {#agent-personas}

### Core (4)

| Persona | Rôle | Description |
|---------|------|-------------|
| `code-reviewer` | Staff Engineer Senior | Revue 5 axes (correctness, lisibilité, archi, sécurité, perf) |
| `security-auditor` | Ingénieur Sécurité | Audit vulnérabilités, OWASP |
| `test-engineer` | Ingénieur QA | Stratégie test, couverture |
| `web-performance-auditor` | Ingénieur Perf Web | Core Web Vitals |

### Academic (5)

| Persona | Rôle |
|---------|------|
| `academic-anthropologist` | Anthropologue culturel |
| `academic-geographer` | Géographe |
| `academic-historian` | Historien |
| `academic-narratologist` | Narratologue |
| `academic-psychologist` | Psychologue |

### Design (8)

| Persona | Rôle |
|---------|------|
| `design-brand-guardian` | Stratège de marque |
| `design-image-prompt-engineer` | Ingénieur prompts images IA |
| `design-inclusive-visuals-specialist` | Spécialiste visuels inclusifs |
| `design-ui-designer` | Designer UI |
| `design-ux-architect` | Architecte UX |
| `design-ux-researcher` | Chercheur UX |
| `design-visual-storyteller` | Conteur visuel |
| `design-whimsy-injector` | Injecteur de personnalité |

### Engineering (29)

| Persona | Rôle |
|---------|------|
| `engineering-ai-data-remediation-engineer` | Pipelines auto-réparatrices |
| `engineering-ai-engineer` | ML/AI |
| `engineering-autonomous-optimization-architect` | Routage LLM |
| `engineering-backend-architect` | Architecture backend |
| `engineering-cms-developer` | WordPress/Drupal |
| `engineering-code-reviewer` | Revue de code |
| `engineering-codebase-onboarding-engineer` | Intégration codebase |
| `engineering-data-engineer` | Pipelines data |
| `engineering-database-optimizer` | Optimisation BDD |
| `engineering-devops-automator` | CI/CD |
| `engineering-email-intelligence-engineer` | Email parsing |
| `engineering-embedded-firmware-engineer` | Firmware embarqué |
| `engineering-feishu-integration-developer` | Intégration Feishu |
| `engineering-filament-optimization-specialist` | Filament PHP |
| `engineering-frontend-developer` | Frontend React/Vue |
| `engineering-git-workflow-master` | Git avancé |
| `engineering-incident-response-commander` | Gestion incidents |
| `engineering-minimal-change-engineer` | Changes minimaux |
| `engineering-mobile-app-builder` | Mobile iOS/Android |
| `engineering-rapid-prototyper` | Prototypage rapide |
| `engineering-security-engineer` | Sécurité applicative |
| `engineering-senior-developer` | Laravel/Livewire |
| `engineering-software-architect` | Architecture logicielle |
| `engineering-solidity-smart-contract-engineer` | Smart contracts Solidity |
| `engineering-sre` | SRE/Reliability |
| `engineering-technical-writer` | Documentation technique |
| `engineering-threat-detection-engineer` | Détection menaces |
| `engineering-voice-ai-integration-engineer` | Voice AI |
| `engineering-wechat-mini-program-developer` | WeChat Mini Programs |

### Finance (5)

| Persona | Rôle |
|---------|------|
| `finance-bookkeeper-controller` | Comptable |
| `finance-financial-analyst` | Analyste financier |
| `finance-fpa-analyst` | FP&A |
| `finance-investment-researcher` | Chercheur investissement |
| `finance-tax-strategist` | Stratège fiscal |

### Game Development (21)

> Ajouté : `tokenomics-designer` (économie de crypto-games).

| Persona | Rôle |
|---------|------|
| `game-audio-engineer` | Audio interactif |
| `game-designer` | Design de jeux |
| `level-designer` | Design de niveaux |
| `narrative-designer` | Narration |
| `technical-artist` | Artiste technique |
| `blender-addon-engineer` | Addons Blender |
| `godot-gameplay-scripter` | Gameplay Godot |
| `godot-multiplayer-engineer` | Multiplayer Godot |
| `godot-shader-developer` | Shaders Godot |
| `roblox-avatar-creator` | Avatar Roblox |
| `roblox-experience-designer` | Expérience Roblox |
| `roblox-systems-scripter` | Systèmes Roblox |
| `unity-architect` | Architecture Unity |
| `unity-editor-tool-developer` | Outils Unity Editor |
| `unity-multiplayer-engineer` | Multiplayer Unity |
| `unity-shader-graph-artist` | Shaders Unity |
| `unreal-multiplayer-architect` | Multiplayer Unreal |
| `unreal-systems-engineer` | Systèmes Unreal |
| `unreal-technical-artist` | Artiste technique Unreal |
| `unreal-world-builder` | Monde Unreal |

### Marketing (30)

| Persona | Rôle |
|---------|------|
| `marketing-agentic-search-optimizer` | SEO agent IA |
| `marketing-ai-citation-strategist` | Stratégie citations IA |
| `marketing-app-store-optimizer` | ASO |
| `marketing-baidu-seo-specialist` | SEO Baidu |
| `marketing-bilibili-content-strategist` | Bilibili |
| `marketing-book-co-author` | Co-auteur livre |
| `marketing-carousel-growth-engine` | Carrousels TikTok/Insta |
| `marketing-china-ecommerce-operator` | E-commerce Chine |
| `marketing-china-market-localization-strategist` | Localisation Chine |
| `marketing-content-creator` | Créateur de contenu |
| `marketing-cross-border-ecommerce` | E-commerce cross-border |
| `marketing-douyin-strategist` | Douyin |
| `marketing-growth-hacker` | Growth hacking |
| `marketing-instagram-curator` | Instagram |
| `marketing-kuaishou-strategist` | Kuaishou |
| `marketing-linkedin-content-creator` | LinkedIn |
| `marketing-livestream-commerce-coach` | Live commerce |
| `marketing-podcast-strategist` | Podcast |
| `marketing-private-domain-operator` | Domaine privé WeChat |
| `marketing-reddit-community-builder` | Reddit |
| `marketing-seo-specialist` | SEO |
| `marketing-short-video-editing-coach` | Montage vidéo |
| `marketing-social-media-strategist` | Social media |
| `marketing-tiktok-strategist` | TikTok |
| `marketing-twitter-engager` | Twitter/X |
| `marketing-video-optimization-specialist` | YouTube |
| `marketing-wechat-official-account` | WeChat OA |
| `marketing-weibo-strategist` | Weibo |
| `marketing-xiaohongshu-specialist` | Xiaohongshu |
| `marketing-zhihu-strategist` | Zhihu |

### Paid Media (7)

| Persona | Rôle |
|---------|------|
| `paid-media-auditor` | Audit comptes pub |
| `paid-media-creative-strategist` | Stratégie créa |
| `paid-media-paid-social-strategist` | Social ads |
| `paid-media-ppc-strategist` | PPC Google/Bing |
| `paid-media-programmatic-buyer` | Programmatique |
| `paid-media-search-query-analyst` | Analyse requêtes |
| `paid-media-tracking-specialist` | Tracking/GTM |

### Product (5)

| Persona | Rôle |
|---------|------|
| `product-behavioral-nudge-engine` | Nudges comportementaux |
| `product-feedback-synthesizer` | Synthèse feedback |
| `product-manager` | Product Manager |
| `product-sprint-prioritizer` | Priorisation sprint |
| `product-trend-researcher` | Veille tendances |

### Project Management (6)

| Persona | Rôle |
|---------|------|
| `project-management-experiment-tracker` | Suivi expériences |
| `project-management-jira-workflow-steward` | Workflow Jira |
| `project-management-project-shepherd` | Coordination projet |
| `project-management-studio-operations` | Opérations studio |
| `project-management-studio-producer` | Producer studio |
| `project-manager-senior` | Chef de projet senior |

### Sales (8)

| Persona | Rôle |
|---------|------|
| `sales-account-strategist` | Stratège compte |
| `sales-coach` | Coach commercial |
| `sales-deal-strategist` | Stratège deals |
| `sales-discovery-coach` | Coach découverte |
| `sales-engineer` | Ingénieur commercial |
| `sales-outbound-strategist` | Outbound |
| `sales-pipeline-analyst` | Analyste pipeline |
| `sales-proposal-strategist` | Stratège propositions |

### Spatial Computing (6)

| Persona | Rôle |
|---------|------|
| `macos-spatial-metal-engineer` | Metal/macOS/Vision Pro |
| `terminal-integration-specialist` | Terminal Swift |
| `visionos-spatial-engineer` | visionOS |
| `xr-cockpit-interaction-specialist` | Cockpit XR |
| `xr-immersive-developer` | WebXR/A-Frame/Three.js |
| `xr-interface-architect` | Architecture interface XR |

### Specialized (42)

| Persona | Rôle |
|---------|------|
| `accounts-payable-agent` | Paiements autonomes |
| `agentic-identity-trust` | Identité agents IA |
| `agents-orchestrator` | Orchestration multi-agents |
| `automation-governance-architect` | Gouvernance automatisation |
| `blockchain-security-auditor` | Audit smart contracts |
| `compliance-auditor` | SOC 2, ISO, HIPAA |
| `corporate-training-designer` | Formation entreprise |
| `customer-service` | Service client |
| `data-consolidation-agent` | Consolidation données |
| `government-digital-presales-consultant` | Presales gouvernement Chine |
| `healthcare-customer-service` | Service client santé |
| `healthcare-marketing-compliance` | Compliance santé Chine |
| `hospitality-guest-services` | Hôtellerie |
| `hr-onboarding` | Onboarding RH |
| `identity-graph-operator` | Résolution identité |
| `language-translator` | Traduction ES-EN |
| `legal-billing-time-tracking` | Facturation juridique |
| `legal-client-intake` | Intake clients juridique |
| `legal-document-review` | Revue documents juridiques |
| `loan-officer-assistant` | Assistant prêts |
| `lsp-index-engineer` | LSP/Code intelligence |
| `real-estate-buyer-seller` | Immobilier |
| `recruitment-specialist` | Recrutement |
| `report-distribution-agent` | Distribution rapports |
| `retail-customer-returns` | Retours retail |
| `sales-data-extraction-agent` | Extraction données ventes |
| `sales-outreach` | Outreach B2B |
| `specialized-chief-of-staff` | Chief of Staff |
| `specialized-civil-engineer` | Génie civil |
| `specialized-cultural-intelligence-strategist` | Intelligence culturelle |
| `specialized-developer-advocate` | Developer Advocate |
| `specialized-document-generator` | Génération documents |
| `specialized-french-consulting-market` | Consulting France |
| `mica-compliance-specialist` | Conformité MiCA/RGPD/AML crypto UE |
| `specialized-korean-business-navigator` | Business Corée |
| `specialized-mcp-builder` | Builder MCP |
| `specialized-model-qa` | QA modèles ML |
| `specialized-salesforce-architect` | Architecture Salesforce |
| `specialized-workflow-architect` | Architecture workflows |
| `study-abroad-advisor` | Études à l'étranger |
| `supply-chain-strategist` | Chaîne d'approvisionnement |
| `zk-steward` | Gestion connaissances Zettelkasten |

### Support (6)

| Persona | Rôle |
|---------|------|
| `support-analytics-reporter` | Reporting analytics |
| `support-executive-summary-generator` | Résumés exécutifs |
| `support-finance-tracker` | Suivi financier |
| `support-infrastructure-maintainer` | Maintenance infra |
| `support-legal-compliance-checker` | Compliance juridique |
| `support-support-responder` | Support utilisateur |

### Testing (8)

| Persona | Rôle |
|---------|------|
| `testing-accessibility-auditor` | Audit accessibilité |
| `testing-api-tester` | Test API |
| `testing-evidence-collector` | Collecte preuves |
| `testing-performance-benchmarker` | Benchmark perf |
| `testing-reality-checker` | Vérification réalité |
| `testing-test-results-analyzer` | Analyse résultats |
| `testing-tool-evaluator` | Évaluation outils |
| `testing-workflow-optimizer` | Optimisation workflows |

---

## ⚡ Slash Commands {#slash-commands}

| Commande | Description | Agents impliqués |
|----------|-------------|------------------|
| `/spec` | Crée une spécification | `spec-driven-development` |
| `/plan` | Découpe en tâches | `planning-and-task-breakdown` |
| `/build` | Implémente incrémentalement | `incremental-implementation` + `test-driven-development` |
| `/test` | Lance les tests | `test-engineer` + `test-driven-development` |
| `/constraints` | Définit la barre qualité | `constraint-driven-development` |
| `/review` | Revue de code | `code-reviewer` + `code-review-and-quality` |
| `/webperf` | Audit performance web | `web-performance-auditor` |
| `/code-simplify` | Simplifie le code | `code-simplification` |
| `/ship` | Livraison production | Fan-out: `code-reviewer` + `security-auditor` + `test-engineer` |

---

## 🎯 Mapping Intention → Skill {#mapping-intention}

### Développement

| Intention | Skill(s) à utiliser |
|-----------|---------------------|
| Nouveau projet | `spec-driven-development` → `planning-and-task-breakdown` → `incremental-implementation` |
| Nouvelle fonctionnalité | `spec-driven-development` → `incremental-implementation` + `test-driven-development` |
| Bug / échec | `debugging-and-error-recovery` |
| Refactoring | `code-simplification` |
| Revue de code | `code-review-and-quality` |
| Performance | `performance-optimization` |
| Sécurité | `security-and-hardening` |
| API | `api-and-interface-design` |
| UI/UX | `frontend-ui-engineering` |
| Documentation | `documentation-and-adrs` |
| Git | `git-workflow-and-versioning` |
| CI/CD | `ci-cd-and-automation` |
| Déploiement | `shipping-and-launch` |

### Blockchain/Solana

| Intention | Skill(s) à utiliser |
|-----------|---------------------|
| Développement Solana | `solana-dev-skill` |
| Programme Anchor | `solana-anchor-claude-skill` |
| NFT/Token | `metaplex-skill` |
| DeFi/Jupiter | `integrating-jupiter` |
| RPC/Infrastructure | `quicknode-skill` |
| Rent-free | `lightprotocol-skills` |
| Sécurité Solana | `solana-security` |
| Jeu vidéo Solana | `solana-game-skill` |
| Smart contracts EVM | `foundry-solidity` |

### Frontend

| Intention | Skill(s) à utiliser |
|-----------|---------------------|
| React | `react-typescript` |
| UI components | `shadcn-tailwind` |
| Routing/Data | `tanstack` |
| Build | `vite` |
| Extensions Chrome | `chrome-extension-wxt` |

### Langages

| Intention | Skill(s) à utiliser |
|-----------|---------------------|
| Rust | `rust-dev` |
| Go | `go-dev` |
| Python | `python-dev` |
| TypeScript/FP | `effect-ts` |
| Swift/macOS | `swift-macos` |

### DevOps/Infra

| Intention | Skill(s) à utiliser |
|-----------|---------------------|
| GitHub | `gh-cli` |
| Cloudflare | `cloudflare-workers` |
| MCP | `mcp-best-practices` |
| Linting | `biome` |

---

## 💡 Exemples d'utilisation {#exemples}

### Exemple 1 : Créer un token NFT sur Solana

```
User: "Crée un token NFT sur Solana avec Metaplex"

Agent:
1. skill({ name: "metaplex-skill" })
2. Suit le workflow Metaplex
3. skill({ name: "solana-dev-skill" })
4. Implémente le programme
5. skill({ name: "test-driven-development" })
6. Tests
7. skill({ name: "code-review-and-quality" })
8. Revue
```

### Exemple 2 : Intégrer Jupiter DEX

```
User: "Intègre les swaps Jupiter dans mon app"

Agent:
1. skill({ name: "integrating-jupiter" })
2. Configure l'API Jupiter
3. skill({ name: "frontend-ui-engineering" })
4. UI du swap
5. skill({ name: "test-driven-development" })
6. Tests
```

### Exemple 3 : Audit sécurité

```
User: "Audit la sécurité de ce smart contract"

Agent (Claude Desktop):
1. @blockchain-security-auditor
2. Analyse des vulnérabilités
3. @engineering-security-engineer
4. Recommandations
5. Rapport complet
```

### Exemple 4 : Pipeline CI/CD

```
User: "Setup le CI/CD pour ce projet"

Agent:
1. skill({ name: "ci-cd-and-automation" })
2. Configure les pipelines
3. skill({ name: "git-workflow-and-versioning" })
4. Stratégie de branches
5. skill({ name: "shipping-and-launch" })
6. Procédures de déploiement
```

### Exemple 5 : Campagne marketing

```
User: "Lance une campagne TikTok"

Agent (Claude Desktop):
1. @marketing-tiktok-strategist
2. Stratégie de contenu
3. @marketing-carousel-growth-engine
4. Génération de carrousels
5. @marketing-short-video-editing-coach
6. Montage vidéo
```

---

## 📊 Statistiques

| Catégorie | Nombre |
|-----------|--------|
| **Skills OpenCode** | 70+ |
| **Agent Personas** | 188+ |
| **Slash Commands** | 9 |
| **Total disponible** | 267+ |

---

## 🔗 Ressources

- **Agent Skills** : `C:\Users\admin\agent-skills\`
- **OpenCode Skills** : `C:\Users\admin\.opencode\skills\`
- **Claude Desktop Agents** : `C:\Users\admin\.claude\agents\`
- **Documentation** : `C:\Users\admin\agent-skills\docs\`

---

*Document généré automatiquement. Pour mise à jour, exécuter le script de synchronisation.*
