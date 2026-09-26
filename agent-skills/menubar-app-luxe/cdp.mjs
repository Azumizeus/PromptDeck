#!/usr/bin/env node
// 🔎 Client CDP minimal (aucune dépendance, Node ≥ 22 avec fetch + WebSocket natifs).
// Usage :
//   node cdp.mjs list                     → liste des cibles (port CDP_RENDER, défaut 9232)
//   node cdp.mjs eval <motif> "<expr>"    → évalue <expr> dans la page dont url/titre contient <motif>
//                                            (motif "MAIN" → process main via port CDP_MAIN, défaut 9233)
//   node cdp.mjs shot <motif> <out.png>   → capture PNG de la page (Page.captureScreenshot)
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
} else {
  console.log('usage: node cdp.mjs list | eval <motif> "<expr>" | shot <motif> <out.png> | method <motif> <Domaine.méthode> <jsonParams>');
  process.exit(1);
}
