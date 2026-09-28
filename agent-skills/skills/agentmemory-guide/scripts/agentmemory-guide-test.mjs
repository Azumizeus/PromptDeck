#!/usr/bin/env node
/**
 * agentmemory-guide-test.mjs — tests du skill agentmemory-guide
 *
 * Zéro dépendance (convention du repo) : vérifie la conformité du SKILL.md
 * (frontmatter, sections obligatoires) et, si le serveur tourne sur :3111,
 * sonde son état réel (livez + sessions importées). L'absence de serveur est
 * signalée en skip, pas en échec : le skill documente un service qui peut être
 * éteint, ce n'est pas une régression du document.
 *
 * Run: node --test skills/agentmemory-guide/scripts/agentmemory-guide-test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL_MD = readFileSync(join(HERE, '..', 'SKILL.md'), 'utf8');

const REQUIRED_SECTIONS = [
  '## Overview',
  '## When to Use',
  '## Common Rationalizations',
  '## Red Flags',
  '## Verification',
];

function stripFences(md) {
  return md
    .split(/\r?\n/)
    .filter((l) => !/^ {0,3}(`{3,}|~{3,})/.test(l))
    .join('\n');
}

test('frontmatter : name = agentmemory-guide', () => {
  const m = SKILL_MD.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(m, 'frontmatter présent');
  assert.match(m[1], /^name:\s*agentmemory-guide\s*$/m);
});

test('frontmatter : description avec trigger "Use when"', () => {
  const m = SKILL_MD.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(m, 'frontmatter présent');
  const desc = m[1].split(/\r?\n/).filter((l) => /^description:/.test(l) || /^ {2}/.test(l)).join(' ');
  assert.match(desc, /Use when/i, 'la description déclare quand utiliser le skill');
  assert.ok(desc.replace(/^description:\s*-?\s*/, '').trim().length <= 1024, 'description ≤ 1024 caractères');
});

test('les 5 sections obligatoires sont présentes', () => {
  const prose = stripFences(SKILL_MD);
  for (const s of REQUIRED_SECTIONS) {
    assert.ok(new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(prose), `section manquante : ${s}`);
  }
});

test('documente les 4 clients (OpenCode, Freebuff, ChatDeck, LibreChat)', () => {
  for (const client of ['OpenCode', 'Freebuff', 'ChatDeck', 'LibreChat']) {
    assert.ok(SKILL_MD.includes(client), `client manquant : ${client}`);
  }
});

test('le serveur :3111 répond livez ok (skip si éteint)', async (t) => {
  let body;
  try {
    const r = await fetch('http://localhost:3111/agentmemory/livez', { signal: AbortSignal.timeout(4000) });
    body = await r.text();
    assert.equal(r.status, 200);
  } catch {
    t.skip('agentmemory :3111 injoignable — service éteint (le LaunchAgent le relancera)');
    return;
  }
  assert.match(body, /"status":"ok"/);
});

test('une session importée jsonl-import est retrouvée (skip si serveur éteint)', async (t) => {
  try {
    await fetch('http://localhost:3111/agentmemory/livez', { signal: AbortSignal.timeout(4000) });
  } catch {
    t.skip('agentmemory :3111 injoignable');
    return;
  }
  const r = await fetch('http://localhost:3111/agentmemory/mcp/call', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'memory_sessions', arguments: {} }),
    signal: AbortSignal.timeout(8000),
  });
  assert.equal(r.status, 200);
  const j = await r.json();
  const text = j?.content?.[0]?.text || '';
  assert.match(text, /jsonl-import/, 'au moins une session taguée jsonl-import doit être listée');
});
