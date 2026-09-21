---
name: Motion & Animation System
description: Cadre générique pour spécifier une motion UI performante, utile et accessible; à utiliser pour transitions, feedbacks et orchestration dans tout produit numérique.
---

# Motion & Animation System

## Mission

Employer ce skill pour rendre les changements d’état compréhensibles, donner du feedback et créer une continuité spatiale sans ralentir l’utilisateur. Il convient aux interfaces web, mobile, desktop et in-game. **[REFERENCE.md](REFERENCE.md)** contient les variants Framer Motion, keyframes CSS, patterns GSAP et outils de diagnostic; ne charger ces extraits qu’au moment de coder.

## Règles de décision

1. **La motion explique une relation** : origine, destination, cause, priorité ou résultat. Si elle n’explique rien, la supprimer.
2. **Le feedback d’action est prioritaire** : confirmer immédiatement l’interaction; réserver les animations longues à une transition de contexte.
3. **Échelle de durée** : `instant` 0–80 ms (réponse tactile/état), `fast` 120–180 ms (micro-interaction), `base` 200–320 ms (composant), `slow` 360–600 ms (contexte). Au-delà, demander une raison claire.
4. **Easing** : standard pour déplacement combiné, decelerate pour entrée, accelerate pour sortie; spring pour matière/drag quand l’overshoot est utile. Les valeurs de référence sont dans REFERENCE.md.
5. **Budget frame** : viser une mise à jour sous ~16,7 ms à 60 Hz et ~8,3 ms à 120 Hz, en gardant une marge pour le système et le contenu.

## Patterns

- **Entrance** : révéler d’abord le container puis son contenu si cette séquence clarifie la hiérarchie; opacity + transform court, sans flash.
- **Exit** : réduire l’attention avant de retirer; ne jamais bloquer la navigation sur une sortie décorative.
- **Shared layout** : animer la continuité d’un élément qui change de place; éviter de déplacer des éléments non concernés.
- **Stagger** : utiliser une courte cadence et un cap; privilégier une entrée groupée lisible à une cascade interminable.
- **Micro-interactions** : hover = feedback léger; press = compression/offset bref; success/error = signal court et redondant avec le texte ou l’icône.

## Performance

Animer par défaut **`transform` et `opacity` uniquement**. Éviter `top`, `left`, `width`, `height`, `box-shadow`, `filter` et propriétés qui déclenchent layout/paint; préférer wrapper transformé, `clip-path` avec mesure, ou transition discrète. Vérifier compositing, mémoire, scroll, listes et appareils modestes. Ne pas ajouter `will-change` partout.

## Reduced motion, première classe

- Respecter `prefers-reduced-motion: reduce` dès la conception, pas en patch final.
- Remplacer les trajets et parallax par changement instantané, fade minimal ou indicateur d’état non animé.
- L’information ne doit jamais dépendre du mouvement, du blink, du timing ou du son seul.
- Prévoir un réglage produit si pertinent, sans contredire le signal système.

## Quand ne PAS animer

Ne pas animer : chaque ligne d’une liste dense, le texte courant, une erreur urgente, une action de sécurité, un focus clavier, une mise à jour très fréquente, un écran déjà chargé, un mouvement pouvant provoquer nausée ou confusion, ou une séquence dont l’utilisateur ne peut pas interrompre l’attente. Respecter aussi les limites liées au flashing et aux effets visuels de WCAG 2.2.

## Checklist de review

- [ ] La cause, la cible et le résultat sont compréhensibles sans motion.
- [ ] Chaque durée et easing est justifié par le contexte.
- [ ] L’entrée ne retarde pas l’action; la sortie ne bloque pas la tâche.
- [ ] Le chemin performant utilise transform/opacity et garde une marge frame.
- [ ] Le comportement reduced-motion a été testé avec clavier, touch et lecteur d’écran.
- [ ] Les listes, interruptions, erreurs, réseau lent et répétitions sont traités.
- [ ] Aucun flashing, parallax obligatoire ou boucle infinie inutile.
- [ ] Le test inclut 60 Hz et, si ciblé, 120 Hz ainsi qu’un appareil moins puissant.
