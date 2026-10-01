#!/usr/bin/env node
// 🧪 Test fonctionnel pin 📌 + resize du panneau MEGA PACK dans un Chromium RÉEL
//    (Chrome-mgp CDP 9223 ou Brave profil test CDP 9224 — même code partout).
//
// Injecte le userscript FULL directement dans une page blanche file:// (artefact
// réel testé, indépendant de Tampermonkey), puis vérifie les comportements de la
// 2.13.1+ : épingle épinglée par défaut, désépinçage, masquage au clic extérieur,
// ⌥P, resize à coin bas-droit gelé, persistance mgp.customSize / mgp.pos,
// restauration bornée au viewport après reload — et depuis 2.14.1 : bouton ⚡
// déplaçable (drag persisté sans ouvrir le panneau, clic simple toujours OK).
//
// Prérequis : un Chromium avec CDP (le profil par défaut ignore --remote-debugging-port) :
//   Chrome : open -na "Google Chrome" --args \
//              --user-data-dir="$HOME/Library/Application Support/Google/Chrome-mgp" \
//              --remote-debugging-port=9223 --no-first-run
//   Brave  : open -na "Brave Browser" --args \
//              --user-data-dir="$HOME/Library/Application Support/Brave-test-mgp" \
//              --remote-debugging-port=9224 --no-first-run "file:///tmp/mgp-blank.html"
//   (Brave ferme localStorage sur 127.0.0.1 pour un profil neuf → la page hôte
//   est en file://, comme pour les tests Chrome-mgp.)
//
// Usage :  node agent-skills/scripts/panel-pin-resize-cdp.js [--port 9224]
// Sortie : résumé PASS/FAIL ; code 1 au moindre échec, 2 si CDP injoignable.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = (() => {
  const i = process.argv.indexOf('--port');
  return (i > -1 && /^\d+$/.test(process.argv[i + 1] || '')) ? Number(process.argv[i + 1])
    : (Number(process.env.MGP_CDP_PORT) || 9223);
})();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jget = async (u, opts) => (await fetch(u, opts)).json();

// ── CDP minimal — même forme que panel-e2e-browser.js / install-userscript-cdp.js
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

const RESULTS = [];
const add = (ok, label, detail) => {
  RESULTS.push({ ok: !!ok, label });
  console.log((ok ? '  ✓ ' : '  ✗ ') + label + (ok ? '' : '  ← ' + JSON.stringify(detail).slice(0, 220)));
};

(async () => {
  if (!(await jget(`http://127.0.0.1:${PORT}/json/version`).then(() => true).catch(() => false))) {
    console.error('✗ CDP ' + PORT + ' injoignable — lance un Chromium de test :\n' +
      '  Chrome : open -na "Google Chrome" --args --user-data-dir="$HOME/Library/Application Support/Google/Chrome-mgp" --remote-debugging-port=' + PORT + ' --no-first-run\n' +
      '  Brave  : open -na "Brave Browser" --args --user-data-dir="$HOME/Library/Application Support/Brave-test-mgp" --remote-debugging-port=' + PORT + ' --no-first-run');
    process.exit(2);
  }

  const SRC = fs.readFileSync(path.join(__dirname, '..', 'interface', 'mega-pack-panel-full.user.js'), 'utf8');
  // Purge DOM MEGA PACK (réutilisable avant CHAQUE injection : une page qui a
  // déjà servi accumule les boutons ⚡ et querySelector prend le vieux, inerte).
  const PURGE = `(() => {
    ['#mgp-btn', '#mgp-panel', '#mgp-tip', '#mgp-ctx', '#mgp-tour'].forEach(s => {
      const el = document.querySelector(s); if (el) el.remove();
    });
    document.querySelectorAll('style').forEach(st => {
      if (st.textContent && st.textContent.includes('#mgp-btn')) st.remove();
    });
    return 'purged';
  })()`;

  // Page hôte file:// auto-gérée (Brave ferme localStorage sur 127.0.0.1 profil neuf)
  const blankPath = path.join(os.tmpdir(), 'mgp-pin-resize-blank.html');
  fs.writeFileSync(blankPath, '<!doctype html><title>mgp-pin-resize-test</title><h1>host page</h1>\n');
  const BLANK = 'file://' + blankPath;

  const list = await jget(`http://127.0.0.1:${PORT}/json/list`);
  let info = list.find((x) => x.type === 'page' && (x.url || '') === BLANK);
  if (!info) info = await jget(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BLANK)}`, { method: 'PUT' });
  await sleep(2000);
  const tab = new Tab(info); await tab.connect();

  // État propre + injection du userscript FULL (approche panel-e2e-browser.js)
  await tab.eval(PURGE).catch(() => {});
  await tab.eval(`try { localStorage.clear(); } catch {} 'ok'`).catch(() => {});
  await tab.send('Page.enable');
  await tab.send('Page.reload', { ignoreCache: true });
  await sleep(2000);
  await tab.eval(SRC).catch((e) => { console.error('✗ injection userscript :', e.message.slice(0, 200)); process.exit(1); });
  await sleep(1500);
  // localStorage.clear() a ré-armé la visite guidée → elle s'auto-ouvre 500 ms
  // après l'injection et met le panneau « open ». On la clôt (comme un clic sur
  // « Passer ») pour tester les comportements dans un état déterministe.
  await tab.eval(`
    (() => {
      const t = document.querySelector('#mgp-tour');
      if (t) t.classList.remove('open');
      document.querySelectorAll('.mgp-tour-hl').forEach(n => n.classList.remove('mgp-tour-hl'));
      try { localStorage.setItem('mgp.tour.done', 'true'); } catch {}
      const p = document.querySelector('#mgp-panel');
      if (p) p.classList.remove('open');
      return 'tour dismissed';
    })()
  `).catch(() => {});

  // 1. État initial : bouton pin présent, épinglé par défaut (keepVisible=true)
  const st0 = await tab.eval(`
    (() => {
      const p = document.querySelector('#mgp-panel'); if (!p) return { err: 'pas de panneau' };
      const b = p.querySelector('#mgp-pin'); if (!b) return { err: 'pas de bouton pin' };
      return { pressed: b.getAttribute('aria-pressed'), open: p.classList.contains('open') };
    })()
  `);
  add(st0 && !st0.err && st0.pressed === 'true', 'pin présent + épinglé par défaut', st0);

  // 2. Ouvrir le panneau, désépingler
  await tab.eval(`document.querySelector('#mgp-btn').click(); 'ok'`);
  await sleep(400);
  await tab.eval(`document.querySelector('#mgp-pin').click(); 'ok'`);
  await sleep(200);
  const st1 = await tab.eval(`({ pressed: document.querySelector('#mgp-pin').getAttribute('aria-pressed'), stored: localStorage.getItem('mgp.keepVisible') })`);
  add(st1 && st1.pressed === 'false', 'désépinglé (aria-pressed=false)', st1);

  // 3. Clic extérieur → masque le panneau (désépinglé)
  await tab.eval(`document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); 'ok'`);
  await sleep(300);
  add((await tab.eval(`!document.querySelector('#mgp-panel').classList.contains('open')`)) === true,
    'clic extérieur masque le panneau (désépinglé)');

  // 4. ⌥P ré-épingle et révèle
  await tab.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', code: 'KeyP', altKey: true, bubbles: true })); 'ok'`);
  await sleep(300);
  const st2 = await tab.eval(`({ pressed: document.querySelector('#mgp-pin').getAttribute('aria-pressed'), open: document.querySelector('#mgp-panel').classList.contains('open') })`);
  add(st2 && st2.pressed === 'true' && st2.open === true, '⌥P ré-épingle + révèle le panneau', st2);

  // 5-8. Resize : drag synthétique sur la poignée haut-gauche → bas-droit gelé + persistance
  await tab.eval(`
    (() => { const p = document.querySelector('#mgp-panel');
      p.style.left = '200px'; p.style.top = '120px'; p.style.right = 'auto'; p.style.bottom = 'auto';
      return 'ok'; })()
  `);
  await sleep(150);
  const before = await tab.eval(`(r => ({ w: r.width, h: r.height, right: r.right, bottom: r.bottom }))(document.querySelector('#mgp-panel').getBoundingClientRect())`);
  await tab.eval(`
    (async () => {
      const h = document.querySelector('#mgp-rsz');
      if (!h) return 'PAS DE POIGNEE';
      const r = h.getBoundingClientRect();
      const x0 = r.left + 8, y0 = r.top + 8;
      const opts = { bubbles: true, pointerId: 1, clientX: x0, clientY: y0, isPrimary: true };
      h.dispatchEvent(new PointerEvent('pointerdown', opts));
      for (let i = 1; i <= 10; i++) {
        h.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: x0 + i * 12, clientY: y0 + i * 8 }));
        await new Promise(res => setTimeout(res, 16));
      }
      h.dispatchEvent(new PointerEvent('pointerup', opts));
      return 'ok';
    })()
  `);
  await sleep(300);
  const after = await tab.eval(`(r => ({ w: r.width, h: r.height, right: r.right, bottom: r.bottom }))(document.querySelector('#mgp-panel').getBoundingClientRect())`);
  add(after.w < before.w - 80 && after.h < before.h - 40, 'poignée tire vers haut-gauche → taille réduite', { before, after });
  add(Math.abs(after.right - before.right) <= 2 && Math.abs(after.bottom - before.bottom) <= 2, 'coin bas-droit GELÉ pendant le drag', { before, after });
  const persisted = await tab.eval(`localStorage.getItem('mgp.customSize')`);
  add(!!persisted && persisted.length > 2, 'taille custom persistée après drag (mgp.customSize)', persisted);
  const posPersisted = await tab.eval(`localStorage.getItem('mgp.pos')`);
  add(!!posPersisted, 'position persistée après drag (mgp.pos)', posPersisted);

  // 9. Reload + ré-injection : géométrie restaurée, poignée atteignable.
  await tab.send('Page.reload', { ignoreCache: true });
  await sleep(2000);
  await tab.eval(PURGE).catch(() => {}); // le reload ré-exécute l'injection du run précédent → purge avant ré-injection
  await tab.eval(SRC).catch((e) => { console.error('✗ ré-injection :', e.message.slice(0, 200)); process.exit(1); });
  await sleep(1200);
  const dup = await tab.eval(`document.querySelectorAll('#mgp-btn').length`);
  if (dup !== 1) { console.error('✗ ' + dup + ' boutons ⚡ coexistent (purge inefficace)'); process.exit(1); }
  // Le panneau est fermé (visite clôturée plus haut) → l'ouvrir pour mesurer la géométrie.
  await tab.eval(`document.querySelector('#mgp-btn').click(); 'ok'`).catch(() => {});
  await sleep(300);
  const geom = await tab.eval(`
    (r => {
      const vw = innerWidth, vh = innerHeight;
      return { w: r.width, h: r.height, left: r.left, top: r.top,
        okHandle: r.left >= 4 && r.top >= 4 && r.left + 16 <= vw && r.top + 16 <= vh };
    })(document.querySelector('#mgp-panel').getBoundingClientRect())
  `);
  add(geom && geom.okHandle, 'après reload + ré-injection : poignée haut-gauche DANS le viewport', geom);

  // ── 2.14.1 : bouton ⚡ déplaçable (drag → position persistée mgp.btnPos) ──
  // Panneau fermé au départ (état déterministe) ; après pointerup, on émet le
  // click que le navigateur génère réellement — le handler doit l'avaler.
  await tab.eval(`document.querySelector('#mgp-panel').classList.remove('open'); 'ok'`).catch(() => {});
  const btnDrag = await tab.eval(`
    (async () => {
      const b = document.querySelector('#mgp-btn');
      if (!b) return { err: 'pas de bouton' };
      const r0 = b.getBoundingClientRect();
      const opts = { bubbles: true, pointerId: 2, clientX: r0.left + 20, clientY: r0.top + 20, isPrimary: true };
      b.dispatchEvent(new PointerEvent('pointerdown', opts));
      for (let i = 1; i <= 8; i++) {
        b.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: opts.clientX - i * 15, clientY: opts.clientY - i * 10 }));
        await new Promise(res => setTimeout(res, 16));
      }
      b.dispatchEvent(new PointerEvent('pointerup', opts));
      b.dispatchEvent(new MouseEvent('click', { bubbles: true })); // le click « de fin de drag » du navigateur
      const r1 = b.getBoundingClientRect();
      return { left0: r0.left, top0: r0.top, left1: r1.left, top1: r1.top, moved: (r0.left - r1.left) + (r0.top - r1.top) > 60,
               stored: !!localStorage.getItem('mgp.btnPos'), panelOpen: document.querySelector('#mgp-panel').classList.contains('open') };
    })()
  `);
  add(btnDrag && btnDrag.moved && !btnDrag.err, 'bouton ⚡ : drag le déplace', btnDrag);
  add(btnDrag && btnDrag.stored, 'bouton ⚡ : position persistée (mgp.btnPos)', btnDrag);
  add(btnDrag && btnDrag.panelOpen === false, 'bouton ⚡ : un drag n\'ouvre PAS le panneau', btnDrag);
  const btnClick = await tab.eval(`
    (() => {
      const b = document.querySelector('#mgp-btn');
      b.click(); // un clic simple (moved déjà consommé par le click du drag)
      return document.querySelector('#mgp-panel').classList.contains('open');
    })()
  `);
  add(btnClick === true, 'bouton ⚡ : un clic simple ouvre toujours le panneau', btnClick);

  console.log('');
  const fail = RESULTS.filter((r) => !r.ok).length;
  if (fail) { console.log('❌ ' + fail + ' échec(s) / ' + RESULTS.length); process.exit(1); }
  console.log('✅ Pin + resize (CDP ' + PORT + ') : ' + RESULTS.length + '/' + RESULTS.length + ' PASS');
  tab.close();
})().catch((e) => { console.error('✗', e.message); process.exit(1); });
