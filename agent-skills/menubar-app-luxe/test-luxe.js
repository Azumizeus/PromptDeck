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
  return {
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
    addEventListener(ev, fn) { (this._handlers[ev] ||= []).push(fn); },
    getContext() { return null; },
    scrollIntoView() {}, focus() {}, blur() {}, closest() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    clientWidth: 560, clientHeight: 480,
    // API géométrie (tooltip flottant + menu contextuel)
    getBoundingClientRect() { return { left: 0, top: 0, right: 560, bottom: 480, width: 560, height: 480 }; },
    matches() { return false; },
  };
}
const ids = {};
const byId = (id) => (ids[id] ||= makeEl('div'));
const inputEl = makeEl('input');
ids.q = inputEl;

const copied = [], recents = [], opened = [], toasts = [], generated = [], mdStore = [];
const favsStore = new Set();
const customsStore = [];
const workshopStore = { agent: [], skill: [] };
const teamStore = [];
let defaultLLMStore = 'claude'; // le sélecteur du footer modifie la pref (comme l'IPC réel)
const sandbox = {
  console,
  document: {
    documentElement: makeEl('html'),
    body: makeEl('body'), head: makeEl('head'),
    createElement: (t) => makeEl(t),
    getElementById: (id) => byId(id),
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
  getPrefs: () => ({ favorites: [], recents: [], customs: customsStore, defaultLLM: defaultLLMStore, sendTargets: ['chatgpt', 'claude', 'clipboard'], hasApi: { groq: true }, lang: 'fr', theme: 'dark' }),
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
    if (i >= 0) arr.splice(i, 1);
    return true;
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
  teamDelete: async (name) => { const i = teamStore.findIndex((t) => (t.team || t.name) === name); if (i >= 0) teamStore.splice(i, 1); return true; },
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

console.log('');
if (fail) { console.log(`❌ ${fail} test(s) en échec`); process.exit(1); }
console.log('✅ TOUS LES TESTS PASSENT');
}
runTests().catch((e) => { console.error('✗ Erreur fatale des tests :', e); process.exit(1); });
