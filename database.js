const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'cinema_database.db'), (err) => {
            if (err) {
                console.error('Database connection error:', err);
            } else {
                console.log('Connected to cinema database');
            }
        });
    }

    // Получить все фильмы
    getMovies() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM movies WHERE is_active = 1", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    // Получить сеансы для фильма 
    getScreenings(movieId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT s.*, m.title as movie_title, h.hall_name 
                FROM screenings s
                JOIN movies m ON s.movie_id = m.movie_id
                JOIN cinema_halls h ON s.hall_id = h.hall_id
                WHERE s.movie_id = ? AND s.start_time > datetime('now')
                ORDER BY s.start_time
            `, [movieId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    // Получить свободные места
    getAvailableSeats(screeningId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT s.seat_id, s.row_number, s.seat_number, s.is_vip
                FROM seats s
                WHERE s.hall_id = (
                    SELECT hall_id FROM screenings WHERE screening_id = ?
                )
                AND NOT EXISTS (
                    SELECT 1 FROM tickets t
                    JOIN bookings b ON t.booking_id = b.booking_id
                    WHERE t.seat_id = s.seat_id
                    AND b.screening_id = ?
                    AND b.status != 'cancelled'
                )
                ORDER BY s.row_number, s.seat_number
            `, [screeningId, screeningId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
}

module.exports = Database;