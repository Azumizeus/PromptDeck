#!/usr/bin/env node
// 🛠 Installation / réinstallation du userscript MEGA PACK dans Tampermonkey
//    via le protocole CDP (Chrome DevTools Protocol) — zéro clic humain.
//
// Pipeline appris (documenté ici pour ne plus jamais le re-découvrir) :
//   1. Ouvrir le dashboard Tampermonkey `options.html#nav=utils` (onglet Utilities)
//      via /json/new?… (PUT) — onglet existant réutilisé si présent.
//   2. Brancher le fichier .user.js sur l'input d'import
//      (`input[type=file]`, id `input_ZmlsZV91dGlscw_file`) avec `DOM.setFileInputFiles`.
//      ⚠️ setFileInputFiles ne déclenche AUCUN événement : il faut dispatcher
//      manuellement `input` puis `change`, sinon Tampermonkey ne réagit pas.
//   3. Tampermonkey ouvre la page d'installation `ask.html?aid=…` dans un
//      NOUVEL onglet → poller `/json/list` jusqu'à son apparition.
//   4. Les boutons de ask.html sont des `<input type="button">` (PAS des
//      `<button>`), dont les ids sont encodés base64. Détecter le label présent :
//      première installation → « Mettre à jour » ; réinstallation → « Réinstaller »
//      (autres labels connus : « Annuler », « Désactiver les mises à jour »).
//      Cliquer via `.click()` sur l'élément matché.
//   5. Option `--reload` : recharger claude.ai (Page.reload ignoreCache) —
//      les userscripts ne s'injectent pas à chaud, une page ouverte garde
//      l'ancienne version jusqu'au rechargement.
//
// Prérequis : Chrome-mgp lancé avec CDP (profil dédié — le profil par défaut
// ignore --remote-debugging-port), Tampermonkey installé, accès URL fichier OK :
//   open -na "Google Chrome" --args \
//     --user-data-dir="$HOME/Library/Application Support/Google/Chrome-mgp" \
//     --remote-debugging-port=9223 --no-first-run
//
// Usage :
//   node agent-skills/scripts/install-userscript-cdp.js [chemin.user.js] [options]
//   --probe-only      Sonde sans cliquer : liste les inputs file du dashboard
//                     et les boutons de ask.html (si présente), puis sort.
//   --reload          Recharge claude.ai après l'installation réussie.
//   --verify          Test post-install : compare la @version du bundle local
//                     à celle lue dans le dashboard TM — exit 1 si elles
//                     diffèrent (ou si la version TM est illisible).
//   --port N          Port CDP (défaut 9223, aussi via MGP_CDP_PORT).
//
// Sortie : journal étape par étape ; code 0 si un bouton d'installation a été
// cliqué (ou en --probe-only), 1 sinon (ask.html introuvable ou sans bouton
// exploitable), 2 si CDP est injoignable.
//
// Test unitaire : node --test agent-skills/scripts/install-userscript-cdp-test.js
'use strict';

const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.MGP_CDP_PORT) || 9223;
const TM_EXT = 'dhdgffkkebhmkfjojejmpbldmpobfkfo'; // Tampermonkey (Chrome Web Store)
const DEFAULT_FILE = path.join(__dirname, '..', 'interface', 'mega-pack-panel-full.user.js');

// Labels d'installation acceptés sur ask.html — la PREMIÈRE regex qui matche
// gagne. Ordre volontaire : « Réinstaller » avant « installer » (sous-chaîne
// commune), « Mettre à jour » couvert par la deuxième.
const INSTALL_LABELS = [
  /réinstaller|reinstall/i,
  /mettre à jour|update/i,
  /installer|install/i,
  /remplacer|replace/i,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jget = async (u, opts) => (await fetch(u, opts)).json();

// ── CDP minimal (WebSocket natif Node ≥ 18) — même forme que panel-e2e-browser.js
class Tab {
  constructor(info) { this.seq = 0; this.pend = new Map(); this.info = info; this.ws = null; }
  async connect() {
    this.ws = new WebSocket(this.info.webSocketDebuggerUrl);
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pend.has(m.id)) {
        const p = this.pend.get(m.id); this.pend.delete(m.id);
        m.error ? p.rej(new Error(m.error.message)) : p.res(m.result);
      }
    };
  }
  send(method, params = {}) {
    const id = ++this.seq;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.pend.set(id, { res, rej }));
  }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 300));
    return r.result?.value;
  }
  close() { try { this.ws.close(); } catch { /* déjà fermée */ } }
}

async function cdpUp(port) {
  try { await jget(`http://127.0.0.1:${port}/json/version`); return true; } catch { return false; }
}

// ── Étape 1 : onglet dashboard TM (Utilities). Retourne {info, created}.
async function ensureTmUtilsTab(port) {
  const list = await jget(`http://127.0.0.1:${port}/json/list`);
  let info = list.find((x) => x.type === 'page' && (x.url || '').startsWith(`chrome-extension://${TM_EXT}/options.html`));
  let created = false;
  if (!info) {
    info = await jget(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`chrome-extension://${TM_EXT}/options.html#nav=utils`)}`, { method: 'PUT' });
    created = true;
    await sleep(2500);
  }
  return { info, created };
}

// Sonde l'onglet Utilities : liste les input[type=file] (l'import TM a l'id
// `input_ZmlsZV91dGlscw_file`, accept application/javascript…). Ré-essaie en
// forçant le hash #nav=utils (SPA) tant que rien n'apparaît.
async function probeFileInputs(tab) {
  for (let i = 0; i < 15; i++) {
    const n = await tab.eval(`document.querySelectorAll('input[type=file]').length`).catch(() => -1);
    if (n > 0) break;
    await tab.eval(`location.hash = '#nav=utils'; true`).catch(() => {});
    await sleep(600);
  }
  return tab.eval(
    `[...document.querySelectorAll('input[type=file]')].map(i => ({ id: i.id, accept: i.accept }))`
  ).catch(() => []);
}

// ── Étape 2 : brancher le fichier + dispatcher input/change (setFileInputFiles
// n'émet aucun événement — TM écoute 'change').
async function attachUserJs(tab, file) {
  const doc = await tab.send('DOM.getDocument', { depth: 1 });
  const res = await tab.send('DOM.querySelectorAll', { nodeId: doc.root.nodeId, selector: 'input[type=file]' });
  if (!res.nodeIds.length) throw new Error('aucun input[type=file] dans le dashboard TM');
  await tab.send('DOM.setFileInputFiles', { files: [file], nodeId: res.nodeIds[0] });
  await tab.eval(`
    (() => { const el = document.querySelector('input[type=file]');
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok'; })()
  `);
}

// Ferme les onglets ask.html déjà ouverts (pages d'installation périmées —
// TM peut en laisser une en attente si un run précédent a échoué). Sans ça,
// une page en attente brouille la détection de la NOUVELLE page.
async function closeStaleAskPages(port) {
  const list = await jget(`http://127.0.0.1:${port}/json/list`);
  const stale = list.filter((x) => x.type === 'page' && (x.url || '').includes('ask.html'));
  for (const t of stale) {
    await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`).then((r) => r.json()).catch(() => null);
  }
  if (stale.length) { await sleep(500); console.log(`— ${stale.length} ask.html périmé(s) fermé(s)`); }
  return stale.length;
}

// ── Étape 3 : attendre l'apparition de ask.html dans un NOUVEL onglet.
// excludeIds : ids des onglets ask.html déjà ouverts AVANT le branchement
// (une page d'installation périmée ne doit pas être confondue avec la nouvelle).
async function waitForAskPage(port, { maxMs = 30000, stepMs = 800, excludeIds = new Set() } = {}) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const list = await jget(`http://127.0.0.1:${port}/json/list`);
    const ask = list.find((x) => x.type === 'page' && (x.url || '').includes('ask.html') && !excludeIds.has(x.id));
    if (ask) return ask;
    await sleep(stepMs);
  }
  return null;
}

// ── Étape 4 : sonde / clique les boutons de ask.html. Les boutons sont des
// <input type="button"> à ids base64 ; on matche value/textContent contre les
// regex d'installation. Le JS injecté est construit par buildAskClickScript()
// (fonction exportée : testable hors CDP).
function buildAskClickScript({ probe = false } = {}) {
  // Sérialisation JSON + new RegExp côté page (pas de littéraux regex
  // interpolés dans le template — le JS généré reste trivialement exécutable).
  const labels = JSON.stringify(INSTALL_LABELS.map((re) => [re.source, re.flags]));
  return `
    (() => {
      const labels = ${labels}.map(([s, f]) => new RegExp(s, f));
      const probe = ${probe};
      const els = [...document.querySelectorAll('input[type=button],input[type=submit],button')];
      const buttons = els
        .map(b => ({ tag: b.tagName, id: b.id, label: (b.value || b.textContent || '').trim() }))
        .filter(b => b.label);
      let clicked = null;
      if (!probe) {
        for (const re of labels) {
          const hit = els.find(b => re.test((b.value || b.textContent || '').trim()));
          if (hit) { hit.click(); clicked = hit.value || hit.textContent.trim(); break; }
        }
      }
      return { clicked, buttons };
    })()
  `;
}

async function clickInstallButton(tab, { probeOnly = false, maxMs = 12000 } = {}) {
  const t0 = Date.now();
  let last = { clicked: null, buttons: [] };
  while (Date.now() - t0 < maxMs) {
    last = await tab.eval(buildAskClickScript({ probe: probeOnly })).catch(() => null);
    if (last && (last.clicked || probeOnly)) return last;
    await sleep(1000);
  }
  return last || { clicked: null, buttons: [] };
}

// ── Option --reload : recharger claude.ai (les userscripts ne s'injectent
// pas à chaud). Retourne true si un onglet claude.ai a été rechargé.
async function reloadClaude(port) {
  const list = await jget(`http://127.0.0.1:${port}/json/list`);
  const claude = list.find((x) => x.type === 'page' && (x.url || '').startsWith('https://claude.ai'));
  if (!claude) { console.log("— reload : pas d'onglet claude.ai, sauté"); return false; }
  const c = new Tab(claude); await c.connect();
  await c.send('Page.enable');
  await c.send('Page.reload', { ignoreCache: true });
  console.log('— reload : claude.ai rechargé (ignoreCache)');
  c.close();
  return true;
}

// ── Journal de la version installée, lu dans le dashboard TM (#nav=dashboard).
async function logInstalledVersion(port) {
  const { info } = await ensureTmUtilsTab(port);
  const t = new Tab(info); await t.connect();
  await t.eval(`location.hash = '#nav=dashboard'; true`).catch(() => {});
  await sleep(1200);
  const rows = await t.eval(`
    [...document.querySelectorAll('tr')].map(r => r.textContent.replace(/\\s+/g, ' ').trim())
      .filter(x => /MEGA PACK/i.test(x)).slice(0, 3)
  `).catch(() => []);
  // Journal tronqué pour lecture ; rows retournés BRUTS (la version peut être
  // collée à la taille « 2.13.2341 KB » → le --verify compare par includes()).
  const shown = rows.map((x) => { const i = x.search(/MEGA PACK/i); return i >= 0 ? '…' + x.slice(Math.max(0, i - 20), i + 90) + '…' : x.slice(0, 140); });
  console.log('— lignes TM :', JSON.stringify(shown, null, 0).replace(/\\s+/g, ' ').slice(0, 600));
  t.close();
  return rows;
}

// ── Version du bundle local : @version extrait du fichier .user.js.
function localBundleVersion(file) {
  const m = fs.readFileSync(file, 'utf8').match(/^\/\/\s*@version\s+(\S+)/m);
  return m ? m[1] : null;
}

// ── Version installée, lue dans la ligne MEGA PACK du dashboard TM.
// ⚠️ Le texte de la ligne colle la version et la taille (« …LLM2.13.2341 KB… »)
// : impossible de découper la version par regex seule. D'où :
//   - `version` : meilleure extraction indicative (affichage/diagnostic) ;
//   - `present` : test fiable — la version LOCALE attendue apparaît dans la
//     ligne (c'est lui qui décide pour --verify).
async function installedTmVersion(port, localVersion) {
  const rows = await logInstalledVersion(port);
  let version = null;
  for (const r of rows) {
    const m = r.match(/(\d+\.\d+\.\d+)(?!\d)/);
    if (m) { version = m[1]; break; }
  }
  const present = localVersion ? rows.some((r) => r.includes(localVersion)) : null;
  return { version, rows, present };
}

// ── Parsing : premier argument non-option = chemin du .user.js.
function parseArgs(argv) {
  const opts = { file: null, probeOnly: false, reload: false, verify: false, port: PORT };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--probe-only') opts.probeOnly = true;
    else if (a === '--reload') opts.reload = true;
    else if (a === '--verify') opts.verify = true;
    else if (a.startsWith('--port=')) opts.port = Number(a.slice(7)) || opts.port;
    else if (a === '--port') { opts.port = Number(argv[++i]) || opts.port; }
    else if (!a.startsWith('--')) opts.file = a;
  }
  return opts;
}

module.exports = {
  PORT, TM_EXT, DEFAULT_FILE, INSTALL_LABELS,
  Tab, cdpUp, ensureTmUtilsTab, probeFileInputs, attachUserJs,
  waitForAskPage, closeStaleAskPages, buildAskClickScript, clickInstallButton,
  reloadClaude, logInstalledVersion, localBundleVersion, installedTmVersion, parseArgs,
};

if (require.main === module) {
  (async () => {
    const opts = parseArgs(process.argv.slice(2));
    const file = path.resolve(opts.file || DEFAULT_FILE);
    if (!fs.existsSync(file)) { console.error('✗ fichier introuvable :', file); process.exit(1); }

    if (!(await cdpUp(opts.port))) {
      console.error('✗ CDP ' + opts.port + ' injoignable — lance Chrome-mgp :\n' +
        '  open -na "Google Chrome" --args --user-data-dir="$HOME/Library/Application Support/Google/Chrome-mgp" --remote-debugging-port=' + opts.port + ' --no-first-run');
      process.exit(2);
    }

    console.log('— userscript :', file);

    // ── Mode --verify : comparer la @version du bundle local à celle installée
    // dans TM (test post-install CI : exit 0 si identiques, 1 sinon).
    if (opts.verify) {
      const local = localBundleVersion(file);
      if (!local) { console.error('✗ @version introuvable dans', file); process.exit(1); }
      const inst = await installedTmVersion(opts.port, local);
      console.log('— version bundle :', local);
      console.log('— version TM (indicative) :', inst.version || '(non trouvée)');
      if (inst.present === true) { console.log('✓ verify : TM à jour (' + local + ')'); return; }
      console.error('✗ verify : la version ' + local + ' n\'apparaît pas dans la ligne TM du dashboard' + (inst.rows.length ? '' : ' (aucune ligne MEGA PACK trouvée)') + ' — installer le bundle puis relancer --verify');
      process.exit(1);
    }

    await closeStaleAskPages(opts.port);
    const { info, created } = await ensureTmUtilsTab(opts.port);
    const tab = new Tab(info); await tab.connect();
    if (created) await sleep(1000);

    const inputs = await probeFileInputs(tab);
    console.log('— inputs file :', JSON.stringify(inputs));
    if (!inputs.length) { console.error('✗ aucun input file détecté (dashboard TM)'); tab.close(); process.exit(1); }

    if (opts.probeOnly) { tab.close(); console.log('— probe-only : OK'); return; }

    // Onglets ask.html déjà ouverts avant branchement — à exclure de l'attente.
    const before = new Set((await jget(`http://127.0.0.1:${opts.port}/json/list`))
      .filter((x) => (x.url || '').includes('ask.html')).map((x) => x.id));

    await attachUserJs(tab, file);
    console.log('— fichier branché + events input/change dispatchés');

    const ask = await waitForAskPage(opts.port, { maxMs: 30000, excludeIds: before });
    if (!ask) { console.error('✗ ask.html introuvable après branchement'); tab.close(); process.exit(1); }
    console.log("— page d'installation :", String(ask.url).slice(0, 100));

    await sleep(1500); // laisser ask.html finir de rendre
    const askTab = new Tab(ask); await askTab.connect();
    const rep = await clickInstallButton(askTab, { probeOnly: false });
    askTab.close();
    console.log('— boutons vus :', JSON.stringify(rep.buttons));
    if (!rep.clicked) {
      console.error("✗ aucun bouton d'installation cliqué — relancer avec --probe-only pour inspecter ask.html");
      tab.close(); process.exit(1);
    }
    console.log('✓ installé via «', rep.clicked, '»', created ? '(nouvel onglet dashboard)' : '');

    tab.close();

    if (opts.reload) {
      await logInstalledVersion(opts.port);
      await reloadClaude(opts.port);
    }
  })().catch((e) => { console.error('✗', e.message); process.exit(1); });
}
