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

// Guide pratique embarqué : source de vérité MODE-EMPLOI.md à la racine du pack.
const MODE_EMPLOI_CANDIDATES = [
  path.join(__dirname, '..', '..', 'MODE-EMPLOI.md'),
  path.join(process.resourcesPath || __dirname, 'MODE-EMPLOI.md'),
  path.join(process.resourcesPath || __dirname, 'app', 'MODE-EMPLOI.md'),
];
let modeEmploi = '';
for (const p of MODE_EMPLOI_CANDIDATES) {
  try { modeEmploi = fs.readFileSync(p, 'utf8'); if (modeEmploi.trim()) break; } catch (e) { /* candidat suivant */ }
}

contextBridge.exposeInMainWorld('mgp', {
  catalog,
  modeEmploi,
  copy: (t) => ipcRenderer.send('copy', t),
  hide: () => ipcRenderer.send('hide'),
  openLLM: (target, prompt) => ipcRenderer.send('open-llm', { target, prompt }),
  openSettings: () => ipcRenderer.send('open-settings'),
  onSettingsChange: (prefs) => ipcRenderer.send('settings-changed', prefs),
  onSettings: (cb) => ipcRenderer.on('settings-changed', (e, prefs) => cb(prefs)),
  getPrefs: () => ipcRenderer.sendSync('get-prefs'),
  addRecent: (name) => ipcRenderer.send('add-recent', name),
  toggleFav: (name) => ipcRenderer.send('toggle-fav', name),
  exportConfig: () => ipcRenderer.invoke('export-config'),
  importConfig: () => ipcRenderer.invoke('import-config'),
  customSave: (item) => ipcRenderer.send('custom-save', item),
  customDelete: (name) => ipcRenderer.send('custom-delete', name),
  exportCustoms: () => ipcRenderer.invoke('export-customs'),
  onEditCustom: (cb) => ipcRenderer.on('edit-custom', (e, c) => cb(c)),
  onOpenHelp: (cb) => ipcRenderer.on('open-help', () => cb()),
  onShortcutStatus: (cb) => ipcRenderer.on('shortcut-status', (e, status) => cb(status)),
});
