---
name: Discipline de palette pixel art
description: Impose palette, grille, contraste et mise à l’échelle cohérents pour les assets pixel art. À utiliser pour générer, auditer ou intégrer des sprites.
---

# Discipline de palette pixel art

## Vue d’ensemble

Le pixel art reste cohérent grâce aux contraintes partagées, pas seulement à la qualité de chaque asset. Une palette, une grille, une direction de lumière et une règle d’alpha communes permettent de mélanger génération IA, artistes et packs externes sans dérive.

## Règles et décisions fondamentales

- Limiter tout le projet à **32 couleurs maximum**, dont une couleur transparente.
- Réserver **6 neutres partagés** à tous les assets, puis **8 à 12 couleurs par sous-palette** de zone, biome ou faction.
- Un asset ne prélève que dans les 6 neutres et sa sous-palette.
- Ne jamais utiliser le noir pur `#000000` comme ombre ; préférer un noir teinté.
- Réserver une couleur de signal à une seule signification (joueur, interaction ou succès), jamais décorative.
- Choisir une taille de tuile de base : 8 px, 16 px ou 32 px ; toutes les dimensions en sont des multiples.
- Utiliser uniquement un agrandissement entier avec filtrage nearest-neighbour ; jamais de facteur non entier.
- Exiger bords nets, absence d’anti-aliasing, absence de gradients et alpha binaire (0 ou 255).
- Auditer chaque asset à côté de trois voisins avant intégration.

### Neutres partagés

| Rôle | Valeur suggérée | Usage |
|---|---|---|
| Noir profond | `#050308` | Fond, ombre extrême |
| Ombre | `#1a1626` | Occlusion, dessous |
| Gris moyen | `#4a4560` | Surfaces neutres |
| Gris clair | `#9691a8` | Surfaces éclairées |
| Blanc cassé | `#e8e4f0` | Rehauts |
| Blanc pur | `#ffffff` | Spéculaires, étincelles uniquement |

### Sous-palette par zone

| Emplacement | Règle |
|---|---|
| Primaire | Couleur identitaire de la zone |
| Ombre primaire | Même teinte, −40 % de luminosité, +10 % saturation |
| Secondaire | Teinte complémentaire ou adjacente |
| Ombre secondaire | Même traitement |
| Accent | Saturation forte, < 5 % des pixels |

Les ombres déplacent la teinte : vers bleu/violet sous lumière froide, vers rouge sous lumière chaude, plutôt que de simplement réduire le RGB.

### Grille et tailles

| Base | Usage typique |
|---:|---|
| 8 px | Rétro serré |
| 16 px | Équilibre courant |
| 32 px | Sprites détaillés |

| Asset | Taille relative |
|---|---:|
| Petite entité | 1× base |
| Entité standard | 2× base |
| Grande entité | 4× base |
| Boss | 6–8× base |
| Tuile | exactement 1× base |
| Icône | 1× ou 2× base |

### Contraste minimal

| Élément | Ratio minimal |
|---|---:|
| Joueur / fond | 4,5 |
| Ennemi / fond | 3,0 |
| Projectile / fond | 4,5 |
| Texte UI / panneau | 4,5 (WCAG AA) |
| Décoratif / fond | 1,5 |

## Checklist d’audit

- [ ] Le nombre de couleurs opaques respecte le budget global de 32.
- [ ] Les couleurs viennent de la palette autorisée de l’asset.
- [ ] Les dimensions sont des multiples exacts de la grille.
- [ ] Alpha uniquement 0 ou 255 ; aucun pixel semi-transparent.
- [ ] Aucun anti-aliasing, gradient ou bord lissé.
- [ ] La lumière vient de la direction commune.
- [ ] Les contrastes joueur, ennemi, projectile et UI passent les seuils.
- [ ] L’asset est comparé à trois voisins, pas jugé seul.
- [ ] La palette est une source unique versionnée et contrôlée en CI.

## Quand appliquer

Appliquer avant toute génération d’asset, lors de l’intégration d’un pack externe, après une modification de palette, et avant chaque ajout au jeu. Si un asset dépasse le budget, le requantifier ; ne pas l’accepter tel quel.

## Ressources

Voir [`REFERENCE.md`](REFERENCE.md) pour l’extraction, la quantification, le calcul de contraste, les palettes d’exemple, les prompts et les diagnostics de panne.
