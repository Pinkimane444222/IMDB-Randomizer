// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Set theme colors
document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
document.body.style.color = tg.themeParams.text_color || '#222222';

// TMDB API settings
const TMDB_API_KEY = '19739a5cb7feec7a597b8a968235dc9b'; // Replace with your API key
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM elements
const movieCard = document.getElementById('movieCard');
const moviePoster = document.getElementById('moviePoster');
const movieTitle = document.getElementById('movieTitle');
const movieYear = document.getElementById('movieYear');
const movieRating = document.getElementById('movieRating');
const movieOverview = document.getElementById('movieOverview');
const rollButton = document.getElementById('rollButton');
const loadingElement = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');

// IMDb Top 250 (abbreviated list for this example)
// Actual implementation should include all 250 or fetch from external source
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
    {id: 539, title: "Psycho"},
    {id: 240, title: "The Godfather: Part II"},
    {id: 129, title: "Spirited Away"},
    {id: 619, title: "The Usual Suspects"},
    {id: 807, title: "Se7en"},
    {id: 857, title: "Saving Private Ryan"},
    {id: 4935, title: "Howl's Moving Castle"},
    {id: 429, title: "The Lord of the Rings: The Return of the King"},
    {id: 120, title: "The Lord of the Rings: The Fellowship of the Ring"}
];

// Keep track of movies that have been shown in this session
let shownMovies = [];

// Hide loading initially
loadingElement.style.display = 'none';
movieCard.style.display = 'none';

/**
 * Get a random movie that hasn't been shown in this session
 * @returns {Object} Random movie object
 */
function getRandomMovie() {
    if (shownMovies.length >= imdbTop250.length) {
        // Reset if all movies have been shown
        shownMovies = [];
    }

    // Filter out movies that have already been shown
    const availableMovies = imdbTop250.filter(movie => 
        !shownMovies.some(shownMovie => shownMovie.id === movie.id)
    );

    const randomIndex = Math.floor(Math.random() * availableMovies.length);
    return availableMovies[randomIndex];
}

/**
 * Fetch movie details from TMDB API
 * @param {number} movieId - The TMDB movie ID
 * @returns {Promise<Object>} - Movie details
 */
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ru`);
        if (!response.ok) {
            throw new Error('Failed to fetch movie details');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

/**
 * Display movie details in the UI
 * @param {Object} movie - Movie object with details
 */
function displayMovie(movie) {
    movieTitle.textContent = movie.title;
    movieYear.textContent = movie.release_date.split('-')[0];
    movieRating.textContent = movie.vote_average.toFixed(1);
movieOverview.textContent = movie.overview;
    moviePoster.src = ${BASE_IMAGE_URL}${movie.poster_path};
    
    movieCard.style.display = 'flex';
    setTimeout(() => {
        movieCard.classList.add('visible');
    }, 100);
}

// Event listener for roll button
rollButton.addEventListener('click', async () => {
    // Hide any previous errors
    errorMessage.style.display = 'none';
    
    // Hide movie card and show loading
    movieCard.classList.remove('visible');
    setTimeout(() => {
        movieCard.style.display = 'none';
        loadingElement.style.display = 'flex';
        
        setTimeout(async () => {
            try {
                const randomMovie = getRandomMovie();
                
                // Add to shown movies list
                shownMovies.push(randomMovie);
                
                const movieDetails = await fetchMovieDetails(randomMovie.id);
                
                // Hide loading and display movie
                loadingElement.style.display = 'none';
                displayMovie(movieDetails);
            } catch (error) {
                console.error('Error fetching movie:', error);
                loadingElement.style.display = 'none';
                errorMessage.textContent = 'Произошла ошибка при загрузке фильма. Пожалуйста, попробуйте снова.';
                errorMessage.style.display = 'block';
            }
        }, 1000); // Delay to show loading animation
    }, 300);
});

// Handle movie poster load errors
moviePoster.addEventListener('error', () => {
    moviePoster.src = 'https://via.placeholder.com/300x450?text=Постер+не+найден';
});
