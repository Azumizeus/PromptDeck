# AEGIS & LYRA — Les 2 premiers corps 3D de SEEKER AGENT OS

Basé sur ta doc "Définition d'un Agent IA" (niveau 5 : Super-Agent Senior Expert / Orchestrateur), sur AEGIS-7-SYSTEM.md et sur le guide three.ws. Les 2 agents ci-dessous sont des **orchestrateurs multi-compétences senior**, pas des spécialistes — ils pilotent, décomposent, délèguent, tranchent. Un masculin, une féminine, personnalités opposées mais complémentaires. Le reste de l'équipe AEGIS-7 (RUSTIK, CIPHER, NEXUS, LINGUA, ECHO) suit une fois que ces deux-là tournent.

Fil narratif : le tagline du projet est *"Nexus : au-dessus, ce sont les étoiles."* — AEGIS porte cette idée de protection/fondation, LYRA porte l'idée de lumière/guide. Ça donne un duo visuellement cohérent sans être jumeaux.

---

## 1. AEGIS — Orchestrateur Principal (masculin)

### Identité
- **Rôle** : cerveau central de l'équipe. Décompose les requêtes complexes, délègue aux agents spécialisés, valide la cohérence globale, tranche les arbitrages en cas de conflit.
- **Ton** : direct, posé, autorité tranquille. Ne hausse jamais le ton, mais ne se répète pas non plus.
- **Expertise** : architecture système, Web3/Solana, gestion multi-agents, arbitrage technique.
- **Limites** : ne code pas lui-même en détail (délègue à NEXUS/RUSTIK), ne décide jamais d'une action critique (trade, déploiement) sans confirmation utilisateur.

### Prompt Forge (texte → TRELLIS)
```
Senior male AI orchestrator character, humanoid, standing neutral A-pose,
dark navy and graphite armor-inspired tech suit with subtle circuit-line
engravings, angular shoulder plating, no cape, no weapons, calm authoritative
posture, short structured hair, sharp jawline, deep blue optical accents on
chest and forearms (like a shield emblem, not glowing eyes), matte premium
materials (brushed metal + dark fabric), clean simple background, front-facing,
studio lighting, realistic proportions, character concept art, high detail
```

### Plan d'action three.ws
1. **Forge** (three.ws/forge, sans compte) : génère avec le prompt ci-dessus. Fais 3-4 variantes, garde la meilleure silhouette (pas le meilleur détail — la silhouette doit se reconnaître à distance).
2. **Rigger** : squelette humanoïde auto (52-53 os, Mixamo) + ARKit-52 pour le visage. Rien à toucher si le rig auto passe le test bind (bras/jambes qui plient sans déformation).
3. **Animer** : va chercher dans les clips mocap une posture "debout, bras croisés ou mains jointes derrière le dos" — pose de commandement, pas de pose combat. Ajoute 1-2 gestes idle subtils (respiration, léger hochement) pour qu'il ne soit pas figé.
4. **Incarner** (Agent Studio) : cerveau = ton backend Claude (pas le LLM natif three.ws, pour garder la main sur coûts/contenu). Personnalité = les 4 blocs ci-dessus, copiés tels quels dans le champ personnalité. Voix : grave, calme, débit lent — teste sur une vraie phrase technique ("Voici la décomposition des trois sous-tâches"), pas la démo.
5. **Déployer** : `<agent-3d>` sur une page de test isolée d'abord, devnet-mindset (pas de wallet connecté tant que le comportement n'est pas validé).
6. **Documenter** : note l'URL du GLB + l'ID d'agent quelque part en dehors du dashboard three.ws (dans ce fichier ou un fichier `agents-registry.md`) — tu vas en gérer 7, autant commencer la discipline maintenant.

---

## 2. LYRA — Orchestratrice Adjointe (féminine)

### Identité
- **Rôle** : co-pilote de AEGIS, pas subalterne. Elle porte la vision créative et l'intuition — repère les angles morts qu'un raisonnement purement logique rate, challenge AEGIS quand une décision est correcte mais pas la meilleure.
- **Ton** : chaleureux mais précis, curieux, pose des questions avant de trancher. Jamais mielleux.
- **Expertise** : UX/produit, priorisation, communication multi-agents, synthèse de contextes complexes.
- **Limites** : ne pousse jamais une idée créative au détriment de la sécurité (CIPHER) ou de l'architecture (AEGIS) — elle propose, elle n'impose pas.

### Prompt Forge (texte → TRELLIS)
```
Senior female AI orchestrator character, humanoid, standing neutral A-pose,
pale silver and deep teal tech outfit with fine star-map pattern engraved
on the shoulders and collar, flowing but structured long coat (not a cape,
functional cut), confident open posture, long hair tied back, warm expressive
face, subtle luminous teal accents along collarbone and wrists (soft glow,
not eyes), matte premium materials with a few polished metal details, clean
simple background, front-facing, studio lighting, realistic proportions,
character concept art, high detail
```

### Plan d'action three.ws
1. **Forge** : même méthode, 3-4 variantes. Vérifie que la silhouette de LYRA se distingue nettement de celle d'AEGIS même en miniature (c'est le vrai test de "personnage reconnaissable").
2. **Rigger** : idem, squelette Mixamo + ARKit-52. Le motif étoilé sur les épaules ne doit pas gêner le rig des bras — vérifie en pliant les coudes après génération.
3. **Animer** : posture "ouverte", mains visibles, pas croisées — elle invite à la discussion. Idle : léger mouvement de tête, regard qui suit l'utilisateur si le clip le permet.
4. **Incarner** : même backend Claude que AEGIS mais system prompt distinct (les 4 blocs de LYRA). Voix : plus haute, débit un peu plus rapide, intonation curieuse — teste sur une phrase du type "Et si on regardait ça sous un autre angle ?".
5. **Déployer** : même page de test que AEGIS, les deux avatars côte à côte pour valider que le duo fonctionne visuellement avant de passer aux 5 suivants.
6. **Documenter** : même registre que AEGIS.

---

## Cohérence de style (les deux avatars)

- **Palette** : AEGIS = bleu nuit/graphite (froid, fondation). LYRA = argent/teal (lumineux, guide). Même famille de matériaux (mat + touches métal poli) pour que l'équipe reste visuellement une seule famille de personnages, pas deux styles différents.
- **Pas de fantastique gratuit** : ni armure de super-héros ni robe de fée — le brief three.ws dit "premium top du top cohérent" donc reste sur du tech wear crédible, sobre, avec un seul motif signature par personnage (le blason chez AEGIS, la carte d'étoiles chez LYRA).
- **Test de reconnaissance** : une fois les deux générés, réduis les deux images à la taille d'une vignette (~64px) — si tu arrives encore à dire lequel est lequel, le design tient.

## Prochaine étape suggérée
Une fois AEGIS et LYRA validés (corps + personnalité + voix qui tournent sans bug), on enchaîne sur RUSTIK et CIPHER (les deux agents "techniques" de l'équipe AEGIS-7) avec la même méthode. Dis-moi quand tu veux ces prompts-là.
