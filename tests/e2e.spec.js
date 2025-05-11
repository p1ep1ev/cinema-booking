// tests/e2e.spec.js
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let electronApp;
let window;

test.beforeAll(async () => {
  // Запускаем Electron приложение
  electronApp = await electron.launch({
    args: [path.join(__dirname, '../main.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test' // Используем тестовую БД
    }
  });

  window = await electronApp.firstWindow();
  await window.waitForEvent('load');
});

test.afterAll(async () => {
  await electronApp.close();
});

test.beforeEach(async () => {
  // Инициализируем тестовую БД перед каждым тестом
  const dbPath = path.join(process.cwd(), 'tasks-test.db');
  const db = new sqlite3.Database(dbPath);

  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("PRAGMA foreign_keys = ON;");
      
      // Очищаем таблицы
      db.run("DELETE FROM seats;");
      db.run("DELETE FROM movies;");
      
      // Восстанавливаем тестовые данные
      db.run(`
        INSERT INTO movies (movie_id, title, duration, poster_url, base_price) VALUES
        (1, 'Тестовый фильм', 120, 'https://example.com/poster.jpg', 300);
      `);
      
      // Добавляем тестовые места
      const values = [];
      for (let row = 1; row <= 3; row += 1) {
        for (let seat = 1; seat <= 5; seat += 1) {
          let seatNumber = row * 10 + seat;
          if (seat >= 10) {
            seatNumber = row * 100 + seat;
          }
          values.push(`(1, ${row}, ${seatNumber}, 0)`);
        }
      }
      
      const query = `
        INSERT INTO seats (movie_id, row_number, seat_number, is_booked)
        VALUES ${values.join(',')};
      `;
      
      db.run(query, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
  
  db.close();
});

test('getUnavailableSeats должен возвращать пустой массив, когда нет забронированных мест', async () => {
  const result = await window.evaluate(async () => {
    return await window.api.getUnavailableSeats(1);
  });
  
  expect(result).toEqual({
    success: true,
    seats: []
  });
});

test('getUnavailableSeats должен возвращать забронированные места', async () => {
  // Сначала бронируем место
  await window.evaluate(async () => {
    await window.api.bookSeat(1, 2, 3);
  });
  
  // Затем проверяем
  const result = await window.evaluate(async () => {
    return await window.api.getUnavailableSeats(1);
  });
  
  expect(result).toEqual({
    success: true,
    seats: [
      { row: 2, number: 3 }
    ]
  });
});

test('bookSeat должен успешно бронировать место', async () => {
  const result = await window.evaluate(async () => {
    return await window.api.bookSeat(1, 1, 2);
  });
  
  expect(result).toEqual({
    success: true,
    updated: true
  });
  
  // Проверяем, что место действительно забронировано
  const checkResult = await window.evaluate(async () => {
    return await window.api.getUnavailableSeats(1);
  });
  
  expect(checkResult.seats).toContainEqual({ row: 1, number: 2 });
});

test('bookSeat должен возвращать ошибку при неверных входных данных', async () => {
  const result = await window.evaluate(async () => {
    return await window.api.bookSeat('invalid', 'data', 'here');
  });
  
  expect(result).toEqual({
    success: false,
    error: 'Invalid input data'
  });
});

test('bookSeat должен возвращать updated: false при попытке бронирования несуществующего места', async () => {
  const result = await window.evaluate(async () => {
    return await window.api.bookSeat(1, 99, 99);
  });
  
  expect(result).toEqual({
    success: true,
    updated: false
  });
});