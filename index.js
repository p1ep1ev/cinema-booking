const modal = document.getElementById('seatSelectionModal');
const closeBtn = document.querySelector('.close-btn');
const buyTicketBtns = document.querySelectorAll('.buy-ticket-btn');
const movieTitleModal = document.getElementById('movie-title-modal');
const seats = document.querySelectorAll('.seat');
const selectedSeatsCount = document.querySelector('.selected-seats-count');
const selectedSeatsList = document.querySelector('.selected-seats-list');
const totalPrice = document.querySelector('.total-price');
const movieSelected = document.getElementById('movie-selected');
const confirmBooking = document.getElementById('confirm-booking');
const bookingSuccess = document.getElementById('booking-success');
const closeSuccess = document.getElementById('close-success');

let currentMovie = {
    id: null,
    title: '',
    price: 0
};

let currentScreeningId = null;
let seatMap = {};

if (!window.api) {
    alert('API не доступно');
}
buyTicketBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const movieCard = btn.closest('.movie-card');
        currentMovie.id = movieCard.dataset.movieId;
        currentMovie.title = movieCard.dataset.movieTitle;
        currentMovie.price = parseInt(movieCard.dataset.moviePrice);

        movieTitleModal.textContent = `Выбор мест: ${currentMovie.title}`;
        movieSelected.querySelector('span').textContent = currentMovie.title;

        resetSelectedSeats();
        await loadSeatData(currentMovie.id);

        modal.style.display = 'block';
    });
});

closeBtn.addEventListener('click', async () => {
    modal.style.display = 'none';
    resetSelectedSeats();
    if (currentMovie.id) {
        await loadSeatData(currentMovie.id);
    }
});

window.addEventListener('click', async (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        resetSelectedSeats();
        if (currentMovie.id) {
            await loadSeatData(currentMovie.id);
        }
    }
});


seats.forEach(seat => {
    seat.addEventListener('click', () => {
        if (seat.classList.contains('unavailable')) return;
        seat.classList.toggle('selected');
        updateSelectedSeats();
    });
});

function updateSelectedSeats() {
    const selected = document.querySelectorAll('.seat.selected');
    selectedSeatsCount.textContent = selected.length;
    selectedSeatsList.innerHTML = '';
    selected.forEach(seat => {
        const tag = document.createElement('div');
        tag.classList.add('seat-tag');
        tag.textContent = `${seat.dataset.row}${seat.dataset.seat}`;
        selectedSeatsList.appendChild(tag);
    });
    totalPrice.textContent = `${selected.length * currentMovie.price} ₽`;
}

function resetSelectedSeats() {
    seats.forEach(seat => seat.classList.remove('selected'));
    selectedSeatsCount.textContent = '0';
    selectedSeatsList.innerHTML = '';
    totalPrice.textContent = '0 ₽';
}

async function loadSeatData(movieId) {
    try {
        document.querySelectorAll('.seat').forEach(seat => {
            seat.classList.remove('unavailable', 'selected');
        });

        const response = await window.api.getUnavailableSeats(movieId);

        if (!response.success) {
            throw new Error(response.error || 'Failed to load seat data');
        }


        response.seats.forEach(seat => {
            const seatElement = document.querySelector(`.seat[data-row="${seat.row}"][data-seat="${seat.number}"]`);
            if (seatElement) {
                seatElement.classList.add('unavailable');
            }
        });

    } catch (error) {
        console.error('Ошибка загрузки мест:', error);
        alert('Не удалось загрузить информацию о местах');
    }
}

// Бронирование
confirmBooking.addEventListener('click', async () => {
    const selected = document.querySelectorAll('.seat.selected');
    if (selected.length === 0) {
        alert('Пожалуйста, выберите хотя бы одно место');
        return;
    }

    try {
        for (const seat of selected) {
            const rowNumber = seat.dataset.row;
            const seatNumber = seat.dataset.seat;

            const result = await window.api.bookSeat(
                currentMovie.id.toString(),
                rowNumber,
                seatNumber
            );

            if (!result.success) {
                throw new Error(result.error || 'Booking failed');
            }
        }
        await loadSeatData(currentMovie.id);
        // Показываем сообщение об успехе
        document.querySelector('.seat-selection-container').style.display = 'none';
        bookingSuccess.style.display = 'block';

        // Обновляем данные о бронировании
        const bookingNumber = Math.floor(Math.random() * 1000000) + 1000000;
        document.getElementById('booking-number').textContent = bookingNumber;
        document.getElementById('ticket-movie').textContent = currentMovie.title;
        document.getElementById('ticket-date').textContent = new Date().toLocaleDateString('ru-RU');

        let seatsText = '';
        selected.forEach((seat, index) => {
            seatsText += `${seat.dataset.row}${seat.dataset.seat}`;
            if (index < selected.length - 1) seatsText += ', ';
        });
        document.getElementById('ticket-seats').textContent = seatsText;
        document.getElementById('ticket-total').textContent = `${selected.length * currentMovie.price} ₽`;

    } catch (err) {
        console.error('Booking error:', err);
        alert('Ошибка бронирования: ' + err.message);
    }
});

closeSuccess.addEventListener('click', () => {
    modal.style.display = 'none';
    document.querySelector('.seat-selection-container').style.display = 'block';
    bookingSuccess.style.display = 'none';
    resetSelectedSeats();
});