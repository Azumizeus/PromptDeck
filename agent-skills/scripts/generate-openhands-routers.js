#!/usr/bin/env node
/**
 * generate-openhands-routers.js
 *
 * Generates the keyword-triggered OpenHands lifecycle routers in
 * .openhands/microagents/route-<phase-lower>.md from the lifecycle skills'
 * own SKILL.md descriptions, using the eval tier's TF-IDF engine to rank
 * candidate trigger words by distinctiveness.
 *
 * Why generated, not hand-written: the routers must track the skills they
 * route to. When a skill's description changes vocabulary, a hand-maintained
 * trigger list silently drifts; a generated one is refreshed with one command
 * and verified in CI with --check.
 *
 * How triggers are picked:
 *   1. Sanity check: the routing skill must rank #1 against its own
 *      description (rankSkills) — otherwise the router advertises a target
 *      the catalog itself would not choose.
 *   2. Description tokens are lowercased raw words (the tokenizer's stop list
 *      applies), grouped by stem so "rollback"/"rollbacks" yield one trigger.
 *      Candidates are ranked by the idf of their stem — distinctive words
 *      first — and capped per router.
 *   3. A candidate is dropped when it collides as a substring with a corpus
 *      word ("spec" ⊂ "unspecified": real OpenHands keyword matching is
 *      substring-based, so ambiguous words mis-fire), when it is a contraction
 *      fragment ("doesn" from "doesn't"), when a later router already uses it,
 *      or when it is deny-listed for that router in PHASE_ROUTERS.
 *   4. `extraTriggers` are curated words a user would type that the
 *      description may not contain ("bug", "new project"). They are trusted:
 *      a deliberate substring overlap can be desirable ("bug" inside "debug"
 *      routing to the bug router is correct, not a mis-fire).
 *
 * Usage:
 *   node scripts/generate-openhands-routers.js           # write the files
 *   node scripts/generate-openhands-routers.js --check   # fail if they drift
 *
 * Exit codes: 0 = ok, 1 = drift detected (--check) or generation failed
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { STOP, tokenize, buildCorpus, rankSkills, loadSkills } = require('./run-evals.js');
const { loadSkillsFromDir } = require('./openhands-loader-sim.js');

const ROOT = path.resolve(__dirname, '..');
const MICROAGENTS_DIR = path.join(ROOT, '.openhands', 'microagents');
const SKILLS_DIR = path.join(ROOT, 'skills');

// One router per AGENTS.md lifecycle phase. `skills` lists, in order, the
// skills the router body points at; the first is the primary routing target
// whose description feeds trigger generation. `extraTriggers` are curated
// vocabulary no description token reliably yields. `denyTokens` rejects
// description-derived words that would mis-fire in practice; edit this config
// (never the generated files) when regeneration picks a bad word.
const PHASE_ROUTERS = [
  {
    file: 'route-spec.md',
    name: 'route-spec',
    phase: 'DEFINE',
    skills: ['spec-driven-development'],
    extraTriggers: ['spec', 'specification', 'feature', 'new project', 'prd'],
    denyTokens: ['commands', 'code', 'style', 'testing', 'structure', 'objectives', 'covering', 'coding', 'decomposing'],
  },
  {
    file: 'route-plan.md',
    name: 'route-plan',
    phase: 'PLAN',
    skills: ['planning-and-task-breakdown'],
    extraTriggers: ['plan', 'planning', 'breakdown', 'decompose', 'tasks'],
    denyTokens: ['small', 'order'],
  },
  {
    file: 'route-build.md',
    name: 'route-build',
    phase: 'BUILD',
    skills: ['incremental-implementation', 'test-driven-development'],
    extraTriggers: ['build', 'code', 'implement', 'tests'],
    denyTokens: ['thin', 'safe', 'flags', 'defaults', 'friendly', 'changes'],
  },
  {
    file: 'route-bug.md',
    name: 'route-bug',
    phase: 'VERIFY',
    skills: ['debugging-and-error-recovery'],
    extraTriggers: ['bug', 'broken', 'crash', 'debugging', 'error', 'fails', 'failing'],
    denyTokens: ['stop', 'line', 'rule'],
  },
  {
    file: 'route-review.md',
    name: 'route-review',
    phase: 'REVIEW',
    skills: ['code-review-and-quality', 'security-audit'],
    extraTriggers: ['review', 'audit', 'pull request', 'code review'],
    denyTokens: ['five', 'axis', 'sizing', 'severity', 'labels', 'norms', 'splitting', 'strategies', 'speed'],
  },
  {
    file: 'route-ship.md',
    name: 'route-ship',
    phase: 'SHIP',
    skills: ['shipping-and-launch', 'ci-cd-and-automation'],
    extraTriggers: ['ship', 'deploy', 'release', 'rollout'],
    denyTokens: ['production'],
  },
];

const MIN_TRIGGER_LENGTH = 3;
const MAX_DESCRIBED_TRIGGERS_PER_ROUTER = 3;

// Specialty routers cover nested pack directories the top-level loader
// (run-evals.loadSkills) cannot see: skills/<category>/<skill-name>/SKILL.md.
// `category` is the nested directory; triggers are generated from a composite
// description built from the category's own skills, plus curated extras.
const SPECIALTY_ROUTERS = [
  {
    file: 'route-solana.md',
    name: 'route-solana',
    phase: null,
    microagentOnly: true,
    category: 'solana-protocols',
    primarySkill: 'birdeye',
    skills: ['solana-protocols/birdeye', 'solana-protocols/jupiter', 'solana-protocols/metaplex-protocol', 'solana-protocols/vulnhunter'],
    extraTriggers: ['solana', 'jupiter', 'metaplex', 'spl', 'devnet', 'mainnet'],
    denyTokens: [],
  },
  {
    file: 'route-game.md',
    name: 'route-game',
    phase: null,
    microagentOnly: true,
    category: 'game-design',
    primarySkill: 'game-audio-direction',
    skills: ['game-design/game-audio-direction', 'game-design/motion-design-system', 'game-design/visual-rendering-game-feel'],
    extraTriggers: ['game', 'gameplay', 'sprites', 'pixel art', 'game feel'],
    denyTokens: ['music'],
  },
  {
    file: 'route-security.md',
    name: 'route-security',
    phase: null,
    microagentOnly: true,
    category: null,
    primarySkill: 'security-audit',
    skills: ['security-audit', 'security-and-hardening'],
    extraTriggers: ['pentest', 'pen test', 'vulnerability', 'exploit', 'owasp'],
    denyTokens: [],
  },
];

// Contraction fragments survive tokenization ("doesn't" -> "doesn") and are
// never good triggers.
const CONTRACTION_FRAGMENTS = new Set([
  'don', 'doesn', 'didn', 'won', 'wouldn', 'shouldn', 'couldn', 'can',
  'isn', 'aren', 'wasn', 'weren', 'hasn', 'haven', 'hadn',
]);

// ─── Corpus probing ──────────────────────────────────────────────────────────

/**
 * Probe vocabulary for substring-collision checks: the corpus's stemmed
 * skill-name tokens plus common English words that embed other words.
 * @param {ReturnType<typeof buildCorpus>} corpus
 * @returns {Set<string>}
 */
function buildProbeVocabulary(corpus, allSkillNames) {
  const probes = new Set();
  for (const name of corpus.docs.keys()) {
    for (const token of name.replace(/-/g, ' ').split(/\s+/)) probes.add(token);
  }
  // Nested-pack skills are invisible to the top-level corpus but are real
  // routing targets: their name tokens ("art" from pixel-art-*, "ts" from
  // effect-ts, "wallet") must block substring-ambiguous triggers too.
  for (const name of allSkillNames) {
    for (const token of name.replace(/-/g, ' ').split(/[\s/]+/)) probes.add(token);
  }
  const commonEmbedders = [
    'unspecified', 'inspecting', 'respectively', 'prosper', 'superb',
    'reproduction', 'produce', 'reproduce', 'worship', 'reviewer',
    'preview', 'explained', 'display', 'fixture', 'prefix', 'codec',
  ];
  for (const w of commonEmbedders) probes.add(w);
  return probes;
}

/**
 * True when `word` substring-matches a DIFFERENT probe word in either
 * direction — i.e. the trigger is ambiguous under substring matching.
 * Identity (word === probe) is not a collision.
 * @param {string} word - candidate trigger (lowercase)
 * @param {Set<string>} probes
 * @returns {boolean}
 */
function collidesAsSubstring(word, probes) {
  for (const probe of probes) {
    if (probe === word) continue;
    if (probe.includes(word) || word.includes(probe)) return true;
  }
  return false;
}

// ─── Nested-pack loading ─────────────────────────────────────────────────────

/**
 * Load a skill from a nested pack path: skills/<category>/<name>/SKILL.md.
 * Returns { name, description } from its frontmatter, or null.
 * @param {string} nestedPath - e.g. "solana-protocols/birdeye"
 * @returns {{ name: string, description: string } | null}
 */
function loadNestedSkill(nestedPath) {
  const file = path.join(SKILLS_DIR, nestedPath, 'SKILL.md');
  if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return null;
  const name = (m[1].match(/^name:\s*(.+)$/m) || [])[1];
  let description = (m[1].match(/^description:\s*(.+)$/m) || [])[1] || '';
  // YAML block scalars (description: >) put the body on following lines.
  if (!description || description === '>') {
    const block = m[1].match(/^description:\s*>[ \t]*\r?\n([\s\S]*?)(?=\n\S|$)/m);
    if (block) description = block[1].replace(/\n\s*/g, ' ').trim();
  }
  if (!name) return null;
  return { name: name.trim(), description: description.trim() };
}

// ─── Trigger generation ──────────────────────────────────────────────────────

/**
 * Pick trigger words for one router from its primary skill's description.
 * @param {object} router - one entry of PHASE_ROUTERS
 * @param {ReturnType<typeof buildCorpus>} corpus
 * @param {Map<string, number>} idf - stemmed term -> idf weight
 * @param {Set<string>} probes - substring-collision probe vocabulary
 * @param {Set<string>} taken - triggers already used by other routers
 * @returns {{ triggers: string[], notes: string[] }}
 */
function pickTriggers(router, corpus, idf, probes, taken, allSkills) {
  const notes = [];
  const skillName = router.skills[0];
  const skillFile = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    throw new Error(`routing target skills/${skillName}/SKILL.md not found`);
  }
  const skill = (allSkills || loadSkills()).find(s => s.name === skillName);
  if (!skill) throw new Error(`skills/${skillName}/SKILL.md has no parsable frontmatter`);

  // Sanity: the primary skill must rank #1 against its own description.
  const ranking = rankSkills(skill.description, corpus);
  const selfIdx = ranking.findIndex(r => r.name === skillName);
  if (selfIdx !== 0) {
    notes.push(`WARNING: ${skillName} ranks #${selfIdx + 1} against its own description (top: ${ranking[0].name})`);
  }

  // Raw (unstemmed) words of the description, grouped by stem. The stem is the
  // idf lookup key; the shortest raw form is the trigger surface — users type
  // "rollback", not the stem "rollback" minus suffixes.
  const rawWords = skill.description
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(t => t.length >= MIN_TRIGGER_LENGTH && !STOP.has(t));
  const byStem = new Map(); // stem -> shortest raw word
  for (const raw of rawWords) {
    const stem = tokenize(raw)[0];
    if (!stem) continue;
    if (!byStem.has(stem) || raw.length < byStem.get(stem).length) {
      byStem.set(stem, raw);
    }
  }

  const deny = new Set((router.denyTokens || []).map(t => t.toLowerCase()));
  const candidates = [...byStem.entries()]
    .filter(([stem, raw]) =>
      (idf.get(stem) || 0) > 0 &&
      !deny.has(raw) && !deny.has(stem) &&
      !CONTRACTION_FRAGMENTS.has(raw) &&
      !taken.has(raw) && !taken.has(stem) &&
      !collidesAsSubstring(raw, probes))
    .sort((a, b) => (idf.get(b[0]) - idf.get(a[0])) || a[1].localeCompare(b[1]))
    .map(([, raw]) => raw);

  const described = [];
  for (const cand of candidates) {
    if (described.length >= MAX_DESCRIBED_TRIGGERS_PER_ROUTER) break;
    described.push(cand);
  }
  if (described.length === 0) {
    notes.push('no usable trigger from the description; extras only');
  }
  // Extra triggers are curated; they bypass the substring check on purpose
  // (see header comment) but still respect words taken by other routers.
  // Extras come first so curated, user-realistic words lead the list, and the
  // final list is deduplicated case-insensitively.
  const seen = new Set();
  const triggers = [];
  for (const t of [...(router.extraTriggers || []), ...described]) {
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    if (key !== t && taken.has(key)) continue;
    seen.add(key);
    triggers.push(t);
  }
  return { triggers, notes };
}

/**
 * Pick trigger words for a specialty router from its nested pack's composite
 * description. Same algorithm as pickTriggers but the "description" is the
 * concatenation of the category skills' descriptions (capped), and the rank
 * sanity check compares against the nested corpus.
 * @param {object} router - one entry of SPECIALTY_ROUTERS
 * @param {Map<string, number>} idf - stemmed term -> idf from the top corpus
 * @param {Set<string>} probes - substring-collision probe vocabulary
 * @param {Set<string>} taken - triggers already used by other routers
 * @returns {{ triggers: string[], notes: string[] }}
 */
function pickSpecialtyTriggers(router, idf, probes, taken) {
  const notes = [];
  const descriptions = [];
  for (const nested of router.skills) {
    const skill = loadNestedSkill(nested);
    if (skill) descriptions.push(skill.description);
    else notes.push(`nested skill ${nested} not found (skipped)`);
  }
  if (descriptions.length === 0) {
    return { triggers: [...(router.extraTriggers || [])], notes: [...notes, 'no nested skill found; extras only'] };
  }
  const composite = descriptions.join(' ').slice(0, 1200);

  const rawWords = composite
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(t => t.length >= MIN_TRIGGER_LENGTH && !STOP.has(t));
  const byStem = new Map();
  for (const raw of rawWords) {
    const stem = tokenize(raw)[0];
    if (!stem) continue;
    if (!byStem.has(stem) || raw.length < byStem.get(stem).length) {
      byStem.set(stem, raw);
    }
  }
  const deny = new Set((router.denyTokens || []).map(t => t.toLowerCase()));
  const candidates = [...byStem.entries()]
    .filter(([stem, raw]) =>
      (idf.get(stem) || 0) > 0 &&
      !deny.has(raw) && !deny.has(stem) &&
      !CONTRACTION_FRAGMENTS.has(raw) &&
      !taken.has(raw) && !taken.has(stem) &&
      !collidesAsSubstring(raw, probes))
    .sort((a, b) => (idf.get(b[0]) - idf.get(a[0])) || a[1].localeCompare(b[1]))
    .map(([, raw]) => raw);
  const described = [];
  for (const cand of candidates) {
    if (described.length >= MAX_DESCRIBED_TRIGGERS_PER_ROUTER) break;
    described.push(cand);
  }
  const seen = new Set();
  const triggers = [];
  for (const t of [...(router.extraTriggers || []), ...described]) {
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    if (key !== t && taken.has(key)) continue;
    seen.add(key);
    triggers.push(t);
  }
  return { triggers, notes };
}

// ─── Rendering ───────────────────────────────────────────────────────────────

/** Title-case a phase name for prose (DEFINE -> Define). */
function titlePhase(phase) {
  return phase.charAt(0) + phase.slice(1).toLowerCase();
}

/**
 * Render the microagent markdown for one router. Rendering is deterministic;
 * trigger and wording choices belong in PHASE_ROUTERS / SPECIALTY_ROUTERS, not
 * the output.
 * @param {object} router - PHASE_ROUTERS or SPECIALTY_ROUTERS entry
 * @param {string[]} triggers - final trigger list
 * @returns {string}
 */
function renderRouter(router, triggers) {
  const isSpecialty = !!router.category || router.phase === null;
  const lines = [];
  lines.push('---');
  lines.push(`name: ${router.name}`);
  lines.push(`description: ${isSpecialty ? 'Auto-generated OpenHands specialty router' : 'Auto-generated OpenHands lifecycle router for ' + titlePhase(router.phase)} (${router.skills.join(' + ')}). Loads when a user message matches its triggers.`);
  if (router.phase) lines.push(`phase: ${router.phase}`);
  if (router.microagentOnly) lines.push('microagent-only: true');
  lines.push('triggers:');
  for (const t of triggers) lines.push(`- ${t}`);
  lines.push('---');
  lines.push('');
  lines.push('<!-- Generated by scripts/generate-openhands-routers.js - do not edit by hand. Tune PHASE_ROUTERS or SPECIALTY_ROUTERS in the generator and regenerate. -->');
  lines.push('');
  lines.push(`# Route: ${isSpecialty ? router.name.replace('route-', '') : titlePhase(router.phase)} → ${router.skills.join(' + ')}`);
  lines.push('');
  const targets = router.skills
    .map(s => `[${s.split('/').pop()}](../../skills/${s}/SKILL.md)`)
    .join(' and ');
  lines.push(`The user message matches the ${isSpecialty ? router.name.replace('route-', '') + ' specialty' : titlePhase(router.phase) + ' phase'}. Apply the ${targets}`);
  lines.push('workflow before acting on the request.');
  lines.push('');
  lines.push(`Load ${router.skills.map(s => `\`skills/${s}/SKILL.md\``).join(' and ')} before writing code or plans.`);
  lines.push('');
  return lines.join('\n');
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

/**
 * Generate all router files and report drift.
 * @param {object} opts
 * @param {boolean} [opts.write=false] - write changed files to disk
 * @param {boolean} [opts.check=false] - compare without writing; fail on drift
 * @returns {{ ok: boolean, changed: string[], summary: object[] }}
 */
function generateRouters({ write = false, check = false } = {}) {
  const skills = loadSkills();
  const corpus = buildCorpus(skills);

  // idf over the FULL catalog (top-level + nested packs): the 103 nested
  // skills share vocabulary with the 30 top-level ones, so df from the
  // top-level corpus alone inflates rare words into trigger candidates that
  // are actually common across the repo.
  const allSkillsFlat = loadSkillsFromDir(SKILLS_DIR);
  const fullCorpus = allSkillsFlat.length > skills.length ? buildCorpus(allSkillsFlat.map(s => ({ name: s.name, description: s.description }))) : corpus;
  const df = new Map();
  for (const tf of fullCorpus.docs.values()) {
    for (const term of tf.keys()) df.set(term, (df.get(term) || 0) + 1);
  }
  const n = fullCorpus.docs.size;
  const idf = new Map([...df.keys()].map(t => [t, Math.log(1 + n / (1 + (df.get(t) || 0)))]));

  const probes = buildProbeVocabulary(corpus, allSkillsFlat.map(s => s.name));
  const generatedFiles = new Set([...PHASE_ROUTERS, ...SPECIALTY_ROUTERS].map(r => r.file));

  // Pre-seed `taken` with triggers of NON-generated microagents only, so the
  // generator cannot collide with hand-written microagents — and so
  // regenerating the routers is not blocked by their own current triggers.
  const taken = new Set();
  if (fs.existsSync(MICROAGENTS_DIR)) {
    for (const f of fs.readdirSync(MICROAGENTS_DIR).filter(f => f.endsWith('.md'))) {
      if (generatedFiles.has(f)) continue;
      const src = fs.readFileSync(path.join(MICROAGENTS_DIR, f), 'utf8');
      const m = src.match(/triggers:\n((?:- .+\n?)+)/);
      if (m) {
        for (const line of m[1].split('\n')) {
          const t = line.replace(/^-\s*/, '').trim().toLowerCase();
          if (t) taken.add(t);
        }
      }
    }
  }

  const changed = [];
  const summary = [];
  let ok = true;

  for (const router of PHASE_ROUTERS) {
    const { triggers, notes } = pickTriggers(router, corpus, idf, probes, taken, skills);
    if (triggers.length === 0) {
      ok = false;
      summary.push({ file: router.file, triggers: [], notes: [...notes, 'ERROR: no triggers produced'] });
      continue;
    }
    for (const t of triggers) taken.add(t);
    const content = renderRouter(router, triggers);
    const file = path.join(MICROAGENTS_DIR, router.file);
    const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;

    if (existing !== content) {
      if (check) {
        ok = false;
        changed.push(router.file);
      } else if (write) {
        fs.mkdirSync(MICROAGENTS_DIR, { recursive: true });
        fs.writeFileSync(file, content);
        changed.push(router.file);
      }
    }
    summary.push({ file: router.file, triggers, notes });
  }

  for (const router of SPECIALTY_ROUTERS) {
    const { triggers, notes } = pickSpecialtyTriggers(router, idf, probes, taken);
    if (triggers.length === 0) {
      ok = false;
      summary.push({ file: router.file, triggers: [], notes: [...notes, 'ERROR: no triggers produced'] });
      continue;
    }
    for (const t of triggers) taken.add(t);
    const content = renderRouter(router, triggers);
    const file = path.join(MICROAGENTS_DIR, router.file);
    const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;

    if (existing !== content) {
      if (check) {
        ok = false;
        changed.push(router.file);
      } else if (write) {
        fs.mkdirSync(MICROAGENTS_DIR, { recursive: true });
        fs.writeFileSync(file, content);
        changed.push(router.file);
      }
    }
    summary.push({ file: router.file, triggers, notes });
  }

  return { ok, changed, summary };
}

function main() {
  const check = process.argv.includes('--check');
  const write = !check; // default mode writes; --check only compares

  const { ok, changed, summary } = generateRouters({ write, check });

  for (const entry of summary) {
    const label = entry.triggers.length > 0 ? entry.triggers.join(', ') : '(no triggers)';
    console.log(`  ${entry.file}: ${label}`);
    for (const note of entry.notes) console.log(`       ${note}`);
  }
  // (Cap-dropped candidates are intentionally not listed per word; the cap
  // exists so extras always appear, and the list above is the output of record.)

  if (check) {
    if (!ok) {
      console.error(`\nGenerated routers drifted from disk (${changed.join(', ')}).`);
      console.error('Run `node scripts/generate-openhands-routers.js` to regenerate.');
      process.exit(1);
    }
    console.log('\nAll generated routers match disk — PASSED.');
    return;
  }

  if (!ok) {
    console.error('\nGeneration FAILED (see errors above).');
    process.exit(1);
  }
  console.log(changed.length > 0
    ? `\nWrote ${changed.length} router file(s): ${changed.join(', ')}`
    : '\nAll routers already up to date.');
}

module.exports = { generateRouters, PHASE_ROUTERS, SPECIALTY_ROUTERS, collidesAsSubstring, renderRouter, loadNestedSkill };

if (require.main === module) {
  main();
}
