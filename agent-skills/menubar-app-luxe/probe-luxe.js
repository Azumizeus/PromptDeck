// Probe Electron de l'édition Luxe : charge la coquille réelle, inspecte le DOM,
// tire un prompt et lit le presse-papiers système. Chaque étape est protégée.
const { app, BrowserWindow, clipboard, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// Le probe remplace main.js : il doit tenir le MÊME contrat IPC que lui
const PREFS = { favorites: [], recents: [], customs: [], defaultLLM: 'claude', lang: 'fr', theme: 'dark', hasApi: { groq: true, mistral: true, cerebras: true, cohere: true } };
ipcMain.on('copy', (e, t) => clipboard.writeText(String(t)));
ipcMain.on('hide', () => {});
ipcMain.on('open-llm', () => {});
ipcMain.on('open-settings', () => {});
ipcMain.on('settings-changed', () => {});
ipcMain.on('add-recent', (e, n) => { PREFS.recents = [n, ...PREFS.recents.filter((x) => x !== n)].slice(0, 30); });
ipcMain.on('toggle-fav', (e, n) => { const i = PREFS.favorites.indexOf(n); i >= 0 ? PREFS.favorites.splice(i, 1) : PREFS.favorites.push(n); });
ipcMain.on('custom-save', (e, item) => { const i = PREFS.customs.findIndex((c) => c.name === item.name); i >= 0 ? PREFS.customs[i] = item : PREFS.customs.push(item); });
ipcMain.on('custom-delete', (e, n) => { const i = PREFS.customs.findIndex((c) => c.name === n); if (i >= 0) PREFS.customs.splice(i, 1); });
ipcMain.on('get-prefs', (e) => { e.returnValue = PREFS; });
ipcMain.on('set-default-llm', (e, llm) => { PREFS.defaultLLM = llm; });
ipcMain.handle('team-list', () => []); // harnais probe : pas d'équipes persistées
ipcMain.handle('team-generate', () => ({ ok: false, error: 'probe' }));
ipcMain.handle('team-delete', () => true);
ipcMain.handle('team-export', () => true);
ipcMain.handle('team-md-create', () => ({ ok: true, path: '/probe/equipes/x/ORCHESTRATEUR.md' }));
ipcMain.handle('workshop-list', () => []);
ipcMain.handle('promptdir-get', () => '/probe/MEGA PROMPT');
ipcMain.handle('prompt-tree-overview', () => ({ ok: true, tree: {
  root: '/probe/MEGA PROMPT',
  groups: [
    { kind: 'dir', name: 'code', rel: 'code', depth: 0, children: [{ kind: 'dir', name: 'api', rel: 'code/api', depth: 1, children: [{ kind: 'file', name: 'Concevoir une API.md', rel: 'code/api/Concevoir une API.md', depth: 2 }] }] },    { kind: 'file', name: 'LISEZMOI.md', rel: 'LISEZMOI.md', depth: 0 },
  ],
} }));
ipcMain.handle('prompt-dir-open', () => true);
ipcMain.handle('prompt-md-open', () => true);
ipcMain.handle('team-run', () => ({ ok: true, report: '# Rapport probe\n\nSynthèse de test.', latency: 1200, tasks: 2 }));
ipcMain.handle('report-save', () => ({ ok: true, path: '/probe/rapport.md' }));

process.chdir(__dirname);
try { fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true }); } catch (e) {}

const SHOT = process.argv.includes('--shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

app.whenReady().then(async () => {
  const w = new BrowserWindow({
    width: 620, height: 640, show: false,
    transparent: true, frame: false, offscreen: SHOT,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, backgroundThrottling: false },
  });
  const errors = [];
  w.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    if (level >= 2) errors.push(`${sourceId}:${line} ${message}`);
  });
  await w.loadFile('index.html');
  await sleep(900);
  const out = { steps: [] };
  try {
    Object.assign(out, await w.webContents.executeJavaScript(`(() => {
      const o = {};
      o.mgp = !!window.mgp && !!window.mgp.catalog;
      o.hasApi = !!window.__mgp;
      o.counts = window.__mgp ? window.__mgp.counts() : null;
      o.rows = document.querySelectorAll('#list .it').length;
      o.brand = (document.getElementById('brand')||{}).textContent || null;
      return o;
    })()`));
    out.steps.push('inspect:ok');
  } catch (e) { out.steps.push('inspect:FAIL ' + String(e).slice(0, 120)); }
  try {
    Object.assign(out, await w.webContents.executeJavaScript(`(() => {
      window.__mgp.search('jupiter');
      const n = document.querySelectorAll('#list .it').length;
      window.__mgp.search('');
      return { searchHits: n };
    })()`));
    out.steps.push('search:ok');
  } catch (e) { out.steps.push('search:FAIL ' + String(e).slice(0, 120)); }
  try {
    await w.webContents.executeJavaScript(`window.__mgp.copy()`);
    await sleep(300);
    out.clipLen = clipboard.readText().length;
    out.clipHead = clipboard.readText().slice(0, 55).replace(/\n/g, ' ');
    out.steps.push('copy:ok');
  } catch (e) { out.steps.push('copy:FAIL ' + String(e).slice(0, 120)); }
  try {
    Object.assign(out, await w.webContents.executeJavaScript(`(async () => {
      const o = {};
      o.llmLabel = (document.getElementById('llmbtn') || {}).textContent || null;
      window.__mgp.openLlmMenu();
      o.llmMenuOpen = window.__mgp.llmMenuVisible();
      window.__mgp.pickLLM('chatgpt');
      o.llmAfterPick = window.__mgp.defaultLLM();
      o.llmBtnAfter = (document.getElementById('llmbtn') || {}).textContent || null;
      window.__mgp.setDefaultLLM('claude');
      window.__mgp.openWorkshop();
      const seg = document.querySelectorAll('#wmodal .wseg button');
      o.workshopKinds = [...seg].map((b) => b.textContent);
      window.__mgp.setWkind('team');
      o.teamChecked = document.getElementById('w-team').getAttribute('aria-checked');
      window.__mgp.openCtxAt(0);
      await new Promise((r) => setTimeout(r, 200)); // sleep côté page : le tree arrive par IPC
      const treeEl = document.getElementById('ctx-tree');
      o.treeRows = treeEl ? treeEl.querySelectorAll('[data-open]').length : -1;
      o.treeRoot = treeEl ? (treeEl.textContent.includes('MEGA PROMPT')) : false;
      const dirBtn = treeEl.querySelector('.trow-dir[data-open="dir:code"]');
      const fileBtn = treeEl.querySelector('.trow-file[data-open="md:code/api/Concevoir une API.md"]');
      o.dirBtn = !!dirBtn; o.fileBtn = !!fileBtn;
      const provSel = document.getElementById('w-prov');
      o.provOptions = provSel ? [...provSel.querySelectorAll('option')].map((x) => x.value) : [];
      o.runBtns = document.querySelectorAll('#w-runlist [data-run]').length;
      o.reportVisible = !document.getElementById('w-report').hidden;
      localStorage.removeItem('mgp.tour.done');
      window.__mgp.tourStart();
      o.tourShown = !document.getElementById('tour').hidden;
      o.tourStep1 = document.getElementById('tourtitle').textContent;
      window.__mgp.tourShow(1);
      o.tourHl = !!document.querySelector('.tour-hl');
      window.__mgp.tourEnd();
      o.tourClosed = document.getElementById('tour').hidden;
      return o;
    })()`));
    out.steps.push('llm+workshop:ok');
  } catch (e) { out.steps.push('llm+workshop:FAIL ' + String(e).slice(0, 120)); }
  if (SHOT) {
    try {
      const img = await w.webContents.capturePage();
      fs.writeFileSync(path.join(__dirname, 'dist', 'probe-luxe.png'), img.toPNG());
      out.shot = 'dist/probe-luxe.png';
    } catch (e) { out.shot = 'FAIL ' + String(e).slice(0, 80); }
  }
  if (errors.length) out.errors = errors.slice(0, 5);
  console.log(JSON.stringify(out, null, 2));
  const ok = out.mgp && out.rows > 0 && out.searchHits > 0 && out.searchHits <= 10 && out.clipLen > 100
    && out.llmMenuOpen === true && out.llmAfterPick === 'chatgpt' && out.teamChecked === 'true'
    && out.treeRows >= 3 && out.treeRoot && out.dirBtn && out.fileBtn
    && out.provOptions.includes('groq') && out.tourShown === true && out.tourClosed === true
    && out.tourHl === true && out.tourStep1.length > 3;
  console.log(ok ? '\n✅ PROBE LUXE : VERT' : '\n❌ PROBE LUXE : ÉCHEC');
  app.exit(ok ? 0 : 1);
}).catch((e) => { console.error('FATAL', e); app.exit(2); });
