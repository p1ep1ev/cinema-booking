const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  // Open SQLite DB
  db = new sqlite3.Database(path.join(__dirname, 'cinema_database.db'), (err) => {
    if (err) {
      console.error('Failed to open database:', err.message);
    } else {
      console.log('Connected to SQLite database.');
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Handle request from renderer to get movies
ipcMain.handle('get-movies', (event, arg) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT movie_id, title, description, duration, poster_url, base_price FROM movies WHERE is_active = 1', [], (err, rows) => {
      if (err) {
        console.error('Error querying movies:', err.message);
        reject([]);
      } else {
        resolve(rows);
      }
    });
  });
});

// Handle request to get screenings for a movie
ipcMain.handle('get-screenings', (event, movieId) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT s.*, h.hall_name 
      FROM screenings s
      JOIN cinema_halls h ON s.hall_id = h.hall_id
      WHERE s.movie_id = ? AND s.start_time > datetime('now')
      ORDER BY s.start_time
    `, [movieId], (err, rows) => {
      if (err) {
        console.error('Error querying screenings:', err.message);
        reject([]);
      } else {
        resolve(rows);
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if(db) db.close();
    app.quit();
  }
});
