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
function getDominantColor(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";  // Важно для работы с внешними изображениями
    img.src = imageUrl;
    
    img.onload = function() {
      // Создаем canvas для анализа изображения
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // Устанавливаем размер canvas небольшим для быстрого анализа
      canvas.width = 50;
      canvas.height = 50;
      
      // Рисуем изображение на canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        // Получаем пиксельные данные
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        let r = 0, g = 0, b = 0, count = 0;
        
        // Простой алгоритм - берем среднее значение цветов
        // и пропускаем слишком темные и слишком светлые пиксели
        for (let i = 0; i < imageData.length; i += 4) {
          const red = imageData[i];
          const green = imageData[i + 1];
          const blue = imageData[i + 2];
          const alpha = imageData[i + 3];
          
          // Пропускаем прозрачные пиксели
          if (alpha < 128) continue;
          
          // Пропускаем слишком темные или слишком светлые пиксели
          const brightness = (red + green + blue) / 3;
          if (brightness < 20 || brightness > 230) continue;
          
          r += red;
          g += green;
          b += blue;
          count++;
        }
        
        if (count > 0) {
          // Получаем среднее значение цветов
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          // Создаем пастельные варианты цвета для градиента
          const pastelColors = createPastelColorGradient(r, g, b);
          resolve(pastelColors);
        } else {
          // Если не удалось найти подходящие пиксели, возвращаем стандартные цвета
          resolve({
            color1: '#121826',
            color2: '#0d111a',
            color3: '#1a2234',
            color4: '#0f1522'
          });
        }
      } catch (error) {
        console.error("Ошибка при анализе цвета:", error);
        reject(error);
      }
    };
    
    img.onerror = function() {
      console.error("Не удалось загрузить изображение для анализа");
      reject(new Error("Ошибка загрузки изображения"));
    };
  });
}

// Создаем набор пастельных цветов для градиента на основе исходного цвета
function createPastelColorGradient(r, g, b) {
  // Функция для создания пастельного варианта цвета
  function pastelize(r, g, b, factor) {
    // Смешиваем с белым для получения пастельного тона
    r = Math.floor(r + (255 - r) * factor);
    g = Math.floor(g + (255 - g) * factor);
    b = Math.floor(b + (255 - b) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // Создаем небольшие вариации основного цвета для градиента
  // Используя HSL для лучшего контроля вариаций
  function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // оттенок серого
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // оттенок серого
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // Конвертируем в HSL для модификации
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Создаем 4 вариации цвета для градиента
  // Модифицируя оттенок и насыщенность
  const rgb1 = hslToRgb(h, Math.min(s * 0.9, 60), Math.min(l * 1.2, 80));
  const rgb2 = hslToRgb((h + 20) % 360, Math.min(s * 0.7, 50), Math.min(l * 1.3, 85));
  const rgb3 = hslToRgb((h + 340) % 360, Math.min(s * 0.8, 55), Math.min(l * 1.1, 75));
  const rgb4 = hslToRgb((h + 10) % 360, Math.min(s * 0.6, 45), Math.min(l * 1.25, 82));
  
  // Создаем пастельные версии этих цветов
  const pastelFactor = 0.5; // Коэффициент пастельности
  
  return {
    color1: pastelize(rgb1[0], rgb1[1], rgb1[2], pastelFactor),
    color2: pastelize(rgb2[0], rgb2[1], rgb2[2], pastelFactor),
    color3: pastelize(rgb3[0], rgb3[1], rgb3[2], pastelFactor),
    color4: pastelize(rgb4[0], rgb4[1], rgb4[2], pastelFactor)
  };
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
  document.getElementById('movieGenres').textContent = data.genres.map(g => g.name).join(", ");
  document.getElementById('movieLink').href = `https://www.themoviedb.org/movie/${data.id}`;
  
  // Обрабатываем постер и извлекаем цвет
  if (data.poster_path) {
    const posterUrl = `${IMAGE_BASE_URL}${data.poster_path}`;
    document.getElementById('moviePoster').src = posterUrl;
    
    // Извлекаем цвет из постера и применяем его к фону
    getDominantColor(posterUrl)
      .then(colors => {
        applyGradientBackground(colors);
      })
      .catch(error => {
        console.error("Ошибка при обработке цвета:", error);
        // В случае ошибки используем стандартный градиент
        applyGradientBackground({
          color1: '#121826',
          color2: '#0d111a',
          color3: '#1a2234',
          color4: '#0f1522'
        });
      });
  } else {
    document.getElementById('moviePoster').src = 'https://via.placeholder.com/500x750?text=Нет+Постера';
    // Стандартный градиент для фильмов без постера
    applyGradientBackground({
      color1: '#121826',
      color2: '#0d111a',
      color3: '#1a2234',
      color4: '#0f1522'
    });
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
