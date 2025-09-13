package demo.demo.repository;

import demo.demo.model.Genre;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class GenreRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // RowMapper for Genre
    private final RowMapper<Genre> genreRowMapper = (rs, rowNum) -> {
        Genre genre = new Genre();
        genre.setGenreId(UUID.fromString(rs.getString("genre_id")));
        genre.setName(rs.getString("name"));
        return genre;
    };

    /**
     * Insert a new genre
     */
    public UUID insertGenre(Genre genre) {
        String sql = "INSERT INTO dbo.genres (genre_id, name) VALUES (?, ?)";
        UUID genreId = UUID.randomUUID();
        
        int rowsAffected = jdbcTemplate.update(sql, genreId.toString(), genre.getName());
        if (rowsAffected == 0) {
            throw new RuntimeException("Không thể tạo thể loại mới");
        }
        
        return genreId;
    }

    /**
     * Find genre by ID
     */
    public Optional<Genre> findGenreById(UUID genreId) {
        String sql = "SELECT genre_id, name FROM dbo.genres WHERE genre_id = ?";
        List<Genre> genres = jdbcTemplate.query(sql, genreRowMapper, genreId.toString());
        return genres.isEmpty() ? Optional.empty() : Optional.of(genres.get(0));
    }

    /**
     * Find genre by name
     */
    public Optional<Genre> findGenreByName(String name) {
        String sql = "SELECT genre_id, name FROM dbo.genres WHERE name = ?";
        List<Genre> genres = jdbcTemplate.query(sql, genreRowMapper, name);
        return genres.isEmpty() ? Optional.empty() : Optional.of(genres.get(0));
    }

    /**
     * Get all genres
     */
    public List<Genre> findAllGenres() {
        String sql = "SELECT genre_id, name FROM dbo.genres ORDER BY name";
        return jdbcTemplate.query(sql, genreRowMapper);
    }

    /**
     * Update genre
     */
    public boolean updateGenre(UUID genreId, String name) {
        String sql = "UPDATE dbo.genres SET name = ? WHERE genre_id = ?";
        int rowsAffected = jdbcTemplate.update(sql, name, genreId.toString());
        return rowsAffected > 0;
    }

    /**
     * Delete genre
     */
    public boolean deleteGenre(UUID genreId) {
        String sql = "DELETE FROM dbo.genres WHERE genre_id = ?";
        int rowsAffected = jdbcTemplate.update(sql, genreId.toString());
        return rowsAffected > 0;
    }

    /**
     * Check if genre exists by ID
     */
    public boolean existsById(UUID genreId) {
        String sql = "SELECT COUNT(*) FROM dbo.genres WHERE genre_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, genreId.toString());
        return count != null && count > 0;
    }

    /**
     * Check if genre exists by name (excluding a specific genre ID for updates)
     */
    public boolean existsByNameExcludingId(String name, UUID excludeGenreId) {
        String sql = "SELECT COUNT(*) FROM dbo.genres WHERE name = ? AND genre_id != ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, name, excludeGenreId.toString());
        return count != null && count > 0;
    }

    /**
     * Get genres for a specific movie
     */
    public List<Genre> findGenresByMovieId(UUID movieId) {
        String sql = """
            SELECT g.genre_id, g.name 
            FROM dbo.genres g 
            INNER JOIN dbo.movie_genres mg ON g.genre_id = mg.genre_id 
            WHERE mg.movie_id = ? 
            ORDER BY g.name
            """;
        return jdbcTemplate.query(sql, genreRowMapper, movieId.toString());
    }

    /**
     * Add genre to movie
     */
    public boolean addGenreToMovie(UUID movieId, UUID genreId) {
        String sql = "INSERT INTO dbo.movie_genres (movie_id, genre_id) VALUES (?, ?)";
        try {
            int rowsAffected = jdbcTemplate.update(sql, movieId.toString(), genreId.toString());
            return rowsAffected > 0;
        } catch (Exception e) {
            // Handle duplicate key constraint
            return false;
        }
    }

    /**
     * Remove genre from movie
     */
    public boolean removeGenreFromMovie(UUID movieId, UUID genreId) {
        String sql = "DELETE FROM dbo.movie_genres WHERE movie_id = ? AND genre_id = ?";
        int rowsAffected = jdbcTemplate.update(sql, movieId.toString(), genreId.toString());
        return rowsAffected > 0;
    }

    /**
     * Remove all genres from movie
     */
    public boolean removeAllGenresFromMovie(UUID movieId) {
        String sql = "DELETE FROM dbo.movie_genres WHERE movie_id = ?";
        int rowsAffected = jdbcTemplate.update(sql, movieId.toString());
        return rowsAffected >= 0; // Allow 0 rows affected (no genres to remove)
    }
}
