const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database');
const sqlite3 = require('sqlite3').verbose();

const db = new Database()

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
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Handle request from renderer to get movies
ipcMain.handle('get-movies', (event, arg) => {
  return db.getMovies();
});

// Handle request to get screenings for a movie
ipcMain.handle('get-screenings', (event, movieId) => {
  return db.getScreenings();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if(db) db.close();
    app.quit();
  }
});
