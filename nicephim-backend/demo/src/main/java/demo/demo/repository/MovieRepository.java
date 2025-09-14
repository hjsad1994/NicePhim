package demo.demo.repository;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import demo.demo.model.Movie;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public class MovieRepository {

    private final JdbcTemplate jdbcTemplate;

    public MovieRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private RowMapper<Movie> movieRowMapper = new RowMapper<Movie>() {
        @Override
        public Movie mapRow(ResultSet rs, int rowNum) throws SQLException {
            Movie movie = new Movie();
            movie.setMovieId(UUID.fromString(rs.getString("movie_id")));
            movie.setTitle(rs.getString("title"));
            movie.setAliasTitle(rs.getString("alias_title"));
            movie.setDescription(rs.getString("description"));

            Short releaseYear = rs.getObject("release_year") != null ? rs.getShort("release_year") : null;
            movie.setReleaseYear(releaseYear);

            movie.setAgeRating(rs.getString("age_rating"));

            BigDecimal imdbRating = rs.getBigDecimal("imdb_rating");
            movie.setImdbRating(imdbRating);

            movie.setSeries(rs.getBoolean("is_series"));
            movie.setPosterUrl(rs.getString("poster_url"));
            movie.setBannerUrl(rs.getString("banner_url"));
            movie.setCreatedBy(UUID.fromString(rs.getString("created_by")));
            
            // Video fields (re-enabled after V2 migration)
            movie.setVideoId(rs.getString("video_id"));
            movie.setHlsUrl(rs.getString("hls_url"));
            movie.setVideoStatus(rs.getString("video_status"));

            Object createdAtObj = rs.getObject("created_at");
            if (createdAtObj != null) {
                // Handle SQL Server datetime format
                String dateTimeStr = createdAtObj.toString();
                if (dateTimeStr.contains(" ")) {
                    // Convert SQL Server format to ISO format
                    dateTimeStr = dateTimeStr.replace(" ", "T") + "Z";
                }
                movie.setCreatedAt(OffsetDateTime.parse(dateTimeStr));
            }

            Object updatedAtObj = rs.getObject("updated_at");
            if (updatedAtObj != null) {
                // Handle SQL Server datetime format
                String dateTimeStr = updatedAtObj.toString();
                if (dateTimeStr.contains(" ")) {
                    // Convert SQL Server format to ISO format
                    dateTimeStr = dateTimeStr.replace(" ", "T") + "Z";
                }
                movie.setUpdatedAt(OffsetDateTime.parse(dateTimeStr));
            }

            return movie;
        }
    };

    private RowMapper<Movie> movieRowMapperWithCreator = new RowMapper<Movie>() {
        @Override
        public Movie mapRow(ResultSet rs, int rowNum) throws SQLException {
            Movie movie = new Movie();
            movie.setMovieId(UUID.fromString(rs.getString("movie_id")));
            movie.setTitle(rs.getString("title"));
            movie.setAliasTitle(rs.getString("alias_title"));
            movie.setDescription(rs.getString("description"));

            Short releaseYear = rs.getObject("release_year") != null ? rs.getShort("release_year") : null;
            movie.setReleaseYear(releaseYear);

            movie.setAgeRating(rs.getString("age_rating"));

            BigDecimal imdbRating = rs.getBigDecimal("imdb_rating");
            movie.setImdbRating(imdbRating);

            movie.setSeries(rs.getBoolean("is_series"));
            movie.setPosterUrl(rs.getString("poster_url"));
            movie.setBannerUrl(rs.getString("banner_url"));
            movie.setCreatedBy(UUID.fromString(rs.getString("created_by")));
            
            // Video fields (re-enabled after V2 migration)
            movie.setVideoId(rs.getString("video_id"));
            movie.setHlsUrl(rs.getString("hls_url"));
            movie.setVideoStatus(rs.getString("video_status"));

            Object createdAtObj = rs.getObject("created_at");
            if (createdAtObj != null) {
                // Handle SQL Server datetime format
                String dateTimeStr = createdAtObj.toString();
                if (dateTimeStr.contains(" ")) {
                    // Convert SQL Server format to ISO format
                    dateTimeStr = dateTimeStr.replace(" ", "T") + "Z";
                }
                movie.setCreatedAt(OffsetDateTime.parse(dateTimeStr));
            }

            Object updatedAtObj = rs.getObject("updated_at");
            if (updatedAtObj != null) {
                // Handle SQL Server datetime format
                String dateTimeStr = updatedAtObj.toString();
                if (dateTimeStr.contains(" ")) {
                    // Convert SQL Server format to ISO format
                    dateTimeStr = dateTimeStr.replace(" ", "T") + "Z";
                }
                movie.setUpdatedAt(OffsetDateTime.parse(dateTimeStr));
            }

            // Add creator name if available
            String creatorName = rs.getString("creator_name");
            if (creatorName != null) {
                // Store creator name in a custom field or use a Map for additional data
                // For now, we'll just log it
                System.out.println("Creator: " + creatorName);
            }

            return movie;
        }
    };

    public UUID insertMovie(String title, String aliasTitle, String description, Short releaseYear,
                           String ageRating, BigDecimal imdbRating, boolean isSeries,
                           String posterUrl, String bannerUrl, UUID createdBy) throws DataAccessException {
        return insertMovie(title, aliasTitle, description, releaseYear, ageRating, imdbRating, 
                          isSeries, posterUrl, bannerUrl, createdBy, null, null, null);
    }

    public UUID insertMovie(String title, String aliasTitle, String description, Short releaseYear,
                           String ageRating, BigDecimal imdbRating, boolean isSeries,
                           String posterUrl, String bannerUrl, UUID createdBy,
                           String videoId, String hlsUrl, String videoStatus) throws DataAccessException {
        UUID movieId = UUID.randomUUID();
        try {
            System.out.println("Inserting movie with video data - videoId: " + videoId + ", hlsUrl: " + hlsUrl + ", videoStatus: " + videoStatus);
            int rowsAffected = jdbcTemplate.update(
                "INSERT INTO dbo.movies (movie_id, title, alias_title, description, release_year, age_rating, imdb_rating, is_series, poster_url, banner_url, created_by, video_id, hls_url, video_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                movieId, title, aliasTitle, description, releaseYear, ageRating, imdbRating, isSeries, posterUrl, bannerUrl, createdBy, videoId, hlsUrl, videoStatus
            );
            System.out.println("Movie inserted with ID: " + movieId + ", rows affected: " + rowsAffected);
            return movieId;
        } catch (Exception e) {
            System.err.println("Error inserting movie: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Movie findMovieById(UUID movieId) {
        try {
            System.out.println("Searching for movie by ID: " + movieId);
            List<Movie> movies = jdbcTemplate.query(
                "SELECT movie_id, title, alias_title, description, release_year, age_rating, imdb_rating, is_series, poster_url, banner_url, created_by, video_id, hls_url, video_status, created_at, updated_at FROM dbo.movies WHERE movie_id = ?",
                movieRowMapper,
                movieId
            );
            
            if (movies.isEmpty()) {
                System.err.println("No movie found with ID: " + movieId);
                return null;
            }
            
            System.out.println("Found movie: " + movies.get(0).getTitle());
            return movies.get(0);
        } catch (Exception e) {
            System.err.println("Error finding movie by ID " + movieId + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public Movie findMovieByIdWithCreator(UUID movieId) {
        try {
            System.out.println("Searching for movie with ID: " + movieId);
            List<Movie> movies = jdbcTemplate.query(
                "SELECT movie_id, title, alias_title, description, release_year, age_rating, imdb_rating, is_series, poster_url, banner_url, created_by, video_id, hls_url, video_status, created_at, updated_at FROM dbo.movies WHERE movie_id = ?",
                movieRowMapper,
                movieId
            );
            
            if (movies.isEmpty()) {
                System.err.println("No movie found with ID: " + movieId);
                return null;
            }
            
            System.out.println("Found movie: " + movies.get(0).getTitle());
            return movies.get(0);
        } catch (Exception e) {
            System.err.println("Error finding movie by ID with creator " + movieId + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public List<Movie> findAllMovies(int limit, int offset) {
        return jdbcTemplate.query(
            "SELECT movie_id, title, alias_title, description, release_year, age_rating, imdb_rating, is_series, poster_url, banner_url, created_by, video_id, hls_url, video_status, created_at, updated_at FROM dbo.movies ORDER BY created_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
            movieRowMapper,
            offset, limit
        );
    }

    public List<Movie> findMoviesByTitle(String title) {
        return jdbcTemplate.query(
            "SELECT movie_id, title, alias_title, description, release_year, age_rating, imdb_rating, is_series, poster_url, banner_url, created_by, video_id, hls_url, video_status, created_at, updated_at FROM dbo.movies WHERE title LIKE ? OR alias_title LIKE ?",
            movieRowMapper,
            "%" + title + "%", "%" + title + "%"
        );
    }

    public int updateMovie(UUID movieId, String title, String aliasTitle, String description, Short releaseYear,
                          String ageRating, BigDecimal imdbRating, boolean isSeries,
                          String posterUrl, String bannerUrl) throws DataAccessException {
        return jdbcTemplate.update(
            "UPDATE dbo.movies SET title = ?, alias_title = ?, description = ?, release_year = ?, age_rating = ?, imdb_rating = ?, is_series = ?, poster_url = ?, banner_url = ?, updated_at = SYSUTCDATETIME() WHERE movie_id = ?",
            title, aliasTitle, description, releaseYear, ageRating, imdbRating, isSeries, posterUrl, bannerUrl, movieId
        );
    }

    public int deleteMovie(UUID movieId) throws DataAccessException {
        return jdbcTemplate.update("DELETE FROM dbo.movies WHERE movie_id = ?", movieId);
    }

    public long countMovies() {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.movies", Long.class);
    }
}