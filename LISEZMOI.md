# ⚡ MEGA PACK — Édition Luxe

Dépôt du mega-pack **177 skills 🛠 · 231 agents 👤** et de l'app menu bar **MEGA PACK** (Electron, macOS) :
catalogue d'experts copiables vers n'importe quel LLM, Atelier de génération IA (agents / skills / équipes 🕸),
mini-chat, corbeille, cadenas 🔒 et **miroir MEGA PROMPT**.

> Docs détaillées de l'app : `menubar-app-luxe/README.md`, `menubar-app-luxe/MEGA-PACK.md`,
> `menubar-app-luxe/COMMANDES-ET-AGENTS.md`, `menubar-app-luxe/INSTALL.txt`.

## 🪞 Le miroir MEGA PROMPT — comment ça marche

Le dossier **`~/Documents/MEGA PROMPT`** (modifiable dans Réglages) est le **reflet sur disque** de tout le
catalogue, en fichiers `.md` lisibles par n'importe quel éditeur ou LLM :

```
MEGA PROMPT/
├── LISEZMOI.md              ← généré, régénéré automatiquement
├── skills/<catégorie>/<nom>.md
├── agents/<catégorie>/<nom>.md
├── perso/<tag>/<nom>.md     ← tes prompts ✍️
└── equipes/<nom>/           ← ORCHESTRATEUR.md · WORKFLOW.md · agents/
```

Chaque `.md` contient la fiche de l'item (description, catégorie, provenance si généré par IA)
et son **prompt d'activation** prêt à coller.

### Quand ça se synchronise

| Moment | Action |
|---|---|
| Lancement de l'app | régénération complète (idempotente) à +4 s |
| Édition d'un prompt ✍️ | son `.md` est réécrit à l'instant |
| Menu tray « 🪞 Miroir .md · N fiches » | régénération complète au clic (N = fiches réellement écrites) |
| **Modification externe d'un fichier** (éditeur, drop, CloudDrive) | détection à chaud (1,5 s de calme) puis : **fichier reconnu** → seul ce fichier est resynchronisé · **perso modifié à la main** → notification + panneau ✍️ pré-rempli pour **réintégrer tes changements** (import inverse) · **fichier inconnu** → resynchro complète |
| Changement de dossier dans Réglages | resynchro immédiate + surveillance ré-armée |

### Les règles qui garantissent la stabilité

- **Idempotence** : un `.md` identique n'est jamais réécrit (sinon le watcher se bouclerait sur ses propres écritures) ;
  le `LISEZMOI.md` généré est volontairement sans horodatage.
- **Cadenas 🔒 dans les deux sens** : un item verrouillé dans l'app n'est jamais écrasé dans le miroir ;
  et un `.md` verrouillé n'est ni resynchronisé ni importé depuis le disque.
- **Containment** : toute écriture passe par `lib/md-writer.js` (`mdSafe`, `containedJoin`) — aucun chemin ne sort du dossier miroir.
- **Provenance IA** : les contenus générés par LLM portent un bandeau d'avertissement dans leur `.md`.

## 🔧 Développement / tests

```bash
cd agent-skills/menubar-app-luxe
node test-luxe.js          # harnais complet (400+ checks, dont golden cadenas + miroir)
node ../scripts/panel-buttons-guard.js
bash release.sh all 2.19.2 # build + 3 DMG + deploy + test-dmg + test-cdp + smoke + SHA
```

La release élaguer les 273 paquets de langues Electron (en/fr conservés), signe en ad-hoc, déploie
dans `/Applications`, valide le boot réel et injecte les SHA-256 dans `menubar-app/RELEASE-NOTES-v1.1.0.md`.
