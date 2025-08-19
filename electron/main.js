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
ipcMain.handle('get-password-hash', (event, userId) => db.getPasswordHash(userId));
ipcMain.handle('set-password-hash', (event, userId, passwordHash) => db.setPasswordHash(userId, passwordHash));
ipcMain.handle('clear-users', () => db.clearUsers());