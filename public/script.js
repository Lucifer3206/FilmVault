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


let searchTimeout;

searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.trim();

    clearTimeout(searchTimeout);

    if (!searchText) {
        return;
    }

    searchTimeout = setTimeout(function () {

        fetch(
            `/api/tmdb/search?query=${encodeURIComponent(searchText)}`
        )
            .then(function (response) {

                if (!response.ok) {
                    throw new Error("TMDB search failed");
                }

                return response.json();

            })
            .then(function (data) {

                console.log("TMDB results:", data.results);

                displayTMDBMovies(data.results);

            })
            .catch(function (error) {

                console.error(
                    "TMDB search error:",
                    error
                );

            });

    }, 400);

});
// ==============================
// DISPLAY TMDB MOVIES
// ==============================

function displayTMDBMovies(movies) {

    const movieContainer =
        document.querySelector(".movie-container");

    if (!movieContainer) {
        return;
    }

    movieContainer.innerHTML = "";

    if (!movies || movies.length === 0) {

        movieContainer.innerHTML = `
            <div class="empty-state">
                <h3>No movies found</h3>
                <p>Try searching for another movie.</p>
            </div>
        `;

        return;
    }


    movies.forEach(function(movie) {

        const movieCard =
            document.createElement("article");

        movieCard.classList.add("movie-card");


        // ==========================================
        // POSTER
        // ==========================================

        const posterURL =
            movie.poster_path

                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`

                : "https://via.placeholder.com/500x750?text=No+Poster";


        // ==========================================
        // YEAR
        // ==========================================

        const year =
            movie.release_date

                ? movie.release_date.substring(0, 4)

                : "N/A";


        // ==========================================
        // RATING
        // ==========================================

        const rating =
            movie.vote_average

                ? movie.vote_average.toFixed(1)

                : "N/A";


        // ==========================================
        // CARD
        // ==========================================

        movieCard.innerHTML = `

            <div class="tmdb-poster-wrapper">

                <img
                    class="poster"
                    src="${posterURL}"
                    alt="${escapeHTML(movie.title)}"
                    loading="lazy"
                >

                <div class="poster-overlay">

                    <button
                        class="tmdb-watchlist-btn">

                        + Watchlist

                    </button>

                </div>

            </div>


            <div class="movie-info">

                <h3>
                    ${escapeHTML(movie.title)}
                </h3>

                <div class="movie-meta">

                    <span>
                        ${year}
                    </span>

                    <span>
                        ⭐ ${rating}
                    </span>

                </div>

                <p class="movie-overview">

                    ${escapeHTML(
                        movie.overview ||
                        "No description available."
                    )}

                </p>

            </div>

        `;


        movieContainer.appendChild(movieCard);


        // ==========================================
        // WATCHLIST
        // ==========================================

        const watchlistButton =
            movieCard.querySelector(
                ".tmdb-watchlist-btn"
            );


        watchlistButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                const watchlistMovie = {

                    id: movie.id,

                    name: movie.title,

                    genre: "TMDB Movie",

                    rating:
                        movie.vote_average
                            ? (
                                movie.vote_average / 2
                            ).toFixed(1)
                            : "0",

                    poster_path:
                        movie.poster_path,

                    release_date:
                        movie.release_date,

                    overview:
                        movie.overview

                };


                toggleWatchlist(

                    watchlistMovie,

                    movieCard,

                    watchlistButton

                );

            }
        );


        // ==========================================
        // CARD CLICK
        // ==========================================

        movieCard.addEventListener(
            "click",
            function() {

                console.log(
                    "Selected movie:",
                    movie
                );

                // We'll build the movie details
                // modal in the next step.

            }
        );

    });

}

function showMovieDetails(movie) {

    const posterURL = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Poster";

    const year = movie.release_date
        ? movie.release_date.substring(0, 4)
        : "N/A";

    const rating = movie.vote_average
        ? movie.vote_average.toFixed(1)
        : "N/A";

    const modal =
        document.createElement("div");

    modal.classList.add("movie-modal");

    modal.innerHTML = `

        <div class="modal-overlay"></div>

        <div class="modal-content">

            <button class="modal-close">
                ×
            </button>

            <img
                src="${posterURL}"
                alt="${escapeHTML(movie.title)}"
                class="modal-poster"
            >

            <div class="modal-info">

                <h2>
                    ${escapeHTML(movie.title)}
                </h2>

                <p class="modal-year">
                    ${year}
                </p>

                <p class="modal-rating">
                    ⭐ ${rating} / 10
                </p>

                <p class="modal-overview">
                    ${escapeHTML(
                        movie.overview ||
                        "No overview available."
                    )}
                </p>

                <button class="modal-watchlist">
                    + Add to Watchlist
                </button>

            </div>

        </div>

    `;

    document.body.appendChild(modal);


    // Close button

    modal
        .querySelector(".modal-close")
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );


    // Click outside modal

    modal
        .querySelector(".modal-overlay")
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );


    // Watchlist

    modal
        .querySelector(".modal-watchlist")
        .addEventListener(
            "click",
            function () {

                addTMDBToWatchlist(
                    movie,
                    this
                );

            }
        );

}
function addTMDBToWatchlist(
    movie,
    button
) {

    const alreadyExists =
        watchlist.some(function (item) {

            return item.id === movie.id;

        });

    if (alreadyExists) {

        button.innerText =
            "✓ In Watchlist";

        return;
    }


    const watchlistMovie = {

        id: movie.id,

        title: movie.title,

        name: movie.title,

        poster_path: movie.poster_path,

        release_date: movie.release_date,

        vote_average: movie.vote_average,

        overview: movie.overview

    };


    watchlist.push(watchlistMovie);


    localStorage.setItem(
        "voidWatchlist",
        JSON.stringify(watchlist)
    );


    button.innerText =
        "✓ In Watchlist";


    renderWatchlist();

}
        // =============================================
        // VIEW DETAILS
        // =============================================

        const detailsButton =
            movieCard.querySelector(".details-button");

        detailsButton.addEventListener(
            "click",
            function () {

                showMovieDetails(movie);

            }
        );


        // =============================================
        // WATCHLIST
        // =============================================

        const watchlistButton =
            movieCard.querySelector(".watchlist-button");

        watchlistButton.addEventListener(
            "click",
            function () {

                addTMDBToWatchlist(
                    movie,
                    watchlistButton
                );

            }
        );

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

    if (
        watchlistContainer.querySelector(
            `[data-movie-id="${movie.id}"]`
        )
    ) {
        return;
    }

    const card = document.createElement("article");

    card.classList.add("movie-card");

    card.dataset.movieId = movie.id;

    const title =
        movie.title || movie.name || "Unknown Movie";

    const posterURL = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Poster";

    const year = movie.release_date
        ? movie.release_date.substring(0, 4)
        : "N/A";

    const rating = movie.rating
        ? Number(movie.rating).toFixed(1)
        : movie.vote_average
            ? Number(movie.vote_average).toFixed(1)
            : "N/A";

    card.innerHTML = `

        <img
            class="poster"
            src="${posterURL}"
            alt="${escapeHTML(title)}"
        >

        <div class="movie-info">

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p class="movie-year">
                ${year}
            </p>

            <span class="movie-rating">
                ⭐ ${rating} / 10
            </span>

            <div class="movie-actions">

                <button class="remove-watchlist-button">
                    Remove
                </button>

            </div>

        </div>

    `;

    watchlistContainer.appendChild(card);


    // =============================================
    // REMOVE FROM WATCHLIST
    // =============================================

    const removeButton =
        card.querySelector(
            ".remove-watchlist-button"
        );

    removeButton.addEventListener(
        "click",
        function () {

            watchlist =
                watchlist.filter(function (item) {

                    return item.id !== movie.id;

                });

            localStorage.setItem(
                "voidWatchlist",
                JSON.stringify(watchlist)
            );

            card.remove();

            // Update buttons in search results

            document
                .querySelectorAll(
                    `.watchlist-button[data-movie-id="${movie.id}"]`
                )
                .forEach(function (button) {

                    button.innerText =
                        "+ Watchlist";

                });

        }
    );

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


const heroExploreBtn =
    document.getElementById("heroExploreBtn");

if (heroExploreBtn) {

    heroExploreBtn.addEventListener(
        "click",
        function() {

            document
                .getElementById("movies")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


const heroWatchlistBtn =
    document.getElementById("heroWatchlistBtn");

if (heroWatchlistBtn) {

    heroWatchlistBtn.addEventListener(
        "click",
        function() {

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

// =====================================================
// NAVIGATION
// =====================================================

const navLinks =
    document.querySelectorAll(".nav-links a");


navLinks.forEach(function (link) {

    link.addEventListener("click", function (event) {

        const targetId =
            link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const target =
            document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});

// =====================================================
// ACTIVE NAVIGATION
// =====================================================

const sections =
    document.querySelectorAll(
        "#home, #movies, #watchlist"
    );


window.addEventListener(
    "scroll",
    function () {

        let currentSection = "";

        sections.forEach(function (section) {

            const sectionTop =
                section.offsetTop - 150;

            if (
                window.scrollY >= sectionTop
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(function (link) {

            link.classList.remove("active");

            if (
                link.getAttribute("href") ===
                `#${currentSection}`
            ) {

                link.classList.add("active");

            }

        });

    }
);
// =====================================================
// VOID — TMDB FEATURED HERO
// =====================================================

function loadFeaturedMovie() {

    fetch("/api/tmdb/trending")

        .then(function(response) {

            if (!response.ok) {
                throw new Error(
                    "Failed to load trending movies"
                );
            }

            return response.json();

        })

        .then(function(data) {

            if (
                !data.results ||
                data.results.length === 0
            ) {
                return;
            }

            // Pick a random movie
            const movies = data.results;

            const movie =
                movies[
                    Math.floor(
                        Math.random() *
                        movies.length
                    )
                ];


            // ==========================================
            // TITLE
            // ==========================================

            const heroTitle =
                document.getElementById("heroTitle");

            if (heroTitle) {

                heroTitle.innerHTML = `
                    ${escapeHTML(movie.title)}
                `;

            }


            // ==========================================
            // RATING
            // ==========================================

            const heroRating =
                document.getElementById("heroRating");

            if (heroRating) {

                heroRating.innerText =
                    `⭐ ${movie.vote_average.toFixed(1)} / 10`;

            }


            // ==========================================
            // YEAR
            // ==========================================

            const heroYear =
                document.getElementById("heroYear");

            if (heroYear) {

                const year =
                    movie.release_date
                        ? movie.release_date.substring(0, 4)
                        : "N/A";

                heroYear.innerText = year;

            }


            // ==========================================
            // DESCRIPTION
            // ==========================================

            const heroDescription =
                document.getElementById(
                    "heroDescription"
                );

            if (heroDescription) {

                heroDescription.innerText =
                    movie.overview ||
                    "Discover your next story.";

            }


            // ==========================================
            // BACKDROP
            // ==========================================

            const heroBackground =
                document.getElementById(
                    "heroBackground"
                );

            if (
                heroBackground &&
                movie.backdrop_path
            ) {

                heroBackground.style.backgroundImage =
                    `url(
                        https://image.tmdb.org/t/p/original${movie.backdrop_path}
                    )`;

            }

        })

        .catch(function(error) {

            console.error(
                "Featured movie error:",
                error
            );

        });

}


// Load featured movie

loadFeaturedMovie();