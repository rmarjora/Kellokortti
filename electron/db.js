const path = require('path');
const { app } = require('electron');
const Database = require('better-sqlite3');

let db;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'app.db');
  db = new Database(dbPath);
  db.prepare(`CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`).run();
}


function getPersons() {
  return db.prepare('SELECT * FROM persons').all();
}


function addPerson(person) {
  const stmt = db.prepare('INSERT INTO persons (name) VALUES (?)');
  const info = stmt.run(person.name);
  return { id: info.lastInsertRowid, ...person };
}


function clearPersons() {
  db.prepare('DELETE FROM persons').run();
}

module.exports = { initDatabase, getPersons, addPerson, clearPersons };
