# FINDINGS-DETAIL — agent-skills run-2

**Aucun nouveau finding confirmé dans ce run.** Ce document détaille la revalidation,
au ref `7036ea9`, des 3 findings confirmés au run-1 (référence `e0cda34c`). Source
d'origine de chaque finding : `audits/security-audit/run-1/FINDINGS-DETAIL.md`.

---

## 1. [run-1 · medium] Clés API en clair dans mgp-prefs.json — REMÉDIÉ

- **Fingerprint** : `menubar-app-luxe/main.js@api-key-plaintext-fallback-in-prefs-json`
- **Chemin du correctif** (au ref audité) :
  - `menubar-app-luxe/main.js:1321` — `api-set` chiffre via `safeStorage.encryptString`
    ou **refuse** (`{ok:false, reason:'no-os-encryption'}`) ; plus aucune branche
    n'écrit `PREFS.apiKeys[provider] = key` en clair.
  - `menubar-app-luxe/main.js:101-113` — `apiKeyFor` ne lit que les entrées marquées
    `apiEncrypted[provider]` ; plus aucun repli sur les prefs en clair.
  - `menubar-app-luxe/main.js:115-133` + `:367` — `migratePlaintextApiKeys()` au
    chargement : re-chiffre les clés en clair existantes ou les supprime.
  - `menubar-app-luxe/settings.js` — échec affiché à l'utilisateur avec guidance
    variables d'environnement.
- **Vérification** : `menubar-app-luxe/test-security-fixes.js` 24/24 (sortie dans
  `agents/parent-inline-standard/artifacts/` du run) inclut les assertions F-1 :
  plus de fallback clair, refus explicite, lecture conditionnée au flag, migration
  appelée dans `loadPrefs`.
- **Sévérité historique** : medium (conditionnée par l'indisponibilité safeStorage) —
  close comme remédiée, non re-notée.

## 2. [run-1 · low] mdSafe préserve `..` — écriture hors de `perso/` — REMÉDIÉ

- **Fingerprint** : `menubar-app-luxe/main.js@mdsafe-preserves-dotdot-write-scope-escape`
- **Chemin du correctif** :
  - `menubar-app-luxe/lib/md-writer.js:14` — `mdSafe` neutralise `.`, `..`, `...`,
    préfixe point en `sans-nom` au lieu de les préserver.
  - `menubar-app-luxe/lib/md-writer.js:28-52` — `containedJoin(base, …segments)` :
    refuse les chemins absolus (POSIX + lettre Windows) et tout segment `..` avant
    résolution, puis re-vérifie la containment sur le chemin résolu.
  - `menubar-app-luxe/main.js:276-279` (`writeItemMd`) et `:324-325` (`writeTeamMd`) :
    les deux sinks passent par `containedJoin`.
- **Vérification** : la chaîne exacte du finding (config JSON importé → `itemRelPath`
  → sink) est rejouée en test unitaire : refus ou écriture contenue. 24/24 checks.
- **Sévérité historique** : low (échappée plafonnée à la racine du promptDir, même
  principal) — close comme remédiée, non re-notée.

## 3. [run-1 · low] Serveur launcher bind toutes interfaces — REMÉDIÉ

- **Fingerprint** : `interface/MEGA-PACK-serveur.command@http-server-binds-all-interfaces`
- **Chemin du correctif** : `interface/MEGA-PACK-serveur.command:11` —
  `python3 -m http.server 8788 --bind 127.0.0.1 -d "$DIR"`.
- **Vérification** : sonde re-exécutée au ref audité — `lsof` montre
  `TCP 127.0.0.1:8788 (LISTEN)` et `curl` sert HTTP 200 en loopback
  (artefact `bind-127001-probe-run2.txt`).
- **Sévérité historique** : low (contenu public servi au LAN) — close comme
  remédiée, non re-notée.
