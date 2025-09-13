package demo.demo.services.genre;

import demo.demo.dto.genre.CreateGenreRequest;
import demo.demo.dto.genre.GenreResponse;
import demo.demo.dto.genre.UpdateGenreRequest;
import demo.demo.model.Genre;
import demo.demo.repository.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GenreService {

    @Autowired
    private GenreRepository genreRepository;

    /**
     * Create a new genre
     */
    public GenreResponse createGenre(CreateGenreRequest request) {
        // Validate that genre name doesn't already exist
        Optional<Genre> existingGenre = genreRepository.findGenreByName(request.getName());
        if (existingGenre.isPresent()) {
            throw new IllegalArgumentException("Thể loại '" + request.getName() + "' đã tồn tại");
        }

        // Create new genre
        Genre genre = new Genre();
        genre.setName(request.getName().trim());

        try {
            UUID genreId = genreRepository.insertGenre(genre);
            genre.setGenreId(genreId);
            return convertToResponse(genre);
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo thể loại mới: " + e.getMessage());
        }
    }

    /**
     * Get all genres
     */
    public List<GenreResponse> getAllGenres() {
        try {
            List<Genre> genres = genreRepository.findAllGenres();
            return genres.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Không thể lấy danh sách thể loại: " + e.getMessage());
        }
    }

    /**
     * Get genre by ID
     */
    public GenreResponse getGenreById(UUID genreId) {
        Optional<Genre> genre = genreRepository.findGenreById(genreId);
        if (genre.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy thể loại với ID: " + genreId);
        }
        return convertToResponse(genre.get());
    }

    /**
     * Update genre
     */
    public GenreResponse updateGenre(UUID genreId, UpdateGenreRequest request) {
        // Check if genre exists
        Optional<Genre> existingGenre = genreRepository.findGenreById(genreId);
        if (existingGenre.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy thể loại với ID: " + genreId);
        }

        // Check if new name already exists (excluding current genre)
        boolean nameExists = genreRepository.existsByNameExcludingId(request.getName().trim(), genreId);
        if (nameExists) {
            throw new IllegalArgumentException("Thể loại '" + request.getName() + "' đã tồn tại");
        }

        try {
            boolean updated = genreRepository.updateGenre(genreId, request.getName().trim());
            if (!updated) {
                throw new RuntimeException("Không thể cập nhật thể loại");
            }

            // Get updated genre
            Optional<Genre> updatedGenre = genreRepository.findGenreById(genreId);
            if (updatedGenre.isEmpty()) {
                throw new RuntimeException("Không tìm thấy thể loại sau khi cập nhật");
            }

            return convertToResponse(updatedGenre.get());
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Không thể cập nhật thể loại: " + e.getMessage());
        }
    }

    /**
     * Delete genre
     */
    public void deleteGenre(UUID genreId) {
        // Check if genre exists
        Optional<Genre> genre = genreRepository.findGenreById(genreId);
        if (genre.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy thể loại với ID: " + genreId);
        }

        try {
            boolean deleted = genreRepository.deleteGenre(genreId);
            if (!deleted) {
                throw new RuntimeException("Không thể xóa thể loại");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Không thể xóa thể loại: " + e.getMessage());
        }
    }

    /**
     * Get genres for a specific movie
     */
    public List<GenreResponse> getGenresByMovieId(UUID movieId) {
        try {
            List<Genre> genres = genreRepository.findGenresByMovieId(movieId);
            return genres.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Không thể lấy thể loại của phim: " + e.getMessage());
        }
    }

    /**
     * Add genre to movie
     */
    public void addGenreToMovie(UUID movieId, UUID genreId) {
        // Check if genre exists
        Optional<Genre> genre = genreRepository.findGenreById(genreId);
        if (genre.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy thể loại với ID: " + genreId);
        }

        try {
            boolean added = genreRepository.addGenreToMovie(movieId, genreId);
            if (!added) {
                throw new RuntimeException("Không thể thêm thể loại vào phim (có thể đã tồn tại)");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Không thể thêm thể loại vào phim: " + e.getMessage());
        }
    }

    /**
     * Remove genre from movie
     */
    public void removeGenreFromMovie(UUID movieId, UUID genreId) {
        try {
            boolean removed = genreRepository.removeGenreFromMovie(movieId, genreId);
            if (!removed) {
                throw new RuntimeException("Không thể xóa thể loại khỏi phim (có thể không tồn tại)");
            }
        } catch (Exception e) {
            throw new RuntimeException("Không thể xóa thể loại khỏi phim: " + e.getMessage());
        }
    }

    /**
     * Remove all genres from movie
     */
    public void removeAllGenresFromMovie(UUID movieId) {
        try {
            genreRepository.removeAllGenresFromMovie(movieId);
        } catch (Exception e) {
            throw new RuntimeException("Không thể xóa tất cả thể loại khỏi phim: " + e.getMessage());
        }
    }

    /**
     * Convert Genre model to GenreResponse DTO
     */
    private GenreResponse convertToResponse(Genre genre) {
        return new GenreResponse(genre.getGenreId(), genre.getName());
    }
}
