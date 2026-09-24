#!/usr/bin/env node
/**
 * generate-agents-catalogue.js
 *
 * Régénère AGENTS-CATALOGUE.md à partir des fiches d'agents de `agent-skills/agents/`.
 *
 * - Rôle = première phrase du champ `description` du front-matter de chaque agent.
 * - La colonne Rôle est traduite en français via `scripts/agents-roles-fr.json`
 *   (clé = `name` du front-matter). Sans traduction, la phrase anglaise est utilisée
 *   et un avertissement est affiché.
 *
 * Usage :
 *   node scripts/generate-agents-catalogue.js                 # régénère AGENTS-CATALOGUE.md
 *   node scripts/generate-agents-catalogue.js --extract       # exporte les rôles EN (pour traduire)
 *   node scripts/generate-agents-catalogue.js --check         # vérifie sans écrire (CI)
 *
 * Zéro dépendance — Node >= 16.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'agent-skills', 'agents');
const OUTPUT = path.join(ROOT, 'AGENTS-CATALOGUE.md');
const TRANSLATIONS = path.join(__dirname, 'agents-roles-fr.json');

const EXPECTED_TOTAL = 190; // garde-fou : à mettre à jour si on ajoute des agents

// Dossier des skills portables du pack (une fiche = un dossier avec SKILL.md)
const SKILLS_DIR = path.join(ROOT, 'agent-skills', 'skills');

// Ordre d'affichage des catégories (le reste, s'il apparaît, est ajouté à la fin, trié)
const CATEGORY_ORDER = [
  '__root__',
  'academic',
  'design',
  'engineering',
  'finance',
  'game-development',
  'marketing',
  'paid-media',
  'product',
  'project-management',
  'sales',
  'spatial-computing',
  'specialized',
  'support',
  'testing',
];

const CATEGORY_LABELS = {
  __root__: 'Core (racine)',
  'game-development': 'Game Development',
  'paid-media': 'Paid Media',
  'project-management': 'Project Management',
  'spatial-computing': 'Spatial Computing',
};

const args = process.argv.slice(2);
const MODE_EXTRACT = args.includes('--extract');
const MODE_CHECK = args.includes('--check');

/* ---------------------------------------------------------------- helpers */

/** Parse un front-matter YAML minimaliste (clé: valeur, valeurs multi-lignes via indent). */
function parseFrontMatter(content, filePath) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const data = {};
  const lines = m[1].split(/\r?\n/);
  let currentKey = null;
  for (const line of lines) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const raw = kv[2].trim();
      data[currentKey] = /^(?:[|>][-+>]?)$/.test(raw) ? [] : raw;
    } else if (currentKey && /^\s+\S/.test(line)) {
      const chunk = line.trim();
      data[currentKey] = Array.isArray(data[currentKey])
        ? [...data[currentKey], chunk]
        : `${data[currentKey]} ${chunk}`;
    }
  }
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) data[key] = data[key].join(' ').trim();
  }
  if (!data.name || !data.description) {
    throw new Error(`Front-matter incomplet (name/description) : ${filePath}`);
  }
  return data;
}

/** Première phrase d'une description. */
function firstSentence(description) {
  let text = String(description).replace(/\s+/g, ' ').trim();
  // Retire d'éventuels guillemets parasites autour de la description
  text = text.replace(/^["'«»]+/, '').replace(/["'«»]+$/, '').trim();
  const m = text.match(/^.*?[.!?](?=\s+[A-ZÀ-Ý«"'(]|$)/s);
  let sentence = m ? m[0] : text;
  sentence = sentence.trim();
  if (!/[.!?…]$/.test(sentence)) sentence += '.';
  return sentence;
}

/** Titre de section à partir d'un nom de dossier : "game-development" -> "Game Development". */
function categoryLabel(dirName) {
  if (CATEGORY_LABELS[dirName]) return CATEGORY_LABELS[dirName];
  return dirName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ---------------------------------------------------------------- collecte */

function collectAgents() {
  if (!fs.existsSync(AGENTS_DIR)) {
    throw new Error(`Dossier introuvable : ${AGENTS_DIR}`);
  }
  const agents = [];
  const seenNames = new Map();

  const walk = (dir, rel) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(full, relPath);
      } else if (entry.name.endsWith('.md')) {
        const content = fs.readFileSync(full, 'utf8');
        const fm = parseFrontMatter(content, relPath);
        // Catégorie = premier composant du chemin relatif du dossier parent
        // (gère les sous-dossiers, ex. game-development/unity/)
        const category = rel ? rel.split('/')[0] : '__root__';
        const name = fm.name.trim();
        const dup = seenNames.get(name);
        if (dup) {
          throw new Error(`Nom d'agent dupliqué "${name}" : ${dup} et ${relPath}`);
        }
        seenNames.set(name, relPath);
        agents.push({
          name,
          file: relPath,
          category,
          roleEn: firstSentence(fm.description),
        });
      }
    }
  };
  walk(AGENTS_DIR, '');
  return agents;
}

/* ------------------------------------------------------------------- main */

const agents = collectAgents();

if (MODE_EXTRACT) {
  const roles = {};
  for (const a of agents) roles[a.name] = a.roleEn;
  process.stdout.write(JSON.stringify(roles, null, 2) + '\n');
  process.exit(0);
}

let translations = {};
if (fs.existsSync(TRANSLATIONS)) {
  translations = JSON.parse(fs.readFileSync(TRANSLATIONS, 'utf8'));
}

const missingTranslations = [];
let translatedCount = 0;
for (const a of agents) {
  const fr = translations[a.name];
  if (typeof fr === 'string' && fr.trim()) {
    a.role = fr.trim();
    translatedCount++;
  } else {
    a.role = a.roleEn;
    missingTranslations.push(a.name);
  }
}

// Tri des catégories puis des agents (ordre alpha, insensible à la casse)
const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });
const categories = new Map();
for (const a of agents) {
  if (!categories.has(a.category)) categories.set(a.category, []);
  categories.get(a.category).push(a);
}
for (const list of categories.values()) {
  list.sort((x, y) => collator.compare(x.file, y.file) || collator.compare(x.name, y.name));
}
const orderedCategories = [
  ...CATEGORY_ORDER.filter((c) => categories.has(c)),
  ...[...categories.keys()]
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort((x, y) => collator.compare(x, y)),
];

/* ------------------------------------------------------------- rendu MD */

const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const lines = [];

lines.push(`# 📇 AGENTS-CATALOGUE — Les ${agents.length} agents spécialistes`);
lines.push('');
lines.push(`> **Généré le :** ${today} · **Total :** ${agents.length} agents`);
lines.push('> Source : `agent-skills/agents/` — rôle = première phrase de la `description` de chaque agent');
lines.push('> 🇫🇷 Colonne Rôle traduite en français (`scripts/agents-roles-fr.json`)');
lines.push('');
lines.push('## Où ils sont installés');
lines.push('');
lines.push('| Hôte | Emplacement | Format |');
lines.push('|------|-------------|--------|');
lines.push('| Claude Code | `~/.claude/agents/` | subagent natif (name, description) |');
lines.push('| OpenCode | `~/.config/opencode/agents/` | subagent markdown (`mode: subagent`) — invoquables via `@nom` |');
lines.push('| OpenHands + Freebuff | `~/.agents/skills/agent-<nom>/SKILL.md` | Agent Skills (progressive disclosure + triggers) |');
lines.push('');
lines.push('OpenCode : vérifié via `opencode agent list` → 190 agents + 2 built-in = 192 subagents.');
lines.push('');

for (const cat of orderedCategories) {
  const list = categories.get(cat);
  lines.push(`## ${categoryLabel(cat)} (${list.length})`);
  lines.push('');
  lines.push('| Agent | Rôle |');
  lines.push('|-------|------|');
  for (const a of list) {
    lines.push(`| \`${a.name}\` | ${a.role.replace(/\|/g, '\\|')} |`);
  }
  lines.push('');
}

lines.push('## Utilisation');
lines.push('');
lines.push('- **Claude Code** : déclenchement auto par description, ou mention explicite (« utilise security-auditor »).');
lines.push('- **OpenCode** : `@<nom-agent>` dans la session (ex. `@tokenomics-designer`), ou délégation auto par l\'agent principal.');
lines.push('- **OpenHands / Freebuff** : les skills `agent-*` sont annoncés dans le catalogue (progressive disclosure) ;');
lines.push('  l\'agent les invoque quand la tâche correspond, et les `triggers` (mots-clés du nom) accélèrent l\'activation.');
lines.push('');

/* ------------------------------------------------- skills hors agents (portables) */

// Skills du pack qui ne sont PAS des fiches d'agents (pas de dossier agent-*).
// Générés depuis le disque : tout nouveau skill apparaît ici à la régénération.
const skillCards = fs.existsSync(SKILLS_DIR)
  ? fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('agent-'))
      .map((e) => {
        const p = path.join(SKILLS_DIR, e.name, 'SKILL.md');
        if (!fs.existsSync(p)) return null;
        const fm = fs.readFileSync(p, 'utf8').slice(0, 4000);
        const name = (fm.match(/^name:\s*(.+)$/m) || [])[1] || e.name;
        const desc = ((fm.match(/^description:\s*(.+)$/m) || [])[1] || '').trim();
        return { dir: e.name, name: name.trim(), desc };
      })
      .filter(Boolean)
      .sort((a, b) => a.dir.localeCompare(b.dir))
  : [];

if (skillCards.length) {
  lines.push(`## Skills non-agents du pack (${skillCards.length})`);
  lines.push('');
  lines.push('Skills portables installés à côté des agents (OpenCode, Claude, Freebuff/OpenHands) :');
  lines.push('');
  lines.push('| Skill | Description |');
  lines.push('|-------|-------------|');
  for (const s of skillCards) {
    lines.push(`| \`${s.dir}\` | ${s.desc.replace(/\|/g, '\\|')} |`);
  }
  lines.push('');
}
lines.push('---');
lines.push('*Fichier généré automatiquement par `scripts/generate-agents-catalogue.js` — régénérer après ajout d\'agents dans `agent-skills/agents/`.*');
lines.push('');

const md = lines.join('\n');

/* ------------------------------------------------------------- écriture */

if (missingTranslations.length) {
  console.warn(`⚠  ${missingTranslations.length} agent(s) sans traduction française (rôle EN utilisé) :`);
  for (const n of missingTranslations) console.warn(`   - ${n}`);
  console.warn(`   → ajoute-les dans scripts/agents-roles-fr.json`);
}
console.log(`${agents.length} agents trouvés · ${translatedCount} rôles traduits en français`);

if (MODE_CHECK) {
  const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';
  process.exit(current === md ? 0 : 1);
}

if (agents.length !== EXPECTED_TOTAL) {
  console.warn(`⚠  Total inattendu : ${agents.length} agents (attendu ${EXPECTED_TOTAL}).`);
  console.warn('   Mets à jour EXPECTED_TOTAL et le README si c\'est volontaire.');
}
fs.writeFileSync(OUTPUT, md, 'utf8');
console.log(`✓ ${path.relative(ROOT, OUTPUT)} régénéré`);
