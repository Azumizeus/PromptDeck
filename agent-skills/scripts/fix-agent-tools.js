#!/usr/bin/env node
// 🔧 Codemod frontmatter `tools` : OpenCode (versions récentes) attend un objet
// { outil: true|false } — la chaîne legacy "WebFetch, WebSearch, Read" est
// rejetée et UN fichier invalide bloque le chargement de TOUS les agents.
// Conversion : tools: "A, B, C" → objet { a: true, b: true, c: true }.
//
// Usage :  node scripts/fix-agent-tools.js            # applique
//          node scripts/fix-agent-tools.js --dry-run  # liste seulement
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry-run');

const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : []);

const files = walk(path.join(ROOT, 'agents'));
let fixed = 0; const touched = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const m = /^---\n([\s\S]*?)\n---/.exec(src);
  if (!m) continue;
  const fm = m[1];
  let next = fm; let changed = false;
  // Cas 1 : chaîne legacy "A, B, C" → objet
  const tm = /^[ \t]*tools:[ \t]*["']?([A-Za-z0-9_, \-]+)["']?[ \t]*$/m.exec(fm);
  if (tm) {
    const names = tm[1].split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    next = next.replace(tm[0], 'tools: { ' + names.map((n) => n + ': true').join(', ') + ' }');
    changed = true;
  }
  // Cas 2 : objet sérialisé entre guillemets (tools: "{ a: true }") → flow map nue
  const qm = /^[ \t]*tools:[ \t]*["']\{.*\}["'][ \t]*$/m.exec(fm);
  if (qm) {
    const inner = /\{.*\}/.exec(qm[0])[0];
    next = next.replace(qm[0], 'tools: ' + inner);
    changed = true;
  }
  if (!changed) continue;
  if (!DRY) fs.writeFileSync(f, src.replace(m[0], m[0].replace(fm, next)));
  fixed++; touched.push(path.relative(ROOT, f));
}
console.log(fixed ? (DRY ? '[dry-run] ' : '') + fixed + ' fichier(s) à corriger' : '✅ tous les tools: sont des objets');
if (DRY) touched.slice(0, 8).forEach((t) => console.log('  ', t));
