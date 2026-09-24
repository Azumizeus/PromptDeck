# 📇 AGENTS-CATALOGUE — Les 190 agents spécialistes

> **Généré le :** 24 septembre 2026 · **Total :** 190 agents
> Source : `agent-skills/agents/` — rôle = première phrase de la `description` de chaque agent
> 🇫🇷 Colonne Rôle traduite en français (`scripts/agents-roles-fr.json`)

## Où ils sont installés

| Hôte | Emplacement | Format |
|------|-------------|--------|
| Claude Code | `~/.claude/agents/` | subagent natif (name, description) |
| OpenCode | `~/.config/opencode/agents/` | subagent markdown (`mode: subagent`) — invoquables via `@nom` |
| OpenHands + Freebuff | `~/.agents/skills/agent-<nom>/SKILL.md` | Agent Skills (progressive disclosure + triggers) |

OpenCode : vérifié via `opencode agent list` → 190 agents + 2 built-in = 192 subagents.

## Core (racine) (4)

| Agent | Rôle |
|-------|------|
| `code-reviewer` | Relecteur de code senior qui évalue les modifications selon cinq dimensions — correction, lisibilité, architecture, sécurité et performance. |
| `security-auditor` | Ingénieur sécurité axé sur la détection de vulnérabilités, la modélisation des menaces et les pratiques de codage sécurisées. |
| `test-engineer` | Ingénieur QA spécialisé en stratégie de test, rédaction de tests et analyse de couverture. |
| `web-performance-auditor` | Ingénieur performance web axé sur les Core Web Vitals, le chargement, le rendu et l'optimisation réseau. |

## Academic (5)

| Agent | Rôle |
|-------|------|
| `Anthropologist` | Expert des systèmes culturels, des rituels, de la parenté, des systèmes de croyance et de la méthode ethnographique — construit des sociétés culturellement cohérentes qui semblent vécues plutôt qu'inventées. |
| `Geographer` | Expert en géographie physique et humaine, systèmes climatiques, cartographie et analyse spatiale — construit des mondes géographiquement cohérents où terrain, climat, ressources et modes d'implantation ont un fondement scientifique. |
| `Historian` | Expert en analyse historique, périodisation, culture matérielle et historiographie — valide la cohérence historique et enrichit les décors avec des détails d'époque authentiques, adossés aux sources primaires et secondaires. |
| `Narratologist` | Expert en théorie narrative, structure d'histoire, arcs de personnages et analyse littéraire — fonde ses conseils sur les cadres établis, de Propp à Campbell en passant par la narratologie moderne. |
| `Psychologist` | Expert du comportement humain, des théories de la personnalité, de la motivation et des schémas cognitifs — construit des personnages et des interactions psychologiquement crédibles, adossés aux cadres cliniques et de recherche. |

## Design (8)

| Agent | Rôle |
|-------|------|
| `Brand Guardian` | Stratège de marque expert et gardien de l'identité de marque, spécialisé dans le développement de l'identité, le maintien de la cohérence et le positionnement stratégique de la marque. |
| `Image Prompt Engineer` | Ingénieur de prompts photo expert, spécialisé dans la rédaction de prompts détaillés et évocateurs pour la génération d'images par IA. |
| `Inclusive Visuals Specialist` | Expert en représentation qui combat les biais systémiques de l'IA pour générer des images et vidéos culturellement justes, valorisantes et non stéréotypées. |
| `UI Designer` | Designer UI expert, spécialisé dans les systèmes de design visuel, les bibliothèques de composants et la création d'interfaces au pixel près. |
| `UX Architect` | Spécialiste de l'architecture technique et de l'UX qui fournit aux développeurs des fondations solides, des systèmes CSS et des conseils d'implémentation clairs. |
| `UX Researcher` | Chercheur en expérience utilisateur expert, spécialisé dans l'analyse du comportement, les tests d'utilisabilité et les insights produit fondés sur les données. |
| `Visual Storyteller` | Spécialiste de la communication visuelle expert, axé sur la création de récits visuels percutants, de contenus multimédias et de storytelling de marque par le design. |
| `Whimsy Injector` | Spécialiste créatif expert, axé sur l'ajout de personnalité, de plaisir et d'éléments ludiques aux expériences de marque. |

## Engineering (29)

| Agent | Rôle |
|-------|------|
| `AI Data Remediation Engineer` | Spécialiste des pipelines de données auto-réparants — utilise des SLM locaux isolés du réseau et le regroupement sémantique pour détecter, classer et corriger automatiquement les anomalies de données à grande échelle. |
| `AI Engineer` | Ingénieur IA/ML expert, spécialisé dans le développement de modèles de machine learning, leur déploiement et leur intégration dans des systèmes de production. |
| `Autonomous Optimization Architect` | Gouverneur de systèmes intelligents qui teste en continu les API en mode ombre pour la performance, tout en imposant des garde-fous financiers et de sécurité stricts contre les coûts incontrôlés. |
| `Backend Architect` | Architecte backend senior, spécialisé dans la conception de systèmes évolutifs, l'architecture de bases de données, le développement d'API et l'infrastructure cloud. |
| `CMS Developer` | Spécialiste Drupal et WordPress pour le développement de thèmes, les plugins/modules personnalisés, l'architecture de contenu et l'implémentation CMS en code-first. |
| `Code Reviewer` | Relecteur de code expert qui fournit des retours constructifs et actionnables, axés sur la correction, la maintenabilité, la sécurité et la performance — pas sur les préférences de style. |
| `Codebase Onboarding Engineer` | Spécialiste de l'intégration de développeurs qui aide les nouveaux ingénieurs à comprendre rapidement une base de code inconnue, en lisant le code source, en traçant les chemins d'exécution et en ne s'appuyant que sur des faits vérifiables dans le code. |
| `Data Engineer` | Ingénieur data expert, spécialisé dans la construction de pipelines de données fiables, d'architectures lakehouse et d'infrastructures de données évolutives. |
| `Database Optimizer` | Spécialiste bases de données expert, axé sur la conception de schémas, l'optimisation de requêtes, les stratégies d'indexation et le réglage des performances pour PostgreSQL, MySQL et les bases modernes comme Supabase et PlanetScale. |
| `DevOps Automator` | Ingénieur DevOps expert, spécialisé dans l'automatisation d'infrastructure, le développement de pipelines CI/CD et les opérations cloud. |
| `Email Intelligence Engineer` | Expert en extraction de données structurées prêtes pour le raisonnement à partir de fils d'e-mails bruts, pour les agents IA et les systèmes d'automatisation. |
| `Embedded Firmware Engineer` | Spécialiste du firmware embarqué bare-metal et RTOS — ESP32/ESP-IDF, PlatformIO, Arduino, ARM Cortex-M, STM32 HAL/LL, Nordic nRF5/nRF Connect SDK, FreeRTOS, Zephyr. |
| `Feishu Integration Developer` | Expert en intégration full-stack spécialisé dans la plateforme ouverte Feishu (Lark) — bots Feishu, mini-programmes, workflows d'approbation, Bitable (tableurs multidimensionnels), cartes de messages interactives, Webhooks, authentification SSO et automatisation de workflows, pour construire des solutions collaboratives d'entreprise au sein de l'écosystème Feishu. |
| `Filament Optimization Specialist` | Expert en restructuration et optimisation des interfaces d'administration Filament PHP pour une utilisabilité et une efficacité maximales. |
| `Frontend Developer` | Développeur frontend expert, spécialisé dans les technologies web modernes, les frameworks React/Vue/Angular, l'implémentation d'interfaces et l'optimisation des performances. |
| `Git Workflow Master` | Expert des workflows Git, des stratégies de branches et des bonnes pratiques de gestion de versions, incluant les commits conventionnels, le rebase, les worktrees et la gestion de branches compatible CI. |
| `Incident Response Commander` | Commandant de gestion d'incidents expert, spécialisé dans la gestion des incidents de production, la coordination structurée des réponses, l'animation des post-mortems, le suivi des SLO/SLI et la conception des astreintes pour des organisations d'ingénierie fiables. |
| `Minimal Change Engineer` | Spécialiste de l'ingénierie à diff minimal — ne corrige que ce qui est demandé, refuse l'élargissement de périmètre et préfère trois lignes similaires à une abstraction prématurée. |
| `Mobile App Builder` | Développeur d'applications mobiles spécialisé, expert en développement natif iOS/Android et frameworks multiplateformes. |
| `Rapid Prototyper` | Spécialisé dans le développement ultra-rapide de preuves de concept et la création de MVP avec des outils et frameworks efficaces. |
| `Security Engineer` | Ingénieur sécurité applicative expert, spécialisé dans la modélisation des menaces, l'évaluation des vulnérabilités, la revue de code sécurisée, l'architecture de sécurité et la réponse aux incidents pour applications web, API et cloud-native modernes. |
| `Senior Developer` | Spécialiste d'implémentation premium — maître de Laravel/Livewire/FluxUI, du CSS avancé et de l'intégration Three.js. |
| `Software Architect` | Architecte logiciel expert, spécialisé dans la conception de systèmes, le domain-driven design, les patterns architecturaux et la prise de décision technique pour des systèmes évolutifs et maintenables. |
| `Solidity Smart Contract Engineer` | Développeur Solidity expert, spécialisé dans l'architecture de smart contracts EVM, l'optimisation du gaz, les patterns de proxy upgradeables, le développement de protocoles DeFi et la conception de contrats sécurisés sur Ethereum et les L2. |
| `SRE (Site Reliability Engineer)` | Ingénieur fiabilité site (SRE) expert, spécialisé dans les SLO, les budgets d'erreur, l'observabilité, l'ingénierie du chaos et la réduction du travail ingrat pour des systèmes de production à grande échelle. |
| `Technical Writer` | Rédacteur technique expert, spécialisé dans la documentation développeur, les références d'API, les README et les tutoriels. |
| `Threat Detection Engineer` | Ingénieur détection expert, spécialisé dans le développement de règles SIEM, la cartographie de couverture MITRE ATT&CK, le threat hunting, le réglage des alertes et les pipelines de détection-as-code pour les équipes de sécurité opérationnelle. |
| `Voice AI Integration Engineer` | Expert en construction de pipelines de transcription vocale de bout en bout avec des modèles de type Whisper et des services ASR cloud — de l'ingestion audio brute au prétraitement, au nettoyage des transcriptions, à la génération de sous-titres, à la séparation des locuteurs et à l'intégration structurée en aval dans les apps, API et plateformes CMS. |
| `WeChat Mini Program Developer` | Développeur de mini-programmes WeChat expert, spécialisé dans le développement 小程序 avec WXML/WXSS/WXS, l'intégration des API WeChat, les systèmes de paiement, la messagerie d'abonnement et l'ensemble de l'écosystème WeChat. |

## Finance (5)

| Agent | Rôle |
|-------|------|
| `Bookkeeper & Controller` | Expert en comptabilité et contrôle de gestion, spécialisé dans les opérations comptables quotidiennes, les rapprochements financiers, les clôtures mensuelles et le contrôle interne. |
| `Financial Analyst` | Analyste financier expert, spécialisé dans la modélisation financière, les prévisions, l'analyse de scénarios et l'aide à la décision fondée sur les données. |
| `FP&A Analyst` | Analyste FP&A (planification et analyse financières) expert, spécialisé dans la budgétisation, l'analyse des écarts, la planification financière, les prévisions glissantes et l'aide à la décision stratégique. |
| `Investment Researcher` | Chercheur en investissement expert, spécialisé dans les études de marché, la due diligence, l'analyse de portefeuille et l'évaluation d'actifs. |
| `Tax Strategist` | Stratège fiscal expert, spécialisé dans l'optimisation fiscale, la conformité multi-juridictions, les prix de transfert et la planification fiscale stratégique. |

## Game Development (21)

| Agent | Rôle |
|-------|------|
| `Blender Add-on Engineer` | Spécialiste de l'outillage Blender — construit des add-ons Python, validateurs d'assets, exporteurs et automatisations de pipeline qui transforment le travail DCC répétitif en workflows fiables en un clic. |
| `Game Audio Engineer` | Spécialiste du son interactif — maîtrise l'intégration FMOD/Wwise, les systèmes musicaux adaptatifs, l'audio spatial et le budget de performance audio sur tous les moteurs de jeu. |
| `Game Designer` | Architecte de systèmes et de mécaniques — maîtrise la rédaction de GDD, la psychologie du joueur, l'équilibrage économique et la conception de boucles de gameplay sur tous les moteurs et genres. |
| `Godot Gameplay Scripter` | Spécialiste de la composition et de l'intégrité des signaux — maîtrise GDScript 2.0, l'intégration C#, l'architecture par nœuds et la conception de signaux typés pour les projets Godot 4. |
| `Godot Multiplayer Engineer` | Spécialiste du réseau Godot 4 — maîtrise la MultiplayerAPI, la réplication de scènes, le transport ENet/WebRTC, les RPC et les modèles d'autorité pour des jeux multijoueurs en temps réel. |
| `Godot Shader Developer` | Spécialiste des effets visuels Godot 4 — maîtrise le langage de shaders Godot (proche GLSL), l'éditeur VisualShader, les shaders CanvasItem et Spatial, le post-processing et l'optimisation des effets 2D/3D. |
| `Level Designer` | Spécialiste du level design spatial et du flow — maîtrise la théorie des layouts, l'architecture du pacing, la conception d'encounters et la narration environnementale sur tous les moteurs de jeu. |
| `Narrative Designer` | Architecte de systèmes narratifs et de dialogues — maîtrise la conception narrative alignée GDD, les dialogues à embranchements, l'architecture du lore et le storytelling environnemental sur tous les moteurs de jeu. |
| `Roblox Avatar Creator` | Spécialiste du pipeline UGC et avatars Roblox — maîtrise le système d'avatars Roblox, la création d'items UGC, le rigging d'accessoires, les standards de textures et le pipeline de soumission au Creator Marketplace. |
| `Roblox Experience Designer` | Spécialiste UX et monétisation de la plateforme Roblox — maîtrise la conception de boucles d'engagement, la progression pilotée par DataStore, les systèmes de monétisation Roblox (Passes, Developer Products, UGC) et la rétention des joueurs. |
| `Roblox Systems Scripter` | Spécialiste de l'ingénierie plateforme Roblox — maîtrise Luau, le modèle de sécurité client-serveur, les RemoteEvents/RemoteFunctions, les DataStore et l'architecture en modules pour des expériences Roblox évolutives. |
| `Technical Artist` | Spécialiste du pipeline art-vers-moteur — maîtrise les shaders, les systèmes VFX, les pipelines LOD, le budget de performance et l'optimisation d'assets multi-moteurs. |
| `Tokenomics Designer` | Expert en design de tokenomics pour crypto-games et projets Solana. |
| `Unity Architect` | Spécialiste de la modularité pilotée par les données — maîtrise les ScriptableObjects, les systèmes découplés et la conception à responsabilité unique pour des projets Unity évolutifs. |
| `Unity Editor Tool Developer` | Spécialiste de l'automatisation de l'éditeur Unity — maîtrise les EditorWindows personnalisés, les PropertyDrawers, les AssetPostprocessors, les ScriptedImporters et l'automatisation de pipeline qui fait gagner des heures par semaine aux équipes. |
| `Unity Multiplayer Engineer` | Spécialiste du gameplay en réseau — maîtrise Netcode for GameObjects, Unity Gaming Services (Relay/Lobby), l'autorité client-serveur, la compensation de latence et la synchronisation d'état. |
| `Unity Shader Graph Artist` | Spécialiste des effets visuels et des matériaux — maîtrise Unity Shader Graph, HLSL, les pipelines de rendu URP/HDRP et la création de passes personnalisées pour des effets visuels en temps réel. |
| `Unreal Multiplayer Architect` | Spécialiste réseau Unreal Engine — maîtrise la réplication d'Actors, l'architecture GameMode/GameState, le gameplay à autorité serveur, la prédiction réseau et la configuration de serveurs dédiés pour UE5. |
| `Unreal Systems Engineer` | Spécialiste performance et architecture hybride — maîtrise le continuum C++/Blueprint, la géométrie Nanite, l'éclairage Lumen et le Gameplay Ability System pour des projets Unreal Engine de qualité AAA. |
| `Unreal Technical Artist` | Spécialiste du pipeline visuel Unreal Engine — maîtrise l'éditeur de matériaux, Niagara VFX, la génération procédurale de contenu et le pipeline art-vers-moteur pour les projets UE5. |
| `Unreal World Builder` | Spécialiste open-world et environnements — maîtrise World Partition, Landscape, le feuillage procédural, les HLOD et le streaming de niveaux à grande échelle pour des expériences open-world fluides sur UE5. |

## Marketing (30)

| Agent | Rôle |
|-------|------|
| `Agentic Search Optimizer` | Expert en préparation WebMCP et achèvement de tâches agentiques — audite si les agents IA peuvent réellement accomplir des tâches sur ton site (réserver, acheter, s'inscrire, s'abonner), implémente les patterns WebMCP déclaratifs et impératifs, et mesure les taux de complétion des tâches par les agents de navigation IA. |
| `AI Citation Strategist` | Expert en optimisation pour moteurs de recommandation IA (AEO/GEO) — audite la visibilité de la marque sur ChatGPT, Claude, Gemini et Perplexity, identifie pourquoi les concurrents sont cités à ta place, et livre des correctifs de contenu qui améliorent les citations IA. |
| `App Store Optimizer` | Spécialiste du marketing app store expert, axé sur l'optimisation App Store (ASO), l'optimisation du taux de conversion et la découverte d'applications. |
| `Baidu SEO Specialist` | Spécialiste du référencement Baidu expert, axé sur le classement dans le moteur de recherche chinois, l'intégration à l'écosystème Baidu, la conformité ICP, la recherche de mots-clés chinois et l'indexation mobile-first pour le marché chinois. |
| `Bilibili Content Strategist` | Spécialiste marketing Bilibili expert, axé sur la croissance des UP主, la maîtrise de la culture danmaku, l'optimisation de l'algorithme de B站, le community building et la stratégie de contenu de marque pour la principale plateforme vidéo communautaire de Chine. |
| `Book Co-Author` | Co-auteur stratégique de livres de thought leadership pour fondateurs, experts et opérationnels, transformant notes vocales, fragments et positionnement en chapitres structurés à la première personne. |
| `Carousel Growth Engine` | Spécialiste autonome de génération de carrousels TikTok et Instagram. |
| `China E-Commerce Operator` | Expert des opérations e-commerce en Chine couvrant les écosystèmes Taobao, Tmall, Pinduoduo et JD, avec une expertise approfondie de l'optimisation des fiches produit, du live commerce, des opérations de boutique, des campagnes 618/Double 11 et de la stratégie multi-plateformes. |
| `China Market Localization Strategist` | Expert full-stack de la localisation pour le marché chinois, qui transforme les signaux de tendances en temps réel en stratégies go-to-market exécutables sur Douyin, Xiaohongshu, WeChat, Bilibili et au-delà. |
| `Content Creator` | Stratège et créateur de contenu expert pour des campagnes multi-plateformes. |
| `Cross-Border E-Commerce Specialist` | Stratège e-commerce transfrontalier full-funnel couvrant les opérations Amazon, Shopee, Lazada, AliExpress, Temu et TikTok Shop, la logistique internationale et l'entreposage à l'étranger, la conformité et la fiscalité, l'optimisation multilingue des fiches, la mondialisation de marque et le développement de sites DTC indépendants. |
| `Douyin Strategist` | Expert marketing vidéo courte spécialisé dans la plateforme Douyin, avec une expertise approfondie des mécaniques de l'algorithme de recommandation, de la planification de vidéos virales, des workflows du live commerce et de la croissance de marque full-funnel par stratégies de matrices de contenu. |
| `Growth Hacker` | Stratège de croissance expert, spécialisé dans l'acquisition rapide d'utilisateurs par l'expérimentation fondée sur les données. |
| `Instagram Curator` | Spécialiste marketing Instagram expert, axé sur le storytelling visuel, le community building et l'optimisation de contenus multi-formats. |
| `Kuaishou Strategist` | Stratège marketing Kuaishou expert, spécialisé dans le contenu vidéo courte pour les marchés des villes de moindre rang en Chine, les opérations de live commerce, la construction de confiance communautaire et la croissance d'audience populaire sur 快手. |
| `LinkedIn Content Creator` | Stratège de contenu LinkedIn expert, axé sur le thought leadership, la construction de marque personnelle et les contenus professionnels à fort engagement. |
| `Livestream Commerce Coach` | Coach e-commerce en direct chevronné, spécialisé dans la formation des animateurs et les opérations de live rooms sur Douyin, Kuaishou, Taobao Live et Channels, couvrant la conception de scripts, le séquençage produits, l'équilibre trafic payant/organique, les techniques de closing et l'optimisation pilotée par les données en temps réel. |
| `Podcast Strategist` | Expert en stratégie et opérations de contenu pour le marché chinois du podcast, avec une expertise approfondie de Xiaoyuzhou, Ximalaya et autres grandes plateformes audio, couvrant le positionnement d'émission, la production audio, la croissance d'audience, la distribution multi-plateformes et la monétisation pour aider les créateurs à bâtir des marques audio fidélisantes. |
| `Private Domain Operator` | Expert en construction d'écosystèmes de domaine privé sur WeChat d'entreprise (WeCom), avec une expertise approfondie des systèmes SCRM, des opérations communautaires segmentées, de l'intégration commerce des mini-programmes, de la gestion du cycle de vie utilisateur et de l'optimisation de conversion full-funnel. |
| `Reddit Community Builder` | Spécialiste marketing Reddit expert, axé sur l'engagement communautaire authentique, la création de contenu à valeur ajoutée et la construction de relations durables. |
| `SEO Specialist` | Stratège SEO expert, spécialisé dans le SEO technique, l'optimisation de contenu, la construction d'autorité de liens et la croissance du trafic organique. |
| `Short-Video Editing Coach` | Coach de montage vidéo courte impliqué, couvrant l'ensemble du pipeline de post-production, avec la maîtrise de CapCut Pro, Premiere Pro, DaVinci Resolve et Final Cut Pro : composition et langage caméra, étalonnage, ingénierie audio, motion design et VFX, design de sous-titres, optimisation d'export multi-plateformes, efficacité du workflow de montage et montage assisté par IA. |
| `Social Media Strategist` | Stratège réseaux sociaux expert pour LinkedIn, Twitter et les plateformes professionnelles. |
| `TikTok Strategist` | Spécialiste marketing TikTok expert, axé sur la création de contenus viraux, l'optimisation pour l'algorithme et le community building. |
| `Twitter Engager` | Spécialiste marketing Twitter expert, axé sur l'engagement en temps réel, la construction de thought leadership et la croissance portée par la communauté. |
| `Video Optimization Specialist` | Stratège marketing vidéo spécialisé dans l'optimisation de l'algorithme YouTube, la rétention d'audience, le chapitrage, les concepts de miniatures et la syndication vidéo multi-plateformes. |
| `WeChat Official Account Manager` | Stratège WeChat Official Account (OA) expert, spécialisé dans le marketing de contenu, l'engagement des abonnés et l'optimisation de conversion. |
| `Weibo Strategist` | Expert des opérations full-spectrum sur Sina Weibo, avec une expertise approfondie des mécaniques de sujets tendance, de la gestion de communautés Super Topic, de la surveillance du sentiment public, des stratégies d'économie de fans et de la publicité Weibo, aidant les marques à atteindre une portée virale et une croissance durable sur la principale plateforme chinoise de débat public. |
| `Xiaohongshu Specialist` | Spécialiste marketing Xiaohongshu expert, axé sur le contenu lifestyle, les stratégies pilotées par les tendances et l'engagement communautaire authentique. |
| `Zhihu Strategist` | Spécialiste marketing Zhihu expert, axé sur le thought leadership, la crédibilité communautaire et l'engagement fondé sur la connaissance. |

## Paid Media (7)

| Agent | Rôle |
|-------|------|
| `Paid Media Auditor` | Auditeur paid media complet qui évalue systématiquement les comptes Google Ads, Microsoft Ads et Meta sur plus de 200 points de contrôle couvrant la structure du compte, le tracking, les enchères, la création publicitaire, les audiences et le positionnement concurrentiel. |
| `Ad Creative Strategist` | Spécialiste créatif paid media axé sur la rédaction publicitaire, l'optimisation RSA, la conception d'asset groups et les cadres de test créatif sur Google, Meta, Microsoft et les plateformes programmatiques. |
| `Paid Social Strategist` | Spécialiste de la publicité sociale payante multi-plateformes couvrant Meta (Facebook/Instagram), LinkedIn, TikTok, Pinterest, X et Snapchat. |
| `PPC Campaign Strategist` | Stratège paid media senior spécialisé dans l'architecture de campagnes search, shopping et Performance Max à grande échelle sur Google, Microsoft et Amazon Ads. |
| `Programmatic & Display Buyer` | Spécialiste de l'achat display et programmatique couvrant les placements gérés, le Google Display Network, DV360, les plateformes trade desk, les médias partenaires (newsletters, contenus sponsorisés) et les stratégies display ABM via des plateformes comme Demandbase et 6Sense. |
| `Search Query Analyst` | Spécialiste de l'analyse de requêtes de recherche, de l'architecture de mots-clés négatifs et du mapping requête-intention. |
| `Tracking & Measurement Specialist` | Expert en architecture de tracking de conversions, gestion de tags et modélisation d'attribution sur Google Tag Manager, GA4, Google Ads, Meta CAPI, LinkedIn Insight Tag et implémentations server-side. |

## Product (5)

| Agent | Rôle |
|-------|------|
| `Behavioral Nudge Engine` | Spécialiste en psychologie comportementale qui adapte les cadences et styles d'interaction logicielle pour maximiser la motivation et la réussite des utilisateurs. |
| `Feedback Synthesizer` | Expert en collecte, analyse et synthèse des retours utilisateurs multi-canaux pour en extraire des insights produit actionnables. |
| `Product Manager` | Leader produit holistique qui pilote l'ensemble du cycle de vie produit — de la découverte et de la stratégie jusqu'à la roadmap, l'alignement des parties prenantes, le go-to-market et la mesure des résultats. |
| `Sprint Prioritizer` | Chef de produit expert spécialisé dans la planification de sprints agiles, la priorisation de fonctionnalités et l'allocation des ressources. |
| `Trend Researcher` | Analyste en intelligence de marché expert, spécialisé dans l'identification des tendances émergentes, l'analyse concurrentielle et l'évaluation des opportunités. |

## Project Management (6)

| Agent | Rôle |
|-------|------|
| `Experiment Tracker` | Chef de projet expert spécialisé dans la conception d'expériences, le suivi d'exécution et la prise de décision fondée sur les données. |
| `Jira Workflow Steward` | Spécialiste des opérations de delivery qui fait respecter les workflows Git liés à Jira, les commits traçables, les pull requests structurées et une stratégie de branches sans risque pour les releases, au sein des équipes logicielles. |
| `Project Shepherd` | Chef de projet expert spécialisé dans la coordination transversale, la gestion des délais et l'alignement des parties prenantes. |
| `Studio Operations` | Responsable des opérations expert, spécialisé dans l'efficacité quotidienne du studio, l'optimisation des processus et la coordination des ressources. |
| `Studio Producer` | Leader stratégique senior spécialisé dans l'orchestration de projets créatifs et techniques de haut niveau, l'allocation des ressources et la gestion de portefeuilles multi-projets. |
| `Senior Project Manager` | Convertit les specs en tâches et se souvient des projets précédents. |

## Sales (8)

| Agent | Rôle |
|-------|------|
| `Account Strategist` | Stratège de comptes post-vente expert, spécialisé dans l'exécution land-and-expand, le mapping des parties prenantes, la facilitation des QBR et la rétention nette de revenus. |
| `Sales Coach` | Coach commercial expert axé sur le développement des commerciaux, la facilitation des revues de pipeline, le coaching d'appels, la stratégie de deals et la précision des prévisions. |
| `Deal Strategist` | Stratège de deals senior spécialisé dans la qualification MEDDPICC, le positionnement concurrentiel et la planification de victoires pour des cycles de vente B2B complexes. |
| `Discovery Coach` | Coache les équipes commerciales sur la méthodologie de découverte d'élite — conception de questions, mapping de l'état actuel, quantification des écarts et structure d'appel qui révèle la vraie motivation d'achat. |
| `Sales Engineer` | Ingénieur avant-vente senior spécialisé dans la découverte technique, l'ingénierie de démos, le cadrage de POC, les battlecards concurrentielles et le passage des capacités produit aux résultats business. |
| `Outbound Strategist` | Spécialiste outbound fondé sur les signaux qui conçoit des séquences de prospection multi-canaux, définit les ICP et construit le pipeline par personnalisation fondée sur la recherche — pas par le volume. |
| `Pipeline Analyst` | Analyste revenue operations spécialisé dans le diagnostic de santé du pipeline, l'analyse de vélocité des deals, la précision des prévisions et le coaching commercial fondé sur les données. |
| `Proposal Strategist` | Architecte de propositions stratégiques qui transforme les RFP et opportunités de vente en récits de victoire convaincants. |

## Spatial Computing (6)

| Agent | Rôle |
|-------|------|
| `macOS Spatial/Metal Engineer` | Spécialiste Swift et Metal natif, qui construit des systèmes de rendu 3D haute performance et des expériences de spatial computing pour macOS et Vision Pro. |
| `Terminal Integration Specialist` | Émulation de terminal, optimisation du rendu de texte et intégration SwiftTerm pour les applications Swift modernes. |
| `visionOS Spatial Engineer` | Spatial computing visionOS natif, interfaces volumétriques SwiftUI et implémentation du design Liquid Glass. |
| `XR Cockpit Interaction Specialist` | Spécialiste de la conception et du développement de systèmes de contrôle immersifs de type cockpit pour environnements XR. |
| `XR Immersive Developer` | Développeur WebXR et technologies immersives expert, spécialisé dans les applications AR/VR/XR dans le navigateur. |
| `XR Interface Architect` | Designer d'interactions spatiales et stratège d'interfaces pour environnements AR/VR/XR immersifs. |

## Specialized (42)

| Agent | Rôle |
|-------|------|
| `Accounts Payable Agent` | Spécialiste autonome du traitement des paiements qui exécute les paiements fournisseurs, factures de prestataires et factures récurrentes sur n'importe quel rail de paiement — crypto, fiat, stablecoins. |
| `Agentic Identity & Trust Architect` | Conçoit des systèmes d'identité, d'authentification et de vérification de confiance pour les agents IA autonomes opérant dans des environnements multi-agents. |
| `Agents Orchestrator` | Gestionnaire de pipeline autonome qui orchestre l'ensemble du workflow de développement. |
| `Automation Governance Architect` | Architecte à gouvernance d'abord pour les automatisations métier (n8n-first), qui audite valeur, risques et maintenabilité avant implémentation. |
| `Blockchain Security Auditor` | Auditeur de sécurité de smart contracts expert, spécialisé dans la détection de vulnérabilités, la vérification formelle, l'analyse d'exploits et la rédaction de rapports d'audit complets pour les protocoles DeFi et applications blockchain. |
| `Compliance Auditor` | Auditeur de conformité technique expert, spécialisé dans les audits SOC 2, ISO 27001, HIPAA et PCI-DSS — de l'évaluation de préparation à la collecte de preuves jusqu'à la certification. |
| `Corporate Training Designer` | Expert en conception de systèmes de formation en entreprise et de développement de programmes — maîtrise l'analyse des besoins de formation, la méthodologie d'ingénierie pédagogique, la conception de programmes blended learning, le développement de formateurs internes, les programmes de leadership, et l'évaluation de l'efficacité avec optimisation continue. |
| `Customer Service` | Spécialiste du service client aimable et professionnel pour tous secteurs — traitement des demandes, réclamations, support de comptes, FAQ et escalade fluide, avec chaleur, efficacité et un engagement sincère envers la satisfaction client. |
| `Data Consolidation Agent` | Agent IA qui consolide les données de vente extraites en tableaux de bord de reporting en direct, avec synthèses par territoire, par commercial et par pipeline. |
| `Government Digital Presales Consultant` | Expert avant-vente pour le marché chinois de la transformation numérique gouvernementale (ToG), maîtrisant l'interprétation des politiques, la conception de solutions, la préparation des dossiers d'appels d'offres, la validation par POC, les exigences de conformité (protection classifiée/évaluation cryptographique/informatique domestique Xinchuang) et la gestion des parties prenantes — aidant les équipes techniques à remporter efficacement les projets IT gouvernementaux. |
| `Healthcare Customer Service` | Spécialiste du service client santé empathique pour le support des patients, les questions de facturation, la gestion des rendez-vous, les questions d'assurance, la résolution des réclamations et l'escalade fluide vers les équipes cliniques ou administratives. |
| `Healthcare Marketing Compliance Specialist` | Expert en conformité du marketing santé en Chine, maîtrisant la loi sur la publicité, les mesures de gestion des publicités médicales, la loi sur l'administration des médicaments et réglementations associées — couvrant produits pharmaceutiques, dispositifs médicaux, esthétique médicale, compléments santé et santé en ligne, à travers la revue de contenu, le contrôle des risques, l'interprétation des règles des plateformes et la protection de la vie privée des patients, pour aider les entreprises à faire un marketing santé efficace dans les limites légales. |
| `Hospitality Guest Services` | Spécialiste complet des services aux clients de l'hôtellerie-restauration pour hôtels, resorts, restaurants et lieux événementiels — couvrant réservations, check-in/check-out, conciergerie, résolution des réclamations clients, gestion du programme de fidélité et suivi post-séjour pour des expériences clients exceptionnelles qui fidélisent et génèrent du revenu. |
| `HR Onboarding` | Spécialiste complet de l'onboarding RH pour l'intégration des employés, la gestion documentaire, le suivi de conformité, l'inscription aux avantages, l'intégration culturelle et le soutien aux nouvelles recrues — une expérience fluide du premier jour à la première année qui renforce rétention et productivité. |
| `Identity Graph Operator` | Exploite un graphe d'identités partagé auquel plusieurs agents IA se réfèrent. |
| `Language Translator` | Spécialiste de la traduction temps réel espagnol ↔ anglais avec contexte culturel, connaissance des dialectes régionaux, conseils de phrases de voyage et communication au ton adapté pour le quotidien, les affaires et les situations d'urgence. |
| `Legal Billing & Time Tracking` | Spécialiste complet de la facturation juridique et du suivi du temps pour une saisie précise du temps, la génération de factures, la rédaction de narratifs de facturation, la gestion du recouvrement, la conformité des comptes d'avocats et l'analyse de facturation — maximisant le recouvrement de revenus tout en préservant les relations clients et la conformité éthique, quelle que soit la taille du cabinet ou le modèle de facturation. |
| `Legal Client Intake` | Spécialiste complet de l'intake de clients juridiques pour la qualification des prospects, la collecte des informations d'affaire, la planification des consultations, la gestion des vérifications de conflits d'intérêts et la livraison de synthèses d'intake prêtes pour l'avocat, dans tous les domaines et toutes tailles de cabinet. |
| `Legal Document Review` | Spécialiste complet de la revue de documents juridiques pour contrats, pièces de contentieux et accords immobiliers — synthèse des documents, signalement des clauses à risque, comparaison de versions de contrats et vérification de conformité, quelle que soit la taille du cabinet ou le domaine de pratique. |
| `Loan Officer Assistant` | Assistant complet de chargé de crédits pour les professionnels de l'hypothèque et du prêt — couvrant l'intake des emprunteurs, la pré-qualification, la collecte de documents, la gestion du pipeline, le suivi de conformité, les simulations de taux et la coordination de la clôture, sur les crédits résidentiels, commerciaux et à la consommation. |
| `LSP/Index Engineer` | Spécialiste du Language Server Protocol, qui construit des systèmes unifiés d'intelligence de code par orchestration de clients LSP et indexation sémantique. |
| `MiCA Compliance Specialist` | Spécialiste en régulation crypto européenne (règlement Markets in Crypto-Assets). |
| `Real Estate Buyer & Seller` | Assistant complet d'agent immobilier pour la représentation d'acheteurs et de vendeurs, la gestion des mandats, la négociation d'offres, la coordination des transactions et le soutien à la clôture — une expérience client de classe mondiale de la première visite à la signature finale, en immobilier résidentiel et d'investissement. |
| `Recruitment Specialist` | Expert des opérations de recrutement et de l'acquisition de talents — rompu aux principales plateformes d'embauche chinoises, aux cadres d'évaluation des talents et à la conformité au droit du travail. |
| `Report Distribution Agent` | Agent IA qui automatise la distribution des rapports de vente consolidés aux commerciaux selon des paramètres territoriaux. |
| `Retail Customer Returns` | Spécialiste complet des retours clients en retail pour le traitement des retours, échanges et remboursements en magasin, en ligne et en omnicanal — application des politiques, prévention de la fraude, rétention client, retours fournisseurs et analytique des retours pour maximiser le recouvrement tout en préservant la fidélité client. |
| `Sales Data Extraction Agent` | Agent IA spécialisé dans la surveillance de fichiers Excel et l'extraction des indicateurs de vente clés (MTD, YTD, fin d'année) pour le reporting interne en direct. |
| `Sales Outreach` | Spécialiste de la prospection B2B consultative pour le démarchage à froid, le suivi de leads, le traitement des objections, la rédaction de propositions et la gestion du pipeline — combinant ciblage fondé sur les données et construction sincère de relations pour ouvrir des portes et conclure des deals. |
| `Chief of Staff` | Coordinateur en chef pour fondateurs et dirigeants — filtre le bruit, s'approprie les processus, impose la cohérence, aiguille les décisions et positionne les livrables pour l'impact, afin que le dirigeant puisse penser clairement. |
| `Civil Engineer` | Ingénieur civil et structurel expert avec une couverture des normes mondiales — Eurocode, DIN, ACI, AISC, ASCE, AS/NZS, CSA, GB, IS, AIJ, et plus. |
| `Cultural Intelligence Strategist` | Spécialiste CQ qui détecte l'exclusion invisible, étudie le contexte global et garantit que le logiciel résonne authentiquement à travers les identités intersectionnelles. |
| `Developer Advocate` | Developer advocate expert, spécialisé dans la construction de communautés de développeurs, la création de contenus techniques percutants, l'optimisation de l'expérience développeur (DX) et l'adoption des plateformes par un engagement d'ingénierie authentique. |
| `Document Generator` | Spécialiste de la création de documents expert, qui génère des fichiers PDF, PPTX, DOCX et XLSX professionnels par approches code, avec un formatage soigné, des graphiques et une visualisation de données. |
| `French Consulting Market Navigator` | Navigue l'écosystème freelance ESN/SI français — modèles de marge, mécaniques des plateformes (Malt, collective.work), portage salarial, positionnement tarifaire et réalités des cycles de paiement. |
| `Korean Business Navigator` | Culture d'affaires coréenne pour professionnels étrangers — processus de décision 품의, lecture du nunchi, étiquette KakaoTalk en entreprise, navigation hiérarchique et mécanique des deals fondée sur la relation. |
| `MCP Builder` | Développeur Model Context Protocol expert qui conçoit, construit et teste des serveurs MCP étendant les capacités des agents IA avec des outils, ressources et prompts personnalisés. |
| `Model QA Specialist` | Expert QA de modèles indépendant qui audite les modèles ML et statistiques de bout en bout — de la revue documentaire et la reconstruction des données jusqu'à la réplication, les tests de calibration, l'analyse d'interprétabilité, le suivi de performance et les rapports auditables. |
| `Salesforce Architect` | Architecture de solutions pour la plateforme Salesforce — conception multi-cloud, patterns d'intégration, limites governor, stratégie de déploiement et gouvernance du modèle de données pour des organisations à l'échelle de l'entreprise. |
| `Workflow Architect` | Spécialiste de la conception de workflows qui cartographie des arbres de workflow complets pour chaque système, parcours utilisateur et interaction d'agent — couvrant les chemins nominaux, toutes les conditions de branches, les modes de défaillance, les chemins de récupération, les contrats de handoff et les états observables, pour produire des specs prêtes à construire que les agents peuvent implémenter et que la QA peut tester. |
| `Study Abroad Advisor` | Expert complet de la planification d'études à l'étranger couvrant États-Unis, Royaume-Uni, Canada, Australie, Europe, Hong Kong et Singapour — maîtrise la stratégie de candidature licence/master/doctorat, la sélection d'établissements, le coaching d'essais, l'amélioration de profil, la planification des tests standardisés, la préparation des visas et l'adaptation à la vie à l'étranger, aidant les étudiants chinois à bâtir des plans d'études personnalisés de bout en bout. |
| `Supply Chain Strategist` | Expert en gestion de chaîne d'approvisionnement et stratégie d'achat — rompu au développement des fournisseurs, au sourcing stratégique, au contrôle qualité et à la numérisation de la supply chain. |
| `ZK Steward` | Intendant de base de connaissances dans l'esprit du Zettelkasten de Niklas Luhmann. |

## Support (6)

| Agent | Rôle |
|-------|------|
| `Analytics Reporter` | Analyste de données expert transformant les données brutes en insights business actionnables. |
| `Executive Summary Generator` | Spécialiste IA de niveau cabinet de conseil, entraîné à penser et communiquer comme un consultant en stratégie senior. |
| `Finance Tracker` | Analyste financier et contrôleur de gestion expert, spécialisé dans la planification financière, la gestion de budget et l'analyse de performance d'entreprise. |
| `Infrastructure Maintainer` | Spécialiste infrastructure expert, axé sur la fiabilité des systèmes, l'optimisation des performances et la gestion des opérations techniques. |
| `Legal Compliance Checker` | Spécialiste juridique et conformité expert, garantissant que les opérations, le traitement des données et la création de contenu respectent les lois, réglementations et normes sectorielles en vigueur dans plusieurs juridictions. |
| `Support Responder` | Spécialiste du support client expert, délivrant un service client exceptionnel, la résolution d'incidents et l'optimisation de l'expérience utilisateur. |

## Testing (8)

| Agent | Rôle |
|-------|------|
| `Accessibility Auditor` | Spécialiste accessibilité expert qui audite les interfaces face aux normes WCAG, teste avec les technologies d'assistance et garantit un design inclusif. |
| `API Tester` | Spécialiste de tests d'API expert, axé sur la validation complète des API, les tests de performance et l'assurance qualité sur tous les systèmes et intégrations tierces. |
| `Evidence Collector` | Spécialiste QA obsédé par les captures d'écran, allergique aux chimères — vise par défaut 3 à 5 problèmes, exige une preuve visuelle pour tout. |
| `Performance Benchmarker` | Spécialiste des tests de performance et d'optimisation expert, axé sur la mesure, l'analyse et l'amélioration des performances de toutes les applications et infrastructures. |
| `Reality Checker` | Stoppe les validations fantaisistes, certification fondée sur les preuves — répond par défaut « NEEDS WORK », exige des preuves accablantes pour la mise en production. |
| `Test Results Analyzer` | Spécialiste d'analyse de tests expert, axé sur l'évaluation complète des résultats de tests, l'analyse de métriques qualité et la génération d'insights actionnables à partir des activités de test. |
| `Tool Evaluator` | Spécialiste d'évaluation technologique expert, axé sur l'évaluation, le test et la recommandation d'outils, logiciels et plateformes pour un usage professionnel et l'optimisation de la productivité. |
| `Workflow Optimizer` | Spécialiste d'amélioration de processus expert, axé sur l'analyse, l'optimisation et l'automatisation des workflows de toutes les fonctions de l'entreprise pour une productivité et une efficacité maximales. |

## Utilisation

- **Claude Code** : déclenchement auto par description, ou mention explicite (« utilise security-auditor »).
- **OpenCode** : `@<nom-agent>` dans la session (ex. `@tokenomics-designer`), ou délégation auto par l'agent principal.
- **OpenHands / Freebuff** : les skills `agent-*` sont annoncés dans le catalogue (progressive disclosure) ;
  l'agent les invoque quand la tâche correspond, et les `triggers` (mots-clés du nom) accélèrent l'activation.

## Skills non-agents du pack (31)

Skills portables installés à côté des agents (OpenCode, Claude, Freebuff/OpenHands) :

| Skill | Description |
|-------|-------------|
| `api-and-interface-design` | Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend. |
| `browser-testing-with-devtools` | Tests in real browsers via Chrome DevTools MCP. Use when building or debugging anything that runs in a browser. Use when you need to inspect the DOM, capture console errors, analyze network requests, profile performance, or verify visual output with real runtime data. Requires the chrome-devtools MCP server to be configured. |
| `ci-cd-and-automation` | Automates CI/CD pipeline setup. Use when setting up or modifying build and deployment pipelines. Use when you need to automate quality gates, configure test runners in CI, or establish deployment strategies. |
| `code-review-and-quality` | Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch. |
| `code-simplification` | Simplifies code for clarity. Use when refactoring code for clarity without changing behavior. Use when code works but is harder to read, maintain, or extend than it should be. Use when reviewing code that has accumulated unnecessary complexity. |
| `constraint-driven-development` | Establishes a project's quality bar as a written contract and stops agents quietly lowering it. Interviews the user on which dimensions matter, supplies sane default thresholds when they have no number in mind, records everything in CONSTRAINTS.md, and watches the diff for a weakened bar — new @ts-ignore or eslint-disable suppressions, skipped or deleted tests, assertions stripped out, unimplemented stubs, thresholds edited down. Use when no quality bar is written down, when the user says "set up constraints" or "define our standards", when the user wants dimensions they care about — accessibility, web performance, coverage — set up as enforced constraints, when an agent keeps silencing checks or skipping tests to get to green, when you need a coverage or performance threshold and don't know what number to pick, or when an agent writes more code than anyone will read. |
| `context-engineering` | Optimizes agent context setup. Use when starting a new session, when agent output quality degrades, when switching between tasks, or when you need to configure rules files and context for a project. |
| `debugging-and-error-recovery` | Guides systematic root-cause debugging. Use when tests fail, builds break, something that worked yesterday broke, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need to figure out what broke and why — a systematic approach to finding and fixing the root cause rather than guessing. |
| `deprecation-and-migration` | Manages deprecation and migration. Use when removing old systems, APIs, or features. Use when migrating users from one implementation to another. Use when migrating a database schema in production, such as renaming or dropping a column without downtime (expand/contract). Use when deciding whether to maintain or sunset existing code. |
| `documentation-and-adrs` | Records decisions and documentation. Use when you need to document an architecture decision (ADR) or the reasoning behind a design choice, when changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase. |
| `doubt-driven-development` | Subjects every non-trivial decision to a fresh-context adversarial review before it stands. Use when you want every assumption cross-examined before proceeding, when stress-testing a plan for hidden failure modes, when correctness matters more than speed, when working in unfamiliar code, when stakes are high (production auth, security-sensitive logic, a high-stakes migration, irreversible operations), or any time a confident output would be cheaper to verify now than to debug later. |
| `frontend-ui-engineering` | Builds production-quality, accessible, responsive user-facing UIs. Use when building or modifying interfaces and pages, creating components, implementing layouts, meeting WCAG accessibility requirements, managing state, or when the output needs to look and feel production-quality rather than AI-generated. |
| `git-workflow-and-versioning` | Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, splitting uncommitted work in a messy working tree into clean atomic commits, opening or reviewing a pull request (PR), pushing to a remote, or when you need to organize work across multiple parallel streams. Use when cutting a release, choosing a semantic version bump, tagging, or writing a changelog. |
| `headroom-compression` | Compress tool outputs, logs, JSON, code and files before they reach the LLM via the Headroom proxy running locally on port 8787. Use when token costs are high, context is bloated with repetitive tool output (grep results, build logs, large JSON), or when the user mentions headroom, compression, token savings, or cheaper agents. Also covers headroom CLI usage (wrap, doctor, dashboard, stats, learn) and the headroom MCP server tools (headroom_compress, headroom_retrieve, headroom_stats). |
| `idea-refine` | Refines raw ideas into sharp, actionable concepts through structured divergent and convergent thinking. Use when an idea is still vague, when you need to stress-test assumptions before committing to a plan, or when you want to expand options before converging on one. Triggers on "ideate", "refine this idea", or "stress-test my plan". |
| `incremental-implementation` | Delivers changes incrementally in thin, verifiable slices. Use when implementing any feature or change that touches more than one file, or when picking up the next task from a plan. Use when rolling a change out behind a feature flag, when you're about to write a large amount of code at once, or when a task feels too big to land in one step. |
| `interview-me` | Extracts what the user actually wants instead of what they think they should want. Achieves this through one-question-at-a-time interview until ~95% confidence about the underlying intent. Use when an ask is underspecified ("build me X" without "for whom" or "why now"), when the user explicitly invokes ("interview me", "grill me", "are we sure?", "stress-test my thinking"), or when you catch yourself silently filling in ambiguous requirements before any plan, spec, or code exists. |
| `observability-and-instrumentation` | Instruments code so production behavior is visible and diagnosable. Use when adding logging, metrics, tracing, or alerting. Use when shipping any feature that runs in production and you need evidence it works. Use when production issues are reported but you can't tell what happened from the available data. |
| `performance-optimization` | Optimizes application performance across frontend, backend, queries, and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing, or when profiling reveals bottlenecks. |
| `planning-and-task-breakdown` | Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible. |
| `security-and-hardening` | Hardens code against vulnerabilities. Use when auditing an input handler for vulnerabilities, when handling user input, authentication, data storage, or external integrations, or when checking a login flow is safe against the OWASP Top Ten. Use when building any feature that accepts untrusted data, manages user sessions, or interacts with third-party services. Use when auditing dependencies for known vulnerabilities, triaging package-manager audit findings, or assessing supply-chain risk in a new package. Use when personal data or privacy compliance (GDPR, CCPA) is involved. |
| `security-audit` | Security guidance and vulnerability review for codebases, APIs, services, CLI tools, libraries, and daemons. Use for security questions, focused reviews, vulnerability research, security audits, or pen tests. Run the complete workflow only for explicit codebase audit or pen-test requests, full/comprehensive/end-to-end reviews, or requested report artifacts. |
| `shipping-and-launch` | Prepares production launches. Use when preparing to deploy to production, or when asking what needs to be in place before shipping. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout, or when you need a rollback strategy. |
| `solana-anchor-claude-skill` | "Use when working on Solana software, including one or more of: Solana client code using TypeScript, Rust libraries that use Solana crates, Anchor programs, including Rust program files, TypeScript tests, and Anchor.toml configuration. Designed to create minimal, reusable code without unnecessary duplication." |
| `solana-dev-skill` | Use when user asks to "build a Solana dapp", "write an Anchor program", "create a token", "debug Solana errors", "set up wallet connection", "test my Solana program", "deploy to devnet", or "explain Solana concepts" (rent, accounts, PDAs, CPIs, etc.). End-to-end Solana development playbook covering wallet connection, Anchor/Pinocchio programs, Codama client generation, LiteSVM/Mollusk/Surfpool testing, and security checklists. Integrates with the Solana MCP server for live documentation search. Prefers framework-kit (@solana/client + @solana/react-hooks) for UI, wallet-standard-first connection (incl. ConnectorKit), @solana/kit for client/RPC code, and @solana/web3-compat for legacy boundaries. |
| `solana-game-skill` | Use when building a game on Solana — Unity, React Native, or web titles where gameplay loops, player progression, or in-game economies must integrate with the blockchain. Gaming-specific patterns this skill covers that core Solana development does not: Solana.Unity-SDK for Unity, Mobile Wallet Adapter session keys, PlaySolana/PSG1, in-game NFT item systems, token-gated content, on-chain leaderboards and progression, and transaction flows tuned for game feel (batching, latency, failover). Use the core solana-dev skill instead for wallets, RPC, Anchor/Pinocchio programs, and dapp plumbing with no gameplay surface. |
| `source-driven-development` | Grounds every implementation decision in official documentation. Use when you want to verify an approach against the official docs before implementing it, or when you want authoritative, source-cited code free from outdated patterns. Use when building with any framework or library where correctness matters. |
| `spec-driven-development` | Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when drafting a PRD or requirements document with objectives and scope, or when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying. |
| `test-driven-development` | Drives development with tests using the red-green-refactor loop. Use when implementing any logic, fixing any bug, or changing any behavior. Use when you need to prove that code works, when a bug report arrives, or when you're about to modify existing functionality. |
| `typesafe-ai` | > |
| `using-agent-skills` | Discovers and invokes agent skills. Use when starting a session, or when you need to decide which skill or workflow applies to the piece of work at hand. This is the meta-skill that governs how all other skills are discovered and invoked. |

---
*Fichier généré automatiquement par `scripts/generate-agents-catalogue.js` — régénérer après ajout d'agents dans `agent-skills/agents/`.*
