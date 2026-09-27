#!/usr/bin/env node
/**
 * jev-router.mjs — décision typée façon "System One" (Jev) pour router une
 * demande utilisateur vers un skill de ce dépôt.
 *
 * Principe : choix fermé + sortie structurée. Le routeur ne génère jamais de
 * texte : il retourne un JSON typé { decision, confidence, alternatives,
 * matchedTriggers, phase, mode } qu'un agent ou un script consomme tel quel.
 * Moteur 100 % local (TF-IDF sur les descriptions + triggers par mot-clé),
 * déterministe, sans appel réseau.
 *
 * Usage :
 *   node jev-router.mjs "message utilisateur" [--top-k 3] [--min-confidence 0]
 *   node jev-router.mjs --jsonl < messages.ndjson
 *
 * Codes de sortie : 0 décision · 1 usage · 2 confiance insuffisante (escalade).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

// ── Phases du cycle (héritées des routeurs lifecycle du dépôt) ──────────────
const PHASES = ['DEFINE', 'PLAN', 'BUILD', 'VERIFY', 'REVIEW', 'SHIP'];
const DEFAULT_TRIGGERS = {
  'spec-driven-development': ['spec', 'specification', 'prd', 'new project'],
  'planning-and-task-breakdown': ['plan', 'breakdown', 'tasks', 'estimate'],
  'incremental-implementation': ['implement', 'build', 'slice'],
  'test-driven-development': ['test', 'failing test', 'red green'],
  'debugging-and-error-recovery': ['bug', 'broken', 'crash', 'error', 'debugging', 'fails'],
  'code-review-and-quality': ['review', 'code review', 'pull request'],
  'security-audit': ['pentest', 'vulnerability', 'exploit', 'owasp'],
  'security-and-hardening': ['harden', 'auth', 'owasp', 'ccpa', 'gdpr'],
  'shipping-and-launch': ['ship', 'deploy', 'release', 'rollout', 'rollback'],
  'ci-cd-and-automation': ['ci', 'cd', 'pipeline', 'workflow'],
};

// ── Mini pipeline TF-IDF (même style que scripts/run-evals.js) ──────────────
const STOP = new Set([
  'a', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'before', 'by', 'for',
  'from', 'in', 'into', 'is', 'it', 'its', 'my', 'need', 'needs', 'of', 'on',
  'or', 'our', 'so', 'that', 'the', 'them', 'this', 'to', 'use', 'want',
  'we', 'when', 'with', 'you', 'your', 'help', 'me', 'i', 'after', 'not',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function termFreq(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

function buildCorpus(skills) {
  const docs = new Map();
  for (const s of skills) {
    const nameTokens = tokenize(s.name.replace(/[-/]/g, ' '));
    const tokens = [...nameTokens, ...nameTokens, ...tokenize(s.description), ...(s.triggers || [])];
    docs.set(s.name, termFreq(tokens));
  }
  const df = new Map();
  for (const tf of docs.values()) for (const term of tf.keys()) df.set(term, (df.get(term) || 0) + 1);
  const n = docs.size;
  const idf = (term) => Math.log(1 + n / (1 + (df.get(term) || 0)));
  return { docs, idf };
}

function vec(tf, idf) {
  const v = new Map();
  for (const [term, f] of tf) v.set(term, f * idf(term));
  return v;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const [t, w] of a) {
    na += w * w;
    const bw = b.get(t);
    if (bw) dot += w * bw;
  }
  for (const w of b.values()) nb += w * w;
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// ── Chargement des personas (agents/**/*.md + frontmatter) ─────────────────
// Même couche triggers/TF-IDF que les skills : les 231 agents du dépôt rejoignent
// l'ensemble de choix fermé (kind: 'persona') pour router aussi les personas.
export function loadPersonas(agentsDir = path.join(ROOT, 'agents')) {
  const personas = [];
  const walkFiles = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walkFiles(full); continue; }
      if (!e.name.endsWith('.md')) continue;
      const src = fs.readFileSync(full, 'utf8');
      const m = src.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
      if (!m) continue;
      const name = ((m[1].match(/^name:\s*(.+)$/m) || [])[1] || e.name.replace(/\.md$/, '')).replace(/^"|"$/g, '').trim();
      const descInline = (m[1].match(/^description:\s*("?)([\s\S]*?)\1$/m) || [])[2];
      const description = (descInline || '').replace(/\s+/g, ' ').trim().replace(/^"|"$/g, '');
      const emoji = ((m[1].match(/^emoji:\s*(\S+)/m) || [])[1] || '').trim();
      const color = ((m[1].match(/^color:\s*(\S+)/m) || [])[1] || '').trim();
      if (!name) continue;
      personas.push({
        name,
        description: (description || '').slice(0, 600),
        phase: null,
        triggers: [],
        kind: 'persona',
        emoji,
        color,
      });
    }
  };
  walkFiles(agentsDir);
  return personas;
}

// ── Chargement du catalogue (skills/<name>/SKILL.md + frontmatter) ──────────
export function loadSkills(skillsDir = path.join(ROOT, 'skills')) {
  const skills = [];
  let walk;
  walk = (dir, prefix) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, prefix ? `${prefix}/${e.name}` : e.name);
    }
    const file = path.join(dir, 'SKILL.md');
    if (fs.existsSync(file)) {
      const src = fs.readFileSync(file, 'utf8');
      const m = src.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
      if (m) {
        const name = (m[1].match(/^name:\s*(.+)$/m) || [])[1];
        // description en bloc plié (>- ou > ou |) ou en ligne simple
        const descBlock = m[1].match(/^description:\s*[>|]-?\s*\r?\n([\s\S]*?)(?=^\w[\w-]*:|\Z)/m);
        const descInline = (m[1].match(/^description:\s*(.+)$/m) || [])[1];
        const description = (descBlock ? descBlock[1].replace(/\n\s+/g, ' ').trim() : (descInline || '').trim()) ||
          src.slice(m[0].length, m[0].length + 400).replace(/\n/g, ' ').trim();
        const phase = (m[1].match(/^phase:\s*(\w+)$/m) || [])[1] || null;
        const triggers = [...m[1].matchAll(/^\s*-\s*(.+)$/gm)].map((t) => t[1].trim()).slice(0, 20);
        skills.push({
          name: (name || prefix).trim(),
          description: description.slice(0, 600),
          phase: PHASES.includes(phase) ? phase : null,
          triggers: [...new Set([...(triggers || []), ...(DEFAULT_TRIGGERS[(name || '').trim()] || [])])],
          kind: 'skill',
        });
      }
    }
  };
  walk(skillsDir, '');
  return skills;
}

// ── La décision typée ───────────────────────────────────────────────────────
export function decide(message, skills, { topK = 3, minConfidence = 0 } = {}) {
  if (!message || !message.trim()) throw new Error('message vide : rien à router');
  if (!skills.length) throw new Error('catalogue de skills vide');

  const msgTokens = tokenize(message);

  // 1) Couche triggers (mots-clés distinctifs, match par inclusion de token ou de phrase)
  const triggerHits = new Map(); // skill → triggers trouvés
  for (const s of skills) {
    const hits = (s.triggers || []).filter((tr) => {
      const trTokens = tokenize(tr);
      if (!trTokens.length) return false;
      if (trTokens.length === 1) return msgTokens.includes(trTokens[0]);
      return message.toLowerCase().includes(tr.toLowerCase());
    });
    if (hits.length) triggerHits.set(s.name, hits);
  }

  // 2) Couche TF-IDF sur l'ensemble du catalogue (choix fermé, jamais hors catalogue)
  const corpus = buildCorpus(skills);
  const pv = vec(termFreq(msgTokens), corpus.idf);
  const scored = skills.map((s) => ({
    name: s.name,
    phase: s.phase,
    kind: s.kind || 'skill',
    score: cosine(pv, vec(corpus.docs.get(s.name), corpus.idf)),
  })).sort((a, b) => b.score - a.score);

  const byName = new Map(scored.map((s) => [s.name, s]));
  let mode = 'tfidf';
  let top = scored[0];

  // Un hit trigger l'emporte si le TF-IDF ne tranche pas nettement (rapport < 1.6)
  if (triggerHits.size) {
    const bestTrigger = [...triggerHits.entries()]
      .map(([name, hits]) => ({ name, hits, tfidf: byName.get(name)?.score || 0 }))
      .sort((a, b) => b.tfidf - a.tfidf)[0];
    const ratio = bestTrigger.tfidf > 0 && top.score > 0 ? top.score / bestTrigger.tfidf : Infinity;
    if (!(ratio > 1.6)) {
      top = byName.get(bestTrigger.name);
      mode = 'trigger';
    }
  }

  // 3) Confiance = part du top-1 dans la masse des scores (concentration de la distribution)
  const positive = scored.filter((s) => s.score > 0);
  const mass = positive.reduce((acc, s) => acc + s.score, 0);
  const confidence = mass > 0 && top.score > 0 ? top.score / mass : 0;

  // 4) Fusion des modes pour la traçabilité
  if (mode === 'trigger' && positive.length && positive[0].name !== top.name) mode = 'trigger+tfidf';

  const alternatives = positive
    .filter((s) => s.name !== top.name)
    .slice(0, topK)
    .map((s) => ({ choice: s.name, score: Number(s.score.toFixed(4)) }));

  const decision = confidence < minConfidence ? null : top.name;
  return {
    decision,
    confidence: Number(confidence.toFixed(4)),
    alternatives,
    matchedTriggers: triggerHits.get(top.name) || [],
    phase: top.phase || null,
    kind: top.kind || 'skill',
    mode,
    topK,
  };
}

// ── CLI ─────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { topK: 3, minConfidence: 0, skillsDir: path.join(ROOT, 'skills'), agentsDir: path.join(ROOT, 'agents'), all: false, jsonl: false, message: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--top-k') args.topK = Number(argv[++i]);
    else if (a === '--min-confidence') args.minConfidence = Number(argv[++i]);
    else if (a === '--skills-dir') args.skillsDir = path.resolve(argv[++i]);
    else if (a === '--agents-dir') args.agentsDir = path.resolve(argv[++i]);
    else if (a === '--all') args.all = true;   // skills + personas (agents/) dans le même choix fermé
    else if (a === '--jsonl') args.jsonl = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else args.message.push(a);
  }
  if (!Number.isFinite(args.topK) || args.topK < 1) throw new Error('--top-k doit être un entier ≥ 1');
  if (!Number.isFinite(args.minConfidence) || args.minConfidence < 0 || args.minConfidence > 1) {
    throw new Error('--min-confidence doit être un nombre entre 0 et 1');
  }
  return args;
}

function emit(decision) {
  process.stdout.write(JSON.stringify(decision) + '\n');
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error('Erreur d\'usage : ' + e.message);
    process.exit(1);
  }
  if (args.help) {
    console.log('Usage: node jev-router.mjs "<message>" [--top-k 3] [--min-confidence 0.55] [--skills-dir <dir>] [--all] | --jsonl < stdin');
    console.log('  --all : fusionne les 190+ personas de agents/ avec les skills dans le choix fermé (kind: skill|persona)');
    process.exit(0);
  }
  const skills = loadSkills(args.skillsDir);
  if (!skills.length) {
    console.error('Aucun skill chargé depuis ' + args.skillsDir);
    process.exit(1);
  }
  if (args.all) {
    const personas = loadPersonas(args.agentsDir);
    skills.push(...personas);
  }

  if (args.jsonl) {
    const rl = require_readline();
    rl.on('line', (line) => {
      const t = line.trim();
      if (!t) return;
      try {
        const msg = JSON.parse(t).message ?? t;
        emit(decide(String(msg), skills, args));
      } catch (e) {
        console.error('✗ ' + e.message);
        process.exitCode = 1;
      }
    });
    return;
  }

  const message = args.message.join(' ').trim();
  if (!message) {
    console.error('Usage: node jev-router.mjs "<message>" (ou --jsonl)');
    process.exit(1);
  }
  const decision = decide(message, skills, args);
  emit(decision);
  if (decision.decision === null) process.exit(2); // escalade : confiance insuffisante
}

// readline importé paresseusement pour garder le module importable sans side effect
import { createInterface as _ci } from 'node:readline';
function require_readline() {
  return _ci({ input: process.stdin, crlfDelay: Infinity });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
