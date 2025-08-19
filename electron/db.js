const path = require('path');
const { app } = require('electron');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

let db;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'app.db');
  db = new Database(dbPath);
  // Ensure FK constraints are enforced
  db.pragma('foreign_keys = ON');
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('student','supervisor','admin'))
  )`)
  db.exec(`CREATE TABLE IF NOT EXISTS users_passwordhashes (
    user_id INTEGER,
    password_hash TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`)
}


function getUsers() {
  return db.prepare('SELECT * FROM users').all();
}

function addUser(user) {
  const role = user.role ?? 'student';
  const info = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)').run([user.name, role]);
  return { id: info.lastInsertRowid, ...user };
}

function hasPassword(userId) {
  const row = db.prepare('SELECT password_hash FROM users_passwordhashes WHERE user_id = ?').get(userId);
  return !!row;
}

async function setPassword(userId, passwordHash) {
    const hash = await bcrypt.hash(passwordHash, 10);
    db.prepare('INSERT OR REPLACE INTO users_passwordhashes (user_id, password_hash) VALUES (?, ?)').run(userId, hash);
}

async function comparePassword(userId, password) {
  const row = db.prepare('SELECT password_hash FROM users_passwordhashes WHERE user_id = ?').get(userId);
  if (!row) return false;
  return await bcrypt.compare(password, row.password_hash);
}

function clearUsers() {
  db.prepare('DELETE FROM users').run();
}

module.exports = { initDatabase, getUsers, addUser, hasPassword, setPassword, comparePassword, clearUsers };
