
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

function showMovie(data) {
  const card = document.getElementById('movieCard');
  document.getElementById('movieTitle').textContent = data.title;
  document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
  document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
  document.getElementById('movieOverview').textContent = data.overview;
  document.getElementById('movieGenres').textContent = data.genres.map(g => g.name).join(", ");
  document.getElementById('movieLink').href = `https://www.themoviedb.org/movie/${data.id}`;
  document.getElementById('moviePoster').src = `${IMAGE_BASE_URL}${data.poster_path}`;

  card.classList.remove('fade-out');
  card.style.display = 'flex';
  void card.offsetWidth;
  card.classList.add('fade-in');
}

function fetchMovie(id) {
  fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      history.push(id);
      showMovie(data);
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

  const card = document.getElementById('movieCard');
  if (card.style.display === 'flex') {
    card.classList.remove('fade-in');
    card.classList.add('fade-out');
    setTimeout(() => {
      card.style.display = 'none';
      getRandomMovieId().then(fetchMovie);
    }, 400);
  } else {
    getRandomMovieId().then(fetchMovie);
  }
}

function loadPreviousMovie() {
  if (isLoading || history.length < 2) return;
  isLoading = true;
  history.pop();
  const previousId = history.pop();
  loadMovieWithFade(previousId);
}

function loadMovieWithFade(id) {
  const card = document.getElementById('movieCard');
  card.classList.remove('fade-in');
  card.classList.add('fade-out');
  setTimeout(() => {
    card.style.display = 'none';
    fetchMovie(id);
  }, 400);
}

document.getElementById('newBtn').onclick = loadRandomMovie;
document.getElementById('backBtn').onclick = loadPreviousMovie;
document.getElementById('genreSelect').onchange = function (e) {
  selectedGenre = e.target.value;
  moviePage = 1;
  loadRandomMovie();
};

document.getElementById('startBtn').onclick = function () {
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('mainInterface').style.display = 'block';
  getGenres().then(loadRandomMovie);
};

document.addEventListener('click', (e) => {
  const deltaY = Math.abs(window.scrollY - (document.lastScrollY || 0));
  const isButton = e.target.closest('button, select');
  if (deltaY < 10 && !isButton && document.getElementById('mainInterface').style.display === 'block') {
    loadRandomMovie();
  }
  document.lastScrollY = window.scrollY;
});
