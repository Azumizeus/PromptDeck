---
name: Pixel Art & Audio Direction
description: Cadre générique pour diriger pixel art, sprites, animation et audio de jeu avec cohérence, lisibilité et contraintes mesurables; à utiliser en préproduction et production.
---

# Pixel Art & Audio Direction

## Mission

Ce skill établit une direction commune pour l’image pixel art et le son d’un jeu, quel que soit le genre, la plateforme ou le moteur. Il sert à cadrer un brief, contrôler un asset, préparer une génération assistée par AI et organiser une passe de polish. Les gabarits opérationnels sont dans **[REFERENCE.md](REFERENCE.md)**.

## Direction pixel art

- **Palette disciplinée** : commencer avec une palette limitée par scène/biome; chaque couleur a un rôle. Construire des ramps d’ombre vers lumière et pratiquer le hue shifting (ombre souvent plus froide ou plus saturée, lumière légèrement déplacée), sans dégrader la lisibilité.
- **Densité constante** : choisir une résolution logique et un ratio d’upscale entier; conserver l’échelle de pixel, les outlines et le niveau de détail entre assets voisins. Ne jamais mélanger anti-aliasing et bords nets sans intention.
- **Lisibilité avant détail** : silhouette, valeur et pose doivent fonctionner en thumbnail et en mouvement. Séparer sujet/fond par valeur, température ou contour; réserver les couleurs les plus contrastées aux actions et points d’intérêt.
- **Sprites et frames** : définir dimensions, pivot, hitbox, fps, loop, anticipation, contact, recovery et budget de frames avant de dessiner. Réutiliser frames et effets lorsque cela ne nuit pas au timing.
- **Animation** : exagérer anticipation, squash/stretch et follow-through à l’échelle du pixel; tester à la vitesse réelle et en jeu, pas seulement image par image.

## Direction audio

- **Identité tonale** : documenter instrumentation, registre, texture, espace, densité et interdit stylistique. Une identité forte vaut mieux qu’une couche permanente de bruit.
- **BPM indicatifs** : calme 60–90, exploration 80–115, tension 110–150, combat 130–180; ajuster au gameplay, et préférer une cohérence de groove à une valeur “correcte”.
- **Leitmotif** : créer un motif mémorisable de 3–7 notes ou une cellule rythmique; le varier par harmonie, instrumentation, registre et densité plutôt que le répéter à l’identique.
- **SFX en couches** : source (attaque), corps (matière/impact), accent (transitoire), tail (espace). Laisser une version courte et une version riche; éviter que tous les sons occupent le même registre.
- **Mix et loudness** : décider des cibles par plateforme et contexte. Utiliser LUFS comme repère, pas comme vérité isolée; préserver les transitoires et vérifier true peak, clipping, ducking et intelligibilité. Documenter une cible de programme (par exemple autour de −14 LUFS intégré pour un mix de référence, à adapter au produit) au lieu d’imposer une norme universelle.
- **Adaptive music** : séparer stems (rythme, harmonie, texture, intensité), définir règles d’entrée/sortie, quantification musicale, crossfade et comportement en pause/reprise. Les transitions doivent être prévisibles et non fatigantes.

## AI-generation : garde-fous

Un prompt doit préciser : rôle de l’asset, médium/style, contraintes techniques, palette ou identité, composition/durée, références abstraites autorisées, éléments interdits, format de sortie et critères de validation. Ne pas demander une imitation d’un artiste vivant ou d’une franchise; vérifier droits, licence, provenance, cohérence et retouches humaines. L’AI propose; la direction artistique valide.

## Checklist de review

- [ ] Silhouette, valeur et lisibilité à taille réelle et en thumbnail.
- [ ] Résolution, pixel density, pivot, hitbox et upscale documentés.
- [ ] Palette limitée, ramps cohérentes, hue shifting intentionnel.
- [ ] Frames et fps servent le gameplay; loop sans popping.
- [ ] Son identifiable sans masquer voix, UI ou signaux critiques.
- [ ] Motifs et stems ont une règle d’adaptation; aucun cut brutal non intentionnel.
- [ ] Loudness, true peak, mono, petits haut-parleurs et casque vérifiés.
- [ ] Nommage, version, droits, source et statut de validation tracés.
