const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  adminPasswordExists: () => ipcRenderer.invoke('admin-password-exists'),
  setAdminPassword: (password) => ipcRenderer.invoke('set-admin-password', password),
  compareAdminPassword: (password) => ipcRenderer.invoke('compare-admin-password', password),
  clearAdminPassword: () => ipcRenderer.invoke('clear-admin-password'),
  getUsers: () => ipcRenderer.invoke('get-users'),
  getUser: (userId) => ipcRenderer.invoke('get-user', userId),
  getStudents: () => ipcRenderer.invoke('get-students'),
  addUser: (user) => ipcRenderer.invoke('add-user', user),
  deleteUser: (userId) => ipcRenderer.invoke('delete-user', userId),
  clearUsers: () => ipcRenderer.invoke('clear-users'),
  hasPassword: (userId) => ipcRenderer.invoke('has-password', userId),
  setPassword: (userId, password) => ipcRenderer.invoke('set-password', userId, password),
  comparePassword: (userId, password) => ipcRenderer.invoke('compare-password', userId, password),
  clearPassword: (userId) => ipcRenderer.invoke('clear-password', userId),
  addArrival: (userId, arrivalTime) => ipcRenderer.invoke('add-arrival', userId, arrivalTime),
  getArrivalToday: (userId) => ipcRenderer.invoke('get-arrival-today', userId),
  getArrivals: (userId) => ipcRenderer.invoke('get-arrivals', userId),
  getArrivalSupervisor: (arrivalId) => ipcRenderer.invoke('get-arrival-supervisor', arrivalId),
  setArrivalSupervisor: (arrivalId, supervisorId) => ipcRenderer.invoke('set-arrival-supervisor', arrivalId, supervisorId),
  clearAllArrivals: () => ipcRenderer.invoke('clear-all-arrivals'),
  getTodaysArrivals: () => ipcRenderer.invoke('get-todays-arrivals'),
  getStaffList: () => ipcRenderer.invoke('get-staff-list'),
  getStaff: () => ipcRenderer.invoke('get-staff'),
  addStaff: (staff) => ipcRenderer.invoke('add-staff', staff),
  deleteStaff: (id) => ipcRenderer.invoke('delete-staff', id),
  // Settings
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value)
});

// Synchronous API exposed separately to avoid mixing with Promise-based API
contextBridge.exposeInMainWorld('apiSync', {
  getSetting: (key) => ipcRenderer.sendSync('get-setting-sync', key)
});