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
  db.exec(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL
  )`)
  // Initialize default settings
  db.exec(`INSERT OR IGNORE INTO settings (key, value) VALUES
    ('work_start_time_hour', 9),
    ('work_start_time_minute', 0),
    ('allowed_late_minutes', 15)
  `)
}

function getUsers() {
  return db.prepare('SELECT * FROM users').all();
}

function getUser(userId) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

function getStudents() {
  return db.prepare("SELECT * FROM users WHERE role = 'student'").all();
}

function getSupervisors() {
  return db.prepare("SELECT * FROM users WHERE role = 'supervisor'").all();
}

function addUser(user) {
  const role = user.role ?? 'student';
  const info = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)').run([user.name, role]);
  return { id: info.lastInsertRowid, ...user };
}

function deleteUser(userId) {
  try {
    db.prepare('DELETE FROM passwordhashes WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM arrivalTimes WHERE user_id = ?').run(userId);
    const info = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return info.changes > 0;
  } catch (e) {
    console.error('deleteUser failed', e);
    return false;
  }
}

function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setSetting(key, value) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run([key, value]);
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

function getArrivalToday(userId) {
  const currentTime = new Date().toISOString();
  const row = db
    .prepare("SELECT arrival_id AS id, arrival_time, supervisor_id FROM arrivalTimes WHERE user_id = ? AND DATE(arrival_time) = DATE(?) ORDER BY arrival_time ASC LIMIT 1")
    .get(userId, currentTime);
  return row ? { id: row.id, arrivalTime: row.arrival_time, supervisorId: row.supervisor_id } : null;
}

function addArrival(userId, arrivalTime = null) {
  const currentTime = new Date().toISOString();
  arrivalTime = arrivalTime || currentTime; // ISO timestamp

  // Prevent multiple arrivals for the same local calendar day
  const existingArrival = db
    .prepare(
      "SELECT (arrival_time) FROM arrivalTimes WHERE user_id = ? AND DATE(arrival_time) = DATE(?)"
    )
    .get(userId, currentTime);

  console.log("Existing arrival:", existingArrival);
  if (existingArrival) return null;

  db.prepare('INSERT INTO arrivalTimes (user_id, arrival_time, supervisor_id) VALUES (?, ?, NULL)')
    .run(userId, arrivalTime);
  return { id: db.lastInsertRowid, arrivalTime };
}

function getArrivalSupervisor(arrivalId) {
  const row = db.prepare('SELECT supervisor_id FROM arrivalTimes WHERE arrival_id = ?').get(arrivalId);
  if (!row || row.supervisor_id == null) return null;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(row.supervisor_id);
}

function getArrivals(userId) {
  return db.prepare('SELECT * FROM arrivalTimes WHERE user_id = ?').all(userId).map(row => ({
    id: row.arrival_id,
    arrivalTime: row.arrival_time,
    supervisorId: row.supervisor_id
  }));
}

function clearAllArrivals() {
  db.prepare('DELETE FROM arrivalTimes').run();
}

function setArrivalSupervisor(arrivalId, supervisorId) {
  const stmt = db.prepare(
    'UPDATE arrivalTimes SET supervisor_id = ? WHERE arrival_id = ?'
  );
  const info = stmt.run(supervisorId, arrivalId);
  return info.changes > 0;
}

function getTodaysArrivals() {
  const currentTime = new Date().toISOString();
  return db
    .prepare("SELECT * FROM arrivalTimes WHERE DATE(arrival_time) = DATE(?)")
    .all(currentTime).map(row => ({
      id: row.arrival_id,
      userId: row.user_id,
      arrivalTime: row.arrival_time,
      supervisorId: row.supervisor_id
    }));
}

module.exports = { initDatabase, getUsers, getStudents, getSupervisors, addUser, deleteUser, clearUsers, setSetting, getSetting,
  hasPassword, setPassword, comparePassword, clearAllPasswords, addArrival, getArrivalToday, getArrivals, clearAllArrivals, setArrivalSupervisor, getTodaysArrivals };