#!/usr/bin/env node
// 🔎 Client CDP minimal (aucune dépendance, Node ≥ 22 avec fetch + WebSocket natifs).
// Usage :
//   node cdp.mjs list                     → liste des cibles (port CDP_RENDER, défaut 9232)
//   node cdp.mjs eval <motif> "<expr>"    → évalue <expr> dans la page dont url/titre contient <motif>
//                                            (motif "MAIN" → process main via port CDP_MAIN, défaut 9233)
//   node cdp.mjs shot <motif> <out.png>   → capture PNG de la page (Page.captureScreenshot)
//   node cdp.mjs drag <motif> <x1> <y1> <x2> <y2> → glisser RÉEL (Input.dispatchMouseEvent
//                                            trusted, coordonnées VIEWPORT px) ; steps optionnel
const RPORT = process.env.CDP_RENDER || '9232';
const MPORT = process.env.CDP_MAIN || '9233';
const [, , cmd, motif, arg2] = process.argv;
const arg3 = process.argv[5];

const getJSON = async (port, p) => (await fetch(`http://127.0.0.1:${port}${p}`)).json();

async function findTarget(motif) {
  if (motif === 'MAIN') {
    const tabs = await getJSON(MPORT, '/json/list');
    return tabs.find((t) => t.webSocketDebuggerUrl) || null;
  }
  const tabs = await getJSON(RPORT, '/json/list');
  return tabs.find((t) => t.type === 'page' && (t.url.includes(motif) || t.title.includes(motif))) || null;
}

async function withWS(target, fn) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('WS fermé')); });
  try { return await fn(ws); } finally { try { ws.close(); } catch {} }
}
let seq = 0;
function call(ws, method, params) {
  const id = ++seq;
  return new Promise((res, rej) => {
    const to = setTimeout(() => rej(new Error('timeout ' + method)), 25000);
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id === id) { clearTimeout(to); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    };
    ws.send(JSON.stringify({ id, method, params }));
  });
}

if (cmd === 'list') {
  for (const [label, port] of [['RENDER', RPORT], ['MAIN', MPORT]]) {
    try {
      const tabs = await getJSON(port, '/json/list');
      for (const t of tabs) console.log(label, '|', t.type, '|', t.title.slice(0, 40), '|', t.url.slice(0, 90));
    } catch (e) { console.log(label, '| indisponible:', e.message); }
  }
} else if (cmd === 'eval' || cmd === 'shot' || cmd === 'method') {
  const t = await findTarget(motif);
  if (!t) { console.error('cible introuvable: ' + motif); process.exit(2); }
  const out = await withWS(t, async (ws) => {
    if (cmd === 'method') {
      const r = await call(ws, arg2, JSON.parse(arg3 || '{}'));
      return JSON.stringify(r);
    }
    if (cmd === 'eval') {
      const r = await call(ws, 'Runtime.evaluate', { expression: motif === 'MAIN' ? arg2 : process.argv[4], returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error('EXCEPTION: ' + ((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text).slice(0, 400));
      return JSON.stringify(r.result.value, null, 1);
    }
    const r = await call(ws, 'Page.captureScreenshot', { format: 'png' });
    const fs = await import('node:fs');
    fs.writeFileSync(arg2, Buffer.from(r.data, 'base64'));
    return 'PNG écrit: ' + arg2 + ' (' + Math.round(Buffer.from(r.data, 'base64').length / 1024) + ' Ko)';
  });
  console.log(out);
} else if (cmd === 'drag') {
  // 🖱 Drag réel par événements TRUSTED — la méthode qui passe partout où CGEvent échoue
  // (les handlers Electron reçoivent les événements du pipeline Chromium). Coordonnées
  // VIEWPORT px CSS (pas écran !). usage: drag <motif> <x1> <y1> <x2> <y2> [steps]
  const t = await findTarget(motif);
  if (!t) { console.error('cible introuvable: ' + motif); process.exit(2); }
  const P = process.argv.slice(4).map(Number);
  if (P.length < 4 || P.some((n) => !Number.isFinite(n))) { console.error('usage: drag <motif> <x1> <y1> <x2> <y2> [steps]'); process.exit(1); }
  const [ax, ay, bx, by] = P;
  const steps = Number.isFinite(P[4]) && P[4] > 0 ? Math.min(P[4], 40) : 8;
  const ev = (type, x, y, button, buttons) => call(ws, 'Input.dispatchMouseEvent', { type, x, y, button: button || 'none', buttons: buttons || 0, clickCount: buttons ? 1 : 0, pointerType: 'mouse' });
  const out = await withWS(t, async (ws2) => {
    await call(ws2, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x: ax, y: ay, button: 'none', buttons: 0, pointerType: 'mouse' });
    await new Promise((r) => setTimeout(r, 120));
    await call(ws2, 'Input.dispatchMouseEvent', { type: 'mousePressed', x: ax, y: ay, button: 'left', buttons: 1, clickCount: 1, pointerType: 'mouse' });
    await new Promise((r) => setTimeout(r, 150));
    for (let i = 1; i <= steps; i++) {
      await call(ws2, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x: ax + (bx - ax) * i / steps, y: ay + (by - ay) * i / steps, button: 'left', buttons: 1, clickCount: 1, pointerType: 'mouse' });
      await new Promise((r) => setTimeout(r, 60));
    }
    await call(ws2, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x: bx, y: by, button: 'left', buttons: 0, clickCount: 1, pointerType: 'mouse' });
    await new Promise((r) => setTimeout(r, 300));
    return 'drag posté: ' + ax + ',' + ay + ' -> ' + bx + ',' + by + ' (' + steps + ' pas)';
  });
  console.log(out);
} else {
  console.log('usage: node cdp.mjs list | eval <motif> "<expr>" | shot <motif> <out.png> | method <motif> <Domaine.méthode> <jsonParams> | drag <motif> <x1> <y1> <x2> <y2> [steps]');
  process.exit(1);
}
