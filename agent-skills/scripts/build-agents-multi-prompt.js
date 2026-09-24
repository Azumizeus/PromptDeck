#!/usr/bin/env node
/**
 * scripts/build-agents-multi-prompt.js
 *
 * Génère .agents-combo.json : prompts de persona combinés (multi-agents) pour
 * toutes les combinaisons de 2 à MAX_N agents, triées par pertinence décroissante
 * (spread de catégories + popularité), avec les N premières conservées.
 *
 * Consommé par interface/mega-pack-launcher.html (bouton « Activer les N
 * sélectionnés » de la vue Agents) — même contrat que MEGA_CATALOG.
 *
 * Usage : node scripts/build-agents-multi-prompt.js [--max N] [--out FILE]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const MAX_N = (() => {
  const i = process.argv.indexOf('--max');
  return i > -1 ? Math.max(2, parseInt(process.argv[i + 1], 10) || 10) : 10;
})();
const OUT = (() => {
  const i = process.argv.indexOf('--out');
  return i > -1 ? path.resolve(process.cwd(), process.argv[i + 1]) : path.join(REPO, '.agents-combo.json');
})();
const SRC = (() => {
  const i = process.argv.indexOf('--src');
  return i > -1 ? path.resolve(process.cwd(), process.argv[i + 1]) : path.join(REPO, 'interface', 'mega-pack-launcher.html');
})();

const source = SRC;
const html = fs.readFileSync(source, 'utf8');
const start = html.indexOf('const MEGA_CATALOG = {');
if (start < 0) { console.error('MEGA_CATALOG introuvable dans ' + source); process.exit(1); }
// Extraction par équilibrage d'accolades (respecte les chaînes et échappements) — robuste à tout formatage
const objStart = html.indexOf('{', start);
let depth = 0, end = -1, inStr = false, esc = false;
for (let i = objStart; i < html.length; i++) {
  const ch = html[i];
  if (esc) { esc = false; continue; }
  if (ch === '\\') { esc = true; continue; }
  if (ch === '"' || ch === "'" || ch === '`') { inStr = !inStr; continue; }
  if (inStr) continue;
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
if (end < 0) { console.error('Fin de MEGA_CATALOG introuvable'); process.exit(1); }
const catalog = eval('(' + html.slice(objStart, end) + ')');
const agents = catalog.agents || [];
if (!agents.length) { console.error('Aucun agent dans MEGA_CATALOG'); process.exit(1); }

/** Prompt persona combiné pour un ensemble d'agents (fallback si pas de système externe). */
function comboPrompt(set) {
  const names = set.map(a => a.name);
  const descs = set.map(a => `- **${a.name}** : ${a.desc}`).join('\n');
  const slug = set.map(a => (a.path || '').split('/').pop().replace(/\.md$/, '').toLowerCase()).join(' + ');
  return [
    `Adopte simultanément les personas suivants et fais-les collaborer : ${names.join(', ')} (${slug}).`,
    ``,
    `## Personas`,
    descs,
    ``,
    `## Instructions`,
    `1. Incarne l'ensemble de ces expertises comme une équipe unique.`,
    `2. Chaque persona apporte son angle d'analyse ; signale les désaccords entre personas.`,
    `3. Réponds toujours en français.`,
  ].join('\n');
}

/** Score de pertinence : diversité de catégories, puis fréquence (popularité). */
function rank(sets) {
  const freq = new Map();
  sets.forEach(s => s.forEach(a => freq.set(a.name, (freq.get(a.name) || 0) + 1)));
  return sets.map(set => {
    const cats = new Set(set.map(a => a.category));
    const pop = set.reduce((m, a) => m + (freq.get(a.name) || 0), 0);
    return { set, score: cats.size * 100 + pop };
  }).sort((x, y) => y.score - x.score);
}

/** Combinaisons C(n,k) par indices. */
function combos(arr, k) {
  const res = [];
  const rec = (start, cur) => {
    if (cur.length === k) { res.push([...cur]); return; }
    for (let i = start; i < arr.length; i++) { cur.push(arr[i]); rec(i + 1, cur); cur.pop(); }
  };
  rec(0, []);
  return res;
}

const out = { _meta: { generatedAt: new Date().toISOString(), agents: agents.length, maxN: MAX_N }, combos: [] };
const seen = new Set();
for (let k = 2; k <= Math.min(MAX_N, agents.length); k++) {
  // fenêtre glissante bornée : les C(190,3) et + explosent, on garde un budget raisonnable
  const pool = k <= 3 ? combos(agents, k) : combos(agents.slice(0, 60), k);
  for (const { set, score } of rank(pool)) {
    const key = [...set].map(a => a.name).sort().join('+');
    if (seen.has(key)) continue;
    seen.add(key);
    out.combos.push({ agents: set.map(a => a.name), prompt: comboPrompt(set) });
    if (out.combos.length >= MAX_N) break;
  }
  if (out.combos.length >= MAX_N) break;
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`OK: ${out.combos.length} combos de personas → ${path.relative(REPO, OUT)} (${agents.length} agents, max ${MAX_N})`);

/** Injection idempotente du snapshot dans le launcher (bloc BEGIN/END AGENTS-COMBO). */
if (process.argv.includes('--inject')) {
  const snippet = '\n/* BEGIN AGENTS-COMBO (généré par scripts/build-agents-multi-prompt.js — ne pas éditer à la main) */\nconst AGENTS_COMBO = ' + JSON.stringify(out) + ';\n/* END AGENTS-COMBO */\n';
  let launcher = fs.readFileSync(SRC, 'utf8');
  launcher = launcher.replace(/\n\/\* BEGIN AGENTS-COMBO[\s\S]*?\/\* END AGENTS-COMBO \*\/\n/, '\n');
  const anchor = 'const S=MEGA_CATALOG.skills, A=MEGA_CATALOG.agents;';
  if (!launcher.includes(anchor)) { console.error('Ancre launcher introuvable (' + SRC + ')'); process.exit(1); }
  fs.writeFileSync(SRC, launcher.replace(anchor, anchor + snippet));
  console.log('Injecté dans ' + path.relative(REPO, SRC));
}
