#!/usr/bin/env node
// 🔄 Synchronise les agents du dépôt (SOURCE DE VÉRITÉ : interface/catalog-full.js,
// qui référence agents/ à plat ET par catégories) vers le dossier global OpenCode
// (~/.config/opencode/agents, impose un dossier À PLAT).
//
// Règles de nommage plat (sans collision, résolution déterministe) :
//   1. les fichiers déjà à plat dans agents/ gardent leur nom d'origine (réservé en premier)
//   2. les autres prennent le slug du `name` du catalogue (ex. "Brand Guardian" → brand-guardian.md)
//   3. si ce slug est pris, on préfixe par le dossier de catégorie (ex. engineering/code-reviewer
//      → engineering-code-reviewer) ; dernier recours : suffixe -2, -3…
//
// Usage :
//   node scripts/sync-agents-opencode.js            # applique (backup automatique)
//   node scripts/sync-agents-opencode.js --dry-run  # simule et rapporte
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TARGET = path.join(process.env.HOME, '.config', 'opencode', 'agents');
const DRY = process.argv.includes('--dry-run');

// ── Source de vérité : le catalogue ──────────────────────────────────────────
const code = fs.readFileSync(path.join(ROOT, 'interface', 'catalog-full.js'), 'utf8');
const CAT = new Function(code + ';return MEGA_CATALOG;')();
const entries = CAT.agents
  .map((a) => ({ name: a.name, rel: a.path.replace(/^\/+/, '') }))
  .sort((x, y) => x.rel.localeCompare(y.rel));

const missing = entries.filter((e) => !fs.existsSync(path.join(ROOT, e.rel)));
if (missing.length) {
  console.error('✗ ' + missing.length + ' agent(s) référencés par le catalogue sont absents du dépôt :');
  for (const m of missing) console.error('   ' + m.rel);
  process.exit(1);
}

const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ── Nommage plat sans collision ──────────────────────────────────────────────
// Passe A : les fichiers déjà à plat dans agents/ RÉSERVENT leur nom d'origine
// (stabilité maximale avec l'état actuel d'OpenCode). Passe B : les agents des
// sous-dossiers prennent le slug de leur `name` ; si pris → préfixe du dossier
// de catégorie ; dernier recours : suffixe -2, -3… (déterministe).
const used = new Map(); // filename → rel
for (const e of entries) {
  if (path.dirname(e.rel) === 'agents') { e.file = path.basename(e.rel); used.set(e.file, e.rel); }
}
for (const e of entries) {
  if (e.file) continue;
  let base = slug(e.name) || slug(path.basename(e.rel, '.md'));
  const dir = path.basename(path.dirname(e.rel));
  if (used.has(base + '.md') && dir !== 'agents') base = slug(dir) + '-' + base;
  let n = 2;
  while (used.has(base + '.md')) base = base.replace(/-\d+$/, '') + '-' + n++;
  e.file = base + '.md';
  used.set(e.file, e.rel);
}
// Garde-fou : la résolution doit produire AUTANT de fichiers que d'agents.
if (used.size !== entries.length) {
  console.error('✗ résolution de noms : ' + (entries.length - used.size) + ' collision(s) non résolue(s) — abort');
  for (const [f, rel] of used) if ([...used.keys()].filter((x) => x === f).length > 1) console.error('   ' + f + ' ← ' + rel);
  process.exit(1);
}

// ── État actuel de la cible ──────────────────────────────────────────────────
const current = new Set(fs.existsSync(TARGET) ? fs.readdirSync(TARGET).filter((f) => f.endsWith('.md')) : []);
const wanted = new Map(entries.map((e) => [e.file, e.rel]));
const toWrite = [...wanted.entries()].filter(([f, rel]) => {
  if (!current.has(f)) return true;
  return fs.readFileSync(path.join(TARGET, f), 'utf8') !== fs.readFileSync(path.join(ROOT, rel), 'utf8');
});
const toRemove = [...current].filter((f) => !wanted.has(f));

console.log('Source de vérité : interface/catalog-full.js → ' + entries.length + ' agents');
console.log('Cible : ' + TARGET + ' (' + current.size + ' fichiers actuellement)');
console.log('À écrire : ' + toWrite.length + ' · À supprimer : ' + toRemove.length);
if (toWrite.length) for (const [f, rel] of toWrite.slice(0, 12)) console.log('  + ' + f + '  ← ' + rel);
if (toWrite.length > 12) console.log('  … +' + (toWrite.length - 12) + ' autres');
if (toRemove.length) for (const f of toRemove.slice(0, 12)) console.log('  - ' + f);
if (toRemove.length > 12) console.log('  … -' + (toRemove.length - 12) + ' autres');

if (DRY) { console.log('\n(dry-run : aucune modification)'); process.exit(0); }
if (!toWrite.length && !toRemove.length) { console.log('\n✅ déjà synchronisé'); process.exit(0); }

// ── Backup horodaté avant toute écriture ─────────────────────────────────────
const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
const backup = TARGET + '.bak-' + stamp;
fs.mkdirSync(path.dirname(backup), { recursive: true });
fs.cpSync(TARGET, backup, { recursive: true });
console.log('Backup : ' + backup);

// ── Application ──────────────────────────────────────────────────────────────
fs.mkdirSync(TARGET, { recursive: true });
for (const [f, rel] of toWrite) fs.copyFileSync(path.join(ROOT, rel), path.join(TARGET, f));
for (const f of toRemove) fs.unlinkSync(path.join(TARGET, f));

// ── Vérification ─────────────────────────────────────────────────────────────
const after = fs.readdirSync(TARGET).filter((f) => f.endsWith('.md'));
const bad = entries.filter((e) => !after.includes(e.file));
console.log('\nAgents en place : ' + after.length + ' / ' + entries.length + ' attendus');
if (bad.length) { console.error('✗ manquants après sync : ' + bad.map((b) => b.file).join(', ')); process.exit(1); }
console.log('✅ synchronisé — ' + entries.length + ' agents, zéro collision de nom');
