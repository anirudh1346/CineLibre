const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

const publicDir = path.join(__dirname);
app.use(express.static(publicDir));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/movie", (req, res) => {
    res.sendFile(path.join(publicDir, "movie.html"));
});

const db = new sqlite3.Database("./PD-Golden-list.db", (err) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Connected to the SQLite database");
    }
});

app.get("/movies", (req, res) => {
    const { year, genre, lang, runtimeMin, runtimeMax } = req.query;

    let query = `
        SELECT 
            id, 
            title, 
            release_year, 
            poster_path, 
            overview, 
            genres, 
            spoken_languages, 
            production_companies, 
            tagline, 
            homepage, 
            runtime,
            video_link
        FROM movies
        WHERE 1 = 1
    `;

    const params = [];

    if (year) {
        query += " AND release_year = ?";
        params.push(year);
    }
    if (genre) {
        query += " AND genres LIKE ?";
        params.push(`%${genre}%`);
    }
    if (lang) {
        query += " AND spoken_languages LIKE ?";
        params.push(`%${lang}%`);
    }
    if (!isNaN(parseInt(runtimeMin))) {
        query += " AND runtime >= ?";
        params.push(parseInt(runtimeMin));
    }
    if (!isNaN(parseInt(runtimeMax))) {
        query += " AND runtime <= ?";
        params.push(parseInt(runtimeMax));
    }

    query += " ORDER BY poster_path IS NULL, title";

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get("/api/movie/:id", (req, res) => {
    const movieId = req.params.id;
    db.get("SELECT * FROM movies WHERE id = ?", [movieId], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error retrieving movie.");
        } else if (!row) {
            res.status(404).send("Movie not found.");
        } else {
            res.json(row);
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});