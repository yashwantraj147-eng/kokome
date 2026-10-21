const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('window:set-always-on-top', flag),
  getAlwaysOnTop: () => ipcRenderer.invoke('window:get-always-on-top'),
  setWindowSize: (width, height) => ipcRenderer.invoke('window:set-size', { width, height }),
  getSystemStats: () => ipcRenderer.invoke('system:get-stats'),
  isDesktop: true
});
