const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'electron/preload.js')
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // Dev mode
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    // Production mode (inside ASAR)
    const indexPath = path.join(app.getAppPath(), 'dist/index.html');
    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  db.initDatabase();
  createWindow();
});

// IPC handlers
ipcMain.handle('admin-password-exists', () => db.adminPasswordExists());
ipcMain.handle('set-admin-password', (event, password) => db.setAdminPassword(password));
ipcMain.handle('compare-admin-password', (event, password) => db.compareAdminPassword(password));
ipcMain.handle('clear-admin-password', () => db.clearAdminPassword());
ipcMain.handle('get-users', () => db.getUsers());
ipcMain.handle('get-user', (event, userId) => db.getUser(userId));
ipcMain.handle('get-students', () => db.getStudents());
ipcMain.handle('get-supervisors', () => db.getSupervisors());
ipcMain.handle('add-user', (event, user) => db.addUser(user));
ipcMain.handle('delete-user', (event, userId) => db.deleteUser(userId));
ipcMain.handle('clear-users', () => db.clearUsers());
ipcMain.handle('has-password', (event, userId) => db.hasPassword(userId));
ipcMain.handle('set-password', (event, userId, password) => db.setPassword(userId, password));
ipcMain.handle('compare-password', (event, userId, password) => db.comparePassword(userId, password));
ipcMain.handle('clear-all-passwords', () => db.clearAllPasswords());
ipcMain.handle('add-arrival', (event, userId, arrivalTime) => db.addArrival(userId, arrivalTime));
ipcMain.handle('get-arrival-today', (event, userId) => db.getArrivalToday(userId));
ipcMain.handle('get-arrivals', (event, userId) => db.getArrivals(userId));
ipcMain.handle('set-arrival-supervisor', (event, arrivalId, supervisorId) => db.setArrivalSupervisor(arrivalId, supervisorId));
ipcMain.handle('get-arrival-supervisor', (event, arrivalId) => db.getArrivalSupervisor(arrivalId));
ipcMain.handle('append-supervisor', (event, arrivalId, supervisorId) => db.appendSupervisor(arrivalId, supervisorId));
ipcMain.handle('clear-all-arrivals', () => db.clearAllArrivals());
ipcMain.handle('get-todays-arrivals', () => db.getTodaysArrivals());
ipcMain.handle('get-staff-list', () => db.getStaffList());
ipcMain.handle('add-staff', (event, name, email, phone1, phone2) => db.addStaff(name, email, phone1, phone2));
// Settings handlers
ipcMain.handle('get-setting', (event, key) => db.getSetting(key));
ipcMain.handle('set-setting', (event, key, value) => db.setSetting(key, value));
ipcMain.on('get-setting-sync', (event, key) => {
  try {
    const value = db.getSetting(key);
    event.returnValue = value;
  } catch (e) {
    console.error('get-setting-sync failed', e);
    event.returnValue = null;
  }
});