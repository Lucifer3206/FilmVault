const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());    

const db = new Database("filmvault.db");
db.prepare(`
    CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        genre TEXT NOT NULL,
        rating REAL NOT NULL
    )
`).run();
const PORT = process.env.PORT || 3000;


// Movie data

// Home route

app.get("/", function(req, res) {
    res.send("VOID Backend is running! 🎬");
});


// Movies API

app.get("/api/movies", function(req, res) {

    const movies = db.prepare("SELECT * FROM movies").all();

    res.json(movies);

});
app.post("/api/movies", function(req, res) {

    const name = req.body.name;
    const genre = req.body.genre;
    const rating = Number(req.body.rating);

    const result = db.prepare(`
        INSERT INTO movies (name, genre, rating)
        VALUES (?, ?, ?)
    `).run(name, genre, rating);

    const newMovie = db.prepare(`
        SELECT * FROM movies WHERE id = ?
    `).get(result.lastInsertRowid);

    res.json(newMovie);

});
app.delete("/api/movies/:id", function(req, res) {

    const movieId = Number(req.params.id);

    const result = db.prepare(`
        DELETE FROM movies
        WHERE id = ?
    `).run(movieId);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Movie not found"
        });
    }

    res.json({
        message: "Movie deleted successfully"
    });

});
app.put("/api/movies/:id", function(req, res) {

    const movieId = Number(req.params.id);

    const name = req.body.name;
    const genre = req.body.genre;
    const rating = Number(req.body.rating);

    const result = db.prepare(`
        UPDATE movies
        SET name = ?, genre = ?, rating = ?
        WHERE id = ?
    `).run(name, genre, rating, movieId);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Movie not found"
        });
    }

    const updatedMovie = db.prepare(`
        SELECT * FROM movies
        WHERE id = ?
    `).get(movieId);

    res.json(updatedMovie);

});


app.listen(PORT, function() {
    console.log(`Server running at http://localhost:${PORT}`);
});