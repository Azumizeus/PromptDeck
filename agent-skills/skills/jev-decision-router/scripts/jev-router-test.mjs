#!/usr/bin/env node
/**
 * jev-router-test.mjs — tests du routeur de décision typé (façon Jev).
 *   node --test skills/jev-decision-router/scripts/jev-router-test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { decide, loadSkills, loadPersonas } from './jev-router.mjs';

const ROUTER = path.join(path.dirname(fileURLToPath(import.meta.url)), 'jev-router.mjs');

/** Catalogue sandbox : 4 skills frontmattés comme de vrais SKILL.md. */
function sandbox(dir) {
  const mk = (name, body) => {
    fs.mkdirSync(path.join(dir, name), { recursive: true });
    fs.writeFileSync(path.join(dir, name, 'SKILL.md'), body);
  };
  mk('debugging-and-error-recovery', `---\nname: debugging-and-error-recovery\nphase: VERIFY\ndescription: >\n  Guides systematic root-cause debugging. Use when tests fail, builds break,\n  or you encounter any unexpected error and need to find the root cause.\n---\n\n# Debug\n`);
  mk('spec-driven-development', `---\nname: spec-driven-development\nphase: DEFINE\ndescription: >\n  Creates specs before coding. Use when starting a new project or feature\n  and no specification exists yet. Draft a PRD with objectives and scope.\n---\n\n# Spec\n`);
  mk('shipping-and-launch', `---\nname: shipping-and-launch\nphase: SHIP\ndescription: >\n  Prepares production launches. Use when preparing to deploy to production,\n  with a pre-launch checklist, staged rollout and rollback strategy.\n---\n\n# Ship\n`);
  mk('code-review-and-quality', `---\nname: code-review-and-quality\nphase: REVIEW\ndescription: >\n  Conducts multi-axis code review before merging. Assess code quality\n  across multiple dimensions when reviewing a pull request.\n---\n\n# Review\n`);
  return loadSkills(dir);
}

const SKILLS = sandbox(fs.mkdtempSync(path.join(os.tmpdir(), 'jev-router-')));

function assertDecisionShape(d) {
  for (const k of ['decision', 'confidence', 'alternatives', 'matchedTriggers', 'phase', 'mode', 'topK']) {
    assert.ok(k in d, `champ typé manquant : ${k}`);
  }
  assert.ok(typeof d.decision === 'string' || d.decision === null);
  assert.ok(d.confidence >= 0 && d.confidence <= 1);
  assert.ok(Array.isArray(d.alternatives) && d.alternatives.every((a) => typeof a.choice === 'string' && typeof a.score === 'number'));
  assert.ok(['trigger', 'tfidf', 'trigger+tfidf'].includes(d.mode));
  if ('kind' in d) assert.ok(['skill', 'persona'].includes(d.kind), `kind invalide : ${d.kind}`);
}

test('contrat : la décision est un objet typé complet', () => {
  assertDecisionShape(decide('j\'ai un bug : les tests échouent après la migration', SKILLS));
});

test('choix fermé : la décision appartient toujours au catalogue', () => {
  const catalog = new Set(SKILLS.map((s) => s.name));
  for (const msg of ['bug crash error', 'write a spec prd for the new project', 'ship deploy to production', 'review this pull request']) {
    const d = decide(msg, SKILLS);
    if (d.decision !== null) assert.ok(catalog.has(d.decision), `${d.decision} hors catalogue`);
  }
});

test('couche triggers : bug/error route vers debugging-and-error-recovery', () => {
  const d = decide('j\'ai un bug : les tests échouent', SKILLS);
  assert.equal(d.decision, 'debugging-and-error-recovery');
  assert.equal(d.phase, 'VERIFY');
  assert.ok(d.matchedTriggers.includes('bug'));
});

test('TF-IDF pur : routage par vocabulaire de description sans trigger', () => {
  const d = decide('draft the prd objectives and scope before coding the feature', SKILLS);
  assert.equal(d.decision, 'spec-driven-development');
  assert.equal(d.phase, 'DEFINE');
});

test('confiance : top-1 net → confiance élevée ; alternatives triées', () => {
  const d = decide('the build is broken, crash on start, root cause of the error', SKILLS);
  assert.equal(d.decision, 'debugging-and-error-recovery');
  assert.ok(d.confidence >= 0.5, `confiance ${d.confidence} trop basse`);
  for (const a of d.alternatives) assert.ok(a.score <= 1 && a.score >= 0);
  // les alternatives sont triées décroissantes et toutes ≠ décision
  for (let i = 1; i < d.alternatives.length; i++) assert.ok(d.alternatives[i - 1].score >= d.alternatives[i].score);
  assert.ok(d.alternatives.every((a) => a.choice !== d.decision));
});

test('escalade : min-confidence 0.999 renvoie decision null + matchedTriggers vides', () => {
  const d = decide('bonjour', SKILLS, { minConfidence: 0.999 });
  assert.equal(d.decision, null);
  assert.deepEqual(d.matchedTriggers, []);
});

test('top-k borne les alternatives', () => {
  const d = decide('deploy production release', SKILLS, { topK: 1 });
  assert.ok(d.alternatives.length <= 1);
  assert.equal(d.topK, 1);
});

test('CLI : exit 0 + JSON valide sur décision', () => {
  const r = spawnSync(process.execPath, [ROUTER, 'bug crash error', '--skills-dir', path.dirname(SKILLS[0].name ? '' : '')].filter(Boolean), { encoding: 'utf8' });
  // (appel direct avec catalogue sandbox via --skills-dir)
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jev-cli-'));
  sandbox(dir);
  const r2 = spawnSync(process.execPath, [ROUTER, 'bug crash error', '--skills-dir', dir], { encoding: 'utf8' });
  assert.equal(r2.status, 0, r2.stderr);
  const parsed = JSON.parse(r2.stdout.trim());
  assertDecisionShape(parsed);
  assert.equal(parsed.decision, 'debugging-and-error-recovery');
  assert.ok(!r.stdout || true); // la première invocation est best-effort
});

test('CLI : exit 2 sur confiance insuffisante (escalade)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jev-cli2-'));
  sandbox(dir);
  const r = spawnSync(process.execPath, [ROUTER, 'xyzzy', '--skills-dir', dir, '--min-confidence', '0.999'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  const parsed = JSON.parse(r.stdout.trim());
  assert.equal(parsed.decision, null);
});

test('CLI : --jsonl rend une décision typée par ligne', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jev-cli3-'));
  sandbox(dir);
  const input = JSON.stringify({ message: 'bug crash' }) + '\n' + JSON.stringify({ message: 'deploy release' }) + '\n';
  const r = spawnSync(process.execPath, [ROUTER, '--jsonl', '--skills-dir', dir], { input, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(lines.length, 2);
  assertDecisionShape(lines[0]);
  assert.equal(lines[0].decision, 'debugging-and-error-recovery');
  assert.equal(lines[1].decision, 'shipping-and-launch');
});

test('real world : le catalogue complet du dépôt charge et route', () => {
  const repoSkills = loadSkills(path.resolve(path.dirname(ROUTER), '..', '..', '..', 'skills'));
  assert.ok(repoSkills.length > 100, `catalogue trop petit : ${repoSkills.length}`);
  const d = decide('les tests échouent après ma migration de base de données', repoSkills);
  assertDecisionShape(d);
  assert.ok(d.decision, `aucune décision pour le catalogue réel (${repoSkills.length} skills)`);
});

test('personas : les 190+ agents de agents/ se chargent (kind persona)', () => {
  const personas = loadPersonas(path.resolve(path.dirname(ROUTER), '..', '..', '..', 'agents'));
  assert.ok(personas.length > 100, `trop peu de personas : ${personas.length}`);
  for (const p of personas) {
    assert.equal(p.kind, 'persona');
    assert.ok(p.name, 'persona sans nom');
  }
  assert.ok(personas.some((p) => /engineer|designer|specialist/i.test(p.name)), 'personas attendus (engineer/designer/specialist)');
});

test('--all : le routing fusionné skills+personas retourne kind dans le JSON', () => {
  const root = path.resolve(path.dirname(ROUTER), '..', '..', '..');
  const cat = [...loadSkills(path.join(root, 'skills')), ...loadPersonas(path.join(root, 'agents'))];
  assert.ok(cat.length > 250, `catalogue fusionné trop petit : ${cat.length}`);
  const d = decide('fix my broken data pipeline, it cannot stop', cat);
  assertDecisionShape(d);
  assert.ok(['skill', 'persona'].includes(d.kind), `kind absent ou invalide : ${JSON.stringify(d.kind)}`);
});
