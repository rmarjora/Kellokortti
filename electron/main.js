const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');

// In packaged (production) builds, silence all console output
if (app.isPackaged) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.error = noop;
  console.debug = noop;
  console.trace = noop;
}

const db = require('./db');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
  fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'electron/preload.js')
    }
  });

  Menu.setApplicationMenu(null);

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
ipcMain.handle('get-students', () => {
  try {
    const list = db.getStudents();
    console.log('[IPC] get-students ->', Array.isArray(list) ? list.length : 'n/a');
    return list;
  } catch (e) {
    console.error('[IPC] get-students failed', e);
    throw e;
  }
});
ipcMain.handle('add-user', (event, user) => {
  try {
    console.log('[IPC] add-user <-', user);
    const created = db.addUser(user);
    console.log('[IPC] add-user ->', created);
    return created;
  } catch (e) {
    console.error('[IPC] add-user failed', e);
    throw e;
  }
});
ipcMain.handle('delete-user', (event, userId) => db.deleteUser(userId));
ipcMain.handle('clear-users', () => db.clearUsers());
ipcMain.handle('has-password', (event, userId) => db.hasPassword(userId));
ipcMain.handle('set-password', (event, userId, password) => db.setPassword(userId, password));
ipcMain.handle('compare-password', (event, userId, password) => db.comparePassword(userId, password));
ipcMain.handle('clear-password', (event, userId) => db.clearPassword(userId));
ipcMain.handle('add-arrival', (event, userId, arrivalTime) => db.addArrival(userId, arrivalTime));
ipcMain.handle('get-arrival-today', (event, userId) => db.getArrivalToday(userId));
ipcMain.handle('get-arrivals', (event, userId) => db.getArrivals(userId));
ipcMain.handle('set-arrival-supervisor', (event, arrivalId, supervisorId) => db.setArrivalSupervisor(arrivalId, supervisorId));
ipcMain.handle('get-arrival-supervisor', (event, arrivalId) => db.getArrivalSupervisor(arrivalId));
ipcMain.handle('clear-all-arrivals', () => db.clearAllArrivals());
ipcMain.handle('get-todays-arrivals', () => db.getTodaysArrivals());
ipcMain.handle('get-staff-list', () => db.getStaffList());
ipcMain.handle('get-staff', () => db.getStaff());
ipcMain.handle('add-staff', (event, staff) => db.addStaff(staff));
ipcMain.handle('delete-staff', (event, id) => db.deleteStaff(id));
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

// Simple fetch proxy to bypass CORS and let renderer call remote APIs safely
ipcMain.handle('fetch-remote', async (event, url, options = {}) => {
  const doRequest = (targetUrl, redirectsLeft = 3) => new Promise((resolve, reject) => {
    try {
      const lib = targetUrl.startsWith('https') ? https : http;
      const req = lib.request(targetUrl, {
        method: options.method || 'GET',
        headers: options.headers || {},
      }, (res) => {
        // Handle redirects
        if ([301,302,303,307,308].includes(res.statusCode)) {
          const location = res.headers.location;
          if (location && redirectsLeft > 0) {
            return resolve(doRequest(location, redirectsLeft - 1));
          }
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            headers: Object.fromEntries(Object.entries(res.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v])),
            body: data
          });
        });
      });

      req.on('error', (err) => reject(err));

      // Timeout
      req.setTimeout(15000, () => {
        req.destroy(new Error('Request timed out'));
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    } catch (e) {
      reject(e);
    }
  });

  return doRequest(url);
});