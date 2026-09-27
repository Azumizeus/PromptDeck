#!/usr/bin/env node
/**
 * 🛡 Garde-fou : interdit de RETIRER un bouton/contrôle du panneau sans mention
 * explicite dans le message de commit.
 *
 * Principe : on inventorie les contrôles interactifs (ids + événements) des
 * panneaux menubar-app et menubar-app-luxe, on compare à la liste dorée
 * (panel-buttons-golden.json). Toute disparition fait échouer le check SAUF si
 * le message du commit HEAD mentionne explicitement le contrôle (son id) ou
 * porte un marqueur « buttons-removed: id1, id2 ».
 *
 * Usage :
 *   node scripts/panel-buttons-guard.js            # check (CI + local)
 *   node scripts/panel-buttons-guard.js --update   # régénère la liste dorée
 *   MGP_GUARD_FAKE_REMOVE=q node ...               # simule un retrait (auto-test)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const GOLDEN = path.join(__dirname, 'panel-buttons-golden.json');

// (fichier relatif à agent-skills/, type d'extraction)
const SOURCES = [
  { file: 'menubar-app-luxe/index.html', kind: 'html' },
  { file: 'menubar-app-luxe/renderer.js', kind: 'js' },
  { file: 'menubar-app-luxe/mac-chrome.js', kind: 'js' },
  { file: 'menubar-app/renderer.js', kind: 'js' },
  { file: 'menubar-app/index.html', kind: 'html' },
  // Interface Chrome : userscript + banc d'essai inline (mêmes protections que l app)
  { file: 'interface/mega-pack-panel-full.user.js', kind: 'js' },
  { file: 'interface/panel-demo-inline.html', kind: 'html' },
];

function extractControls() {
  const out = {};
  for (const src of SOURCES) {
    const abs = path.join(ROOT, src.file);
    const app = src.file.split('/')[0];
    out[app] = out[app] || new Set();
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    if (src.kind === 'html') {
      for (const m of text.matchAll(/<(?:button|input|select|textarea|a)\b[^>]*\bid="([^"]+)"/g)) out[app].add(m[1]);
      for (const m of text.matchAll(/<(?:button|input|select|textarea|a)\b[^>]*\bdata-id="([^"]+)"/g)) out[app].add(m[1]);
    } else {
      // $('id').onclick / ondblclick / oninput / onchange
      for (const m of text.matchAll(/\$\('([A-Za-z0-9_-]+)'\)\.(onclick|ondblclick|oninput|onchange)\b/g)) out[app].add(`${m[1]}:${m[2]}`);
      // $('id').addEventListener('click'|'input'|...)
      for (const m of text.matchAll(/\$\('([A-Za-z0-9_-]+)'\)\.addEventListener\('([a-z]+)'/g)) out[app].add(`${m[1]}:${m[2]}`);
      // getElementById('id').onclick …
      for (const m of text.matchAll(/getElementById\('([A-Za-z0-9_-]+)'\)\.(onclick|ondblclick|oninput|onchange)\b/g)) out[app].add(`${m[1]}:${m[2]}`);
      // document.createElement('button') + .className = 'x' est trop volatil ; on suit
      // plutôt les sélecteurs de chrome mac (fenêtre) : querySelector('.cls').onclick
      for (const m of text.matchAll(/querySelector\((['"])((?:\\.|(?!\1).)+)\1\)\.(onclick|ondblclick)\b/g)) out[app].add(`sel:${m[2]}:${m[3]}`);
    }
  }
  return out;
}

function loadGolden() {
  if (!fs.existsSync(GOLDEN)) return null;
  try { return JSON.parse(fs.readFileSync(GOLDEN, 'utf8')); } catch (e) { return null; }
}

function commitMessage() {
  try {
    return execFileSync('git', ['log', '-1', '--format=%B'], { cwd: ROOT, encoding: 'utf8' });
  } catch (e) { return ''; }
}

function removalAllowed(id, msg) {
  if (msg.toLowerCase().includes(id.toLowerCase())) return 'mention explicite du contrôle';
  const marker = msg.split('\n').find((l) => /buttons-removed\s*:/i.test(l));
  if (marker) {
    const list = marker.split(':')[1] || '';
    if (list.split(/[,\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean).includes(id.toLowerCase())) return 'marqueur buttons-removed';
  }
  return null;
}

function main() {
  const update = process.argv.includes('--update');
  const current = extractControls();

  if (update || !loadGolden()) {
    const golden = { _comment: 'Inventaire doré des contrôles interactifs du panneau. Régénérer : node scripts/panel-buttons-guard.js --update', apps: {} };
    for (const [app, set] of Object.entries(current)) golden.apps[app] = [...set].sort();
    fs.writeFileSync(GOLDEN, JSON.stringify(golden, null, 2) + '\n');
    console.log(`✅ liste dorée écrite : ${Object.values(golden.apps).reduce((a, s) => a + s.length, 0)} contrôles`);
    return;
  }

  const golden = loadGolden();
  const problems = [];
  for (const [app, controls] of Object.entries(golden.apps)) {
    const cur = current[app] || new Set();
    for (const c of controls) {
      if (!cur.has(c)) {
        // un contrôle peut avoir changé d'événement (ex. q:onclick → q:input) :
        // ce n'est un retrait que si AUCUN événement ne subsiste pour cet id
        const id = c.split(':')[0];
        const stillThere = [...cur].some((x) => x.split(':')[0] === id);
        if (!stillThere) problems.push({ app, id, control: c });
        else problems.push({ app, id, control: c, soft: true, note: `l'événement a changé (existe encore sous un autre type)` });
      }
    }
  }

  const hard = problems.filter((p) => !p.soft);
  const soft = problems.filter((p) => p.soft);

  if (soft.length) {
    console.log(`ℹ️  ${soft.length} contrôle(s) avec événement modifié : ${soft.map((p) => `${p.app}/${p.control}`).join(', ')}`);
  }

  if (!hard.length) {
    const total = Object.values(current).reduce((a, s) => a + s.size, 0);
    console.log(`✅ garde-fou boutons : aucun retrait détecté (${total} contrôles inventoriés)`);
    return;
  }

  const msg = commitMessage();
  const blocked = [], allowed = [];
  for (const p of hard) {
    const why = removalAllowed(p.id, msg);
    (why ? allowed : blocked).push({ ...p, why });
  }
  for (const a of allowed) console.log(`↩️  retrait toléré ${a.app}/${a.id} (${a.why})`);

  if (blocked.length) {
    console.error(`\n🛡 RETRAIT(S) DE BOUTON SANS MENTION EXPLICITE :`);
    for (const b of blocked) console.error(`   - ${b.app} : ${b.control}`);
    console.error(`\nSoit restaure ces contrôles, soit mentionne-les explicitement dans le`);
    console.error(`message de commit (l'id du contrôle), soit ajoute une ligne :`);
    console.error(`   buttons-removed: ${blocked.map((b) => b.id).join(', ')}`);
    process.exit(1);
  }
  console.log('✅ garde-fou boutons : retraits tous explicitement mentionnés');
}

main();
