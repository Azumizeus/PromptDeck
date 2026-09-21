# MEGA PACK — Édition Luxe

Une liste sobre, noire, instantanée. **Compréhensible en 3 secondes** : on cherche,
on lit, on tire le prompt. Rien d'autre.

- **321 experts** : 131 skills 🛠 · 190 agents 👤 · ✍️ tes prompts · ★ tes favoris
- **Recherche instantanée** dès la première lettre, filtres en un clic
- **Tout au clavier** : ↑↓ naviguer · ⏎ copier · ⌘⏎ ouvrir (LLM par défaut) ·
  ⇧⏎ ChatGPT · ⌥⏎ composer la sélection · ⌘1-9 favoris · ⌘, réglages
- **⌘-clic** pour sélectionner plusieurs experts, **⌥⏎** compose un prompt combiné
- **Survol** d'un skill/agent : tooltip flottant expert (type, description, catégorie, compétences)
- **Clic droit** : menu flottant — **Envoyer à** plusieurs LLM choisis dans les Réglages ·
  **📄 Créer le .md** dans le dossier MEGA PROMPT · **📂 Ouvrir le dossier** · Copier · Favori
- **🛠 Atelier** : créer ses agents & skills **générés par IA** (clé API : Groq, OpenAI,
  Anthropic, OpenRouter, Ollama local…) avec option « senior orchestrateur »
- **📁 Dossier MEGA PROMPT** : tout le catalogue en fichiers `.md` sur le disque
  (`skills/<catégorie>/`, `agents/<catégorie>/`, `perso/<tag>/` + `LISEZMOI.md`) —
  dossier choisi dans les Réglages, ouverture en un clic depuis le panneau
- Panneau en **verre natif macOS**, sombre par défaut (thème clair dispo)

## Lancer

```bash
cd agent-skills/menubar-app-luxe
npm start
```

L'icône ⚡ vit dans la barre des menus. ⌥Espace ouvre/ferme le panneau.

## Démo navigateur (sans Electron)

`standalone.html` — même renderer, un shim remplace le bridge IPC :

```bash
cd agent-skills
python3 -m http.server 8478
# → http://127.0.0.1:8478/menubar-app-luxe/standalone.html
```

## Tests

```bash
node test-luxe.js              # suite logique (renderer réel en sandbox VM)
./node_modules/.bin/electron probe-luxe.js --shots   # probe Electron + capture dist/
```

## Structure

| Fichier | Rôle |
|---|---|
| `main.js` | fenêtre, tray ⚡, raccourcis, IPC, prefs JSON, API LLM, dossier MEGA PROMPT |
| `preload.js` | bridge sécurisé (catalogue + actions + Atelier + fichiers .md) |
| `renderer.js` | la liste : recherche, filtres, clavier, ✍️, composeur, tooltip, clic droit, Atelier |
| `theme.js` | le design (CSS injecté) |
| `settings.html/js` | Réglages : destinations clic droit, Intelligence (clé API), dossier MEGA PROMPT |
| `standalone.html` + `demo-shim.js` | démo navigateur |
| `test-luxe.js`, `probe-luxe.js` | validation (12 sections logiques) |

## Dossier MEGA PROMPT (.md sur le disque)

Depuis les **Réglages → 📁 Dossier MEGA PROMPT** : choisir le dossier (par défaut
`~/Documents/MEGA PROMPT`), puis **🔄 Générer tous les .md** écrit d'un coup les
321 experts + tes prompts perso, avec le prompt d'activation prêt à coller dans chaque fichier :

```
MEGA PROMPT/
├── LISEZMOI.md
├── skills/<catégorie>/<skill>.md
├── agents/<catégorie>/<agent>.md
└── perso/<tag>/<prompt>.md
```

Au quotidien : **clic droit sur un skill/agent → 📄 Créer le .md** (fichier à jour dans
l'arborescence) puis **📂 Ouvrir le dossier** — le fichier est créé là où tu l'attends, et
l'ouverture du dossier est à un clic.

## Intelligence (génération IA de l'Atelier)

Réglages → 🧠 Intelligence : choisir le fournisseur (Groq, OpenAI, Anthropic, OpenRouter,
Ollama local, endpoint compatible), coller la clé (**chiffrée par le trousseau macOS** via
`safeStorage` quand possible) et le modèle, puis **⚡ Tester**. Alternative sans stockage :
variable d'environnement (`GROQ_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
`OPENROUTER_API_KEY`) posée avant le lancement de l'app.
