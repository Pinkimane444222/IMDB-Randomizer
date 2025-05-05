
const TMDB_API_KEY = '19739a5cb7feec7a597b8a968235dc9b';

// Список ID фильмов из TMDB (заменяем IMDb top 250)
const top250 = [
  278, // The Shawshank Redemption
  238, // The Godfather
  155, // The Dark Knight
  424, // Schindler's List
  13,  // Forrest Gump
  122, // The Lord of the Rings: The Return of the King
  680, // Pulp Fiction
  27205, // Inception
  550, // Fight Club
  13,  // Forrest Gump
  // Добавь остальные фильмы...
];

document.getElementById('rollBtn').addEventListener('click', async () => {
  const randomId = top250[Math.floor(Math.random() * top250.length)];
  const res = await fetch(`https://api.themoviedb.org/3/movie/${randomId}?api_key=${TMDB_API_KEY}&language=ru-RU`);
  const data = await res.json();

  document.getElementById('movieTitle').textContent = data.title;
  document.getElementById('poster').src = https://image.tmdb.org/t/p/w500${data.poster_path};
  document.getElementById('overview').textContent = data.overview;

  document.getElementById('result').style.display = 'block';
});
