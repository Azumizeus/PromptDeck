#!/usr/bin/env node
// 🔬 Test E2E du panneau MEGA PACK dans le navigateur RÉEL (Chrome-mgp, CDP 9223).
// Vérifie sur claude.ai : bouton ⚡, span .lx, les 5 boutons dans l'ordre,
// style pastille sombre (pas de fond blanc navigateur), ouverture du panneau.
//
// Prérequis :  open -na "Google Chrome" --args \
//                --user-data-dir="$HOME/Library/Application Support/Google/Chrome-mgp" \
//                --remote-debugging-port=9223 --no-first-run
//              (Tampermonkey + userscript MEGA PACK installés, accès URL fichier OK)
// Usage :      node agent-skills/scripts/panel-e2e-browser.js            (claude.ai)
//              node agent-skills/scripts/panel-e2e-browser.js --quick   (127.0.0.1, sans réseau)
//
// Sortie : résumé PASS/FAIL par contrôle ; code de sortie 1 au moindre échec.
const PORT = 9223;
const ONLY = process.argv.includes('--quick') ? 'local' : null;
const CHECKS = [];
const add = (ok, label, detail) => { CHECKS.push({ ok: !!ok, label, detail }); };

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const jget = async (u, opts) => (await fetch(u, opts)).json();

class Tab {
  constructor(info) { this.seq = 0; this.pend = new Map(); this.info = info; this.ws = null; }
  async connect() {
    this.ws = new WebSocket(this.info.webSocketDebuggerUrl);
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pend.has(m.id)) { const p = this.pend.get(m.id); this.pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    };
  }
  send(method, params = {}) { const id = ++this.seq; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.pend.set(id, { res, rej })); }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 250));
    return r.result?.value;
  }
  close() { try { this.ws.close(); } catch {} }
}

async function cdpUp() {
  try { await jget(`http://127.0.0.1:${PORT}/json/version`); return true; } catch (e) { return false; }
}

async function ensureTab(url) {
  const list = await jget(`http://127.0.0.1:${PORT}/json/list`);
  let t = list.find(x => x.type === 'page' && (x.url || '').startsWith(url));
  if (!t) {
    t = await jget(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
    await sleep(4000);
  }
  return t;
}

// Patience : claude.ai peut mettre 15 s+ à rendre ; on attend #mgp-btn.
async function waitPanel(tab, maxMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const r = await tab.eval('({ btn: !!document.querySelector("#mgp-btn") })').catch(() => null);
    if (r && r.btn) return true;
    await sleep(3000);
  }
  return false;
}

(async () => {
  if (!(await cdpUp())) {
    console.error('✗ CDP ' + PORT + ' injoignable — lance Chrome-mgp :\n  open -na "Google Chrome" --args --user-data-dir="$HOME/Library/Application Support/Google/Chrome-mgp" --remote-debugging-port=' + PORT + ' --no-first-run');
    process.exit(2);
  }

  // ── Contrôle 0 : version installée (source de vérité : le code actif) ──────
  // Le test local simule la page ; le test claude.ai dépend de Tampermonkey.

  // A) Test LOCAL (toujours) : page blanche du proxy :8642 n'est pas requise —
  //    on évalue le userscript source directement dans une page de test locale.
  {
    const url = 'http://127.0.0.1:9223/json/new?' + encodeURIComponent('data:text/html,<title>mgp-e2e</title>');
    const t = await jget(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent('data:text/html,<title>mgp-e2e</title>')}`, { method: 'PUT' });
    await sleep(2500);
    const tab = new Tab(t); await tab.connect();
    const fs = require('fs');
    const src = fs.readFileSync(__dirname + '/../interface/mega-pack-panel-full.user.js', 'utf8');
    // Injection directe (indépendante de Tampermonkey) : le userscript est conçu pour s'exécuter tel quel.
    await tab.eval(src).catch(e => add(false, 'local : exécution du userscript', e.message));
    await sleep(1500);
    const rep = await tab.eval(`(() => {
      const r = {};
      r.btn = !!document.querySelector('#mgp-btn');
      const lx = document.querySelector('#mgp-macbar .lx');
      r.lx = !!lx;
      r.lxButtons = lx ? Array.from(lx.querySelectorAll('button')).map(b => b.id || b.className) : [];
      const sb = lx && lx.querySelector('#mgp-set');
      r.style = sb ? (() => { const s = getComputedStyle(sb); return { border: s.borderTopColor, radius: s.borderRadius, color: s.color }; })() : null;
      const b = document.querySelector('#mgp-btn');
      if (b && !document.querySelector('#mgp-panel.open')) b.click();
      r.open = !!document.querySelector('#mgp-panel.open');
      r.counts = (document.querySelector('#mgp-counts') || {}).textContent || null;
      return r;
    })()`);
    add(rep.btn, 'local : bouton ⚡ présent', rep.btn ? '' : 'userscript non exécuté');
    add(rep.lx, 'local : span .lx présent dans la macbar', rep.lx ? '' : 'span perdu → fond blanc');
    add(rep.lxButtons.join(',') === 'mgp-tourbtn,mgp-set,mgp-newp,mgp-pin,mgp-lang', 'local : 5 boutons dans .lx, dans l ordre', JSON.stringify(rep.lxButtons));
    add(rep.style && rep.style.border === 'rgb(49, 52, 63)' && rep.style.radius === '99px', 'local : style pastille sombre (#31343f, r=99px)', JSON.stringify(rep.style));
    add(rep.open, 'local : panneau s ouvre au clic', rep.open ? '' : 'clic ⚡ sans effet');
    add(/177/.test(rep.counts || ''), 'local : catalogue frais (177·231)', rep.counts);
    tab.close();
  }

  if (ONLY !== 'local') {
    // B) Test RÉEL claude.ai : dépend de Tampermonkey (version installée).
    const t = await ensureTab('https://claude.ai');
    const tab = new Tab(t); await tab.connect();
    const found = await waitPanel(tab, 45000);
    if (!found) {
      add(false, 'claude.ai : bouton ⚡ apparu en 45 s', 'Tampermonkey inactif, userscript absent ou page bloquée');
    } else {
      const rep = await tab.eval(`(() => {
        const r = {};
        const lx = document.querySelector('#mgp-macbar .lx');
        r.lx = !!lx;
        r.lxButtons = lx ? Array.from(lx.querySelectorAll('button')).map(b => b.id || b.className) : [];
        const sb = lx && lx.querySelector('#mgp-set');
        r.style = sb ? (() => { const s = getComputedStyle(sb); return { border: s.borderTopColor, radius: s.borderRadius }; })() : null;
        const b = document.querySelector('#mgp-btn');
        if (b && !document.querySelector('#mgp-panel.open')) b.click();
        r.open = !!document.querySelector('#mgp-panel.open');
        r.counts = (document.querySelector('#mgp-counts') || {}).textContent || null;
        return r;
      })()`);
      add(rep.lx, 'claude.ai : span .lx présent', rep.lx ? '' : 'span perdu → fond blanc');
      add(rep.lxButtons.join(',') === 'mgp-tourbtn,mgp-set,mgp-newp,mgp-pin,mgp-lang', 'claude.ai : 5 boutons dans .lx, dans l ordre', JSON.stringify(rep.lxButtons));
      add(rep.style && rep.style.border === 'rgb(49, 52, 63)' && rep.style.radius === '99px', 'claude.ai : style pastille sombre', JSON.stringify(rep.style));
      add(rep.open, 'claude.ai : panneau s ouvre au clic', '');
      add(/177/.test(rep.counts || ''), 'claude.ai : catalogue frais (177·231) = version installée à jour', rep.counts);
    }
    tab.close();
  }

  // ── Bilan ──────────────────────────────────────────────────────────────────
  console.log('');
  let fail = 0;
  for (const c of CHECKS) {
    console.log((c.ok ? '  ✓ ' : '  ✗ ') + c.label + (c.ok ? '' : '  ← ' + (c.detail || 'échec')));
    if (!c.ok) fail++;
  }
  console.log('');
  if (fail) { console.log('❌ E2E navigateur : ' + fail + ' échec(s)'); process.exit(1); }
  console.log('✅ E2E navigateur : TOUS LES CONTRÔLES PASSENT (' + CHECKS.length + ')');
})().catch(e => { console.error('✗ E2E fatal :', e.message); process.exit(1); });
