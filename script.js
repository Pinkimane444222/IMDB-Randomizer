const TMDB_API_KEY = '19739a5cb7feec7a597b8a968235dc9b';

const top250 = [
    278, 238, 155, 424, 13, 122, 680, 27205, 550, 240,
    1891, 497, 862, 769, 157336, 510, 539, 120,
    644, 637, 696, 603, 429, 157336, 121, 122, 13, 155,
    238, 680, 27205, 424, 240, 1891, 497, 862, 769,
    278, 550, 603, 238, 680, 155, 550, 122, 424, 240,
    1891, 862, 497, 769, 157336, 510, 539, 120, 637,
    696, 603, 429, 238, 155, 13, 122, 680, 27205, 240,
    1891, 497, 862, 769, 157336, 278, 550, 603, 13,
    680, 238, 155, 429, 510, 769, 862, 497, 240, 424
];

// Функция, чтобы выбрать фильм без повторов
let remainingMovies = [...top250]; // Копируем массив, чтобы не изменять оригинал

document.getElementById('rollBtn').addEventListener('click', async () => {
  if (remainingMovies.length === 0) {
    alert('Все фильмы были показаны!');
    return;
  }

  const randomIndex = Math.floor(Math.random() * remainingMovies.length);
  const randomId = remainingMovies[randomIndex];

  // Удаляем фильм из массива, чтобы не показывать его повторно
  remainingMovies.splice(randomIndex, 1);

  const res = await fetch(`https://api.themoviedb.org/3/movie/${randomId}?api_key=${TMDB_API_KEY}&language=ru-RU`);
  const data = await res.json();

  document.getElementById('movieTitle').textContent = data.title;
  document.getElementById('poster').src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  document.getElementById('overview').textContent = data.overview;
  document.getElementById('result').style.display = 'block';
});