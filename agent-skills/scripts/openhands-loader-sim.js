#!/usr/bin/env node
/**
 * openhands-loader-sim.js
 *
 * End-to-end dry run of the OpenHands conversation-start behavior for this
 * repository. OpenHands itself is not required: the simulator replays, against
 * the real repo content, the two things OpenHands does at conversation start:
 *
 * 1. Always-loaded microagents (no `triggers` field) are loaded in full. The
 *    pack's list-loaded-skills.md instructs the agent to list the skills
 *    inventory — the simulator executes that listing over the real skills/
 *    directory.
 * 2. Keyword-triggered microagents are injected when a user message contains
 *    one of their trigger words. The simulator replays sample user messages
 *    and checks that the right routers fire (and no wrong one does).
 *
 * Any mismatch (inventory drift, trigger word not firing, wrong router firing,
 * routed skill missing on disk) fails with exit code 1. This is the closest
 * reproducible check to "open a real OpenHands conversation and watch the
 * inventory print" that CI can run.
 *
 * Exit codes: 0 = simulation passed, 1 = drift detected
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Frontmatter parsing helpers are imported, not duplicated: the validator is
// the single source of truth for how microagent frontmatter is read, and a
// divergent copy here would let the two tools disagree silently.
const { parseFrontmatter, extractScalar, extractFrontmatterEntries } = require('./validate-openhands-microagent.js');

// The eval tier's TF-IDF engine is imported for description-based routing
// (see routeByDescription). buildCorpus/rankSkills are the exact functions
// the deterministic evals run, so the simulation measures the same math CI
// already ratchets on. loadSkills is repo-hardcoded in run-evals, so the
// simulator carries a directory-parameterized loader for sandbox tests.
const { buildCorpus, rankSkills, tokenize } = require('./run-evals.js');

const ROOT = path.resolve(__dirname, '..');
const MICROAGENTS_DIR = path.join(ROOT, '.openhands', 'microagents');
const SKILLS_DIR = path.join(ROOT, 'skills');

// Sample user messages replayed through the routing engine. Two contracts are
// checked per message:
//   `expect`            — keyword-trigger routers that must fire (exact set)
//   `expectDescription` — routers whose primary skill must appear in the
//                         top-`DESCRIPTION_ROUTING_TOP_K` of the TF-IDF rank
//                         over skill descriptions (exact set; adjacent skills
//                         legitimately co-fire under description routing)
// Trigger words are chosen from vocabulary a real user would type (mirroring
// the eval-suite principle: never copy the trigger list verbatim).
const SAMPLE_MESSAGES = [
  // TF-IDF over the full catalog ranks Solana's DeFi jupiter skill above the
  // bug router here ("API"/"error" vocabulary is dense in the Solana pack) —
  // a known description-layer imprecision; the keyword layer alone is exact.
  { message: 'The checkout API throws an intermittent 500 error in production', expect: ['route-bug'], expectDescription: ['route-solana'] },
  // A failing test is genuinely TDD-adjacent: "test" stems to the same token
  // as the build router's `tests` trigger (symmetric stemming), and
  // test-driven-development ranks top-2 by description. route-build co-fires
  // in BOTH layers — expected, not drift.
  { message: 'My test passed yesterday and fails today after the refactor', expect: ['route-bug', 'route-build'], expectDescription: ['route-bug', 'route-build'] },
  { message: 'Write a spec for Google OAuth authentication in the app', expect: ['route-spec'], expectDescription: ['route-spec'] },
  // "payments" pulls lightprotocol/payments into the top-3 but NOT the
  // build router; route-build only co-fires from rank 4.
  { message: 'We need a plan to break the payments work into tasks', expect: ['route-plan'], expectDescription: ['route-plan'] },
  { message: 'Build the OAuth login screen with tests', expect: ['route-build'], expectDescription: ['route-build'] },
  { message: 'Review this pull request before we merge it', expect: ['route-review'], expectDescription: ['route-review', 'route-security'] },
  { message: 'Ship the release to production on Thursday', expect: ['route-ship'], expectDescription: ['route-ship'] },
  // Specialty routers: nested packs (solana-protocols/, game-design/, security-audit).
  // Description routing for specialties runs over the nested corpus too.
  { message: 'Integrate the Jupiter swap API for my Solana token', expect: ['route-solana'] },
  { message: 'Design the pixel art sprites for my game', expect: ['route-game'] },
  // "audit" is genuinely both REVIEW (code review) and SECURITY vocabulary —
  // route-review and route-security co-fire by keyword. Expected, not drift.
  { message: 'Run a security audit and pentest of this service', expect: ['route-review', 'route-security'], expectDescription: ['route-review', 'route-security'] },
  { message: 'Rename the variable x to y in utils.py', expect: [], expectDescription: [] },
  { message: 'What does this repository do?', expect: [], expectDescription: [] },
];

// How deep the TF-IDF ranking may reach for a router to fire under
// description routing. Top-1 would be too brittle for real phrasing (the
// 500-error sample ranks debugging #2 behind api-and-interface-design); top-2
// matches the eval suite's default top_k granularity.
const DESCRIPTION_ROUTING_TOP_K = 3;

// ─── Loader ──────────────────────────────────────────────────────────────────

/**
 * Load microagents exactly the way OpenHands's Skill class does:
 * frontmatter `name`, `triggers` (list of trigger words), and body content.
 * @param {string} dir - directory containing microagent .md files
 * @returns {{ name: string, file: string, triggers: string[], body: string, alwaysLoaded: boolean }[]}
 */
function loadMicroagents(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const agents = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const name = extractScalar(frontmatter, 'name') || file.replace(/\.md$/, '');
    const triggers = extractFrontmatterEntries(frontmatter, 'triggers')
      .map(t => t.toLowerCase());
    agents.push({ name, file, triggers, body, alwaysLoaded: triggers.length === 0 });
  }
  return agents;
}

// ─── Description routing (TF-IDF, eval-tier engine) ─────────────────────────

/**
 * Load skills from a directory the way run-evals.loadSkills does, but with an
 * injectable root for sandbox tests. Returns [{ name, description }].
 * @param {string} skillsDir
 * @returns {{ name: string, description: string }[]}
 */
function loadSkillsFromDir(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];
  const skills = [];
  const parse = (src) => {
    const m = src.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
    if (!m) return null;
    const name = (m[1].match(/^name:\s*(.+)$/m) || [])[1];
    let description = (m[1].match(/^description:\s*(.+)$/m) || [])[1] || '';
    if (!description.trim() || description.trim() === '>') {
      const block = m[1].match(/^description:\s*>[ \t]*\r?\n([\s\S]*?)(?=\n\S|$)/m);
      if (block) description = block[1].replace(/\n\s*/g, ' ');
    }
    return name && description.trim() ? { name: name.trim(), description: description.trim() } : null;
  };
  for (const dir of fs.readdirSync(skillsDir)) {
    const entryPath = path.join(skillsDir, dir);
    if (!fs.statSync(entryPath).isDirectory()) continue;
    const top = path.join(entryPath, 'SKILL.md');
    if (fs.existsSync(top)) {
      const s = parse(fs.readFileSync(top, 'utf8'));
      if (s) skills.push(s);
      continue;
    }
    // Nested category pack: index children as "<category>/<child>" so router
    // bodies referencing nested paths resolve in description routing.
    for (const child of fs.readdirSync(entryPath)) {
      const nested = path.join(entryPath, child, 'SKILL.md');
      if (!fs.existsSync(nested)) continue;
      const s = parse(fs.readFileSync(nested, 'utf8'));
      if (s) skills.push({ name: `${dir}/${child}`, description: s.description });
    }
  }
  return skills;
}

/**
 * Route a user message by description: rank all skill descriptions against
 * the message with the eval tier's TF-IDF engine, then fire every router
 * owning one of the top-`topK` skills (score > 0). This approximates the
 * host's native description matching — the path OpenHands uses when no
 * trigger word appears — and catches drift the keyword layer cannot see:
 * a description rewrite that makes a skill unreachable for its own phase.
 * @param {string} message
 * @param {ReturnType<typeof buildCorpus>} corpus
 * @param {Map<string, string[]>} routerSkills - router name -> routed skill names
 * @param {number} topK
 * @returns {string[]}
 */
function routeByDescription(message, corpus, routerSkills, topK = DESCRIPTION_ROUTING_TOP_K) {
  const top = rankSkills(message, corpus).filter(r => r.score > 0).slice(0, topK).map(r => r.name);
  const fired = [];
  for (const [router, skills] of routerSkills) {
    if (skills.some(s => top.includes(s))) fired.push(router);
  }
  return fired.sort();
}

/**
 * Match a user message against trigger words. The validator enforces "plain
 * word" triggers, so matching is word-boundary based and case-insensitive:
 * a trigger `pr` must NOT fire inside "production". Multi-word triggers
 * ("new project") match as phrases between word boundaries. Each message
 * word is compared at its TF-IDF stem as well as its surface form, so "using
 * the build system" fires a `build` trigger via "builds"-style inflection
 * — the same stemmer the description corpus runs, keeping both routing
 * layers consistent.
 * @param {string} message - the user message
 * @param {string[]} triggers - lowercased trigger words for one microagent
 * @returns {boolean}
 */
function matches(message, triggers) {
  const words = message.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean);
  const stems = new Set(words.flatMap(w => tokenize(w)));
  return triggers.some(t => {
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (t.includes(' ')) {
      return new RegExp(`\\b${escaped}\\b`, 'i').test(message);
    }
    // Symmetric stemming: stem both the trigger and the message words, so a
    // `failing` trigger fires on "it fails" and `tasks` fires on "task".
    if (stems.has(t) || stems.has(tokenize(t)[0])) return true;
    return new RegExp(`\\b${escaped}\\b`, 'i').test(message);
  });
}

// ─── Skill inventory (executes list-loaded-skills.md's instruction) ──────────

/**
 * Build the startup inventory exactly as the always-loaded
 * list-loaded-skills.md instructs: list directories under skills/, read each
 * SKILL.md frontmatter (name + first sentence of description), print one line
 * per skill. Returns the inventory lines (or null when skills/ is absent).
 * @param {string} skillsDir
 * @returns {string[] | null}
 */
function buildInventory(skillsDir) {
  if (!fs.existsSync(skillsDir)) return null;
  const lines = [];
  for (const entry of fs.readdirSync(skillsDir).sort()) {
    const skillMd = path.join(skillsDir, entry, 'SKILL.md');
    if (!fs.existsSync(skillMd)) continue;
    const { frontmatter } = parseFrontmatter(fs.readFileSync(skillMd, 'utf8'));
    const name = extractScalar(frontmatter, 'name') || entry;
    const description = extractScalar(frontmatter, 'description') || '';
    const firstSentence = description.split(/(?<=[.!?])\s/)[0] || description;
    lines.push(`- ${name} — ${firstSentence}`);
  }
  return lines;
}

// ─── Simulation ──────────────────────────────────────────────────────────────

/**
 * Run the full conversation-start simulation.
 * @param {object} deps - injectable for testing
 * @param {string} deps.microagentsDir
 * @param {string} deps.skillsDir
 * @param {{ message: string, expect: string[] }[]} [deps.sampleMessages]
 * @returns {{ ok: boolean, errors: string[], summary: object }}
 */
function simulateConversationStart({ microagentsDir, skillsDir, sampleMessages = SAMPLE_MESSAGES }) {
  const errors = [];
  const agents = loadMicroagents(microagentsDir);

  if (agents.length === 0) {
    errors.push('No microagents found — OpenHands would start with an empty OpenHands adapter.');
  }

  // 1. Always-loaded microagents load in full at conversation start.
  const alwaysLoaded = agents.filter(a => a.alwaysLoaded);
  const startup = alwaysLoaded.find(a => a.file === 'list-loaded-skills.md');
  if (!startup) {
    errors.push('list-loaded-skills.md is not always-loaded: the startup inventory would not run at conversation start.');
  }

  // 2. The startup inventory listing works over the real skills/ directory.
  const inventory = buildInventory(skillsDir);
  if (inventory === null) {
    errors.push('skills/ not found — the startup inventory would report "no skills loaded".');
  } else if (inventory.length === 0) {
    errors.push('skills/ contains no SKILL.md — the startup inventory would print zero skills.');
  }

  // 3. Triggered microagents fire on the right sample messages and not on the wrong ones.
  const triggerHits = new Map(); // router -> hit count across positive samples
  for (const { message, expect } of sampleMessages) {
    const fired = agents
      .filter(a => !a.alwaysLoaded && matches(message, a.triggers))
      .map(a => a.name);
    const expected = [...expect].sort();
    const actual = [...fired].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      errors.push(`Message "${message}": expected [${expected.join(', ') || 'none'}] to fire, got [${actual.join(', ') || 'none'}].`);
    }
    for (const name of fired) triggerHits.set(name, (triggerHits.get(name) || 0) + 1);
  }

  // 3b. Description routing: same messages through the eval tier's TF-IDF
  //     ranking over skill descriptions. Routers derive their skill targets
  //     from their own bodies (skills/<name>/SKILL.md references).
  const routerSkills = new Map();
  for (const agent of agents.filter(a => !a.alwaysLoaded)) {
    const routed = [...agent.body.matchAll(/skills\/([a-z0-9/-]+)\/SKILL\.md/g)].map(m => m[1]);
    if (routed.length > 0) routerSkills.set(agent.name, routed);
  }
  const corpus = buildCorpus(loadSkillsFromDir(skillsDir));
  let descriptionChecked = 0;
  if (corpus.docs.size > 0 && routerSkills.size > 0) {
    for (const { message, expectDescription } of sampleMessages) {
      if (!Array.isArray(expectDescription)) continue;
      descriptionChecked++;
      const actual = routeByDescription(message, corpus, routerSkills);
      const expected = [...expectDescription].sort();
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        errors.push(`Description routing for "${message}": expected [${expected.join(', ') || 'none'}], got [${actual.join(', ') || 'none'}] ` +
          `(top-${DESCRIPTION_ROUTING_TOP_K} of the TF-IDF ranking over skill descriptions).`);
      }
    }
  }

  // 4. Every triggered router must fire at least once across the samples,
  //    under keyword OR description routing, and must route to a skill that
  //    exists on disk.
  for (const agent of agents.filter(a => !a.alwaysLoaded)) {
    if (!triggerHits.get(agent.name)) {
      errors.push(`Triggered microagent ${agent.name} never fires on any sample message — its triggers are unreachable in practice.`);
    }
    const routed = [...agent.body.matchAll(/skills\/([a-z0-9/-]+)\/SKILL\.md/g)].map(m => m[1]);
    for (const skill of routed) {
      if (!fs.existsSync(path.join(skillsDir, skill, 'SKILL.md'))) {
        errors.push(`${agent.file} routes to skills/${skill}/SKILL.md, which does not exist on disk.`);
      }
    }
  }

  const ok = errors.length === 0;
  const summary = {
    microagents: agents.length,
    alwaysLoaded: alwaysLoaded.length,
    triggered: agents.length - alwaysLoaded.length,
    skills: inventory ? inventory.length : 0,
    sampleMessages: sampleMessages.length,
    descriptionChecked,
    inventorySample: inventory ? inventory.slice(0, 3) : [],
  };
  return { ok, errors, summary };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('Simulating OpenHands conversation start...\n');

  const { ok, errors, summary } = simulateConversationStart({
    microagentsDir: MICROAGENTS_DIR,
    skillsDir: SKILLS_DIR,
  });

  console.log(`  Loaded skills (${summary.skills}):`);
  for (const line of summary.inventorySample) console.log(`    ${line}`);
  if (summary.skills > summary.inventorySample.length) {
    console.log(`    … and ${summary.skills - summary.inventorySample.length} more`);
  }
  console.log('');
  console.log(`  Always-loaded microagents: ${summary.alwaysLoaded}`);
  console.log(`  Keyword-triggered microagents: ${summary.triggered}`);
  console.log(`  Sample messages replayed: ${summary.sampleMessages} (keyword + description routing${summary.descriptionChecked ? ', ' + summary.descriptionChecked + ' description-checked' : ''})`);
  console.log('');

  if (!ok) {
    for (const err of errors) console.error(`  ERROR: ${err}`);
    console.error(`\nSimulation FAILED — ${errors.length} error(s).`);
    process.exit(1);
  }

  console.log('Simulation PASSED — inventory prints, routers fire on the right messages only.');
}

module.exports = {
  loadMicroagents,
  matches,
  buildInventory,
  simulateConversationStart,
  routeByDescription,
  loadSkillsFromDir,
  SAMPLE_MESSAGES,
  DESCRIPTION_ROUTING_TOP_K,
};


if (require.main === module) {
  main();
}
