const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getUsers: () => ipcRenderer.invoke('get-users'),
  addUser: (user) => ipcRenderer.invoke('add-user', user),
  clearUsers: () => ipcRenderer.invoke('clear-users'),
  hasPassword: (userId) => ipcRenderer.invoke('has-password', userId),
  setPassword: (userId, password) => ipcRenderer.invoke('set-password', userId, password),
  comparePassword: (userId, password) => ipcRenderer.invoke('compare-password', userId, password),
  clearAllPasswords: () => ipcRenderer.invoke('clear-all-passwords'),
  addArrival: (userId, arrivalTime) => ipcRenderer.invoke('add-arrival', userId, arrivalTime),
  getArrivals: (userId) => ipcRenderer.invoke('get-arrivals', userId)
});