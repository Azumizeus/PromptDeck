// MEGA PACK ARENA — process principal (Electron macOS)
// Jeu 2D vectoriel connecté à l'activité du prompt deck MEGA PACK.
// Chaque lancement : le jeu choisit COMBAT (arène) ou COURSE (circuit) selon
// l'activité de la veille lue dans le bus — cf. docs/arena-game-prompt.md §2.
//
// Données : ARENA a son PROPRE dossier userData (« megapack-arena ») — il LIT le
// bus d'événements écrit par MEGA PACK dans le dossier FRÈRE « megapack-menubar-luxe »
// sans jamais y écrire : le verrou mono-instance de MEGA PACK n'est pas dérangé.
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// userData propre à ARENA (les scores/records y restent), bus lu chez MEGA PACK
const MGP_DATA = path.join(app.getPath('userData'), '..', 'megapack-menubar-luxe');
app.setPath('userData', path.join(app.getPath('userData'), '..', 'megapack-arena'));

// ── Modes CLI (utilisés par les tests et la doc) ──
const ARGS = process.argv.slice(1);
const SHOT_MODE = ARGS.includes('--shot');            // capture écran → ~/Downloads
const CHECK_MODE = ARGS.includes('--check');          // JSON état + exit (vérif scriptée)
const FORCE_MODE = (ARGS.find((a) => a && a.startsWith('--mode=')) || '').split('=')[1] || ''; // --mode=combat|race

// ── Bus d'événements MEGA PACK (lecture seule) ──
const EVENTS = path.join(MGP_DATA, 'arena-events.ndjson');
let lastSize = 0;
function readNewEvents(win) {
  try {
    const st = fs.statSync(EVENTS);
    if (st.size < lastSize) lastSize = 0; // rotation/troncature → repartir du début
    if (st.size === lastSize) return;
    const fd = fs.openSync(EVENTS, 'r');
    const buf = Buffer.alloc(st.size - lastSize);
    fs.readSync(fd, buf, 0, buf.length, lastSize);
    fs.closeSync(fd);
    lastSize = st.size;
    for (const line of buf.toString('utf8').split('\n')) {
      const s = line.trim();
      if (!s) continue;
      try { const ev = JSON.parse(s); if (ev && ev.type && win && !win.isDestroyed()) win.webContents.send('arena-event', ev); } catch (e) { /* ligne partielle */ }
    }
  } catch (e) { /* MEGA PACK n'a encore rien écrit */ }
}

// ── Activité de la veille : compte les événements des 24-48 h précédentes ──
function yesterdayActivity() {
  try {
    const lines = fs.readFileSync(EVENTS, 'utf8').split('\n').filter(Boolean);
    const now = Date.now(), cut = now - 36 * 3600 * 1000;
    let n = 0;
    for (const l of lines) { try { const ev = JSON.parse(l); if (ev.at && Date.parse(ev.at) >= cut) n++; } catch (e) {} }
    return n;
  } catch (e) { return 0; }
}
// Activité haute (≥ 10 événements) → COMBAT ; faible → COURSE (régularité)
function chooseMode() {
  if (FORCE_MODE === 'race' || FORCE_MODE === 'combat') return FORCE_MODE;
  return yesterdayActivity() >= 10 ? 'combat' : 'race';
}

// ── Verrou mono-instance (userData propre → indépendant de MEGA PACK) ──
if (!SHOT_MODE && !CHECK_MODE && !app.requestSingleInstanceLock()) app.quit();

let win = null;
function createWindow(opts = {}) {
  win = new BrowserWindow({
    width: 1100, height: 760, show: !opts.offscreen, backgroundColor: '#0b0c10',
    minWidth: 820, minHeight: 560, title: 'MEGA PACK ARENA',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false,
      backgroundThrottling: false,
      ...(opts.offscreen ? { offscreen: true } : {}),
    },
  });
  win.loadFile('index.html');
  if (!opts.offscreen) win.once('ready-to-show', () => win.show());
  win.on('closed', () => { win = null; });
  return win;
}

let poll = null;
app.whenReady().then(async () => {
  const mode = chooseMode();
  // Le mode est passé au renderer via variable d'environnement de session (simple et fiable)
  process.env.ARENA_MODE = mode;

  if (SHOT_MODE) {
    // Capture : rendu hors écran. On garde la frame la PLUS RÉCENTE et on ne sauve
    // qu'après le spawn du roster (≥ 4 s), sinon on enregistre une frame périmée.
    const w = createWindow({ offscreen: true });
    w.webContents.setFrameRate(30);
    const outDir = path.join(app.getPath('home'), 'Downloads');
    fs.mkdirSync(outDir, { recursive: true });
    const file = path.join(outDir, `arena-${mode}-${Date.now()}.png`);
    let lastImage = null, lastAt = 0, saved = false;
    const startedAt = Date.now();
    w.webContents.on('paint', (e, dirty, image) => {
      if (!image || image.isEmpty()) return;
      lastImage = image; lastAt = Date.now();
    });
    const timer = setInterval(() => {
      if (!saved && lastImage && Date.now() - startedAt > 4000 && Date.now() - lastAt < 800) {
        saved = true; clearInterval(timer);
        try { fs.writeFileSync(file, lastImage.toPNG()); console.log('✓ ARENA capture :', file, `(mode ${mode})`); }
        catch (err) { console.error('✗ capture :', err.message); }
        app.exit(0);
      }
      if (Date.now() - startedAt > 15000) { console.error('✗ aucune frame capturée'); clearInterval(timer); app.exit(1); }
    }, 300);
  } else if (CHECK_MODE) {
    // Vérif scriptée : état du bus/roster en JSON sur stdout puis exit
    const st = { mode, eventsFile: EVENTS, busExists: fs.existsSync(EVENTS), yesterdayActivity: yesterdayActivity(), mgpAgents: 0, mgpSkills: 0 };
    try {
      st.mgpAgents = JSON.parse(fs.readFileSync(path.join(MGP_DATA, 'my-agents.json'), 'utf8')).length;
    } catch (e) {}
    try {
      st.mgpSkills = JSON.parse(fs.readFileSync(path.join(MGP_DATA, 'my-skills.json'), 'utf8')).length;
    } catch (e) {}
    console.log(JSON.stringify(st));
    app.exit(0);
  } else {
    createWindow();
    try { lastSize = fs.statSync(EVENTS).size; } catch (e) { lastSize = 0; }
    poll = setInterval(() => readNewEvents(win), 400); // 2,5 lectures/s : latence imperceptible
  }
});
app.on('window-all-closed', () => { if (poll) clearInterval(poll); app.quit(); });

// ── Init renderer : roster existant + mode choisi + chemin du bus (affiché) ──
ipcMain.handle('arena-init', () => {
  const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } };
  const agents = readJson(path.join(MGP_DATA, 'my-agents.json')) || [];
  const skills = readJson(path.join(MGP_DATA, 'my-skills.json')) || [];
  const prefs = readJson(path.join(MGP_DATA, 'mgp-prefs.json')) || {};
  return {
    mode: process.env.ARENA_MODE || 'combat',
    eventsFile: EVENTS,
    yesterdayActivity: yesterdayActivity(),
    agents: agents.map((a) => ({ name: a.name, category: a.category || '' })),
    skills: skills.map((s) => s.name),
    customs: (prefs.customs || []).map((c) => c.name),
  };
});
