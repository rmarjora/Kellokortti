const path = require('path');
const { app } = require('electron');
const Database = require('better-sqlite3');

let db;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'app.db');
  db = new Database(dbPath);
  db.exec(`CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`)
  db.exec(`CREATE TABLE IF NOT EXISTS supervisors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`)
  db.exec(`CREATE TABLE IF NOT EXISTS persons_passwordhashes (
    person_id INTEGER,
    password_hash TEXT,
    FOREIGN KEY (person_id) REFERENCES persons (id)
  )`)
  db.exec(`CREATE TABLE IF NOT EXISTS supervisors_passwordhashes (
    supervisor_id INTEGER,
    password_hash TEXT,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors (id)
  )`)
}


function getPersons() {
  return db.prepare('SELECT * FROM persons').all();
}


function addPerson(person) {
  const info = db.prepare('INSERT INTO persons (name) VALUES (?)').run([person.name]);
  return { id: info.lastInsertRowid, ...person };
}


function clearPersons() {
  db.prepare('DELETE FROM persons').run();
}

module.exports = { initDatabase, getPersons, addPerson, clearPersons };
