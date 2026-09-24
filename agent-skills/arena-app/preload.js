// Bridge IPC sécurisé d'ARENA
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('arena', {
  init: () => ipcRenderer.invoke('arena-init'),
  onEvent: (cb) => ipcRenderer.on('arena-event', (e, ev) => cb(ev)),
});
