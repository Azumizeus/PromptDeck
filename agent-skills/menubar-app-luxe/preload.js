// Bridge IPC sécurisé (contextIsolation) : expose catalogue + actions au renderer
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Catalogue chargé ici (côté Node) puis passé en objet clonable au renderer.
// Plusieurs emplacements selon le mode :
//  - dev      : agent-skills/interface/catalog-full.js (…/menubar-app/../interface)
//  - packagé  : MEGA PACK.app/Contents/Resources/interface/catalog-full.js
const CATALOG_CANDIDATES = [
  path.join(__dirname, '..', 'interface', 'catalog-full.js'),
  path.join(process.resourcesPath || __dirname, 'interface', 'catalog-full.js'),
];
let catalog = { meta: { version: '?' }, skills: [], agents: [] };
for (const p of CATALOG_CANDIDATES) {
  try {
    const code = fs.readFileSync(p, 'utf8');
    const parsed = new Function(code + '\n;return MEGA_CATALOG;')();
    if (parsed && Array.isArray(parsed.skills) && Array.isArray(parsed.agents)) { catalog = parsed; break; }
  } catch (e) { /* candidat suivant */ }
}

contextBridge.exposeInMainWorld('mgp', {
  catalog,
  copy: (t) => ipcRenderer.send('copy', t),
  hide: () => ipcRenderer.send('hide'),
  openLLM: (target, prompt) => ipcRenderer.send('open-llm', { target, prompt }),
  openSettings: () => ipcRenderer.send('open-settings'),
  restartTour: () => ipcRenderer.send('restart-tour'),
  onRestartTour: (cb) => ipcRenderer.on('restart-tour', () => cb()),
  onSettingsChange: (prefs) => ipcRenderer.send('settings-changed', prefs),
  onSettings: (cb) => ipcRenderer.on('settings-changed', (e, prefs) => cb(prefs)),
  onGotoShortcut: (cb) => ipcRenderer.on('goto-shortcut', () => cb()),
  onOpenChat: (cb) => ipcRenderer.on('open-chat', () => cb()),
  getPrefs: () => ipcRenderer.sendSync('get-prefs'),
  // 🩺 Santé API : état live de tous les providers (sonde /models par provider)
  apiHealth: (force) => ipcRenderer.invoke('api-health', { force: !!force }),
  // 🛡 Journal anti-crash : lecture + purge (Réglages)
  journalGet: () => ipcRenderer.invoke('journal-get'),
  journalClear: () => ipcRenderer.invoke('journal-clear'),
  // 🚫 Quarantaine cascade : état pour la Santé API + levée manuelle
  quarantineState: () => ipcRenderer.invoke('quarantine-state'),
  quarantineLift: (provider) => ipcRenderer.invoke('quarantine-lift', provider),
  // 🛡 Badge incidents du header panneau
  incidentsState: () => ipcRenderer.invoke('incidents-state'),
  addRecent: (name) => ipcRenderer.send('add-recent', name),
  toggleFav: (name) => ipcRenderer.send('toggle-fav', name),
  exportConfig: () => ipcRenderer.invoke('export-config'),
  importConfig: () => ipcRenderer.invoke('import-config'),
  // ── 💾 Sauvegarde portable (cadenas + corbeille + ateliers) ──
  backupExport: () => ipcRenderer.invoke('backup-export'),
  backupImport: () => ipcRenderer.invoke('backup-import'),
  backupStatus: () => ipcRenderer.invoke('backup-status'),
  backupAutoNow: () => ipcRenderer.invoke('backup-auto-now'),
  customSave: (item) => ipcRenderer.send('custom-save', item),
  customDelete: (name) => ipcRenderer.send('custom-delete', name),
  // 📌 « Garder le panneau visible » : bascule depuis le bouton 📌 du panneau
  // 🐛 fix 2.19.0 : resize/move pilotés par le main (window.resizeTo = no-op en fenêtre principale)
  setPanelGeometry: (req) => ipcRenderer.send('panelGeometry', req),
  getPanelGeometry: () => ipcRenderer.sendSync('panelGeometry', { type: 'get' }),
  // 🐛 fix 2.19.1 : setKeepVisible RÉTABLI (avalé par erreur lors de l'ajout des ponts geometry —
  // sans lui, le bouton 📌 épingler ne persistait plus la préférence).
  setKeepVisible: (on) => ipcRenderer.send('set-keep-visible', on),
  // 🎮 MEGA PACK ARENA : ouverture du jeu + choix du dossier
  arenaOpen: () => ipcRenderer.invoke('arena-open'),
  arenaDirChoose: () => ipcRenderer.invoke('arena-dir-choose'),
  exportCustoms: () => ipcRenderer.invoke('export-customs'),
  onEditCustom: (cb) => ipcRenderer.on('edit-custom', (e, c) => cb(c)),
  // ── Atelier agents/skills + moteur LLM (API clé) ──
  workshopList: (kind) => ipcRenderer.invoke('workshop-list', kind),
  workshopGet: (kind, name) => ipcRenderer.invoke('workshop-get', { kind, name }),
  workshopSave: (kind, name, patch) => ipcRenderer.invoke('workshop-save', { kind, name, patch }),
  workshopCreate: (kind, rec) => ipcRenderer.invoke('workshop-create', { kind, rec }),
  workshopLock: (kind, name, locked) => ipcRenderer.invoke('workshop-lock', { kind, name, locked }),
  workshopHistory: (kind, name) => ipcRenderer.invoke('workshop-history', { kind, name }),
  workshopRestoreVersion: (kind, name, at) => ipcRenderer.invoke('workshop-restore-version', { kind, name, at }),
  workshopDelete: (kind, name) => ipcRenderer.invoke('workshop-delete', { kind, name }),
  workshopExport: (kind, name) => ipcRenderer.invoke('workshop-export', { kind, name }),
  llmGenerate: (payload) => ipcRenderer.invoke('llm-generate', payload),
  llmTest: (payload) => ipcRenderer.invoke('llm-test', payload),
  apiSet: (payload) => ipcRenderer.invoke('api-set', payload),
  // ── 💬 Mini-chat IA intégré (même moteur API que l'Atelier) ──
  chatSend: (payload) => ipcRenderer.invoke('chat-send', payload),
  chatSendStream: (payload) => ipcRenderer.invoke('chat-send-stream', payload),
  onChatMeta: (cb) => ipcRenderer.on('chat-meta', (e, m) => cb(m)),
  onChatStream: (cb) => ipcRenderer.on('chat-stream', (e, { piece }) => cb(piece)),
  chatHistoryGet: () => ipcRenderer.invoke('chat-history-get'),
  chatHistorySet: (msgs) => ipcRenderer.invoke('chat-history-set', msgs),
  chatHistoryClear: () => ipcRenderer.invoke('chat-history-clear'),
  // ── Dossier MEGA PROMPT (fichiers .md sur le disque) ──
  promptDirGet: () => ipcRenderer.invoke('promptdir-get'),
  promptDirChoose: () => ipcRenderer.invoke('promptdir-choose'),
  promptMdCreate: (item) => ipcRenderer.invoke('prompt-md-create', item),
  promptDirOpen: (sub) => ipcRenderer.invoke('prompt-dir-open', sub),
  sourceReveal: (p) => ipcRenderer.invoke('source-reveal', p),
  promptTreeSync: (dir) => ipcRenderer.invoke('prompt-tree-sync', dir),
  // ── Arborescence MEGA PROMPT : vue d'ensemble + ouverture dossier/fichier (popup clic droit) ──
  promptTreeOverview: () => ipcRenderer.invoke('prompt-tree-overview'),
  promptMdOpen: (sub) => ipcRenderer.invoke('prompt-md-open', sub),
  workshopMdCreate: (kind, name) => ipcRenderer.invoke('workshop-md-create', { kind, name }),
  // ── 🗑 Corbeille (suppression restaurable) ──
  trashList: () => ipcRenderer.invoke('trash-list'),
  trashRestore: (id) => ipcRenderer.invoke('trash-restore', id),
  trashDelete: (id) => ipcRenderer.invoke('trash-delete', id),
  trashEmpty: () => ipcRenderer.invoke('trash-empty'),
  // ── LLM par défaut : sélecteur rapide dans la barre du bas du panneau ──
  setDefaultLLM: (llm) => ipcRenderer.send('set-default-llm', llm),
  // ── 🕸 Équipes multi-agents (super-orchestrateur + agents + workflow) ──
  modelsList: (provider) => ipcRenderer.invoke('models-list', provider),
  providersTest: (opts) => ipcRenderer.invoke('providers-test', opts || {}),
  teamList: () => ipcRenderer.invoke('team-list'),
  teamGenerate: (payload) => ipcRenderer.invoke('team-generate', payload),
  teamRun: (payload) => ipcRenderer.invoke('team-run', payload),
  reportSave: (p) => ipcRenderer.invoke('report-save', p),
  teamDelete: (name) => ipcRenderer.invoke('team-delete', name),
  teamSave: (name, patch) => ipcRenderer.invoke('team-save', { name, patch }),
  teamFromTemplate: (key) => ipcRenderer.invoke('team-from-template', { key }),
  teamExport: (name) => ipcRenderer.invoke('team-export', name),
  teamMdCreate: (name) => ipcRenderer.invoke('team-md-create', name),
  // ── 🧾 Journal d'audit NDJSON (copie / injection / équipe / routeur) ──
  auditGet: (opts) => ipcRenderer.invoke('audit-get', opts || {}),
  auditClear: () => ipcRenderer.invoke('audit-clear'),
  // ── 🧭 jev-decision-router : décision typée (skill gagnant + confiance) ──
  jevRoute: (message, all) => ipcRenderer.invoke('jev-route', { message, all: all !== false }),
});
