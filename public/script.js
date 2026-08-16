// =====================================================
// VOID — MOVIE APP
// =====================================================


// =====================================================
// DOM ELEMENTS
// =====================================================

const searchInput = document.getElementById("searchInput");
const addMovieButton = document.getElementById("addMovieBtn");

const movieNameInput = document.getElementById("movieName");
const movieGenreInput = document.getElementById("movieGenre");
const movieRatingInput = document.getElementById("movieRating");

const movieContainer = document.getElementById("movieContainer");
const watchlistContainer = document.getElementById("watchlistContainer");


// =====================================================
// WATCHLIST
// =====================================================

let watchlist = JSON.parse(
    localStorage.getItem("voidWatchlist")
) || [];


// =====================================================
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchText =
            searchInput.value.toLowerCase().trim();

        const movieCards =
            document.querySelectorAll("#movieContainer .movie-card");

        movieCards.forEach(function (card) {

            const movieName =
                card.querySelector("h3")?.innerText.toLowerCase() || "";

            const movieGenre =
                card.querySelector(".movie-genre")?.innerText.toLowerCase() || "";

            if (
                movieName.includes(searchText) ||
                movieGenre.includes(searchText)
            ) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    });

}


// =====================================================
// ADD MOVIE
// =====================================================

if (addMovieButton) {

    addMovieButton.addEventListener("click", function () {

        const movieName =
            movieNameInput.value.trim();

        const movieGenre =
            movieGenreInput.value.trim();

        const movieRating =
            movieRatingInput.value.trim();


        if (!movieName || !movieGenre || !movieRating) {

            alert("Please fill all fields.");

            return;
        }


        if (movieRating < 0 || movieRating > 5) {

            alert("Rating must be between 0 and 5.");

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

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Failed to add movie.");
            }

            return response.json();

        })

        .then(function (newMovie) {

            console.log("Movie added:", newMovie);

            createMovieCard(newMovie);


            // Clear inputs

            movieNameInput.value = "";
            movieGenreInput.value = "";
            movieRatingInput.value = "";


            // Scroll to library

            movieContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        })

        .catch(function (error) {

            console.error(
                "Error adding movie:",
                error
            );

            alert("Something went wrong while adding the movie.");

        });

    });

}


// =====================================================
// CREATE MOVIE CARD
// =====================================================

function createMovieCard(movie) {

    const newMovie =
        document.createElement("article");

    newMovie.classList.add("movie-card");


    newMovie.innerHTML = `

        <div class="movie-poster-placeholder">

            <span>🎬</span>

        </div>

        <div class="movie-info">

            <h3>
                ${escapeHTML(movie.name)}
            </h3>

            <p class="movie-genre">
                ${escapeHTML(movie.genre)}
            </p>

            <span class="movie-rating">
                ⭐ ${movie.rating} / 5
            </span>

            <div class="movie-actions">

                <button class="watchlist-button">
                    + Watchlist
                </button>

                <button class="edit-button">
                    Edit
                </button>

                <button class="delete-button">
                    Delete
                </button>

            </div>

        </div>

    `;


    movieContainer.appendChild(newMovie);


    // =================================================
    // WATCHLIST BUTTON
    // =================================================

    const watchlistButton =
        newMovie.querySelector(".watchlist-button");


    updateWatchlistButton(
        watchlistButton,
        movie.id
    );


    watchlistButton.addEventListener(
        "click",
        function () {

            toggleWatchlist(
                movie,
                newMovie,
                watchlistButton
            );

        }
    );


    // =================================================
    // DELETE BUTTON
    // =================================================

    const deleteButton =
        newMovie.querySelector(".delete-button");


    deleteButton.addEventListener(
        "click",
        function () {

            deleteMovie(
                movie,
                newMovie
            );

        }
    );


    // =================================================
    // EDIT BUTTON
    // =================================================

    const editButton =
        newMovie.querySelector(".edit-button");


    editButton.addEventListener(
        "click",
        function () {

            editMovie(
                movie,
                newMovie
            );

        }
    );

}


// =====================================================
// WATCHLIST TOGGLE
// =====================================================

function toggleWatchlist(
    movie,
    card,
    button
) {

    const alreadyExists =
        watchlist.some(function (item) {

            return item.id === movie.id;

        });


    if (alreadyExists) {

        watchlist =
            watchlist.filter(function (item) {

                return item.id !== movie.id;

            });

        button.innerText = "+ Watchlist";

        removeFromWatchlistUI(movie.id);

    }

    else {

        watchlist.push(movie);

        button.innerText = "✓ Watchlist";

        addToWatchlistUI(movie);

    }


    localStorage.setItem(
        "voidWatchlist",
        JSON.stringify(watchlist)
    );

}


// =====================================================
// WATCHLIST BUTTON STATE
// =====================================================

function updateWatchlistButton(
    button,
    movieId
) {

    const exists =
        watchlist.some(function (movie) {

            return movie.id === movieId;

        });


    if (exists) {

        button.innerText =
            "✓ Watchlist";

    }

}


// =====================================================
// ADD TO WATCHLIST UI
// =====================================================

function addToWatchlistUI(movie) {

    if (!watchlistContainer) {
        return;
    }


    // Prevent duplicates

    if (
        watchlistContainer.querySelector(
            `[data-movie-id="${movie.id}"]`
        )
    ) {
        return;
    }


    const card =
        document.createElement("article");

    card.classList.add("movie-card");

    card.dataset.movieId =
        movie.id;


    card.innerHTML = `

        <div class="movie-poster-placeholder">

            <span>🎬</span>

        </div>

        <div class="movie-info">

            <h3>
                ${escapeHTML(movie.name)}
            </h3>

            <p class="movie-genre">
                ${escapeHTML(movie.genre)}
            </p>

            <span class="movie-rating">
                ⭐ ${movie.rating} / 5
            </span>

        </div>

    `;


    watchlistContainer.appendChild(card);

}


// =====================================================
// REMOVE FROM WATCHLIST UI
// =====================================================

function removeFromWatchlistUI(movieId) {

    if (!watchlistContainer) {
        return;
    }


    const card =
        watchlistContainer.querySelector(
            `[data-movie-id="${movieId}"]`
        );


    if (card) {
        card.remove();
    }

}


// =====================================================
// DELETE MOVIE
// =====================================================

function deleteMovie(
    movie,
    card
) {

    const confirmed =
        confirm(
            `Delete "${movie.name}" from VOID?`
        );


    if (!confirmed) {
        return;
    }


    fetch(`/api/movies/${movie.id}`, {

        method: "DELETE"

    })

    .then(function (response) {

        if (!response.ok) {
            throw new Error("Failed to delete movie.");
        }

        return response.json();

    })

    .then(function (result) {

        console.log(
            "Movie deleted:",
            result
        );


        // Remove from main library

        card.remove();


        // Remove from watchlist

        watchlist =
            watchlist.filter(function (item) {

                return item.id !== movie.id;

            });


        localStorage.setItem(
            "voidWatchlist",
            JSON.stringify(watchlist)
        );


        removeFromWatchlistUI(movie.id);

    })

    .catch(function (error) {

        console.error(
            "Error deleting movie:",
            error
        );

        alert(
            "Something went wrong while deleting the movie."
        );

    });

}


// =====================================================
// EDIT MOVIE
// =====================================================

function editMovie(
    movie,
    card
) {

    const newName =
        prompt(
            "Enter new movie name:",
            movie.name
        );


    if (!newName) {
        return;
    }


    const newGenre =
        prompt(
            "Enter new genre:",
            movie.genre
        );


    if (!newGenre) {
        return;
    }


    const newRating =
        prompt(
            "Enter new rating (0 - 5):",
            movie.rating
        );


    if (!newRating) {
        return;
    }


    if (
        Number(newRating) < 0 ||
        Number(newRating) > 5
    ) {

        alert(
            "Rating must be between 0 and 5."
        );

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

    .then(function (response) {

        if (!response.ok) {
            throw new Error("Failed to update movie.");
        }

        return response.json();

    })

    .then(function (updatedMovie) {

        console.log(
            "Movie updated:",
            updatedMovie
        );


        movie.name =
            updatedMovie.name;

        movie.genre =
            updatedMovie.genre;

        movie.rating =
            updatedMovie.rating;


        // Update card

        card.querySelector("h3").innerText =
            updatedMovie.name;

        card.querySelector(".movie-genre").innerText =
            updatedMovie.genre;

        card.querySelector(".movie-rating").innerText =
            `⭐ ${updatedMovie.rating} / 5`;


        // Update watchlist copy

        const watchlistMovie =
            watchlist.find(function (item) {

                return item.id === movie.id;

            });


        if (watchlistMovie) {

            watchlistMovie.name =
                updatedMovie.name;

            watchlistMovie.genre =
                updatedMovie.genre;

            watchlistMovie.rating =
                updatedMovie.rating;


            localStorage.setItem(
                "voidWatchlist",
                JSON.stringify(watchlist)
            );

            renderWatchlist();

        }

    })

    .catch(function (error) {

        console.error(
            "Error updating movie:",
            error
        );

        alert(
            "Something went wrong while updating the movie."
        );

    });

}


// =====================================================
// LOAD MOVIES
// =====================================================

function loadMovies() {

    fetch("/api/movies")

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Failed to load movies.");
            }

            return response.json();

        })

        .then(function (moviesFromServer) {

            movieContainer.innerHTML = "";


            moviesFromServer.forEach(function (movie) {

                createMovieCard(movie);

            });


            renderWatchlist();

        })

        .catch(function (error) {

            console.error(
                "Error loading movies:",
                error
            );

        });

}


// =====================================================
// RENDER WATCHLIST
// =====================================================

function renderWatchlist() {

    if (!watchlistContainer) {
        return;
    }


    watchlistContainer.innerHTML = "";


    watchlist.forEach(function (movie) {

        addToWatchlistUI(movie);

    });

}


// =====================================================
// HERO BUTTONS
// =====================================================

const watchNowButton =
    document.querySelector(".primary-btn");


if (watchNowButton) {

    watchNowButton.addEventListener(
        "click",
        function () {

            document
                .getElementById("movies")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


const heroWatchlistButton =
    document.querySelector(".secondary-btn");


if (heroWatchlistButton) {

    heroWatchlistButton.addEventListener(
        "click",
        function () {

            document
                .getElementById("watchlist")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


// =====================================================
// SEARCH BUTTON
// =====================================================

const searchButton =
    document.querySelector(".search-container button");


if (searchButton) {

    searchButton.addEventListener("click", function () {

        const searchText =
            searchInput.value.toLowerCase().trim();

        const movieCards =
            document.querySelectorAll(
                "#movieContainer .movie-card"
            );


        movieCards.forEach(function (card) {

            const movieName =
                card.querySelector("h3")?.innerText.toLowerCase() || "";

            const movieGenre =
                card.querySelector(".movie-genre")?.innerText.toLowerCase() || "";


            if (
                movieName.includes(searchText) ||
                movieGenre.includes(searchText)
            ) {

                card.style.display = "";

            } else {

                card.style.display = "none";

            }

        });


        document
            .getElementById("movies")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

}
// =====================================================
// ESCAPE HTML
// Prevent HTML injection inside movie cards
// =====================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


// =====================================================
// START VOID
// =====================================================

loadMovies();
renderWatchlist();