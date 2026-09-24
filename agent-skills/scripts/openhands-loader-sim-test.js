#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { afterEach, test } = require('node:test');

const {
  loadMicroagents,
  matches,
  buildInventory,
  simulateConversationStart,
  routeByDescription,
  loadSkillsFromDir,
  DESCRIPTION_ROUTING_TOP_K,
} = require('./openhands-loader-sim.js');

const sandboxes = [];

function makeSandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-openhands-sim-test-'));
  sandboxes.push(root);
  return root;
}

function writeFile(root, relativePath, content) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

afterEach(() => {
  for (const root of sandboxes.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ─── Trigger matching semantics ──────────────────────────────────────────────

test('matches fires on word boundaries, case-insensitively', () => {
  assert.equal(matches('Ship the release now', ['ship']), true);
  assert.equal(matches('SHIP IT', ['ship it']), true);
});

test('matches does not fire on substring collisions', () => {
  // "pr" inside "production" must not fire; "production" was deliberately
  // removed from route-ship's triggers because bug reports mention production.
  assert.equal(matches('the API throws an error in production', ['pr']), false);
  assert.equal(matches('unspecified behavior', ['spec']), false);
});

test('matches handles multi-word phrases and hyphenated triggers safely', () => {
  assert.equal(matches('start a new project soon', ['new project']), true);
  assert.equal(matches('a new,-project?', ['new project']), false);
  // Hyphenated triggers match at word boundaries (and pass the validator's
  // alphanumeric rule); the "c++"-style case is moot because the validator
  // rejects non-alphanumeric triggers outright.
  assert.equal(matches('run the code-review please', ['code-review']), true);
});

// ─── Microagent loading ──────────────────────────────────────────────────────

test('loadMicroagents reads names, triggers, and always-loaded state', () => {
  const root = makeSandbox();
  writeFile(root, 'microagents/startup.md', '---\nname: startup\n---\n\nbody\n');
  writeFile(root, 'microagents/router.md', '---\nname: router\ntriggers:\n- bug\n---\n\nbody\n');

  const agents = loadMicroagents(path.join(root, 'microagents'));

  assert.equal(agents.length, 2);
  const startup = agents.find(a => a.name === 'startup');
  const router = agents.find(a => a.name === 'router');
  assert.equal(startup.alwaysLoaded, true);
  assert.deepEqual(router.triggers, ['bug']);
  assert.equal(router.alwaysLoaded, false);
});

// ─── Skill inventory ─────────────────────────────────────────────────────────

test('buildInventory lists one line per skill from frontmatter only', () => {
  const root = makeSandbox();
  writeFile(root, 'skills/debugging/SKILL.md', '---\nname: debugging\ndescription: Fix bugs fast. Use when something broke.\n---\n\nfull body that must NOT appear\n');
  writeFile(root, 'skills/not-a-skill/README.md', 'no SKILL.md here\n');

  const inventory = buildInventory(path.join(root, 'skills'));

  assert.deepEqual(inventory, ['- debugging — Fix bugs fast.']);
  assert.ok(!JSON.stringify(inventory).includes('full body'));
});

test('buildInventory returns null when the skills directory is absent', () => {
  const root = makeSandbox();
  assert.equal(buildInventory(path.join(root, 'skills')), null);
});

// ─── Description routing (TF-IDF over skill descriptions) ───────────────────

test('loadSkillsFromDir reads skill frontmatter like run-evals does', () => {
  const root = makeSandbox();
  writeFile(root, 'skills/alpha/SKILL.md', '---\nname: alpha\ndescription: Handles alpha work. Use when alpha tasks arrive.\n---\nbody\n');
  writeFile(root, 'skills/broken/SKILL.md', 'no frontmatter here\n');

  const skills = loadSkillsFromDir(path.join(root, 'skills'));

  assert.equal(skills.length, 1);
  assert.equal(skills[0].name, 'alpha');
  assert.match(skills[0].description, /^Handles alpha work/);
});

test('routeByDescription fires routers owning a top-k ranked skill only', () => {
  const corpus = {
    docs: new Map([
      ['debugging', new Map([['debug', 3], ['root', 2]])],
      ['planning', new Map([['plan', 3], ['task', 2]])],
      ['cooking', new Map([['cook', 4], ['kitchen', 2]])],
    ]),
    idf: (t) => (['debug', 'plan', 'cook'].includes(t) ? 3 : 1),
  };
  const routerSkills = new Map([
    ['route-bug', ['debugging']],
    ['route-plan', ['planning']],
  ]);

  // "debug the root cause" strongly matches debugging; planning stays out.
  const fired = routeByDescription('debug the root cause now', corpus, routerSkills, 1);
  assert.deepEqual(fired, ['route-bug']);

  // "plan the tasks" ranks planning first; top-2 lets route-plan fire too.
  assert.deepEqual(routeByDescription('plan the tasks', corpus, routerSkills, 2), ['route-plan']);
});

test('routeByDescription fires multiple routers on adjacent top-k skills and sorts output', () => {
  const corpus = {
    docs: new Map([
      ['debugging', new Map([['test', 2], ['fail', 2]])],
      ['tdd', new Map([['test', 3]])],
    ]),
    idf: () => 2,
  };
  const routerSkills = new Map([
    ['route-bug', ['debugging']],
    ['route-build', ['tdd']],
  ]);

  // Both skills share the "test" vocabulary: both routers fire, sorted.
  assert.deepEqual(
    routeByDescription('a test fails', corpus, routerSkills, 2),
    ['route-bug', 'route-build'],
  );
});

test('DESCRIPTION_ROUTING_TOP_K is 3, matching the eval suite default top_k', () => {
  assert.equal(DESCRIPTION_ROUTING_TOP_K, 3);
});

test('real-repo simulation passes description routing for every sample message', () => {
  // This is the description-routing counterpart of the keyword replay: it
  // runs the full simulateConversationStart (which now checks both layers)
  // against the real repository.
  const root = path.join(__dirname, '..');
  const { simulateConversationStart: sim, SAMPLE_MESSAGES } = require('./openhands-loader-sim.js');
  const { ok, errors } = sim({
    microagentsDir: path.join(root, '.openhands', 'microagents'),
    skillsDir: path.join(root, 'skills'),
    sampleMessages: SAMPLE_MESSAGES,
  });
  assert.equal(ok, true, errors.join('; '));
});

// ─── Full simulation ─────────────────────────────────────────────────────────

function writeRealisticPack(root) {
  writeFile(root, 'microagents/list-loaded-skills.md', '---\nname: list-loaded-skills\n---\n\nList skills/ at conversation start.\n');
  writeFile(root, 'microagents/route-bug.md', '---\nname: route-bug\ntriggers:\n- bug\n---\n\nApply skills/debugging/SKILL.md.\n');
  writeFile(root, 'skills/debugging/SKILL.md', '---\nname: debugging\ndescription: Fix bugs. Use when broken.\n---\nbody\n');
}

test('simulation passes on a well-formed pack', () => {
  const root = makeSandbox();
  writeRealisticPack(root);

  const { ok, errors, summary } = simulateConversationStart({
    microagentsDir: path.join(root, 'microagents'),
    skillsDir: path.join(root, 'skills'),
    sampleMessages: [{ message: 'this is a bug', expect: ['route-bug'] }],
  });

  assert.equal(ok, true, errors.join('; '));
  assert.equal(summary.skills, 1);
  assert.equal(summary.alwaysLoaded, 1);
  assert.equal(summary.triggered, 1);
});

test('simulation fails when the always-loaded startup microagent is missing', () => {
  const root = makeSandbox();
  writeFile(root, 'skills/debugging/SKILL.md', '---\nname: debugging\ndescription: x\n---\nbody\n');
  writeFile(root, 'microagents/route-bug.md', '---\nname: route-bug\ntriggers:\n- bug\n---\n\nApply skills/debugging/SKILL.md.\n');

  const { ok, errors } = simulateConversationStart({
    microagentsDir: path.join(root, 'microagents'),
    skillsDir: path.join(root, 'skills'),
    sampleMessages: [{ message: 'a bug', expect: ['route-bug'] }],
  });

  assert.equal(ok, false);
  assert.ok(errors.some(e => /list-loaded-skills\.md is not always-loaded/.test(e)));
});

test('simulation fails when a sample message fires the wrong router', () => {
  const root = makeSandbox();
  writeRealisticPack(root);

  const { ok, errors } = simulateConversationStart({
    microagentsDir: path.join(root, 'microagents'),
    skillsDir: path.join(root, 'skills'),
    sampleMessages: [{ message: 'an unrelated bug report', expect: [] }],
  });

  assert.equal(ok, false);
  assert.ok(errors.some(e => /expected \[none\] to fire, got \[route-bug\]/.test(e)));
});

test('simulation fails when a triggered router never fires on any sample', () => {
  const root = makeSandbox();
  writeRealisticPack(root);
  writeFile(root, 'microagents/route-ghost.md', '---\nname: route-ghost\ntriggers:\n- ghost-word\n---\n\nApply skills/debugging/SKILL.md.\n');

  const { ok, errors } = simulateConversationStart({
    microagentsDir: path.join(root, 'microagents'),
    skillsDir: path.join(root, 'skills'),
    sampleMessages: [{ message: 'a bug', expect: ['route-bug'] }],
  });

  assert.equal(ok, false);
  assert.ok(errors.some(e => /route-ghost never fires on any sample message/.test(e)));
});

test('simulation fails when a router targets a skill missing from disk', () => {
  const root = makeSandbox();
  writeFile(root, 'microagents/list-loaded-skills.md', '---\nname: list-loaded-skills\n---\n\nList skills/.\n');
  writeFile(root, 'microagents/route-bug.md', '---\nname: route-bug\ntriggers:\n- bug\n---\n\nApply skills/missing/SKILL.md.\n');
  writeFile(root, 'skills/debugging/SKILL.md', '---\nname: debugging\ndescription: x\n---\nbody\n');

  const { ok, errors } = simulateConversationStart({
    microagentsDir: path.join(root, 'microagents'),
    skillsDir: path.join(root, 'skills'),
    sampleMessages: [{ message: 'a bug', expect: ['route-bug'] }],
  });

  assert.equal(ok, false);
  assert.ok(errors.some(e => /routes to skills\/missing\/SKILL\.md, which does not exist/.test(e)));
});

test('simulation fails when skills/ is absent (inventory would be empty)', () => {
  const root = makeSandbox();
  writeFile(root, 'microagents/list-loaded-skills.md', '---\nname: list-loaded-skills\n---\n\nList skills/.\n');

  const { ok, errors } = simulateConversationStart({
    microagentsDir: path.join(root, 'microagents'),
    skillsDir: path.join(root, 'skills'),
    sampleMessages: [],
  });

  assert.equal(ok, false);
  assert.ok(errors.some(e => /skills\/ not found/.test(e)));
});

// ─── Real repo end-to-end (CLI) ──────────────────────────────────────────────

test('the real repository passes the simulation end-to-end', () => {
  const root = path.join(__dirname, '..');
  const result = spawnSync(process.execPath, [path.join(__dirname, 'openhands-loader-sim.js')], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Simulation PASSED/);
  assert.match(result.stdout, /Loaded skills \(30\):/);
});
