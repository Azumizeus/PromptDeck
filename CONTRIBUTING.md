# Contribuer à PromptDeck 🎉

Merci de ton intérêt ! Ce guide explique comment proposer tes améliorations,
ajouter des skills/agents, et soumettre du code proprement.

## 🚀 Démarrage rapide

```bash
git clone https://github.com/Azumizeus/PromptDeck.git
cd PromptDeck/agent-skills/menubar-app
npm install
npm start            # l'app en mode dev (icône ⚡ dans la barre de menus)
```

## 🧪 Avant de proposer une modification

```bash
node --check main.js && node --check renderer.js && node --check preload.js
node test-fr.js      # i18n : 321/321 items, recherche bilingue
node test-custom.js  # prompts personnalisés : 28 vérifications
./test-all.sh        # suite complète (build requis pour la partie bundle)
```

Une PR qui fait passer les tests au rouge ne sera pas fusionnée telle quelle —
corrige ou mets à jour les tests avec ta modification.

## 🐛 Signaler un bug

Ouvre une [issue](../../issues) avec :

1. **Titre clair** : « Le menu ⚡ ne s'ouvre plus après import .md »
2. **macOS + architecture** (menu  → À propos de ce Mac) : « Sequoia 15, Apple Silicon »
3. **Version de l'app** : visible dans les Réglages de PromptDeck (ou `build.json`)
4. **Étapes de reproduction** minimales, numérotées
5. **Comportement attendu vs observé**
6. Si possible : extrait de Console.app filtré sur « PromptDeck »

## 💡 Proposer une fonctionnalité

Ouvre d'abord une issue **« Suggestion »** avant de coder — ça évite les PR
refusées pour cause de doublon ou hors périmètre. Décris le problème que ça
résout plus que la solution technique.

## ➕ Ajouter des skills / agents

Les skills vivent dans `agent-skills/skills/` et les agents dans `agent-skills/agents/`.

1. Un dossier par item, avec un `SKILL.md` (ou la fiche de l'agent)
2. Les métadonnées vont dans `agent-skills/interface/catalog-full.js` :
   - `name` : identifiant (anglais, kebab-case)
   - `name_fr` / `desc_fr` : **obligatoires** — le catalogue est bilingue, un item
     sans traduction FR cassera `test-fr.js`
   - `category` : une des catégories existantes (regarde les voisins)
3. Lance `node test-fr.js` : le compte total (321 → 322…) doit rester cohérent
4. Rebuild si tu touches au catalogue embarqué : `./build-app.sh`

## 🎨 Conventions de code

| Domaine | Convention |
|---|---|
| JavaScript | ES2022, pas de framework — vanilla comme le reste |
| Contexte Electron | Toute nouvelle API passe par `preload.js` (contextIsolation, jamais `nodeIntegration`) |
| Langue | Code et identifiants en anglais, **libellés utilisateur bilingues FR/EN** dans `I18N` |
| Commits | Style actuel du dépôt : type + résumé FR concis (ex. « fix: favs customs absents de l'onglet ⭐ ») |
| Commentaires | En français, comme le reste du code |

## 📦 Modifier le packaging

`build-app.sh` est sensible (fusion `lipo` bi-arch, snapshots V8, signature).
Toute modification doit passer `./test-all.sh` **complet** (avec montage DMG)
sur les trois architectures avant PR.

## ⚖️ Licence

En contribuant, tu acceptes que tes contributions soient publiées sous la
[licence MIT](LICENSE) du projet.
