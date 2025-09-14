package demo.demo.services.movie;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import demo.demo.model.Movie;
import demo.demo.model.Genre;
import demo.demo.repository.MovieRepository;
import demo.demo.repository.GenreRepository;
import demo.demo.dto.movie.CreateMovieRequest;
import demo.demo.dto.movie.UpdateMovieRequest;
import demo.demo.dto.movie.MovieResponse;
import demo.demo.dto.genre.GenreResponse;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;

    public MovieService(MovieRepository movieRepository, GenreRepository genreRepository) {
        this.movieRepository = movieRepository;
        this.genreRepository = genreRepository;
    }

    public MovieResponse createMovie(CreateMovieRequest dto, UUID createdBy) {
        if (dto.title == null || dto.title.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên phim không được để trống");
        }

        try {
            System.out.println("Creating movie with title: " + dto.title + ", createdBy: " + createdBy);
            System.out.println("Video data - videoId: " + dto.videoId + ", hlsUrl: " + dto.hlsUrl + ", videoStatus: " + dto.videoStatus);
            
            UUID movieId = movieRepository.insertMovie(
                dto.title.trim(),
                dto.aliasTitle != null ? dto.aliasTitle.trim() : null,
                dto.description,
                dto.releaseYear,
                dto.ageRating,
                dto.imdbRating,
                dto.isSeries,
                dto.posterUrl,
                dto.bannerUrl,
                createdBy,
                dto.videoId,
                dto.hlsUrl,
                dto.videoStatus
            );

            System.out.println("Movie inserted with ID: " + movieId);
            
            // Try to find the movie immediately after insertion
            Movie movie = movieRepository.findMovieByIdWithCreator(movieId);
            if (movie == null) {
                System.err.println("Movie not found after insertion, trying simple find...");
                // Try the simpler find method as fallback
                movie = movieRepository.findMovieById(movieId);
                if (movie == null) {
                    throw new RuntimeException("Không thể tạo phim - không tìm thấy phim sau khi tạo với ID: " + movieId);
                }
            }
            
            System.out.println("Movie found successfully: " + movie.getTitle());
            
            // Assign genres to the movie if provided
            if (dto.genreIds != null && !dto.genreIds.isEmpty()) {
                assignGenresToMovie(movieId, dto.genreIds);
            }
            
            return convertToResponse(movie);
        } catch (DataAccessException e) {
            System.err.println("DataAccessException in createMovie: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo phim: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error in createMovie: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi không mong đợi khi tạo phim: " + e.getMessage());
        }
    }

    public MovieResponse getMovieById(UUID movieId) {
        Movie movie = movieRepository.findMovieById(movieId);
        if (movie == null) {
            throw new IllegalArgumentException("Phim không tồn tại");
        }
        return convertToResponse(movie);
    }

    public MovieResponse getMovieBySlug(String slug) {
        if (slug == null || slug.trim().isEmpty()) {
            throw new IllegalArgumentException("Slug không được để trống");
        }

        Movie movie = movieRepository.findMovieBySlug(slug.trim());
        if (movie == null) {
            throw new IllegalArgumentException("Không tìm thấy phim với slug: " + slug);
        }

        return convertToResponse(movie);
    }

    public List<MovieResponse> getAllMovies(int page, int size) {
        if (page < 0 || size <= 0 || size > 100) {
            throw new IllegalArgumentException("Tham số phân trang không hợp lệ");
        }

        int offset = page * size;
        List<Movie> movies = movieRepository.findAllMovies(size, offset);
        return movies.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<MovieResponse> searchMoviesByTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Từ khóa tìm kiếm không được để trống");
        }

        List<Movie> movies = movieRepository.findMoviesByTitle(title.trim());
        return movies.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public MovieResponse updateMovie(UUID movieId, UpdateMovieRequest dto) {
        Movie existingMovie = movieRepository.findMovieById(movieId);
        if (existingMovie == null) {
            throw new IllegalArgumentException("Phim không tồn tại");
        }

        try {
            String title = dto.title != null ? dto.title.trim() : existingMovie.getTitle();
            String aliasTitle = dto.aliasTitle != null ? dto.aliasTitle.trim() : existingMovie.getAliasTitle();
            String description = dto.description != null ? dto.description : existingMovie.getDescription();
            Short releaseYear = dto.releaseYear != null ? dto.releaseYear : existingMovie.getReleaseYear();
            String ageRating = dto.ageRating != null ? dto.ageRating : existingMovie.getAgeRating();
            java.math.BigDecimal imdbRating = dto.imdbRating != null ? dto.imdbRating : existingMovie.getImdbRating();
            boolean isSeries = dto.isSeries != null ? dto.isSeries : existingMovie.isSeries();
            String posterUrl = dto.posterUrl != null ? dto.posterUrl : existingMovie.getPosterUrl();
            String bannerUrl = dto.bannerUrl != null ? dto.bannerUrl : existingMovie.getBannerUrl();

            int updatedRows = movieRepository.updateMovie(
                movieId, title, aliasTitle, description, releaseYear,
                ageRating, imdbRating, isSeries, posterUrl, bannerUrl
            );

            if (updatedRows == 0) {
                throw new RuntimeException("Không thể cập nhật phim");
            }

            Movie updatedMovie = movieRepository.findMovieById(movieId);
            return convertToResponse(updatedMovie);
        } catch (DataAccessException e) {
            throw new RuntimeException("Lỗi khi cập nhật phim: " + e.getMessage());
        }
    }

    public void deleteMovie(UUID movieId) {
        Movie existingMovie = movieRepository.findMovieById(movieId);
        if (existingMovie == null) {
            throw new IllegalArgumentException("Phim không tồn tại");
        }

        try {
            int deletedRows = movieRepository.deleteMovie(movieId);
            if (deletedRows == 0) {
                throw new RuntimeException("Không thể xóa phim");
            }
        } catch (DataAccessException e) {
            throw new RuntimeException("Lỗi khi xóa phim: " + e.getMessage());
        }
    }

    public long getTotalMovies() {
        return movieRepository.countMovies();
    }

    private MovieResponse convertToResponse(Movie movie) {
        MovieResponse response = new MovieResponse();
        response.movieId = movie.getMovieId();
        response.title = movie.getTitle();
        response.aliasTitle = movie.getAliasTitle();
        response.description = movie.getDescription();
        response.releaseYear = movie.getReleaseYear();
        response.ageRating = movie.getAgeRating();
        response.imdbRating = movie.getImdbRating();
        response.isSeries = movie.isSeries();
        response.posterUrl = movie.getPosterUrl();
        response.bannerUrl = movie.getBannerUrl();
        response.createdBy = movie.getCreatedBy();
        response.createdAt = movie.getCreatedAt();
        response.updatedAt = movie.getUpdatedAt();
        
        // Add video information
        response.videoId = movie.getVideoId();
        response.hlsUrl = movie.getHlsUrl();
        response.videoStatus = movie.getVideoStatus();
        
        // Add genre information
        List<Genre> genres = genreRepository.findGenresByMovieId(movie.getMovieId());
        response.genres = genres.stream()
            .map(this::convertGenreToResponse)
            .collect(Collectors.toList());
        
        return response;
    }

    /**
     * Assign genres to a movie
     */
    private void assignGenresToMovie(UUID movieId, List<UUID> genreIds) {
        for (UUID genreId : genreIds) {
            try {
                // Verify genre exists
                if (!genreRepository.existsById(genreId)) {
                    System.err.println("Genre with ID " + genreId + " does not exist, skipping...");
                    continue;
                }
                
                // Add genre to movie
                boolean added = genreRepository.addGenreToMovie(movieId, genreId);
                if (added) {
                    System.out.println("Successfully assigned genre " + genreId + " to movie " + movieId);
                } else {
                    System.err.println("Failed to assign genre " + genreId + " to movie " + movieId + " (may already exist)");
                }
            } catch (Exception e) {
                System.err.println("Error assigning genre " + genreId + " to movie " + movieId + ": " + e.getMessage());
                // Continue with other genres even if one fails
            }
        }
    }

    /**
     * Convert Genre model to GenreResponse DTO
     */
    private GenreResponse convertGenreToResponse(Genre genre) {
        return new GenreResponse(genre.getGenreId(), genre.getName());
    }
}