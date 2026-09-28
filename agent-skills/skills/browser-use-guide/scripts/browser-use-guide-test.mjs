#!/usr/bin/env node
/**
 * browser-use-guide-test.mjs — tests du skill browser-use-guide
 *
 * Zéro dépendance (convention du repo) : vérifie la conformité du SKILL.md
 * (frontmatter, 5 sections obligatoires, doc des 4 clients et des 16 outils),
 * puis sonde l'environnement réel : binaire du venv, --version, handshake MCP
 * (initialize + tools/list = 16 outils). L'absence du venv est un skip, pas
 * un échec : le skill documente un outil qui peut ne pas être installé.
 *
 * Run: node --test skills/browser-use-guide/scripts/browser-use-guide-test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL_MD = readFileSync(join(HERE, '..', 'SKILL.md'), 'utf8');

const REQUIRED_SECTIONS = [
  '## Overview',
  '## When to Use',
  '## Common Rationalizations',
  '## Red Flags',
  '## Verification',
];

const ALL_TOOLS = [
  'browser_navigate', 'browser_click', 'browser_type', 'browser_get_state',
  'browser_extract_content', 'browser_get_html', 'browser_screenshot',
  'browser_scroll', 'browser_go_back', 'browser_list_tabs', 'browser_switch_tab',
  'browser_close_tab', 'browser_list_sessions', 'browser_close_session',
  'browser_close_all', 'retry_with_browser_use_agent',
];

function stripFences(md) {
  return md
    .split(/\r?\n/)
    .filter((l) => !/^ {0,3}(`{3,}|~{3,})/.test(l))
    .join('\n');
}

test('frontmatter : name = browser-use-guide', () => {
  const m = SKILL_MD.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(m, 'frontmatter présent');
  assert.match(m[1], /^name:\s*browser-use-guide\s*$/m);
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

test('documente les 4 clients (OpenCode, Freebuff, ChatDeck, Claude Desktop)', () => {
  for (const client of ['OpenCode', 'Freebuff', 'ChatDeck', 'Claude Desktop']) {
    assert.ok(SKILL_MD.includes(client), `client manquant : ${client}`);
  }
});

test('documente les 16 outils du serveur MCP', () => {
  for (const tool of ALL_TOOLS) {
    assert.ok(SKILL_MD.includes(tool), `outil manquant : ${tool}`);
  }
});

test('documente la clé LLM du mode autonome (env OPENAI_API_KEY + OPENAI_BASE_URL)', () => {
  for (const needle of ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'retry_with_browser_use_agent']) {
    assert.ok(SKILL_MD.includes(needle), `mention manquante : ${needle}`);
  }
});

test('le binaire browser-use existe dans le venv (skip si machine tierce)', async (t) => {
  const bin = join(homedir(), 'tools', 'browser-use-venv', 'bin', 'browser-use');
  if (!existsSync(bin)) return t.skip('venv browser-use absent — machine tierce');
  assert.ok(true);
});

test('--version répond (skip si venv absent)', async (t) => {
  const bin = join(homedir(), 'tools', 'browser-use-venv', 'bin', 'browser-use');
  if (!existsSync(bin)) return t.skip('venv browser-use absent');
  const out = await new Promise((resolve) => {
    const c = spawn(bin, ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    c.stdout.on('data', (d) => (o += d));
    c.on('close', () => resolve(o));
    c.on('error', () => resolve(''));
  });
  assert.match(out, /0\.\d+\.\d+/, 'version semver attendue');
});

test('handshake MCP : initialize + tools/list = 16 outils (skip si venv absent)', async (t) => {
  const bin = join(homedir(), 'tools', 'browser-use-venv', 'bin', 'browser-use');
  if (!existsSync(bin)) return t.skip('venv browser-use absent');
  const names = await new Promise((resolve) => {
    const c = spawn(bin, ['--mcp'], { stdio: ['pipe', 'pipe', 'ignore'] });
    let buf = '';
    c.stdout.on('data', (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        try {
          const m = JSON.parse(line);
          if (m.id === 1) {
            c.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
            c.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }) + '\n');
          }
          if (m.id === 2) {
            resolve((m.result?.tools || []).map((x) => x.name));
            c.kill();
          }
        } catch { /* non-JSON */ }
      }
    });
    c.stdin.write(JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'skill-test', version: '1.0' } },
    }) + '\n');
    setTimeout(() => { resolve([]); try { c.kill(); } catch { /* déjà mort */ } }, 45000);
  });
  assert.equal(names.length, 16, `16 outils attendus, reçu : ${names.join(', ')}`);
  for (const tool of ALL_TOOLS) assert.ok(names.includes(tool), `outil absent du serveur : ${tool}`);
});
