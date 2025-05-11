import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import { app } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDbPath() {
    if (process.env.NODE_ENV === 'test') {
        return path.join(process.cwd(), 'tasks-test.db');
    }
    return path.join(app.getPath('userData'), 'tasks.db');
}

const dbPath = getDbPath();

export const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error('Ошибка подключения к БД:', err.message);
    console.log('✅ База данных подключена:', dbPath);
});

db.serialize(() => {
    // Включаем поддержку внешних ключей
    db.run("PRAGMA foreign_keys = ON;");

    // Удаляем старые таблицы, если они существуют
    db.run("DROP TABLE IF EXISTS tickets;");
    db.run("DROP TABLE IF EXISTS seats;");
    db.run("DROP TABLE IF EXISTS cinema_halls;");
    db.run("DROP TABLE IF EXISTS movies;");
    db.run("DROP TABLE IF EXISTS users;");

    // Создание таблиц
    db.run(`
    CREATE TABLE movies (
        movie_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        duration INTEGER NOT NULL,
        poster_url TEXT,
        base_price REAL NOT NULL,
        is_active INTEGER DEFAULT 1
    );
  `);

    db.run(`
    CREATE TABLE seats (
        seat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER NOT NULL,
        row_number INTEGER NOT NULL,
        seat_number INTEGER NOT NULL,
        is_booked BOOLEAN DEFAULT 0,
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
        UNIQUE (movie_id, row_number, seat_number)
    );
  `);

    // Пример вставки тестовых данных
    db.run(`
    INSERT INTO movies (title, duration, poster_url, base_price) VALUES
    ('Звёздный путь', 128, 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900', 300),
    ('Вечное эхо', 115, 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900', 350),
    ('Шёпот ночи', 102, 'https://images.unsplash.com/photo-1601513445506-2ab0d4fb4229?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900', 400),
    ('Хроники дикой природы', 135, 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900', 450);
  `);

    const values = [];

    for (let movieId = 1; movieId <= 4; movieId += 1) {
        for (let row = 1; row <= 8; row += 1) {
            for (let seat = 1; seat <= 11; seat += 1) {
                let seatNumber;
                if (seat <= 9) {
                    seatNumber = row * 10 + seat;
                } else {
                    seatNumber = row * 100 + seat;
                }
                values.push(`(${movieId}, ${row}, ${seatNumber}, 0)`);
            }
        }
    }

    const query = `
  INSERT INTO seats (movie_id, row_number, seat_number, is_booked)
  VALUES ${values.join(',\n  ')};
`;

    db.run(query);
});

