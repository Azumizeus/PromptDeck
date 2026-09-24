#!/usr/bin/env node
/**
 * validate-openhands-microagent.js
 *
 * Guards the OpenHands adapter: .openhands/microagents/*.md.
 *
 * OpenHands semantics (docs.openhands.dev/overview/skills): a microagent .md
 * WITHOUT a `triggers` field in its frontmatter is always loaded in full at the
 * start of every conversation; adding `triggers` turns it into a
 * keyword-triggered skill that loads only when a trigger word appears in a
 * user message.
 *
 * What this validator enforces:
 *
 * 1. Startup inventory (always-loaded contract). The pack ships
 *    list-loaded-skills.md, which must stay trigger-free, and at least one
 *    always-loaded microagent must exist. The failure mode is silent (the
 *    skill inventory simply stops appearing at conversation start), so nothing
 *    else catches it.
 * 2. Triggered microagents must be triggerable and routable. Every
 *    `triggers:`-bearing microagent needs a non-empty trigger list, and every
 *    `skill` it routes to must exist as skills/<name>/SKILL.md — otherwise the
 *    microagent would advertise a workflow that does not exist.
 * 3. Name collisions are forbidden. Microagent frontmatter names must be
 *    unique among themselves and must not shadow or duplicate a skill name in
 *    skills/<name>/SKILL.md: OpenHands resolves name conflicts by precedence
 *    rather than merging, so a collision silently hides one of the two.
 * 4. AGENTS.md coherence. The root AGENTS.md is an OpenCode-flavored intent
 *    map; the triggered microagents must not contradict it. Each triggered
 *    microagent must route to the same skill AGENTS.md maps its lifecycle
 *    phase to (or explicitly declare itself OpenHands-only via a
 *    `microagent:` frontmatter marker).
 *
 * Exit codes: 0 = all clear, 1 = one or more errors
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MICROAGENTS_DIR = path.join(ROOT, '.openhands', 'microagents');
const SKILLS_DIR = path.join(ROOT, 'skills');
const AGENTS_MD = path.join(ROOT, 'AGENTS.md');

// The always-loaded microagent that implements the startup inventory. The name
// is load-bearing: docs/openhands-setup.md and the README document the behavior
// it provides.
const REQUIRED_ALWAYS_LOADED = 'list-loaded-skills.md';

// Lifecycle routing microagents must declare which AGENTS.md phase they cover.
// The value must appear in AGENTS.md's "Lifecycle Mapping" section (or be
// declared microagent-only via the marker below).
const PHASE_FRONTMATTER_KEY = 'phase';
const OPENHANDS_ONLY_MARKER = 'microagent-only: true';

// Content markers that pin the documented startup contract. Deliberately loose:
// the checks guard the contract, not the exact prose.
const REQUIRED_BODY_PATTERNS = [
  { pattern: /skills\//, why: 'must reference the skills/ inventory source' },
  { pattern: /every conversation|conversation start|start of (every|each) conversation/i, why: 'must state when the listing runs (conversation start)' },
];

// ─── Frontmatter parsing ─────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const normalized = content.replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) return { frontmatter: null, body: normalized };
  const end = normalized.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: null, body: normalized };
  return {
    frontmatter: normalized.slice(4, end),
    body: normalized.slice(end + 4),
  };
}

function hasTriggersField(frontmatter) {
  if (frontmatter === null) return false;
  return /^triggers\s*:/m.test(frontmatter);
}

/**
 * Extract the scalar entries of a simple list or map under `key:` from YAML
 * frontmatter. Handles `key:` followed by `- value` list items or indented
 * `subkey: value` map entries. Not a YAML parser — just enough structure for
 * the microagent frontmatter this validator guards.
 */
function extractFrontmatterEntries(frontmatter, key) {
  if (!frontmatter) return [];
  const lines = frontmatter.split('\n');
  const entries = [];
  const keyRe = new RegExp(`^${key}\\s*:`);
  for (let i = 0; i < lines.length; i++) {
    if (!keyRe.test(lines[i])) continue;
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j];
      if (/^\s*-\s*(.+?)\s*$/.test(line)) {
        entries.push(line.replace(/^\s*-\s*/, '').replace(/\s+$/, ''));
      } else if (/^(\s+)([A-Za-z0-9_-]+)\s*:\s*(.+?)\s*$/.test(line)) {
        entries.push(line.trim());
      } else if (line.trim() === '') {
        continue;
      } else {
        break;
      }
      // Stop when the next top-level key starts (non-indented, not a list item).
      if (j + 1 < lines.length && /^\S/.test(lines[j + 1]) && !/^-\s/.test(lines[j + 1])) {
        break;
      }
    }
    break;
  }
  return entries;
}

/** Extract `name:` and `phase:` scalar values from frontmatter. */
function extractScalar(frontmatter, key) {
  if (!frontmatter) return null;
  const match = frontmatter.match(new RegExp(`^${key}\\s*:\\s*(.+?)\\s*$`, 'm'));
  return match ? match[1] : null;
}

// ─── AGENTS.md helpers ───────────────────────────────────────────────────────

/**
 * Parse the "Lifecycle Mapping" section of the root AGENTS.md into a
 * { phase → [skill names] } map. Lines look like:
 *   - DEFINE → `spec-driven-development`
 * The heading may be h2 (## Lifecycle Mapping...) or h3 (### Lifecycle Mapping...);
 * AGENTS.md currently uses h3 under its OpenCode Integration section.
 * Implemented as a line scan: a section regex with the `m` flag would stop at
 * the first blank line (`$` matches at every line end under `m`).
 */
function parseLifecycleMapping(agentsMd) {
  const map = {};
  if (!agentsMd) return map;
  const lines = agentsMd.split(/\r?\n/);
  const headingRe = /^#{2,4} Lifecycle Mapping/;
  const nextHeadingRe = /^#{1,4} /;
  const lineRe = /^-\s*([A-Z][A-Z /]+)\s*(?:→|->)\s*(.+)$/;
  let inSection = false;
  for (const line of lines) {
    if (!inSection) {
      if (headingRe.test(line)) inSection = true;
      continue;
    }
    if (nextHeadingRe.test(line)) break;
    const m = lineRe.exec(line);
    if (!m) continue;
    const phase = m[1].trim();
    const skills = [...m[2].matchAll(/`([a-z0-9-]+)`/g)].map(x => x[1]);
    if (phase && skills.length > 0) map[phase] = skills;
  }
  return map;
}

// ─── Checks ──────────────────────────────────────────────────────────────────

/**
 * Validate the microagents directory.
 * @param {object} deps - injectable dependencies for testing
 * @param {string} deps.microagentsDir - directory containing microagent .md files
 * @param {string} [deps.skillsDir] - directory containing skills/<name>/SKILL.md
 * @param {string} [deps.agentsMd] - contents of the root AGENTS.md
 * @returns {{ errors: string[], checked: number, alwaysLoaded: number, triggered: number, skillNames: Set<string> }}
 */
function validateMicroagents({ microagentsDir, skillsDir, agentsMd }) {
  const errors = [];
  const report = { errors, checked: 0, alwaysLoaded: 0, triggered: 0, skillNames: new Set() };

  if (!fs.existsSync(microagentsDir)) {
    errors.push(`OpenHands microagents directory not found at .openhands/microagents/ — ` +
      `restore .openhands/microagents/ or add at least one always-loaded microagent, e.g. ${REQUIRED_ALWAYS_LOADED}.`);
    return report;
  }

  const files = fs.readdirSync(microagentsDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    errors.push('No microagent .md files found in .openhands/microagents/.');
    return report;
  }

  report.checked = files.length;

  // Available skill names, used for the no-shadowing and existence rules.
  // Both top-level (skills/<name>/SKILL.md) and nested pack layouts
  // (skills/<category>/<name>/SKILL.md, e.g. solana-protocols/) are indexed;
  // nested entries are stored as "<category>/<name>" and their bare name is
  // registered for the shadowing check only when unambiguous.
  if (skillsDir && fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir)) {
      const entryPath = path.join(skillsDir, entry);
      if (!fs.statSync(entryPath).isDirectory()) continue;
      if (fs.existsSync(path.join(entryPath, 'SKILL.md'))) {
        report.skillNames.add(entry);
        continue;
      }
      // Nested category directory: index each child as "<category>/<child>".
      for (const child of fs.readdirSync(entryPath)) {
        if (fs.existsSync(path.join(entryPath, child, 'SKILL.md'))) {
          report.skillNames.add(`${entry}/${child}`);
        }
      }
    }
  }

  const lifecycle = parseLifecycleMapping(agentsMd || '');

  let requiredFileSeen = false;
  const seenMicroagentNames = new Map(); // name -> file
  const seenSkillNames = new Map();      // name -> file

  for (const file of files) {
    const content = fs.readFileSync(path.join(microagentsDir, file), 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const triggered = hasTriggersField(frontmatter);

    if (file === REQUIRED_ALWAYS_LOADED) requiredFileSeen = true;

    // The startup inventory must never become a keyword skill: report it as
    // its own error before the generic triggered checks, so the message points
    // at the exact fix.
    if (triggered && file === REQUIRED_ALWAYS_LOADED) {
      errors.push(`${file} declares a triggers field, which makes it keyword-triggered. ` +
        'The startup inventory must be ALWAYS loaded: remove triggers from its frontmatter.');
      continue;
    }

    // Name-uniqueness checks apply regardless of trigger state.
    const name = extractScalar(frontmatter, 'name');
    if (name) {
      if (seenMicroagentNames.has(name)) {
        errors.push(`Duplicate microagent frontmatter name "${name}" in ${file} and ${seenMicroagentNames.get(name)}. ` +
          'OpenHands resolves name conflicts by precedence, not merging.');
      } else {
        seenMicroagentNames.set(name, file);
      }
      if (report.skillNames.has(name)) {
        errors.push(`Microagent ${file} declares name "${name}" which duplicates skill directory skills/${name}/. ` +
          'OpenHands resolves name conflicts by precedence, not merging; pick a distinct name.');
      } else {
        seenSkillNames.set(name, file);
      }
    }

    if (!triggered) {
      report.alwaysLoaded++;
      if (file === REQUIRED_ALWAYS_LOADED) {
        for (const { pattern, why } of REQUIRED_BODY_PATTERNS) {
          if (!pattern.test(body)) {
            errors.push(`${file} ${why}.`);
          }
        }
        if (!body.trim()) {
          errors.push(`${file} has an empty body.`);
        }
      }
      continue;
    }

    // Keyword-triggered microagent: triggers list and routing must hold.
    report.triggered++;

    const triggerValues = extractFrontmatterEntries(frontmatter, 'triggers');
    if (triggerValues.length === 0) {
      errors.push(`${file} declares a triggers field with no entries. ` +
        'Remove the field (always-loaded) or list at least one trigger word.');
    }
    for (const trigger of triggerValues) {
      if (/[^a-z0-9 -]/i.test(trigger)) {
        errors.push(`${file} has non-alphanumeric trigger "${trigger}". Trigger words must be plain words.`);
      }
      if (trigger.length > 32) {
        errors.push(`Trigger "${trigger}" in ${file} is longer than 32 characters.`);
      }
    }

    const phase = extractScalar(frontmatter, PHASE_FRONTMATTER_KEY);
    const isMicroagentOnly = (extractScalar(frontmatter, 'microagent-only') || '').toLowerCase() === 'true';

    const routedSkills = [...body.matchAll(/skills\/([a-z0-9/-]+)\/SKILL\.md/g)]
      .map(m => m[1].replace(/\/+$/, ''));
    const routedUnique = [...new Set(routedSkills)];

    if (routedUnique.length === 0) {
      errors.push(`${file} is triggered but routes to no skill. Add a reference to skills/<name>/SKILL.md in its body.`);
    }

    for (const skill of routedUnique) {
      if (report.skillNames.size > 0 && !report.skillNames.has(skill)) {
        errors.push(`${file} routes to skills/${skill}/SKILL.md, which does not exist.`);
      }
    }

    if (isMicroagentOnly) {
      continue;
    }

    if (!phase) {
      errors.push(`${file} is missing a "${PHASE_FRONTMATTER_KEY}:" frontmatter field. ` +
        'Declare the AGENTS.md lifecycle phase it covers, or set "microagent-only: true".');
      continue;
    }

    const mapped = lifecycle[phase];
    if (!mapped) {
      errors.push(`${file} declares phase "${phase}", which AGENTS.md's "Lifecycle Mapping" section does not define.`);
      continue;
    }

    if (routedUnique.length === 0 || !routedUnique.some(s => mapped.includes(s))) {
      errors.push(`${file} (phase ${phase}) routes to [${routedUnique.join(', ') || 'none'}] but AGENTS.md maps ${phase} to [${mapped.join(', ')}]. ` +
        'The triggered microagent must route to a skill from its AGENTS.md lifecycle phase.');
    }
  }

  if (!requiredFileSeen) {
    errors.push(`${REQUIRED_ALWAYS_LOADED} is missing from .openhands/microagents/ — ` +
      'the startup skill inventory would no longer be printed at conversation start.');
  }

  if (report.alwaysLoaded === 0) {
    errors.push('No always-loaded microagent found (every file declares triggers). ' +
      'At least one microagent must load without triggers.');
  }

  return report;
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('Checking OpenHands microagents...\n');

  const { errors, checked, alwaysLoaded, triggered } = validateMicroagents({
    microagentsDir: MICROAGENTS_DIR,
    skillsDir: SKILLS_DIR,
    agentsMd: fs.existsSync(AGENTS_MD) ? fs.readFileSync(AGENTS_MD, 'utf8') : null,
  });

  if (errors.length > 0) {
    for (const err of errors) console.error(`  ERROR: ${err}`);
    console.error(`\n${checked} microagents checked — ${errors.length} error(s) — FAILED`);
    process.exit(1);
  }

  console.log(`  ✓ ${checked} microagents checked (${alwaysLoaded} always-loaded, ${triggered} keyword-triggered) — PASSED`);
}

module.exports = {
  parseFrontmatter,
  hasTriggersField,
  extractFrontmatterEntries,
  extractScalar,
  parseLifecycleMapping,
  validateMicroagents,
  REQUIRED_ALWAYS_LOADED,
  PHASE_FRONTMATTER_KEY,
  OPENHANDS_ONLY_MARKER,
};

if (require.main === module) {
  main();
}
