// ══════════════════════════════════════════════════════════════════════════
//  MEGA PACK — Édition Luxe · renderer
//  Une liste sobre, noire, instantanée. Compréhensible en 3 secondes :
//  on cherche, on lit, on tire le prompt. Rien d'autre.
//
//  Raccourcis : ↑↓ naviguer · ⏎ copier · ⌘⏎ ouvrir (LLM par défaut) ·
//  ⇧⏎ ChatGPT · ⌥⏎ composer la sélection (⌘-clic) · ★ favori · ⌘, réglages
// ══════════════════════════════════════════════════════════════════════════

'use strict';

// ---------- Langue ----------
const LANG = (window.mgp.getPrefs() || {}).lang === 'en' ? 'en' : 'fr';
const T = LANG === 'fr' ? {
  ph: 'Rechercher un skill, un agent, un prompt…', all: 'Tout', skills: 'Skills',
  agents: 'Agents', perso: '✍️ Perso', favs: '★ Favoris', results: 'résultats',
  copy: '⧉ Copier', open: '⌘⏎ Ouvrir dans {x}', gpt: '⇧⏎ ChatGPT',
  empty: 'Aucun résultat — essaie un autre mot', recents: '🕘 Récents',
  noTeams: '🕸 Aucune équipe — ouvre 🛠 Atelier → « 🕸 Une équipe », décris une mission puis génère.',
  selected: 'sél.', compose: '✚ Composer ({n})', newp: 'Nouveau prompt ✍️',
  noFav: (n) => `Pas de favori n°${n}`, hello: 'Bonjour ! Voici mon besoin : ',
  selHint: '⌘-clic pour sélectionner · ⌥⏎ compose les {n} sélectionnés',
  tipSkill: 'SKILL — active une procédure expertise. Clic : copie le prompt · clic droit : envoyer.',
  tipAgent: 'AGENT — adopte un persona expert. Clic : copie le prompt · clic droit : envoyer.',
  tipCustom: 'PROMPT PERSO — ton texte est envoyé tel quel. Clic : copie · clic droit : envoyer.',
  tipFav: '★ Favori — ⌘{n} le lance depuis le menu ⚡',
  tipTeam: '🕸 ÉQUIPE — super-orchestrateur + agents + workflow. Clic : copie le protocole · clic droit : envoyer.',
  sendTo: 'Envoyer à',
  copyPrompt: '⧉ Copier le prompt',
  favAdd: '★ Ajouter aux favoris', favDel: '☆ Retirer des favoris',
  mdCreate: '📄 Créer le fichier .md',
  mdCreated: (p) => `📄 Créé : ${p}`,
  mdErr: 'Échec fichier .md',
  tipCat: 'Catégorie',
  treeHead: '📁 Arborescence MEGA PROMPT',
  treeLoading: 'Chargement…',
  treeEmpty: 'Dossier vide — 📄 Créer le .md ici, ou Réglages → 🔄 Générer tous les .md',
  treeErr: 'Arborescence indisponible',
  treeOpenDir: 'Ouvrir ce dossier',
  treeOpenMd: 'Ouvrir ce fichier .md dans l\'éditeur',
  atelier: 'Atelier',
  atelierT: '🛠 Atelier — créer un agent ou un skill',
  atelierKind: 'Je crée', atelierKindA: '👤 Un agent (persona expert)', atelierKindS: '🛠 Un skill (procédure)',
  atelierIntent: "Ce qu'il doit faire — décris librement, aussi long que tu veux", atelierIntentPh: 'Ex : un agent senior qui supervise la revue de code, coordonne les experts sécurité et perf, rend un rapport priorisé… plus tu es précis (contexte, contraintes, format attendu, exemples), meilleur sera le résultat — aucun maximum.',
  atelierSenior: 'Niveau senior orchestrateur (supervise, coordonne, garantit la qualité)',
  atelierGen: "✨ Générer avec l'IA",
  atelierGenApi: 'Générer (API)',
  atelierSaving: 'Enregistrer',
  atelierList: 'Mes créations',
  atelierEmpty: 'Aucune création — décris un besoin puis génère.',
  atelierSending: 'Génération en cours…',
  atelierDone: (m, l) => `✓ Généré en ${(l / 1000).toFixed(1)} s · ${m || 'LLM'}`,
  atelierErr: 'Échec',
  atelierNeedApi: "Ajoute une clé API dans Réglages → Intelligence (ou variable d'environnement).",
  atelierDel: 'Supprimer', atelierExp: 'Exporter .md',
  agentOf: 'Système', skillOf: 'Procédure',
  needIntent: "Décris d'abord ce que la création doit faire.",
  llm: 'LLM',
  llmSelT: 'Choisir le LLM par défaut — ⌘⏎ l\'ouvre, clic droit envoie vers un autre',
  llm: 'LLM',
  llmApi: '🔑 API',
  llmApiNoKey: 'Aucune clé API — Réglages → Intelligence pour en ajouter une',
  llmChanged: (n) => `⌘⏎ ouvrira ${n}`,
  wKindT: '🕸 Une équipe (orchestrateur + agents)',
  wTeamOrch: 'Super-orchestrateur',
  wTeamAgents: 'Agents',
  wTeamWf: 'Workflow',
  wTeamDeliv: 'Livrable',
  wTeamSaved: '🕸 Équipe enregistrée — visible dans « 🕸 Équipes »',
  wProvider: 'Fournisseur', wModel: 'Modèle (vide = conseillé)',
  wUseSaved: 'Utiliser pour toutes les générations',
  wRun: '▶ Exécuter la mission',
  wRunT: 'Envoie la mission à l\'orchestrateur puis aux agents via l\'API, et consolide le rapport',
  wRunList: 'Équipes prêtes à exécuter',
  wRunEmpty: 'Aucune équipe — génère-en une puis reviens ici.',
  wRunBtn: (n) => `▶ Exécuter (${n} agent${n > 1 ? 's' : ''})`,
  wRunRunning: '⏳ Mission en cours…',
  wRunDone: (l) => `✓ Mission exécutée en ${(l / 1000).toFixed(1)} s`,
  wRunErr: 'Échec de la mission',
  wRunNeedApi: 'Ajoute une clé API dans Réglages → Intelligence pour exécuter des missions.',
  wRep: 'Rapport de mission',
  wRepFinal: 'Rapport final consolidé',
  wRepCopy: '⧉ Copier le rapport',
  wRepMd: '📄 Enregistrer le rapport',
  wRepSaved: (p) => `📄 Rapport enregistré : ${p}`,
  tourWelcome: '👋 Bienvenue dans MEGA PACK ! 30 secondes pour tout comprendre ?',
  tourSkip: 'Passer la visite', tourNext: 'Suivant →', tourDone: 'Terminer',
  tourEnd: 'Clic droit sur un expert pour l\'envoyer vers un LLM, et 🛠 Atelier pour créer agents, skills et équipes. Bonne exploration ! ⚡',
  teamsFilter: '🕸 Équipes',
  // ✏️ Gestion (édition + 🔒 cadenas) — clic droit partout, Atelier inclus
  manageSec: 'Gestion',
  editItem: '✏️ Modifier',
  lockItem: '🔒 Verrouiller (anti-suppression)',
  unlockItem: '🔓 Retirer le cadenas',
  copyToWorkshop: '🛠 Copier dans l\'Atelier (copie modifiable)',
  editAgentT: '✏️ Modifier l\'agent',
  editSkillT: '✏️ Modifier le skill',
  efName: 'Nom',
  efDesc: 'Description',
  efSystem: 'Prompt système',
  efBody: 'Procédure (SKILL.md)',
  efSkills: 'Compétences (séparées par des virgules)',
  efTools: 'Outils (séparés par des virgules)',
  efRules: 'Règles (une par ligne)',
  efInputs: 'Entrées (séparées par des virgules)',
  efChecks: 'Vérifications (une par ligne)',
  efSave: 'Enregistrer',
  efCancel: 'Annuler',
  edSaved: (n) => `✏️ ${n} — modifications enregistrées`,
  edErr: (m) => `✏️ Échec de l\'enregistrement — ${m}`,
  edExists: 'Ce nom existe déjà',
  lockedOn: (n) => `🔒 ${n} est protégé — il ne peut plus être supprimé`,
  lockedOff: (n) => `🔓 ${n} n\'est plus verrouillé`,
  lockBadge: '🔒',
  lockBadgeT: 'Verrouillé — suppression impossible (clic droit pour retirer)',
  delLocked: '🔒 Suppression impossible — cet élément est verrouillé (clic droit → retirer le cadenas).',
  copiedToWs: (k) => `🛠 Copie créée dans l\'Atelier (${k}) — clic droit → Modifier pour l\'ajuster.`,
  copiedToWsErr: 'Échec de la copie vers l\'Atelier',
  // 🗑 Corbeille
  trashT: '🗑 Corbeille',
  trashBtn: '🗑',
  trashEmptyMsg: 'Corbeille vide — rien à restaurer.',
  trashHint: 'Les éléments supprimés restent restaurables ici (60 maximum, les plus anciens sont retirés).',
  trashRestore: '♻️ Restaurer',
  trashDelete: '✕ Supprimer définitivement',
  trashEmptyAll: 'Vider la corbeille',
  trashClose: 'Fermer',
  trashRestored: (n, k) => `♻️ ${n} restauré (${k})`,
  trashDeleted: '✕ Supprimé définitivement',
  trashEmptied: '🗑 Corbeille vidée',
  trashErr: '🗑 Action corbeille impossible',
  trashKind: (k) => k === 'agent' ? 'agent' : k === 'skill' ? 'skill' : k === 'team' ? 'équipe' : 'prompt ✍️',
  // ✏️ Édition équipe
  editTeamT: '✏️ Modifier l\'équipe',
  etOrch: 'Orchestrateur — nom',
  etOrchSys: 'Orchestrateur — prompt système',
  etAgents: 'Agents (un par ligne : nom | rôle | description | prompt système)',
  etWf: 'Workflow (une étape par ligne)',
  etAgentBad: 'Ligne agent invalide (format : nom | rôle | description | prompt)',
  etSavedT: (n) => `✏️ Équipe « ${n} » modifiée`,
  // 🔒 Filtre
  lockFilterT: 'Afficher uniquement les éléments verrouillés',
  // 💾 Sauvegarde portable
  backupT: '💾 Sauvegarde (cadenas + corbeille + ateliers)',
  backupSave: '💾 Sauvegarder',
  backupLoad: '📥 Restaurer une sauvegarde',
  backupSaved: '💾 Sauvegarde enregistrée',
  backupRestored: (n, t) => `📥 Restauration : ${n} élément(s), ${t} entrée(s) de corbeille`,
  backupErr: '💾 Sauvegarde impossible',
  backupBad: '💾 Fichier de sauvegarde invalide',
  // 🕘 Historique
  histT: '🕘 Historique des modifications',
  histEmpty: 'Aucune modification enregistrée — l\'historique démarre à ta première édition.',
  histRow: (n, d) => `${n} champ${n > 1 ? 's' : ''} modifié${n > 1 ? 's' : ''} · ${d}`,
  histShow: '🕘 Historique',
  histHide: 'Masquer l\'historique',
  // 📋 Modèles d'équipes
  tplBtn: '📋 Modèles',
  tplT: '📋 Modèles d\'équipes prêts à l\'emploi',
  tplHint: 'Créés comme équipes ordinaires : éditables, supprimables, cadenassables.',
  tplCode: '🔍 Revue de code',
  tplCodeD: 'Analyste + sécurité + performance → rapport priorisé',
  tplVeille: '📰 Veille',
  tplVeilleD: 'Collecte + synthèse → briefing actionnable',
  tplSupport: '🎧 Support',
  tplSupportD: 'Qualification + diagnostic → réponse client prête',
  tplCreated: (n) => `📋 Équipe « ${n} » créée — modifie-la via ✏️`,
  tplLaunch: '🚀 Lancement produit',
  tplLaunchD: 'Roadmap → com → checklist de mise en ligne',
  // ⏪ Restaurer cette version
  restoreBtn: '⏪',
  restoreT: 'Restaurer cette version',
  restoreDone: (f) => `⏪ Version restaurée (${f} champ${f > 1 ? 's' : ''} reverti${f > 1 ? 's' : ''})`,
  restoreErr: '⏪ Restauration impossible',
  // 💾 Auto-backup hebdo
  autoBkOn: (d) => `💾 Sauvegarde auto hebdomadaire active — dossier : ${d}`,
} : {
  ph: 'Search a skill, an agent, a prompt…', all: 'All', skills: 'Skills',
  agents: 'Agents', perso: '✍️ Custom', favs: '★ Favorites', results: 'results',
  copy: '⧉ Copy', open: '⌘⏎ Open in {x}', gpt: '⇧⏎ ChatGPT',
  empty: 'No results — try another word', recents: '🕘 Recent',
  noTeams: '🕸 No team yet — open 🛠 Workshop → “🕸 A team”, describe a mission, then generate.',
  selected: 'sel.', compose: '✚ Compose ({n})', newp: 'New prompt ✍️',
  noFav: (n) => `No favorite #${n}`, hello: 'Hello! Here is my need: ',
  selHint: '⌘-click to select · ⌥⏎ composes the {n} selected',
  tipSkill: 'SKILL — activates an expertise procedure. Click: copy prompt · right-click: send.',
  tipAgent: 'AGENT — adopts an expert persona. Click: copy prompt · right-click: send.',
  tipCustom: 'CUSTOM PROMPT — your text is sent as-is. Click: copy · right-click: send.',
  tipFav: '★ Favorite — ⌘{n} launches it from the ⚡ menu',
  tipTeam: '🕸 TEAM — super-orchestrator + agents + workflow. Click: copy the protocol · right-click: send.',
  sendTo: 'Send to',
  copyPrompt: '⧉ Copy prompt',
  favAdd: '★ Add to favorites', favDel: '☆ Remove from favorites',
  mdCreate: '📄 Create the .md file',
  mdCreated: (p) => `📄 Created: ${p}`,
  mdErr: 'Failed to create .md',
  tipCat: 'Category',
  treeHead: '📁 MEGA PROMPT tree',
  treeLoading: 'Loading…',
  treeEmpty: 'Empty folder — 📄 Create the .md here, or Settings → 🔄 Generate all .md',
  treeErr: 'Tree unavailable',
  treeOpenDir: 'Open this folder',
  treeOpenMd: 'Open this .md file in the editor',
  atelier: 'Workshop',
  atelierT: '🛠 Workshop — build an agent or a skill',
  atelierKind: 'I am building', atelierKindA: '👤 An agent (expert persona)', atelierKindS: '🛠 A skill (procedure)',
  atelierIntent: 'What it should do — describe freely, as long as you like', atelierIntentPh: 'E.g.: a senior agent supervising code review, coordinating security and perf experts, delivering a prioritized report… the more precise (context, constraints, expected format, examples), the better — no limit.',
  atelierSenior: 'Senior orchestrator level (supervises, coordinates, owns quality)',
  atelierGen: '✨ Generate with AI',
  atelierGenApi: 'Generate (API)',
  atelierSaving: 'Save',
  atelierList: 'My creations',
  atelierEmpty: 'No creation yet — describe a need then generate.',
  atelierSending: 'Generating…',
  atelierDone: (m, l) => `✓ Generated in ${(l / 1000).toFixed(1)} s · ${m || 'LLM'}`,
  atelierErr: 'Failed',
  atelierNeedApi: 'Add an API key in Settings → Intelligence (or an environment variable).',
  atelierDel: 'Delete', atelierExp: 'Export .md',
  agentOf: 'System', skillOf: 'Procedure',
  needIntent: 'Describe first what your creation should do.',
  llm: 'LLM',
  llmSelT: 'Choose the default LLM — ⌘⏎ opens it, right-click sends to another one',
  llmApi: '🔑 API',
  llmApiNoKey: 'No API key — Settings → Intelligence to add one',
  llmChanged: (n) => `⌘⏎ will open ${n}`,
  wKindT: '🕸 A team (orchestrator + agents)',
  wTeamOrch: 'Super-orchestrator',
  wTeamAgents: 'Agents',
  wTeamWf: 'Workflow',
  wTeamDeliv: 'Deliverable',
  wTeamSaved: '🕸 Team saved — visible under « 🕸 Teams »',
  wProvider: 'Provider', wModel: 'Model (empty = suggested)',
  wUseSaved: 'Use for all generations',
  wRun: '▶ Run the mission',
  wRunT: 'Sends the mission to the orchestrator then to the agents via the API, and consolidates the report',
  wRunList: 'Teams ready to run',
  wRunEmpty: 'No team yet — generate one then come back here.',
  wRunBtn: (n) => `▶ Run (${n} agent${n > 1 ? 's' : ''})`,
  wRunRunning: '⏳ Mission running…',
  wRunDone: (l) => `✓ Mission executed in ${(l / 1000).toFixed(1)} s`,
  wRunErr: 'Mission failed',
  wRunNeedApi: 'Add an API key in Settings → Intelligence to run missions.',
  wRep: 'Mission report',
  wRepFinal: 'Consolidated final report',
  wRepCopy: '⧉ Copy the report',
  wRepMd: '📄 Save the report',
  wRepSaved: (p) => `📄 Report saved: ${p}`,
  tourWelcome: '👋 Welcome to MEGA PACK! 30 seconds to understand everything?',
  tourSkip: 'Skip tour', tourNext: 'Next →', tourDone: 'Done',
  tourEnd: 'Right-click any expert to send it to an LLM, and 🛠 Workshop to build agents, skills and teams. Happy exploring! ⚡',
  teamsFilter: '🕸 Teams',
  manageSec: 'Manage',
  editItem: '✏️ Edit',
  lockItem: '🔒 Lock (prevent deletion)',
  unlockItem: '🔓 Remove the lock',
  copyToWorkshop: '🛠 Copy to Workshop (editable copy)',
  editAgentT: '✏️ Edit agent',
  editSkillT: '✏️ Edit skill',
  efName: 'Name',
  efDesc: 'Description',
  efSystem: 'System prompt',
  efBody: 'Procedure (SKILL.md)',
  efSkills: 'Skills (comma-separated)',
  efTools: 'Tools (comma-separated)',
  efRules: 'Rules (one per line)',
  efInputs: 'Inputs (comma-separated)',
  efChecks: 'Checks (one per line)',
  efSave: 'Save',
  efCancel: 'Cancel',
  edSaved: (n) => `✏️ ${n} — changes saved`,
  edErr: (m) => `✏️ Save failed — ${m}`,
  edExists: 'That name already exists',
  lockedOn: (n) => `🔒 ${n} is protected — it can no longer be deleted`,
  lockedOff: (n) => `🔓 ${n} is no longer locked`,
  lockBadge: '🔒',
  lockBadgeT: 'Locked — cannot be deleted (right-click to remove)',
  delLocked: '🔒 Deletion blocked — this item is locked (right-click → remove the lock).',
  copiedToWs: (k) => `🛠 Copy created in the Workshop (${k}) — right-click → Edit to adjust it.`,
  copiedToWsErr: 'Copy to Workshop failed',
  trashT: '🗑 Trash',
  trashBtn: '🗑',
  trashEmptyMsg: 'Trash is empty — nothing to restore.',
  trashHint: 'Deleted items stay restorable here (60 max, oldest are dropped).',
  trashRestore: '♻️ Restore',
  trashDelete: '✕ Delete permanently',
  trashEmptyAll: 'Empty trash',
  trashClose: 'Close',
  trashRestored: (n, k) => `♻️ ${n} restored (${k})`,
  trashDeleted: '✕ Permanently deleted',
  trashEmptied: '🗑 Trash emptied',
  trashErr: '🗑 Trash action failed',
  trashKind: (k) => k === 'agent' ? 'agent' : k === 'skill' ? 'skill' : k === 'team' ? 'team' : 'custom prompt',
  editTeamT: '✏️ Edit team',
  etOrch: 'Orchestrator — name',
  etOrchSys: 'Orchestrator — system prompt',
  etAgents: 'Agents (one per line: name | role | description | system prompt)',
  etWf: 'Workflow (one step per line)',
  etAgentBad: 'Invalid agent line (format: name | role | description | prompt)',
  etSavedT: (n) => `✏️ Team “${n}” updated`,
  lockFilterT: 'Show locked items only',
  backupT: '💾 Backup (locks + trash + workshops)',
  backupSave: '💾 Save backup',
  backupLoad: '📥 Restore a backup',
  backupSaved: '💾 Backup saved',
  backupRestored: (n, t) => `📥 Restored: ${n} item(s), ${t} trash entry(ies)`,
  backupErr: '💾 Backup failed',
  backupBad: '💾 Invalid backup file',
  histT: '🕘 Change history',
  histEmpty: 'No changes recorded yet — history starts with your first edit.',
  histRow: (n, d) => `${n} field${n > 1 ? 's' : ''} changed · ${d}`,
  histShow: '🕘 History',
  histHide: 'Hide history',
  tplBtn: '📋 Templates',
  tplT: '📋 Ready-to-use team templates',
  tplHint: 'Created as ordinary teams: editable, deletable, lockable.',
  tplCode: '🔍 Code review',
  tplCodeD: 'Analyst + security + performance → prioritized report',
  tplVeille: '📰 Watch',
  tplVeilleD: 'Collect + synthesize → actionable briefing',
  tplSupport: '🎧 Support',
  tplSupportD: 'Triage + diagnosis → ready-to-send answer',
  tplCreated: (n) => `📋 Team “${n}” created — edit it with ✏️`,
  tplLaunch: '🚀 Product launch',
  tplLaunchD: 'Roadmap → com → go-live checklist',
  restoreBtn: '⏪',
  restoreT: 'Restore this version',
  restoreDone: (f) => `⏪ Version restored (${f} field${f > 1 ? 's' : ''} reverted)`,
  restoreErr: '⏪ Restore failed',
  autoBkOn: (d) => `💾 Weekly auto-backup active — folder: ${d}`,
};

// ---------- Catalogue + prefs ----------
const CAT = (window.mgp && window.mgp.catalog) || { meta: { version: '?' }, skills: [], agents: [] };
const S = CAT.skills || [], A = CAT.agents || [];
const SYS = (window.mgp.getPrefs && window.mgp.getPrefs()) || { favorites: [], recents: [], defaultLLM: 'claude', sendTargets: [] };
const SEND_TARGETS = (SYS.sendTargets || []).filter((t) => typeof t === 'string');
const HAS_API = SYS.hasApi || {};
let FAVS = new Set(SYS.favorites || []);
let CUSTOMS = (SYS.customs || []).slice();
// 🔒 Cadenas : noms d'items protégés contre la suppression (persisté côté main, workshop-*.json)
const LOCKS = {
  agent: new Set((SYS.workshopLocks && SYS.workshopLocks.agent) || []),
  skill: new Set((SYS.workshopLocks && SYS.workshopLocks.skill) || []),
  team: new Set((SYS.workshopLocks && SYS.workshopLocks.team) || []),
};
const lockOf = (k, name) => !!(LOCKS[k] && LOCKS[k].has(name));
// Un item est verrouillé si le Set local le dit OU si son enregistrement porte le flag (source de vérité disque)
const itemLocked = (k, rec) => !!(lockOf(k, rec && rec.name) || (rec && rec.locked));
const setLockLocal = (k, name, on) => { on ? LOCKS[k].add(name) : LOCKS[k].delete(name); };
const isFav = (n) => FAVS.has(n);
const LLM_LABEL = { claude: 'Claude', chatgpt: 'ChatGPT', perplexity: 'Perplexity', copilot: 'Copilot', deepseek: 'DeepSeek', zai: 'Z.ai', kimi: 'Kimi', mammouth: 'Mammouth', 'llm-api': LANG === 'fr' ? '🔑 API' : '🔑 API' };
const TGT_META = { freebuff: 'Freebuff (app)', 'opencode-app': 'OpenCode (desktop)', opencode: 'OpenCode (terminal)', clipboard: LANG === 'fr' ? 'Presse-papiers' : 'Clipboard' };
const tgtLabel = (t) => TGT_META[t] || LLM_LABEL[t] || t;
// Sélecteur de LLM (barre du bas) : les modèles de base de l'app + l'API si clé présente
const LLM_CHOICES = ['claude', 'chatgpt', 'perplexity', 'copilot', 'deepseek', 'zai', 'kimi', 'mammouth', 'llm-api'];
const hasAnyApi = () => Object.values(SYS.hasApi || {}).some(Boolean);
const llmChoices = () => (hasAnyApi() ? LLM_CHOICES : LLM_CHOICES.slice(0, -1));
// LLM par défaut réactif : les Réglages (ou le sélecteur du footer) peuvent le changer à chaud
let DEFAULT_LLM = SYS.defaultLLM || 'claude';
try { window.mgp.onSettings((p) => { if (p && p.defaultLLM) { DEFAULT_LLM = p.defaultLLM; renderLlmBtn(); } }); } catch (e) {}

// ---------- Prompts ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lname = (x) => LANG === 'en' ? (x.name_en || x.name) : (x.name_fr || x.name);
const ldesc = (x) => LANG === 'en' ? (x.desc_en || x.desc) : (x.desc_fr || x.desc);
// Provenance : les items générés par LLM portent une notice de confiance quand
// leur prompt est copié (audit run-1 NV-2) — même principal, contenu non vérifié.
const provenanceNotice = (x) => x && x.origin === 'llm-generated'
  ? `[Contenu généré par IA — révise-le avant de l'exécuter tel quel]\n\n`
  : '';
function promptOf(x, k) {
  const n = lname(x), d = (ldesc(x) || '').trim();
  const prov = provenanceNotice(x);
  if (k === 'custom') return `${prov}${n}\n\n${d}`;
  if (k === 'team') return provenanceNotice(x._t || x) + teamPromptOf(x);
  if (k === 'agent') return `${prov}Agis désormais comme l'agent "${n}". ${d}\nUtilise cette expertise pour répondre à ma demande ci-dessous.\n\n`;
  return `${prov}Utilise le skill "${n}" (${CAT.meta?.name || 'MEGA PACK'}). ${d}\nApplique-le à ma demande ci-dessous.\n\n`;
}
// 🕸 Équipe multi-agents : le prompt copié EST le protocole complet (orchestrateur + agents + workflow)
function teamPromptOf(x) {
  const t = x._t || x;
  const orch = t.orchestrator || {};
  const agents = (t.agents || []).map((a) => `\n### ${a.name}${a.role ? ' — ' + a.role : ''}\n${a.desc || ''}\nPrompt système : ${a.system || ''}`).join('\n');
  const wf = (t.workflow || []).map((s, i) => `${i + 1}. ${s}`).join('\n');
  return `# Équipe multi-agents "${t.team || t.name}"\n${t.desc || ''}\n\n## 👔 Super-orchestrateur — ${orch.name || ''}\n\n${orch.system || ''}\n\n## 👥 Agents\n${agents}\n\n## 🔁 Workflow\n${wf}\n\n---\nJoue le super-orchestrateur : distribue les tâches aux agents, consolide leurs livrables, arbitre les conflits et garantis la qualité du rapport final.\n\n`;
}
const buildCombo = (items) => `Voici ${items.length} modules à appliquer ensemble :\n\n` + items.map((x, i) => `${i + 1}. **${lname(x)}** — ${(ldesc(x) || '').trim()}`).join('\n') + `\n\nCombine ces expertises pour traiter ma demande ci-dessous.\n\n`;

// ---------- État ----------
const TABS = ['all', 'skills', 'agents', 'teams', 'custom', 'favs'];
let filter = 'all';            // all | skills | agents | custom | favs
let query = '';
let results = [];              // [{ x, k }]
let sel = new Set();           // noms sélectionnés (⌘-clic)
let idx = 0;
let lockOnly = false;          // 🔒 filtre « verrouillés seulement » (cumulable avec onglets + recherche)

const $ = (id) => document.getElementById(id);

// ---------- DOM ----------
// Launcher : si la page fournit une fenêtre mac (.macwin), l'app s'intègre dedans
// (au-dessus de la barre mac) au lieu d'écraser le body — la chrome mac survit.
const MAC_HOST = document.querySelector('.macwin');
const APP_PARENT = MAC_HOST || document.body;
if (!MAC_HOST) document.body.innerHTML = ''; // ne vide le body QUE hors launcher
APP_PARENT.insertAdjacentHTML('afterbegin', `
<main id="app" role="application" aria-label="MEGA PACK">
  <header id="top">
    <span id="brand">⚡ <b>MEGA&nbsp;PACK</b></span>
    <span id="counts">${S.length} skills · ${A.length} agents</span>
    <span style="flex:1"></span>
    <button id="newp" title="${T.newp}" aria-label="${T.newp}">＋</button>
    <button id="langb" title="FR/EN" aria-label="FR/EN">${LANG === 'fr' ? 'FR' : 'EN'}</button>
  </header>
  <div id="searchrow">
    <span id="lupa" aria-hidden="true">⌕</span>
    <input id="q" type="text" role="searchbox" placeholder="${T.ph}" aria-label="${T.ph}"
      autocomplete="off" spellcheck="false" autofocus>
  </div>
  <nav id="tabs" role="tablist" aria-label="${LANG === 'fr' ? 'Catégories' : 'Categories'}">
    ${TABS.map((f) =>
      `<button role="tab" data-f="${f}" aria-selected="${f === 'all'}">${T[{ all: 'all', skills: 'skills', agents: 'agents', teams: 'teamsFilter', custom: 'perso', favs: 'favs' }[f]]}</button>`).join('')}
    <span style="flex:1"></span>
    <span id="sels" hidden></span>
    <button id="compose" hidden></button>
  </nav>
  <section id="list" role="listbox" aria-label="${T.results}"></section>
  <footer id="foot">
    <span>↑↓ <i>${LANG === 'fr' ? 'naviguer' : 'navigate'}</i></span>
    <span>⏎ <i>${LANG === 'fr' ? 'copier' : 'copy'}</i></span>
    <span>⌘⏎ <i>${LANG === 'fr' ? 'ouvrir' : 'open'}</i></span>
    <span>⇧⏎ ChatGPT</span>
    <span>★ <i>${LANG === 'fr' ? 'favori' : 'favorite'}</i></span>
    <span style="flex:1"></span>
    <span id="llmwrap">
      <button id="llmbtn" title="${T.llmSelT}" aria-haspopup="menu" aria-expanded="false">⌨ ${esc(T.llm)} <b>${esc(tgtLabel(DEFAULT_LLM))}</b> ▾</button>
      <span id="llmmenu" role="menu" hidden></span>
    </span>
    <button id="lkf" title="${T.lockFilterT}" aria-pressed="false">🔒</button>
    <button id="atb" title="${T.atelierT}" aria-haspopup="dialog">🛠 ${T.atelier}</button>
    <button id="trb" title="${T.trashT}" aria-haspopup="dialog">${T.trashBtn}</button>
    <span id="cnt" role="status" aria-live="polite"></span>
  </footer>
  <div id="tip" role="tooltip" hidden></div>
  <div id="ctx" role="menu" hidden></div>
  <div id="toast" role="status" aria-live="polite" hidden></div>
  <div id="wmodal" role="dialog" aria-modal="true" aria-label="${T.atelierT}" hidden>
    <div id="wbox">
      <h3>${T.atelierT}<button id="w-close" title="${LANG === 'fr' ? 'Fermer l\'atelier (Échap)' : 'Close the workshop (Esc)'}" aria-label="${LANG === 'fr' ? 'Fermer' : 'Close'}">✕</button></h3>
      <div class="wk">
        <span class="wl">${T.atelierKind}</span>
        <span class="wseg" role="radiogroup">
          <button id="w-agent" role="radio" aria-checked="true">${T.atelierKindA}</button>
          <button id="w-skill" role="radio" aria-checked="false">${T.atelierKindS}</button>
          <button id="w-team" role="radio" aria-checked="false">${T.wKindT}</button>
        </span>
      </div>
      <label class="wl2">${T.atelierIntent}
        <textarea id="w-intent" rows="8" placeholder="${T.atelierIntentPh}"></textarea>
        <span id="w-intent-help" style="display:flex;gap:8px;align-items:center;font-weight:500;font-size:10.5px;color:var(--mut)">
          <span id="w-intent-count">0 car. — aucun maximum</span>
          <span style="flex:1"></span>
          <span style="color:var(--mut)">⌘⏎ ${LANG === 'fr' ? 'générer' : 'generate'}</span>
          <button id="w-intent-clear" type="button" style="border:1px solid var(--line);background:none;color:var(--txt2);
            cursor:pointer;font:600 10px/1 inherit;padding:3px 8px;border-radius:99px">${LANG === 'fr' ? 'Effacer' : 'Clear'}</button>
          <button id="w-intent-big" type="button" title="${LANG === 'fr' ? 'Agrandir / réduire la zone' : 'Grow / shrink the field'}" aria-label="${LANG === 'fr' ? 'Agrandir / réduire la zone' : 'Grow / shrink the field'}"
            style="border:1px solid var(--line);background:none;color:var(--txt2);cursor:pointer;font:600 11px/1 inherit;padding:3px 8px;border-radius:99px">⤢</button>
        </span>
      </label>
      <div class="wk">
        <span class="wl">${T.wProvider}</span>
        <select id="w-prov" aria-label="${T.wProvider}"></select>
        <span class="wl">${T.wModel}</span>
        <input id="w-model" type="text" placeholder="auto" aria-label="${T.wModel}" maxlength="120" list="w-model-list" style="flex:1">
        <datalist id="w-model-list"></datalist>
      </div>
      <label class="wchk"><input type="checkbox" id="w-senior" checked> ${T.atelierSenior}</label>
      <div class="wact">
        <button id="w-gen" class="pri">${T.atelierGen}</button>
        <span style="flex:1"></span>
        <button id="w-x">${LANG === 'fr' ? 'Fermer' : 'Close'}</button>
      </div>
      <div class="wlist-h"><b>${T.atelierList}</b><span id="w-count" class="wmut"></span></div>
      <div id="w-tpl" role="group" aria-label="${T.tplT}"></div>
      <div id="w-list" role="list"></div>
      <div class="wlist-h"><b>${T.wRunList}</b></div>
      <div id="w-runlist" role="list"></div>
      <div id="w-report" role="region" aria-label="${T.wRep}" hidden>
        <b>${T.wRep}</b>
        <pre id="w-report-txt"></pre>
        <div class="wact">
          <button id="w-rep-copy">${T.wRepCopy}</button>
          <button id="w-rep-md">${T.wRepMd}</button>
          <span style="flex:1"></span>
          <button id="w-rep-x">✕</button>
        </div>
      </div>
    </div>
  </div>
  <div id="tour" role="dialog" aria-modal="true" aria-label="${LANG === 'fr' ? 'Visite guidée' : 'Guided tour'}" hidden>
    <div id="tourcard">
      <span id="tourstep" class="tstepnum"></span>
      <h3 id="tourtitle"></h3>
      <p id="tourdesc"></p>
      <p id="tourhelp"></p>
      <div id="tourtact">
        <button id="tourskip"></button>
        <span style="flex:1"></span>
        <span id="tourdots"></span>
        <button id="tournext" class="pri"></button>
      </div>
    </div>
  </div>
  <div id="tmodal" role="dialog" aria-modal="true" aria-label="${T.trashT}" hidden>
    <div id="tmbox">
      <h3>${T.trashT}<button id="tm-x" aria-label="${T.trashClose}">✕</button></h3>
      <p class="tmhint">${T.trashHint}</p>
      <p id="tm-autobk" class="tmhint"></p>
      <div id="tm-list" role="list"></div>
      <div id="tmrow">
        <button id="tm-empty">${T.trashEmptyAll}</button>
        <span style="flex:1"></span>
        <button id="tm-backup" title="${T.backupT}">${T.backupSave}</button>
        <button id="tm-restore-bk" title="${T.backupT}">${T.backupLoad}</button>
        <button id="tm-close">${T.trashClose}</button>
      </div>
    </div>
  </div>
  <div id="modal" role="dialog" aria-modal="true" aria-label="${T.newp}" hidden>
    <div id="mbox">
      <h3>✍️ ${LANG === 'fr' ? 'Nouveau prompt' : 'New prompt'}</h3>
      <label>${LANG === 'fr' ? 'Nom' : 'Name'}<input id="e-name" type="text" maxlength="60"></label>
      <label>${LANG === 'fr' ? 'Prompt' : 'Prompt'}<textarea id="e-txt" rows="7" maxlength="2000"></textarea></label>
      <div id="erow">
        <button id="e-save" class="pri">${LANG === 'fr' ? 'Enregistrer' : 'Save'}</button>
        <button id="e-del" hidden>${LANG === 'fr' ? 'Supprimer' : 'Delete'}</button>
        <span style="flex:1"></span>
        <button id="e-x">${LANG === 'fr' ? 'Annuler' : 'Cancel'}</button>
      </div>
    </div>
  </div>
  <div id="wedit" role="dialog" aria-modal="true" aria-label="${T.editItem}" hidden>
    <div id="webox">
      <h3 id="we-title"></h3>
      <input type="hidden" id="we-kind" value="agent"><input type="hidden" id="we-orig" value="">
      <div id="we-teamsec" hidden>
        ${weRow(T.efDesc, '<textarea id="we-t-desc" rows="2" maxlength="400"></textarea>')}
        ${weRow(T.etOrch, '<input id="we-t-orchname" type="text" maxlength="80">')}
        ${weRow(T.etOrchSys, '<textarea id="we-t-orchsys" rows="7" maxlength="8000"></textarea>')}
        ${weRow(T.etAgents, '<textarea id="we-t-agents" rows="5" maxlength="8000" placeholder="Analyste | analyse | Analyse le besoin | Tu analyses…"></textarea>')}
        ${weRow(T.etWf, '<textarea id="we-t-wf" rows="4" maxlength="4000"></textarea>')}
      </div>
      ${weRow(T.efName, '<input id="we-name" type="text" maxlength="80">')}
      ${weRow(T.efDesc, '<textarea id="we-desc" rows="2" maxlength="400"></textarea>')}
      <div id="we-skillsec">
        ${weRow(T.efSkills, '<input id="we-skills" type="text" maxlength="500">')}
        ${weRow(T.efTools, '<input id="we-tools" type="text" maxlength="500">')}
        ${weRow(T.efRules, '<textarea id="we-rules" rows="3" maxlength="2000"></textarea>')}
        ${weRow(T.efSystem, '<textarea id="we-system" rows="9" maxlength="8000"></textarea>')}
      </div>
      <div id="we-procsec" hidden>
        ${weRow(T.efInputs, '<input id="we-inputs" type="text" maxlength="500">')}
        ${weRow(T.efChecks, '<textarea id="we-checks" rows="3" maxlength="2000"></textarea>')}
        ${weRow(T.efBody, '<textarea id="we-body" rows="9" maxlength="8000"></textarea>')}
      </div>
      <div id="werow">
        <button id="we-save" class="pri">${T.efSave}</button>
        <button id="we-hist" hidden>${T.histShow}</button>
        <span style="flex:1"></span>
        <button id="we-x">${T.efCancel}</button>
      </div>
      <div id="we-history" hidden></div>
    </div>
  </div>
</main>`);

const q = $('q'), list = $('list'), cnt = $('cnt'), sels = $('sels'), composeBtn = $('compose');

// ────────────────────────────────────────────────────────────────────────────
//  Tooltip flottant — survol d'un agent / skill / ✍️ : explication complète
// ────────────────────────────────────────────────────────────────────────────
const tip = $('tip');
let tipTimer = null, tipFor = null;
const tipKindLabel = (k) => k === 'agent' ? (LANG === 'fr' ? 'AGENT' : 'AGENT') : k === 'custom' ? (LANG === 'fr' ? 'PERSO' : 'CUSTOM') : k === 'team' ? 'ÉQUIPE' : 'SKILL';
function tipHtml(it) {
  const x = it.x, k = it.k;
  const favIdx = (SYS.favorites || []).indexOf(x.name);
  const kindLine = k === 'agent'
    ? T.tipAgent : k === 'custom' ? T.tipCustom : k === 'team' ? T.tipTeam : T.tipSkill;
  const cat = x.category ? `<span class="trow"><i>${T.tipCat}</i><b>${esc(x.category.replace(/-/g, ' '))}</b></span>` : '';
  const skills = (k === 'agent' && Array.isArray(x.skills) && x.skills.length)
    ? `<span class="trow"><i>🧩</i><b>${x.skills.slice(0, 6).map(esc).join(' · ')}</b></span>` : '';
  const teamLine = (k === 'team' && x._t) ? `<span class="trow"><i>👥</i><b>${esc((x._t.agents || []).map((a) => a.name).join(' · '))}</b></span>` : '';
  return `<span class="tkind t-${k}">${tipKindLabel(k)}${isFav(x.name) ? ' <b class="tf">★</b>' : ''}</span>
    <b class="tname">${esc(lname(x))}</b>
    <p class="tdesc">${esc((ldesc(x) || '').slice(0, 320))}${(ldesc(x) || '').length > 320 ? '…' : ''}</p>
    ${cat}${skills}${teamLine}
    <span class="thint">${kindLine}</span>
    ${favIdx >= 0 && favIdx < 9 && SYS.favShortcuts !== false ? `<span class="tfav">${T.tipFav.replace('{n}', favIdx + 1)}</span>` : ''}`;
}
function showTip(el, it) {
  tip.innerHTML = tipHtml(it);
  tip.hidden = false;
  tipFor = it.x.name;
  const r = el.getBoundingClientRect(), tr = tip.getBoundingClientRect(), app = $('app').getBoundingClientRect();
  let x = r.left + r.width / 2 - tr.width / 2;
  x = Math.max(app.left + 8, Math.min(x, app.right - tr.width - 8));
  let y = r.top - tr.height - 8;
  if (y < app.top + 6) y = Math.min(r.bottom + 8, app.bottom - tr.height - 6);
  tip.style.left = `${Math.round(x - app.left)}px`;
  tip.style.top = `${Math.round(y - app.top)}px`;
}
function hideTip() { tip.hidden = true; tipFor = null; }
list.addEventListener('mouseover', (e) => {
  const el = e.target.closest && e.target.closest('.it');
  if (!el) return;
  clearTimeout(tipTimer);
  const it = results[+el.dataset.i];
  if (!it) return;
  if (tipFor === it.x.name && !tip.hidden) return;
  tipTimer = setTimeout(() => showTip(el, it), 350); // délai : pas de tooltip en survol rapide
});
list.addEventListener('mouseout', (e) => {
  if (e.target.closest && e.target.closest('.it')) { clearTimeout(tipTimer); setTimeout(() => { if (!tip.matches(':hover')) hideTip(); }, 120); }
});
tip.addEventListener('mouseenter', hideTip); // le tooltip ne gêne jamais le clic

// ────────────────────────────────────────────────────────────────────────────
//  Menu contextuel (clic droit) — envoi vers le(s) LLM choisis dans Réglages
// ────────────────────────────────────────────────────────────────────────────
const ctx = $('ctx');
function ctxHtml(it) {
  const x = it.x;
  const targets = SEND_TARGETS.length ? SEND_TARGETS : [DEFAULT_LLM || 'claude'];
  return `<span class="chead">${itEmoji(it.k)} ${esc(lname(x))}</span>
    <span class="csec">${T.sendTo}</span>
    ${targets.map((t) => `<button role="menuitem" data-t="${esc(t)}">▸ ${esc(tgtLabel(t))}</button>`).join('')}
    <span class="csep"></span>
    <button role="menuitem" data-a="md">${T.mdCreate}</button>
    ${it.x.path ? `<button role="menuitem" data-a="reveal">📂 ${LANG === 'fr' ? 'Ouvrir le .md source' : 'Open source .md'}</button>` : ''}
    <span class="csec ctx-treehead">${T.treeHead}</span>
    <span class="tree" id="ctx-tree"><span class="tree-empty">${T.treeLoading}</span></span>
    <button role="menuitem" data-a="opendir">📂 ${LANG === 'fr' ? 'Ouvrir le dossier MEGA PROMPT' : 'Open the MEGA PROMPT folder'}</button>
    <span class="csep"></span>
    <button role="menuitem" data-a="copy">${T.copyPrompt}</button>
    <button role="menuitem" data-a="fav">${isFav(x.name) ? T.favDel : T.favAdd}</button>
    <span class="csep"></span>
    <span class="csec">${T.manageSec}</span>
    ${(it.k === 'agent' || it.k === 'skill') ? (
      it.x.path ? `<button role="menuitem" data-a="copy-ws">${T.copyToWorkshop}</button>`
                : `<button role="menuitem" data-a="edit-ws">${T.editItem}</button>`
    ) : it.k === 'custom' ? `<button role="menuitem" data-a="edit-custom">${T.editItem}</button>`
    : it.k === 'team' ? `<button role="menuitem" data-a="edit-team">${T.editItem}</button><button role="menuitem" data-a="copy-ws">${T.copyToWorkshop}</button>`
    : ''}
    ${(((it.k === 'agent' || it.k === 'skill') && !it.x.path) || it.k === 'team') ? (
      (() => { const lk = it.k === 'team' ? lockOf('team', x.team || x.name) : lockOf(it.k, x.name);
        return `<button role="menuitem" data-a="lock">${lk ? T.unlockItem : T.lockItem}</button>`; })()
    ) : ''}`;
}
function openCtx(el, it, cx, cy) {
  ctx.innerHTML = ctxHtml(it);
  ctx.hidden = false;
  const app = $('app').getBoundingClientRect(), cr = ctx.getBoundingClientRect();
  let x = Math.max(app.left + 6, Math.min(cx, app.right - cr.width - 6));
  let y = Math.max(app.top + 6, Math.min(cy, app.bottom - cr.height - 6));
  ctx.style.left = `${Math.round(x - app.left)}px`;
  ctx.style.top = `${Math.round(y - app.top)}px`;
  loadCtxTree(); // remplit l'arborescence .md (async) puis recale le menu dans le panneau
  ctx.querySelectorAll('button').forEach((b) => {
    b.onclick = () => {
      hideCtx();
      if (b.dataset.t) {
        window.mgp.addRecent && window.mgp.addRecent(it.x.name);
        window.mgp.openLLM(b.dataset.t, promptOf(it.x, it.k));
      } else if (b.dataset.a === 'md') {
        // Crée le fichier .md dans le dossier MEGA PROMPT puis montre le chemin
        (it.k === 'team'
          ? window.mgp.teamMdCreate(it.x._t.team || it.x.name)
          : window.mgp.promptMdCreate({ x: it.x, k: it.k })
        ).then((r) => {
          if (r && r.ok) showToast(T.mdCreated(r.path), 'ok');
          else showToast(`${T.mdErr} — ${(r && r.error) || '?'}`, 'err');
        });
      } else if (b.dataset.a === 'opendir') {
        window.mgp.promptDirOpen();
      } else if (b.dataset.a === 'reveal') {
        window.mgp.sourceReveal(it.x.path).then((r) => {
          if (r && r.ok) showToast(LANG === 'fr' ? '📂 Dossier ouvert, fichier sélectionné' : '📂 Folder opened, file selected', 'ok');
          else showToast(`📂 — ${(r && r.error) || '?'}`, 'err');
        });
      } else if (b.dataset.a === 'copy') activate(it);
      else if (b.dataset.a === 'fav') toggleFav(it.x.name);
      // ── Gestion : édition + cadenas (agents/skills de l'Atelier, équipes, ✍️) ──
      else if (b.dataset.a === 'edit-ws') editWorkshopItem(it.k, it.x.name);
      else if (b.dataset.a === 'edit-team') editTeam(it.x._t.team || it.x.name);
      else if (b.dataset.a === 'edit-custom') { const c = CUSTOMS.find((cc) => cc.name === it.x.name); if (c) openModal(c); }
      else if (b.dataset.a === 'copy-ws') copyToWorkshop(it);
      else if (b.dataset.a === 'lock') toggleLock(it);
    };
  });
}
function hideCtx() { ctx.hidden = true; }

// ── Arborescence MEGA PROMPT dans le popup : groupes → dossiers → fichiers .md ──
function ctxTreeHtml(tree) {
  const groupRow = (g) => `<button class="trow-dir" role="menuitem" data-open="dir:${esc(g.rel)}" title="${T.treeOpenDir}">📁 ${esc(g.name)} <i>↗</i></button>`;
  const fileRow = (f) => `<button class="trow-file" role="menuitem" data-open="md:${esc(f.rel)}" title="${T.treeOpenMd}"><span class="tfn">${esc(f.name)}</span></button>`;
  const walkAll = (nodes) => nodes.map((n) => n.kind === 'dir'
    ? groupRow(n) + (n.children && n.children.length ? walkAll(n.children) : '')
    : fileRow(n)).join('');
  const body = tree.groups.length ? walkAll(tree.groups) : `<span class="tree-empty">${T.treeEmpty}</span>`;
  return `<span class="tree-root" role="menuitem" data-open="dir:" title="${T.treeOpenDir}">🏠 MEGA PROMPT</span>${body}`;
}
async function loadCtxTree() {
  const host = document.getElementById('ctx-tree');
  if (!host || !window.mgp.promptTreeOverview) return;
  try {
    const r = await window.mgp.promptTreeOverview();
    if (ctx.hidden) return;
    if (!r || !r.ok) { host.innerHTML = `<span class="tree-empty">${T.treeErr}</span>`; return; }
    host.innerHTML = ctxTreeHtml(r.tree);
    host.querySelectorAll('[data-open]').forEach((b) => {
      b.onclick = (ev) => {
        ev.stopPropagation();
        const v = b.dataset.open || '';
        const kind = v.startsWith('dir:') ? 'dir' : 'md';
        const rel = v.slice(v.indexOf(':') + 1);
        if (kind === 'dir') window.mgp.promptDirOpen(rel); // 📂 ouvre le dossier là où il se trouve
        else window.mgp.promptMdOpen(rel); // 📄 ouvre le fichier .md dans l'éditeur
      };
    });
    // Recale le menu dans le panneau : l'arborescence a pu l'agrandir
    const app2 = $('app').getBoundingClientRect(), cr2 = ctx.getBoundingClientRect();
    const curX = parseFloat(ctx.style.left) || 0, curY = parseFloat(ctx.style.top) || 0;
    ctx.style.left = `${Math.round(Math.max(6, Math.min(curX, app2.width - cr2.width - 6)))}px`;
    ctx.style.top = `${Math.round(Math.max(6, Math.min(curY, app2.height - cr2.height - 6)))}px`;
  } catch (e) { /* le popup reste avec « Chargement… » si l'IPC échoue */ }
}
document.addEventListener('click', (e) => { if (!ctx.hidden && !e.target.closest('#ctx')) hideCtx(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !ctx.hidden) hideCtx(); });
window.addEventListener('blur', () => { hideCtx(); hideTip(); });

// ── Scroll page → liste ──
// L'app est une app menu-bar : la page ne défile jamais, seul #list défile.
// Hors launcher, toute la molette en dehors d'un popup est donc relayée à #list,
// sinon un scroll sur l'en-tête/pied semble « ne rien faire ».
document.addEventListener('wheel', (e) => {
  if (document.querySelector('.macwin')) return; // launcher : la page défile normalement
  if (e.target.closest('#ctx, #llmmenu, #tip, #wmodal, #tour, #modal')) return; // popups à scroll propre
  const l = $('list');
  if (!l || l.scrollHeight <= l.clientHeight) return;
  e.preventDefault();
  l.scrollTop += e.deltaY;
}, { passive: false });

// ────────────────────────────────────────────────────────────────────────────
//  Toast — retour discret (génération IA, erreurs)
// ────────────────────────────────────────────────────────────────────────────
const toast = $('toast');
let toastTimer = null;
function showToast(msg, kind) {
  toast.textContent = msg;
  toast.className = kind === 'err' ? 'err' : kind === 'ok' ? 'ok' : '';
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3400);
}

// ---------- Données dérivées ----------
const ALL = [
  ...S.map((x) => ({ x, k: 'skill' })),
  ...A.map((x) => ({ x, k: 'agent' })),
  ...CUSTOMS.map((x) => ({ x, k: 'custom' })),
];
const findItem = (n) => ALL.find((i) => i.x.name === n);
// Recherche par tags : la requête est découpée sur espaces, / et virgules
// (« ux/ui », « ux ui design »…) — un item passe s'il correspond à AU MOINS UN
// token ; le classement fait remonter ceux qui en correspondent au plus.
const qTokens = () => query.split(/[\s,/]+/).filter(Boolean);
const hayOf = (it) => (it.x.name + ' ' + lname(it.x) + ' ' + (it.x.category || '') + ' ' + (ldesc(it.x) || '')).toLowerCase();
const match = (it) => {
  if (!query) return true;
  const hay = hayOf(it);
  return qTokens().some((t) => hay.includes(t));
};
const byFilter = (it) => {
  if (filter === 'skills') return it.k === 'skill';
  if (filter === 'agents') return it.k === 'agent';
  if (filter === 'teams') return it.k === 'team';
  if (filter === 'custom') return it.k === 'custom';
  if (filter === 'favs') return isFav(it.x.name);
  return true;
};
// 🔒 Filtre cumulatif : ne garde que les items verrouillés (agents/skills/équipes de l'Atelier)
const byLock = (it) => !lockOnly || (it.k === 'team'
  ? lockOf('team', (it.x._t && (it.x._t.team || it.x._t.name)) || it.x.name)
  : lockOf(it.k, it.x.name));
function compute() {
  results = ALL.filter(byFilter).filter(byLock).filter(match);
  if (query) {
    const toks = qTokens();
    const score = (it) => {
      const hay = hayOf(it);
      let s = toks.filter((t) => hay.includes(t)).length * 10;
      if (lname(it.x).toLowerCase().startsWith(toks[0])) s += 50;
      return s;
    };
    results.sort((a, b) => score(b) - score(a) || lname(a.x).localeCompare(lname(b.x)));
  }
  idx = Math.min(idx, Math.max(0, results.length - 1));
}

// ---------- Rendu ----------
const itEmoji = (k) => k === 'agent' ? '👤' : k === 'custom' ? '✍️' : k === 'team' ? '🕸' : '🛠';
function render() {
  compute();
  if (!results.length) {
    const voidMsg = (filter === 'teams' && !query && !TEAMS.length) ? T.noTeams : T.empty;
    list.innerHTML = `<div id="void">${voidMsg}</div>`;
  } else {
    list.innerHTML = results.map((it, i) => {
      const n = it.x.name;
      return `<div class="it k-${it.k} ${i === idx ? 'on' : ''} ${sel.has(n) ? 'selc' : ''}" role="option"
        aria-selected="${i === idx}" data-i="${i}" data-n="${esc(n)}">
        <span class="ico">${itEmoji(it.k)}</span>
        <span class="mid"><b>${esc(lname(it.x))}</b><i>${esc((ldesc(it.x) || '').slice(0, 90))}</i></span>
        <span class="tail">
          ${it.k !== 'custom' && lockOf(it.k, n) ? `<span class="lk" title="${T.lockBadgeT}">${T.lockBadge}</span>` : ''}
          ${isFav(n) ? '<span class="fv">★</span>' : ''}
          <button class="fb" title="${LANG === 'fr' ? 'Favori' : 'Favorite'}" aria-label="${LANG === 'fr' ? 'Favori' : 'Favorite'}">${isFav(n) ? '★' : '☆'}</button>
        </span>
      </div>`;
    }).join('');
  }
  cnt.textContent = `${results.length} ${T.results}`;
  const ns = sel.size;
  sels.hidden = !ns;
  composeBtn.hidden = !ns;
  if (ns) {
    sels.textContent = `${ns} ${T.selected}`;
    composeBtn.textContent = T.compose.replace('{n}', ns);
    composeBtn.title = T.selHint.replace('{n}', ns);
  }
  list.querySelectorAll('.it').forEach((el) => {
    const i = +el.dataset.i, it = results[i];
    el.onclick = (ev) => {
      if (ev.target.closest('.fb')) { toggleFav(it.x.name); return; }
      if (ev.metaKey || ev.ctrlKey) { sel.has(it.x.name) ? sel.delete(it.x.name) : sel.add(it.x.name); render(); return; }
      if (ev.altKey) { openSelection(DEFAULT_LLM || 'claude'); return; }
      activate(it, el);
    };
    // Clic droit : menu flottant d'envoi vers les LLM choisis dans Réglages
    el.oncontextmenu = (ev) => {
      ev.preventDefault();
      hideTip();
      openCtx(el, it, ev.clientX, ev.clientY);
    };
  });
  list.querySelector('.it.on')?.scrollIntoView({ block: 'nearest' });
}

// ────────────────────────────────────────────────────────────────────────────
//  Sélecteur de LLM (barre du bas) — ⌘⏎ ouvre le LLM choisi, changement instantané
// ────────────────────────────────────────────────────────────────────────────
function renderLlmBtn() {
  const b = document.getElementById('llmbtn');
  if (b) b.innerHTML = `⌨ ${esc(T.llm)} <b>${esc(tgtLabel(DEFAULT_LLM))}</b> ▾`;
}
const llmmenu = $('llmmenu'), llmbtn = $('llmbtn');
function llmMenuHtml() {
  return `<span class="csec">${T.llm}</span>`
    + llmChoices().map((t) => `<button role="menuitem" data-t="${esc(t)}" class="${t === DEFAULT_LLM ? 'on' : ''}">${t === DEFAULT_LLM ? '✓ ' : '▸ '}${esc(tgtLabel(t))}</button>`).join('')
    + (hasAnyApi() ? '' : `<span class="csec llmwarn">${T.llmApiNoKey}</span>`);
}
let LLM_ACTIONS = {}; // data-t → handler (résiste aux DOM sans querySelectorAll, ex. harnais de tests)
function openLlmMenu() {
  llmmenu.innerHTML = llmMenuHtml();
  llmmenu.hidden = false;
  llmbtn.setAttribute('aria-expanded', 'true');
  LLM_ACTIONS = {};
  for (const t of llmChoices()) {
    LLM_ACTIONS[t] = () => {
      DEFAULT_LLM = t;
      window.mgp.setDefaultLLM && window.mgp.setDefaultLLM(DEFAULT_LLM); // persisté + propagé (Réglages suivent)
      renderLlmBtn();
      hideLlmMenu();
      showToast(T.llmChanged(tgtLabel(DEFAULT_LLM)), 'ok');
    };
  }
  llmmenu.querySelectorAll('button').forEach((b) => { b.onclick = LLM_ACTIONS[b.dataset.t]; });
}
function hideLlmMenu() { llmmenu.hidden = true; llmbtn.setAttribute('aria-expanded', 'false'); }
llmbtn.onclick = (e) => { e.stopPropagation(); llmmenu.hidden ? openLlmMenu() : hideLlmMenu(); };
document.addEventListener('click', (e) => { if (!llmmenu.hidden && !e.target.closest('#llmwrap')) hideLlmMenu(); });

// ---------- Actions ----------
function activate(it, el) {
  window.mgp.copy(promptOf(it.x, it.k));
  window.mgp.addRecent && window.mgp.addRecent(it.x.name);
  if (el) { el.classList.add('copied'); setTimeout(() => el.classList.remove('copied'), 500); }
}
function openSelection(target) {
  const items = [...sel].map((n) => findItem(n)).filter(Boolean);
  const prompt = items.length ? buildCombo(items.map((f) => f.x))
    : (q.value.trim() || T.hello);
  window.mgp.openLLM(target, prompt);
}
function toggleFav(name) {
  window.mgp.toggleFav && window.mgp.toggleFav(name);
  isFav(name) ? FAVS.delete(name) : FAVS.add(name);
  render();
}

// ────────────────────────────────────────────────────────────────────────────
//  ✏️ / 🔒 Gestion des skills & agents — édition, cadenas anti-suppression,
//  copie modifiable depuis le catalogue. Sources de vérité : workshop-*.json.
// ────────────────────────────────────────────────────────────────────────────
async function editWorkshopItem(kind, name) {
  if (!window.mgp.workshopGet || !window.mgp.workshopSave) return;
  const rec = await window.mgp.workshopGet(kind, name);
  if (!rec) { showToast(T.edErr('introuvable'), 'err'); return; }
  if (rec.locked) { showToast(T.delLocked, 'err'); return; } // 🔒 ôter le cadenas d'abord
  openWedit(kind, rec);
}
function weRow(label, inner) { return `<label class="wel">${esc(label)}${inner}</label>`; }
const weList = (a) => (Array.isArray(a) ? a : []).join(', ');
const weLines = (a) => (Array.isArray(a) ? a : []).join('\n');
function openWedit(kind, rec) {
  $('we-kind').value = kind === 'agent' ? 'agent' : 'skill';
  $('we-orig').value = rec.name || '';
  $('we-title').textContent = kind === 'agent' ? T.editAgentT : T.editSkillT;
  histFor = { kind, name: rec.name || '' }; // 🕘 l'historique suit l'item édité
  $('we-history').hidden = true; $('we-hist').textContent = T.histShow;
  $('we-hist').hidden = false;
  $('we-name').value = rec.name || '';
  $('we-desc').value = rec.desc || '';
  const sk = $('we-skillsec');
  sk.hidden = kind !== 'agent';
  $('we-procsec').hidden = kind !== 'skill';
  $('we-teamsec').hidden = true; // l'édition équipe passe par editTeam
  if (kind === 'agent') {
    $('we-skills').value = weList(rec.skills); $('we-tools').value = weList(rec.tools); $('we-rules').value = weLines(rec.rules);
    $('we-system').value = rec.system || '';
  } else {
    $('we-inputs').value = weList(rec.inputs); $('we-checks').value = weLines(rec.checks);
    $('we-body').value = rec.body || '';
  }
  $('wedit').hidden = false;
  $('we-name').focus();
}
function closeWedit() { $('wedit').hidden = true; }
async function saveWedit() {
  if ($('we-kind').value === 'team') return saveTeamEdit(); // ✏️ équipe : champs dédiés
  const kind = $('we-kind').value === 'agent' ? 'agent' : 'skill';
  const orig = $('we-orig').value;
  const patch = { name: String($('we-name').value || '').trim(), desc: String($('we-desc').value || '').trim() };
  const cut = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12);
  const cutN = (v) => String(v || '').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 12);
  if (kind === 'agent') {
    patch.system = String($('we-system').value || '').trim();
    patch.skills = cut($('we-skills').value); patch.tools = cut($('we-tools').value); patch.rules = cutN($('we-rules').value);
    if (!patch.system) { showToast(T.edErr('prompt système vide'), 'err'); return; }
  } else {
    patch.body = String($('we-body').value || '').trim();
    patch.inputs = cut($('we-inputs').value); patch.checks = cutN($('we-checks').value);
    if (!patch.body) { showToast(T.edErr('procédure vide'), 'err'); return; }
  }
  if (!patch.name || !patch.desc) { showToast(T.edErr('nom ou description vide'), 'err'); return; }
  const r = await window.mgp.workshopSave(kind, orig, patch);
  if (r && r.ok) {
    closeWedit();
    showToast(T.edSaved(patch.name), 'ok');
    if (W.items.length) refreshWorkshop(); // l'Atelier ouvert reflète le changement
  } else {
    showToast(T.edErr(r && r.error === 'name-exists' ? T.edExists : ((r && r.error) || '?')), 'err');
  }
}
async function toggleLock(it) {
  const k = it.k, x = it.x;
  const name = k === 'team' ? (x.team || x.name) : x.name;
  const kind = k === 'team' ? 'team' : k;
  const on = !lockOf(kind, name);
  if (!window.mgp.workshopLock) return;
  const r = await window.mgp.workshopLock(kind, name, on);
  if (r && r.ok) {
    setLockLocal(kind, name, on);
    showToast(on ? T.lockedOn(name) : T.lockedOff(name), 'ok');
    render();
    if (W.items.length) refreshWorkshop();
  } else showToast(`${T.edErr((r && r.error) || '?')}`, 'err');
}
async function copyToWorkshop(it) {
  if (!window.mgp.workshopCreate) return;
  const x = it.x, k = it.k;
  const src = k === 'team' ? { ...(x._t || x) } : { ...x };
  const base = k === 'team' ? (src.team || src.name) : (src.name_fr || src.name);
  const list = k === 'team' ? ((window.mgp.teamList && await window.mgp.teamList()) || []) : ((await window.mgp.workshopList(k)) || []);
  const taken = new Set(list.map((w) => w.team || w.name));
  let name = `${base} (copie)`;
  if (taken.has(slugLike(name))) { let i = 2; while (i < 50 && taken.has(slugLike(`${base} (copie ${i})`))) i++; name = `${base} (copie ${i})`; }
  if (k === 'team') { src.team = name; src.name = name; } else src.name = name;
  const r = await window.mgp.workshopCreate(k, src);
  if (r && r.ok) {
    showToast(T.copiedToWs(k === 'team' ? (LANG === 'fr' ? 'équipe' : 'team') : k), 'ok');
    openWorkshop();
    if (k === 'team') loadTeams();
  } else showToast(T.copiedToWsErr, 'err');
}
const slugLike = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ────────────────────────────────────────────────────────────────────────
//  🗑 Corbeille — les éléments supprimés restent restaurables (même sans cadenas)
// ────────────────────────────────────────────────────────────────────────
async function openTrash() {
  if (!window.mgp.trashList) return;
  $('tmodal').hidden = false;
  await renderTrash();
  // 💾 état de l'auto-backup hebdo (affiché discrètement sous la liste)
  try {
    const st = window.mgp.backupStatus ? await window.mgp.backupStatus() : null;
    const info = $('tm-autobk');
    if (info && st && st.last) info.textContent = T.autoBkOn(st.dir);
  } catch (e) { /* purement informatif */ }
}
function closeTrash() { $('tmodal').hidden = true; }
async function renderTrash() {
  const host = $('tm-list');
  let items = [];
  try { items = (await window.mgp.trashList()) || []; } catch (e) { items = []; }
  $('tm-empty').disabled = !items.length;
  host.innerHTML = items.length
    ? items.map((t) => `<div class="tmit" role="listitem">
        <span class="tmico">${t.kind === 'agent' ? '👤' : t.kind === 'team' ? '🕸' : t.kind === 'custom' ? '✍️' : '🛠'}</span>
        <span class="tmmid"><b>${esc(t.name)}</b><i>${esc(T.trashKind(t.kind))} · ${esc((t.deletedAt || '').slice(0, 16).replace('T', ' '))}</i></span>
        <span class="wact2">
          <button data-a="restore" data-id="${esc(t.id)}" title="${T.trashRestore}">♻️</button>
          <button data-a="purge" data-id="${esc(t.id)}" title="${T.trashDelete}">✕</button>
        </span>
      </div>`).join('')
    : `<div class="wempty">${T.trashEmptyMsg}</div>`;
  host.querySelectorAll('button[data-id]').forEach((b) => {
    b.onclick = async () => {
      if (b.dataset.a === 'restore') {
        const r = await window.mgp.trashRestore(b.dataset.id);
        if (r && r.ok) {
          showToast(T.trashRestored(r.name, T.trashKind(r.kind)), 'ok');
          await refreshWorkshop();
          if (r.kind === 'custom') { CUSTOMS = (window.mgp.getPrefs().customs || []).slice(); ALL.length = 0; ALL.push(...S.map((x) => ({ x, k: 'skill' })), ...A.map((x) => ({ x, k: 'agent' })), ...CUSTOMS.map((x) => ({ x, k: 'custom' }))); render(); }
          if (r.kind === 'team') await loadTeams();
        } else showToast(T.trashErr, 'err');
      } else {
        await window.mgp.trashDelete(b.dataset.id);
        showToast(T.trashDeleted, 'ok');
      }
      await renderTrash();
    };
  });
}
$('tm-x').onclick = closeTrash;
$('tm-close').onclick = closeTrash;
$('tm-empty').onclick = async () => { await window.mgp.trashEmpty(); showToast(T.trashEmptied, 'ok'); await renderTrash(); };
$('tm-backup').onclick = doBackupExport;
$('tm-restore-bk').onclick = doBackupImport;

// ────────────────────────────────────────────────────────────────────────
//  ✏️ Édition des équipes — orchestrateur, agents, workflow dans #wedit
// ────────────────────────────────────────────────────────────────────────
async function editTeam(name) {
  if (!window.mgp.teamSave) return;
  const t = TEAMS.find((x) => (x.team || x.name) === name) || (window.mgp.teamList ? (await window.mgp.teamList() || []).find((x) => (x.team || x.name) === name) : null);
  if (!t) { showToast(T.edErr('introuvable'), 'err'); return; }
  if (t.locked) { showToast(T.delLocked, 'err'); return; } // 🔒 ôter le cadenas d'abord
  $('we-kind').value = 'team';
  $('we-orig').value = t.team || t.name;
  $('we-title').textContent = T.editTeamT;
  histFor = { kind: 'team', name: t.team || t.name }; // 🕘 idem pour les équipes
  $('we-history').hidden = true; $('we-hist').textContent = T.histShow;
  $('we-hist').hidden = false;
  $('we-name').value = t.team || t.name;
  $('we-t-desc').value = t.desc || '';
  $('we-t-orchname').value = (t.orchestrator && t.orchestrator.name) || '';
  $('we-t-orchsys').value = (t.orchestrator && t.orchestrator.system) || '';
  $('we-t-agents').value = (t.agents || []).map((a) => [a.name, a.role || '', a.desc || '', a.system || ''].join(' | ')).join('\n');
  $('we-t-wf').value = (t.workflow || []).join('\n');
  $('wedit').hidden = false;
  $('we-name').focus();
}
async function saveTeamEdit() {
  const orig = $('we-orig').value;
  const patch = {
    team: String($('we-name').value || '').trim(),
    desc: String($('we-t-desc').value || '').trim(),
    orchestrator: {
      name: String($('we-t-orchname').value || '').trim(),
      system: String($('we-t-orchsys').value || '').trim(),
    },
    agents: String($('we-t-agents').value || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const p = l.split('|').map((s) => s.trim());
      if (!p[0]) return null;
      return { name: p[0], role: p[1] || '', desc: p[2] || '', system: p[3] || '' };
    }).filter(Boolean),
    workflow: String($('we-t-wf').value || '').split('\n').map((l) => l.trim()).filter(Boolean),
  };
  if (!patch.team) { showToast(T.edErr('nom vide'), 'err'); return; }
  const r = await window.mgp.teamSave(orig, patch);
  if (r && r.ok) {
    closeWedit();
    showToast(T.etSavedT(patch.team), 'ok');
    await loadTeams();
    if (W.items.length) refreshWorkshop();
  } else showToast(T.edErr(r && r.error === 'name-exists' ? T.edExists : ((r && r.error) || '?')), 'err');
}
// Ligne agent sans « | » : role/desc/system vides, mais un nom est exigé (message dédié sinon).
function teamAgentLineOk(line) { return line.trim().length > 0; }

// ────────────────────────────────────────────────────────────────────────
//  📋 Modèles d'équipes — revue de code, veille, support (instanciés éditables)
// ────────────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { key: 'revue-code', label: () => T.tplCode, desc: () => T.tplCodeD, icon: '🔍' },
  { key: 'veille', label: () => T.tplVeille, desc: () => T.tplVeilleD, icon: '📰' },
  { key: 'support', label: () => T.tplSupport, desc: () => T.tplSupportD, icon: '🎧' },
  { key: 'lancement', label: () => T.tplLaunch, desc: () => T.tplLaunchD, icon: '🚀' },
];
function renderTemplates() {
  const host = $('w-tpl');
  if (!host || !window.mgp.teamFromTemplate) return;
  host.innerHTML = `<span class="tplhead">${T.tplT}</span><span class="tplhint">${T.tplHint}</span>`
    + TEMPLATES.map((t) => `<button class="tplcard" data-k="${t.key}" title="${esc(t.desc())}">
        <b>${t.icon} ${esc(t.label())}</b><i>${esc(t.desc())}</i>
      </button>`).join('');
  host.querySelectorAll('.tplcard').forEach((b) => {
    b.onclick = async () => {
      const r = await window.mgp.teamFromTemplate(b.dataset.k);
      if (r && r.ok) {
        showToast(T.tplCreated(r.item.team || r.item.name), 'ok');
        await loadTeams();
        if (W.items.length) refreshWorkshop();
      } else showToast(T.trashErr, 'err');
    };
  });
}

// ────────────────────────────────────────────────────────────────────────
//  🕘 Historique des modifications (journal embarqué dans l'enregistrement)
// ────────────────────────────────────────────────────────────────────────
let histFor = null; // { kind, name } de l'item affiché dans #wedit
async function toggleHistory() {
  const host = $('we-history');
  if (!host.hidden) { host.hidden = true; $('we-hist').textContent = T.histShow; return; }
  if (!histFor || !window.mgp.workshopHistory) return;
  let rows = [];
  try { rows = (await window.mgp.workshopHistory(histFor.kind, histFor.name)) || []; } catch (e) { rows = []; }
  const fmt = (iso) => { try { return new Date(iso).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-FR'); } catch (e) { return iso || ''; } };
  host.innerHTML = `<b>${T.histT}</b>` + (rows.length
    ? rows.map((h) => `<div class="histrow"><span class="histline">🕘 ${esc(T.histRow((h.fields || []).length, fmt(h.at)))}${(h.fields || []).length ? ` <i>${esc(h.fields.join(', '))}</i>` : ''}</span>${h.action !== 'restore' && (h.fields || []).length ? `<button class="histrest" data-at="${esc(h.at)}" title="${T.restoreT}" aria-label="${T.restoreT}">${T.restoreBtn}</button>` : ''}</div>`).join('')
    : `<div class="histrow">${T.histEmpty}</div>`);
  host.querySelectorAll('button.histrest').forEach((b) => {
    b.onclick = async () => {
      if (!histFor || !window.mgp.workshopRestoreVersion) return;
      const r = await window.mgp.workshopRestoreVersion(histFor.kind, histFor.name, b.dataset.at);
      if (r && r.ok) {
        showToast(T.restoreDone((r.restoredFields || []).length), 'ok');
        host.hidden = true; $('we-hist').textContent = T.histShow;
        closeWedit(); // le formulaire peut être périmé après revert : on repart du frais
        await loadTeams();
        if (W.items.length) refreshWorkshop();
      } else showToast(r && r.error === 'locked' ? T.delLocked : T.restoreErr, 'err');
    };
  });
  host.hidden = false;
  $('we-hist').textContent = T.histHide;
}

// ────────────────────────────────────────────────────────────────────────
//  💾 Sauvegarde portable (cadenas + corbeille + ateliers → JSON daté)
// ────────────────────────────────────────────────────────────────────────
let backupExportsCount = 0; // 🧪 instrumentation de test (nombre d'exports effectués)
async function doBackupExport() {
  if (!window.mgp.backupExport) return;
  const ok = await window.mgp.backupExport();
  if (ok) backupExportsCount++;
  showToast(ok ? T.backupSaved : T.backupErr, ok ? 'ok' : 'err');
}
async function doBackupImport() {
  if (!window.mgp.backupImport) return;
  const r = await window.mgp.backupImport();
  if (r && r.ok) {
    showToast(T.backupRestored(r.restored || 0, r.trashAdded || 0), 'ok');
    await refreshWorkshop();
    await loadTeams();
    if ($('tmodal').hidden === false) await renderTrash();
  } else if (r && r.error && r.error !== 'annulé') {
    showToast(r.error === 'format inconnu' ? T.backupBad : T.backupErr, 'err');
  }
}

// ---------- Modal ✍️ ----------
let editing = null;
function openModal(c) {
  editing = c ? c.name : null;
  $('e-name').value = c ? c.name : '';
  $('e-txt').value = c ? c.desc : '';
  $('e-del').hidden = !c;
  $('modal').hidden = false;
  $('e-name').focus();
}
function closeModal() { $('modal').hidden = true; }
$('newp').onclick = () => openModal(null);
$('e-x').onclick = closeModal;
$('e-save').onclick = () => {
  const name = $('e-name').value.trim(), desc = $('e-txt').value.trim();
  if (!name || !desc) return;
  window.mgp.customSave && window.mgp.customSave({ name, desc });
  const i = CUSTOMS.findIndex((c) => c.name === name);
  const rec = { name, desc };
  if (i >= 0) CUSTOMS[i] = rec; else CUSTOMS.push(rec);
  ALL.length = 0; ALL.push(...S.map((x) => ({ x, k: 'skill' })), ...A.map((x) => ({ x, k: 'agent' })), ...CUSTOMS.map((x) => ({ x, k: 'custom' })));
  closeModal(); render();
};
$('e-del').onclick = () => {
  if (!editing) return;
  window.mgp.customDelete && window.mgp.customDelete(editing);
  CUSTOMS = CUSTOMS.filter((c) => c.name !== editing);
  ALL.length = 0; ALL.push(...S.map((x) => ({ x, k: 'skill' })), ...A.map((x) => ({ x, k: 'agent' })), ...CUSTOMS.map((x) => ({ x, k: 'custom' })));
  closeModal(); render();
};
$('e-txt').addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') $('e-save').onclick(); });
// ── Modal d'édition agent/skill (#wedit) ──
$('we-save').onclick = () => saveWedit();
$('we-x').onclick = closeWedit;
$('we-hist').onclick = toggleHistory; // 🕘 journal des modifications
$('we-system').addEventListener('keydown', (e) => { if ((e.metaKey || ctrl(e)) && e.key === 'Enter') saveWedit(); });
$('we-body').addEventListener('keydown', (e) => { if ((e.metaKey || ctrl(e)) && e.key === 'Enter') saveWedit(); });
function ctrl(e) { return e.ctrlKey; }
if (window.mgp.onEditCustom) window.mgp.onEditCustom((c) => openModal(c));

// ---------- Tabs + recherche ----------
$('tabs').querySelectorAll('[data-f]').forEach((b) => {
  b.onclick = () => {
    filter = b.dataset.f; idx = 0;
    $('tabs').querySelectorAll('[data-f]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    render();
  };
});
q.addEventListener('input', () => { query = q.value.trim().toLowerCase(); idx = 0; render(); });
// 🔒 Filtre « verrouillés seulement » : cumulable avec l'onglet actif et la recherche
$('lkf').onclick = () => {
  lockOnly = !lockOnly;
  $('lkf').setAttribute('aria-pressed', String(lockOnly));
  $('lkf').style.borderColor = lockOnly ? 'var(--vio)' : '';
  $('lkf').style.color = lockOnly ? 'var(--txt)' : '';
  idx = 0;
  render();
};
// 🗑 Corbeille (bouton du footer)
$('trb').onclick = () => { openTrash(); };
$('langb').onclick = () => { window.mgp.onSettingsChange && window.mgp.onSettingsChange({ lang: LANG === 'fr' ? 'en' : 'fr' }); location.reload(); };
composeBtn.onclick = () => openSelection(DEFAULT_LLM || 'claude');

// ---------- Clavier ----------
document.addEventListener('keydown', (e) => {
  if (!$('tour').hidden) return; // 🎓 la visite guidée capte le clavier (pas d'action du panneau en arrière-plan)
  if (!$('modal').hidden) {
    if (e.key === 'Escape') { closeModal(); return; }
    return;
  }
  if (!$('tmodal').hidden) {
    if (e.key === 'Escape') { closeTrash(); return; }
    return;
  }
  if (!$('wedit').hidden) {
    if (e.key === 'Escape') { closeWedit(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { saveWedit(); return; }
    return;
  }
  if (!$('wmodal').hidden) {
    if (e.key === 'Escape') { closeWorkshop(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { wgen.onclick(); return; }
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === ',') { window.mgp.openSettings(); return; }
  if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
    const f = findItem((SYS.favorites || [])[+e.key - 1]);
    if (f) { e.preventDefault(); window.mgp.openLLM(DEFAULT_LLM || 'claude', promptOf(f.x, f.k)); }
    return;
  }
  if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, results.length - 1); render(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); render(); }
  else if (e.key === 'Home') { e.preventDefault(); idx = 0; render(); }
  else if (e.key === 'End') { e.preventDefault(); idx = results.length - 1; render(); }
  else if (e.key === 'PageDown') { e.preventDefault(); idx = Math.min(idx + 10, results.length - 1); render(); }
  else if (e.key === 'PageUp') { e.preventDefault(); idx = Math.max(idx - 10, 0); render(); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    const it = results[idx];
    if (!it) return;
    if (e.metaKey || e.ctrlKey) window.mgp.openLLM(DEFAULT_LLM || 'claude', promptOf(it.x, it.k));
    else if (e.shiftKey) window.mgp.openLLM('chatgpt', promptOf(it.x, it.k));
    else if (e.altKey) openSelection(DEFAULT_LLM || 'claude');
    else activate(it);
  } else if (e.key === 'Escape') {
    if (q.value) { q.value = ''; query = ''; render(); }
    else window.mgp.hide();
  } else if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1 && document.activeElement !== q) {
    q.focus(); // l'utilisateur tape : la recherche capte tout
  }
});

// ---------- Thème ----------
function applyTheme() {
  const dark = (window.mgp.getPrefs() || {}).theme !== 'light';
  document.body.classList.toggle('light', !dark);
}
try { window.mgp.onSettings(({ theme, lang: l }) => { if (l && l !== LANG) location.reload(); applyTheme(); }); } catch (e) {}
applyTheme();

// ────────────────────────────────────────────────────────────────────────────
//  🛠 Atelier — créer ses agents & skills, générés par IA (clé API)
// ────────────────────────────────────────────────────────────────────────────
const W = { kind: 'agent', items: [], busy: false };
// ── Fournisseur/modèle pour la génération (persistés dans les prefs si demandé) ──
const PROV_LABELS = { groq: 'Groq', gemini: 'Google Gemini', omniroute: 'OmniRoute (local)', mistral: 'Mistral AI', cerebras: 'Cerebras', cohere: 'Cohere', freellm: 'FreeLLM (local)', openai: 'OpenAI', anthropic: 'Anthropic (Claude)', openrouter: 'OpenRouter', ollama: 'Ollama (local)', custom: 'Endpoint perso' };
// Modèles chargés en direct depuis l'API du fournisseur (GET /models, comme OpenCode)
async function refreshModelList(provider) {
  const dl = $('w-model-list');
  if (!dl || !window.mgp.modelsList) return;
  dl.innerHTML = '';
  try {
    const r = await window.mgp.modelsList(provider);
    if (r && r.ok && r.models.length) dl.innerHTML = r.models.map((m) => `<option value="${esc(m)}">`).join('');
  } catch (e) { /* liste vide : l'input reste libre */ }
}
function fillProviders() {
  const sel = $('w-prov');
  if (!sel) return;
  const avail = Object.keys(HAS_API).filter((k) => HAS_API[k]);
  const list = avail.length ? avail : Object.keys(PROV_LABELS);
  sel.innerHTML = list.map((p) => `<option value="${esc(p)}">${esc(PROV_LABELS[p] || p)}</option>`).join('');
  const savedP = (SYS.apiProvider || '').trim();
  const savedM = (SYS.apiDefaultModel || '').trim();
  if (savedP && list.includes(savedP)) sel.value = savedP;
  $('w-model').value = savedM || '';
  refreshModelList(sel.value);
  sel.onchange = () => refreshModelList(sel.value); // re-charge la liste /models à chaque changement
}
function wgenPayload(intent) {
  return { intent, lang: LANG, provider: $('w-prov') ? $('w-prov').value : undefined, model: ($('w-model').value || '').trim() || undefined };
}
const wmodal = $('wmodal'), wlist = $('w-list'), wcount = $('w-count'), wgen = $('w-gen'), wintent = $('w-intent');
// Zone de mission sans limite : compteur live, bouton ⤢ (agrandir/réduire), Effacer.
(function intentAids() {
  if (!wintent) return;
  const counter = $('w-intent-count');
  const update = () => { if (counter) counter.textContent = String((wintent.value || '').length) + ' car. — ' + (LANG === 'fr' ? 'aucun maximum' : 'no limit'); };
  wintent.addEventListener('input', update);
  update();
  const big = $('w-intent-big');
  if (big) big.onclick = () => {
    const grown = wintent.rows > 8; // ⤢ : bascule 8 ↔ 26 lignes
    wintent.rows = grown ? 8 : 26;
    wintent.style.minHeight = grown ? '110px' : '';
    wintent.focus();
  };
  const clr = $('w-intent-clear');
  if (clr) clr.onclick = () => { wintent.value = ''; update(); wintent.focus(); };
})();
async function refreshWorkshop() {
  if (!window.mgp.workshopList) return;
  try {
    const [ag, sk, tm] = await Promise.all([
      window.mgp.workshopList('agent'),
      window.mgp.workshopList('skill'),
      window.mgp.teamList ? window.mgp.teamList() : Promise.resolve([]),
    ]);
    W.items = [
      ...(ag || []).map((x) => ({ x, k: 'agent' })),
      ...(sk || []).map((x) => ({ x, k: 'skill' })),
      ...(tm || []).map((t) => ({ x: { name: t.team || t.name, desc: t.desc, _t: t }, k: 'team' })),
    ];
  } catch (e) { W.items = []; }
  renderWorkshop();
  renderRunlist(); // les équipes fraîchement générées deviennent exécutables sans rouvrir l'Atelier
}
function renderWorkshop() {
  const n = W.items.length;
  wcount.textContent = n ? String(n) : '';
  wlist.innerHTML = n
    ? W.items.map((it, i) => {
      const det = it.k === 'agent'
        ? `${T.agentOf} · ${((it.x.system || '').length / 1000).toFixed(1)}k car.${(it.x.skills || []).length ? ' · 🧩 ' + it.x.skills.length : ''}`
        : it.k === 'team'
          ? `${T.wTeamOrch} · 👥 ${(it.x._t.agents || []).length} ${T.wTeamAgents.toLowerCase()} · 🔁 ${(it.x._t.workflow || []).length} ${T.wTeamWf.toLowerCase()}`
          : `${T.skillOf} · ${((it.x.body || '').length / 1000).toFixed(1)}k car.${(it.x.checks || []).length ? ' · ✓ ' + it.x.checks.length : ''}`;
      const lk = it.k === 'team' ? lockOf('team', it.x._t.team || it.x.name) : lockOf(it.k, it.x.name);
      return `<div class="wit" role="listitem" data-i="${i}">
        <span class="wico">${itEmoji(it.k)}</span>
        <span class="wmid"><b>${esc(lname(it.x))}${lk ? ` <span class="lk" title="${T.lockBadgeT}">${T.lockBadge}</span>` : ''}</b><i>${esc((it.k === 'team' ? (it.x.desc || '') : (ldesc(it.x) || '')).slice(0, 80))}</i><u>${esc(det)}</u></span>
        <span class="wact2">
          <button data-a="edit" title="${T.editItem}" aria-label="${T.editItem}">✏️</button>
          ${it.k !== 'team' ? `<button data-a="lock" title="${lk ? T.unlockItem : T.lockItem}" aria-label="${lk ? T.unlockItem : T.lockItem}">${lk ? '🔓' : '🔒'}</button>` : ''}
          <button data-a="export" title="${T.atelierExp}" aria-label="${T.atelierExp}">⬇</button>
          <button data-a="del" title="${T.atelierDel}" aria-label="${T.atelierDel}">🗑</button>
        </span>
      </div>`;
    }).join('')
    : `<div class="wempty">${T.atelierEmpty}</div>`;
  wlist.querySelectorAll('.wit button').forEach((b) => {
    b.onclick = async () => {
      const it = W.items[+b.closest('.wit').dataset.i];
      if (b.dataset.a === 'edit') { it.k === 'team' ? editTeam(it.x._t.team || it.x.name) : editWorkshopItem(it.k, it.x.name); return; }
      if (b.dataset.a === 'lock') { toggleLock({ k: it.k, x: it.x._t || it.x }); return; }
      if (b.dataset.a === 'del') {
        if (it.k === 'team') {
          const name = it.x._t.team || it.x.name;
          if (lockOf('team', name)) { showToast(T.delLocked, 'err'); return; }
          const d = await window.mgp.teamDelete(name);
          if (d && d.ok === false) { showToast(T.delLocked, 'err'); return; }
          showToast((LANG === 'fr' ? '🗑 Équipe supprimée' : '🗑 Team deleted'), 'ok');
        } else {
          const d = await window.mgp.workshopDelete(it.k, it.x.name);
          if (d && d.ok === false) { showToast(T.delLocked, 'err'); return; }
          showToast(it.k === 'agent' ? (LANG === 'fr' ? '🗑 Agent supprimé' : '🗑 Agent deleted') : (LANG === 'fr' ? '🗑 Skill supprimé' : '🗑 Skill deleted'), 'ok');
        }
        refreshWorkshop();
      } else if (it.k === 'team') {
        const ok = await window.mgp.teamExport(it.x._t.team || it.x.name);
        if (ok) showToast(LANG === 'fr' ? '✓ Exporté en .md' : '✓ Exported as .md', 'ok');
      } else {
        const ok = await window.mgp.workshopExport(it.k, it.x.name);
        if (ok) showToast(LANG === 'fr' ? '✓ Exporté en .md' : '✓ Exported as .md', 'ok');
      }
    };
  });
}
function setWkind(kind) {
  W.kind = kind;
  $('w-agent').setAttribute('aria-checked', String(kind === 'agent'));
  $('w-skill').setAttribute('aria-checked', String(kind === 'skill'));
  $('w-team').setAttribute('aria-checked', String(kind === 'team'));
  const chk = $('w-senior').closest('.wchk');
  if (chk) chk.style.display = kind === 'team' ? 'none' : '';
}
$('w-agent').onclick = () => setWkind('agent');
$('w-skill').onclick = () => setWkind('skill');
$('w-team').onclick = () => setWkind('team');
function openWorkshop() {
  wmodal.hidden = false;
  fillProviders();
  refreshWorkshop();
  renderRunlist();
  renderTemplates();
  wintent.focus();
}

// ── ▶ Mode exécution d'équipe : mission réelle via l'API (orchestrateur → agents → rapport) ──
function renderRunlist() {
  const host = $('w-runlist');
  if (!host) return;
  const teams = W.items.filter((w) => w.k === 'team');
  host.innerHTML = teams.length
    ? teams.map((it, i) => {
      const n = (it.x._t.agents || []).length;
      return `<div class="wit" role="listitem" data-i="${W.items.indexOf(it)}">
        <span class="wico">🕸</span>
        <span class="wmid"><b>${esc(it.x.name)}</b><i>${esc((it.x.desc || '').slice(0, 90))}</i><u>${T.wTeamOrch} · 👥 ${n}</u></span>
        <span class="wact2"><button data-run="${esc(it.x._t.team || it.x.name)}" title="${T.wRunT}">${T.wRunBtn(n)}</button></span>
      </div>`;
    }).join('')
    : `<div class="wempty">${T.wRunEmpty}</div>`;
  host.querySelectorAll('[data-run]').forEach((b) => {
    b.onclick = () => runMission(b.dataset.run, b);
  });
}
async function runMission(teamName, btn) {
  if (W.busy) return;
  currentRunTeam = teamName; // pour l'enregistrement du rapport
  const t = TEAMS.find((x) => (x.team || x.name) === teamName);
  if (!t) return;
  if (!hasAnyApi()) { showToast(T.wRunNeedApi, 'err'); return; }
  W.busy = true;
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = T.wRunRunning;
  try {
    const res = await window.mgp.teamRun({
      team: t,
      mission: wintent.value.trim() || t.desc || 'Exécute la mission de l\'équipe.',
      provider: $('w-prov') ? $('w-prov').value : undefined,
      model: ($('w-model').value || '').trim() || undefined,
      lang: LANG,
    });
    if (res && res.ok) {
      showToast(T.wRunDone(res.latency || 0), 'ok');
      showReport(res.report);
    } else {
      showToast(`${T.wRunErr} — ${(res && res.error) || '?'}`, 'err');
    }
  } finally {
    W.busy = false;
    btn.disabled = false;
    btn.textContent = old;
  }
}
function showReport(md) {
  $('w-report').hidden = false;
  $('w-report-txt').textContent = md || '';
  $('w-rep-copy').onclick = () => { window.mgp.copy(md || ''); showToast(LANG === 'fr' ? '⧉ Rapport copié' : '⧉ Report copied', 'ok'); };
  $('w-rep-md').onclick = () => {
    window.mgp.reportSave({ team: currentRunTeam, md }).then((r) => {
      if (r && r.ok) showToast(T.wRepSaved(r.path), 'ok');
    });
  };
  $('w-rep-x').onclick = () => { $('w-report').hidden = true; };
}
let currentRunTeam = '';
function closeWorkshop() { wmodal.hidden = true; }
$('atb').onclick = openWorkshop;
$('w-x').onclick = closeWorkshop;
$('w-close').onclick = closeWorkshop;

wgen.onclick = async (payload) => {
  if (W.busy) return;
  const intent = String((payload && payload.intent) || wintent.value || '').trim();
  if (!intent) { showToast(T.needIntent, 'err'); wintent.focus(); return; }
  const anyKey = HAS_API.groq || HAS_API.openai || HAS_API.anthropic || HAS_API.openrouter || HAS_API.custom || HAS_API.ollama || Object.values(HAS_API).some(Boolean);
  if (!anyKey) { showToast(T.atelierNeedApi, 'err'); return; }
  W.busy = true;
  wgen.disabled = true;
  wgen.textContent = T.atelierSending;
  if (W.kind === 'team') {
    // 🕸 Équipe multi-agents : orchestrateur + agents + workflow générés en un appel
    const res = await window.mgp.teamGenerate({ ...wgenPayload(intent), intent, lang: LANG });
    W.busy = false;
    wgen.disabled = false;
    wgen.textContent = T.atelierGen;
    if (res && res.ok) {
      wintent.value = '';
      showToast(T.atelierDone(res.model, res.latency || 0), 'ok');
      if (window.__mgp && window.__mgp.wgenResolve) { window.__mgp.wgenResolve(res); window.__mgp.wgenResolve = null; }
      refreshWorkshop();
      addTeam(res.item); // l'équipe devient un citoyen du panneau
    } else {
      showToast(`${T.atelierErr} — ${(res && res.error) || '?'}`, 'err');
      if (window.__mgp && window.__mgp.wgenResolve) { window.__mgp.wgenResolve(res); window.__mgp.wgenResolve = null; }
    }
    return;
  }
  const res = await window.mgp.llmGenerate(payload || { kind: W.kind, intent, senior: $('w-senior').checked, ...wgenPayload(intent) });
  W.busy = false;
  wgen.disabled = false;
  wgen.textContent = T.atelierGen;
  if (res && res.ok) {
    wintent.value = '';
    showToast(T.atelierDone(res.model, res.latency || 0), 'ok');
    if (window.__mgp && window.__mgp.wgenResolve) { window.__mgp.wgenResolve(res); window.__mgp.wgenResolve = null; }
    refreshWorkshop();
    // La création devient un citoyen du panneau (recherche, favoris, envoi)
    const rec = res.item;
    const pool = W.kind === 'agent' ? A : S;
    const inCat = pool.some((x) => x.name === rec.name);
    if (!inCat) { pool.push(rec); ALL.push({ x: rec, k: W.kind }); }
    render();
  } else {
    showToast(`${T.atelierErr} — ${(res && res.error) || '?'}`, 'err');
    if (window.__mgp && window.__mgp.wgenResolve) { window.__mgp.wgenResolve(res); window.__mgp.wgenResolve = null; }
  }
};
wintent.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') wgen.onclick(); });

// ---------- 🕸 Équipes multi-agents : chargées au départ, citoyennes du panneau ----------
let TEAMS = [];
async function loadTeams() {
  if (!window.mgp.teamList) return;
  try { TEAMS = (await window.mgp.teamList()) || []; } catch (e) { TEAMS = []; }
  ALL.length = 0;
  ALL.push(...S.map((x) => ({ x, k: 'skill' })), ...A.map((x) => ({ x, k: 'agent' })),
    ...TEAMS.map((t) => ({ x: { name: t.team || t.name, desc: t.desc, _t: t }, k: 'team' })),
    ...CUSTOMS.map((x) => ({ x, k: 'custom' })));
  render();
}
function addTeam(t) {
  const i = TEAMS.findIndex((x) => (x.team || x.name) === (t.team || t.name));
  if (i >= 0) TEAMS[i] = t; else TEAMS.push(t);
  ALL.length = 0;
  ALL.push(...S.map((x) => ({ x, k: 'skill' })), ...A.map((x) => ({ x, k: 'agent' })),
    ...TEAMS.map((x) => ({ x: { name: x.team || x.name, desc: x.desc, _t: x }, k: 'team' })),
    ...CUSTOMS.map((x) => ({ x, k: 'custom' })));
  render();
}
loadTeams();

// ---------- 🎓 Visite guidée interactive (à la première ouverture) ----------
function tourSteps() {
  const fr = LANG === 'fr';
  return [
    { title: fr ? '⚡ Bienvenue !' : '⚡ Welcome!', desc: fr ? '321 experts prêts à l\'emploi : 131 skills 🛠 (procédures d\'expertise) et 190 agents 👤 (personas experts). Tape quelques lettres : la liste filtre instantanément.' : '321 ready-to-use experts: 131 skills 🛠 (expertise procedures) and 190 agents 👤 (expert personas). Type a few letters: the list filters instantly.', help: fr ? '💡 Astuce : ↑↓ naviguent, ⏎ copie le prompt. Tu es au bon endroit pour essayer !' : '💡 Tip: ↑↓ navigate, ⏎ copies the prompt. Try it right here!', target: null },
    { title: fr ? '⌨ Le LLM par défaut' : '⌨ The default LLM', desc: fr ? 'Dans la barre du bas, le bouton « ⌨ LLM » choisit le modèle par défaut : Claude, ChatGPT, Perplexity, Copilot, DeepSeek, Z.ai, Kimi, Mammouth… ou 🔑 API si une clé est enregistrée.' : 'In the bottom bar, the « ⌨ LLM » button picks the default model: Claude, ChatGPT, Perplexity, Copilot, DeepSeek, Z.ai, Kimi, Mammouth… or 🔑 API with a saved key.', help: fr ? '💡 ⌘⏎ sur un expert l\'ouvre dans ce LLM · ⇧⏎ force ChatGPT.' : '💡 ⌘⏎ on an expert opens it in that LLM · ⇧⏎ forces ChatGPT.', target: 'llmbtn' },
    { title: fr ? '🖱 Le clic droit, ton couteau suisse' : '🖱 Right-click, your Swiss knife', desc: fr ? 'Clic droit sur n\'importe quel expert : l\'envoyer vers plusieurs LLM, créer son fichier .md, naviguer dans l\'arborescence MEGA PROMPT (un clic ouvre le dossier ou le fichier), copier, mettre en favori.' : 'Right-click any expert: send it to several LLMs, create its .md file, browse the MEGA PROMPT tree (one click opens the folder or file), copy, favorite.', help: fr ? '💡 Les destinations du clic droit se règlent dans Réglages (⌘,).' : '💡 Right-click destinations are configured in Settings (⌘,).', target: 'q' },
    { title: fr ? '🛠 L\'Atelier : crée tes experts' : '🛠 The Workshop: build your experts', desc: fr ? 'Décris un besoin, l\'IA génère un agent 👤, un skill 🛠 — ou une équipe 🕸 : un super-orchestrateur + 2 à 5 agents + un workflow complet.' : 'Describe a need, the AI generates an agent 👤, a skill 🛠 — or a team 🕸: a super-orchestrator + 2-5 agents + a full workflow.', help: fr ? '💡 Choisis le fournisseur (Groq, OpenAI, Anthropic…) et ta clé API dans Réglages → Intelligence.' : '💡 Pick the provider (Groq, OpenAI, Anthropic…) and your API key in Settings → Intelligence.', target: 'atb' },
    { title: fr ? '▶ Exécute une équipe' : '▶ Run a team', desc: fr ? 'Dans l\'Atelier, l\'équipe peut passer à l\'action : la mission est envoyée à l\'orchestrateur, distribué aux agents via l\'API, puis le rapport final consolidé s\'affiche — copiable et enregistrable en .md.' : 'In the Workshop, a team can act: the mission goes to the orchestrator, is distributed to agents via the API, and the consolidated final report shows up — copyable and savable as .md.', help: fr ? '💡 Les rapports restent consultables : ⧉ copier ou 📄 enregistrer.' : '💡 Reports stay available: ⧉ copy or 📄 save.', target: 'atb' },
    { title: fr ? '★ Raccourcis malins' : '★ Clever shortcuts', desc: fr ? '⌘1-9 lance tes 9 premiers favoris depuis le menu ⚡. L\'onglet ✍️ garde tes prompts perso, et ⌥⏎ compose plusieurs experts sélectionnés (⌘-clic) en un seul prompt.' : '⌘1-9 launches your first 9 favorites from the ⚡ menu. The ✍️ tab keeps your custom prompts, and ⌥⏎ composes several selected experts (⌘-click) into one prompt.', help: fr ? '💡 Tout est dans la barre du bas, en permanence.' : '💡 Everything lives in the bottom bar, all the time.', target: 'tabs' },
    { title: fr ? '✅ Tu sais tout !' : '✅ You are all set!', desc: T.tourEnd, help: fr ? 'Astuce finale : ⌥Espace ouvre/ferme ce panneau depuis n\'importe quelle app.' : 'Final tip: ⌥Espace opens/closes this panel from any app.', target: null },
  ];
}
let TOUR_I = 0;
const TOUR_SEEN_KEY = 'mgp.tour.done';
function tourShow(i) {
  const steps = tourSteps();
  TOUR_I = Math.max(0, Math.min(i, steps.length - 1));
  const st = steps[TOUR_I];
  $('tourtitle').textContent = st.title;
  $('tourdesc').textContent = st.desc;
  $('tourhelp').textContent = st.help;
  $('tourstep').textContent = LANG === 'fr' ? `Étape ${TOUR_I + 1}/${steps.length}` : `Step ${TOUR_I + 1}/${steps.length}`;
  $('tourdots').innerHTML = steps.map((_, j) => `<i class="${j === TOUR_I ? 'on' : ''}"></i>`).join('');
  $('tournext').textContent = TOUR_I === steps.length - 1 ? T.tourDone : T.tourNext;
  $('tourskip').textContent = T.tourSkip;
  $('tour').hidden = false;
  // Encadre l'élément ciblé par l'étape (surbrillance pédagogique)
  const el = st.target ? document.getElementById(st.target) : null;
  document.querySelectorAll('.tour-hl').forEach((n) => n.classList.remove('tour-hl'));
  if (el) el.classList.add('tour-hl');
}
function tourNextStep() {
  if (TOUR_I >= tourSteps().length - 1) return tourEnd();
  tourShow(TOUR_I + 1);
}
function tourEnd() {
  $('tour').hidden = true;
  document.querySelectorAll('.tour-hl').forEach((n) => n.classList.remove('tour-hl'));
  try { localStorage.setItem(TOUR_SEEN_KEY, '1'); } catch (e) {}
}
$('tournext').onclick = tourNextStep;
$('tourskip').onclick = tourEnd;
document.addEventListener('keydown', (e) => {
  if ($('tour').hidden) return;
  if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); tourNextStep(); }
});
function tourMaybeStart() {
  let seen = false;
  try { seen = localStorage.getItem(TOUR_SEEN_KEY) === '1'; } catch (e) {}
  if (!seen) {
    tourShow(0);
    showToast(T.tourWelcome, 'ok'); // bandeau discret en complément du pop-up
  }
}
setTimeout(tourMaybeStart, 600); // laisse le premier rendu se poser avant le pop-up
// Relance depuis Réglages → 🎓 Mode d'emploi (supprime le marqueur « vue »)
try { window.mgp.onRestartTour && window.mgp.onRestartTour(() => { try { localStorage.removeItem(TOUR_SEEN_KEY); } catch (e) {} tourShow(0); }); } catch (e) {}

render();
window.__mgp = {
  list: () => results,
  filters: () => filter,
  select: (f) => { filter = f; render(); },
  search: (s) => { query = String(s || '').toLowerCase(); q.value = query; render(); return results.length; },
  selection: () => [...sel],
  toggleSel: (n) => { sel.has(n) ? sel.delete(n) : sel.add(n); render(); },
  nav: (d) => { idx = d > 0 ? Math.min(idx + 1, results.length - 1) : Math.max(idx - 1, 0); render(); return idx; },
  current: () => results[idx] || null,
  copy: () => activate(results[idx]),
  openLLM: () => window.mgp.openLLM(DEFAULT_LLM || 'claude', promptOf(results[idx].x, results[idx].k)),
  openCustom: (n) => { const c = CUSTOMS.find((x) => x.name === n); if (c) openModal(c); },
  tooltip: () => ({ hidden: tip.hidden, for: tipFor, text: tip.textContent }),
  ctx: () => ({ hidden: ctx.hidden, buttons: [...ctx.querySelectorAll('button')].map((b) => b.dataset.t || b.dataset.a) }),
  openCtxTree: async (i) => { MGP.openCtxAt(i); await loadCtxTree(); return String(document.getElementById('ctx')._html || ''); },
  ctxTree: () => (ctxTreeHtml({ groups: [{ kind: 'dir', name: 'code', rel: 'code', depth: 0, children: [{ kind: 'file', name: 'a.md', rel: 'code/a.md', depth: 1 }] }, { kind: 'file', name: 'b.md', rel: 'b.md', depth: 0 }] })),
  openCtxAt: (i) => { const el = list.querySelector(`.it[data-i="${i}"]`) || list.children[i] || { getBoundingClientRect: () => ({ left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 }) }; if (results[i]) openCtx(el, results[i], 200, 200); },
  workshop: () => W,
  openWorkshop: () => openWorkshop(),
  setWkind: (k) => setWkind(k),
  workshopItems: () => W.items,
  setDefaultLLM: (t) => { DEFAULT_LLM = t; renderLlmBtn(); },
  defaultLLM: () => DEFAULT_LLM,
  llmMenu: () => llmMenuHtml(),
  openLlmMenu: () => openLlmMenu(),
  llmMenuVisible: () => !llmmenu.hidden,
  pickLLM: (t) => { const fn = LLM_ACTIONS[t]; if (fn) fn(); },
  teams: () => TEAMS,
  reloadTeams: () => loadTeams(),
  teamOf: (n) => TEAMS.find((t) => (t.team || t.name) === n) || null,
  tourShow: (i) => tourShow(i),
  tourStart: () => tourShow(0),
  tourEnd: () => tourEnd(),
  tourStep: () => ({ i: TOUR_I, title: $('tourtitle').textContent, help: $('tourhelp').textContent }),
  tourState: () => ({ hidden: $('tour').hidden, step: TOUR_I }),
  runlist: () => renderRunlist(),
  wgenResolve: null,
  saveCustom: (name, desc) => { $('e-name').value = name; $('e-txt').value = desc; $('e-save').onclick(); },
  deleteCustom: (name) => { const c = CUSTOMS.find((x) => x.name === name); if (c) openModal(c); $('e-del').onclick(); },
  generateRaw: (payload) => wgen.onclick(payload),
  // ✏️ / 🔒 Gestion (tests + raccourcis)
  editWorkshopItem: (k, n) => editWorkshopItem(k, n),
  openWedit: (k, rec) => openWedit(k, rec),
  saveWedit: () => saveWedit(),
  closeWedit: () => closeWedit(),
  weditVisible: () => !$('wedit').hidden,
  weditValues: () => ({ kind: $('we-kind').value, orig: $('we-orig').value, name: $('we-name').value, desc: $('we-desc').value, system: $('we-system').value, body: $('we-body').value }),
  lockOf: (k, n) => lockOf(k, n),
  toggleLock: (it) => toggleLock(it),
  copyToWorkshop: (it) => copyToWorkshop(it),
  ctxHtmlStr: () => String(document.getElementById('ctx')._html || ''),
  // 💾 sauvegarde + 🕘 historique + 📋 modèles
  doBackupExport: () => doBackupExport(),
  doBackupImport: () => doBackupImport(),
  backupCount: () => backupExportsCount,
  renderTemplates: () => renderTemplates(),
  tplHtml: () => String(document.getElementById('w-tpl')._html || ''),
  teamFromTemplate: (key) => window.mgp.teamFromTemplate(key),
  loadTeamsBridge: () => loadTeams(),
  showHistory: () => toggleHistory(),
  histHtml: () => String(document.getElementById('we-history')._html || ''),
  histVisible: () => !$('we-history').hidden,
  toggleHistory: () => toggleHistory(),
  // 🗑 Corbeille + ✏️ équipe + 🔒 filtre
  openTrash: () => openTrash(),
  trashVisible: () => !$('tmodal').hidden,
  renderTrash: () => renderTrash(),
  trashHtml: () => String(document.getElementById('tm-list')._html || ''),
  closeTrash: () => closeTrash(),
  editTeam: (n) => editTeam(n),
  editTeamVisible: () => !$('wedit').hidden && $('we-kind').value === 'team',
  saveTeamEdit: () => saveTeamEdit(),
  toggleLockFilter: () => $('lkf').onclick(),
  lockFilterOn: () => lockOnly,
  counts: () => ({ all: ALL.length, skills: S.length, agents: A.length, customs: CUSTOMS.length, favs: FAVS.size, teams: TEAMS.length }),
  tabs: () => TABS.slice(),
};
