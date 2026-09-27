# 🎮 MEGA PACK ARENA — Prompt maître du jeu d'activité (2D vue du dessus · 2.5D isométrique vectoriel)

> **But** : une app affichant un jeu (combat arène / course voiture / course moto) dont
> **tous les éléments reflètent l'activité réelle** du prompt deck MEGA PACK et des outils
> (agents générés, skills exécutés, prompts ✍️, équipes lancées, sauvegardes, Obsidian,
> Graphify…). Chaque action dans l'écosystème = événement dans le jeu.
>
> Usage : copie le bloc ci-dessous dans n'importe quel agent de code (Claude Code,
> OpenCode, Freebuff…) — ou dans l'Atelier MEGA PACK (🛠 → personnalise).
> Pour les assets, les sous-prompts du §4 sont à donner à un générateur d'images.

---

## ⭐ Prompt maître (à copier tel quel)

```
CONSTRUIS « MEGA PACK ARENA » — une app desktop (Electron, Node 20) qui affiche un jeu
2D vectoriel connecté à mon écosystème de productivité IA (prompt deck MEGA PACK,
Atelier d'agents, Obsidian, Graphify). Tout ce que je fais dans l'écosystème devient
de l'action visible dans le jeu, en temps réel.

## 1. ARCHITECTURE
- Electron 3 fenêtres : (a) JEU plein écran (canvas 2D, 60 fps), (b) OBSERVATOIRE
  (HTML : flux d'événements, statistiques, classements), (c) Réglages (toggles des
  sources d'événements, taille de la zone).
- Centre de décision : le jeu choisit chaque matin entre COMBAT (arène vue du dessus)
  et COURSE (circuit voiture/moto vue du dessus) selon l'activité de la veille :
  activité haute → arène (journée intense) ; activité faible → course (régularité).
- Bus d'événements local : fichier NDJSON `~/Library/Application Support/megapack-arena/events.ndjson`
  (append-only, rotation 7 jours) + WebSocket local (port 8765) pour le temps réel.
- Connecteurs (Node, un fichier par source, tous désactivables) :
  1. MEGA PACK : lit `~/Library/Application Support/megapack-menubar-luxe/`
     (mgp-prefs.json : recents/favoris, my-agents.json, my-skills.json, my-teams.json,
     my-trash.json) + l'IPC de l'app si elle tourne. Événements : prompt copié,
     ✍️ créé/édité, agent généré, équipe exécutée, backup fait, item verrouillé/supprimé.
  2. Obsidian : `chokidar` sur le vault (chemin configurable) → note créée/modifiée
     = ramassage d'un « fragment de savoir » sur la carte.
  3. Graphify : surveillance du dossier d'export → chaque graphe généré = un « boost ».
  4. OpenCode / Freebuff : hooks log ou schémas URL (best effort, off par défaut).
- Aucune donnée ne quitte la machine. Tout est local.

## 2. MAPPING ACTIVITÉ → JEU (le cœur du système)
| Événement écosystème | Effet combat (arène) | Effet course | Effet commun |
|---|---|---|---|
| Prompt ✍️ copié | coup d'épée | boost nitro | +XP |
| Skill exécuté (agent lancé) | attaque spéciale | turbo activé | petit dégât/avance |
| Agent généré (Atelier) | NOUVEAU FIGHTER rejoint l'arène | NOUVELLE VOITURE/MOTO au garage | personnel |
| Équipe 🕸 exécutée | invocation d'alliés (les agents de l'équipe) | team relay (pit-stop éclair) | XP ×2 |
| Note Obsidian créée/modifiée | fragment de savoir récupéré | pièce de piste | +XP |
| Graphe Graphify généré | boost de puissance | drift parfait | effet visuel doré |
| Sauvegarde 💾 / backup | bouclier 24 h | réparation complète | coffre |
| 🔒 Verrou posé | armure renforcée (l'item devient intouchable) | châssis blindé | coffre |
| 🗑 Suppression | l'ennemi « Bug » perd un point de vie | obstacle en moins | XP −2 |
| Journée sans activité | l'ennemi régénère, piste boueuse | pneus froids | streak ×1.5 cassé |
- Stats persistées : XP, niveau, streak de jours, victoires, records de tour, garage, roster.
- Chaque « fighter » de l'arène = UN de tes agents réels (nom + icône + catégorie) ;
  chaque véhicule = UN de tes skills. Le garage/roster EST ton catalogue, vivant.

## 3. RENDU (SVG-DOM, mode vectoriel pur)
- Monde dessiné en SVG (100 % vectoriel, zoom sans pixelisation, export PNG/PDF 4K).
- Combat : arène top-down (octogone), fighters = silhouettes géométriques stylisées
  (triangle/cercle/hexagone), barres de vie, projectiles = arcs et losanges,
  hit-flash, screen-shake léger, particules vectorielles.
- Course : circuit top-down fermé (courbes de Bézier), voiture/moto = capsule avec
  roues, traînées de pneus, nitro = flamme vectorielle, minimap, chronos par tour.
- Caméra 2.5D optionnelle (toggle) : translation d'ombre portée + parallaxe à 3
  couches (sol / acteurs / HUD) pour un effet isométrique léger, sans sprite 3D.
- Thème reprenant les variables de l'app (--vio #9945ff, --grn #14f195, glass sombre).
- 60 fps : boucle requestAnimationFrame, entités en classes simples ; aucune lib de jeu
  externe obligatoire (tweens maison de ~30 lignes suffisent).

## 4. GÉNÉRATION DES ASSETS (me donner les 4 sous-prompts prêts à coller)
a) PERSONNAGES/FIGHTERS (10 variantes) : « Silhouette de combattant vue du dessus,
   style vectoriel plat (flat design, 3 couleurs max : violet #9945FF, vert #14F195,
   noir), géométrie simple (triangles/cercles), contour net 3 px, fond transparent,
   export SVG 512×512, pose de combat dynamique, variante {n} : {épéiste|archer|
   mage|invocateur|ninja…} »
b) VÉHICULES (8 variantes) : « Voiture sport / moto vue du dessus, flat vectoriel,
   3 couleurs max (#9945FF/#14F195/noir), roues visibles, ombre portée intégrée au
   groupe SVG, fond transparent, 512×512, variante {F1|rally|moto GP|prototype…} »
c) DÉCORS (12 tuiles) : « Tuile de sol top-down seamless 256×256, flat vectoriel :
   {arène octogonale|asphalte de circuit|herbe|sable|grille de départ|zone pit…},
   2-3 tons, sans dégradé, motif répétition parfaite »
d) ÉLÉMENTS/HUD (24 icônes) : « Icône flat vectorielle 64×64, stroke 2 px,
   {épée|bouclier|nitro|clé|coffre|engrenage|trophée|éclair|pièce|drapeau…},
   fond transparent, 2 couleurs (#9945FF/#14F195) »
- Chaque asset doit s'ouvrir proprement dans Inkscape/Illustrator et être animable
  (groupes nommés : wheel_front, arm_sword…). Prévois un dossier `assets/svg/`
  et un manifeste JSON (nom, source, licence, checksum).

## 5. QUALITÉ & LIVRABLES
- Tests Node (vitest) : mapping d'événements (chaque ligne du tableau = 1 test),
  persistence des stats, connecteur NDJSON (append/rotation), calculs de course.
- Clavier : Espace pause · N panneau journal · G garage/roster · C changer de mode.
- Livrables : code commenté en français, README de lancement, doc de mapping imprimable.
- Étapes demandées : (1) squelette Electron + bus NDJSON, (2) scène combat jouable
  avec 3 fighters factices, (3) scène course jouable, (4) connecteurs MEGA PACK +
  Obsidian + Graphify, (5) HUD/observatoire, (6) tests + README. Livre étape par
  étape, chaque étape doit tourner avant la suivante.

Ne pose pas plus de 3 questions avant de commencer. Commence par l'étape 1.
```

---

## 🔧 Sous-prompts d'assets (à coller dans un générateur d'images IA, un par un)

Chaque sous-prompt est indépendant. Remplace `{n}`/`{...}` par tes choix, génère, puis
dépose les fichiers dans `assets/svg/` de l'app (ou glisse-les dans le panneau MEGA PACK
pour les garder en ✍️/notes).

1. **Fighters (personnages)** — voir §4a du prompt maître. Astuce série : garde la même
   caméra (strict top-down), la même palette et la même échelle (la tête ~15 % de la
   hauteur) pour la cohérence du roster.
2. **Véhicules** — §4b. Astuce : demande aussi une variante « avec ombre séparée » si tu
   veux activer le mode 2.5D (ombre décalée = illusion de hauteur).
3. **Tuiles de décor** — §4c. Exige le « seamless » : c'est ce qui permet de dessiner
   des circuits/arènes de n'importe quelle taille par répétition.
4. **Icônes/HUD** — §4d. Le stroke 2 px uniforme garde le HUD lisible à toutes tailles.

### Variante 2.5D isométrique (si tu préfères le look iso)
Remplace dans les prompts : « vue du dessus stricte » → « vue isométrique 2:1 (angle
~30°), grille iso, ombre portée intégrée, style flat vectoriel ». Le code du rendu
passe alors les coordonnées par `isoX = (x - y) * cos(30°)`, `isoY = (x + y) * sin(30°)`
— demande-le explicitement à l'agent : « implémente la projection iso 2:1 avec tri de
profondeur par y ».

## 🔌 Brancher le deck MEGA PACK (résumé)
- L'app lit déjà tout dans `~/Library/Application Support/megapack-menubar-luxe/` :
  le connecteur 1 du prompt maître n'a **aucune modification de l'app à faire**.
- Pour les événements instantanés (copie, génération), ajoute un `webContents.send`
  vers le port 8765 — je peux te l'ajouter sur demande (« branche le bus temps réel »).
- Obsidian : mets le chemin du vault dans les Réglages du jeu (chokidar, debounce 500 ms).
- Graphify : surveille le dossier d'export (déjà producteur de fichiers datés).

## ✅ Definition of done (pour vérifier le travail de l'agent)
1. `npm start` ouvre le jeu ; une copie de prompt dans MEGA PACK déclenche un coup/boost
   visible en < 2 s (WebSocket) et apparaît dans le journal.
2. Générer un agent dans l'Atelier ajoute un fighter/véhicule nommé d'après lui.
3. Les tests du §5 passent ; le mapping du tableau §2 est intégralement couvert.
4. Un dossier `assets/svg/` avec manifeste ; 10 fighters, 8 véhicules, 12 tuiles, 24 icônes.
5. Export PNG 4K de la scène possible (vectoriel → raster sans perte de netteté).
