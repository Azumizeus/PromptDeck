#!/usr/bin/env node
/**
 * build-openhands-panel.js
 *
 * Injects (or refreshes) the OpenHands router view into both MEGA PACK
 * userscripts (Tampermonkey / "PromptDeck" panel):
 *
 *   interface/mega-pack-panel-full.user.js  — Édition Luxe panel
 *   interface/mega-pack-panel.user.js       — panel compact
 *
 * The view adds:
 *   - an `MG_OPENHANDS` data constant (snapshot of .openhands/microagents/ +
 *     the full skill count), embedded right after MEGA_CATALOG
 *   - an 'openhands' tab in the panel's tab bar
 *   - items for every microagent (always-loaded inventory + 6 phase routers +
 *     specialty routers) with their triggers and skill targets
 *   - prompts that instruct any LLM to behave like the OpenHands router
 *
 * Idempotent: markers delimit the injected block, so re-running refreshes the
 * data and the code in place. Exits 1 if a marker is missing.
 *
 * Usage: node scripts/build-openhands-panel.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_SRC = path.join(ROOT, 'interface', 'openhands-dashboard-data.json');
const TARGETS = [
  path.join(ROOT, 'interface', 'mega-pack-panel-full.user.js'),
  path.join(ROOT, 'interface', 'mega-pack-panel.user.js'),
];

const BEGIN = '// ── OpenHands router view (injecté par scripts/build-openhands-panel.js) ──';
const END = '// ── fin OpenHands router view ─────────────────────────────────────────────';

function buildBlock(data) {
  return BEGIN + '\n' +
    'const MG_OPENHANDS = ' + data + ';\n' +
    "window.MG_OPENHANDS = MG_OPENHANDS; // une const globale n'existe pas sur window\n" +
    END;
}

const COMBO_BEGIN = '// ── Team combos multi-agents (injecté par scripts/build-openhands-panel.js) ──';
const COMBO_END = '// ── fin team combos ───────────────────────────────────────────────────────';

function buildComboBlock(combos) {
  return COMBO_BEGIN + '\n' +
    'const MG_TEAMS = ' + JSON.stringify(combos) + ';\n' +
    'window.MG_TEAMS = MG_TEAMS; // combos de personas réutilisables (⚡ panel)\n' +
    COMBO_END;
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(DATA_SRC, 'utf8'));
  const data = JSON.stringify({
    generatedAt: snapshot.generatedAt,
    skillsCount: snapshot.skillsCount,
    routers: snapshot.routers,
  });
  const combos = (snapshot.teamCombos || []).map((c) => ({ agents: c.agents, prompt: c.prompt }));
  const comboBlock = buildComboBlock(combos);
  const block = buildBlock(data);

  for (const target of TARGETS) {
    let src = fs.readFileSync(target, 'utf8');
    const beginIdx = src.indexOf(BEGIN);
    if (beginIdx >= 0) {
      const endIdx = src.indexOf(END, beginIdx);
      if (endIdx < 0) { console.error(target + ': ' + END + ' introuvable'); process.exit(1); }
      src = src.slice(0, beginIdx) + block + src.slice(endIdx + END.length);
    } else {
      // Insert after the MEGA_CATALOG closing — right before the userscript IIFE
      // or the next top-level statement.
      const anchor = src.indexOf('(function () {');
      if (anchor < 0) { console.error(target + ': ancre d\'injection introuvable'); process.exit(1); }
      src = src.slice(0, anchor) + block + '\n\n' + src.slice(anchor);
    }
    // Bloc MG_TEAMS (idempotent)
    const cb = src.indexOf(COMBO_BEGIN);
    if (cb >= 0) {
      const ce = src.indexOf(COMBO_END, cb);
      if (ce < 0) { console.error(target + ': ' + COMBO_END + ' introuvable'); process.exit(1); }
      src = src.slice(0, cb) + comboBlock + src.slice(ce + COMBO_END.length);
    } else {
      src = src.replace(BEGIN, comboBlock + '\n\n' + BEGIN);
    }
    fs.writeFileSync(target, src);
    console.log(path.basename(target) + ' — MG_OPENHANDS à jour (' + snapshot.routers.length + ' microagents, ' + snapshot.skillsCount + ' skills, ' + combos.length + ' équipes)');
  }
}

if (require.main === module) main();

module.exports = { buildBlock, buildComboBlock, BEGIN, END, COMBO_BEGIN, COMBO_END };
