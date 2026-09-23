# FINDINGS-DETAIL — agent-skills run-1

Détail des 3 enregistrements **confirmed**. Source ref : `e0cda34c…` (2026-09-23).
Chaque section est auto-portante : trace complète, preuves avec lignes vérifiées,
reproduction cible-neutre, plus petit correctif source.

---

## 1. [medium] Clés API en clair dans mgp-prefs.json quand safeStorage est indisponible

**Fingerprint** : `menubar-app-luxe/main.js@api-key-plaintext-fallback-in-prefs-json`
**Invariant violé** : les credentials ne persistent qu'à travers le store protégé par l'OS.

### Trace (lignes vérifiées en Phase 5)

| Kind | Fichier | Ligne | Rôle |
|---|---|---|---|
| entrypoint | menubar-app-luxe/main.js | 1276 | `ipcMain.handle('api-set')` — l'utilisateur enregistre une clé |
| propagation | menubar-app-luxe/main.js | 1284 | `else if (key) { PREFS.apiKeys[provider] = key; }` — fallback clair |
| propagation | menubar-app-luxe/main.js | 1289 | le `catch` répète le même fallback clair |
| sink | menubar-app-luxe/main.js | 330 | `fs.writeFileSync(prefsPath(), JSON.stringify(PREFS))` — mode 0644 |

### Conditions

- `environmental_dependency` : safeStorage indisponible au moment de l'enregistrement
  (Linux sans service de secrets, session headless, erreur Keychain transitoire).

### Reproduction cible-neutre

1. Lancer l'app dans un environnement où `safeStorage.isEncryptionAvailable()` retourne false.
2. Réglages → Intelligence → enregistrer une clé de provider.
3. `cat "$HOME/Library/Application Support/megapack-menubar-luxe/mgp-prefs.json" | jq .apiKeys`
   → la clé apparaît en clair.

**Résultat observé lors de l'audit** : sonde locale — le fichier existe (0644, 1381 octets),
`apiKeys` vide ; le mécanisme est confirmé par source, l'exposition est conditionnelle à
l'environnement dégradé, pas vivante sur cette machine.

### Plus petit correctif

Refuser la persistance claire (fail closed) au lieu du fallback silencieux — voir
`code_changes` dans `findings.json` : retourner `{ok:false}` avec un message explicite
quand `isEncryptionAvailable()` est false.

---

## 2. [low] mdSafe préserve `..` — écriture hors de `perso/` via config importée

**Fingerprint** : `menubar-app-luxe/main.js@mdsafe-preserves-dotdot-write-scope-escape`
**Invariant violé** : les exports `.md` restent sous le sous-dossier choisi de promptDir,
quelle que soit la chaîne name/tag/category — y compris pour des objets issus d'un
fichier de configuration importé.

### Trace (lignes vérifiées en Phase 5)

| Kind | Fichier | Ligne | Rôle |
|---|---|---|---|
| entrypoint | menubar-app-luxe/main.js | 1338 | `import-config` : `data.customs` copié sans validation de schéma |
| propagation | menubar-app-luxe/main.js | 317 | `syncPromptTree` : chaque custom passe dans `writeItemMd({x:c, k:'custom'})` |
| sink | menubar-app-luxe/main.js | 243 | `fs.writeFileSync(path.join(dir ‖ promptDir(), itemRelPath(it)))` |

Chaîne interne : `mdSafe` (L220) remplace `/ \ : * ? " < > |` mais **pas les points** →
`mdSafe('..') === '..'` ; `itemRelPath` (L234) construit `path.join('perso', tag, name + '.md')`.

### Reproduction (harnass sandboxé, fonctions copiées verbatim)

```
itemRelPath({k:'custom', x:{name:'..', tag:'..'}})  ===  '...md'
path.resolve(BASE, '...md')  →  <BASE>/...md           # racine promptDir, PAS perso/
fs.writeFileSync → fichier créé à la racine            # reproduction complète
```

Plafond : `path.join` normalise — chaque segment ne peut contribuer qu'un seul `..`
(`/` et `\` sont remplacés par mdSafe), donc l'échappée s'arrête à la racine du
promptDir. Même principal (dossier de l'utilisateur) : violation de périmètre, pas
d'écriture arbitraire.

### Vecteur

`import-config` accepte un JSON partageable (« preset pack ») contenant
`"customs":[{"name":"..","tag":"..","desc":"x"}]` ; la synchro « 🔄 Générer tous les .md »
déclenche l'écriture hors `perso/` (ex. écrasement du `LISEZMOI.md` racine).

### Plus petit correctif (deux barrières indépendantes)

1. **Sink** : `writeItemMd` vérifie `path.resolve(base, rel)` commence par `base + sep`,
   sinon throw (voir `code_changes`).
2. **Source** : `mdSafe` retourne `'sans-nom'` pour `'.'`/`'..'`.

---

## 3. [low] Le serveur local du launcher écoute sur toutes les interfaces

**Fingerprint** : `interface/MEGA-PACK-serveur.command@http-server-binds-all-interfaces`
**Invariant violé** : le serveur documenté « local » n'accepte que des connexions locales.

### Trace (lignes vérifiées en Phase 5)

| Kind | Fichier | Ligne | Rôle |
|---|---|---|---|
| entrypoint | interface/MEGA-PACK-serveur.command | 8 | branche `else` du garde lsof |
| sink | interface/MEGA-PACK-serveur.command | 9 | `python3 -m http.server 8788 -d "$DIR"` — pas de `--bind` |
| confirmation | interface/MEGA-PACK-serveur.command | 13 | le script annonce `http://localhost:8788` |

### Preuve d'exécution (sandbox)

Sonde équivalente observée via `lsof` : `TCP *:18788 (LISTEN)` — binding wildcard
reproduit sur cette plateforme. Serveur refermé immédiatement ; aucune requête servie.

### Effet maximal

Lecture seule de `interface/` (catalogue public, userscript, docs) depuis le LAN + port
occupé. Aucun credential dans le dossier servi. Handler read-only.

### Plus petit correctif

```
python3 -m http.server 8788 --bind 127.0.0.1 -d "$DIR" >/dev/null 2>&1 &
```
