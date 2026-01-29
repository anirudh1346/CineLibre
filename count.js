app.get("/movies/count", (req, res) => {
    db.get("SELECT COUNT(*) as count FROM movies", (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ count: row.count });
    });
});
