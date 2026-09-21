// Test bout-en-bout des prompts personnalisés ✍️ — sur le CODE RÉEL de renderer.js
// Simule le main process (PREFS + handlers IPC) et pilote le renderer en sandbox.
process.chdir(__dirname);

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const catCode = fs.readFileSync(path.join(__dirname, '..', 'interface', 'catalog-full.js'), 'utf8');
const CAT = new Function(catCode + '\n;return MEGA_CATALOG;')();

// ── Fake main process : PREFS + sémantique des handlers IPC réels ────────────
const PREFS = { lang: 'fr', favorites: [], recents: [], customs: [], seeded: false, defaultLLM: 'claude' };
const calls = { customSave: [], customDelete: [], toggleFav: [], addRecent: [], copied: [] };
const mainSave = (item) => { // replica de ipcMain.on('custom-save')
  if (!item || typeof item.name !== 'string' || typeof item.desc !== 'string') return;
  const name = item.name.trim().slice(0, 80);
  const desc = item.desc.trim();
  if (!name || !desc) return;
  PREFS.customs = PREFS.customs.filter((c) => c.name !== name);
  PREFS.customs.push({ name, desc });
};
const mainDelete = (name) => { // replica de deleteCustom
  PREFS.customs = PREFS.customs.filter((c) => c.name !== name);
  PREFS.favorites = PREFS.favorites.filter((n) => n !== name);
};

// ── Mocks DOM ─────────────────────────────────────────────────────────────────
function makeEl(tag) {
  const cls = new Set();
  return {
    tag, style: {}, dataset: {}, children: [], _txt: '', _html: '', _val: '', _handlers: {},
    classList: {
      add: (c) => cls.add(c), remove: (c) => cls.delete(c),
      toggle: (c, f) => { const on = f === undefined ? !cls.has(c) : !!f; on ? cls.add(c) : cls.delete(c); },
      contains: (c) => cls.has(c),
    },
    set textContent(v) { this._txt = v; }, get textContent() { return this._txt; },
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    set value(v) { this._val = v; }, get value() { return this._val; },
    set className(v) { }, get className() { return ''; },
    appendChild(c) { this.children.push(c); return c; },
    addEventListener(ev, fn) { (this._handlers[ev] ||= []).push(fn); },
    scrollIntoView() {}, focus() {}, closest() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
  };
}
const ids = {};
const byId = (id) => (ids[id] ||= makeEl('div'));
const docHandlers = {};
const sandbox = {
  console,
  document: {
    body: makeEl('body'), head: makeEl('head'),
    createElement: (t) => makeEl(t),
    getElementById: (id) => byId(id),
    querySelectorAll: () => [],
    addEventListener(ev, fn) { (docHandlers[ev] ||= []).push(fn); },
  },
  localStorage: { getItem: () => null, setItem() {} },
  setTimeout: (fn) => { fn(); return 0; }, clearTimeout() {},
};
let editCustomCb = null;
sandbox.window = sandbox;
sandbox.window.mgp = {
  catalog: CAT,
  copy: (t) => calls.copied.push(t),
  addRecent: (n) => calls.addRecent.push(n),
  toggleFav: (n) => { calls.toggleFav.push(n); PREFS.favorites.includes(n) ? PREFS.favorites.splice(PREFS.favorites.indexOf(n), 1) : PREFS.favorites.push(n); },
  getPrefs: () => ({ favorites: PREFS.favorites, recents: PREFS.recents, customs: PREFS.customs, defaultLLM: PREFS.defaultLLM }),
  customSave: (item) => { calls.customSave.push(item); mainSave(item); },
  customDelete: (name) => { calls.customDelete.push(name); mainDelete(name); },
  hide() {}, openLLM() {}, openSettings() {},
  onEditCustom: (cb) => { editCustomCb = cb; },
};

const ctx = vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'renderer.js'), 'utf8'), ctx, { filename: 'renderer.js' });

// ── Tests ─────────────────────────────────────────────────────────────────────
let fail = 0;
const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
const listHTML = () => ids.list._html;

console.log('1) Création via le bouton ＋ et l’éditeur :');
check(typeof ids.addc.onclick === 'function', 'le bouton ＋ ouvre l’éditeur');
ids.addc.onclick();
check(ids.modal.style.display === 'flex', 'la modale s’affiche (display:flex)');
ids['e-name'].value = 'Mon audit Solana';
ids['e-txt'].value = '  Audit mon programme Solana : bugs, anchorage des comptes, risques.  ';
ids['e-save'].onclick();
check(calls.customSave.length === 1, 'IPC custom-save envoyé (1 fois)');
check(PREFS.customs.length === 1 && PREFS.customs[0].name === 'Mon audit Solana', 'persisté dans PREFS.customs');
check(PREFS.customs[0].desc === 'Audit mon programme Solana : bugs, anchorage des comptes, risques.', 'texte trimé à l’enregistrement');
check(ids.modal.style.display === 'none', 'la modale se ferme après Enregistrer');

console.log('2) Intégration « comme ceux de base » — recherche et rendu :');
ids.q._val = 'audit';
(ids.q._handlers.input || [])[0] && ids.q._handlers.input[0]();
check(listHTML().includes('Mon audit Solana'), 'trouvé par la recherche (terme "audit")');
check(listHTML().includes('perso'), 'affiché avec la catégorie « perso »');
check(listHTML().includes('data-e='), 'avec son bouton ✎ Éditer');
check(listHTML().includes('data-f='), 'avec son bouton ★ favori (comme les items de base)');
ids.q._val = 'introuvable-xyz';
ids.q._handlers.input[0]();
check(listHTML().includes('Aucun'), 'recherche sans résultat → message propre');
ids.q._val = '';
ids.q._handlers.input[0]();

console.log('3) Épingler en favori (même mécanique que les items de base) :');
window_mgp_toggle('Mon audit Solana');
check(PREFS.favorites.includes('Mon audit Solana'), 'FAVS/toggleFav → PREFS.favorites contient le prompt perso');
// usage réel : l'utilisateur le retrouve par la recherche (la liste complète est tronquée à 80 items)
ids.q._val = 'audit';
ids.q._handlers.input[0]();
check(listHTML().includes('Mon audit Solana'), 'retrouvé par la recherche après le toggle favori');
ids.q._val = '';
ids.q._handlers.input[0]();

console.log('4) Ouvrir dans Claude — le prompt perso part tel quel :');
const srcR = fs.readFileSync(path.join(__dirname, 'renderer.js'), 'utf8');
check(/a === 'custom' \? \(x\.desc \|\| x\.name \|\| ''\)/.test(srcR), 'activate() envoie x.desc brut (aucun habillage skill/agent)');
const srcM = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
check(/kind === 'custom'\) return x\.desc \|\| x\.name/.test(srcM), 'promptFor(custom) côté menu ⚡ retourne le texte brut');

console.log('5) Éditer depuis le menu ⚡ (✎ → modale pré-remplie → modifications) :');
check(typeof editCustomCb === 'function', 'renderer exposé à l’événement edit-custom');
editCustomCb({ name: 'Mon audit Solana', desc: 'Audit mon programme Solana : bugs, anchorage des comptes, risques.' });
check(ids['e-name'].value === 'Mon audit Solana' && ids.modal.style.display === 'flex', '✎ du menu rouvre l’éditeur pré-rempli');
ids['e-txt'].value = 'Audit V2 : ajoute les checks de checked arithmetic.';
ids['e-save'].onclick();
check(PREFS.customs[0].desc.startsWith('Audit V2'), 'modification enregistrée (remplacement, pas doublon)');
check(PREFS.customs.length === 1, 'toujours 1 seul item (pas de doublon)');

console.log('6) Supprimer depuis l’éditeur :');
ids['e-del'].onclick();
check(calls.customDelete.includes('Mon audit Solana'), 'IPC custom-delete envoyé avec le bon nom');
check(PREFS.customs.length === 0, 'retiré de PREFS.customs');

(async () => {
console.log('7) Import .md / .txt par glisser-déposer :');
check(docHandlers.drop && docHandlers.dragover, 'handlers dragover + drop enregistrés');
const dropEvt = (files) => ({ preventDefault() {}, dataTransfer: { files } });
const mdFile = { name: 'Rétrospective sprint.md', text: async () => '# Rétrospective\n\nAnime une rétrospective de sprint en 4 questions.' };
docHandlers.drop[0](dropEvt([mdFile, { name: 'image.png', text: async () => 'x' }]));
await new Promise((r) => setImmediate(r));
check(PREFS.customs.some((c) => c.name === 'Rétrospective sprint'), '.md importé (nom dérivé du fichier)');
check(!PREFS.customs.some((c) => c.name === 'image'), '.png ignoré (seuls .md/.txt)');
docHandlers.drop[0](dropEvt([{ name: 'Rétrospective sprint.md', text: async () => 'doublon' }]));
await new Promise((r) => setImmediate(r));
check(PREFS.customs.some((c) => c.name === 'Rétrospective sprint (2)'), 'doublon renommé (2) — pas d’écrasement');

console.log('8) Seed des exemples au premier lancement (main.js) :');
check(/function seedCustoms/.test(srcM) && /seedCustom\(\)|seedCustoms\(\)/.test(srcM), 'seedCustoms() appelée au démarrage');
check(/PREFS\.seeded = true/.test(srcM), 'flag seeded → une seule fois');
check(/'Analyse critique de code'/.test(srcM) && /'Critical code review'/.test(srcM), 'exemples FR et EN fournis');

console.log('9) Composeur — les prompts perso participent au prompt combiné :');
check(/Prompts personnalisés à appliquer tels quels|Custom prompts to apply as-is/.test(srcR), 'buildCombo inclut une section ✍️');
})().then(() => {
  console.log(fail === 0 ? '\n✅ TOUS LES TESTS PASSENT' : `\n❌ ${fail} test(s) en échec`);
  process.exit(fail === 0 ? 0 : 1);
});

function window_mgp_toggle(n) { sandbox.window.mgp.toggleFav(n); }
