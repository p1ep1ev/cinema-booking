const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getMovies: () => ipcRenderer.invoke('get-movies')
});
