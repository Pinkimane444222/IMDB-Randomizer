const API_KEY = '19739a5cb7feec7a597b8a968235dc9b';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie/';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const movieIds = [
  238, 240, 278, 424, 19404, 389, 129, 497, 680, 13,
  122, 155, 769, 496243, 550, 769, 372058, 807, 1891, 372754,
  122906, 101, 1892, 637, 122917, 324857, 103, 13223, 424694, 600,
  510, 11216, 948, 117, 807172, 73, 7695, 118, 378, 275,
  107, 157336, 280, 240832, 157, 9693, 111, 278927, 428, 1911,
  185, 667, 614, 204, 302, 13, 104, 95, 339, 11324,
  600583, 274, 115, 280, 11, 949, 129, 1893, 539, 104,
  121, 496243, 185, 372754, 95, 4922, 1620, 603, 517814, 598,
  114, 438631, 8966, 497582, 157, 102, 453395, 313369, 58, 419430,
  599, 300, 1396, 346, 118, 641, 1771, 109, 335787, 807,
  38, 13, 10625, 680, 315162, 550, 49026, 808, 106, 198184,
  539, 122, 37258, 9693, 119, 22538, 218, 228150, 121, 11216,
  238, 272, 424, 115, 679, 680, 240, 807, 13, 500,
  807172, 657, 278, 19404, 205, 682, 334543, 73, 98, 122917,
  1124, 667, 101, 129, 372058, 157, 280, 155, 424, 1396,
  122906, 1891, 276, 157336, 49026, 385687, 240832, 372754, 19404, 13,
  807, 522924, 808, 98, 123, 301528, 219, 555, 244786, 694,
  94, 348, 360, 298, 157, 8966, 102, 901, 105, 385,
  241, 149, 376290, 337170, 505, 76, 600, 107, 1124, 539,
  37799, 107, 115, 205, 335787, 313369, 207, 109, 41, 241,
  104, 286, 337404, 198, 378, 108, 77, 121, 114, 11216,
  453, 105, 81, 157336, 276, 137113, 120467, 28, 16, 119,
  10625, 103, 98, 68718, 78, 202, 238, 657, 424, 550
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
  const loading = document.getElementById('loading');
  const errorMessage = document.getElementById('errorMessage');
  const movieCard = document.getElementById('movieCard');

  movieCard.style.display = 'none';
  errorMessage.style.display = 'none';
  loading.style.display = 'flex';

  fetch(`${TMDB_BASE_URL}${id}?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('movieTitle').textContent = data.title;
      document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
      document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
      document.getElementById('movieOverview').textContent = data.overview;
      document.getElementById('moviePoster').src = ${IMAGE_BASE_URL}${data.poster_path};
      loading.style.display = 'none';
      movieCard.style.display = 'flex';
    })
    .catch(error => {
      console.error(error);
      loading.style.display = 'none';
      errorMessage.textContent = 'Ошибка при загрузке данных.';
      errorMessage.style.display = 'block';
    });
}
