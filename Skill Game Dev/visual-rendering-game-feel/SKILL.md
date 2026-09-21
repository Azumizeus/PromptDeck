---
name: Rendu visuel et game feel
description: Diagnostique et améliore le rendu 2D par bloom, densité de pixels, lumière, contours et feedback d’impact. À utiliser quand le jeu paraît plat ou incohérent.
---

# Rendu visuel et game feel

## Vue d’ensemble

La qualité perçue d’un jeu 2D vient surtout de la cohérence, de la lumière et du feedback, pas de la résolution brute. Diagnostiquer d’abord l’intégration évite de régénérer des assets corrects mais mal affichés.

## Règles et décisions fondamentales

- Identifier le défaut réel avant de retoucher l’art : platitude, flou, lumière incohérente, manque de poids ou contours discordants.
- Ajouter le bloom en premier, mais le rendre désactivable et mesuré ; le plein écran `filter: blur()` coûte cher.
- Viser un ratio source/affichage proche de **2×** pour tous les assets ; signaler < 1,5× ou > 3×.
- Choisir une direction de lumière globale : défaut recommandé, haut-gauche à **45°**, ombres vers bas-droite.
- Décider globalement : contour sombre partout ou nulle part. Si oui : **1–2 px**, plus sombre que le ton le plus sombre, jamais noir pur.
- Réserver hitstop et screenshake aux impacts significatifs ; respecter `prefers-reduced-motion`.
- Secouer le monde, jamais le HUD.

### Diagnostic → correction

| Symptôme | Cause probable | Action |
|---|---|---|
| Plat, sans impact | Glow additif ou contraste absents | Bloom |
| Sprites flous | Densités de pixels différentes | Audit de densité |
| Styles incompatibles | Directions de lumière multiples | Lumière commune |
| Coups sans poids | Feedback absent | Hitstop, shake, flash, recul |
| Aspect amateur | Politique de contours mixte | Décision globale |

### Bloom et feedback : valeurs concrètes

| Effet | Durée / valeur | Usage |
|---|---:|---|
| Bloom normal | alpha 0,75, flou 6 px | Éléments brillants |
| Bloom élevé | alpha 1,0 | Appareils puissants |
| Hitstop lourd | 40–80 ms | Impact important |
| Screenshake | 100–200 ms, décroissance | Explosion, boss |
| Flash | 1–2 frames blanc | Entité touchée |
| Knockback | 2–6 px | Direction de l’impact |

### Ratio de densité

| Affichage | Source recommandée |
|---:|---:|
| 32 px | 64 px |
| 64 px | 128 px |
| 128 px | 256 px |

### Budget indicatif à 60/120 FPS

| Pass | Coût mobile milieu de gamme |
|---|---:|
| Fond | 0,5 ms |
| 200 sprites | 2–4 ms |
| 500 particules | 1–3 ms |
| Bloom, downscale 2 | 3–6 ms |
| Bloom pleine résolution | 8–15 ms |
| UI / HUD | 1–2 ms |

Budgets de frame : **16,6 ms à 60 FPS**, **8,3 ms à 120 FPS**. Le bloom pleine résolution doit donc être une option, non une hypothèse.

## Checklist d’intégration

- [ ] Le défaut a été diagnostiqué avant toute régénération.
- [ ] Le bloom possède des paliers et un interrupteur utilisateur.
- [ ] La densité de chaque asset est entre 1,5× et 3×, cible 2×.
- [ ] La lumière vient du haut-gauche à 45° et les ombres vont bas-droite.
- [ ] La politique de contour est uniforme et le contour n’est pas noir pur.
- [ ] Hitstop, flash, recul et shake sont réservés aux bons impacts.
- [ ] Le HUD reste stable pendant le screenshake.
- [ ] `prefers-reduced-motion` désactive ou réduit les mouvements.
- [ ] Le coût du bloom est instrumenté sur le matériel cible.

## Quand appliquer

Appliquer lors d’un diagnostic « ça paraît plat », après import d’un lot de sprites, avant d’ajouter des effets décoratifs, et pendant l’optimisation mobile. Ordre recommandé : bloom, audit de densité, direction de lumière, contours, puis réglage du game feel.

## Ressources

Voir [`REFERENCE.md`](REFERENCE.md) pour les implémentations JavaScript, les paliers de performance, l’audit de densité, le screenshake à décroissance et le réglage du hitstop.
