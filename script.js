const API_KEY = '19739a5cb7feec7a597b8a968235dc9b'; 
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie/';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const movieIds = [
  238, 240, 278, 424, 19404, 389, 129, 497, 680, 13,
  122, 155, 769, 496243, 550, 372058, 807, 1891, 372754, 122906,
  101, 1892, 637, 122917, 324857, 103, 13223, 424694, 600, 510,
  11216, 948, 117, 807172, 73, 7695, 118, 378, 275, 107,
  157336, 280, 240832, 157, 9693, 111, 278927, 428, 1911, 185,
  667, 614, 204, 302, 104, 95, 339, 11324, 600583, 274,
  115, 11, 949, 1893, 539, 121, 4922, 1620, 603, 517814,
  598, 114, 438631, 8966, 497582, 102, 453395, 313369, 58, 419430,
  599, 300, 1396, 346, 641, 1771, 109, 335787, 38, 10625,
  315162, 49026, 808, 106, 198184, 37258, 119, 22538, 218, 228150,
  272, 679, 500, 657, 205, 682, 334543, 98, 1124, 276,
  385687, 522924, 123, 301528, 219, 555, 244786, 694, 94, 348,
  360, 298, 901, 105, 385, 241, 149, 376290, 337170, 505,
  76, 37799, 207, 41, 286, 337404, 198, 108, 77, 453,
  81, 137113, 120467, 28, 16, 68718, 78, 202
];

let remainingIds = [...movieIds];

document.body.addEventListener('click', () => {
  const tapHint = document.getElementById('tapHint');
  if (tapHint) tapHint.style.display = 'none';

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
  const moviePoster = document.getElementById('moviePoster');
  const movieTitle = document.getElementById('movieTitle');
  const movieYear = document.getElementById('movieYear');
  const movieRating = document.getElementById('movieRating');
  const movieOverview = document.getElementById('movieOverview');
  const movieLink = document.getElementById('movieLink');

  movieCard.style.display = 'none';
  errorMessage.style.display = 'none';

  fetch(`${TMDB_BASE_URL}${id}?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      movieTitle.textContent = data.title;
      movieYear.textContent = new Date(data.release_date).getFullYear();
      movieRating.textContent = data.vote_average.toFixed(1);
      movieOverview.textContent = data.overview;
      movieLink.href = `https://www.themoviedb.org/movie/${id}`;
      moviePoster.src = `${IMAGE_BASE_URL}${data.poster_path}`;
      movieCard.style.display = 'block';
    })
    .catch(error => {
      console.error(error);
      errorMessage.textContent = 'Ошибка при загрузке данных.';
      errorMessage.style.display = 'block';
    });
}
