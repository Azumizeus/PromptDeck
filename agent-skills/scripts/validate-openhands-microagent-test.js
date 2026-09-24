#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { afterEach, test } = require('node:test');

const {
  parseFrontmatter,
  hasTriggersField,
  extractFrontmatterEntries,
  extractScalar,
  parseLifecycleMapping,
  validateMicroagents,
  REQUIRED_ALWAYS_LOADED,
} = require('./validate-openhands-microagent.js');

const VALIDATOR = path.join(__dirname, 'validate-openhands-microagent.js');
const sandboxes = [];

const AGENTS_MD_FIXTURE = [
  '# Agent Skills (OpenCode)',
  '',
  '## OpenCode Integration',
  '',
  '### Lifecycle Mapping (Implicit Commands)',
  '',
  '- DEFINE → `spec-driven-development`',
  '- PLAN → `planning-and-task-breakdown`',
  '- BUILD → `incremental-implementation` + `test-driven-development`',
  '- VERIFY → `debugging-and-error-recovery` (or `security-audit` for vulnerability verification)',
  '- REVIEW → `code-review-and-quality` (+ `security-audit` guidance mode for security-sensitive changes)',
  '- SHIP → `shipping-and-launch`',
  '',
  '### Execution Model',
  '',
  '1. Determine if any skill applies',
].join('\n');

const STARTUP_MD = [
  '---',
  'name: list-loaded-skills',
  'description: Startup inventory for the agent-skills repository.',
  '---',
  '',
  '# Loaded Skills Inventory (agent-skills)',
  '',
  'List the directories under skills/ at the start of every conversation.',
].join('\n');

function triggeredMd(name, { phase = 'VERIFY', routes = 'debugging-and-error-recovery', triggers = ['bug'], microagentOnly = false } = {}) {
  const lines = [
    '---',
    `name: ${name}`,
    `description: Routes to ${routes}.`,
  ];
  if (phase !== null) lines.push(`phase: ${phase}`);
  if (microagentOnly) lines.push('microagent-only: true');
  lines.push('triggers:');
  for (const t of triggers) lines.push(`- ${t}`);
  lines.push('---', '', `# Route: ${name}`, '');
  for (const r of [].concat(routes)) {
    lines.push(`Apply skills/${r}/SKILL.md before fixing anything.`);
  }
  return lines.join('\n');
}

function makeSandbox({ agentsMd = AGENTS_MD_FIXTURE } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-validate-openhands-test-'));
  const scriptsDir = path.join(root, 'scripts');
  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.copyFileSync(VALIDATOR, path.join(scriptsDir, 'validate-openhands-microagent.js'));
  if (agentsMd !== null) fs.writeFileSync(path.join(root, 'AGENTS.md'), agentsMd);
  sandboxes.push(root);
  return root;
}

function writeMicroagent(root, name, content) {
  const file = path.join(root, '.openhands', 'microagents', name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function writeSkill(root, name) {
  const file = path.join(root, 'skills', name, 'SKILL.md');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `---\nname: ${name}\ndescription: x. Use when x.\n---\n\nbody\n`);
}

function run(root) {
  return spawnSync(process.execPath, [path.join(root, 'scripts', 'validate-openhands-microagent.js')], {
    cwd: root,
    encoding: 'utf8',
  });
}

afterEach(() => {
  for (const root of sandboxes.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ─── Unit tests: frontmatter helpers ─────────────────────────────────────────

test('parseFrontmatter splits frontmatter and body, tolerating BOM', () => {
  const { frontmatter, body } = parseFrontmatter('\uFEFF---\nname: x\n---\n\nbody');
  assert.equal(frontmatter, 'name: x');
  assert.equal(body.trim(), 'body');
});

test('parseFrontmatter treats missing or unterminated frontmatter as null', () => {
  assert.equal(parseFrontmatter('no frontmatter').frontmatter, null);
  assert.equal(parseFrontmatter('---\nname: x\nbody').frontmatter, null);
});

test('hasTriggersField detects triggers only when present', () => {
  assert.equal(hasTriggersField('name: x\ntriggers:\n- a'), true);
  assert.equal(hasTriggersField('name: x'), false);
});

test('extractFrontmatterEntries reads list items and stops at the next key', () => {
  const fm = 'triggers:\n- bug\n- crash\nname: route-bug';
  assert.deepEqual(extractFrontmatterEntries(fm, 'triggers'), ['bug', 'crash']);
});

test('extractScalar reads scalar values', () => {
  assert.equal(extractScalar('name: route-bug\nphase: VERIFY', 'name'), 'route-bug');
  assert.equal(extractScalar('name: route-bug', 'phase'), null);
});

// ─── Unit tests: lifecycle mapping ───────────────────────────────────────────

test('parseLifecycleMapping parses h3 section with arrows and multiple skills', () => {
  const map = parseLifecycleMapping(AGENTS_MD_FIXTURE);
  assert.deepEqual(map.DEFINE, ['spec-driven-development']);
  assert.deepEqual(map.VERIFY, ['debugging-and-error-recovery', 'security-audit']);
  assert.deepEqual(map.REVIEW, ['code-review-and-quality', 'security-audit']);
  assert.deepEqual(map.SHIP, ['shipping-and-launch']);
});

test('parseLifecycleMapping handles h2 headings and -> arrows', () => {
  const map = parseLifecycleMapping([
    '## Lifecycle Mapping',
    '',
    '- VERIFY -> `debugging-and-error-recovery`',
    '',
    '## Other',
  ].join('\n'));
  assert.deepEqual(map.VERIFY, ['debugging-and-error-recovery']);
});

test('parseLifecycleMapping returns empty for missing section or content', () => {
  assert.deepEqual(parseLifecycleMapping('no section here'), {});
  assert.deepEqual(parseLifecycleMapping(''), {});
  assert.deepEqual(parseLifecycleMapping(null), {});
});

// ─── Integration: full validation ────────────────────────────────────────────

test('passes with the startup inventory and well-formed lifecycle routers', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'route-bug.md', triggeredMd('route-bug', { phase: 'VERIFY', routes: 'debugging-and-error-recovery' }));
  writeMicroagent(root, 'route-spec.md', triggeredMd('route-spec', { phase: 'DEFINE', routes: 'spec-driven-development' }));
  for (const skill of ['debugging-and-error-recovery', 'spec-driven-development']) writeSkill(root, skill);

  const result = run(root);

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /3 microagents checked \(1 always-loaded, 2 keyword-triggered\) — PASSED/);
});

test('fails when the startup inventory microagent is removed', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'other.md', 'no frontmatter, always loaded\n');

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /list-loaded-skills\.md is missing/);
});

test('fails when a triggers field turns the startup inventory into a keyword skill', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD.replace('description: Startup inventory', 'triggers:\n- skills\ndescription: Startup inventory'));

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /ALWAYS loaded: remove triggers/);
});

test('fails when the startup inventory body loses the conversation-start contract', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD.replace(
    'List the directories under skills/ at the start of every conversation.',
    'Just list things under skills/ whenever you feel like it.',
  ));

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /conversation start/);
});

test('fails when no always-loaded microagent remains', () => {
  const root = makeSandbox();
  writeMicroagent(root, REQUIRED_ALWAYS_LOADED, triggeredMd('list-loaded-skills', { triggers: ['skills'] }));
  writeMicroagent(root, 'keyword-only.md', triggeredMd('keyword-only', { triggers: ['deploy'] }));

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /No always-loaded microagent found/);
});

test('fails when the OpenHands microagents directory is missing', () => {
  const root = makeSandbox();

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /directory not found/);
});

test('accepts extra always-loaded microagents alongside the startup inventory', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'repo-conventions.md', 'Repository-specific conventions.\n');

  const result = run(root);

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /2 microagents checked \(2 always-loaded, 0 keyword-triggered\) — PASSED/);
});

test('fails when a triggered microagent has an empty triggers list', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'route-x.md', '---\nname: route-x\nphase: VERIFY\ntriggers:\n---\n\nApply skills/debugging-and-error-recovery/SKILL.md.\n');

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /triggers field with no entries/);
});

test('fails when a triggered microagent has non-alphanumeric or oversized triggers', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'route-x.md', triggeredMd('route-x', { triggers: ['bug!', 'a'.repeat(40)] }));

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /non-alphanumeric trigger "bug!"/);
  assert.match(result.stdout + result.stderr, /longer than 32 characters/);
});

test('fails when a triggered microagent routes to a nonexistent skill', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'route-x.md', triggeredMd('route-x', { phase: 'VERIFY', routes: 'not-a-skill' }));
  // skills/ must exist (and hold a real skill) for the existence guard to
  // apply: with no skill inventory at all the validator cannot distinguish a
  // broken routing target from a skill-less workspace.
  writeSkill(root, 'debugging-and-error-recovery');

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /routes to skills\/not-a-skill\/SKILL\.md, which does not exist/);
});

test('fails when a triggered microagent routes to no skill at all', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'route-x.md', '---\nname: route-x\nphase: VERIFY\ntriggers:\n- bug\n---\n\nJust do your best.\n');

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /triggered but routes to no skill/);
});

test('fails when a triggered microagent omits its phase', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'route-x.md', triggeredMd('route-x', { phase: null, routes: 'debugging-and-error-recovery' }));

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /missing a "phase:" frontmatter field/);
});

test('fails when a triggered microagent declares an unknown phase', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'route-x.md', triggeredMd('route-x', { phase: 'DEPLOY', routes: 'debugging-and-error-recovery' }));

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /phase "DEPLOY", which AGENTS\.md's "Lifecycle Mapping" section does not define/);
});

test('fails when a triggered microagent routes outside its AGENTS.md phase', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  // route-x declares phase DEFINE but routes to the VERIFY skill.
  writeMicroagent(root, 'route-x.md', triggeredMd('route-x', { phase: 'DEFINE', routes: 'debugging-and-error-recovery' }));
  writeSkill(root, 'debugging-and-error-recovery');
  writeSkill(root, 'spec-driven-development');

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /routes to \[debugging-and-error-recovery\] but AGENTS\.md maps DEFINE to/);
});

test('accepts a triggered microagent routing to any skill of its phase', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  // VERIFY maps to [debugging-and-error-recovery, security-audit]; either is fine.
  writeMicroagent(root, 'route-sec.md', triggeredMd('route-sec', { phase: 'VERIFY', routes: 'security-audit' }));
  writeSkill(root, 'debugging-and-error-recovery');
  writeSkill(root, 'security-audit');

  const result = run(root);

  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('accepts a microagent-only router that skips AGENTS.md phase checks', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'route-sec.md', triggeredMd('route-sec', { phase: null, routes: 'security-audit', microagentOnly: true }));
  writeSkill(root, 'security-audit');

  const result = run(root);

  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('fails when two microagents share the same frontmatter name', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'a.md', triggeredMd('route-x', { routes: 'debugging-and-error-recovery' }));
  writeMicroagent(root, 'b.md', triggeredMd('route-x', { routes: 'debugging-and-error-recovery' }));
  writeSkill(root, 'debugging-and-error-recovery');

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /Duplicate microagent frontmatter name "route-x"/);
});

test('fails when a microagent name duplicates a skill directory name', () => {
  const root = makeSandbox();
  writeMicroagent(root, 'list-loaded-skills.md', STARTUP_MD);
  writeMicroagent(root, 'shadow.md', triggeredMd('debugging-and-error-recovery', { phase: 'VERIFY', routes: 'debugging-and-error-recovery' }));
  writeSkill(root, 'debugging-and-error-recovery');

  const result = run(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /duplicates skill directory skills\/debugging-and-error-recovery\//);
});

test('allows the real repo to pass end-to-end (regression guard)', () => {
  // Runs the validator against the actual repository content via spawn, with
  // the real AGENTS.md and skills/ — guards against validator drift that
  // sandbox tests with synthetic fixtures cannot catch.
  const result = spawnSync(process.execPath, [VALIDATOR], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });

  assert.equal(result.status, 0, result.stdout + result.stderr);
});
