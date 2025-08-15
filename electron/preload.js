const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getPersons: () => ipcRenderer.invoke('get-persons'),
  addPerson: (person) => ipcRenderer.invoke('add-person', person),
  clearPersons: () => ipcRenderer.invoke('clear-persons')
});