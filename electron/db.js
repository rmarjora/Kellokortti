const path = require('path');
const { app } = require('electron');
const Database = require('better-sqlite3');

let db;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'app.db');
  db = new Database(dbPath);
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`).run();
}

function getUsers() {
  return db.prepare('SELECT * FROM users').all();
}

function addUser(user) {
  const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
  const info = stmt.run(user.name);
  return { id: info.lastInsertRowid, ...user };
}

function clearUsers() {
  db.prepare('DELETE FROM users').run();
}

module.exports = { initDatabase, getUsers, addUser, clearUsers };
