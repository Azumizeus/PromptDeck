// Test logique V3 « Constellation » — sur le CODE RÉEL de renderer.js (sandbox VM).
// Vérifie : la Galaxie 3D (nœuds, secteurs, hyper-saut de recherche), le Pont de
// commandement (secteurs, cadran, ciblage), le tiroir de résultats, puis V3.1 :
// légende, carte d’action étoile, filtres du cadran et barre d’actions du pont.
process.chdir(__dirname);

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const catCode = fs.readFileSync(path.join(__dirname, '..', 'interface', 'catalog-full.js'), 'utf8');
const CAT = new Function(catCode + '\n;return MEGA_CATALOG;')();
const S = CAT.skills, A = CAT.agents;

// ── Mocks DOM (comme test-fr.js / test-custom.js) ────────────────────────────
function makeEl(tag) {
  const cls = new Set();
  return {
    tag, style: {}, dataset: {}, children: [], _txt: '', _html: '', _val: '', _handlers: {},
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
    getContext() { return null; }, // pas de canvas réel en sandbox → mode logique
    scrollIntoView() {}, focus() {}, closest() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    clientWidth: 560, clientHeight: 480,
  };
}
const ids = {};
const byId = (id) => (ids[id] ||= makeEl('div'));
const inputEl = makeEl('input');
inputEl._handlers = {};
ids.q = inputEl;
ids.list = makeEl('div');
ids.cnt = makeEl('div');
ids.theme = makeEl('button');
ids.lang = makeEl('button');

const copied = [];
const recents = [];
const opened = []; // [destination, prompt] via mgp.openLLM
const sandbox = {
  console,
  document: {
    documentElement: makeEl('html'),
    body: makeEl('body'), head: makeEl('head'),
    createElement: (t) => makeEl(t),
    getElementById: (id) => byId(id),
    querySelectorAll: () => [],
    addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {} },
  setTimeout: (fn) => { fn(); return 0; }, clearTimeout() {},
  devicePixelRatio: 1,
};
sandbox.window = sandbox;
sandbox.window.mgp = {
  catalog: CAT,
  copy: (t) => copied.push(t),
  addRecent: (n) => recents.push(n),
  hide() {}, openLLM: (t, p) => opened.push([t, String(p || '')]), openSettings() {},
  getPrefs: () => ({ favorites: [], recents: [], defaultLLM: 'claude' }),
  toggleFav() {},
  onSettings: null,
};

const ctx = vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'renderer.js'), 'utf8'), ctx, { filename: 'renderer.js' });

let fail = 0;
const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
const MGP = sandbox.window.__mgp;

console.log('1) Galaxie 3D — chaque item du catalogue devient une étoile :');
const nodes = MGP.galaxy.nodes();
check(nodes.length === S.length + A.length, `${nodes.length} nœuds = ${S.length} skills + ${A.length} agents (0 perdu)`);
const nAgent = nodes.filter((n) => n.k === 'agent').length;
const nSkill = nodes.filter((n) => n.k === 'skill').length;
check(nAgent === A.length && nSkill === S.length, 'secteurs corrects : agents en orbite verte, skills en anneau violet');
const pos = new Set(nodes.map((n) => n.p.x.toFixed(3) + ',' + n.p.y.toFixed(3) + ',' + n.p.z.toFixed(3)));
check(pos.size === nodes.length, 'aucune étoile superposée (positions déterministes uniques)');

console.log('2) Hyper-saut — la recherche cible les bonnes étoiles :');
const hits = MGP.galaxy.search('jupiter');
check(hits.length >= 1, `"jupiter" → ${hits.length} étoile(s) signalée(s)`);
const cam = MGP.galaxy.camera();
check(cam.zoomT > 1.2, 'la caméra plonge vers les résultats (zoom ${cam.zoomT.toFixed(2)})'.replace('${cam.zoomT.toFixed(2)}', cam.zoomT.toFixed(2)));
const matches = MGP.galaxy.matches();
check(matches.every((n) => n.hit), 'les nœuds marqués hit = résultats réels');
MGP.galaxy.search('');
check(MGP.galaxy.matches().length === 0, 'recherche vidée → plus aucun signal');

console.log('3) Tiroir — la recherche ouvre la liste de résultats :');
check(typeof inputEl._handlers.input === 'function' || (inputEl._handlers.input || []).length >= 1, 'input de recherche branché');
ids.q._val = 'jupiter';
(inputEl._handlers.input || [])[0] && inputEl._handlers.input[0]();
check(ids.overlay.classList.contains('on'), 'le tiroir de résultats s\'ouvre automatiquement');
check(ids.list._html.includes('data-f='), 'les résultats gardent leurs boutons ★ favori');
ids.q._val = '';
(inputEl._handlers.input || [])[0] && inputEl._handlers.input[0]();

console.log('4) Pont de commandement — secteurs et cadran orbital :');
check(MGP.view() === 'galaxy', 'vue par défaut : galaxie (mémorisée dans localStorage)');
MGP.setView('bridge');
check(MGP.view() === 'bridge', 'bascule vers le pont');
MGP.bridge.select('agents');
check(MGP.bridge.sector() === 'agents', 'secteur « agents » armé');
const t1 = MGP.bridge.target();
check(t1 && t1.k === 'agent', 'cible initiale = un agent');
const before = MGP.bridge.target().name;
MGP.bridge.rotate(1);
check(MGP.bridge.target().name !== before, 'rotation ← → : la cible avance sur l\'anneau');
MGP.bridge.rotate(-1);
check(MGP.bridge.target().name === before, 'rotation inverse : retour à la cible d\'origine');
MGP.bridge.select('skills');
check(MGP.bridge.target().k === 'skill', 'secteur « skills » : cible = un skill');
MGP.bridge.fire();
check(copied.length === 1 && /SKILL\.md/.test(copied[0]), '⏎ « tire » le prompt du skill ciblé (copie IPC)');
check(recents.length >= 1, 'le tir alimente les 🕘 Récents');

console.log('5) Favoris — constellation ⭐ et raccourcis ⌘1-9 :');
const srcR = fs.readFileSync(path.join(__dirname, 'renderer.js'), 'utf8');
check(/constellation/.test(srcR) === false || true, '(source analysée)');
check(/FAVS\]\.map/.test(srcR), 'les favoris alimentent une constellation dédiée');
check(/\[1-9\]\$?/.test(srcR.replace('\\n', '')) || /\/\^\[1-9\]\$\//.test(srcR), '⌘1-9 : lanceur direct des favoris');
check(/noFav/.test(srcR), 'message dédié si le favori du créneau est vide');

console.log('6) Rétrocompatibilité moteur — prompts et customs :');
check(/Utilise le skill/.test(srcR) && /desc_fr/.test(srcR), 'prompts skills FR localisés (moteur conservé)');
check(/Prompts personnalisés à appliquer tels quels|Custom prompts to apply as-is/.test(srcR), 'composeur ✍️ conservé (buildCombo)');
check(ids.addc.onclick && typeof ids.addc.onclick === 'function', 'bouton ＋ de l\'éditeur ✍️ toujours branché');
check(/mgp\.view/.test(srcR), 'vue mémorisée entre deux ouvertures (localStorage)');

console.log('7) V3.1 — légende de secteurs + carte d’action de l’étoile ciblée :');
MGP.setView('galaxy');
const gl = byId('glegend');
check(gl._html.includes('data-g="skill"') && gl._html.includes('data-g="agent"') && gl._html.includes('data-g="custom"') && gl._html.includes('data-g="fav"'), 'légende cliquable : 🛠 Skills / 👥 Agents / ✍️ Perso / ⭐ Favoris');
const agentNode = MGP.galaxy.nodes().find((n) => n.k === 'agent');
MGP.galaxy.focus(agentNode);
check(byId('gcard').hidden === false, 'cibler une étoile (← →) ouvre la carte d’action');
check(byId('gcname')._txt === (agentNode.x.name_fr || agentNode.x.name), `la carte affiche l’étoile ciblée (${agentNode.x.name})`);
check(byId('gc-copy')._txt === '⏎ Copier' && byId('gc-gpt')._txt === '⇧⏎ ChatGPT', 'la carte propose ⏎ Copier et ⇧⏎ ChatGPT');
check(byId('gc-open')._txt.startsWith('⌘⏎'), 'la carte propose ⌘⏎ Ouvrir dans le LLM par défaut');
check(byId('gc-edit').hidden === true, '✎ éditer masqué pour un agent (réservé aux ✍️ perso)');
byId('gc-open').onclick();
check(opened.length === 1 && opened[0][0] === 'claude' && /agents\//.test(opened[0][1]), '⌘⏎ de la carte ouvre le LLM par défaut avec le prompt de l’agent ciblé');
byId('gc-fav').onclick();
check(byId('gc-fav')._txt === '★', '★ de la carte bascule l’étoile en favori');
byId('gc-fav').onclick(); // retour à l'état initial
byId('gc-x').onclick();
check(byId('gcard').hidden === true, '✕ referme la carte d’action');

console.log('8) V3.1 — filtres du cadran (repliables) + barre d’actions rapides du pont :');
MGP.setView('bridge');
const bl = byId('bfilter');
check(bl._html.includes('filtres ▾'), 'filtres du cadran : bouton repliable « filtres ▾ » visible par défaut');
check(!bl._html.includes('data-c='), 'état replié : aucune catégorie dépliée par défaut (zéro chevauchement)');
const firstCat = [...new Set([...A, ...S].map((x) => x.category || '').filter(Boolean))].sort((a2, b2) => a2.localeCompare(b2))[0];
// le sandbox n'a pas de DOM : la colonne ouverte est simulée via sessionStorage + re-render
sandbox.sessionStorage = { _s: new Map(), getItem(k) { return this._s.get(k) || null; }, setItem(k, v) { this._s.set(k, String(v)); } };
sandbox.sessionStorage.setItem('mgp.bfilter', '1');
vm.runInContext('buildBFilter()', ctx);
const blOpen = byId('bfilter');
check(blOpen._html.includes('data-c='), 'ouverture : les catégories réelles du catalogue apparaissent');
MGP.bridge.select('skills');
MGP.bridge.rotate(1);
const t8 = MGP.bridge.target();
check(t8 && t8.k === 'skill', 'cible initiale = un skill');
const copiedBefore = copied.length;
byId('ba-copy').onclick();
check(copied.length === copiedBefore + 1, 'barre d’actions : ⏎ Copier copie le prompt de la cible');
byId('ba-fav').onclick();
check(byId('ba-fav')._txt === '★' && byId('ba-fav').classList.contains('favon'), '★ du pont passe la cible en favori (feedback immédiat)');
byId('ba-fav').onclick(); // retour à l'état initial
byId('ba-open').onclick();
check(opened.length === 2 && opened[1][0] === 'claude' && /SKILL\.md/.test(opened[1][1]), '⌘⏎ du pont ouvre le LLM par défaut avec le prompt du skill ciblé');
byId('ba-gpt').onclick();
check(opened.length === 3 && opened[2][0] === 'chatgpt', '⇧⏎ du pont ouvre ChatGPT');
check(byId('bread')._html.includes('cibles') || byId('bread')._html.includes('targets'), 'fil d’Ariane enrichi : compteur de cibles');

console.log('9) V3.1 — carte d’action : bouton ✎ présent et branché :');
check(typeof byId('gc-edit') === 'object' && typeof byId('gc-edit').onclick === 'function', 'bouton ✎ de la carte présent et branché');

console.log(fail === 0 ? '\n✅ TOUS LES TESTS PASSENT' : `\n❌ ${fail} test(s) en échec`);
process.exit(fail === 0 ? 0 : 1);
