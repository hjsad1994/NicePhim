package demo.demo.controller.genre;

import demo.demo.dto.genre.CreateGenreRequest;
import demo.demo.dto.genre.GenreResponse;
import demo.demo.dto.genre.UpdateGenreRequest;
import demo.demo.services.genre.GenreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/genres")
@CrossOrigin(origins = "http://localhost:3000")
public class GenreController {

    @Autowired
    private GenreService genreService;

    /**
     * Create a new genre
     */
    @PostMapping
    public ResponseEntity<?> createGenre(@Valid @RequestBody CreateGenreRequest request) {
        try {
            GenreResponse response = genreService.createGenre(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get all genres
     */
    @GetMapping
    public ResponseEntity<?> getAllGenres() {
        try {
            List<GenreResponse> genres = genreService.getAllGenres();
            return ResponseEntity.ok(new GenreListResponse(true, genres, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new GenreListResponse(false, null, e.getMessage()));
        }
    }

    /**
     * Get genre by ID
     */
    @GetMapping("/{genreId}")
    public ResponseEntity<?> getGenreById(@PathVariable UUID genreId) {
        try {
            GenreResponse response = genreService.getGenreById(genreId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update genre
     */
    @PutMapping("/{genreId}")
    public ResponseEntity<?> updateGenre(@PathVariable UUID genreId, 
                                       @Valid @RequestBody UpdateGenreRequest request) {
        try {
            GenreResponse response = genreService.updateGenre(genreId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete genre
     */
    @DeleteMapping("/{genreId}")
    public ResponseEntity<?> deleteGenre(@PathVariable UUID genreId) {
        try {
            genreService.deleteGenre(genreId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get genres for a specific movie
     */
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getGenresByMovieId(@PathVariable UUID movieId) {
        try {
            List<GenreResponse> genres = genreService.getGenresByMovieId(movieId);
            GenreListResponse response = new GenreListResponse();
            response.setSuccess(true);
            response.setData(genres);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            GenreListResponse response = new GenreListResponse();
            response.setSuccess(false);
            response.setError(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Add genre to movie
     */
    @PostMapping("/{genreId}/movies/{movieId}")
    public ResponseEntity<?> addGenreToMovie(@PathVariable UUID genreId, 
                                           @PathVariable UUID movieId) {
        try {
            genreService.addGenreToMovie(movieId, genreId);
            return ResponseEntity.ok(new MessageResponse("Đã thêm thể loại vào phim thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Remove genre from movie
     */
    @DeleteMapping("/{genreId}/movies/{movieId}")
    public ResponseEntity<?> removeGenreFromMovie(@PathVariable UUID genreId, 
                                                @PathVariable UUID movieId) {
        try {
            genreService.removeGenreFromMovie(movieId, genreId);
            return ResponseEntity.ok(new MessageResponse("Đã xóa thể loại khỏi phim thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // Helper classes for responses
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class GenreListResponse {
        private boolean success;
        private List<GenreResponse> data;
        private String error;

        public GenreListResponse() {
            // Default constructor
        }

        public GenreListResponse(boolean success, List<GenreResponse> data, String error) {
            this.success = success;
            this.data = data;
            this.error = error;
        }

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public List<GenreResponse> getData() {
            return data;
        }

        public void setData(List<GenreResponse> data) {
            this.data = data;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}