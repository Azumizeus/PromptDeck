// Smoke-test Electron V3 « Constellation » : boot réel (preload + renderer + canvas).
// Vérifie : aucun erreur JS au boot, la galaxie dessine (pixels non-fond), le pont
// construit ses 4 arcs + chips, le tiroir s'ouvre, et ⏎ « tire » le prompt (presse-papiers).
// Option : --shots → écrit dist/probe-galaxy.png et dist/probe-bridge.png
const { app, BrowserWindow, clipboard } = require('electron');
const fs = require('fs');
const path = require('path');

const SHOTS = process.argv.includes('--shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];

// Handlers IPC minimaux (le probe ne charge pas main.js) : mêmes canaux, sémantique réduite
const { ipcMain } = require('electron');
ipcMain.on('get-prefs', (e) => { e.returnValue = { favorites: [], recents: [], customs: [], defaultLLM: 'claude' }; });
ipcMain.on('copy', (e, text) => { try { clipboard.writeText(String(text || '')); } catch (err) {} });
ipcMain.on('hide', () => {}); ipcMain.on('add-recent', () => {}); ipcMain.on('toggle-fav', () => {});
ipcMain.on('open-llm', () => {}); ipcMain.on('open-settings', () => {});

app.whenReady().then(async () => {
  try { fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true }); } catch (e) {} // --shots a besoin de dist/
  const w = new BrowserWindow({
    width: 560, height: 620, show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: false,
      backgroundThrottling: false, offscreen: true,
    },
  });
  w.webContents.setFrameRate(30);
  w.webContents.on('console-message', (e, level, msg) => { if (level >= 2) errors.push(String(msg).slice(0, 300)); });
  w.webContents.on('render-process-gone', (e, d) => errors.push('renderer gone: ' + d.reason));
  await w.loadFile('index.html');
  await sleep(2200); // laisse la boucle de rendu peindre la galaxie

  // Édition sous test (les apps monovue embarquent <meta name="mgp-edition">)
  const ED = await w.webContents.executeJavaScript(`(document.querySelector('meta[name="mgp-edition"]') || { content: 'both' }).content`);
  const HAS_GAL = ED !== 'bridge', HAS_BR = ED !== 'galaxy';

  const out = { errors, edition: ED, galaxy: {}, bridge: {}, overlay: {}, fire: false };
  try {
    if (HAS_GAL) out.galaxy = await w.webContents.executeJavaScript(`(() => {
      const M = window.__mgp; if (!M) return { noHandle: true };
      const c = document.getElementById('galaxy');
      const g = c.getContext('2d');
      let nonbg = 0, total = 0;
      if (g) {
        const d = g.getImageData(0, 0, c.width, c.height).data;
        for (let i = 0; i < d.length; i += 160) {
          total++;
          if (Math.abs(d[i] - 7) + Math.abs(d[i + 1] - 9) + Math.abs(d[i + 2] - 15) > 24) nonbg++;
        }
      }
      return {
        view: M.view(), nodes: M.galaxy.nodes().length,
        painted: total ? +(nonbg / total).toFixed(3) : 0,
        gcount: document.getElementById('gcount').textContent,
        help: document.getElementById('ghelp').textContent.length > 0,
      };
    })()`);
    if (HAS_GAL) {
      if (SHOTS) {
        const img = await w.webContents.capturePage();
        if (img && !img.isEmpty()) fs.writeFileSync(path.join(__dirname, 'dist', 'probe-galaxy.png'), img.toPNG());
      }
      // Hyper-saut : recherche → étoiles signalées
      out.hyperspace = await w.webContents.executeJavaScript(`window.__mgp.galaxy.search('jupiter').length`);
      await sleep(700);
    }
    if (HAS_BR) {
      // Pont de commandement (auto-armé sur « agents » dès l'entrée en vue)
      await w.webContents.executeJavaScript(`window.__mgp.setView('bridge')`);
      await sleep(700);
      out.bridge = await w.webContents.executeJavaScript(`(() => {
        const arcs = document.querySelectorAll('#bsvg .arc').length;
        const chips = document.querySelectorAll('#dial .chip').length;
        const tgt = document.querySelector('#dial .chip.tgt');
        return { hidden: document.getElementById('bridge').hidden, arcs, chips,
                 sector: window.__mgp.bridge.sector(),
                 target: (window.__mgp.bridge.target() || {}).name,
                 tgtVisible: !!tgt, bread: document.getElementById('bread').textContent.slice(0, 60) };
      })()`);
      if (SHOTS) {
        const img = await w.webContents.capturePage();
        if (img && !img.isEmpty()) fs.writeFileSync(path.join(__dirname, 'dist', 'probe-bridge.png'), img.toPNG());
      }
    }
    // Tiroir : la recherche ouvre la liste
    out.overlay = await w.webContents.executeJavaScript(`(() => {
      const q = document.getElementById('q');
      q.value = 'jupiter';
      q.dispatchEvent(new Event('input', { bubbles: true }));
      const ov = document.getElementById('overlay');
      return { open: ov.classList.contains('on'),
               rows: document.querySelectorAll('#list .it').length,
               favBtns: document.querySelectorAll('#list .fv').length };
    })()`);
    // Tir : ⏎ copie le prompt de l'item ciblé (pont si dispo, sinon étoile ciblée)
    if (HAS_BR) {
      await w.webContents.executeJavaScript(`(() => {
        const q = document.getElementById('q'); q.value = '';
        q.dispatchEvent(new Event('input', { bubbles: true }));
        window.__mgp.setView('bridge');
        window.__mgp.bridge.select('skills');
      })()`);
      await sleep(400);
      try { clipboard.writeText(''); } catch (err) {} // presse-papiers vidé → comparaison déterministe
      await sleep(200);
      await w.webContents.executeJavaScript(`window.__mgp.bridge.fire()`);
    } else {
      await w.webContents.executeJavaScript(`window.__mgp.galaxy.search('jupiter')`);
      await sleep(300);
      try { clipboard.writeText(''); } catch (err) {}
      await sleep(200);
      await w.webContents.executeJavaScript(`window.__mgp.galaxy.fire()`);
    }
    await sleep(400);
    const after = clipboard.readText('clipboard');
    out.fire = after.length > 0 && /SKILL\.md/.test(after);
  } catch (e) { errors.push('probe: ' + e.message); }

  const ok = errors.length === 0
    && (!HAS_GAL || (out.galaxy && out.galaxy.nodes >= 300 && out.galaxy.painted > 0.02 && out.hyperspace >= 1))
    && (!HAS_BR || (out.bridge && !out.bridge.hidden && out.bridge.arcs === 4 && out.bridge.chips > 0 && out.bridge.tgtVisible))
    && out.overlay && out.overlay.open && out.overlay.rows >= 1 && out.overlay.favBtns >= 1
    && out.fire === true;

  console.log(JSON.stringify(out, null, 2));
  console.log(ok ? '\n✅ SMOKE ELECTRON : TOUT EST VERT' : '\n❌ SMOKE ELECTRON : ÉCHEC');
  app.exit(ok ? 0 : 1);
});
