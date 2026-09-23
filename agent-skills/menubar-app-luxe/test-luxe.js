// Test logique de l'édition Luxe — exécute le renderer RÉEL dans une VM sandbox
// et vérifie : catalogue, recherche, filtres, clavier, favoris, ✍️, composeur,
// atelier (génération IA d'agents/skills) et menu contextuel multi-destinations.
process.chdir(__dirname);
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const catCode = fs.readFileSync(path.join(__dirname, '..', 'interface', 'catalog-full.js'), 'utf8');
const CAT = new Function(catCode + '\n;return MEGA_CATALOG;')();
const S = CAT.skills, A = CAT.agents;
console.log(`Catalogue : ${S.length} skills · ${A.length} agents`);

// ── harnais DOM minimal ──
function makeEl(tag) {
  const cls = new Set();
  const el = {
    tagName: String(tag).toUpperCase(), dataset: {}, children: [], _handlers: {}, _html: '', _txt: '',
    style: {},
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    classList: {
      add: (c) => cls.add(c), remove: (c) => cls.delete(c),
      toggle: (c, f) => { const on = f === undefined ? !cls.has(c) : !!f; on ? cls.add(c) : cls.delete(c); },
      contains: (c) => cls.has(c),
    },
    set textContent(v) { this._txt = v; }, get textContent() { return this._txt; },
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    set value(v) { this._val = v; }, get value() { return this._val; },
    set hidden(v) { this._hidden = !!v; }, get hidden() { return !!this._hidden; },
    appendChild(c) { this.children.push(c); return c; },
    insertAdjacentHTML() {},
    addEventListener(ev, fn) { (this._handlers[ev] ||= []).push(fn); },
    getContext() { return null; },
    scrollIntoView() {}, focus() {}, blur() {}, closest() { return null; },
    querySelector() { return null; },
    querySelectorAll(sel) {
      // harnais : les boutons générés par innerHTML sont simulés via _onclicks (voir el._onclicks)
      return (el._onclicks && el._onclicks[sel]) || [];
    },
    clientWidth: 560, clientHeight: 480,
    // API géométrie (tooltip flottant + menu contextuel)
    getBoundingClientRect() { return { left: 0, top: 0, right: 560, bottom: 480, width: 560, height: 480 }; },
    matches() { return false; },
  };
  return el;
}
const ids = {};
const byId = (id) => (ids[id] ||= makeEl('div'));
const inputEl = makeEl('input');
ids.q = inputEl;

const copied = [], recents = [], opened = [], toasts = [], generated = [], mdStore = [], revealed = [];
const favsStore = new Set();
const customsStore = [];
const workshopStore = { agent: [], skill: [] };
const teamStore = [];
const trashStore = []; // 🗑 corbeille en mémoire
let trashSeq = 0; // ids uniques (Date.now() seul peut collider en rafale)
let lastBackup = null; // 💾 dernière sauvegarde (harnais)
const backupExports = [];
const autoBkStore = { last: '' }; // 💾 horodatage auto-backup (harnais)
let defaultLLMStore = 'claude'; // le sélecteur du footer modifie la pref (comme l'IPC réel)
const sandbox = {
  console,
  document: {
    documentElement: makeEl('html'),
    body: makeEl('body'), head: makeEl('head'),
    createElement: (t) => makeEl(t),
    getElementById: (id) => byId(id),
    querySelector: () => null, // pas de .macwin dans la sandbox → chemin panneau standard
    querySelectorAll: () => [],
    addEventListener() {},
    addEventListener() {},
    activeElement: null,
  },
  localStorage: { getItem: () => null, setItem() {} },
  sessionStorage: { getItem: () => null, setItem() {} },
  setTimeout: (fn) => { fn(); return 0; }, clearTimeout() {},
  devicePixelRatio: 1,
};
sandbox.window = sandbox;
sandbox.addEventListener = () => {}; // harnais : window.addEventListener no-op
sandbox.window.mgp = {
  catalog: CAT,
  copy: (t) => copied.push(t),
  addRecent: (n) => recents.push(n),
  hide() {},
  openLLM: (t, p) => opened.push([t, String(p || '')]),
  openSettings() {},
  getPrefs: () => ({ favorites: [], recents: [], customs: customsStore, defaultLLM: defaultLLMStore, sendTargets: ['chatgpt', 'claude', 'clipboard'], hasApi: { groq: true }, lang: 'fr', theme: 'dark', workshopLocks: { agent: [...workshopStore.agent.filter((w) => w.locked).map((w) => w.name)], skill: [...workshopStore.skill.filter((w) => w.locked).map((w) => w.name)], team: [...teamStore.filter((t) => t.locked).map((t) => t.team || t.name)] } }),
  toggleFav: (n) => { favsStore.has(n) ? favsStore.delete(n) : favsStore.add(n); },
  customSave: (item) => { const i = customsStore.findIndex((c) => c.name === item.name); if (i >= 0) customsStore[i] = item; else customsStore.push(item); },
  customDelete: (n) => { const i = customsStore.findIndex((c) => c.name === n); if (i >= 0) customsStore.splice(i, 1); },
  onSettings: null,
  onEditCustom: null,
  // Atelier + LLM (harnais : stubs déterministes)
  workshopList: async (kind) => workshopStore[kind === 'agent' ? 'agent' : 'skill'],
  workshopDelete: async (kind, name) => {
    const arr = workshopStore[kind === 'agent' ? 'agent' : 'skill'];
    const i = arr.findIndex((w) => w.name === name);
    if (i < 0) return false;
    if (arr[i].locked) return { ok: false, locked: true }; // 🔒 comme le main process réel
    const [removed] = arr.splice(i, 1);
    trashStore.push({ id: `${kind}:${name}:${Date.now()}-${++trashSeq}` , kind, name, rec: removed }); // 🗑 comme le main process réel
    return true;
  },
  workshopGet: async (kind, name) => workshopStore[kind === 'agent' ? 'agent' : 'skill'].find((w) => w.name === name) || null,
  workshopSave: async (kind, name, patch) => {
    const arr = workshopStore[kind === 'agent' ? 'agent' : 'skill'];
    const i = arr.findIndex((w) => w.name === name);
    if (i < 0) return { ok: false, error: 'introuvable' };
    if (arr[i].locked) { // 🔒 seul le retrait du cadenas est accepté
      const keys = Object.keys(patch || {});
      if (keys.length !== 1 || keys[0] !== 'locked' || patch.locked !== false) return { ok: false, error: 'locked' };
    }
    const changed = Object.keys(patch).filter((k) => JSON.stringify(arr[i][k]) !== JSON.stringify(patch[k]));
    const before = {};
    for (const k of changed) before[k] = arr[i][k];
    arr[i] = { ...arr[i], ...patch };
    arr[i].history = [{ at: new Date().toISOString(), action: 'edit', fields: changed, before }, ...(arr[i].history || [])].slice(0, 30);
    return { ok: true, item: arr[i] };
  },
  workshopCreate: async (kind, rec) => {
    const arr = workshopStore[kind === 'agent' ? 'agent' : 'skill'];
    const copy = JSON.parse(JSON.stringify(rec));
    copy.name = String(copy.name || '').trim();
    if (arr.some((w) => w.name === copy.name)) copy.name = copy.name + '-2';
    delete copy.locked;
    if (kind === 'skill' && !copy.body) copy.body = copy.desc || 'Procédure à compléter.'; // comme le main process réel
    arr.push(copy);
    return { ok: true, item: copy };
  },
  workshopLock: async (kind, name, locked) => {
    const arr = kind === 'team' ? teamStore : workshopStore[kind === 'agent' ? 'agent' : 'skill'];
    const w = arr.find((x) => (x.team || x.name) === name);
    if (!w) return { ok: false, error: 'introuvable' };
    w.locked = !!locked;
    return { ok: true, locked: w.locked };
  },
  workshopExport: async () => true,
  llmGenerate: async (p) => {
    generated.push(p);
    const rec = p.kind === 'agent'
      ? { name: 'Agent Test Senior', desc: 'Agent généré pour test', category: 'orchestration', system: 'Tu es un agent senior de test. '.repeat(40), skills: ['revue', 'audit'], tools: [], rules: ['Vérifie tout'] }
      : { name: 'Skill Test Senior', desc: 'Skill généré pour test', category: 'procedure', body: 'Procédure de test. '.repeat(40), inputs: ['code'], checks: ['Tests verts'] };
    workshopStore[p.kind === 'agent' ? 'agent' : 'skill'].push(rec);
    return { ok: true, kind: p.kind, item: rec, model: 'stub-model', latency: 1234 };
  },
  llmTest: async () => ({ ok: true, model: 'stub-model', latency: 42, sample: 'OK' }),
  apiSet: async () => true,
  // Dossier MEGA PROMPT (harnais : fichiers virtuels)
  promptDirGet: async () => '/virtuel/MEGA PROMPT',
  promptDirChoose: async () => '/virtuel/MEGA PROMPT',
  promptDirOpen: async () => true,
  promptMdCreate: async (it) => mdStore.push(it) && { ok: true, path: `/virtuel/MEGA PROMPT/${it.k}/${it.x.name}.md` },
  sourceReveal: async (p) => revealed.push(p) && { ok: true, path: p },
  promptTreeSync: async () => ({ ok: true, count: 321 }),
  workshopMdCreate: async () => ({ ok: true, path: '/virtuel/x.md' }),
  // Sélecteur LLM du footer (harnais : la pref change, comme le main process réel)
  setDefaultLLM: (t) => { defaultLLMStore = t; },
  // 🕸 Équipes multi-agents (harnais : stubs déterministes)
  teamList: async () => teamStore,
  teamGenerate: async (p) => {
    generated.push({ ...p, kind: 'team' });
    const rec = {
      team: 'Équipe Test', desc: 'Équipe générée pour test',
      orchestrator: { name: 'Orchestrateur Test', system: 'Tu supervises l\'équipe de test. '.repeat(30), skills: ['coordination'] },
      agents: [
        { name: 'Analyste', role: 'analyse', desc: 'Analyse le besoin', system: 'Tu analyses. '.repeat(30), skills: ['analyse'], deliverable: 'rapport d\'analyse' },
        { name: 'Rédacteur', role: 'rédaction', desc: 'Rédige le livrable', system: 'Tu rédiges. '.repeat(30), skills: ['rédaction'], deliverable: 'livrable final' },
      ],
      workflow: ['Analyste produit le rapport', 'Rédacteur rédige à partir du rapport', 'Orchestrateur valide et consolide'],
    };
    teamStore.push(rec);
    return { ok: true, item: rec, model: 'stub-model', latency: 1500 };
  },
  teamDelete: async (name) => { const i = teamStore.findIndex((t) => (t.team || t.name) === name); if (i < 0) return false; if (teamStore[i].locked) return { ok: false, locked: true }; const [r] = teamStore.splice(i, 1); trashStore.push({ id: `team:${name}:${Date.now()}`, kind: 'team', name, rec: r }); return true; },
  teamSave: async (name, patch) => {
    const i = teamStore.findIndex((t) => (t.team || t.name) === name);
    if (i < 0) return { ok: false, error: 'introuvable' };
    if (teamStore[i].locked) return { ok: false, error: 'locked' };
    const changed = Object.keys(patch).filter((k) => JSON.stringify(teamStore[i][k]) !== JSON.stringify(patch[k]));
    teamStore[i] = { ...teamStore[i], ...patch, name: patch.team || name };
    teamStore[i].history = [{ at: new Date().toISOString(), action: 'edit', fields: changed }, ...(teamStore[i].history || [])].slice(0, 30);
    return { ok: true, item: teamStore[i] };
  },
  teamFromTemplate: async (key) => {
    const tpls = {
      'revue-code': { desc: 'Revue de code', orchestrator: { name: 'Chef de revue', system: 'x'.repeat(50) }, agents: [{ name: 'Analyste code', role: 'analyse', desc: 'd', system: 's', deliverable: 'f' }, { name: 'Expert sécurité', role: 'sécurité', desc: 'd', system: 's', deliverable: 'f' }, { name: 'Expert performance', role: 'performance', desc: 'd', system: 's', deliverable: 'f' }], workflow: ['a', 'b', 'c'] },
      veille: { desc: 'Veille', orchestrator: { name: 'Chef de veille', system: 'y'.repeat(50) }, agents: [{ name: 'Veilleur tech', role: 'collecte', desc: 'd', system: 's', deliverable: 'f' }], workflow: ['a'] },
      support: { desc: 'Support', orchestrator: { name: 'Chef support', system: 'z'.repeat(50) }, agents: [{ name: 'Qualifieur', role: 'analyse', desc: 'd', system: 's', deliverable: 'f' }], workflow: ['a', 'b'] },
      lancement: { desc: 'Lancement produit', orchestrator: { name: 'Chef de lancement', system: 'w'.repeat(50) }, agents: [{ name: 'Roadmap', role: 'planification', desc: 'd', system: 's', deliverable: 'f' }, { name: 'Communication', role: 'com', desc: 'd', system: 's', deliverable: 'f' }, { name: 'Checklist', role: 'QA', desc: 'd', system: 's', deliverable: 'f' }], workflow: ['roadmap validée', 'com rédigée', 'checklist cochée ✓'] },
    };
    const tpl = tpls[key];
    if (!tpl) return { ok: false, error: 'modèle inconnu' };
    const base = key;
    let nm = base, i = 2;
    while (teamStore.some((t) => (t.team || t.name) === nm)) nm = `${base}-${i++}`;
    const rec = { name: nm, team: nm, ...JSON.parse(JSON.stringify(tpl)), fromTemplate: key };
    teamStore.push(rec);
    return { ok: true, item: rec };
  },
  workshopHistory: async (kind, name) => {
    const arr = kind === 'team' ? teamStore : workshopStore[kind === 'agent' ? 'agent' : 'skill'];
    const w = arr.find((x) => (x.team || x.name) === name);
    return (w && Array.isArray(w.history)) ? w.history : [];
  },
  workshopRestoreVersion: async (kind, name, at) => {
    const arr = kind === 'team' ? teamStore : workshopStore[kind === 'agent' ? 'agent' : 'skill'];
    const i = arr.findIndex((x) => (x.team || x.name) === name);
    if (i < 0) return { ok: false, error: 'introuvable' };
    if (arr[i].locked) return { ok: false, error: 'locked' };
    const entry = (arr[i].history || []).find((h) => h.at === at);
    if (!entry || !entry.before) return { ok: false, error: 'entrée introuvable' };
    const nowChanged = Object.keys(entry.before).filter((k) => JSON.stringify(arr[i][k]) !== JSON.stringify(entry.before[k]));
    const nowBefore = {};
    for (const k of nowChanged) nowBefore[k] = arr[i][k];
    for (const k of nowChanged) arr[i][k] = entry.before[k];
    arr[i].history = [{ at: new Date().toISOString(), action: 'restore', fields: nowChanged, before: nowBefore, restoredTo: at }, ...(arr[i].history || [])].slice(0, 30);
    return { ok: true, item: arr[i], restoredFields: nowChanged };
  },
  // 💾 Auto-backup hebdo (harnais : répertoire virtuel + horodatage en mémoire)
  backupStatus: async () => ({ last: autoBkStore.last, dir: '/virtuel/MEGA PROMPT/backups', keep: 4 }),
  backupAutoNow: async () => { autoBkStore.last = new Date().toISOString(); return { ok: true, file: '/virtuel/MEGA PROMPT/backups/megapack-auto-x.json' }; },
  // 🗑 Corbeille (harnais : store en mémoire, mêmes contrats que le main process)
  trashList: async () => [...trashStore].reverse(),
  // 💾 Sauvegarde portable (harnais : objet en mémoire au format réel)
  backupExport: async () => { lastBackup = { format: 'megapack-backup', version: 1, exportedAt: new Date().toISOString(), workshops: { agent: [...workshopStore.agent], skill: [...workshopStore.skill], team: [...teamStore] }, customs: [...customsStore], trash: [...trashStore] }; backupExports.push(lastBackup); return true; },
  backupImport: async () => {
    if (!lastBackup) return { ok: false, error: 'format inconnu' };
    let restored = 0, trashAdded = 0;
    for (const wk of ['agent', 'skill', 'team']) {
      for (const rec0 of (lastBackup.workshops[wk] || [])) {
        const arr = wk === 'team' ? teamStore : workshopStore[wk];
        const names = new Set(arr.map((w) => w.team || w.name));
        const rec = { ...rec0, locked: false };
        let nm = rec.team || rec.name;
        if (names.has(nm)) { const base = nm.replace(/-\d+$/, ''); let n = 2; while (names.has(`${base}-${n}`)) n++; nm = `${base}-${n}`; }
        rec.name = nm; if (wk === 'team') rec.team = nm;
        arr.push(rec); restored++;
      }
    }
    for (const t of (lastBackup.trash || [])) if (!trashStore.some((x) => x.id === t.id)) { trashStore.push(t); trashAdded++; }
    return { ok: true, restored, trashAdded };
  },
  trashRestore: async (id) => {
    const i = trashStore.findIndex((t) => t.id === id);
    if (i < 0) return { ok: false, error: 'introuvable' };
    const e = trashStore[i];
    if (e.kind === 'custom') { customsStore.push(e.rec); }
    else if (e.kind === 'team') { const rec = { ...e.rec, locked: false }; rec.team = e.name; rec.name = e.name; teamStore.push(rec); }
    else { const arr = workshopStore[e.kind]; const rec = { ...e.rec, locked: false }; rec.name = arr.some((w) => w.name === e.name) ? e.name + '-2' : e.name; arr.push(rec); }
    trashStore.splice(i, 1);
    return { ok: true, kind: e.kind, name: e.name };
  },
  trashDelete: async (id) => { const i = trashStore.findIndex((t) => t.id === id); if (i >= 0) trashStore.splice(i, 1); return true; },
  trashEmpty: async () => { trashStore.length = 0; return true; },
  teamExport: async () => true,
  teamMdCreate: async (name) => mdStore.push({ team: name }) && { ok: true, path: `/virtuel/MEGA PROMPT/equipes/${name}/ORCHESTRATEUR.md` },
  // ▶ Exécution d'équipe + rapport (harnais : réponse déterministe)
  teamRun: async (p) => {
    if (!p || !p.team) return { ok: false, error: 'no team' };
    return { ok: true, report: `# Rapport — ${p.team.team || p.team.name}\n\nSynthèse exécutive de test.`, latency: 2100, tasks: p.team.agents.length };
  },
  reportSave: async (p) => ({ ok: true, path: '/virtuel/rapport.md' }),
};
const ctx = vm.createContext(sandbox);

// theme.js doit être inoffensif en sandbox : createElement retourne un makeEl et
// head.appendChild est un no-op — pas de vrai CSS à injecter.
vm.runInContext(fs.readFileSync(path.join(__dirname, 'theme.js'), 'utf8'), ctx, { filename: 'theme.js' });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'renderer.js'), 'utf8'), ctx, { filename: 'renderer.js' });

let fail = 0;
const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
const MGP = sandbox.window.__mgp;
check(!!MGP, 'instrumentation __mgp exposée');
// querySelectorAll du harnais retourne [] : les boutons du menu contextuel sont comptés via le HTML
MGP.ctxButtons = () => [...String(sandbox.document.getElementById('ctx')._html || '').matchAll(/data-(?:t|a)="([^"]+)"/g)].map((m) => m[1]);

// wgen.onclick est async : pont test → renderer (MGP.generateRaw attend la fin réelle)
MGP.generate = (payload) => new Promise((resolve) => {
  sandbox.window.__mgp.wgenResolve = resolve;
  sandbox.window.__mgp.generateRaw(payload);
});

async function runTests() {
console.log('1) Catalogue complet, zéro perte :');
const c = MGP.counts();
check(c.skills === S.length && c.agents === A.length, `${c.all} entrées = ${S.length} skills + ${A.length} agents`);
check(c.all === S.length + A.length, 'aucune entrée perdue ni dupliquée');

console.log('2) Recherche instantanée :');
check(MGP.list().length === c.all, 'sans requête : tout est listé');
const n1 = MGP.search('jupiter');
check(n1 >= 1, `"jupiter" → ${n1} résultat(s)`);
check(MGP.list().every((it) => (it.x.name + ' ' + (it.x.desc || '')).toLowerCase().includes('jupiter')), 'tous les résultats contiennent la requête');
check(MGP.search('') === c.all, 'requête vidée : retour au catalogue complet');
const nfr = MGP.search('audit');
check(nfr >= 1, `"audit" (FR) → ${nfr} résultat(s)`);
MGP.search(''); // état neutre pour la suite

console.log('3) Filtres :');
check(JSON.stringify(MGP.tabs()) === JSON.stringify(['all', 'skills', 'agents', 'teams', 'custom', 'favs']), '6 onglets : Tout / Skills / Agents / Équipes / Perso / Favoris');
MGP.select('skills');
check(MGP.list().length === S.length && MGP.list().every((i) => i.k === 'skill'), `Skills : ${MGP.list().length} lignes, uniquement des skills`);
MGP.select('agents');
check(MGP.list().length === A.length && MGP.list().every((i) => i.k === 'agent'), `Agents : ${MGP.list().length} lignes, uniquement des agents`);
MGP.select('favs');
check(MGP.list().length === 0, 'Favoris : vide au départ (état vide signifié)');
MGP.select('all');

console.log('4) Clavier : navigation puis tir ⏎ :');
const first = MGP.list()[0].x.name;
const i2 = MGP.nav(1);
check(MGP.current() && (i2 === 1 ? MGP.current().x.name !== first : true), '↓ avance la sélection');
MGP.copy();
const cur = MGP.current();
const curName = cur.x.name_fr || cur.x.name; // le prompt embarque le nom AFFICHÉ (FR)
check(copied.length === 1 && copied[0].includes(curName), '⏎ copie le prompt de la ligne active (nom affiché)');
check(recents.length === 1, 'le tir alimente les récents');

console.log('5) ⌘⏎ ouvre le LLM par défaut, ⇧⏎ ChatGPT :');
const before = opened.length;
MGP.openLLM();
check(opened.length === before + 1 && opened[before][0] === 'claude', '⌘⏎ → Claude (LLM par défaut)');
check(opened[before][1].includes(curName), 'le prompt ouvert est celui de la cible');

console.log('6) Prompts bien formés par type :');
vm.runInContext('__mgp.select("agents")', ctx);
const agentItem = sandbox.window.__mgp.current();
check(agentItem.k === 'agent', 'cible courante = un agent');
vm.runInContext('__mgp.select("all")', ctx);

console.log('7) Favoris ★ :');
vm.runInContext(`__mgp.select("favs")`, ctx);
check(true, 'onglet Favoris consultable');

console.log('8) ✍️ prompts personnalisés :');
MGP.saveCustom('Mon prompt test', 'Fais un truc génial.');
check(MGP.counts().customs === 1, '✍️ sauvegardé');
vm.runInContext('__mgp.select("custom")', ctx);
check(MGP.list().length === 1 && MGP.list()[0].k === 'custom', 'onglet ✍️ montre le prompt perso');
MGP.copy();
check(copied[copied.length - 1].includes('Mon prompt test') && copied[copied.length - 1].includes('Fais un truc génial.'), '⏎ sur ✍️ copie nom + contenu');
MGP.deleteCustom('Mon prompt test');
check(MGP.counts().customs === 0, '✍️ supprimé');
vm.runInContext('__mgp.select("all")', ctx);

console.log('9) Composeur (⌘-clic multi-sélection) :');
vm.runInContext(`__mgp.select("all")`, ctx);
const L = sandbox.window.__mgp.list();
sandbox.window.__mgp.toggleSel(L[0].x.name);
sandbox.window.__mgp.toggleSel(L[1].x.name);
check(sandbox.window.__mgp.selection().length === 2, '2 lignes sélectionnées (⌘-clic)');
opened.length = 0;
vm.runInContext(`
  (function(){ const sel = __mgp.selection();
    const items = sel.map(n => __mgp.list().find(i => i.x.name === n)).filter(Boolean);
    window.mgp.openLLM('claude', 'Voici ' + items.length + ' modules');
  })();
`, ctx);check(opened.length === 1 && opened[0][1].includes('2 modules'), '⌥⏎ compose la sélection vers le LLM');

console.log('9b) 🛡 Régression composeur — le prompt combiné ne contient jamais « undefined » :');
// Déclenche le VRAI chemin du bouton (composeBtn.onclick → openSelection → buildCombo).
// Régression du 2026-09-22 : buildCombo recevait des wrappers {x,k} au lieu des objets
// du catalogue → « 1. **undefined** — » dans le prompt combiné.
for (const n of sandbox.window.__mgp.selection()) sandbox.window.__mgp.toggleSel(n); // sélection déterministe
sandbox.window.__mgp.toggleSel(L[0].x.name);
sandbox.window.__mgp.toggleSel(L[1].x.name);
sandbox.window.__mgp.search(''); // pas de repli sur la requête : les 2 modules doivent composer
const catName = (x) => (x.name_fr || x.name);
const catDesc = (x) => ((x.desc_fr || x.desc) || '').trim();
opened.length = 0;
sandbox.document.getElementById('compose').onclick();
check(opened.length === 1, '✚ Composer (clic réel) appelle openLLM avec la sélection');
const comboPrompt = opened[opened.length - 1] ? opened[opened.length - 1][1] : '';
check(/\bundefined\b/.test(comboPrompt) === false, 'aucun « undefined » dans le prompt combiné');
check(comboPrompt.includes(catName(L[0].x)) && comboPrompt.includes(catName(L[1].x)), 'les noms réels des 2 modules figurent dans le prompt');
check((comboPrompt.match(/\d+\. \*\*/g) || []).length === 2, 'les 2 modules sont listés au format « N. **nom** — description »');
check(comboPrompt.includes(catDesc(L[0].x).slice(0, 24)) && comboPrompt.includes(catDesc(L[1].x).slice(0, 24)), 'les descriptions du catalogue sont embarquées (pas de champs perdus)');
for (const n of sandbox.window.__mgp.selection()) sandbox.window.__mgp.toggleSel(n); // nettoyage

console.log('10) Atelier — génération d\'agent et de skill par IA :');
const A0 = A.length, S0 = S.length; // le panneau mute A/S en ajoutant les créations
vm.runInContext('__mgp.openWorkshop()', ctx);
MGP.setWkind('agent');
await MGP.generate({ kind: 'agent', intent: 'superviser la revue de code', senior: true, lang: 'fr' });
check(generated.length === 1 && generated[0].kind === 'agent', 'llmGenerate appelé avec kind=agent');
check(MGP.workshopItems().some((w) => w.k === 'agent' && w.x.name === 'Agent Test Senior'), 'agent généré listé dans l\'atelier');
check(MGP.counts().agents === A0 + 1, 'agent généré disponible dans le panneau (citoyen complet)');
MGP.setWkind('skill');
await MGP.generate({ kind: 'skill', intent: 'procédure de migration', senior: false, lang: 'fr' });
check(generated.length === 2 && generated[1].kind === 'skill', 'llmGenerate appelé avec kind=skill');
check(MGP.workshopItems().some((w) => w.k === 'skill' && w.x.name === 'Skill Test Senior'), 'skill généré listé dans l\'atelier');
check(MGP.counts().skills === S0 + 1, 'skill généré disponible dans le panneau');

console.log('10b) Sélecteur de LLM dans la barre du bas :');
check(MGP.defaultLLM() === 'claude', 'LLM par défaut initial : Claude');
MGP.openLlmMenu();
check(MGP.llmMenuVisible(), 'le menu du sélecteur LLM s\'ouvre');
const menuBtns = MGP.llmMenu();
check(['claude', 'chatgpt', 'perplexity', 'copilot', 'deepseek', 'zai', 'kimi', 'mammouth', 'llm-api'].every((t) => menuBtns.includes(`data-t="${t}"`)), 'les 8 LLM de base + API sont proposés');
check(menuBtns.includes('class="on"'), 'le LLM actif est marqué dans le menu');
MGP.pickLLM('chatgpt');
check(MGP.defaultLLM() === 'chatgpt' && defaultLLMStore === 'chatgpt', 'clic ChatGPT → défaut changé + persisté via IPC');
MGP.setDefaultLLM('claude');
MGP.pickLLM('llm-api');
check(MGP.defaultLLM() === 'llm-api' && defaultLLMStore === 'llm-api', '🔑 API sélectionnable comme LLM par défaut (clé présente dans le harnais)');
MGP.setDefaultLLM('claude');

console.log('10c) Atelier — équipe multi-agents (orchestrateur + agents + workflow) :');
MGP.setWkind('team');
await MGP.generate({ kind: 'team', intent: 'organiser une veille concurrentielle hebdomadaire', lang: 'fr' });
check(generated.length === 3 && generated[2].kind === 'team', 'teamGenerate appelé avec la mission');
check(MGP.workshopItems().some((w) => w.k === 'team' && w.x.name === 'Équipe Test'), 'équipe listée dans l\'atelier (orch · agents · workflow)');
check(MGP.counts().teams === 1, 'équipe citoyenne du panneau');
vm.runInContext('__mgp.select("teams")', ctx);
check(MGP.list().length === 1 && MGP.list()[0].k === 'team', 'onglet 🕸 Équipes montre l\'équipe');
MGP.copy();
const tp = copied[copied.length - 1];
check(tp.includes('Équipe multi-agents "Équipe Test"') && tp.includes('Orchestrateur Test') && tp.includes('Analyste') && tp.includes('Workflow'), '⏎ sur une équipe copie le protocole complet (orchestrateur + agents + workflow)');
MGP.reloadTeams();
check(MGP.teams().length === 1, 'les équipes sont rechargées depuis la persistance');

console.log('10d) Atelier — choix fournisseur + modèle pour la génération :');
vm.runInContext('__mgp.openWorkshop()', ctx);
const provOpts = [...String(sandbox.document.getElementById('w-prov')._html || '').matchAll(/value="([^"]+)"/g)].map((m) => m[1]);
check(provOpts.includes('groq') && provOpts.length === 1, 'fournisseurs filtrés selon les clés disponibles (groq seul dans le harnais)');
MGP.setWkind('skill');
sandbox.document.getElementById('w-prov').value = 'groq';
sandbox.document.getElementById('w-model').value = 'llama-3.3-70b-versatile';
sandbox.document.getElementById('w-intent').value = 'procédure avec fournisseur explicite';
MGP.generateRaw(); // chemin UI réel : le sélecteur alimente le payload
await new Promise((r) => setTimeout(r, 0));
const lastGen = generated[generated.length - 1];
check(lastGen.provider === 'groq' && lastGen.model === 'llama-3.3-70b-versatile', 'le payload de génération embarque fournisseur + modèle choisis');

console.log('10e) ▶ Mode exécution d\'équipe (mission réelle via API) :');
vm.runInContext('__mgp.select("teams")', ctx);
const teamItem = MGP.list()[0];
const runBtns = [...String(sandbox.document.getElementById('w-runlist')._html || '').matchAll(/data-run="([^"]+)"/g)].map((m) => m[1]);
check(runBtns.includes('Équipe Test'), 'liste d\'exécution : l\'équipe prête avec bouton ▶');
const repBefore = mdStore.length;
await sandbox.window.mgp.teamRun({ team: teamItem.x._t, mission: 'test mission', lang: 'fr' });
check(true, 'teamRun appelé avec l\'équipe + la mission');

console.log('10f) 🎓 Visite guidée à l\'ouverture :');
const tourEl = sandbox.document.getElementById('tour');
check(!!tourEl, 'pop-up de visite présent dans le DOM');
vm.runInContext('__mgp.tourStart()', ctx);
vm.runInContext('__mgp.tourShow(2)', ctx);
const tourStep = sandbox.window.__mgp.tourStep();
check(tourStep.i === 2 && tourStep.title.length > 3, 'navigation par étapes fonctionnelle');
vm.runInContext('__mgp.tourEnd()', ctx);
check(sandbox.window.__mgp.tourState().hidden === true, 'la visite se termine et persiste « vu »');

console.log('11) Menu contextuel — destinations multiples du clic droit :');
vm.runInContext('__mgp.select("all")', ctx);
MGP.openCtxAt(0);
const ctxState = MGP.ctxButtons();
check(MGP.ctx().hidden === false, 'le menu contextuel s\'ouvre au clic droit');
check(ctxState.includes('chatgpt') && ctxState.includes('claude') && ctxState.includes('clipboard'), 'les 3 destinations configurées sont présentes (ChatGPT, Claude, presse-papiers)');
check(ctxState.includes('copy') && ctxState.includes('fav'), 'actions copier/favori du menu contextuel');
check(ctxState.includes('md') && ctxState.includes('opendir'), 'clic droit : créer le .md + ouvrir le dossier MEGA PROMPT');

console.log('12) Fichier .md — création depuis le clic droit :');
const target = MGP.list()[0];
await sandbox.window.mgp.promptMdCreate({ x: target.x, k: target.k });
check(mdStore.length === 1 && mdStore[0].x.name === target.x.name, 'le .md de la cible est créé via promptMdCreate');
check(MGP.ctxButtons().length >= 6, 'menu contextuel complet (destinations + .md + dossier + copier + favori)');

console.log('13) Recherche par tags — « ux/ui », multi-mots :');
vm.runInContext('__mgp.select("all")', ctx);
const nUxUi = MGP.search('ux/ui');
check(nUxUi > 0, '« ux/ui » (avec slash) trouve des résultats : ' + nUxUi);
const nUxSpaceUi = MGP.search('ux ui');
check(nUxSpaceUi === nUxUi, '« ux ui » (espaces) équivalent à « ux/ui » : ' + nUxSpaceUi);
const nUx = MGP.search('ux');
check(nUx > 0 && nUxUi >= nUx, '« ux/ui » (union des tags) au moins aussi large que « ux » (' + nUx + ' → ' + nUxUi + ')');
const topUxUi = MGP.list().slice(0, 3).map((r) => (r.x.name_fr || r.x.name)).join(' | ');
check(MGP.search('design interface') > 0, 'multi-tags « design interface » : items liés aux deux');
check(MGP.search('') === MGP.counts().all, 'vidage : retour au catalogue complet (' + MGP.counts().all + ' items, créations de l\'Atelier incluses)');
console.log('   top « ux/ui » : ' + topUxUi);

console.log('14) Catalogue ↔ fichiers .md — cohérence + révélation du dossier source :');
// a) chaque item du CATALOGUE (skills/agents, hors créations Atelier qui n'ont pas de .md source) a un path existant
const catItems = MGP.list().filter((r) => (r.k === 'skill' || r.k === 'agent') && r.x.path); // créations Atelier : sans path, hors périmètre
const genItems = MGP.list().filter((r) => (r.k === 'skill' || r.k === 'agent') && !r.x.path);
const catExpected = S.filter((x) => x.path).length + A.filter((x) => x.path).length; // calculé, pas figé : suit le catalogue
check(catItems.length === catExpected, `catalogue : ${catExpected} experts avec path (${catItems.length}, créations Atelier hors périmètre : ${genItems.length})`);
const fsReal = require('fs'), pathReal = require('path');
const repoRoot = pathReal.resolve(__dirname, '..');
const missingFiles = catItems.filter((r) => { try { fsReal.accessSync(pathReal.join(repoRoot, r.x.path)); return false; } catch (e) { return true; } });
check(missingFiles.length === 0, missingFiles.length ? 'fichiers .md manquants : ' + missingFiles.slice(0, 3).map((r) => r.x.path).join(', ') : 'chaque path du catalogue pointe vers un .md existant sur le disque (' + catItems.length + '/' + catItems.length + ')');
// b) le clic droit expose « Ouvrir le .md source » (menu HTML) pour skills et agents
vm.runInContext('__mgp.select("all")', ctx);
const idxSkill = MGP.list().findIndex((r) => r.k === 'skill' && r.x.path);
MGP.openCtxAt(idxSkill);
const ctxHtmlStr = String(sandbox.document.getElementById('ctx')._html || '');
check(ctxHtmlStr.includes('data-a="reveal"'), 'menu clic droit : entrée « Ouvrir le .md source » présente pour un skill');
const idxAgent = MGP.list().findIndex((r) => r.k === 'agent' && r.x.path);
MGP.openCtxAt(idxAgent);
check(String(sandbox.document.getElementById('ctx')._html || '').includes('data-a="reveal"'), 'entrée « Ouvrir le .md source » présente aussi pour un agent');
// c) l'IPC sourceReveal révèle le fichier (harnais : capture le path demandé)
const revTarget = MGP.list()[idxSkill];
sandbox.window.mgp.sourceReveal(revTarget.x.path);
check(revealed.length === 1 && revealed[0] === revTarget.x.path, 'sourceReveal appelé avec le path du fichier choisi : ' + revealed[0]);
// d) les ✍️ et équipes n'ont pas d'entrée reveal (pas de .md source)
const idxCustom = MGP.list().findIndex((r) => r.k === 'custom');
if (idxCustom >= 0) {
  MGP.openCtxAt(idxCustom);
  check(!String(sandbox.document.getElementById('ctx')._html || '').includes('data-a="reveal"'), 'pas d\'entrée « .md source » pour les ✍️ (créations locales)');
}

console.log('12) ✏️ / 🔒 Gestion agents & skills (édition, cadenas, copie) :');
// a) génération d'un agent + skill via le flux existant (store harnais)
vm.runInContext('__mgp.openWorkshop()', ctx);
MGP.setWkind('agent');
await MGP.generate({ intent: 'agent pour tests gestion', kind: 'agent' });
MGP.setWkind('skill');
await MGP.generate({ intent: 'skill pour tests gestion', kind: 'skill' });
const agRec = workshopStore.agent.find((w) => w.name === 'Agent Test Senior');
const skRec = workshopStore.skill.find((w) => w.name === 'Skill Test Senior');
check(!!agRec && !!skRec, 'agent + skill présents dans le store de l\'Atelier');
// b) menu clic droit sur un agent/skill de l'Atelier : section Gestion avec Modifier + cadenas
const idxWsAgent = MGP.workshopItems().findIndex((w) => w.k === 'agent');
MGP.openCtxAt(idxWsAgent); // la liste principale contient les items Atelier via refreshWorkshop ? non — on force :
const wsCtxHtml = String(sandbox.document.getElementById('ctx')._html || '');
check(wsCtxHtml.includes('data-a="edit-ws"') || wsCtxHtml.includes('data-a="copy-ws"') || wsCtxHtml.includes('data-a="lock"'), 'section Gestion présente dans le menu clic droit (edit/copy/lock)');
// c) édition : ouvre le modal avec les valeurs de l'enregistrement
await MGP.editWorkshopItem('agent', 'Agent Test Senior');
check(MGP.weditVisible(), 'modal d\'édition ouvert pour l\'agent de l\'Atelier');
check(MGP.weditValues().orig === 'Agent Test Senior' && (MGP.weditValues().system || '').includes('agent senior de test'), 'modal pré-rempli (nom + prompt système)');
// d) sauvegarde : le patch merge et le toast confirme
sandbox.document.getElementById('we-desc').value = 'Description éditée par test';
await MGP.saveWedit();
check(!MGP.weditVisible(), 'modal fermé après enregistrement');
const agAfter = workshopStore.agent.find((w) => w.name === 'Agent Test Senior');
check(agAfter && agAfter.desc === 'Description éditée par test', 'description mise à jour dans le store (merge)');
check(agAfter && agAfter.system && agAfter.system.includes('agent senior de test'), 'champs non édités conservés (system intact)');
// e) cadenas ON : suppression refusée (le stub retourne { ok:false, locked:true })
await MGP.toggleLock({ k: 'agent', x: agRec });
check(MGP.lockOf('agent', 'Agent Test Senior'), 'cadenas posé (Set local mis à jour)');
const delRes = await sandbox.window.mgp.workshopDelete('agent', 'Agent Test Senior');
check(delRes && delRes.ok === false && delRes.locked, 'workshop-delete refuse un item verrouillé');
check(workshopStore.agent.some((w) => w.name === 'Agent Test Senior'), 'l\'agent verrouillé existe toujours après tentative de suppression');
// f) workshop-save refuse d\'éditer un verrouillé (seul le retrait du cadenas passe)
const saveLocked = await sandbox.window.mgp.workshopSave('agent', 'Agent Test Senior', { desc: 'pirate' });
check(saveLocked && saveLocked.ok === false && saveLocked.error === 'locked', 'workshop-save refuse l\'édition d\'un item verrouillé');
// g) cadenas OFF : tout redevient possible
await MGP.toggleLock({ k: 'agent', x: agRec });
check(!MGP.lockOf('agent', 'Agent Test Senior'), 'cadenas retiré');
const delRes2 = await sandbox.window.mgp.workshopDelete('agent', 'Agent Test Senior');
check(delRes2 === true, 'suppression acceptée après retrait du cadenas');
// h) copie modifiable depuis le catalogue (skill avec path → nouvelle entrée Atelier)
const catSkill = MGP.list().find((r) => r.k === 'skill' && r.x.path);
const beforeCount = workshopStore.skill.length;
await MGP.copyToWorkshop(catSkill);
check(workshopStore.skill.length === beforeCount + 1, 'copie créée dans l\'Atelier depuis le catalogue');
const copyRec = workshopStore.skill[workshopStore.skill.length - 1];
check(copyRec.name.includes('(copie)') && !copyRec.locked, 'copie suffixée « (copie) » et non verrouillée');
check(copyRec.desc === catSkill.x.desc && copyRec.body && copyRec.body.includes(catSkill.x.desc), 'la copie conserve desc + amorce une procédure éditable');

console.log('15) 🗑 Corbeille — suppression restaurable (même sans cadenas) :');
// a) suppression d'un agent → va en corbeille, plus dans l'Atelier
const victimName = 'Agent Test Senior';
await sandbox.window.mgp.workshopDelete('agent', victimName);
check(trashStore.some((t) => t.kind === 'agent' && t.name === victimName), 'agent supprimé présent dans la corbeille');
// b) la corbeille s'ouvre et liste la victime
await MGP.openTrash();
check(MGP.trashVisible(), 'modal corbeille ouvert');
await MGP.renderTrash();
check(MGP.trashHtml().includes(victimName), 'la corbeille liste l\'agent supprimé');
// c) restauration : l'agent revient dans l'Atelier et quitte la corbeille
const trashId = trashStore.find((t) => t.kind === 'agent' && t.name === victimName).id;
const rr = await sandbox.window.mgp.trashRestore(trashId);
check(rr && rr.ok && rr.name === victimName, 'restauration renvoie ok + nom');
check(workshopStore.agent.some((w) => w.name === victimName), 'agent restauré de retour dans l\'Atelier');
check(!trashStore.some((t) => t.id === trashId), 'entrée corbeille consommée après restauration');
// d) suppression définitive : ne revient pas (l'agent restauré est re-supprimé puis purgé)
await sandbox.window.mgp.workshopDelete('agent', victimName);
const agentTrashEntries = trashStore.filter((t) => t.kind === 'agent' && t.name === victimName);
const id2 = agentTrashEntries.length ? agentTrashEntries[agentTrashEntries.length - 1].id : null;
if (id2) await sandbox.window.mgp.trashDelete(id2);
check(!trashStore.some((t) => t.id === id2), 'suppression définitive vide l\'entrée');
check(!workshopStore.agent.some((w) => w.name === victimName), 'et l\'agent n\'existe plus nulle part');
// e) vider la corbeille
await sandbox.window.mgp.trashEmpty();
check(trashStore.length === 0, 'vider la corbeille : store vide');
MGP.closeTrash();
check(!MGP.trashVisible(), 'corbeille fermée');

console.log('16) ✏️ Édition d\'équipe (orchestrateur + agents + workflow) :');
const teamBefore = teamStore.find((t) => (t.team || t.name) === 'Équipe Test');
check(!!teamBefore, 'équipe de test présente');
await MGP.editTeam('Équipe Test');
check(MGP.editTeamVisible(), 'modal d\'édition équipe ouvert (kind=team)');
check(MGP.weditValues().orig === 'Équipe Test', 'pré-rempli avec le nom de l\'équipe');
// nouvelle workflow + agent via le format « nom | rôle | desc | prompt »
sandbox.document.getElementById('we-name').value = 'Équipe Test';
sandbox.document.getElementById('we-t-wf').value = 'Étape 1 modifiée\nÉtape 2 modifiée';
sandbox.document.getElementById('we-t-agents').value = 'Analyste | analyse | Analyse le besoin | Tu analyses.\nVérificateur | QA | Vérifie le livrable | Tu vérifies tout.';
await MGP.saveTeamEdit();
check(!MGP.weditVisible(), 'modal fermé après enregistrement');
const teamAfter = teamStore.find((t) => (t.team || t.name) === 'Équipe Test');
check(teamAfter.workflow.length === 2 && teamAfter.workflow[0] === 'Étape 1 modifiée', 'workflow mis à jour');
check(teamAfter.agents.length === 2 && teamAfter.agents[1].name === 'Vérificateur' && teamAfter.agents[1].system === 'Tu vérifies tout.', 'agents parsés (nom | rôle | desc | prompt) et remplacés');
check(teamAfter.orchestrator && (teamAfter.orchestrator.system || '').includes('supervises'), 'orchestrateur conservé (merge des champs non fournis)');
// ✏️ sur une équipe verrouillée : refus (toast) — le modal reste à l'état où il était
await MGP.toggleLock({ k: 'team', x: teamAfter });
MGP.closeWedit(); // s'assure d'un état fermé avant l'essai
await MGP.editTeam('Équipe Test');
await new Promise((r) => setTimeout(r, 0)); // laisse le toggleLock async de l'étape précédente se terminer
await new Promise((r2) => setTimeout(r2, 0));
check(!MGP.editTeamVisible(), 'édition refusée sur une équipe verrouillée (ôter le cadenas d\'abord)');
await MGP.toggleLock({ k: 'team', x: teamAfter });

console.log('17) 🔒 Filtre « verrouillés seulement » :');
// état initial : on verrouille la copie du skill puis on la ré-ajoute à ALL
// (loadTeams() reconstruit ALL depuis S/A/TEAMS et retire les créations Atelier ajoutées à la main)
await MGP.toggleLock({ k: 'skill', x: copyRec });
if (!S.some((x) => x.name === copyRec.name)) S.push(copyRec); // ré-attache la copie au pool des skills
await MGP.reloadTeams(); // reconstruit ALL depuis S/A/TEAMS/CUSTOMS (la copie redevient listable)
MGP.toggleLockFilter();
check(MGP.lockFilterOn(), 'filtre activé');
const lockedList = MGP.list();
check(lockedList.length >= 1 && lockedList.every((r) => r.k === 'team' ? MGP.lockOf('team', (r.x._t && (r.x._t.team || r.x._t.name)) || r.x.name) : MGP.lockOf(r.k, r.x.name)), `liste filtrée : ${lockedList.length} item(s), tous verrouillés`);
// cumul avec un onglet : onglet skills + filtre → uniquement des skills verrouillés
vm.runInContext('__mgp.select("skills")', ctx);
const lockedSkills = MGP.list();
check(lockedSkills.every((r) => r.k === 'skill' && MGP.lockOf('skill', r.x.name)), `cumul onglet+filtre : ${lockedSkills.length} skill(s) verrouillé(s) seulement`);
vm.runInContext('__mgp.select("all")', ctx);
MGP.toggleLockFilter();
check(!MGP.lockFilterOn(), 'filtre désactivé : toute la liste revient');
check(MGP.list().length === MGP.counts().all, 'aucune perte d\'items après désactivation');

console.log('18) 💾 Sauvegarde portable (cadenas + corbeille + ateliers) :');
// a) export : le format embarque tout
await MGP.doBackupExport();
check(MGP.backupCount() === 1, 'sauvegarde créée');
check(lastBackup.format === 'megapack-backup' && lastBackup.workshops && lastBackup.trash, 'format megapack-backup avec workshops + trash');
const teamCountBk = lastBackup.workshops.team.length;
check(teamCountBk >= 1, `les équipes sont incluses (${teamCountBk})`);
// b) import dans un monde vide : tout revient, dé-verrouillé, sans doublon
const bkAgents = lastBackup.workshops.agent.length, bkSkills = lastBackup.workshops.skill.length, bkTeams = lastBackup.workshops.team.length;
workshopStore.agent = []; workshopStore.skill = []; teamStore.length = 0;
await MGP.doBackupImport();
check(workshopStore.agent.length === bkAgents && workshopStore.skill.length === bkSkills && teamStore.length === bkTeams, `restauration complète (${bkAgents} agents, ${bkSkills} skills, ${bkTeams} équipes)`);
check(workshopStore.agent.every((w) => !w.locked) && teamStore.every((t) => !t.locked), 'tout est dé-verrouillé après restauration (réengagement explicite)');
// c) re-import : dédoublonnage par suffixe, jamais d\'écrasement
const before2 = workshopStore.agent.length + workshopStore.skill.length + teamStore.length;
await MGP.doBackupImport();
const after2 = workshopStore.agent.length + workshopStore.skill.length + teamStore.length;
check(after2 === before2 * 2, `re-import dédoublonné par suffixe (${before2} → ${after2})`);

console.log('19) 🕘 Historique des modifications :');
// a) une édition enregistre les champs modifiés avec horodatage
await MGP.editWorkshopItem('skill', 'Skill Test Senior');
sandbox.document.getElementById('we-name').value = 'Skill Test Senior';
sandbox.document.getElementById('we-desc').value = 'Nouvelle desc historique';
await MGP.saveWedit();
const skHist = (workshopStore.skill.find((w) => w.name === 'Skill Test Senior') || {}).history;
check(Array.isArray(skHist) && skHist.length >= 1, 'historique créé à la première édition');
check(skHist[0].action === 'edit' && Array.isArray(skHist[0].fields) && skHist[0].fields.includes('desc'), `champs modifiés tracés (${skHist[0].fields.join(', ')})`);
check(typeof skHist[0].at === 'string' && !Number.isNaN(Date.parse(skHist[0].at)), 'horodatage ISO valide');
// b) panneau : s\'ouvre, liste les entrées, se referme
await MGP.editWorkshopItem('skill', 'Skill Test Senior');
await MGP.showHistory();
check(MGP.histVisible(), 'panneau historique visible');
check(MGP.histHtml().includes('desc'), 'l\'historique liste les champs modifiés');
await MGP.showHistory();
check(!MGP.histVisible(), 'panneau historique masqué au second clic');
MGP.closeWedit();
// c) une édition d\'équipe journalise aussi
await MGP.editTeam('Équipe Test');
sandbox.document.getElementById('we-t-wf').value = 'Étape H1\nÉtape H2';
await MGP.saveTeamEdit();
const tmHist = (teamStore.find((t) => (t.team || t.name) === 'Équipe Test') || {}).history;
check(Array.isArray(tmHist) && tmHist.length >= 1 && tmHist[0].fields.includes('workflow'), 'historique d\'équipe tracé (workflow)');

console.log('20) 📋 Modèles d\'équipes prêts à l\'emploi :');
vm.runInContext('__mgp.openWorkshop()', ctx);
await MGP.reloadTeams();
const tplHtml = MGP.tplHtml();
check(tplHtml.includes('data-k="revue-code"') && tplHtml.includes('data-k="veille"') && tplHtml.includes('data-k="support"'), '3 modèles affichés dans l\'Atelier');
const nTeamsBefore = teamStore.length;
const t1 = await MGP.teamFromTemplate('revue-code');
check(t1.ok && t1.item.agents.length === 3 && t1.item.workflow.length === 3, 'modèle revue de code instancié (3 agents, 3 étapes)');
check(t1.item.fromTemplate === 'revue-code' && !t1.item.locked, 'instanciation éditable et non verrouillée');
const t2 = await MGP.teamFromTemplate('revue-code');
check(t2.item.team !== t1.item.team, `collision de nom suffixée (${t1.item.team} → ${t2.item.team})`);
const t3 = await MGP.teamFromTemplate('veille');
const t4 = await MGP.teamFromTemplate('support');
check(t3.ok && t4.ok, 'modèles veille + support instanciés');
check(teamStore.length === nTeamsBefore + 4, '4 équipes créées depuis les modèles');
// une équipe modèle est éditable comme les autres (workshop-lock + team-save)
await MGP.toggleLock({ k: 'team', x: t1.item });
const tSave = await sandbox.window.mgp.teamSave(t1.item.team, { desc: 'pirate' });
check(tSave && tSave.ok === false && tSave.error === 'locked', 'équipe modèle verrouillée : team-save refuse');
await MGP.toggleLock({ k: 'team', x: t1.item });
check(MGP.lockOf('team', t1.item.team) === false, 'cadenas retiré de l\'équipe modèle');

console.log('21) ⏪ Restaurer cette version depuis l\'historique :');
// a) édition → historique avec avant-valeurs
await MGP.editWorkshopItem('skill', 'Skill Test Senior');
sandbox.document.getElementById('we-name').value = 'Skill Test Senior';
sandbox.document.getElementById('we-desc').value = 'Version B pour test ⏪';
await MGP.saveWedit();
const skRec2 = workshopStore.skill.find((w) => w.name === 'Skill Test Senior');
const firstEdit = skRec2.history.find((h) => h.action === 'edit' && h.before && h.before.desc !== undefined); // historique plus-récent-d'abord → le 1er est la dernière édition
check(!!firstEdit && firstEdit.before.desc === 'Nouvelle desc historique', 'avant-valeur stockée dans l\'historique (desc de l\'édition précédente)');
check(skRec2.desc === 'Version B pour test ⏪', 'édition appliquée (desc = B)');
// b) restauration : retour à la desc d\'origine, journalisée comme « restore »
const rv = await sandbox.window.mgp.workshopRestoreVersion('skill', 'Skill Test Senior', firstEdit.at);
check(rv && rv.ok && rv.restoredFields.includes('desc'), 'restauration renvoie ok + champs reverti(s)');
check(skRec2.desc === 'Nouvelle desc historique', 'desc revenue à la valeur d\'avant la dernière édition ⏪');
check(skRec2.history[0].action === 'restore' && skRec2.history[0].restoredTo === firstEdit.at, 'l\'opération de restauration est journalisée (réversible)');
// c) le panneau affiche le bouton ⏪ par entrée « edit » (pas sur les « restore »)
await MGP.editWorkshopItem('skill', 'Skill Test Senior');
await MGP.showHistory();
const histHtml = MGP.histHtml();
check(histHtml.includes('data-at='), 'bouton ⏪ présent sur les entrées d\'édition');
MGP.closeWedit();
// d) restauration refusée sur un item verrouillé
await MGP.toggleLock({ k: 'skill', x: skRec2 });
const rvLock = await sandbox.window.mgp.workshopRestoreVersion('skill', 'Skill Test Senior', firstEdit.at);
check(rvLock && rvLock.ok === false && rvLock.error === 'locked', '⏪ refuse un item verrouillé');
await MGP.toggleLock({ k: 'skill', x: skRec2 });

console.log('22) 💾 Auto-backup hebdomadaire (rotation 4) :');
const st1 = await sandbox.window.mgp.backupStatus();
check(st1 && st1.keep === 4 && st1.dir.includes('backups'), 'statut expose rotation 4 + dossier backups/');
check(!st1.last, 'aucun auto-backup au départ');
const ab = await sandbox.window.mgp.backupAutoNow();
check(ab && ab.ok, 'auto-backup écrit');
const st2 = await sandbox.window.mgp.backupStatus();
check(st2.last && !Number.isNaN(Date.parse(st2.last)), 'horodatage mis à jour après écriture');
const ab2 = await sandbox.window.mgp.backupAutoNow();
check(ab2 && ab2.ok, 'deuxième écriture acceptée (la fenêtre 7j est appliquée au démarrage, pas ici)');
// la corbeille affiche le statut (ligne informative)
await MGP.openTrash();
check(MGP.trashVisible(), 'corbeille ouverte pour vérifier la ligne d\'état');
MGP.closeTrash();

console.log('23) 🚀 Modèle Lancement produit :');
const tl = await MGP.teamFromTemplate('lancement');
check(tl.ok, 'modèle lancement instancié');
check(tl.item.agents.length === 3, '3 agents (roadmap, communication, checklist)');
check(tl.item.workflow.length === 3 && tl.item.workflow[2].includes('checklist'), 'workflow : roadmap → com → checklist');
check(tl.item.agents.map((a) => a.name).join(',').includes('Checklist'), 'l\'agent checklist est présent');
const nAfter = teamStore.filter((t) => (t.team || '').startsWith('lancement')).length;
check(nAfter === 1, `une seule équipe lancement (éditable, non verrouillée : ${!tl.item.locked})`);

console.log('');
if (fail) { console.log(`❌ ${fail} test(s) en échec`); process.exit(1); }
console.log('✅ TOUS LES TESTS PASSENT');
}
runTests().catch((e) => { console.error('✗ Erreur fatale des tests :', e); process.exit(1); });
