const API_KEY = '19739a5cb7feec7a597b8a968235dc9b';
const TMDB_API_URL = 'https://api.themoviedb.org/3/movie/top_rated';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('click', loadRandomMovie);
document.addEventListener('touchstart', loadRandomMovie, { passive: true });

let isLoading = false;

function loadRandomMovie() {
  if (isLoading) return;
  isLoading = true;

  const errorMessage = document.getElementById('errorMessage');
  const tapHint = document.getElementById('tapHint');
  errorMessage.style.display = 'none';
  if (tapHint) tapHint.style.display = 'none';

  const randomPage = Math.floor(Math.random() * 500) + 1;

  fetch(`${TMDB_API_URL}?api_key=${API_KEY}&language=ru&page=${randomPage}`)
    .then(res => res.json())
    .then(data => {
      const movies = data.results.filter(movie => movie.poster_path && movie.overview);
      if (movies.length === 0) throw new Error('Нет подходящих фильмов.');

      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      showMovie(randomMovie);
    })
    .catch(err => {
      console.error(err);
      errorMessage.textContent = 'Ошибка при загрузке фильма.';
      errorMessage.style.display = 'block';
    })
    .finally(() => {
      isLoading = false;
    });
}

function showMovie(movie) {
  const movieCard = document.getElementById('movieCard');
  const moviePoster = document.getElementById('moviePoster');
  const movieTitle = document.getElementById('movieTitle');
  const movieYear = document.getElementById('movieYear');
  const movieRating = document.getElementById('movieRating');
  const movieOverview = document.getElementById('movieOverview');
  const movieLink = document.getElementById('movieLink');

  movieTitle.textContent = movie.title;
  movieYear.textContent = new Date(movie.release_date).getFullYear();
  movieRating.textContent = movie.vote_average.toFixed(1);
  movieOverview.textContent = movie.overview;
  movieLink.href = `https://www.themoviedb.org/movie/${movie.id}`;
  moviePoster.src = `${IMAGE_BASE_URL}${movie.poster_path}`;

  // Сброс и повтор анимации
  movieCard.style.display = 'none';
  void movieCard.offsetWidth; // принудительно перезапускает анимацию
  movieCard.style.display = 'flex';
  movieCard.classList.remove('card');
  void movieCard.offsetWidth;
  movieCard.classList.add('card');
}
