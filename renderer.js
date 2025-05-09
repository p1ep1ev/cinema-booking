const loadBtn = document.getElementById('loadMoviesBtn');
const moviesTable = document.getElementById('moviesTable');
const tbody = moviesTable.querySelector('tbody');

loadBtn.addEventListener('click', async () => {
  loadBtn.disabled = true;
  loadBtn.textContent = 'Loading...';

  try {
    const movies = await window.api.getMovies();
    tbody.innerHTML = '';
    if (movies.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">No movies found</td></tr>';
    } else {
      for (const movie of movies) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${movie.title}</td>
          <td>${movie.duration_minutes}</td>
          <td>${movie.rating || ''}</td>
        `;
        tbody.appendChild(tr);
      }
    }
    moviesTable.hidden = false;
  } catch (error) {
    alert('Failed to load movies');
    console.error(error);
  } finally {
    loadBtn.disabled = false;
    loadBtn.textContent = 'Load Movies';
  }
});
