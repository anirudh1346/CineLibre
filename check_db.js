const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./PD-Golden-list.db");

// Get table names
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error("Error fetching tables:", err.message);
        return;
    }
    console.log("Tables:", tables);
});

// Get sample data from the movies table
db.all("SELECT * FROM movies LIMIT 5", [], (err, rows) => {
    if (err) {
        console.error("Error fetching data:", err.message);
        return;
    }
    console.log("Sample movie data:", rows);
});

db.close();
