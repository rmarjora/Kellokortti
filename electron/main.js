const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const devServerURL = process.env.VITE_DEV_SERVER_URL;
  win.loadURL(devServerURL || `file://${path.join(__dirname, '../dist/index.html')}`);
}

app.whenReady().then(() => {
  db.initDatabase();
  createWindow();
});

// IPC handlers
ipcMain.handle('get-users', () => db.getUsers());
ipcMain.handle('add-user', (event, user) => db.addUser(user));
ipcMain.handle('clear-users', () => db.clearUsers());
ipcMain.handle('has-password', (event, userId) => db.hasPassword(userId));
ipcMain.handle('set-password', (event, userId, password) => db.setPassword(userId, password));
ipcMain.handle('compare-password', (event, userId, password) => db.comparePassword(userId, password));
ipcMain.handle('clear-all-passwords', () => db.clearAllPasswords());
ipcMain.handle('add-arrival', (event, userId, arrivalTime) => db.addArrival(userId, arrivalTime));
ipcMain.handle('get-arrivals', (event, userId) => db.getArrivals(userId));