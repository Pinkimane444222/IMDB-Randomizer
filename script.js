const API_KEY = '19739a5cb7feec7a597b8a968235dc9b';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let moviePage = 1;
let isLoading = false;
let genreMap = {};
let selectedGenre = '';
const history = [];

// Определения цветов для конкретных фильмов по названию
const movieTitles = {
  'форрест гамп': {
    color1: '#89cff0', // светло-голубой
    color2: '#afdfe4', // пастельно-голубой
    color3: '#99c1de', // небесно-голубой
    color4: '#c2e6eb', // очень светло-голубой
  },
  'криминальное чтиво': {
    color1: '#000000', // черный
    color2: '#333333', // темно-серый
    color3: '#1a1a1a', // почти черный
    color4: '#4d4d4d', // серый
  },
  'зеленая миля': {
    color1: '#006400', // темно-зеленый
    color2: '#228b22', // зеленый
    color3: '#1c6e44', // лесной зеленый
    color4: '#308f65', // светло-зеленый
  },
  'звездные войны': {
    color1: '#000033', // глубокий космический синий
    color2: '#191970', // полуночный синий
    color3: '#0b045e', // темно-синий
    color4: '#2f3699', // синий
  },
  'титаник': {
    color1: '#004d99', // глубокий синий
    color2: '#0073e6', // морской синий
    color3: '#1e81b0', // сине-стальной
    color4: '#0066cc', // океанический синий
  },
  'матрица': {
    color1: '#005c29', // темно-зеленый
    color2: '#00734d', // зеленый
    color3: '#00461c', // глубокий зеленый
    color4: '#008080', // бирюзовый
  },
  'властелин колец': {
    color1: '#654321', // коричневый
    color2: '#8b4513', // седлово-коричневый
    color3: '#a0522d', // охра
    color4: '#cd853f', // светло-коричневый
  }
};

// Базовые цветовые темы для разных жанров
const genreColors = {
  'комедия': {
    color1: '#ffd700', // золотистый
    color2: '#ffb84d', // оранжевый
    color3: '#ffdb7d', // светло-оранжевый
    color4: '#ffc965', // персиковый
  },
  'драма': {
    color1: '#4682b4', // сталь синий
    color2: '#6495ed', // голубой
    color3: '#5f9ea0', // кадетский синий
    color4: '#7ba7cc', // светло-синий
  },
  'мелодрама': {
    color1: '#db7093', // розовый
    color2: '#e6a8d7', // светло-розовый
    color3: '#c48c9c', // пыльная роза
    color4: '#d8a1c4', // лавандовый
  },
  'фантастика': {
    color1: '#483d8b', // темно-синий
    color2: '#9370db', // фиолетовый
    color3: '#6a5acd', // сине-фиолетовый
    color4: '#8a73c7', // лавандовый
  },
  'приключения': {
    color1: '#228b22', // лесной зеленый
    color2: '#3cb371', // зеленый
    color3: '#2e8b57', // морской зеленый
    color4: '#66cdaa', // бирюзовый
  },
  'боевик': {
    color1: '#b22222', // огненно-красный
    color2: '#cd5c5c', // индийский красный
    color3: '#a52a2a', // коричневый
    color4: '#dc6e6e', // светло-красный
  },
  'детектив': {
    color1: '#2f4f4f', // темно-сланцевый
    color2: '#556b2f', // оливково-зеленый
    color3: '#5f666d', // серо-синий
    color4: '#708090', // сланцево-серый
  },
  'триллер': {
    color1: '#800000', // темно-бордовый
    color2: '#8b0000', // темно-красный
    color3: '#9c0e0e', // красно-коричневый
    color4: '#990000', // алый
  },
  'ужасы': {
    color1: '#1a1a1a', // почти черный
    color2: '#4d0000', // темно-кровавый
    color3: '#300000', // темно-бордовый
    color4: '#2b0000', // очень темный красный
  },
  'мультфильм': {
    color1: '#00ced1', // бирюзовый
    color2: '#40e0d0', // голубой
    color3: '#48d1cc', // аквамарин
    color4: '#20b2aa', // светло-морской зеленый
  },
  'семейный': {
    color1: '#ffa500', // оранжевый
    color2: '#ffcf40', // светло-оранжевый
    color3: '#ffc125', // песочный
    color4: '#ffd700', // золотой
  }
};

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

// Функция для получения цветов по жанрам фильма
function getGradientByGenre(genres) {
  // Пытаемся найти первое совпадение жанра
  for (const genre of genres) {
    const lowerGenre = genre.toLowerCase();
    for (const key in genreColors) {
      if (lowerGenre.includes(key)) {
        return genreColors[key];
      }
    }
  }
  
  // Если жанров нет или нет совпадения, возвращаем стандартный градиент
  return {
    color1: '#121826',
    color2: '#0d111a', 
    color3: '#1a2234',
    color4: '#0f1522'
  };
}

// Функция для получения цветов по названию фильма
function getColorByMovieTitle(title) {
  const titleLower = title.toLowerCase();
  
  // Проверяем наличие точного совпадения
  for (const key in movieTitles) {
    if (titleLower.includes(key)) {
      return movieTitles[key];
    }
  }
  
  // Если нет совпадения по названию, возвращаем null
  return null;
}

// Применяет градиент к фону страницы
function applyGradientBackground(colors) {
  const gradient = `linear-gradient(-45deg, ${colors.color1}, ${colors.color2}, ${colors.color3}, ${colors.color4})`;
  document.body.style.background = gradient;
  document.body.style.backgroundSize = "400% 400%";
  
  // Сбрасываем анимацию для перезапуска
  document.body.style.animation = 'none';
  // Форсируем перерисовку
  void document.body.offsetWidth;
  // Перезапускаем анимацию
  document.body.style.animation = "gradientBG 15s ease infinite";
  
  console.log("Применен новый градиент:", gradient);
}

function showMovie(data) {
  const card = document.getElementById('movieCard');
  
  // Устанавливаем данные фильма
  document.getElementById('movieTitle').textContent = data.title;
  document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
  document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
  document.getElementById('movieOverview').textContent = data.overview;
  
  // Получаем жанры фильма
  const genres = data.genres.map(g => g.name);
  document.getElementById('movieGenres').textContent = genres.join(", ");
  document.getElementById('movieLink').href = `https://www.themoviedb.org/movie/${data.id}`;
  
  // Устанавливаем постер
  if (data.poster_path) {
    document.getElementById('moviePoster').src = `${IMAGE_BASE_URL}${data.poster_path}`;
  } else {
    document.getElementById('moviePoster').src = 'https://via.placeholder.com/500x750?text=Нет+Постера';
  }
  
  // Сначала пробуем найти цвета по названию фильма
  let colors = getColorByMovieTitle(data.title);
  
  // Если не нашли по названию, ищем по жанрам
  if (!colors && genres.length > 0) {
    colors = getGradientByGenre(genres);
  }
  
  // Если всё равно нет цветов, используем стандартные
  if (!colors) {
    colors = {
      color1: '#121826',
      color2: '#0d111a',
      color3: '#1a2234',
      color4: '#0f1522'
    };
  }
  
  // Применяем цвета к фону
  applyGradientBackground(colors);

  // Анимация появления карточки
  card.classList.remove('fade-out');
  card.style.display = 'flex';
  void card.offsetWidth;
  card.classList.add('fade-in');
}

function fetchMovie(id) {
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
