# Agents — Source de vérité et synchronisation OpenCode

> **La source de vérité des 231 agents, c'est ce dépôt** : les fichiers Markdown de
> [`agents/`](../agents/) validés par le catalogue embarqué
> [`interface/catalog-full.js`](../interface/catalog-full.js).
> Tout ce qui tourne ailleurs (OpenCode, le panneau MEGA PACK, les futurs docs générés)
> est une **projection** de cette source, jamais l'inverse.

---

## 1. État de référence (vérifié le 2026-09-29)

| Vue | Nombre | Détail |
|---|---|---|
| `agents/` (repo) | **231** fichiers | 45 à plat (`agents/*.md`) + 186 dans des sous-dossiers catégories (19 dossiers, dont imbriqués : `game-development/unity/`…) |
| `interface/catalog-full.js` | **231** agents | référence chaque fichier du repo (0 manquant) |
| `~/.config/opencode/agents/` | **231** fichiers | synchronisés 1:1, contenus identiques (hash) |
| `opencode agent list` | **238** lignes | 231 customs + 7 built-ins (`build`, `plan`, `general`, `explore`, `compaction`, `summary`, `title`) |
| `opencode debug agent "<name>"` | ✅ | résout pour les agents du repo (ex. `"Backend Architect"`) |

Historique : la divergence historique « repo 45 vs OpenCode 217 » venait d'une ancienne
convention (flat, héritage de fusion `12eae2e`). Elle est résolue : **le repo est la
source, OpenCode est aligné à 231/231**.

## 2. Conventions des fichiers `agents/`

Un fichier `agents/**.md` = un agent. Frontmatter **minimal sur liste blanche** :

```yaml
---
name: Backend Architect          # nom affiché ; unique sur tout le repo (slug si besoin)
description: Senior backend architect specializing in…   # une ligne, EN, sans retour chariot
mode: subagent                   # optionnel : primary | subagent | all (défaut effectif : all)
color: "#3b82f6"                 # optionnel : hex ^#[0-9a-fA-F]{6}$ ou nom (primary, accent…)
---
```

Règles :

1. **`name` unique** dans tout le repo. Les 41 basenames historiques en doublon
   (ex. `design-brand-guardian.md` à plat et `agents/design/design-brand-guardian.md`)
   ont des `name:` distincts ; ce ne sont pas des copies.
2. **Champs interdits en frontmatter** : tout ce qui n'est pas dans la liste blanche
   (outils, modèle, emoji, « vibe », etc.). Ces métadonnées vivent dans le catalogue
   `interface/catalog-full.js` (`model`, `tools`, `name_fr`, `desc_fr`), pas dans les `.md`.
3. **Un seul frontmatter invalide bloque le chargement de TOUS les agents** dans
   OpenCode (`Error: Configuration is invalid at …`). D'où la liste blanche stricte :
   les champs inconnus ne sont pas ignorés, ils cassent la config.

## 3. Le catalogue `interface/catalog-full.js`

Fichier **généré** par [`build-interface.py`](../build-interface.py) (`v0.7.4`,
177 skills · 231 agents). Chaque entrée agent porte :

- `name` / `desc` : identité affichée dans le panneau ;
- `category` / `path` : chemin repo du `.md` ;
- `model`, `tools` : métadonnées d'exécution **absentes du frontmatter** (voir §2) ;
- `name_fr` / `desc_fr` : libellés français du panneau.

✅ **Risque régénération MITIGÉ (0.7.4+)** : [`build-interface.py`](../build-interface.py)
preserve désormais `model`/`tools`/`name_fr`/`desc_fr` lors d'une régénération —
l'ancien catalogue sert de mémoire (clé `path`), ce que le disque définit reste
prioritaire, et `interface/i18n-fr.json` écrase ensuite les traductions. Vérification :

```bash
python3 build-interface.py --self-test   # échoue (exit 1) si un champ serait perdu
```

Le chemin complet de rattrapage du décompte (ex. 177 → 180 skills réels) :

```bash
python3 build-interface.py && python3 build-userscript.py \
  && python3 scripts/verify-counts.py --update
```

Tant qu'une régénération n'est pas jouée, le catalogue embarqué reste complet et correct.

## 4. Synchroniser vers OpenCode

Script unique : [`scripts/sync-agents-opencode.js`](../scripts/sync-agents-opencode.js)

```bash
node scripts/sync-agents-opencode.js --dry-run   # simulation
node scripts/sync-agents-opencode.js             # application + backup horodaté
```

- **Source** : `interface/catalog-full.js` (la source de vérité), pas un `ls` du disque.
- **Cible** : `~/.config/opencode/agents/` en **plat**, sans collision : passe A — les
  fichiers à plat réservent leur basename ; passe B — slug du `name:`, préfixe catégorie
  si pris, suffixe `-2`/`-3` ; garde-fou abort si le total ≠ 231.
- **Backup** horodaté de la cible avant écriture ; **idempotent** (contenus identiques).
- Validation après coup :

```bash
opencode agent list | grep -cE '^(.+) \((primary|subagent|all)\)$'   # attendu : 238 = 7 built-ins + 231 agents du repo
```

> ⚠️ **Piège de lecture de `agent list`** : les noms affichés sont les `name:` de
> frontmatter, souvent avec espaces (« Backend Architect (all) »). Un grep `^\S+`
> ne voit alors que les noms slugs et fait croire à ~42 agents. Extraire avec
> `^(.+) \((primary|subagent|all)\)$`. Test fonctionnel direct :
> `opencode debug agent "Backend Architect"`.

## 5. Historique des codemods (2026-09-29)

Un passage unique a normalisé les 231 agents (idempotent, rejouable) :

| Script | Périmètre | Effet |
|---|---|---|
| [`scripts/fix-agent-colors.js`](../scripts/fix-agent-colors.js) | 131 fichiers | noms de couleur → hex `#rrggbb` |
| [`scripts/fix-agent-tools.js`](../scripts/fix-agent-tools.js) | 17 fichiers | `tools:` chaîne/objet quoté → flow map YAML valide |
| [`scripts/fix-agent-frontmatter.js`](../scripts/fix-agent-frontmatter.js) | 186 fichiers | frontmatter réduit à la liste blanche `name/description/mode/color` |

Les trois sont **idempotents** : les relancer ne change rien.

## 6. Check-list « j'ajoute un agent »

1. Créer `agents/<categorie>/<slug>.md` (ou `agents/<slug>.md`) avec le frontmatter §2 ;
2. `name:` unique dans tout le repo ;
3. Ajouter l'entrée dans `interface/catalog-full.js` (ou régénérer — §3, préservation active) ;
4. `node scripts/sync-agents-opencode.js` puis vérifier avec
   `opencode debug agent "<name>"`.

### Garde-fous automatisés

- **`node agent-skills/scripts/validate-agents.js`** (CI : workflow « Catalogue agents ») :
  frontmatter liste blanche, `name` uniques, modes/couleurs valides, couverture
catalogue exacte (0 manquant, 0 fantôme, total fichier = total entrées). Tests :
  `node --test agent-skills/scripts/validate-agents-test.js`.
- **`node scripts/generate-agents-catalogue.js --check`** (même workflow) :
  `AGENTS-CATALOGUE.md` régénéré = version commitée ; tout nouveau `name` doit avoir
  son rôle FR dans `scripts/agents-roles-fr.json`.

## 7. Backups OpenCode

Les backups horodatés vivent dans `~/.config/opencode/agents.bak-<timestamp>`
(quatre créés le 2026-09-29 pendant la réconciliation). Ils peuvent être supprimés
une fois la synchronisation validée ; ils ne doivent jamais servir de source.
