
const TMDB_API_KEY = '19739a5cb7feec7a597b8a968235dc9b';

const top250 = [
  278, 238, 155, 424, 13, 122, 680, 27205, 550, 240
];

document.getElementById('rollBtn').addEventListener('click', async () => {
  const randomId = top250[Math.floor(Math.random() * top250.length)];
  const res = await fetch(`https://api.themoviedb.org/3/movie/${randomId}?api_key=${TMDB_API_KEY}&language=ru-RU`);
  const data = await res.json();

  document.getElementById('movieTitle').textContent = data.title;
  document.getElementById('poster').src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  document.getElementById('overview').textContent = data.overview;
  document.getElementById('result').style.display = 'block';
});
