# three.ws — Guide pour créer des agents 3D senior

2026-09-19

## Comment fonctionne three.ws

C'est un système full-stack open source (dépôt GitHub, licence Apache 2.0) qui combine un visualiseur 3D, un runtime d'agent piloté par LLM, une identité on-chain optionnelle et un web component embarquable. Quatre couches :

1. **Render** — charge et affiche des modèles glTF 2.0 / GLB en WebGL 2.0, entièrement côté navigateur (décompression Draco, KTX2, Meshopt). Pas de traitement serveur.
2. **Embody** — habille l'avatar d'un cerveau LLM. L'agent écoute l'utilisateur, réfléchit (le dépôt cite explicitement Claude comme moteur), déclenche des outils (animations, gestes, mémoire, skills) et exprime des émotions via le blend de morph-targets sur le modèle 3D, en temps réel.
3. **Register** (optionnel) — enregistre l'agent avec une identité on-chain stable, une adresse de wallet, un historique d'actions signé et un score de réputation.
4. **Embed** — distribue l'agent comme web component `<agent-3d>`, intégrable sur n'importe quel site sans plugin ni upload serveur.

Pour ton besoin (avatars des agents NEXUS), tu n'as besoin que des couches 1, 2 et 4. La couche 3 (identité on-chain / wallet) est un bonus facultatif — ignore-la si tu veux juste des avatars visuels connectés à ton propre backend Claude.

## Confirmé vs à vérifier toi-même

J'ai croisé plusieurs sources (dépôt GitHub officiel, Product Hunt, HackerNoon, Hugging Face) plutôt que de me fier au texte que tu m'avais collé. Deux niveaux de fiabilité :

**Solide, recoupé par plusieurs sources indépendantes :**

- Plateforme réelle, pas une invention — lancée fin mai 2026, équipe de 6 personnes menée par Nicholas Resendez.
- Architecture body/brain/wallet/distribution, code source ouvert sous licence Apache 2.0.
- Web component `<agent-3d>`, rendu WebGL2, aucun plugin ni build requis.
- Cerveau LLM branchable, MCP server référencé sur le registre Anthropic.
- Paiements autonomes via le protocole x402 (USDC, pay-per-call).

**Attention, incohérence trouvée — à vérifier avant de connecter un wallet :** Les sources ne s'accordent pas sur la chaîne blockchain utilisée pour l'identité on-chain. Le dépôt GitHub officiel du projet mentionne un enregistrement en tant que token ERC-8004 sur une chaîne EVM (Ethereum et compatibles). Mais la couverture presse (Product Hunt, HackerNoon, le podcast Audible) parle d'identité via **Solana Metaplex**. Il existe aussi un token "THREE" qui circule sur plusieurs chaînes selon les trackers de prix (BNB Smart Chain notamment), ce qui sent le token qui surfe sur le nom sans lien officiel avec la plateforme.

**Ce que ça change pour toi :** pour juste afficher un avatar 3D dans ton fichier NEXUS×SEEKER, aucune de ces couches on-chain ne te concerne — tu n'as pas besoin de connecter de wallet ni d'acheter de token pour utiliser Forge et l'embed `<agent-3d>`. Si un jour tu veux exploiter la couche identité/paiement, vérifie sur la doc officielle (three.ws/docs) et le dépôt GitHub au moment où tu t'y mets, quelle chaîne est réellement utilisée — ne te fie pas à un article de blog ou une page de tracker de prix pour ça.

## Stack technique

| Surface | Usage |
| --- | --- |
| Web component `<agent-3d>` (CDN) | Intégration zéro-build, une balise + un script |
| `@three-ws/sdk`, `@three-ws/avatar`, `@three-ws/agent-ui` | Contrôle programmatique de l'avatar depuis JS/React/Vue/Next |
| `@three-ws/solana-agent` | Couche identité/paiement Solana (facultative, voir section précédente) |
| `@three-ws/mcp-server` | Branche l'agent à d'autres outils via le protocole MCP |
| REST API + dashboard | Création et gestion des agents sans code |
| Forge (three.ws/forge) | Génération du corps GLB à partir d'un texte ou d'une photo |
| Studio (three.ws/studio) | Personnalisation avancée : rigs, animations, expressions |

Pour ton usage (avatar embarqué dans un fichier HTML statique), tu restes sur le web component CDN — pas besoin d'installer de SDK npm ni de toucher à `@three-ws/solana-agent`.

## Parcours débutant → pro

**Palier 1 — Comprendre (aujourd'hui)** Crée ton compte, fais le tour guidé (three.ws/tour), distingue bien Avatar (le corps) et Agent (le corps + cerveau + personnalité + mémoire).

**Palier 2 — Produire un premier agent (cette semaine)** Génère un corps via Forge, configure personnalité/voix/connaissances depuis le dashboard, embarque-le sur une page test. Objectif : un agent qui tourne, pas encore parfait.

**Palier 3 — Devenir créateur sérieux (2-4 semaines)** Maîtrise les animations/clips, la chorégraphie de gestes, les widgets d'embed. C'est ce qui différencie un avatar figé d'un agent qui "vit" à l'écran — ce que tu veux pour une équipe de 7 agents crédibles comme NEXUS×SEEKER.

**Palier 4 — Niveau dev/pro (1-2 mois)** Contrôle l'avatar depuis ton propre code (déclencher animations/expressions en fonction des réponses de ton backend Claude), écris une skill custom si besoin. C'est l'approche qu'on a prise pour NEXUS : le SDK reste une couche visuelle, ton pipeline LLM garde la main.

## Checklist pour un agent senior type NEXUS

- [ ] Prompt Forge écrit pour refléter le rôle (costume/posture/matériaux qui racontent "architecte senior", pas un avatar générique)
- [ ] Personnalité rédigée en 4 blocs : rôle, ton, expertise, limites — pas un simple adjectif ("sérieux")
- [ ] Voix choisie et testée sur une phrase réelle, pas la démo par défaut
- [ ] Avatar connecté à ton propre backend Claude plutôt qu'au cerveau LLM natif de three.ws, pour garder la main sur le contenu et les coûts
- [ ] URL du GLB et ID d'agent documentés quelque part (pas juste dans le dashboard three.ws) — tu géreras 7 agents, pas 1
- [ ] Comportement testé sans wallet connecté, pour confirmer que rien ne bloque si tu ignores la couche on-chain
- [ ] Un nommage cohérent entre le nom de l'agent côté three.ws et celui utilisé dans ton fichier NEXUS×SEEKER, pour éviter la confusion quand tu scaleras aux 7

## Sources consultées

- Dépôt GitHub officiel three-ws/three.ws (README, licence Apache 2.0)
- Annonce de lancement Product Hunt (mai 2026)
- Interview HackerNoon avec l'équipe three.ws
- Article Hugging Face Community (29 août 2026) relayé par Runtimewire
- Pages de tracking de prix du token THREE (fxempire, dappbay) — traitées avec prudence, cohérence chaîne non garantie
