#!/usr/bin/env node
/**
 * build-openhands-dashboard.js
 *
 * Rebuilds interface/openhands-dashboard.html from
 * interface/openhands-dashboard-template.html plus a fresh data snapshot:
 *
 *   - skills: the full flat catalog (top-level + nested packs) with names and
 *     descriptions, loaded with the same parser the CI simulator uses
 *   - agents: the 190 specialist agents (agents/, récursif) with name + first
 *     description line, for the dashboard's Activation view
 *   - routers: every microagent in .openhands/microagents/ with its phase,
 *     triggers, and the skill paths its body routes to
 *
 * The snapshot is also written to interface/openhands-dashboard-data.json so
 * the launcher's OpenHands view and the dashboard stay in sync with the repo.
 *
 * Usage: node scripts/build-openhands-dashboard.js
 * Exit codes: 0 = ok, 1 = build failed
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { loadSkillsFromDir, loadMicroagents } = require('./openhands-loader-sim.js');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'interface', 'openhands-dashboard-template.html');
const OUT_HTML = path.join(ROOT, 'interface', 'openhands-dashboard.html');
const OUT_JSON = path.join(ROOT, 'interface', 'openhands-dashboard-data.json');
const MICROAGENTS_DIR = path.join(ROOT, '.openhands', 'microagents');
const SKILLS_DIR = path.join(ROOT, 'skills');
const AGENTS_DIR = path.join(ROOT, 'agents');

/**
 * Recursively collect { file, name, description } from the agents/ tree,
 * where `name` is the slug of the file name (the activation surface used by
 * every host) and `description` the raw frontmatter description.
 */
function loadAgents(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...loadAgents(p));
    else if (e.name.endsWith('.md')) {
      const src = fs.readFileSync(p, 'utf8');
      const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const fmName = m && (m[1].match(/^name:\s*(.+)$/m) || [])[1];
      const desc = m && (m[1].match(/^description:\s*(.+)$/m) || [])[1];
      const slug = e.name.replace(/\.md$/, '');
      out.push({ file: path.relative(AGENTS_DIR, p), name: slug, frontmatterName: fmName ? fmName.trim() : slug, description: desc ? desc.trim() : '' });
    }
  }
  return out;
}

function buildSnapshot() {
  const skills = loadSkillsFromDir(SKILLS_DIR);
  const agents = loadAgents(AGENTS_DIR);
  const microagents = loadMicroagents(MICROAGENTS_DIR);
  const routers = microagents.map((a) => {
    let phase = null;
    const fm = fs.readFileSync(path.join(MICROAGENTS_DIR, a.file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fm) phase = (fm[1].match(/^phase:\s*(.+)$/m) || [])[1] || null;
    const routes = [...new Set([...a.body.matchAll(/skills\/([a-z0-9/-]+)\/SKILL\.md/g)].map((m) => m[1]))];
    return { file: a.file, name: a.name, phase, triggers: a.triggers, routes };
  });
  // Combos de personas générés (scripts/build-agents-multi-prompt.js) pour l'onglet Équipes
  let teamCombos = [];
  const comboFile = path.join(ROOT, '.agents-combo.json');
  if (fs.existsSync(comboFile)) {
    try { teamCombos = JSON.parse(fs.readFileSync(comboFile, 'utf8')).combos || []; } catch (e) { teamCombos = []; }
  }
  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    skillsCount: skills.length,
    agentsCount: agents.length,
    skills: skills.map((s) => ({ name: s.name, description: s.description })),
    agents: agents.map((a) => ({ name: a.name, description: a.description })),
    routers,
    teamCombos: teamCombos.map((c) => ({ agents: c.agents, prompt: c.prompt })),
  };
}

function main() {
  const snapshot = buildSnapshot();
  const template = fs.readFileSync(TEMPLATE, 'utf8');
  if (!template.includes('__DATA_PLACEHOLDER__')) {
    console.error('Template is missing the __DATA_PLACEHOLDER__ marker.');
    process.exit(1);
  }
  const json = JSON.stringify(snapshot, null, 2) + '\n';
  fs.writeFileSync(OUT_JSON, json);
  fs.writeFileSync(OUT_HTML, template.replace('__DATA_PLACEHOLDER__', json.trim()));
  refreshLauncherOhData(snapshot);
  console.log(
    `Built interface/openhands-dashboard.html — ${snapshot.skills.length} skills, ` +
    `${snapshot.agents.length} agents, ` +
    `${snapshot.routers.length} microagents (${snapshot.routers.filter((r) => r.phase).length} phase routers), ` +
    `snapshot at ${snapshot.generatedAt}`
  );
}

// Le launcher embarque une copie du snapshot (const OH_DATA = {…}; sur une ligne) —
// historiquement collée à la main, elle vieillissait silencieusement. Idempotent :
// remplace la ligne existante, ou l'insère avant le premier consommateur.
function refreshLauncherOhData(snapshot) {
  const data = {
    generatedAt: snapshot.generatedAt,
    skillsCount: snapshot.skills.length,
    skills: snapshot.skills.map((s) => ({ name: s.name, description: s.description })),
    routers: snapshot.routers,
  };
  const line = `const OH_DATA = ${JSON.stringify(data)};`;
  const launcherPath = path.join(ROOT, 'interface', 'mega-pack-launcher.html');
  const src = fs.readFileSync(launcherPath, 'utf8');
  if (/^const OH_DATA = \{.*\};$/m.test(src)) {
    fs.writeFileSync(launcherPath, src.replace(/^const OH_DATA = \{.*\};$/m, line));
    console.log('mega-pack-launcher.html — OH_DATA rafraîchi (' + data.skillsCount + ' skills, ' + data.routers.length + ' routeurs)');
    return;
  }
  const anchor = src.match(/^.*(OH_DATA\.routers|OH_DATA\.skills).*$/m);
  if (!anchor) return; // rien n'y consomme OH_DATA : ne rien injecter
  fs.writeFileSync(launcherPath, src.replace(anchor[0], line + '\n' + anchor[0]));
  console.log('mega-pack-launcher.html — OH_DATA injecté (' + data.skillsCount + ' skills, ' + data.routers.length + ' routeurs)');
}

if (require.main === module) main();

module.exports = { buildSnapshot, loadAgents };
