const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getUnavailableSeats: (movieId) => ipcRenderer.invoke('get-unavailable-seats', movieId),
  bookSeat: (movieId, rowNumber, seatNumber) => ipcRenderer.invoke('book-seat', movieId, rowNumber, seatNumber)
});