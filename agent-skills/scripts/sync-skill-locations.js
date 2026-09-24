#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/sync-skill-locations.js — propage le repo vers les emplacements
// d'installation, en respectant les conventions de chaque hôte.
//
//   node scripts/sync-skill-locations.js            # plan (aucune écriture)
//   node scripts/sync-skill-locations.js apply      # exécute le plan
//   node scripts/sync-skill-locations.js --loc claude [apply]
//
// Actions par emplacement (jamais les « extras », jamais les sources partielles) :
//   • skill manquant  → copie du dossier complet du repo (SKILL.md + references/)
//   • skill en drift  → recopie du dossier (répare les vieilles copies CRLF…)
//   • agent manquant  → agent-<nom>/SKILL.md converti (description verbatim du
//                        repo, name/triggers régénérés — voir lib.convertAgentMd)
//   • agent en drift  → seule la ligne description: est réalignée sur le repo
//
// Conventions d'hôte : les agents ne sont installés QUE dans les emplacements
// qui en ont déjà (hub = skills seuls). Forcer partout : --with-agents.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const fs = require('fs');
const path = require('path');
const { REPO, LOCS, collectRepo, auditLocation, convertAgentMd } = require('./lib/skill-locations');

const args = process.argv.slice(2);
const doApply = args.includes('apply');
const withAgents = args.includes('--with-agents');
const locIdx = args.indexOf('--loc');
const onlyId = locIdx >= 0 ? args[locIdx + 1] : null;
if (onlyId && !LOCS.some((l) => l.id === onlyId)) {
  console.error(`Emplacement inconnu : ${onlyId} (attendus : ${LOCS.map((l) => l.id).join(', ')})`);
  process.exit(2);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name === '.DS_Store') continue;
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
const relignDescription = (installedPath, repoText) => {
  const m = /^description:[ \t]*(.*)$/m.exec(repoText);
  const description = m ? m[1].trim() : null;
  if (description === null) return false;
  const txt = fs.readFileSync(installedPath, 'utf8');
  if (!/^description:/m.test(txt)) return false;
  fs.writeFileSync(installedPath, txt.replace(/^description:[ \t]*.*$/m, `description: ${description}`));
  return true;
};

// ── Plan ────────────────────────────────────────────────────────────────────
const repo = collectRepo();
const locs = onlyId ? LOCS.filter((l) => l.id === onlyId) : LOCS;
const plan = [];
let totals = { skillCopy: 0, agentCreate: 0, agentFix: 0 };

for (const loc of locs) {
  if (loc.partial) continue; // sources partielles : jamais de propagation
  // Dossier absent = cible vierge (premier déploiement) : on l'initialise.
  if (!fs.existsSync(loc.dir)) {
    if (!doApply) { console.log(`── ${loc.id} (${loc.dir})\n   (dossier absent — sera créé) `); continue; }
    fs.mkdirSync(loc.dir, { recursive: true });
    console.log(`• ${loc.id} : dossier initialisé (${loc.dir})`);
  }
  const a = auditLocation(loc, repo);
  const installAgents = withAgents || (loc.mode === 'mixed' && a.agents.present > 0);
  const actions = [];
  for (const name of a.skills.missing) {
    const relDir = repo.skills.get(name).relDir;
    actions.push({ kind: 'skill-copy', name, src: path.join(REPO, relDir), dest: path.join(loc.dir, name) });
  }
  for (const name of a.skills.drift) {
    const relDir = repo.skills.get(name).relDir;
    actions.push({ kind: 'skill-copy', name, src: path.join(REPO, relDir), dest: path.join(loc.dir, name), drift: true });
  }
  if (installAgents) {
    for (const name of a.agents.missing) {
      actions.push({ kind: 'agent-create', name, src: path.join(REPO, repo.agents.get(name)), dest: path.join(loc.dir, `agent-${name}`) });
    }
    for (const name of a.agents.drift) {
      actions.push({ kind: 'agent-fix', name, src: path.join(REPO, repo.agents.get(name)), dest: path.join(loc.dir, `agent-${name}`) });
    }
  }
  if (actions.length) plan.push({ loc, actions, agentsSkipped: !installAgents });
  totals.skillCopy += actions.filter((x) => x.kind === 'skill-copy').length;
  totals.agentCreate += actions.filter((x) => x.kind === 'agent-create').length;
  totals.agentFix += actions.filter((x) => x.kind === 'agent-fix').length;
}

// ── Rendu du plan ───────────────────────────────────────────────────────────
if (!plan.length) { console.log('✅ Rien à propager — tous les emplacements synchronisables sont à jour.'); process.exit(0); }
for (const { loc, actions, agentsSkipped } of plan) {
  const miss = actions.filter((x) => x.kind === 'skill-copy' && !x.drift).length;
  const drift = actions.filter((x) => x.kind === 'skill-copy' && x.drift).length;
  const agNew = actions.filter((x) => x.kind === 'agent-create').length;
  const agFix = actions.filter((x) => x.kind === 'agent-fix').length;
  console.log(`── ${loc.id} (${loc.dir})`);
  console.log(`   ${miss} skill(s) à installer · ${drift} à réparer · ${agNew} agent(s) à créer · ${agFix} à réaligner${agentsSkipped ? ' · agents ignorés (convention hôte : skills seuls)' : ''}`);
  for (const x of actions.slice(0, 5)) console.log(`   • ${x.drift ? '↻' : '+'} ${x.kind === 'skill-copy' ? x.name : 'agent-' + x.name}${x.drift ? ' (drift)' : ''}`);
  if (actions.length > 5) console.log(`   … +${actions.length - 5} autres`);
}
console.log(doApply ? '▶ Application…' : `ℹ️  Plan : ${totals.skillCopy} skill(s), ${totals.agentCreate} agent(s) à créer, ${totals.agentFix} à réaligner — relance avec « apply » pour exécuter.`);
if (!doApply) process.exit(0);

// ── Application ─────────────────────────────────────────────────────────────
let done = { skillCopy: 0, agentCreate: 0, agentFix: 0, errors: 0 };
for (const { loc, actions } of plan) {
  for (const x of actions) {
    try {
      if (x.kind === 'skill-copy') {
        copyDir(x.src, x.dest);
        done.skillCopy++;
      } else if (x.kind === 'agent-create') {
        fs.mkdirSync(x.dest, { recursive: true });
        fs.writeFileSync(path.join(x.dest, 'SKILL.md'), convertAgentMd(fs.readFileSync(x.src, 'utf8'), x.name));
        done.agentCreate++;
      } else if (x.kind === 'agent-fix') {
        const target = path.join(x.dest, 'SKILL.md');
        if (!relignDescription(target, fs.readFileSync(x.src, 'utf8'))) {
          fs.writeFileSync(target, convertAgentMd(fs.readFileSync(x.src, 'utf8'), x.name));
        }
        done.agentFix++;
      }
    } catch (e) {
      done.errors++;
      console.error(`   ✗ ${loc.id}/${path.basename(x.dest)} : ${e.message}`);
    }
  }
  console.log(`   ✓ ${loc.id} : ${actions.length} action(s)`);
}
console.log(`✅ Terminé : ${done.skillCopy} skill(s) copié(s), ${done.agentCreate} agent(s) créé(s), ${done.agentFix} réaligné(s)${done.errors ? `, ${done.errors} ERREUR(S)` : ''}.`);

// Vérification post-sync : ré-audit des emplacements touchés
console.log('\n── Audit post-sync ──');
for (const { loc } of plan) {
  const a = auditLocation(loc, repo);
  console.log(`   ${loc.id} : skills ${a.skills.present}/${repo.skills.size} (drift ${a.skills.drift.length})` +
    (loc.mode === 'mixed' && a.agents.present ? ` · agents ${a.agents.present}/${repo.agents.size} (drift ${a.agents.drift.length})` : ''));
}
