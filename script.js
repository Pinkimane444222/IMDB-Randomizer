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
  // Скрываем индикатор загрузки
  document.getElementById('loadingIndicator').style.display = 'none';
  
  const card = document.getElementById('movieCard');
  // Устанавливаем название фильма в заголовок карточки
  document.getElementById('movieTitleLarge').textContent = data.title;
  document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
  document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
  document.getElementById('movieOverview').textContent = data.overview;
  document.getElementById('movieGenres').textContent = data.genres.map(g => g.name).join(", ");
  document.getElementById('movieLink').href = `https://www.themoviedb.org/movie/${data.id}`;
  
  // Проверяем, есть ли постер
  if (data.poster_path) {
    document.getElementById('moviePoster').src = `${IMAGE_BASE_URL}${data.poster_path}`;
  } else {
    document.getElementById('moviePoster').src = 'https://via.placeholder.com/500x750?text=Нет+Постера';
  }

  // Анимация появления карточки
  card.classList.remove('fade-out');
  card.style.display = 'flex';
  void card.offsetWidth;
  card.classList.add('fade-in');
}

function fetchMovie(id) {
  // Показываем индикатор загрузки
  document.getElementById('loadingIndicator').style.display = 'block';
  
  fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      history.push(id);
      showMovie(data);
    })
    .catch(error => {
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('error');
      errorMessage.textContent = 'Ошибка при загрузке данных. Попробуйте еще раз.';
      document.querySelector('main').prepend(errorMessage);
      
      // Убираем сообщение через 3 секунды
      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
    })
    .finally(() => {
      isLoading = false;
    });
}

function loadRandomMovie() {
  if (isLoading) return;
  isLoading = true;
  
  // Скрываем предыдущие ошибки
  const prevErrors = document.querySelectorAll('.error');
  prevErrors.forEach(el => el.remove());

  const card = document.getElementById('movieCard');
  if (card.style.display === 'flex') {
    // Показываем индикатор загрузки
    document.getElementById('loadingIndicator').style.display = 'block';
    
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
  
  // Показываем индикатор загрузки
  document.getElementById('loadingIndicator').style.display = 'block';
  
  setTimeout(() => {
    card.style.display = 'none';
    fetchMovie(id);
  }, 400);
}

function toggleGenreSelect() {
  const genreContainer = document.getElementById('genreSelectContainer');
  if (genreContainer.style.display === 'none') {
    genreContainer.style.display = 'block';
  } else {
    genreContainer.style.display = 'none';
  }
}

// Обработчики событий
document.getElementById('newBtn').onclick = loadRandomMovie;
document.getElementById('genresBtn').onclick = toggleGenreSelect;

document.getElementById('genreSelect').onchange = function(e) {
  selectedGenre = e.target.value;
  moviePage = 1;
  // Скрываем selector после выбора
  document.getElementById('genreSelectContainer').style.display = 'none';
  loadRandomMovie();
};

document.querySelector('.back-btn').onclick = function() {
  if (history.length > 1) {
    loadPreviousMovie();
  } else {
    // Если нет истории, возвращаемся на приветственный экран
    document.getElementById('mainInterface').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'block';
  }
};

document.getElementById('startBtn').onclick = function() {
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('mainInterface').style.display = 'block';
  getGenres().then(loadRandomMovie);
};

// Реализация клика по экрану для получения нового фильма
document.addEventListener('click', (e) => {
  // Игнорируем клики на кнопках и внутри модалки с жанрами
  if (e.target.closest('button') || e.target.closest('#genreSelectContainer')) return;
  
  // Если интерфейс показан и не происходит загрузка
  if (document.getElementById('mainInterface').style.display === 'block') {
    // Если открыт селектор жанров, сначала закрываем его
    if (document.getElementById('genreSelectContainer').style.display !== 'none') {
      document.getElementById('genreSelectContainer').style.display = 'none';
      return;
    }
    
    loadRandomMovie();
  }
});
