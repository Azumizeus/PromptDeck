// ─────────────────────────────────────────────────────────────────────────────
// scripts/lib/skill-locations.js — modèle partagé audit/sync des emplacements
// Consommé par audit-skill-locations.js (lecture) et sync-skill-locations.js
// (écriture) pour que les deux ne puissent pas diverger.
//
// Surcharge test : MGP_AUDIT_REPO / MGP_AUDIT_HOME redirigent les racines.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const REPO = path.resolve(process.env.MGP_AUDIT_REPO || path.join(__dirname, '..', '..'));
const HOME = process.env.MGP_AUDIT_HOME || os.homedir();

const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 12);

// ── Emplacements audités ────────────────────────────────────────────────────
// mode « mixed »  : dirs agent-* = agents (nom = dir sans préfixe), sinon skills
// mode « skills » : ne contient que des skills (1 SKILL.md par dir)
// partial: true   : source partielle (ne jamais y « installer » les manquants)
const LOCS = [
  { id: 'hub',       label: 'Hub OpenHands (miroirs .claude/.opencode/.agents)', mode: 'mixed',  dir: path.join(HOME, 'projects/.openhands/skills') },
  { id: 'agents',    label: 'Agents globaux (~/.agents/skills)',                 mode: 'mixed',  dir: path.join(HOME, '.agents/skills') },
  { id: 'openhands', label: 'OpenHands home (~/.openhands/skills)',              mode: 'mixed',  dir: path.join(HOME, '.openhands/skills') },
  { id: 'claude',    label: 'Claude Code (~/.claude/skills)',                    mode: 'skills', dir: path.join(HOME, '.claude/skills') },
  { id: 'opencode',  label: 'OpenCode (~/.config/opencode/skills)',              mode: 'skills', dir: path.join(HOME, '.config/opencode/skills') },
  { id: 'freebuff',  label: 'Source Freebuff (Skill Install/skill/skills)',      mode: 'skills', dir: path.join(HOME, 'Desktop/Skill Install/skill/skills'), partial: true },
];

// ── Référentiel repo ────────────────────────────────────────────────────────
function walk(dir, fn) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

function collectRepo() {
  const skills = new Map(); // nom → { relDir, relFile }
  const agents = new Map(); // nom → relFile
  const collisions = [];
  walk(path.join(REPO, 'skills'), (p) => {
    if (path.basename(p) !== 'SKILL.md') return;
    const name = path.basename(path.dirname(p));
    if (skills.has(name)) { collisions.push(name); return; }
    skills.set(name, { relDir: path.relative(REPO, path.dirname(p)), relFile: path.relative(REPO, p) });
  });
  walk(path.join(REPO, 'agents'), (p) => {
    if (!p.endsWith('.md')) return;
    const name = path.basename(p, '.md');
    if (!agents.has(name)) agents.set(name, path.relative(REPO, p));
  });
  return { skills, agents, collisions: [...new Set(collisions)] };
}

// ── Classification d'un dossier installé ────────────────────────────────────
function classify(dirName, repo) {
  if (repo.skills.has(dirName)) return { type: 'skill', name: dirName };
  if (repo.agents.has(dirName)) return { type: 'agent', name: dirName };
  if (dirName.startsWith('agent-')) {
    const stripped = dirName.slice(6);
    if (repo.agents.has(stripped)) return { type: 'agent', name: stripped };
    return { type: 'extra', name: dirName };
  }
  return { type: 'extra', name: dirName };
}

// ── Drift ───────────────────────────────────────────────────────────────────
// Les agents installés sont des conversions (name/triggers réécrits) : seule la
// description du frontmatter doit suivre le repo.
const frontmatterDescription = (p) => {
  const m = /^description:\s*(.+)$/m.exec(fs.readFileSync(p, 'utf8'));
  return m ? m[1].trim() : null;
};
// Retourne true (drift), false (à jour) ou 'illisible'.
const driftCheck = (type, installed, repoFile) => {
  try {
    if (type === 'agent') {
      const a = frontmatterDescription(installed), b = frontmatterDescription(repoFile);
      if (a !== null && b !== null) return a !== b;
    }
    return sha256(installed) !== sha256(repoFile);
  } catch { return 'illisible'; }
};

// ── Audit d'un emplacement ──────────────────────────────────────────────────
function auditLocation(loc, repo) {
  const r = { id: loc.id, label: loc.label, dir: loc.dir, exists: false,
    skills: { present: 0, missing: [], drift: [] },
    agents: { present: 0, missing: [], drift: [] },
    extras: [] };
  let entries;
  try { entries = fs.readdirSync(loc.dir, { withFileTypes: true }); }
  catch { return r; }
  r.exists = true;

  const seen = new Set();
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!e.isDirectory()) continue;
    const dir = path.join(loc.dir, e.name);
    const sk = path.join(dir, 'SKILL.md');
    if (!fs.existsSync(sk)) continue; // dossier sans SKILL.md (ex. _references) : ignoré
    const c = classify(e.name, repo);
    if (c.type === 'extra') { r.extras.push(e.name); continue; }
    if (seen.has(c.name)) { r.extras.push(`${e.name} (doublon de ${c.name})`); continue; }
    seen.add(c.name);
    const bucket = r[c.type === 'skill' ? 'skills' : 'agents'];
    bucket.present++;
    const entry = (c.type === 'skill' ? repo.skills : repo.agents).get(c.name);
    const repoFile = path.join(REPO, entry.relFile || entry);
    if (driftCheck(c.type, sk, repoFile) === true) bucket.drift.push(c.name);
  }
  for (const [type, map, bucket] of [
    ['skill', repo.skills, r.skills], ['agent', repo.agents, r.agents],
  ]) {
    void type;
    for (const name of map.keys()) if (!seen.has(name)) bucket.missing.push(name);
  }
  return r;
}

// ── Conversion agent repo → SKILL.md installé (agent-<name>/SKILL.md) ───────
// Conserve la description du repo verbatim, régénère name/triggers. Les tokens
// du nom de 2 caractères ou moins (zk, ai…) ne deviennent pas des triggers.
function convertAgentMd(repoText, agentName) {
  const m = /^description:[ \t]*(.*)$/m.exec(repoText);
  const description = m ? m[1].trim() : agentName;
  const triggers = agentName.split('-').filter((t) => t.length >= 3);
  const body = repoText.replace(/^---\n[\s\S]*?\n---\n?/, '').replace(/^\n+/, '');
  return ['---',
    `name: agent-${agentName}`,
    `description: ${description}`,
    'triggers:',
    ...triggers.map((t) => `  - ${t}`),
    '---',
    '',
    body,
    ''].join('\n');
}

module.exports = { REPO, HOME, LOCS, sha256, collectRepo, classify, auditLocation, driftCheck, frontmatterDescription, convertAgentMd, walk };
