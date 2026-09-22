# MEGA PACK — Édition Luxe

Une liste sobre, noire, instantanée. **Compréhensible en 3 secondes** : on cherche,
on lit, on tire le prompt. Rien d'autre.

- **321 experts** : 131 skills 🛠 · 190 agents 👤 · ✍️ tes prompts · ★ tes favoris
- **Recherche instantanée** dès la première lettre, filtres en un clic
- **Tout au clavier** : ↑↓ naviguer · ⏎ copier · ⌘⏎ ouvrir (LLM par défaut) ·
  ⇧⏎ ChatGPT · ⌥⏎ composer la sélection · ⌘1-9 favoris · ⌘, réglages
- **⌘-clic** pour sélectionner plusieurs experts, **⌥⏎** compose un prompt combiné
- **Sélecteur LLM dans la barre du bas** : un clic sur `⌨ LLM ▾` change le LLM par
  défaut instantanément (Claude, ChatGPT, Perplexity, Copilot, DeepSeek, Z.ai, Kimi,
  Mammouth, 🔑 API) — persisté, synchronisé avec les Réglages ; 🔑 API n'apparaît
  qu'une clé est enregistrée (Réglages → Intelligence)
- **🕸 Équipes multi-agents** (Atelier, 3e mode) : décris une mission → l'IA génère un
  **super-orchestrateur** (coordination, arbitrage, rapport final) + **2 à 5 agents**
  spécialisés (rôle, livrable) + un **workflow** numéroté. L'équipe est citoyenne du
  panneau (onglet 🕸 Équipes, recherche, favoris, clic droit) : ⏎ copie le **protocole
  complet** prêt à coller dans n'importe quel LLM
- **▶ Exécution réelle de mission** : depuis l'Atelier, l'équipe passe à l'action —
  l'orchestrateur planifie les tâches, chaque agent les exécute **via l'API**, puis
  l'orchestrateur **consolide le rapport final** (synthèse, points clés, risques,
  prochaines actions) : copiable ou enregistrable en `.md`
- **Choix du fournisseur + modèle** dans l'Atelier (Groq, **Google Gemini**,
  **OmniRoute local**, Mistral, Cerebras, Cohere, FreeLLM API local, OpenAI,
  Anthropic, OpenRouter, Ollama, endpoint perso) — utilisables pour générer et
  pour exécuter, mémorisables pour toutes les générations
- **📋 Modèles dynamiques** : la liste des modèles est chargée en direct depuis
  l'API du fournisseur (`GET /v1/models`, filtrage des modèles non-chat) —
  toujours à jour, comme dans OpenCode
- **🔑 Clés reconnues automatiquement** : au lancement, l'app charge les `export`
  de ton `~/.zshrc` (GROQ_API_KEY, MISTRAL_API_KEY, CEREBRAS_API_KEY, COHERE_API_KEY,
  FREELLMAPI_API_KEY…) **et les clés de ta config OpenCode** (`opencode.json` +
  `auth.json` : Google/Gemini, OmniRoute, FreeLLM, Copilot…) — même lancée depuis
  le Finder. Tu peux aussi coller une clé dans Réglages → Intelligence (chiffrée
  par le trousseau macOS). Modèles à jour (openai/gpt-oss-120b, gemini-3.6-flash…)
  avec **migration automatique** des modèles retirés
- **✍️ Mission sans limite de longueur** : la zone « Ce qu'il doit faire » accepte
  autant de texte que tu veux (contexte, contraintes, exemples, cahier des charges
  complet) — compteur de caractères, bouton ⤢ pour agrandir la zone, ⌘⏎ pour
  générer, Effacer en un clic
- **🎓 Visite guidée interactive** au premier lancement : pop-up flottant pas à pas
  (7 étapes, surbrillance des éléments concernés, astuces) — rejouable en effaçant
  la clé `mgp.tour.done` du localStorage
- **Survol** d'un skill/agent : tooltip flottant expert (type, description, catégorie, compétences)
- **Clic droit** : menu flottant — **Envoyer à** plusieurs LLM choisis dans les Réglages ·
  **📄 Créer le .md** dans le dossier MEGA PROMPT · **📁 Arborescence MEGA PROMPT** (dossiers
  et fichiers .md cliquables : 📂 ouvre le dossier là où il se trouve, 📄 ouvre le fichier
  dans l'éditeur) · Copier · Favori
- **🛠 Atelier** : créer ses agents, skills **et équipes multi-agents** **générés par IA**
  (clé API : Groq, OpenAI, Anthropic, OpenRouter, Ollama local…)
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

Couverture : catalogue, recherche, filtres (dont 🕸 Équipes), clavier, favoris,
✍️, composeur, **sélecteur LLM du footer** (changement + persistance), Atelier
(agent, skill, **équipe multi-agents**) et menu contextuel multi-destinations.

## Structure

| Fichier | Rôle |
|---|---|
| `main.js` | fenêtre, tray ⚡, raccourcis, IPC, prefs JSON, API LLM, dossier MEGA PROMPT, équipes, exécution de missions |
| `preload.js` | bridge sécurisé (catalogue + actions + Atelier + fichiers .md) |
| `renderer.js` | la liste : recherche, filtres, clavier, ✍️, composeur, tooltip, clic droit, Atelier, sélecteur LLM, équipes |
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
├── equipes/<nom>/ORCHESTRATEUR.md · WORKFLOW.md · agents/<agent>.md
└── perso/<tag>/<prompt>.md
```

Au quotidien : **clic droit sur un skill/agent → 📄 Créer le .md** (fichier à jour dans
l'arborescence), puis l'**📁 arborescence intégrée au popup** montre tout le dossier :
un clic sur un 📁 dossier l'ouvre dans le Finder **là où il se trouve**, un clic sur un
fichier .md l'ouvre directement dans ton éditeur — navigation complète sans quitter le panneau.

## Intelligence (génération IA de l'Atelier)

Réglages → 🧠 Intelligence : choisir le fournisseur (Groq, OpenAI, Anthropic, OpenRouter,
Ollama local, endpoint compatible), coller la clé (**chiffrée par le trousseau macOS** via
`safeStorage` quand possible) et le modèle, puis **⚡ Tester**. Alternative sans stockage :
variable d'environnement (`GROQ_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
`OPENROUTER_API_KEY`) posée avant le lancement de l'app.
