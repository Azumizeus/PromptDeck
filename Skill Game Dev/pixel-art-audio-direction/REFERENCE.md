# Référence — Pixel Art & Audio Direction

## Templates de palette

| Rôle | Base | Ombre | Lumière | Usage |
|---|---|---|---|---|
| Neutre | `N-500` | `N-700` | `N-200` | volumes, UI |
| Accent chaud | `H-500` | `H-700` | `H-200` | danger, focus |
| Accent froid | `F-500` | `F-700` | `F-200` | magie, info |

**Fiche par ramp** : `nom`, `rôle`, `valeur de départ`, `nombre de marches`, `hue shift`, `couleurs interdites`, `contraste avec fond`. Tester la palette en niveaux de gris et avec simulations de déficiences de couleur.

## Spécification sprite/animation

| Champ | Exemple à renseigner |
|---|---|
| Asset ID | `actor_player_idle_v01` |
| Canvas logique | `W×H px` |
| Pixel density / upscale | `1× logique, upscale entier` |
| Pivot / origine | `centre bas` |
| Hitbox / hurtbox | `rect / liste` |
| Frames / fps | `N / N fps` |
| Loop / événements | `oui/non; frame events` |
| Budget mémoire | `format, atlas, limite` |
| Palette | `nom + rampes` |
| Export | `PNG indexé ou format moteur` |
| Validation | `thumbnail, gameplay, color-blind, droits` |

## Convention audio

`<scope>_<type>_<subject>_<action>_<variant>_<intensity>_v<NN>.<ext>`

Exemples génériques : `ui_sfx_confirm_click_a_soft_v01.wav`, `combat_sfx_hit_metal_b_heavy_v02.wav`, `world_music_explore_day_stem_harmony_v03.ogg`. Utiliser ASCII stable pour les IDs, un dictionnaire de variantes, la durée et le sample rate dans les métadonnées de build.

## Prompts de génération

### Pixel art
```text
Rôle: concept artist pixel art pour un jeu générique.
Asset: [sujet + action + silhouette].
Contraintes: [canvas logique], [ratio d’upscale entier], bords nets, aucune interpolation,
palette limitée [nombre approximatif + rôles], ramps avec hue shifting discret.
Composition: [vue, pose, espace négatif, point focal].
À éviter: anti-aliasing, bruit aléatoire, texte, watermark, détails illisibles, style d’une franchise ou imitation d’un artiste vivant.
Sortie: planche propre + description des couleurs, pivot et frames proposées.
Validation humaine: lisibilité thumbnail, niveaux de gris, intégration au fond, droits et retouche manuelle.
```

### Musique
```text
Rôle: compositeur de game audio pour un projet générique.
Contexte: [situation de jeu], fonction émotionnelle [objectif].
Identité: [instrumentation], [registre], [texture], [espace], [éléments interdits].
Structure: [BPM], tonalité/mode ou ambiguïté, motif de 3–7 notes, durée de loop,
points de transition et stems [rythme/harmonie/texture/intensité].
Mix: headroom, cible LUFS du produit, true peak documenté, version petits haut-parleurs.
À éviter: mélodie reconnaissable existante, imitation d’artiste, mastering écrasé, queue coupée.
Sortie: mix, stems, loop points, tempo map, metadata et variantes.
```

### SFX
```text
SFX pour [action] vu à [distance], matière [source], intention [impact/feedback/menace].
Couches: attaque [ ], corps [ ], accent [ ], tail [ ].
Durée cible [ ], variantes [ ], registre à préserver pour [voix/UI].
Versions: dry, mix-ready, low-bandwidth; sortie mono/stéréo selon usage, sans clipping.
```

## Mixing checklist

- [ ] Session à sample rate et bit depth convenus; noms et versions stables.
- [ ] Peak, true peak, LUFS intégré/short-term et dynamique mesurés.
- [ ] Headroom conservé avant mastering; aucun clipping inter-sample.
- [ ] Mono compatibility, phase, casque, petits haut-parleurs et volume faible testés.
- [ ] Ducking priorise voix, UI et signaux de gameplay critiques.
- [ ] Boucles et transitions testées en répétition, pause, reprise et changement rapide d’état.
- [ ] Stems équilibrés ensemble et séparément; absence de fréquences masquantes inutile.
- [ ] Export, licence, source, auteur/outils et statut de validation archivés.
