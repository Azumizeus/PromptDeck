#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/audit-skill-locations.js — audit des emplacements de skills/agents
//
// Compare 6 emplacements d'installation au repo (source de vérité) et signale :
//   • la couverture : skills/agents du repo présents dans l'emplacement
//   • les manquants : présents dans le repo, absents de l'emplacement
//   • le drift      : présents mais au contenu différent (sha256 du SKILL.md ;
//                     agents convertis : comparaison de la description)
//   • les extras    : installés mais inconnus du repo
//
// Usage :
//   node scripts/audit-skill-locations.js           # rapport lisible
//   node scripts/audit-skill-locations.js --json    # sortie machine
//   node scripts/audit-skill-locations.js --loc hub # un seul emplacement
//
// Modèle partagé avec scripts/sync-skill-locations.js : scripts/lib/skill-locations.js
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const { LOCS, collectRepo, auditLocation } = require('./lib/skill-locations');

const fmtList = (a, n = 8) => a.length <= n ? a.join(', ') : a.slice(0, n).join(', ') + ` … (+${a.length - n})`;
const locMode = (id) => (LOCS.find((l) => l.id === id) || {}).mode;

function report(repo, results) {
  const totalSkills = repo.skills.size, totalAgents = repo.agents.size;
  const lines = [];
  lines.push(`📦 Référentiel repo : ${repo.skills.size + repo.collisions.length} SKILL.md (${totalSkills} noms uniques${repo.collisions.length ? ` — collisions de basename : ${repo.collisions.join(', ')}` : ''}) · ${totalAgents} agents`);
  lines.push('');
  for (const r of results) {
    const loc = LOCS.find((l) => l.id === r.id);
    lines.push(`── ${r.id} — ${r.label}`);
    if (!r.exists) { lines.push(`   ⚠️  introuvable : ${r.dir}`); lines.push(''); continue; }
    const sc = r.skills, ac = r.agents;
    const pct = (n, d) => d ? `${String(n).padStart(3)}/${d}` : '  0/0';
    lines.push(`   skills : ${pct(sc.present, totalSkills)} présents · ${sc.missing.length} manquants · ${sc.drift.length} en drift`);
    if (locMode(r.id) === 'mixed') lines.push(`   agents : ${pct(ac.present, totalAgents)} présents · ${ac.missing.length} manquants · ${ac.drift.length} en drift`);
    if (sc.drift.length) lines.push(`   ⚠️  skills en drift : ${fmtList(sc.drift)}`);
    if (locMode(r.id) === 'mixed' && ac.drift.length) lines.push(`   ⚠️  agents en drift : ${fmtList(ac.drift)}`);
    if (!loc.partial && sc.missing.length) lines.push(`   ➖ manquants : ${fmtList(sc.missing)}`);
    if (locMode(r.id) === 'mixed' && ac.missing.length && !loc.partial) lines.push(`   ➖ agents manquants : ${r.agents.missing.length === totalAgents ? `aucun installé (${totalAgents} attendus)` : fmtList(ac.missing)}`);
    if (r.extras.length) lines.push(`   ➕ hors repo : ${fmtList(r.extras)}`);
    lines.push('');
  }
  return lines.join('\n');
}

// ── Main ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const jsonOut = args.includes('--json');
const onlyIdx = args.indexOf('--loc');
const onlyId = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

const repo = collectRepo();
const locs = onlyId ? LOCS.filter((l) => l.id === onlyId) : LOCS;
if (onlyId && !locs.length) { console.error(`Emplacement inconnu : ${onlyId} (attendus : ${LOCS.map((l) => l.id).join(', ')})`); process.exit(2); }
const results = locs.map((l) => auditLocation(l, repo));

if (jsonOut) {
  console.log(JSON.stringify({ repo: { skills: repo.skills.size, agents: repo.agents.size }, locations: results }, null, 2));
} else {
  console.log(report(repo, results));
  // Synthèse actionnable
  const syncable = results.filter((r) => r.exists && !LOCS.find((l) => l.id === r.id).partial);
  // Seuls les emplacements « mixed » sont censés contenir des agents —
  // ne pas pénaliser les emplacements skills-only avec les 190 agents manquants.
  const gap = (r) => r.skills.missing.length + (locMode(r.id) === 'mixed' ? r.agents.missing.length : 0);
  const worst = [...syncable].sort((a, b) => gap(b) - gap(a))[0];
  const drifted = results.reduce((n, r) => n + r.skills.drift.length + r.agents.drift.length, 0);
  console.log('─'.repeat(60));
  console.log(`Résumé : ${drifted} fichier(s) en drift de contenu.`);
  if (worst && gap(worst) > 0) {
    console.log(`Emplacement le moins à jour : ${worst.id} (${worst.skills.missing.length} skills${locMode(worst.id) === 'mixed' ? ` + ${worst.agents.missing.length} agents` : ''} manquants).`);
  } else {
    console.log('Tous les emplacements synchronisables sont à jour du repo.');
  }
}
