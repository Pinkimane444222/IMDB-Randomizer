const API_KEY = '19739a5cb7feec7a597b8a968235dc9b';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let moviePage = 1;
let isLoading = false;
let genreMap = {};
let selectedGenre = '';
const history = [];
let currentMovieLink = '';

function getGenres() {
  return fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=ru`)
    .then(res => res.json())
    .then(data => {
      // Создаем элементы для каждого жанра
      const genreList = document.querySelector('.genre-list');
      
      // Сортируем жанры по алфавиту
      data.genres.sort((a, b) => a.name.localeCompare(b.name));
      
      // Сохраняем жанры в map для быстрого доступа
      data.genres.forEach(g => {
        genreMap[g.id] = g.name;
        
        // Создаем элемент для жанра
        const genreElement = document.createElement('div');
        genreElement.classList.add('genre-item');
        genreElement.setAttribute('data-genre', g.id);
        genreElement.textContent = g.name;
        
        // Добавляем обработчик клика
        genreElement.addEventListener('click', function() {
          selectGenre(g.id);
        });
        
        genreList.appendChild(genreElement);
      });
    });
}

// Выбор жанра и обновление UI
function selectGenre(genreId) {
  // Обновляем выбранный жанр
  selectedGenre = genreId;
  
  // Обновляем UI - меняем активный класс
  const genreItems = document.querySelectorAll('.genre-item');
  genreItems.forEach(item => {
    if (item.getAttribute('data-genre') === genreId.toString()) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Скрываем модальное окно с жанрами
  document.getElementById('genreListContainer').style.display = 'none';
  
  // Сбрасываем страницу и загружаем новый фильм
  moviePage = 1;
  loadRandomMovie();
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

// Функция для сокращения описания до определенного количества символов
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  // Находим последний пробел перед лимитом, чтобы не обрезать слова
  let lastSpace = text.lastIndexOf(' ', maxLength);
  if (lastSpace === -1) lastSpace = maxLength;
  
  return text.substring(0, lastSpace) + '...';
}

function showMovie(data) {
  const card = document.getElementById('movieCard');
  
  // Устанавливаем данные фильма
  document.getElementById('movieTitle').textContent = data.title;
  document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
  document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
  
  // Обрабатываем описание фильма
  const overview = data.overview || 'Описание отсутствует';
  const shortOverview = truncateText(overview, 150);
  
  // Устанавливаем короткое и полное описание
  document.getElementById('movieOverview').textContent = shortOverview;
  document.getElementById('movieOverviewFull').textContent = overview;
  
  // Показываем/скрываем кнопку "Показать больше" в зависимости от длины текста
  const readMoreToggle = document.getElementById('readMore');
  if (overview.length <= 150) {
    readMoreToggle.style.display = 'none';
  } else {
    readMoreToggle.style.display = 'inline-block';
    readMoreToggle.textContent = 'Показать больше';
    document.getElementById('movieOverviewFull').style.display = 'none';
  }
  
  // Получаем жанры фильма
  const genres = data.genres.map(g => g.name);
  document.getElementById('movieGenres').textContent = genres.join(", ");
  
  // Сохраняем ссылку на фильм
  currentMovieLink = `https://www.themoviedb.org/movie/${data.id}`;
  
  // Устанавливаем постер
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

function toggleGenreList() {
  const genreContainer = document.getElementById('genreListContainer');
  if (genreContainer.style.display === 'none') {
    genreContainer.style.display = 'block';
  } else {
    genreContainer.style.display = 'none';
  }
}

// Функция для переключения между коротким и полным описанием
function toggleOverview() {
  const shortOverview = document.getElementById('movieOverview');
  const fullOverview = document.getElementById('movieOverviewFull');
  const readMoreToggle = document.getElementById('readMore');
  
  if (fullOverview.style.display === 'none') {
    // Показываем полное описание
    shortOverview.style.display = 'none';
    fullOverview.style.display = 'block';
    readMoreToggle.textContent = 'Скрыть';
  } else {
    // Показываем короткое описание
    shortOverview.style.display = 'block';
    fullOverview.style.display = 'none';
    readMoreToggle.textContent = 'Показать больше';
  }
}

// Функция для открытия ссылки на фильм
function openMovieLink() {
  if (currentMovieLink) {
    window.open(currentMovieLink, '_blank');
  }
}

// Инициализируем активный жанр "Все жанры" при загрузке
function initGenres() {
  const allGenresItem = document.querySelector('.genre-item[data-genre=""]');
  if (allGenresItem) {
    allGenresItem.classList.add('active');
  }
}

// Обработчики событий
document.getElementById('openLinkBtn').onclick = openMovieLink;
document.getElementById('genresBtn').onclick = toggleGenreList;
document.getElementById('readMore').onclick = toggleOverview;

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
  getGenres().then(() => {
    initGenres();
    loadRandomMovie();
  });
};

// Реализация клика по экрану для получения нового фильма
document.addEventListener('click', (e) => {
  // Игнорируем клики на кнопках и внутри модалки с жанрами
  if (e.target.closest('button') || e.target.closest('#genreListContainer') || 
      e.target.closest('.read-more-toggle')) return;
  
  // Если интерфейс показан и не происходит загрузка
  if (document.getElementById('mainInterface').style.display === 'block') {
    // Если открыт селектор жанров, сначала закрываем его
    if (document.getElementById('genreListContainer').style.display !== 'none') {
      document.getElementById('genreListContainer').style.display = 'none';
      return;
    }
    
    loadRandomMovie();
  }
});

// Установка активного жанра при клике на жанр в списке "Все жанры"
document.querySelector('.genre-item[data-genre=""]').addEventListener('click', function() {
  selectGenre('');
});
