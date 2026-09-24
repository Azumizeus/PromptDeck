#!/usr/bin/env node
/** Tests pour scripts/sync-skill-locations.js — propagation vers les emplacements. */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, 'sync-skill-locations.js');

/** Sandbox : repo 2 skills (beta avec reference/), 2 agents ; emplacements pré-remplis. */
function makeSandbox() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-loc-'));
  const repo = path.join(home, 'repo');
  fs.mkdirSync(path.join(repo, 'skills', 'alpha'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'skills', 'beta', 'references'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'agents', 'fam'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'skills', 'alpha', 'SKILL.md'), '# alpha\n');
  fs.writeFileSync(path.join(repo, 'skills', 'beta', 'SKILL.md'), '# beta\n');
  fs.writeFileSync(path.join(repo, 'skills', 'beta', 'references', 'api.md'), '# ref api\n');
  fs.writeFileSync(path.join(repo, 'agents', 'fam', 'one.md'), '---\nname: One\ndescription: agent un original\n---\n\n# One\n');
  fs.writeFileSync(path.join(repo, 'agents', 'two.md'), '---\nname: Two\ndescription: agent deux original\n---\n\n# Two\n');
  return { home, repo };
}
/** Sortie combinée stdout+stderr (les avertissements partent sur stderr). */
const run = (home, ...cli) => {
  const r = spawnSync('node', [SCRIPT, ...cli],
    { env: { ...process.env, MGP_AUDIT_REPO: path.join(home, 'repo'), MGP_AUDIT_HOME: home }, encoding: 'utf8' });
  assert.equal(r.status, 0, `exit ${r.status} : ${r.stderr}`);
  return (r.stdout || '') + (r.stderr || '');
};

test('sync plan : ne écrit rien et annonce les bonnes actions', () => {
  const { home } = makeSandbox();
  // claude : alpha à jour, beta absent → plan = 1 copie ; dossier privé intact
  fs.mkdirSync(path.join(home, '.claude/skills/alpha'), { recursive: true });
  fs.mkdirSync(path.join(home, '.claude/skills/prive'), { recursive: true });
  fs.writeFileSync(path.join(home, '.claude/skills/alpha/SKILL.md'), '# alpha\n');
  fs.writeFileSync(path.join(home, '.claude/skills/prive/SKILL.md'), '# hors repo\n');
  const out = run(home, '--loc', 'claude');
  assert.match(out, /1 skill\(s\) à installer/);
  assert.match(out, /relance avec « apply »/);
  assert.ok(!fs.existsSync(path.join(home, '.claude/skills/beta')), 'le plan ne doit rien écrire');
  assert.ok(fs.existsSync(path.join(home, '.claude/skills/prive/SKILL.md')), 'les extras ne sont jamais touchés');
});

test('sync apply : copie le dossier complet du skill (references incluses)', () => {
  const { home } = makeSandbox();
  run(home, '--loc', 'claude', 'apply');
  const installed = path.join(home, '.claude/skills/beta');
  assert.equal(fs.readFileSync(path.join(installed, 'SKILL.md'), 'utf8'), '# beta\n');
  assert.equal(fs.readFileSync(path.join(installed, 'references', 'api.md'), 'utf8'), '# ref api\n');
});

test('sync apply : les agents sont créés en conversion agent-<nom> (description verbatim), convention hôte respectée', () => {
  const { home } = makeSandbox();
  // openhands « mixed » : un agent déjà installé → les agents sont éligibles
  fs.mkdirSync(path.join(home, '.openhands/skills/agent-one'), { recursive: true });
  fs.writeFileSync(path.join(home, '.openhands/skills/agent-one/SKILL.md'),
    '---\nname: agent-one\ndescription: agent un original\ntriggers:\n  - one\n---\n\n# One\n');
  const out = run(home, '--loc', 'openhands', 'apply');
  assert.match(out, /1 agent\(s\) à créer/);
  // agent manquant → conversion
  const two = fs.readFileSync(path.join(home, '.openhands/skills/agent-two/SKILL.md'), 'utf8');
  assert.match(two, /^name: agent-two$/m);
  assert.match(two, /^description: agent deux original$/m, 'description du repo copiée verbatim');
  assert.match(two, /^triggers:\n(  - \w+\n)+/m);
  assert.match(two, /# Two\n/, 'corps du repo conservé');
  // agent existant et à jour → pas réécrit
  const one = fs.readFileSync(path.join(home, '.openhands/skills/agent-one/SKILL.md'), 'utf8');
  assert.match(one, /^name: agent-one$/m);
  // l'emplacement claude (skills-only, aucun agent installé) n'en reçoit pas
  run(home, '--loc', 'claude', 'apply');
  assert.ok(!fs.existsSync(path.join(home, '.claude/skills/agent-one')), 'convention hôte : claude reste skills-only');
  // --with-agents force
  run(home, '--loc', 'claude', 'apply', '--with-agents');
  assert.ok(fs.existsSync(path.join(home, '.claude/skills/agent-one/SKILL.md')), '--with-agents force les agents');
});

test('sync apply : le drift de skill est réparé et l audit post-sync est vert', () => {
  const { home } = makeSandbox();
  fs.mkdirSync(path.join(home, '.claude/skills/beta'), { recursive: true });
  fs.writeFileSync(path.join(home, '.claude/skills/beta/SKILL.md'), '# beta VIEILLE VERSION\r\n');
  const out = run(home, '--loc', 'claude', 'apply');
  assert.match(out, /1 à réparer/);
  assert.equal(fs.readFileSync(path.join(home, '.claude/skills/beta/SKILL.md'), 'utf8'), '# beta\n');
  assert.match(out, /post-sync/);
  assert.match(out, /drift 0/);
});

test('sync : dossier absent = initialisation (cible vierge de premier déploiement)', () => {
  const { home } = makeSandbox();
  // plan : annonce la création sans écrire
  const planOut = run(home, '--loc', 'opencode');
  assert.match(planOut, /dossier absent — sera créé/);
  assert.ok(!fs.existsSync(path.join(home, '.config/opencode/skills')));
  // apply : crée le dossier et installe tout le repo
  run(home, '--loc', 'opencode', 'apply');
  assert.equal(fs.readFileSync(path.join(home, '.config/opencode/skills/alpha/SKILL.md'), 'utf8'), '# alpha\n');
});
