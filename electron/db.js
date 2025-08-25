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
  db.exec(`CREATE TABLE IF NOT EXISTS passwordhashes (
    user_id INTEGER,
    password_hash TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`)
  db.exec(`CREATE TABLE IF NOT EXISTS arrivalTimes (
    arrival_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    arrival_time DATETIME NOT NULL,
    supervisor_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
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

function clearUsers() {
  db.prepare('DELETE FROM users').run();
}

function hasPassword(userId) {
  const row = db.prepare('SELECT password_hash FROM passwordhashes WHERE user_id = ?').get(userId);
  return !!row;
}

async function setPassword(userId, passwordHash) {
    const hash = await bcrypt.hash(passwordHash, 10);
    db.prepare('INSERT OR REPLACE INTO passwordhashes (user_id, password_hash) VALUES (?, ?)').run(userId, hash);
}

async function comparePassword(userId, password) {
  const row = db.prepare('SELECT password_hash FROM passwordhashes WHERE user_id = ?').get(userId);
  if (!row) return false;
  return await bcrypt.compare(password, row.password_hash);
}

function clearAllPasswords() {
  db.prepare('DELETE FROM passwordhashes').run();
}

function addArrival(userId, arrivalTime = null) {
  const nowIso = new Date().toISOString();
  const when = arrivalTime || nowIso; // ISO timestamp

  // Prevent multiple arrivals for the same local calendar day
  const existingArrival = db
    .prepare(
      "SELECT 1 FROM arrivalTimes WHERE user_id = ? AND date(arrival_time, 'localtime') = date(?, 'localtime')"
    )
    .get(userId, when);
  if (existingArrival) return false;

  db.prepare('INSERT INTO arrivalTimes (user_id, arrival_time, supervisor_id) VALUES (?, ?, NULL)')
    .run(userId, when);
  return true;
}

function getArrivals(userId) {
  return db.prepare('SELECT * FROM arrivalTimes WHERE user_id = ?').all(userId);
}

module.exports = { initDatabase, getUsers, addUser, clearUsers, hasPassword, setPassword, comparePassword, clearAllPasswords, addArrival, getArrivals };