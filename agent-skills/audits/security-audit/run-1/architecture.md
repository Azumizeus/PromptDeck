# Architecture — agent-skills (méga-pack) [rétro-écrit post-run]

> **Note de traçabilité** : ce fichier n'a pas été écrit avant la phase de chasse du
> run-1 (écart de process du run, révélé par l'archivage). Le contenu ci-dessous est
> reconstruit après coup à partir du travail exécuté (RECONNAISSANCE.md, unités du
> coverage-ledger, REPORT.md). Il n'a donc **pas** guidé la chasse du run-1.

## Vue d'ensemble

Monorepo de distribution de skills/agents (« méga-pack ») : 132 skills markdown-first,
190 agents, commands et hooks pour Claude Code / OpenCode / Gemini CLI. Trois familles
de code exécutable :

1. **menubar-app-luxe/** — app Electron (main.js ~2 700 lignes, preload.js, renderer
   inline) : panneau méga-pack, atelier LLM, serveur local 8788 via command externe.
2. **interface/** — launcher HTML statique + `MEGA-PACK-serveur.command` (http.server
   Python) + userscript Tampermonkey (catalogue embarqué).
3. **scripts/ + hooks/** — tooling Node du pack (skill-lint, run-evals, validateurs
   CI) et hooks shell optionnels opt-in.

## Frontières de confiance

| # | Frontière | Contrôle en place | Note |
|---|---|---|---|
| B1 | LAN → serveur launcher 8788 | aucune authentification ; bind par défaut | run-1 F-3 |
| B2 | Fichiers config importés → sink d'écriture disque | `mdSafe`/`itemRelPath` assainissent les composants de chemin | run-1 F-2 (échappée plafonnée promptDir) |
| B3 | Clés API utilisateur → disque local (prefs JSON) | safeStorage OS (keychain) ; **fallback silencieux en clair** | run-1 F-1 |
| B4 | Contenu markdown du dépôt → session agent | contenu = objet du pack, même principal | pas de finding |
| B5 | Items d'atelier générés par LLM → réutilisation exécution | aucun marqueur de provenance | run-1 NV-2 |
| B6 | Processus cibles (evals, builds) → hôte/réseau | pas de sandbox réseau pour `claude -p` en CI | run-1 NV-1 |
| B7 | Renderer → main via IPC (`ipcMain.handle`) | allowlist d'événements + validation d'arguments côté main | vérifié phase 3 run-1 |

## Flux critiques

- **Sauvegarde des préférences** : renderer → IPC `prefs:save` → main
  `writePrefsJson` → `~/Library/Application Support/megapack-menubar-luxe/mgp-prefs.json`
  (0644). Les clés API passent par `safeStorage.encryptString` quand disponible, sinon
  fallback base64 en clair (finding medium).
- **Import de config JSON** (atelier) : JSON non fiable → `itemRelPath`/`mdSafe` →
  `fs.writeFile` sous `<promptDir>/perso/` ou racine du promptDir ; `..` survit à
  l'assainissement (finding low, plafonné).
- **Serveur launcher** : `MEGA-PACK-serveur.command` lance `python3 -m http.server
  8788` depuis `interface/` sans `--bind` → wildcard LAN (finding low).
- **CI/evals** : `scripts/run-evals.js` invoque `claude -p` (Bash/WebFetch) sans
  sandbox réseau (needs_validation).
- **team-run / atelier LLM** : les items générés sont persistés puis rejouables par
  les agents sans distinction d'origine (needs_validation).

## Surfaces exécutables chassées (run-1)

hooks shell opt-in · scripts Node de CI · scripts Python générateurs · scripts de
build `.sh` · preload Electron · commandes slash et adaptateurs toml. Toutes
couvertes, aucune violation de frontière confirmée.
