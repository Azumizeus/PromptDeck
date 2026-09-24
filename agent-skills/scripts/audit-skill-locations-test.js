#!/usr/bin/env node
/** Tests pour scripts/audit-skill-locations.js — audit des emplacements de skills/agents. */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, 'audit-skill-locations.js');

/** Sandbox : repo minimal (2 skills + 2 agents), installe les fichiers fournis dans un emplacement. */
function runInSandbox(installed, locDir = '.claude/skills') {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-loc-'));
  const repo = path.join(home, 'repo');
  // Repo : skills/alpha/SKILL.md, skills/nested/beta/SKILL.md, agents/fam/one.md, agents/two.md
  fs.mkdirSync(path.join(repo, 'skills', 'alpha'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'skills', 'nested', 'beta'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'agents', 'fam'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'skills', 'alpha', 'SKILL.md'), '# alpha\n');
  fs.writeFileSync(path.join(repo, 'skills', 'nested', 'beta', 'SKILL.md'), '# beta\n');
  fs.writeFileSync(path.join(repo, 'agents', 'fam', 'one.md'), '---\nname: One\ndescription: agent un original\n---\n\n# One\n');
  fs.writeFileSync(path.join(repo, 'agents', 'two.md'), '---\nname: Two\ndescription: agent deux original\n---\n\n# Two\n');
  for (const [rel, content] of Object.entries(installed)) {
    const p = path.join(home, locDir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  const env = { ...process.env, MGP_AUDIT_REPO: repo, MGP_AUDIT_HOME: home };
  const out = execFileSync('node', [SCRIPT, '--json'], { env }).toString();
  return { j: JSON.parse(out), home };
}

test('audit : drift sha256, manquants et extras sur un emplacement skills-only', () => {
  const { j } = runInSandbox({
    'alpha/SKILL.md': '# alpha\n',                 // à jour
    'beta/SKILL.md': '# beta MODIFIÉ\n',           // drift de contenu
    'extra-dir/SKILL.md': '# inconnu du repo\n',   // hors repo
  });
  const loc = j.locations.find((l) => l.id === 'claude');
  assert.equal(loc.exists, true);
  assert.equal(loc.skills.present, 2);             // alpha + beta (vus, en drift)
  assert.deepEqual(loc.skills.drift, ['beta']);
  assert.deepEqual(loc.skills.missing, []);        // les 2 skills du repo sont vus
  assert.deepEqual(loc.extras, ['extra-dir']);
  assert.equal(j.repo.skills, 2);
  assert.equal(j.repo.agents, 2);
});

test('audit : agents convertis (même description) ne sont pas en drift', () => {
  const { j } = runInSandbox({
    'agent-one/SKILL.md': '---\nname: agent-one\ntriggers:\n  - one\ndescription: agent un original\n---\n\n# One (converti)\n', // conversion attendue → OK
    'agent-two/SKILL.md': '---\nname: agent-two\ndescription: agent deux MODIFIÉ\n---\n\n# Two\n',                              // description ≠ repo → drift
  }, '.openhands/skills'); // emplacement « mixed » : les dirs agent-* sont classés agents
  const loc = j.locations.find((l) => l.id === 'openhands');
  assert.equal(loc.agents.present, 2);
  assert.deepEqual(loc.agents.drift, ['two']);
  assert.deepEqual(loc.agents.missing, []);        // one + two vus
  assert.deepEqual(loc.extras, []);                // agent-one classé agent, pas « hors repo »
});

test('audit : préfixe agent- sans correspondance repo → hors repo', () => {
  const { j } = runInSandbox({
    'agent-inconnu/SKILL.md': '---\nname: agent-inconnu\ndescription: mystère\n---\n',
  }, '.openhands/skills');
  const loc = j.locations.find((l) => l.id === 'openhands');
  assert.deepEqual(loc.extras, ['agent-inconnu']);
  assert.equal(loc.agents.present, 0);
});

test('audit : emplacement inexistant signalé sans crash', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-loc-'));
  const repo = path.join(home, 'repo');
  fs.mkdirSync(path.join(repo, 'skills', 'alpha'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'skills', 'alpha', 'SKILL.md'), '# alpha\n');
  const env = { ...process.env, MGP_AUDIT_REPO: repo, MGP_AUDIT_HOME: home };
  const j = JSON.parse(execFileSync('node', [SCRIPT, '--json'], { env }).toString());
  assert.equal(j.locations.find((l) => l.id === 'claude').exists, false);
});
