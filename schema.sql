-- SQLite3 schema for Cinema Ticket Booking Application
PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS screenings;
DROP TABLE IF EXISTS cinema_halls;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS users;
-- Tables creation
CREATE TABLE movies (
    movie_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL,
    poster_url TEXT,
    base_price REAL NOT NULL,
    is_active INTEGER DEFAULT 1
);
CREATE TABLE seats (
    seat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    hall_id INTEGER NOT NULL,
    row_number INTEGER NOT NULL,
    seat_number INTEGER NOT NULL,
    FOREIGN KEY (hall_id) REFERENCES cinema_halls(hall_id),
    UNIQUE (hall_id, row_number, seat_number)
);
CREATE TABLE screenings (
    screening_id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    hall_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    price_multiplier REAL DEFAULT 1.00,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
    FOREIGN KEY (hall_id) REFERENCES cinema_halls(hall_id)
);
CREATE TABLE tickets (
    ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
    seat_id INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id),
    UNIQUE (seat_id)
);
-- Insert test data in correct order
-- First, insert movies
INSERT INTO movies (title, description, duration, poster_url, base_price) VALUES
('Звёздный путь', 'Фантастический фильм о космических приключениях', 128, 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900', 300),
('Вечное эхо', 'Драматическая история о любви и времени', 115, 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900', 350),
('Шёпот ночи', 'Триллер о загадочных событиях в маленьком городке', 102, 'https://images.unsplash.com/photo-1601513445506-2ab0d4fb4229?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900', 400),
('Хроники дикой природы', 'Документальный фильм о природе', 135, 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900', 450);
-- Then, insert cinema halls
INSERT INTO cinema_halls (hall_name, rows_count, seats_per_row) VALUES
('Зал 1', 8, 11);
-- Then, insert seats
INSERT INTO seats (hall_id, row_number, seat_number) VALUES
(1, 1, 2), (1, 1, 3), (1, 1, 4), (1, 1, 5), (1, 1, 6), (1, 1, 7), (1, 1, 8), (1, 1, 9), (1, 1, 10), (1, 1, 11),
(1, 2, 1), (1, 2, 2), (1, 2, 3), (1, 2, 4), (1, 2, 5), (1, 2, 6), (1, 2, 7), (1, 2, 8), (1, 2, 9), (1, 2, 10), (1, 2, 11),
(1, 3, 1), (1, 3, 2), (1, 3, 3), (1, 3, 4), (1, 3, 5), (1, 3, 6), (1, 3, 7), (1, 3, 8), (1, 3, 9), (1, 3, 10),
(1, 4, 1), (1, 4, 2), (1, 4, 3), (1, 4, 4), (1, 4, 5), (1, 4, 6), (1, 4, 7), (1, 4, 8), (1, 4, 9), (1, 4, 10),
(1, 5, 1), (1, 5, 2), (1, 5, 3), (1, 5, 4), (1, 5, 5), (1, 5, 6), (1, 5, 7), (1, 5, 8), (1, 5, 9), (1, 5, 10),
(1, 6, 1), (1, 6, 2), (1, 6, 3), (1, 6, 4), (1, 6, 5), (1, 6, 6), (1, 6, 7), (1, 6, 8), (1, 6, 9), (1, 6, 10),
(1, 7, 1), (1, 7, 2), (1, 7, 3), (1, 7, 4), (1, 7, 5), (1, 7, 6), (1, 7, 7), (1, 7, 8), (1, 7, 9), (1, 7, 10),
(1, 8, 1), (1, 8, 2), (1, 8, 3), (1, 8, 4), (1, 8, 5), (1, 8, 6), (1, 8, 7), (1, 8, 8), (1, 8, 9), (1, 8, 10), (1, 8, 11);
-- Finally, insert screenings
INSERT INTO screenings (movie_id, hall_id, start_time, end_time) VALUES
(1, 1, '2023-12-01 10:00:00', '2023-12-01 12:08:00'),
(2, 1, '2023-12-01 13:00:00', '2023-12-01 14:55:00'),
(3, 1, '2023-12-01 16:00:00', '2023-12-01 17:42:00'),
(4, 1, '2023-12-01 19:00:00', '2023-12-01 21:15:00');
-- Create indexes
CREATE INDEX idx_screenings_movie ON screenings(movie_id);
CREATE INDEX idx_screenings_hall ON screenings(hall_id);
CREATE INDEX idx_screenings_time ON screenings(start_time);
CREATE INDEX idx_seats_hall ON seats(hall_id);
CREATE INDEX idx_tickets_booking ON tickets(booking_id);
CREATE INDEX idx_bookings_screening ON bookings(screening_id);
