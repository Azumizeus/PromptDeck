# MEGA PACK v1.1.0 — Notes de release

> Date : 27 septembre 2026 · Runtime Electron 33.4.11 · Catalogue : **136 skills · 190 agents · 326 experts** (326 items embarqués)
>
> **ADDENDUM (27/09, post-release)** : fusion de l'ancien layout `skill/` (+41 agents, +3 skills) et
> ajout des 38 skills du « My Claude resource vault » → catalogue porté à **177 skills · 231 agents ·
> 408 experts**. Les DMG ci-dessous embarquent le catalogue 326 items de la release ; les builds
> suivants embarqueront 408 items.
>
> **ADDENDUM 2 (27/09, Luxe 2.19.x)** : resize des poignées **réellement réparé** (2.19.0) — cause
> racine : `window.resizeTo/moveTo` sont des no-ops dans une fenêtre principale Electron + décalage
> de 28 px par frame (barre de titre cachée) ; nouveau routage IPC `panelGeometry` avec ancrage du
> bord opposé, validé au pixel sur les 4 coins. **2.19.1** : bouton 📌 épingler de nouveau persistant
> (pont preload `setKeepVisible` rétabli), **3 feux macOS** (rouge/jaune masquer, vert = taille) dans
> le header des fenêtres transparentes, **sélecteur LLM scrollable** (23 fournisseurs ne débordent
> plus de la fenêtre). Vérifiés en live par clics CDP trusted ; `test-app.sh` 22/0, smoke PASS.

## 🆕 Aide contextuelle ⌘⌥/

La fonctionnalité phare de cette version : **15 recettes pas-à-pas** directement dans le panneau, sans quitter l'app.

- **Raccourci global ⌘⌥/** (configurable dans Réglages : ⌘⌥/ · ⌘⌥H · ⌘⇧F1 · désactivé) : ouvre le panneau directement sur le guide intégré — navigable, filtrable (« bug », « UI », « sécurité », « Solana »…), copie de recette en un clic.
- Source unique de vérité : `MODE-EMPLOI.md` à la racine du pack, **embarqué dans chaque build** (`Contents/Resources/MODE-EMPLOI.md`) et dans le DMG — vérifié par `test-all.sh`.
- Persistance du raccourci dans `mgp-prefs.json`, statut d'enregistrement du raccourci global conservé (`SHORTCUT_STATUS`).
- Validée en conditions réelles sur l'app packagée : ⌘⌥/ → modal ouverte (15 recettes), filtre « solana » → 1 résultat, Escape ferme.

## 🔄 Rotation sécurisée des clés API (`menubar-app-luxe/renouveler-cles.sh`)

Renouvelle les clés Groq / Mistral / Cerebras de `~/.local/share/opencode/auth.json` en évitant tout vecteur de fuite :

- saisie **masquée** (`read -s`), Entrée vide = provider ignoré ;
- la clé transite par **variable d'environnement** — jamais en argument (argv est lisible par `ps`) ;
- **aucun echo** de clé, backup horodaté avant écriture, fichier `.staged` (contenu sensible) supprimé systématiquement via `trap EXIT` ;
- validation réelle en fin de course via `test-live-cascade.js`.

Audit anti-fuite effectué sur : stdin, logs, historique shell, `ps`, fichiers temporaires. Rien ne fuit.

## 🛡 CI et qualité

- **Nouveau job CI `test-hooks`** : régression des hooks (`sdd-cache` avec curl simulé, `simplify-ignore` — fix compatibilité bash 5.2 `patsub_replacement`) + **garde-fou anti-dérive des décomptes** (`verify-counts.py` : docs ↔ `catalog-full.js` ↔ disque).
- **Validateurs réparés** (`validate-skills.js` / `skill-lint.js`) :
  - découverte **récursive** des skills (dossiers-catégories `skills/<catégorie>/<skill>/` pris en compte — 7 « Missing SKILL.md » fantômes éliminés) ;
  - parse des **block scalars YAML** (`description: >`) ;
  - « **Use for …** » reconnu comme trigger de description ;
  - collections importées (~103 skills) : écarts signalés en avertissements non bloquants ; exemptions documentées pour les 8 skills racine hors template.
  - Résultat : **136 skills vérifiés, 0 erreur** (21 tests unitaires du linter au vert).
- **CI dédiée au catalogue** (`agents-catalogue.yml`) : `generate-agents-catalogue.js --check` + diff explicatif en cas d'échec.
- Évals : nouvelles cases Tier 2 (cognee-memory, headroom-compression, llm-provider-cascade, typesafe-ai) et premières **évals plugin Claude Code** (`evals/plugin/`).

## 📦 Téléchargements

| Fichier | Taille | SHA-256 |
|---|---|---|
| `MEGA PACK-universal.dmg` (Intel + Apple Silicon) | 177M | `88d29b45a3c5ba7d5f4935501f834bca63950e359a27d0a6b287325dc58c60cc` |
| `MEGA PACK-darwin-x64.dmg` (Intel) |  99M | `dc997e8c6102b74ececd40b7be27a18e9772fa32835a2ab034187cf4ed6b3380` |
| `MEGA PACK-darwin-arm64.dmg` (Apple Silicon) |  92M | `34309738998e671f95cfce6632b2e1bc3690f15d026befd33e548f15b161cfcc` |

> Reconstruits le 27/09 (soir) : app Luxe 2.19.1 embarquée (resize IPC, épingler, feux, LLM scrollable) + LISEZMOI bilingue FR/EN + doc ⌘⌥/ synchronisée. Repack du 27/09 (fin) via `repack-dmg.sh` (LISEZMOI + MODE-EMPLOI mis à jour sans rebuild, apps inchangées). — release.sh du 28/09 (ponts show/miroir + jev-router 🧭 + retrait canvas, build 2.19.1 intégral) — release.sh du 28/09 — release.sh du 28/09 — release.sh du 28/09

Installation : glisser **MEGA PACK.app** sur **Applications**, puis clic droit → Ouvrir (app non notarisée). Vérifier un DMG : `shasum -a 256 "MEGA PACK-universal.dmg"`.

## 🚀 Démarrage rapide

- ⚡ dans la barre de menus : clic gauche = recherche · clic droit = catalogue complet
- **⌘⌥/** : aide contextuelle (15 recettes) · ⌥Espace : recherche globale · ⌘⇧Espace : Réglages
- Les 15 recettes couvrent : dépannage cascade LLM, ajout d'un skill, création d'agent, recherche bilingue, prompts personnalisés, ARENA, Teams, Workshop…

## ✔ Vérifications de cette release

- `test-all.sh` : **TOUT VERT** (fichiers embarqués, traductions, signatures x64/arm64/universel, fusion lipo, snapshots V8 des 2 archs, montage DMG).
- `smoke-test.sh` 1.1.0 : cascade LLM réelle OK.
- Tests live ⌘⌥/ via CDP (trusted input) : ouverture, filtre, fermeture ✓.
