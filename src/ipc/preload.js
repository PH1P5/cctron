const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cctronIpcApi', {
    injectConfig: (callback) => {
        ipcRenderer.on('inject-config', callback);
    },

    saveConfig: (config) => ipcRenderer.invoke('save-config', config)
})