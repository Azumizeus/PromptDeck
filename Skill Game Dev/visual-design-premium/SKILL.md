---
name: Premium Visual Design System
description: Cadre générique pour concevoir, auditer et faire évoluer une interface premium accessible; à utiliser pour toute UI web, mobile, desktop ou in-game.
---

# Premium Visual Design System

## Mission

Utiliser ce skill pour transformer un besoin d’interface en direction visuelle cohérente, premium et accessible, sans dépendre d’une marque, d’un moteur ou d’un produit particulier. Il s’applique avant la production (direction), pendant l’implémentation (tokens et composants) et lors d’une review de screen.

Les exemples et tables détaillés se trouvent dans **[REFERENCE.md](REFERENCE.md)** : les charger seulement quand un gabarit CSS, Tailwind, calcul ou exemple de composant est nécessaire.

## Décisions dans l’ordre

1. **Hiérarchie avant décoration** : définir l’objectif primaire du screen, l’action principale, les informations secondaires et les états exceptionnels. La lisibilité et la vitesse de compréhension priment sur l’effet premium.
2. **Tokens avant valeurs isolées** : centraliser couleur, type, spacing, radius, elevation, motion et focus. Toute exception doit être nommée et justifiée.
3. **Grille 4/8** : utiliser des incréments de 4 px pour les détails et de 8 px pour les espacements structurants. Ne pas forcer la grille si elle nuit au contenu; documenter l’écart.
4. **Contraste et modes** : vérifier chaque paire foreground/background dans chaque thème et état. Le contraste ne se “répare” pas avec une ombre seule.
5. **Progressive disclosure** : montrer d’abord l’essentiel; révéler densité, aide et actions avancées au moment opportun.

## Système de tokens minimal

- **Couleurs** : une échelle neutre, une couleur d’accent, des ramps sémantiques (`success`, `warning`, `danger`, `info`) et des tokens de surface/text/icon/border. Prévoir des couleurs de texte et d’icône distinctes.
- **Typographie** : une famille lisible, une famille display seulement si elle reste lisible, et une échelle documentée. Au minimum : `caption`, `body`, `body-lg`, `title`, `display`. Contrôler line-height, longueur de ligne et fallback.
- **Spacing** : base 4; structure en 8; réserver les grands gaps à la hiérarchie, pas à du remplissage.
- **Shape** : radius cohérents par niveau (contrôle, carte, container); ne pas arrondir tout indistinctement.
- **Elevation** : exprimer la profondeur par surface + bord subtil + ombre parcimonieuse. Les ombres doivent disparaître proprement en dark mode.
- **Focus** : focus visible, non recouvert, avec une épaisseur et un contraste suffisants; ne jamais supprimer l’indicateur clavier.

## Accessibilité et contraste

- Cible par défaut : **WCAG 2.2 AA**. Texte normal : contraste minimal 4.5:1; grand texte : 3:1. Pour AAA, viser 7:1 pour texte normal et 4.5:1 pour grand texte.
- Les composants essentiels et états graphiques non textuels doivent atteindre 3:1 contre les couleurs adjacentes pertinentes.
- Ne pas communiquer une information par la couleur seule; ajouter libellé, forme, icône ou pattern.
- Tester clavier, focus, zoom/reflow, contenu long, erreurs et dark mode. Respecter les exigences de taille et de cible définies par le produit et les critères WCAG applicables, sans promettre la conformité sur la seule base d’un ratio.
- Pour une validation exacte, utiliser la formule de **REFERENCE.md** et mesurer les couleurs rendues, pas seulement les tokens.

## Dark mode, glass, bloom et glow

- Dark mode : réduire la luminance des surfaces, pas simplement inverser les couleurs; conserver une hiérarchie de plans et éviter le noir absolu partout.
- Glassmorphism : réserver le blur/transparence aux surfaces secondaires sur un fond contrôlé; fournir un fallback opaque et vérifier le contraste quand le contenu arrière change.
- Bloom/glow : traiter comme accent focal ou feedback d’état. Un seul halo fort par zone; éviter le halo autour du texte courant, des bordures de focus ou de tous les boutons.
- Toute décoration doit survivre à un affichage sans effets (performance, export, daltonisme, reduced transparency).

## États de composants à spécifier

Pour chaque composant interactif, concevoir au minimum : `default`, `hover` (si pointer), `focus-visible`, `pressed/active`, `selected`, `disabled`, `loading`, `error`, `success`, `empty` et `overflow/content-long` selon le contexte. Vérifier aussi contraste, affordance, hit area, texte localisé et transition entre états.

## Checklist de review d’un screen

- [ ] L’objectif et l’action primaire sont identifiables en quelques secondes.
- [ ] Les alignements, gaps et largeurs suivent une logique; aucun élément n’est “presque” aligné.
- [ ] Les tokens dominent; les valeurs ad hoc sont expliquées.
- [ ] Le contraste a été testé dans les thèmes et états, avec focus visible.
- [ ] La hiérarchie typographique résiste au zoom et au contenu long.
- [ ] Le décor n’entre pas en compétition avec l’information ni les actions.
- [ ] Les erreurs, chargements, vides, disabled et permissions ont un rendu utile.
- [ ] Les surfaces translucides ont un fallback; la performance n’est pas sacrifiée.
- [ ] La critique distingue problème d’utilité, de lisibilité, de cohérence et de finition.

## Rubrique de critique (0–3 par axe)

1. **Clarté** : objectif, hiérarchie, scan.
2. **Cohérence** : tokens, grille, composants, états.
3. **Accessibilité** : contraste, focus, zoom, alternatives à la couleur.
4. **Densité** : information utile sans surcharge.
5. **Finition** : typographie, alignements, surfaces, détails.
6. **Robustesse** : contenu long, dark/light, responsive, performance.

Un score n’est pas une conformité automatique. Prioriser les défauts qui empêchent une tâche, puis les défauts de lisibilité, puis la finition. Joindre pour chaque critique : preuve visible, impact, recommandation testable.
