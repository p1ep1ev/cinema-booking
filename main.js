import { app, BrowserWindow, ipcMain } from "electron"
import { fileURLToPath } from 'url';
import path from "path"
import { db, getDbPath } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1740,
    height: 960,
    icon: path.join(__dirname, 'icons/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })


  win.loadFile('index.html')
}

function setupDatabaseHandlers() {
  ipcMain.handle('get-unavailable-seats', async (_, movieId) => {
    return new Promise((resolve) => {
      db.all(
        `SELECT 
                row_number as row, 
                CASE 
                    WHEN seat_number < 100 THEN seat_number % 10 
                    ELSE seat_number % 100 
                END as number 
             FROM seats 
             WHERE movie_id = ? AND is_booked = 1`,
        [movieId],
        (err, rows) => {
          if (err) {
            console.error('Database error:', err);
            resolve({ success: false, error: err.message });
          } else {
            resolve({ success: true, seats: rows });
          }
        }
      );
    });
  });
  ipcMain.handle('book-seat', (_, movieId, rowNumber, seatNumber) => {
    return new Promise((resolve) => {
      movieId = parseInt(movieId);
      rowNumber = parseInt(rowNumber);
      seatNumber = parseInt(seatNumber);

      if (isNaN(movieId) || isNaN(rowNumber) || isNaN(seatNumber)) {
        return resolve({ success: false, error: 'Invalid input data' });
      }

      let dbSeatNumber = rowNumber * 10 + seatNumber;
      if (seatNumber >= 10) {
        dbSeatNumber = rowNumber * 100 + seatNumber;
      }

      db.run(
        "UPDATE seats SET is_booked = 1 WHERE movie_id = ? AND row_number = ? AND seat_number = ?",
        [movieId, rowNumber, dbSeatNumber],
        function (err) {
          if (err) {
            console.error('Error:', err.message);
            return resolve({ success: false, error: err.message });
          }
          console.log(`Updated ${this.changes} seats for movie ${movieId}, row ${rowNumber}, seat ${dbSeatNumber}`);
          resolve({ success: true, updated: this.changes > 0 });
        }
      );
    });
  });
}

app.whenReady().then(() => {
  setupDatabaseHandlers();
  console.log('DB path:', getDbPath());
  createWindow()
})