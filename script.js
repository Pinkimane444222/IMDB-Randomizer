const API_KEY = '19739a5cb7feec7a597b8a968235dc9b';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie/';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const movieIds = [
  238, 240, 278, 424, 19404, 389, 129, 497, 680, 13, 122, 155, 769, 496243, 550, 
  372058, 807, 1891, 372754, 122906, 101, 1892, 637, 122917, 324857, 103, 13223,
  424694, 600, 510, 11216, 948, 117, 807172, 73, 7695, 118, 378, 275, 107, 
  157336, 280, 240832, 157, 9693, 111, 278927, 428, 1911, 185, 667, 614, 204, 
  302, 104, 95, 339, 11324, 600583, 274, 115, 11, 949, 1893, 539, 121, 4922, 
  1620, 603, 517814, 598, 114, 438631, 8966, 497582, 102, 453395, 313369, 58,
  419430, 599, 300, 1396, 346, 641, 1771, 109, 335787, 38, 10625, 315162, 
  49026, 808, 106, 198184, 37258, 119, 22538, 218, 228150, 12, 678, 543, 438, 
  401, 214, 777, 456, 6789, 34567, 345, 1234, 7890, 4567, 9087, 234, 6789,
  9234, 5678, 9876, 12345, 78901, 89012, 3456, 78902, 2345, 67893, 10987,
  45678, 8901, 12309, 67890, 23456, 12321, 98765, 67812, 54321, 10987, 11111,
  67891, 34567, 89123, 45689, 90876, 23490, 67893, 99999, 22222, 88888, 44444,
  33333, 77777, 55555, 66666, 11112, 34568, 89124, 12345, 67894, 45670, 90909,
  34567, 98765, 45689, 12321, 55555, 67811, 12344, 89012, 67899, 22222, 33333
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
  const carousel = document.getElementById('imageCarousel');
  carousel.innerHTML = '';

  movieCard.style.display = 'none';
  errorMessage.style.display = 'none';

  fetch(`${TMDB_BASE_URL}${id}?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('movieTitle').textContent = data.title;
      document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
      document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
      document.getElementById('moviePoster').src = `${IMAGE_BASE_URL}${data.poster_path}`;

      const overview = data.overview;
      document.getElementById('movieOverview').innerHTML = overview.length > 300
        ? `${overview.substring(0, 300)}... <a href="https://www.themoviedb.org/movie/${id}" target="_blank">Читать далее</a>`
        : overview;

      fetchImages(id); // Загружаем изображения для карусели

      movieCard.style.display = 'flex';
    })
    .catch(error => {
      console.error(error);
      errorMessage.textContent = 'Ошибка при загрузке данных.';
      errorMessage.style.display = 'block';
    });
}

function fetchImages(movieId) {
  fetch(`${TMDB_BASE_URL}${movieId}/images?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const images = data.backdrops.slice(0, 5); // Берем до 5 кадров
      const carousel = document.getElementById('imageCarousel');
      images.forEach(img => {
        const imgElement = document.createElement('img');
        imgElement.src = `${IMAGE_BASE_URL}${img.file_path}`;
        imgElement.className = 'carousel-item';
        carousel.appendChild(imgElement);
      });
    })
    .catch(error => console.error('Ошибка загрузки изображений:', error));
}
