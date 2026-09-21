---
name: Game Audio Direction
description: Defines a coherent musical identity, loops, mixing, and audio prompts. Use to compose, generate, or integrate a game's music.
---

# Game Audio Direction

## Vue d’ensemble

Une bande-son cohérente fixe avant toute production trois invariants : **une tonalité**, **une famille de tempos** et **un motif récurrent**. Les instruments, l’humeur et l’intensité peuvent varier, mais ces repères restent stables. Cette discipline est particulièrement importante avec la génération assistée par IA.

## Règles et décisions fondamentales

- Choisir une seule tonique, généralement en mineur, pour tout le projet ; varier le mode plutôt que la tonique.
- Écrire un motif de **3 à 5 notes** dans cette tonalité et le réemployer à chaque morceau.
- Définir un BPM de base et des relations fixes entre les états de jeu.
- Composer chaque morceau comme une boucle dès le premier temps : pas d’intro, pas de fondu, pas de silence ajouté au raccord.
- Garder la musique au-dessus de **80 Hz** ; laisser le grave profond aux effets sonores.
- Valider dans le jeu, avec les SFX, à volume de téléphone et sur le haut-parleur cible — jamais en solo seulement.
- Déclencher le ducking lors des événements lourds, pas à chaque tir ou clic.

### Modes et fonction narrative

| Mode | Caractère | Emploi typique |
|---|---|---|
| Mineur naturel (éolien) | Standard, mélancolique | Thèmes principaux |
| Dorien | Mineur avec élévation | Exploration, hub |
| Phrygien | Tendu, instable | Zones hostiles ou corrompues |
| Mineur harmonique | Dramatique, exotique | Boss |
| Majeur | Résolu, lumineux | Victoire seulement |

### Famille de tempos (base = 126 BPM comme exemple)

| Type | Relation | Exemple |
|---|---:|---:|
| Menu | base × 0,70 | 88 BPM |
| Exploration | base × 0,85 | 107 BPM |
| Combat | base | 126 BPM |
| Boss | base × 1,33 | 168 BPM |
| Victoire / défaite | libre | — |

### Boucles et niveaux cibles

| Paramètre | Valeur / règle |
|---|---|
| Durée d’un morceau bouclé | 60–120 s |
| Longueur musicale | 32, 64 ou 128 mesures entières |
| Test du raccord | 10 répétitions minimum |
| Ducking musique | −3 à −6 dB, relâchement 200 ms |
| Musique | −18 à −14 LUFS |
| Ambiance | −24 LUFS |
| SFX | −12 à −8 LUFS |
| Interface | −16 LUFS |
| Voix | −10 LUFS |

## Checklist de production

- [ ] Tonique, mode par état, BPM de base et motif sont écrits dans la spécification.
- [ ] Le motif fonctionne lentement sur un pad et rapidement sur un lead.
- [ ] La première mesure peut suivre naturellement la dernière.
- [ ] La boucle est testée dix fois et inspectée au raccord.
- [ ] Rien dans la musique ne descend sous 80 Hz.
- [ ] Le mixage est contrôlé avec explosions, interface et voix actives.
- [ ] Les durées de transition sont adaptées à l’intention.
- [ ] Les formats mobiles, le déverrouillage après geste et les interruptions sont testés.

## Quand appliquer

Appliquer cette compétence avant de générer ou composer plusieurs morceaux, lors de l’ajout d’un nouvel état de jeu, avant une validation audio mobile, et quand une bande-son paraît être une compilation plutôt qu’un univers. Produire d’abord le combat, puis le boss, ensuite le menu et l’exploration, les variantes de zone, puis les stings de 3 à 8 secondes.

## Ressources

Voir [`REFERENCE.md`](REFERENCE.md) pour la table de spécification, les snippets de vérification de boucle, le crossfade equal-power, le ducking, les contraintes mobiles et le budget de fichiers.
