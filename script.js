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

// Функция для извлечения доминирующего цвета из изображения
function getDominantColor(imgEl) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Обработчик загрузки изображения
    imgEl.onload = function() {
      // Используем уменьшенное изображение для быстрого анализа
      canvas.width = 50;
      canvas.height = 50;
      
      // Рисуем изображение на canvas
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
      
      // Получаем данные пикселей
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      // Объект для подсчета частоты цветов
      const colorMap = {};
      
      // Анализируем каждый пиксель
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        
        // Группируем похожие цвета, округляя значения
        const roundedR = Math.round(r / 10) * 10;
        const roundedG = Math.round(g / 10) * 10;
        const roundedB = Math.round(b / 10) * 10;
        
        const key = `${roundedR}-${roundedG}-${roundedB}`;
        
        if (!colorMap[key]) {
          colorMap[key] = {
            count: 0,
            r: roundedR,
            g: roundedG,
            b: roundedB
          };
        }
        
        colorMap[key].count++;
      }
      
      // Находим наиболее часто встречающийся цвет
      let dominantColor = null;
      let maxCount = 0;
      
      for (const key in colorMap) {
        if (colorMap[key].count > maxCount) {
          maxCount = colorMap[key].count;
          dominantColor = colorMap[key];
        }
      }
      
      // Делаем цвет более пастельным
      const pastelDominantColor = createPastelColor(dominantColor.r, dominantColor.g, dominantColor.b);
      
      resolve(pastelDominantColor);
    };
  });
}

// Функция для создания пастельного варианта цвета
function createPastelColor(r, g, b) {
  // Смешиваем с белым для создания пастельного тона
  const pastelFactor = 0.6; // Чем больше значение, тем более пастельный цвет
  
  const pastelR = Math.floor(r + (255 - r) * pastelFactor);
  const pastelG = Math.floor(g + (255 - g) * pastelFactor);
  const pastelB = Math.floor(b + (255 - b) * pastelFactor);
  
  // Возвращаем осветленный цвет и немного затемненный вариант для градиента
  return {
    light: `rgb(${pastelR}, ${pastelG}, ${pastelB})`,
    dark: `rgb(${Math.max(0, pastelR - 50)}, ${Math.max(0, pastelG - 50)}, ${Math.max(0, pastelB - 50)})`
  };
}

// Функция для установки фонового градиента
function setGradientBackground(colorObj) {
  document.body.style.background = `linear-gradient(-45deg, ${colorObj.dark}, ${colorObj.light}, ${colorObj.dark}, ${colorObj.light})`;
  document.body.style.backgroundSize = "400% 400%";
  document.body.style.animation = "gradientBG 15s ease infinite";
}

function showMovie(data) {
  const card = document.getElementById('movieCard');
  // Устанавливаем название фильма в заголовок карточки
  document.getElementById('movieTitle').textContent = data.title;
  document.getElementById('movieYear').textContent = new Date(data.release_date).getFullYear();
  document.getElementById('movieRating').textContent = data.vote_average.toFixed(1);
  document.getElementById('movieOverview').textContent = data.overview;
  document.getElementById('movieGenres').textContent = data.genres.map(g => g.name).join(", ");
  document.getElementById('movieLink').href = `https://www.themoviedb.org/movie/${data.id}`;
  
  // Получаем элемент изображения постера
  const posterElement = document.getElementById('moviePoster');
  
  // Проверяем, есть ли постер
  if (data.poster_path) {
    posterElement.src = `${IMAGE_BASE_URL}${data.poster_path}`;
    
    // Анализируем постер и устанавливаем градиент после загрузки
    posterElement.onload = async function() {
      try {
        const dominantColor = await getDominantColor(posterElement);
        setGradientBackground(dominantColor);
      } catch (e) {
        console.error('Ошибка при анализе цвета постера:', e);
      }
    };
  } else {
    posterElement.src = 'https://via.placeholder.com/500x750?text=Нет+Постера';
    // Устанавливаем стандартный градиент в случае отсутствия постера
    document.body.style.background = 'linear-gradient(-45deg, #121826, #0d111a, #1a2234, #0f1522)';
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
