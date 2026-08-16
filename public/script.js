// ==============================
// BUTTONS
// ==============================

const watchedButton = document.getElementById("watchedBtn");
const watchlistButton = document.getElementById("watchlistBtn");

if (watchedButton) {
    watchedButton.addEventListener("click", function() {
        watchedButton.innerText = "✓ Watched";
    });
}

if (watchlistButton) {
    watchlistButton.addEventListener("click", function() {
        watchlistButton.innerText = "✓ Watchlist";
    });
}


// ==============================
// SEARCH
// ==============================

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function() {

    const searchText = searchInput.value.toLowerCase();

    const movieCards = document.querySelectorAll(".movie-card");

    movieCards.forEach(function(card) {

        const movieName =
            card.querySelector("h2").innerText.toLowerCase();

        if (movieName.includes(searchText)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

});


// ==============================
// ADD MOVIE
// ==============================

const addMovieButton = document.getElementById("addMovieBtn");

addMovieButton.addEventListener("click", function() {

    const movieName =
        document.getElementById("movieName").value;

    const movieGenre =
        document.getElementById("movieGenre").value;

    const movieRating =
        document.getElementById("movieRating").value;

    if (!movieName || !movieGenre || !movieRating) {
        alert("Please fill all fields.");
        return;
    }

    fetch("/api/movies", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: movieName,
            genre: movieGenre,
            rating: movieRating
        })

    })

    .then(function(response) {
        return response.json();
    })

    .then(function(newMovie) {

        console.log("Movie added:", newMovie);

        createMovieCard(newMovie);

        document.getElementById("movieName").value = "";
        document.getElementById("movieGenre").value = "";
        document.getElementById("movieRating").value = "";

    })

    .catch(function(error) {
        console.error("Error adding movie:", error);
    });

});


// ==============================
// CREATE MOVIE CARD
// ==============================

function createMovieCard(movie) {

    const movieContainer =
        document.querySelector(".movie-container");

    const newMovie =
        document.createElement("div");

    newMovie.classList.add("movie-card");

    newMovie.innerHTML = `
        <div class="poster">
            🎬
        </div>

        <h2>${movie.name}</h2>

        <p>${movie.genre}</p>

        <p>⭐ ${movie.rating} / 5</p>

        <button class="watchlist-button">
            Watchlist
        </button>

        <button class="edit-button">
            Edit
        </button>

        <button class="delete-button">
            Delete
        </button>
    `;

    movieContainer.appendChild(newMovie);


    // ==============================
    // DELETE
    // ==============================

    const deleteButton =
        newMovie.querySelector(".delete-button");

    deleteButton.addEventListener("click", function() {

        fetch(`/api/movies/${movie.id}`, {
            method: "DELETE"
        })

        .then(function(response) {
            return response.json();
        })

        .then(function(result) {

            console.log(result);

            newMovie.remove();

        })

        .catch(function(error) {
            console.error("Error deleting movie:", error);
        });

    });


    // ==============================
    // EDIT
    // ==============================

    const editButton =
        newMovie.querySelector(".edit-button");

    editButton.addEventListener("click", function() {

        const newName = prompt(
            "Enter new movie name:",
            movie.name
        );

        const newGenre = prompt(
            "Enter new genre:",
            movie.genre
        );

        const newRating = prompt(
            "Enter new rating:",
            movie.rating
        );

        if (!newName || !newGenre || !newRating) {
            return;
        }

        fetch(`/api/movies/${movie.id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: newName,
                genre: newGenre,
                rating: newRating
            })

        })

        .then(function(response) {
            return response.json();
        })

        .then(function(updatedMovie) {

            console.log(
                "Movie updated:",
                updatedMovie
            );

            movie.name = updatedMovie.name;
            movie.genre = updatedMovie.genre;
            movie.rating = updatedMovie.rating;

            newMovie.querySelector("h2").innerText =
                updatedMovie.name;

            newMovie.querySelectorAll("p")[0].innerText =
                updatedMovie.genre;

            newMovie.querySelectorAll("p")[1].innerText =
                `⭐ ${updatedMovie.rating} / 5`;

        })

        .catch(function(error) {
            console.error(
                "Error updating movie:",
                error
            );
        });

    });

}


// ==============================
// LOAD MOVIES
// ==============================

fetch("/api/movies")

    .then(function(response) {
        return response.json();
    })

    .then(function(moviesFromServer) {

        const movieContainer =
            document.querySelector(".movie-container");

        movieContainer.innerHTML = "";

        moviesFromServer.forEach(function(movie) {

            createMovieCard(movie);

        });

    })

    .catch(function(error) {

        console.error(
            "Error loading movies:",
            error
        );

    });