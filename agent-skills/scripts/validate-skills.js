#!/usr/bin/env node
/**
 * validate-skills.js
 *
 * CLI that validates every skill in skills/ against the rules in
 * docs/skill-anatomy.md. The rules themselves live in scripts/lib/skill-lint.js
 * (a single source of truth, importable and unit-testable); this file is a thin
 * wrapper that walks the skills directory, runs the linter, prints the report,
 * and sets the exit code. Skills live at skills/<name>/ or under a category
 * folder, skills/<category>/<name>/ (imported collections).
 *
 * Exit codes: 0 = all clear, 1 = one or more errors
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const { lintSkillDir, discoverSkills } = require('./lib/skill-lint');

const SKILLS_DIR = path.resolve(__dirname, '..', 'skills');

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`ERROR: skills directory not found at ${SKILLS_DIR}`);
    process.exit(1);
  }

  const skills = discoverSkills(SKILLS_DIR).sort((a, b) => a.name.localeCompare(b.name));

  const knownSkills = new Set(skills.map(s => s.name));

  let totalErrors   = 0;
  let totalWarnings = 0;

  for (const skill of skills) {
    const { errors, warnings, exempt } = lintSkillDir(skill.dir, knownSkills);
    // Skills sous un dossier-catégorie (skills/<category>/<name>/) = collections
    // importées (game-design, lightprotocol-skills, solana-* …) : elles suivent
    // leur propre format, pas skill-anatomy.md. Leurs écarts sont signalés en
    // avertissements (non bloquants) ; le cœur du plugin (skills/<name>/)
    // reste validé strictement.
    const imported = path.relative(SKILLS_DIR, skill.dir).includes(path.sep);
    const shownErrors   = imported ? [] : errors;
    const shownWarnings = imported ? errors.map(e => `[imported] ${e}`).concat(warnings) : warnings;
    totalErrors   += shownErrors.length;
    totalWarnings += shownWarnings.length;

    if (errors.length === 0 && warnings.length === 0) {
      const tag = exempt ? ' (section checks exempt)' : '';
      console.log(`  ✓  ${skill.name}${tag}`);
    } else {
      const icon = errors.length > 0 ? '  ✗ ' : '  ⚠ ';
      console.log(`${icon} ${skill.name}${imported ? ' (imported)' : ''}`);
      for (const msg of shownErrors)   console.log(`       ERROR: ${msg}`);
      for (const msg of shownWarnings) console.log(`       WARN:  ${msg}`);
    }
  }

  const status = totalErrors > 0 ? 'FAILED' : totalWarnings > 0 ? 'PASSED WITH WARNINGS' : 'PASSED';
  console.log(`\n${skills.length} skills checked — ${totalErrors} error(s), ${totalWarnings} warning(s) — ${status}`);

  if (totalErrors > 0) process.exit(1);
}

// Surface unexpected failures (fs errors, bad symlinks, …) as a structured
// one-line CI error instead of an uncaught stack trace.
try {
  main();
} catch (err) {
  console.error(`\nERROR: validate-skills failed unexpectedly: ${err.message}`);
  process.exit(1);
}
