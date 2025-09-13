package demo.demo.controller.movie;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import demo.demo.services.movie.MovieService;
import demo.demo.services.auth.AuthService;
import demo.demo.dto.movie.CreateMovieRequest;
import demo.demo.dto.movie.UpdateMovieRequest;
import demo.demo.dto.movie.MovieResponse;
import demo.demo.dto.auth.RegisterRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/movies")
public class MovieController {

    private final MovieService movieService;
    private final AuthService authService;

    public MovieController(MovieService movieService, AuthService authService) {
        this.movieService = movieService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createMovie(@Valid @RequestBody CreateMovieRequest dto) {
        try {
            // Get or create admin user
            UUID adminUserId = getOrCreateAdminUser();

            MovieResponse movie = movieService.createMovie(dto, adminUserId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo phim thành công!");
            response.put("data", movie);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<MovieResponse> movies = movieService.getAllMovies(page, size);
            long totalMovies = movieService.getTotalMovies();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", movies);
            response.put("pagination", Map.of(
                "page", page,
                "size", size,
                "total", totalMovies,
                "totalPages", (totalMovies + size - 1) / size
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{movieId}")
    public ResponseEntity<Map<String, Object>> getMovieById(@PathVariable UUID movieId) {
        try {
            MovieResponse movie = movieService.getMovieById(movieId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", movie);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{movieId}")
    public ResponseEntity<Map<String, Object>> updateMovie(
            @PathVariable UUID movieId,
            @Valid @RequestBody UpdateMovieRequest dto) {
        try {
            MovieResponse movie = movieService.updateMovie(movieId, dto);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật phim thành công!");
            response.put("data", movie);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<Map<String, Object>> deleteMovie(@PathVariable UUID movieId) {
        try {
            movieService.deleteMovie(movieId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa phim thành công!");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchMovies(@RequestParam String title) {
        try {
            List<MovieResponse> movies = movieService.searchMoviesByTitle(title);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", movies);
            response.put("count", movies.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Get or create a default admin user for movie creation
     * This is a temporary solution until proper authentication is implemented
     */
    private UUID getOrCreateAdminUser() {
        try {
            // Try to create admin user
            RegisterRequest adminRequest = new RegisterRequest();
            adminRequest.username = "admin";
            adminRequest.email = "admin@rophim.com";
            adminRequest.password = "admin123";
            adminRequest.displayName = "System Administrator";
            
            UUID adminId = authService.register(adminRequest);
            System.out.println("Created admin user with ID: " + adminId + ", username: " + adminRequest.username);
            return adminId;
        } catch (IllegalStateException e) {
            // User already exists, try to find existing admin user
            System.out.println("Admin user already exists, trying to find existing user...");
            try {
                // Try to find existing admin user by username
                // For now, create a unique admin user
                RegisterRequest adminRequest = new RegisterRequest();
                adminRequest.username = "admin_" + System.currentTimeMillis();
                adminRequest.email = "admin_" + System.currentTimeMillis() + "@rophim.com";
                adminRequest.password = "admin123";
                adminRequest.displayName = "System Administrator";
                
                UUID adminId = authService.register(adminRequest);
                System.out.println("Created unique admin user with ID: " + adminId + ", username: " + adminRequest.username);
                return adminId;
            } catch (Exception ex) {
                System.err.println("Failed to create admin user: " + ex.getMessage());
                ex.printStackTrace();
                throw new RuntimeException("Unable to create admin user: " + ex.getMessage());
            }
        } catch (Exception e) {
            System.err.println("Unexpected error creating admin user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Unexpected error creating admin user: " + e.getMessage());
        }
    }
}