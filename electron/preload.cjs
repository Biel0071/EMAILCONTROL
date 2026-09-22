const { contextBridge, shell, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  openExternal: (url) => shell.openExternal(url),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  focusApp: () => ipcRenderer.invoke('focus-app'),
});
