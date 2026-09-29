#!/usr/bin/env node
// 🎨 Codemod frontmatter : OpenCode (versions récentes) valide strictement le
// champ `color` des agents : ^#[0-9a-fA-F]{6}$ ou {primary|secondary|accent|
// success|warning|error|info}. Nos agents historiques utilisent des noms CSS
// (orange, teal, neon-cyan…) → rejetés, et UN fichier invalide bloque le
// chargement de TOUS les agents. On convertit chaque nom en hexadécimal
// équivalent (l'identité visuelle est conservée).
//
// Usage :  node scripts/fix-agent-colors.js            # applique
//          node scripts/fix-agent-colors.js --dry-run  # liste seulement
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry-run');

const MAP = {
  orange: '#f97316', blue: '#3b82f6', green: '#22c55e', purple: '#a855f7',
  teal: '#14b8a6', red: '#ef4444', indigo: '#6366f1', cyan: '#06b6d4',
  amber: '#f59e0b', pink: '#ec4899', yellow: '#eab308', violet: '#8b5cf6',
  slate: '#64748b', rose: '#f43f5e', lime: '#84cc16', gray: '#6b7280',
  gold: '#d4af37', fuchsia: '#d946ef', 'neon-green': '#39ff14',
  'neon-cyan': '#00fff7', 'metallic-blue': '#4f6d9e',
};

const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : []);

const files = walk(path.join(ROOT, 'agents'));
let fixed = 0; const touched = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const m = /^---\n([\s\S]*?)\n---/.exec(src);
  if (!m) continue;
  let fm = m[1];
  const cm = /^color:[ \t]*(.+?)[ \t]*$/m.exec(fm);
  if (!cm) continue;
  const raw = cm[1];
  const unquoted = raw.replace(/^["']|["']$/g, '').trim();
  const validHex = /^#[0-9a-fA-F]{6}$/.test(unquoted);
  if (validHex) continue; // déjà valide
  const hex = MAP[unquoted.toLowerCase()];
  if (!hex) { console.log('⚠️  valeur inconnue :', raw, '→', f); continue; }
  const next = fm.replace(cm[0], 'color: "' + hex + '"');
  if (!DRY) fs.writeFileSync(f, src.replace(m[0], m[0].replace(fm, next)));
  fixed++; touched.push(path.relative(ROOT, f) + ' : ' + raw + ' → ' + hex);
}
console.log(fixed ? (DRY ? '[dry-run] ' : '') + fixed + ' fichier(s) à corriger' : '✅ tous les color: sont valides');
if (DRY) touched.slice(0, 10).forEach((t) => console.log('  ', t));
