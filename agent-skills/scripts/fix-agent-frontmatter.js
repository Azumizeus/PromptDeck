#!/usr/bin/env node
// 🧼 Normalise le frontmatter des agents du dépôt sur la liste blanche minimale
// acceptée par les versions récentes d'OpenCode : name, description, mode, color.
// Les champs au schéma volatil (tools, model, temperature, tags…) sont retirés :
// ils restent disponibles dans interface/catalog-full.js, la source de vérité.
// UN frontmatter invalide bloque le chargement de TOUS les agents → liste blanche.
//
// Usage :  node scripts/fix-agent-frontmatter.js            # applique
//          node scripts/fix-agent-frontmatter.js --dry-run  # liste seulement
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry-run');
const ALLOW = ['name', 'description', 'mode', 'color'];

const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : []);

const files = walk(path.join(ROOT, 'agents'));
let fixed = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  if (!m) continue;
  const lines = m[1].split('\n');
  const keep = [];
  let dropped = [];
  for (const l of lines) {
    const key = /^([A-Za-z0-9_-]+)\s*:/.exec(l);
    if (key && !ALLOW.includes(key[1])) { dropped.push(key[1]); continue; }
    keep.push(l);
  }
  if (!dropped.length) continue;
  const next = src.replace(m[0], '---\n' + keep.join('\n') + '\n---\n');
  if (!DRY) fs.writeFileSync(f, next);
  fixed++;
  if (fixed <= 10 || DRY) console.log((DRY ? '[dry-run] ' : '') + path.relative(ROOT, f) + ' — retire : ' + dropped.join(', '));
}
console.log(fixed ? (DRY ? '[dry-run] ' : '') + fixed + ' fichier(s) à normaliser' : '✅ frontmatters déjà minimaux');
