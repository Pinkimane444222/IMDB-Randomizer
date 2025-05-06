
const API_KEY = '19739a5cb7feec7a597b8a968235dc9b';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let moviePage = 1;
let isLoading = false;
let genreMap = {};
let selectedGenre = '';
const history = [];

function getGenres() {
  return fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('genreSelect');
      data.genres.forEach(g => {
        genreMap[g.id] = g.name;
        const option = document.createElement('option');
        option.value = g.id;
        option.textContent = g.name;
        select.appendChild(option);
      });
    });
}

function getRandomMovieId() {
  let url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=ru&sort_by=vote_average.desc&vote_count.gte=500&page=${moviePage}`;
  if (selectedGenre) {
    url += `&with_genres=${selectedGenre}`;
  }
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.results.length) throw new Error('Нет фильмов');
      const randomIndex = Math.floor(Math.random() * data.results.length);
      const movie = data.results[randomIndex];
      moviePage = (moviePage % data.total_pages) + 1;
      return movie.id;
    });
}

function fetchMovie(id) {
  fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      history.push(id);
      document.getElementById('movieTitle').textContent = data.title;
      document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
      document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
      document.getElementById('movieOverview').textContent = data.overview;
      document.getElementById('movieGenres').textContent = data.genres.map(g => g.name).join(", ");
      document.getElementById('movieLink').href = `https://www.themoviedb.org/movie/${id}`;
      document.getElementById('moviePoster').src = `${IMAGE_BASE_URL}${data.poster_path}`;
      document.getElementById('movieCard').style.display = 'flex';
    })
    .catch(() => {
      const errorMessage = document.getElementById('errorMessage');
      errorMessage.textContent = 'Ошибка при загрузке данных.';
      errorMessage.style.display = 'block';
    })
    .finally(() => {
      isLoading = false;
    });
}

function loadRandomMovie() {
  if (isLoading) return;
  isLoading = true;
  document.getElementById('errorMessage').style.display = 'none';
  document.getElementById('tapInstruction').style.display = 'none';
  document.getElementById('movieCard').style.display = 'none';
  getRandomMovieId().then(fetchMovie);
}

function loadPreviousMovie() {
  if (isLoading || history.length < 2) return;
  isLoading = true;
  history.pop();
  const previousId = history.pop();
  fetchMovie(previousId);
}

// Обработчики
document.getElementById('newBtn').onclick = loadRandomMovie;
document.getElementById('backBtn').onclick = loadPreviousMovie;
document.getElementById('genreSelect').onchange = function (e) {
  selectedGenre = e.target.value;
  moviePage = 1;
  loadRandomMovie();
};

// Tap to fetch
document.addEventListener('click', (e) => {
  const deltaY = Math.abs(window.scrollY - (document.lastScrollY || 0));
  if (deltaY < 10) loadRandomMovie();
  document.lastScrollY = window.scrollY;
});

getGenres();
