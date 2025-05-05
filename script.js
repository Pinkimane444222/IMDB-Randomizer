// Дождемся полной загрузки DOM перед выполнением скрипта
document.addEventListener('DOMContentLoaded', function() {
    // Проверим, загрузился ли Telegram Web App
    let tg;
    try {
        tg = window.Telegram.WebApp;
        tg.expand();
        tg.ready();
        console.log("Telegram WebApp успешно инициализирован");
    } catch (error) {
        console.error("Ошибка инициализации Telegram WebApp:", error);
        // Fallback для тестирования вне Telegram
        tg = {
            themeParams: {
                bg_color: '#ffffff',
                text_color: '#222222',
                button_color: '#2AABEE',
                button_text_color: '#ffffff'
            }
        };
    }

    // Применяем цвета темы Telegram
    document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
    document.body.style.color = tg.themeParams.text_color || '#222222';

    // TMDB API settings
    const TMDB_API_KEY = '19739a5cb7feec7a597b8a968235dc9b'; // API ключ
    const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

    // Получаем DOM элементы
    const movieCard = document.getElementById('movieCard');
    const moviePoster = document.getElementById('moviePoster');
    const movieTitle = document.getElementById('movieTitle');
    const movieYear = document.getElementById('movieYear');
    const movieRating = document.getElementById('movieRating');
    const movieOverview = document.getElementById('movieOverview');
    const rollButton = document.getElementById('rollButton');
    const loadingElement = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');

    // Проверим существование всех DOM элементов
    const elements = [movieCard, moviePoster, movieTitle, movieYear, movieRating, movieOverview, rollButton, loadingElement, errorMessage];
    const elementNames = ['movieCard', 'moviePoster', 'movieTitle', 'movieYear', 'movieRating', 'movieOverview', 'rollButton', 'loadingElement', 'errorMessage'];
    
    for (let i = 0; i < elements.length; i++) {
        if (!elements[i]) {
            console.error(`DOM элемент не найден: ${elementNames[i]}`);
        }
    }

    // IMDb Top 250 (короткий список для примера)
    const imdbTop250 = [
        {id: 278, title: "The Shawshank Redemption"},
        {id: 238, title: "The Godfather"},
        {id: 240, title: "The Godfather: Part II"},
        {id: 424, title: "Schindler's List"},
        {id: 389, title: "12 Angry Men"},
        {id: 155, title: "The Dark Knight"},
        {id: 429, title: "The Lord of the Rings: The Return of the King"},
        {id: 550, title: "Fight Club"},
        {id: 680, title: "Pulp Fiction"},
        {id: 13, title: "Forrest Gump"},
        {id: 122, title: "The Lord of the Rings: The Fellowship of the Ring"},
        {id: 769, title: "GoodFellas"},
        {id: 11216, title: "Cinema Paradiso"},
        {id: 497, title: "The Green Mile"},
        {id: 637, title: "Life Is Beautiful"},
        {id: 101, title: "Leon: The Professional"},
        {id: 346, title: "Seven Samurai"},
        {id: 73, title: "American History X"},
        {id: 603, title: "The Matrix"},
        {id: 324857, title: "Spider-Man: Into the Spider-Verse"},
        {id: 324, title: "Psycho"},
        {id: 372058, title: "Your Name."},
        {id: 129, title: "Spirited Away"},
        {id: 619, title: "The Usual Suspects"},
        {id: 807, title: "Se7en"},
        {id: 857, title: "Saving Private Ryan"},
        {id: 4935, title: "Howl's Moving Castle"},
        {id: 120, title: "The Lord of the Rings: The Fellowship of the Ring"}
    ];

    // Убрали дубликаты из списка
    const uniqueMovies = Array.from(new Set(imdbTop250.map(movie => movie.id)))
        .map(id => imdbTop250.find(movie => movie.id === id));

    console.log(`Загружено ${uniqueMovies.length} уникальных фильмов`);

    // Список фильмов, которые уже были показаны
    let shownMovies = [];

    // Скрываем загрузку и карточку фильма изначально
    if (loadingElement) loadingElement.style.display = 'none';
if (movieCard) movieCard.style.display = 'none';

    /**
     * Получение случайного фильма, который еще не был показан
     */
    function getRandomMovie() {
        if (shownMovies.length >= uniqueMovies.length) {
            // Сброс, если все фильмы уже были показаны
            console.log("Все фильмы были показаны, сбрасываем историю");
            shownMovies = [];
        }

        // Отфильтровываем фильмы, которые уже были показаны
        const availableMovies = uniqueMovies.filter(movie => 
            !shownMovies.some(shownMovie => shownMovie.id === movie.id)
        );

        console.log(`Доступно ${availableMovies.length} фильмов для выбора`);
        
        if (availableMovies.length === 0) {
            console.error("Нет доступных фильмов!");
            return null;
        }

        const randomIndex = Math.floor(Math.random() * availableMovies.length);
        const selectedMovie = availableMovies[randomIndex];
        console.log("Выбран фильм:", selectedMovie);
        return selectedMovie;
    }

    /**
     * Получение данных о фильме с TMDB API
     */
    async function fetchMovieDetails(movieId) {
        try {
            console.log(`Получение данных для фильма ID: ${movieId}`);
            const url = https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ru;
            console.log("Запрос к API:", url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Ошибка API: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch movie details: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Получены данные фильма:", data);
            return data;
        } catch (error) {
            console.error("Ошибка при получении данных фильма:", error);
            throw error;
        }
    }

    /**
     * Отображение информации о фильме
     */
    function displayMovie(movie) {
        console.log("Отображение фильма:", movie.title);
        
        if (movieTitle) movieTitle.textContent = movie.title || 'Название недоступно';
        
        // Проверяем наличие даты релиза
        if (movieYear && movie.release_date) {
            movieYear.textContent = movie.release_date.split('-')[0] || '';
        } else if (movieYear) {
            movieYear.textContent = 'Год неизвестен';
        }
        
        // Проверяем наличие рейтинга
        if (movieRating) {
            movieRating.textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        }
        
        // Проверяем наличие описания
        if (movieOverview) {
            movieOverview.textContent = movie.overview || 'Описание недоступно';
        }
        
        // Устанавливаем постер, если он доступен
        if (moviePoster) {
            if (movie.poster_path) {
                moviePoster.src = ${BASE_IMAGE_URL}${movie.poster_path};
            } else {
                moviePoster.src = 'https://via.placeholder.com/300x450?text=Постер+не+найден';
            }
        }
        
        // Показываем карточку с анимацией
        if (movieCard) {
            movieCard.style.display = 'flex';
            setTimeout(() => {
                movieCard.classList.add('visible');
            }, 100);
        }
    }

    // Обработчик нажатия на кнопку
    if (rollButton) {
        rollButton.addEventListener('click', async () => {
            console.log("Кнопка 'Let's Roll!' нажата");
            
            // Скрываем предыдущие ошибки
            if (errorMessage) errorMessage.style.display = 'none';
            
            // Скрываем карточку фильма и показываем загрузку
            if (movieCard) {
                movieCard.classList.remove('visible');
                setTimeout(() => {
                    if (movieCard) movieCard.style.display = 'none';
                    if (loadingElement) loadingElement.style.display = 'flex';
setTimeout(async () => {
                        try {
                            const randomMovie = getRandomMovie();
                            
                            if (!randomMovie) {
                                throw new Error("Не удалось выбрать фильм");
                            }
                            
                            // Добавляем в список показанных фильмов
                            shownMovies.push(randomMovie);
                            console.log("Обновлен список показанных фильмов:", shownMovies);
                            
                            const movieDetails = await fetchMovieDetails(randomMovie.id);
                            
                            // Скрываем загрузку и показываем фильм
                            if (loadingElement) loadingElement.style.display = 'none';
                            displayMovie(movieDetails);
                        } catch (error) {
                            console.error("Ошибка:", error);
                            if (loadingElement) loadingElement.style.display = 'none';
                            if (errorMessage) {
                                errorMessage.textContent = 'Произошла ошибка при загрузке фильма. Пожалуйста, попробуйте снова.';
                                errorMessage.style.display = 'block';
                            }
                        }
                    }, 1000); // Задержка для отображения анимации загрузки
                }, 300);
            }
        });
    } else {
        console.error("Кнопка 'Let's Roll!' не найдена");
    }

    // Обработка ошибок загрузки постера
    if (moviePoster) {
        moviePoster.addEventListener('error', () => {
            console.warn("Ошибка загрузки постера, использую placeholder");
            moviePoster.src = 'https://via.placeholder.com/300x450?text=Постер+не+найден';
        });
    }

    // Инициализационное сообщение
    console.log("Приложение фильмов IMDb Top 250 успешно инициализировано");
});
