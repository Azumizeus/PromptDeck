#!/usr/bin/env node
/** Tests pour scripts/build-agents-multi-prompt.js — combinaisons de personas multi-agents. */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, 'build-agents-multi-prompt.js');
const LAUNCHER = path.join(__dirname, '..', 'interface', 'mega-pack-launcher.html');

/** Exécute le générateur dans un repo temporaire avec un MEGA_CATALOG minimal. */
function runInSandbox(agents, args = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-combo-'));
  fs.mkdirSync(path.join(dir, 'interface'), { recursive: true });
  const catalog = { meta: { version: '0.0.0-test' }, skills: [], agents };
  fs.writeFileSync(
    path.join(dir, 'interface', 'mega-pack-launcher.html'),
    '<script>\nconst MEGA_CATALOG = ' + JSON.stringify(catalog) + ';\n</script>\n'
  );
  const out = path.join(dir, 'out.json');
  execFileSync('node', [SCRIPT, '--src', path.join(dir, 'interface', 'mega-pack-launcher.html'), '--out', out, ...args], { cwd: dir });
  return JSON.parse(fs.readFileSync(out, 'utf8'));
}

test('génère le bon nombre de combos avec un catalogue minimal', () => {
  const agents = ['a-one', 'b-two', 'c-three', 'd-four'].map((n, i) => ({
    name: n, desc: 'Agent de test ' + n, category: i % 2 ? 'catA' : 'catB', path: 'agents/x/' + n + '.md',
  }));
  const data = runInSandbox(agents, ['--max', '5']);
  assert.strictEqual(data.combos.length, 5);
  assert.strictEqual(data._meta.agents, 4);
  assert.ok(data.combos.every(c => c.agents.length >= 2));
  assert.ok(data.combos.every(c => c.agents.length <= data._meta.maxN));
});

test('les combos privilégient la diversité de catégories', () => {
  const agents = ['a', 'b', 'c', 'd', 'e', 'f'].map((n, i) => ({
    name: n + '-agent', desc: 'd', category: i < 3 ? 'catA' : 'catB', path: 'agents/x/' + n + '-agent.md',
  }));
  const data = runInSandbox(agents, ['--max', '3']);
  // le 1er combo doit mixer les deux catégories (score diversité maximal)
  const cats = new Set(data.combos[0].agents.map(n => agents.find(a => a.name === n).category));
  assert.strictEqual(cats.size, 2);
});

test('prompt du combo : mentionne chaque agent et l équipe', () => {
  const agents = [
    { name: 'Alpha', desc: 'expert alpha', category: 'c1', path: 'agents/alpha.md' },
    { name: 'Beta', desc: 'expert beta', category: 'c2', path: 'x/beta.md' },
  ];
  const data = runInSandbox(agents, ['--max', '2']);
  const combo = data.combos[0];
  assert.ok(combo.prompt.includes('Alpha') && combo.prompt.includes('Beta'));
  assert.ok(/équipe|simultan/.test(combo.prompt));
  assert.ok(combo.prompt.length > 100);
});

test('pas de doublon de combinaison', () => {
  const agents = Array.from({ length: 6 }, (_, i) => ({
    name: 'agent-' + i, desc: 'd', category: 'cat' + (i % 2), path: 'agents/agent-' + i + '.md',
  }));
  const data = runInSandbox(agents, ['--max', '10']);
  const keys = data.combos.map(c => c.agents.slice().sort().join('+'));
  assert.strictEqual(new Set(keys).size, keys.length, 'combos uniques');
});

test('échoue proprement si MEGA_CATALOG est absent', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-combo-bad-'));
  fs.mkdirSync(path.join(dir, 'interface'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'interface', 'mega-pack-launcher.html'), '<html>no catalog</html>');
  const out = path.join(dir, 'out.json');
  assert.throws(() => execFileSync('node', [SCRIPT, '--src', path.join(dir, 'interface', 'mega-pack-launcher.html'), '--out', out], { cwd: dir }));
});

test('intégration : le launcher embarque AGENTS_COMBO et le générateur recharge depuis la vraie source', () => {
  const html = fs.readFileSync(LAUNCHER, 'utf8');
  assert.ok(html.includes('const AGENTS_COMBO = '), 'snapshot AGENTS_COMBO embarqué');
  const m = html.match(/const AGENTS_COMBO = (\{.*?\});\n/);
  const embedded = JSON.parse(m[1]);
  assert.ok(embedded.combos.length >= 1, 'combos présents');
  // regeneration from the real source must be stable (deterministic ranking)
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'agents-combo-live-')), 'out.json');
  execFileSync('node', [SCRIPT, '--out', out]);
  const fresh = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.deepStrictEqual(fresh.combos.map(c => c.agents), embedded.combos.map(c => c.agents), 'régénération déterministe');
});
