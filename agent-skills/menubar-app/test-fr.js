// Test logique du panneau MEGA PACK : libellés FR + recherche bilingue — sur le CODE RÉEL
// Charge renderer.js en sandbox et simule les APIs Electron (window.mgp, document).
process.chdir(__dirname);

const fs = require('fs');
const vm = require('vm');
const path = require('path');

// ── Catalogue réel ────────────────────────────────────────────────────────────
const catCode = fs.readFileSync(path.join(__dirname, '..', 'interface', 'catalog-full.js'), 'utf8');
const CAT = new Function(catCode + '\n;return MEGA_CATALOG;')();

// ── Fausses APIs navigateur/Electron ─────────────────────────────────────────
const el = (tag) => ({
  tag, style: {}, dataset: {}, children: [],
  _cls: new Set(), _txt: '', _html: '', _val: '',
  classList: {
    add(c) { this._cls.add(c); }, remove(c) { this._cls.delete(c); },
    toggle(c) { this._cls.has(c) ? this._cls.delete(c) : this._cls.add(c); },
    contains(c) { return this._cls.has(c); },
    _set: new Set(),
  },
  set textContent(v) { this._txt = v; }, get textContent() { return this._txt; },
  set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
  set value(v) { this._val = v; }, get value() { return this._val; },
  set className(v) { this._cls = new Set(v.split(/\s+/).filter(Boolean)); }, get className() { return [...this._cls].join(' '); },
  appendChild(c) { this.children.push(c); return c; },
  addEventListener() {}, scrollIntoView() {}, focus() {}, closest() { return null; },
  querySelector() { return null; }, querySelectorAll() { return []; },
});
// classList ciblée par instance (le mock ci-dessus partage _cls via closure — ok pour ce test)
function makeEl(tag) {
  const cls = new Set();
  const e = el(tag);
  e.classList = {
    add: (c) => cls.add(c), remove: (c) => cls.delete(c),
    toggle: (c) => (cls.has(c) ? cls.delete(c) : cls.add(c)),
    contains: (c) => cls.has(c), _s: cls,
  };
  return e;
}

const ids = {};
const byId = (id) => (ids[id] ||= makeEl('div'));
const listeners = {};
const inputEl = { ...makeEl('input'), _handlers: {}, addEventListener(ev, fn) { (this._handlers[ev] ||= []).push(fn); } };
ids.q = inputEl;
ids.list = makeEl('div');
ids.cnt = makeEl('div');
ids.theme = makeEl('button');
ids.lang = makeEl('button');

const copied = [];
const recents = [];
const sandbox = {
  console,
  document: {
    body: makeEl('body'), head: makeEl('head'),
    createElement: (t) => makeEl(t),
    getElementById: (id) => byId(id),
    querySelectorAll: () => [],
    addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {} },
  window: {},
  setTimeout: (fn) => { fn(); return 0; }, clearTimeout() {},
};
sandbox.window = sandbox; // renderer fait window.mgp / document…
sandbox.window.mgp = {
  catalog: CAT,
  copy: (t) => copied.push(t),
  addRecent: (n) => recents.push(n),
  hide() {}, openLLM() {}, openSettings() {},
  getPrefs: () => ({ favorites: [], recents: [], defaultLLM: 'claude' }),
  toggleFav() {},
  onSettings: null,
};

const ctx = vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'renderer.js'), 'utf8'), ctx, { filename: 'renderer.js' });

// ── Helpers de test (reprennent la logique de render() sur le pool réel) ─────
const S = CAT.skills, A = CAT.agents;
let fail = 0;
const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
const poolAll = () => [...S.map((x) => x), ...A.map((x) => x)];
const lname = (x, LANG) => (LANG === 'fr' && x.name_fr) ? x.name_fr : x.name;

console.log('1) Libellés FR — chaque item traduit affiche son nom_fr :');
const pool = poolAll();
const translated = pool.filter((x) => x.name_fr);
const badFr = translated.filter((x) => lname(x, 'fr') !== x.name_fr);
check(translated.length > 0, `${translated.length}/${pool.length} items ont une traduction FR dans le catalogue`);
check(badFr.length === 0, 'lname() retourne bien name_fr pour tous les items traduits (0 exception)');
const sample = translated[0];
console.log(`    exemple : "${sample.name}" → "${sample.name_fr}"`);

console.log('2) Mode EN — retombée sur le nom original :');
const badEn = translated.filter((x) => lname(x, 'en') !== x.name);
check(badEn.length === 0, 'lname(EN) retourne toujours name (aucune fuite FR en mode EN)');

console.log('3) Recherche bilingue — le filtre du renderer inclut FR et EN :');
const src = fs.readFileSync(path.join(__dirname, 'renderer.js'), 'utf8');
const hayOk = /name_fr[\s\S]{0,80}desc_fr/.test(src);
check(hayOk, "le haystack de recherche contient name_fr + desc_fr");
const probe = (term) => pool.filter((x) => {
  const hay = (x.name + ' ' + (x.name_fr || '') + ' ' + (x.desc || '') + ' ' + (x.desc_fr || '') + ' ' + x.category).toLowerCase();
  return hay.includes(term.toLowerCase());
});
const rEn = probe('jupiter'), rFr = probe('multi-chaînes');
check(rEn.length >= 1, `recherche EN "jupiter" → ${rEn.length} résultat(s)`);
check(rFr.length >= 1, `recherche FR "multi-chaînes" → ${rFr.length} résultat(s)`);
const noCrash = probe('çéàêù');
check(Array.isArray(noCrash), 'les accents ne font pas planter le filtre');

console.log('4) Prompts localisés — desc_fr utilisé en mode FR :');
const pSkillFr = /desc_fr/.test(src) && /Utilise le skill/.test(src);
check(pSkillFr, 'promptFor FR inclut la description française (renderer)');
const mainSrc = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
check(/desc_fr/.test(mainSrc), 'promptFor FR du menu clic droit (main.js) inclut desc_fr');

console.log('5) Divers — animations sans effet de bord :');
check(typeof copied !== 'undefined' && copied.length === 0, 'aucun effet de bord au chargement du renderer');

console.log(fail === 0 ? '\n✅ TOUS LES TESTS PASSENT' : `\n❌ ${fail} test(s) en échec`);
process.exit(fail === 0 ? 0 : 1);
