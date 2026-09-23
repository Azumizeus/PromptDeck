'use strict';
// Vérifie les correctifs des findings de l'audit security-audit run-1 :
//   F-1 : clés API jamais persistées en clair (fail-closed + migration one-shot)
//   F-2 : mdSafe neutralise les segments '..' et le sink garantit la containment
//   F-3 : le serveur du launcher se bind sur 127.0.0.1 uniquement
//   NV-2: les items générés par LLM portent une provenance persistée
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = __dirname;
const results = [];
function check(cond, label) {
  results.push([!!cond, label]);
  console.log(`${cond ? '✓' : '✗'} ${label}`);
}

// ---------------------------------------------------------------- F-2 md-writer
const { mdSafe, containedJoin } = require('./lib/md-writer');

{
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'mdwriter-test-'));
  // L'ancien mdSafe laissait passer '..' (finding F-2 reproduit en sandbox).
  check(mdSafe('..') === 'sans-nom', 'F-2: mdSafe("..") neutralisé');
  check(mdSafe('...') === 'sans-nom', 'F-2: mdSafe("...") neutralisé');
  check(mdSafe('.secret') === 'sans-nom', 'F-2: mdSafe(".secret") neutralisé');
  check(mdSafe('  ') === 'sans-nom', 'F-2: mdSafe vide → sans-nom');
  check(!/[/\\:*?"<>|]/.test(mdSafe('a/b\\c:d?e"f<g>h|i*j')), 'F-2: caractères interdits remplacés');
  check(mdSafe('montitre tres long '.repeat(6)).length <= 80, 'F-2: troncature 80');

  // Évasion directe au sink : segments refusés par containedJoin.
  for (const bad of ['..', 'a/../../etc', '/etc/passwd', 'C:\\Windows', 'ok/..']) {
    let threw = false;
    try { containedJoin(base, bad); } catch { threw = true; }
    check(threw, `F-2: containedJoin refuse ${JSON.stringify(bad)}`);
  }
  // Chemins légitimes toujours acceptés.
  check(containedJoin(base, 'skills', 'cat', 'Mon Skill.md').startsWith(base + path.sep), 'F-2: chemin légitime accepté');
  check(containedJoin(base, 'perso', 'tag..x', 'a.md').startsWith(base + path.sep), "F-2: points à l'intérieur d'un segment acceptés");

  // Attaque de bout en bout : la chaîne exacte du finding (config JSON importé
  // → itemRelPath → sink). On rejoue le mapping réel de main.js.
  const evil = { x: { k: 'custom', name: '../../../Documents/secret', tag: '', desc: 'x' }, k: 'custom' };
  const itemRelPath = (it) => it.k === 'custom'
    ? path.join('perso', `${mdSafe(it.x.name)}.md`)
    : path.join(it.k === 'agent' ? 'agents' : 'skills', 'divers', `${mdSafe(it.x.name_fr || it.x.name)}.md`);
  let escaped = false;
  let abs = null;
  try { abs = containedJoin(base, itemRelPath(evil)); } catch { escaped = false; }
  if (abs) escaped = !abs.startsWith(base + path.sep);
  check(!escaped, 'F-2: chaîne complète import-config → écriture contenue (ou refusée)');
  fs.rmSync(base, { recursive: true, force: true });
}

// ---------------------------------------------------------------- F-1 fail-closed (statique + handler)
{
  const src = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
  // 1. Plus de chemin d'écriture en clair : l'unique assignation d'une clé
  // fournie doit passer par safeStorage.encryptString.
  const apiSetBody = src.slice(src.indexOf("ipcMain.handle('api-set'"), src.indexOf("ipcMain.handle('api-set'") + 2600);
  check(apiSetBody.includes('safeStorage.encryptString'), 'F-1: api-set chiffre via safeStorage');
  check(!/else if \(key\) \{\s*\n\s*PREFS\.apiKeys\[provider\] = key;/.test(apiSetBody), 'F-1: plus de fallback « PREFS.apiKeys[provider] = key » en clair');
  check(apiSetBody.includes("no-os-encryption"), 'F-1: refus explicite quand le chiffrement OS est indisponible');

  // 2. apiKeyFor n'expose plus les prefs en clair : lecture conditionnée au flag
  // apiEncrypted.
  const apiKeyForBody = src.slice(src.indexOf('function apiKeyFor'), src.indexOf('function apiKeyFor') + 1600);
  check(apiKeyForBody.includes('PREFS.apiEncrypted[provider]'), 'F-1: apiKeyFor exige le flag apiEncrypted');
  // Le repli final ne touche que OPENCODE_KEYS (boucle d'alias freellm/freellmapi incluse),
  // jamais les prefs en clair — invariant F-1 conservé.
  check(!/PREFS\.apiKeys\[provider\] \|\|/.test(apiKeyForBody) && /return '';\s*\n\}/.test(apiKeyForBody), 'F-1: apiKeyFor ne retombe plus sur PREFS.apiKeys en clair');
  check(/OPENCODE_KEYS\[name\] \|\|/.test(apiKeyForBody) || /OPENCODE_KEYS\[name\]\) return OPENCODE_KEYS\[name\]/.test(apiKeyForBody), 'F-1: le repli OPENCODE_KEYS (alias inclus) est conservé');

  // 3. Migration one-shot au chargement des prefs.
  check(src.includes('function migratePlaintextApiKeys'), 'F-1: migration one-shot présente');
  check(src.includes('migratePlaintextApiKeys(); // jamais de clé en clair sur disque'), 'F-1: migration appelée dans loadPrefs');
}

// ---------------------------------------------------------------- F-3 serveur.command
{
  const cmd = fs.readFileSync(path.join(ROOT, '..', 'interface', 'MEGA-PACK-serveur.command'), 'utf8');
  check(/http\.server\s+8788\s+--bind\s+127\.0\.0\.1/.test(cmd), 'F-3: serveur.command bind 127.0.0.1');
}

// ---------------------------------------------------------------- NV-2 provenance
{
  check(fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8').includes("origin: 'llm-generated'"), 'NV-2: marquage origin persisté (agents/skills + équipes)');
  check(fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8').includes('Contenu généré par IA'), 'NV-2: notice dans le prompt copié');
}

// ---------------------------------------------------------------- Résumé
const failed = results.filter((r) => !r[0]).length;
console.log(`\n${results.length - failed}/${results.length} checks OK${failed ? ` — ${failed} ÉCHEC(S)` : ' — PASS'}`);
process.exit(failed ? 1 : 0);
