const API_KEY = '19739a5cb7feec7a597b8a968235dc9b';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie/';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const movieIds = [
  238, 240, 278, 424, 19404, 389, 129, 497, 680, 13,
  122, 155, 769, 496243, 550, 372058, 807, 1891, 372754, 122906,
];

let remainingIds = [...movieIds];

document.getElementById('rollButton').addEventListener('click', () => {
  if (remainingIds.length === 0) {
    alert("Фильмы закончились! Обновите страницу для начала заново.");
    return;
  }

  const randomIndex = Math.floor(Math.random() * remainingIds.length);
  const movieId = remainingIds.splice(randomIndex, 1)[0];

  fetchMovie(movieId);
});

function fetchMovie(id) {
  const errorMessage = document.getElementById('errorMessage');
  const movieCard = document.getElementById('movieCard');

  movieCard.style.display = 'none';
  errorMessage.style.display = 'none';

  fetch(`${TMDB_BASE_URL}${id}?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('movieTitle').textContent = data.title;
      document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
      document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
      document.getElementById('movieOverview').textContent = data.overview;
      document.getElementById('moviePoster').src = `${IMAGE_BASE_URL}${data.poster_path}`;
      movieCard.style.display = 'flex';
    })
    .catch(error => {
      console.error(error);
      errorMessage.textContent = 'Ошибка при загрузке данных.';
      errorMessage.style.display = 'block';
    });
}
