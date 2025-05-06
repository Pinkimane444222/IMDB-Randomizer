const API_KEY = '19739a5cb7feec7a597b8a968235dc9b';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie/';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let moviePage = 1;
let isLoading = false;
const history = [];

function getRandomMovieId() {
  return fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=ru&page=${moviePage}`)
    .then(res => res.json())
    .then(data => {
      const randomIndex = Math.floor(Math.random() * data.results.length);
      const movie = data.results[randomIndex];
      moviePage = (moviePage % data.total_pages) + 1;
      return movie.id;
    });
}

function loadRandomMovie() {
  if (isLoading) return;
  isLoading = true;

  const movieCard = document.getElementById('movieCard');
  const swipeText = document.getElementById('swipeToSee');
  const errorMessage = document.getElementById('errorMessage');

  errorMessage.style.display = 'none';

  if (movieCard.style.display === 'flex') {
    movieCard.classList.add('swipe-out-left');
    movieCard.addEventListener('animationend', () => {
      movieCard.classList.remove('swipe-out-left');
      movieCard.style.display = 'none';
      fetchNewMovie();
    }, { once: true });
  } else {
    swipeText.style.display = 'none';
    fetchNewMovie();
  }
}

function loadPreviousMovie() {
  if (isLoading || history.length < 2) return;
  isLoading = true;
  history.pop(); // удалить текущий
  const previousId = history.pop(); // вернуться к предыдущему

  const movieCard = document.getElementById('movieCard');
  movieCard.classList.add('swipe-out-right');
  movieCard.addEventListener('animationend', () => {
    movieCard.classList.remove('swipe-out-right');
    movieCard.style.display = 'none';
    fetchMovie(previousId);
  }, { once: true });
}

function fetchNewMovie() {
  getRandomMovieId().then(fetchMovie);
}

function fetchMovie(id) {
  fetch(`${TMDB_BASE_URL}${id}?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      history.push(id);

      const movieCard = document.getElementById('movieCard');
      document.getElementById('movieTitle').textContent = data.title;
      document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
      document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
      document.getElementById('movieOverview').textContent = data.overview;
      document.getElementById('movieLink').href = `https://www.themoviedb.org/movie/${id}`;
      document.getElementById('moviePoster').src = `${IMAGE_BASE_URL}${data.poster_path}`;

      movieCard.style.display = 'flex';
      setTimeout(() => movieCard.classList.add('fade-in'), 10);
    })
    .catch(error => {
      console.error(error);
      const errorMessage = document.getElementById('errorMessage');
      errorMessage.textContent = 'Ошибка при загрузке данных.';
      errorMessage.style.display = 'block';
    })
    .finally(() => {
      isLoading = false;
    });
}

// Swipe gestures
let startX = null;
let startY = null;

document.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (startX === null || startY === null) return;

  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX < -30) {
      loadRandomMovie(); // swipe left
    } else if (deltaX > 30) {
      loadPreviousMovie(); // swipe right
    }
  }

  startX = null;
  startY = null;
}, { passive: true });

// Tap gesture
document.addEventListener('click', (e) => {
  const deltaY = Math.abs(window.scrollY - (document.lastScrollY || 0));
  if (deltaY < 10) {
    loadRandomMovie();
  }
  document.lastScrollY = window.scrollY;
});
