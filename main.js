const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 600,
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
  db = new sqlite3.Database(path.join(__dirname, 'cinema_booking.db'), (err) => {
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
    db.all('SELECT id, title, duration_minutes, rating FROM movies LIMIT 20', [], (err, rows) => {
      if (err) {
        console.error('Error querying movies:', err.message);
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
