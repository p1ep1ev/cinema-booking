import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import { app } from 'electron';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function getDbPath() {
  return path.join(__dirname, 'cinema_booking.db');
}
const dbPath = getDbPath();
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Ошибка подключения к БД:', err.message);
  console.log('✅ База данных подключена:', dbPath);
});
// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL,
      rating TEXT,
      release_date DATE
    )
  `);
  // You can add other table creation queries here if needed
});
