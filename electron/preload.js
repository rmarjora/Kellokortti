const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getUsers: () => ipcRenderer.invoke('get-users'),
  addUser: (user) => ipcRenderer.invoke('add-user', user),
  getPasswordHash: (userId) => ipcRenderer.invoke('get-password-hash', userId),
  setPasswordHash: (userId, passwordHash) => ipcRenderer.invoke('set-password-hash', userId, passwordHash),
  clearUsers: () => ipcRenderer.invoke('clear-users')
});