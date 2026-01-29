document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get("id");

    if (!movieId) {
        showError("No movie ID provided in the URL");
        return;
    }

    fetch(`http://localhost:3000/api/movie/${movieId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(movie => {
            if (!movie) {
                throw new Error("Movie data is empty");
            }
            updateMovieDetails(movie);
        })
        .catch(error => {
            console.error("Failed to fetch movie details:", error);
            showError("Failed to load movie details. Please try again later.");
        });
});

function updateMovieDetails(movie) {
    document.getElementById("movieRuntime").textContent = movie.runtime ? `${movie.runtime} mins` : "Unknown";
    document.getElementById("movieTitle").textContent = movie.title || "Untitled";
    document.getElementById("movieOverview").textContent = movie.overview || "No overview available.";
    document.getElementById("movieYear").textContent = movie.release_year || "Unknown";
    document.getElementById("movieGenre").textContent = movie.genres || "Unknown";
    document.getElementById("movieLanguage").textContent = movie.spoken_languages || "Unknown";
    document.getElementById("movieCompany").textContent = movie.production_companies || "Unknown";
    document.getElementById("movieTagline").textContent = movie.tagline || "Unknown";

    const posterPath = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image";

    document.getElementById("moviePoster").src = posterPath;

    const movieLink = movie.video_link || movie.homepage || "#";
    const watchButton = document.getElementById("watchButton");
    watchButton.href = movieLink;
    watchButton.style.display = movieLink === "#" ? "none" : "inline-block";
}

function showError(message) {
    const container = document.querySelector(".movie-container") || document.body;
    container.innerHTML = `
        <div class="error-message">
            ${message}
            <a href="/">Return to homepage</a>
        </div>
    `;
}