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
  getPrefs: () => ipcRenderer.sendSync('get-prefs'),
  addRecent: (name) => ipcRenderer.send('add-recent', name),
  toggleFav: (name) => ipcRenderer.send('toggle-fav', name),
  exportConfig: () => ipcRenderer.invoke('export-config'),
  importConfig: () => ipcRenderer.invoke('import-config'),
  // ── 💾 Sauvegarde portable (cadenas + corbeille + ateliers) ──
  backupExport: () => ipcRenderer.invoke('backup-export'),
  backupImport: () => ipcRenderer.invoke('backup-import'),
  customSave: (item) => ipcRenderer.send('custom-save', item),
  customDelete: (name) => ipcRenderer.send('custom-delete', name),
  exportCustoms: () => ipcRenderer.invoke('export-customs'),
  onEditCustom: (cb) => ipcRenderer.on('edit-custom', (e, c) => cb(c)),
  // ── Atelier agents/skills + moteur LLM (API clé) ──
  workshopList: (kind) => ipcRenderer.invoke('workshop-list', kind),
  workshopGet: (kind, name) => ipcRenderer.invoke('workshop-get', { kind, name }),
  workshopSave: (kind, name, patch) => ipcRenderer.invoke('workshop-save', { kind, name, patch }),
  workshopCreate: (kind, rec) => ipcRenderer.invoke('workshop-create', { kind, rec }),
  workshopLock: (kind, name, locked) => ipcRenderer.invoke('workshop-lock', { kind, name, locked }),
  workshopHistory: (kind, name) => ipcRenderer.invoke('workshop-history', { kind, name }),
  workshopDelete: (kind, name) => ipcRenderer.invoke('workshop-delete', { kind, name }),
  workshopExport: (kind, name) => ipcRenderer.invoke('workshop-export', { kind, name }),
  llmGenerate: (payload) => ipcRenderer.invoke('llm-generate', payload),
  llmTest: (payload) => ipcRenderer.invoke('llm-test', payload),
  apiSet: (payload) => ipcRenderer.invoke('api-set', payload),
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
  teamList: () => ipcRenderer.invoke('team-list'),
  teamGenerate: (payload) => ipcRenderer.invoke('team-generate', payload),
  teamRun: (payload) => ipcRenderer.invoke('team-run', payload),
  reportSave: (p) => ipcRenderer.invoke('report-save', p),
  teamDelete: (name) => ipcRenderer.invoke('team-delete', name),
  teamSave: (name, patch) => ipcRenderer.invoke('team-save', { name, patch }),
  teamFromTemplate: (key) => ipcRenderer.invoke('team-from-template', { key }),
  teamExport: (name) => ipcRenderer.invoke('team-export', name),
  teamMdCreate: (name) => ipcRenderer.invoke('team-md-create', name),
});
