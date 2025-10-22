package demo.demo.services.room;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCrypt;

import demo.demo.services.movie.MovieService;
import demo.demo.dto.movie.MovieResponse;

import java.util.*;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WatchRoomService {

    private final JdbcTemplate jdbcTemplate;
    private final MovieService movieService;

    // Track active users in each room
    private Map<String, Set<String>> roomUsers = new ConcurrentHashMap<>();

    // Track last update time for each room to prevent frequent database writes
    private Map<String, Long> lastUpdateTime = new ConcurrentHashMap<>();
    private static final long MIN_UPDATE_INTERVAL = 1000; // 1 second minimum between updates

    public WatchRoomService(JdbcTemplate jdbcTemplate, MovieService movieService) {
        this.jdbcTemplate = jdbcTemplate;
        this.movieService = movieService;
    }

    // Helper method to validate UUID
    private boolean isValidUUID(String uuid) {
        try {
            UUID.fromString(uuid);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    // Row mapper for watch room
    private static final RowMapper<Map<String, Object>> watchRoomRowMapper = (rs, rowNum) -> {
        Map<String, Object> room = new HashMap<>();
        room.put("room_id", rs.getString("room_id"));
        room.put("name", rs.getString("name"));
        room.put("created_by", UUID.fromString(rs.getString("created_by")));
        room.put("movie_id", rs.getString("movie_id"));
        // episode_id removed in V7 migration

        room.put("current_time_ms", rs.getLong("current_time_ms"));
        room.put("playback_state", rs.getShort("playback_state"));
        room.put("playback_rate", rs.getBigDecimal("playback_rate"));
        room.put("created_at", rs.getTimestamp("created_at").toLocalDateTime());
        return room;
    };

    public Map<String, Object> getOrCreateRoom(String roomId) {
        try {
            // Try to get existing room
            String sql = "SELECT * FROM dbo.watch_rooms WHERE room_id = ?";
            List<Map<String, Object>> rooms = jdbcTemplate.query(sql, watchRoomRowMapper, UUID.fromString(roomId));

            if (!rooms.isEmpty()) {
                System.out.println("📋 Found existing room: " + roomId);
                return rooms.get(0);
            }

            // Create new room if not exists
            System.out.println("📋 Creating new room: " + roomId);
            return createRoom(roomId, "Watch Together Room", UUID.randomUUID(), null);
        } catch (Exception e) {
            System.err.println("❌ Error getting/creating room " + roomId + ": " + e.getMessage());
            e.printStackTrace();
            // Return empty room state as fallback
            Map<String, Object> fallbackRoom = new HashMap<>();
            fallbackRoom.put("room_id", roomId);
            fallbackRoom.put("current_time_ms", 0L);
            fallbackRoom.put("playback_state", 0);
            fallbackRoom.put("playback_rate", 1.0);
            return fallbackRoom;
        }
    }

    /**
     * Create room with optional movie
     */
    @Transactional
    public Map<String, Object> createRoom(String roomId, String name, UUID createdBy, String movieId) {
        try {
            System.out.println("🚀 Creating room with movie: " + roomId + ", name: " + name + ", movieId: " + movieId);
            System.out.println("👤 User ID for room creation: " + createdBy);

            // Validate movie ID if provided
            UUID movieUUID = null;
            if (movieId != null && !movieId.isEmpty() && !movieId.equals("null")) {
                Map<String, Object> movieDetails = validateAndGetMovieDetails(movieId);
                if (movieDetails == null) {
                    throw new IllegalArgumentException("Invalid movie ID: " + movieId);
                }
                movieUUID = UUID.fromString(movieId);
                System.out.println("✅ Valid movie found: " + movieDetails.get("title"));
            }

            String sql = """
                INSERT INTO dbo.watch_rooms (room_id, name, created_by, movie_id, current_time_ms, playback_state, playback_rate, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
                """;

            jdbcTemplate.update(sql,
                UUID.fromString(roomId),
                name,
                createdBy,
                movieUUID,
                0L, // current_time_ms
                0,  // playback_state
                1.0 // playback_rate
            );

            System.out.println("✅ Room created successfully: " + roomId);
            return getRoom(roomId);
        } catch (Exception e) {
            System.err.println("❌ Error creating room with movie: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create room with movie", e);
        }
    }

  
    public Map<String, Object> getRoom(String roomId) {
        try {
            String sql = "SELECT * FROM dbo.watch_rooms WHERE room_id = ?";
            List<Map<String, Object>> rooms = jdbcTemplate.query(sql, watchRoomRowMapper, UUID.fromString(roomId));

            if (rooms.isEmpty()) {
                return null;
            }

            return rooms.get(0);
        } catch (Exception e) {
            System.err.println("Error getting room: " + e.getMessage());
            return null;
        }
    }

    /**
     * Get movie details for room (including HLS URL for video playback)
     */
    public Map<String, Object> getMovieDetailsForRoom(String roomId) {
        try {
            Map<String, Object> room = getRoom(roomId);
            if (room == null) {
                System.out.println("❌ Room not found: " + roomId);
                return null;
            }

            String movieId = (String) room.get("movie_id");
            if (movieId == null || movieId.trim().isEmpty()) {
                System.out.println("❌ No movie associated with room: " + roomId);
                return null;
            }

            return validateAndGetMovieDetails(movieId);
        } catch (Exception e) {
            System.err.println("❌ Error getting movie details for room " + roomId + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Validate and get movie details from database
     */
    public Map<String, Object> validateAndGetMovieDetails(String movieId) {
        try {
            if (movieId == null || movieId.trim().isEmpty() || !isValidUUID(movieId)) {
                System.out.println("❌ Invalid movie ID: " + movieId);
                return null;
            }

            System.out.println("🔍 Validating movie ID: " + movieId);
            MovieResponse movie = movieService.getMovieById(UUID.fromString(movieId));

            if (movie == null) {
                System.out.println("❌ Movie not found with ID: " + movieId);
                return null;
            }

            System.out.println("✅ Movie found: " + movie.title);

            Map<String, Object> movieDetails = new HashMap<>();
            movieDetails.put("movie_id", movie.movieId);
            movieDetails.put("title", movie.title);
            movieDetails.put("alias_title", movie.aliasTitle);
            movieDetails.put("description", movie.description);
            movieDetails.put("poster_url", movie.posterUrl);
            movieDetails.put("banner_url", movie.bannerUrl);
            movieDetails.put("video_id", movie.videoId);
            movieDetails.put("hls_url", movie.hlsUrl);
            movieDetails.put("video_status", movie.videoStatus);
            movieDetails.put("is_series", movie.isSeries);

            return movieDetails;
        } catch (Exception e) {
            System.err.println("❌ Error validating movie " + movieId + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Get rooms created by a specific user
     */
    public List<Map<String, Object>> getRoomsByUser(String username) {
        try {
            // Get actual user ID from database
            UUID userId = getUserIdByUsername(username);
            if (userId == null) {
                System.out.println("🔍 User not found: " + username);
                return new ArrayList<>();
            }

            System.out.println("🔍 Getting rooms for user: " + username + " (ID: " + userId + ")");

            String sql = "SELECT * FROM dbo.watch_rooms WHERE created_by = ? ORDER BY created_at DESC";
            List<Map<String, Object>> rooms = jdbcTemplate.query(sql, watchRoomRowMapper, userId);
            System.out.println("📋 Found " + rooms.size() + " rooms for user " + username);
            return rooms;
        } catch (Exception e) {
            System.err.println("Error getting rooms by user: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Delete a room (only if owned by the user)
     */
    public boolean deleteRoom(String roomId, String username) {
        try {
            // Get room first to check ownership
            Map<String, Object> room = getRoom(roomId);
            if (room == null) {
                System.err.println("❌ Room not found for deletion: " + roomId);
                return false;
            }

            // Get actual user ID from database
            UUID userId = getUserIdByUsername(username);
            if (userId == null) {
                System.err.println("❌ User not found for deletion: " + username);
                return false;
            }

            // Check if user owns the room
            UUID createdBy = (UUID) room.get("created_by");

            if (!createdBy.equals(userId)) {
                System.err.println("❌ Permission denied - User " + username + " does not own room " + roomId);
                return false; // User doesn't own the room
            }

            // Delete the room
            String sql = "DELETE FROM dbo.watch_rooms WHERE room_id = ?";
            int rowsDeleted = jdbcTemplate.update(sql, UUID.fromString(roomId));
            System.out.println("✅ Room deleted successfully: " + roomId + ", rows affected: " + rowsDeleted);
            return rowsDeleted > 0;
        } catch (Exception e) {
            System.err.println("❌ Error deleting room: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public void updateRoomState(String roomId, Long currentTimeMs, Integer playbackState, Double playbackRate) {
        try {
            // First check if room exists, create if it doesn't
            Map<String, Object> room = getRoom(roomId);
            if (room == null) {
                System.out.println("📋 Room not found for update, creating: " + roomId);
                createRoom(roomId, "Watch Together Room", UUID.randomUUID(), null);
            }

            String sql = """
                UPDATE dbo.watch_rooms
                SET current_time_ms = ?, playback_state = ?, playback_rate = ?, updated_at = GETDATE()
                WHERE room_id = ?
                """;

            // Convert Integer to Short for TINYINT database column
            Short playbackStateShort = playbackState != null ? playbackState.shortValue() : null;
            int rowsAffected = jdbcTemplate.update(sql, currentTimeMs, playbackStateShort, playbackRate, UUID.fromString(roomId));
            System.out.println("💾 Room state update for " + roomId + ": " + rowsAffected + " rows affected, time=" + currentTimeMs + "ms, state=" + playbackState);
        } catch (Exception e) {
            System.err.println("❌ Error updating room state for " + roomId + ": " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception to avoid disrupting client communication
        }
    }

    /**
     * Calculate current playback position (simplified - no scheduled broadcasts)
     * Returns the current position in milliseconds
     */
    public Long calculateCurrentPosition(String roomId) {
        try {
            Map<String, Object> room = getRoom(roomId);
            if (room == null) {
                return 0L;
            }

            Long currentTimeMs = (Long) room.get("current_time_ms");
            return currentTimeMs != null ? currentTimeMs : 0L;
        } catch (Exception e) {
            System.err.println("Error calculating current position: " + e.getMessage());
            return 0L;
        }
    }

    /**
     * Get user ID by username, returns null if user doesn't exist
     */
    public UUID getUserIdByUsername(String username) {
        try {
            String sql = "SELECT user_id FROM dbo.users WHERE username = ?";
            return jdbcTemplate.queryForObject(sql, UUID.class, username);
        } catch (Exception e) {
            // User not found or other error
            return null;
        }
    }

    /**
     * Create a simple user if it doesn't exist
     */
    public UUID createOrUpdateSimpleUser(String username) {
        try {
            // First, try to get existing user by username
            UUID existingUserId = getUserIdByUsername(username);

            if (existingUserId != null) {
                System.out.println("✅ User already exists: " + username + " with ID: " + existingUserId);
                return existingUserId;
            }

            // Generate consistent UUID for new user
            UUID userId = UUID.nameUUIDFromBytes(username.getBytes());
            System.out.println("🔧 Creating user: " + username + " with ID: " + userId);

            // Check if user exists with this UUID (shouldn't happen, but just in case)
            String checkSql = "SELECT COUNT(*) FROM dbo.users WHERE user_id = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId);
            System.out.println("🔧 User count for UUID: " + count);

            if (count != null && count == 0) {
                // Create user
                String insertSql = """
                    INSERT INTO dbo.users (user_id, username, email, password_hash, created_at)
                    VALUES (?, ?, ?, ?, SYSUTCDATETIME())
                    """;

                // Generate a proper BCrypt password hash for the simple user
                String defaultPassword = "watchTogether123";
                String passwordHash = BCrypt.hashpw(defaultPassword, BCrypt.gensalt(10));

                jdbcTemplate.update(insertSql,
                    userId,
                    username,
                    username + "@example.com",
                    passwordHash.getBytes()
                );
                System.out.println("✅ Created user: " + username);
                return userId;
            } else {
                // UUID already exists, fetch the actual username for this UUID
                String actualUsername = jdbcTemplate.queryForObject("SELECT username FROM dbo.users WHERE user_id = ?", String.class, userId);
                System.out.println("⚠️  UUID already exists for different username: " + actualUsername);
                // Return existing user ID, but this might cause confusion
                return userId;
            }
        } catch (Exception e) {
            System.err.println("Error creating user " + username + ": " + e.getMessage());
            e.printStackTrace();
            // Fallback: generate a random UUID
            UUID fallbackUserId = UUID.randomUUID();
            System.out.println("🔄 Using fallback UUID for user: " + username + " -> " + fallbackUserId);
            return fallbackUserId;
        }
    }

    /**
     * Add user to room for tracking
     * Returns true if user was added, false if already in room
     */
    public boolean addUserToRoom(String roomId, String username) {
        roomUsers.putIfAbsent(roomId, ConcurrentHashMap.newKeySet());
        Set<String> users = roomUsers.get(roomId);

        // Check if user is already in the room to prevent duplicate notifications
        if (users.contains(username)) {
            System.out.println("🔄 User " + username + " already in room " + roomId + ", skipping duplicate join notification");
            return false; // User already exists
        }

        users.add(username);
        System.out.println("👥 User " + username + " joined room " + roomId + ". Total users: " + users.size());
        return true; // User added successfully
    }

    /**
     * Remove user from room and save room state if empty
     */
    public void removeUserFromRoom(String roomId, String username) {
        Set<String> users = roomUsers.get(roomId);
        if (users != null) {
            users.remove(username);
            System.out.println("👋 User " + username + " left room " + roomId + ". Remaining users: " + users.size());

            // Save room state when room becomes empty
            if (users.isEmpty()) {
                saveRoomStateOnEmpty(roomId);
                roomUsers.remove(roomId);
                System.out.println("🧹 Room " + roomId + " is empty, state saved and cleaned up");
            }
        }
    }

    /**
     * Get number of active users in room
     */
    public int getActiveUserCount(String roomId) {
        Set<String> users = roomUsers.get(roomId);
        return users != null ? users.size() : 0;
    }

    /**
     * Save room state when room becomes empty
     */
    @Transactional
    private void saveRoomStateOnEmpty(String roomId) {
        try {
            Map<String, Object> room = getRoom(roomId);
            if (room != null) {
                Long currentPosition = calculateCurrentPosition(roomId);
                Integer playbackState = room.get("playback_state") instanceof Short ?
                    ((Short) room.get("playback_state")).intValue() : 0;

                String sql = """
                    UPDATE dbo.watch_rooms
                    SET current_time_ms = ?, playback_state = ?, updated_at = GETDATE()
                    WHERE room_id = ?
                    """;

                int rowsUpdated = jdbcTemplate.update(sql, currentPosition, playbackState.shortValue(), UUID.fromString(roomId));
                System.out.println("💾 Saved room state for empty room " + roomId + ": position=" + currentPosition + "ms, state=" + playbackState);
            }
        } catch (Exception e) {
            System.err.println("❌ Error saving room state for empty room " + roomId + ": " + e.getMessage());
        }
    }

    /**
     * Update server-managed video position (called when video is playing)
     * Only host should call this method
     */
    @Transactional
    public void updateServerVideoPosition(String roomId, Long positionMs, Boolean isHost) {
        try {
            // Only accept updates from host
            if (isHost == null || !isHost) {
                System.out.println("⚠️ Ignoring position update from non-host in room " + roomId);
                return;
            }

            // Rate limiting to prevent database spam
            long now = System.currentTimeMillis();
            Long lastUpdate = lastUpdateTime.get(roomId);

            if (lastUpdate != null && (now - lastUpdate) < MIN_UPDATE_INTERVAL) {
                return; // Skip update if too recent
            }

            Map<String, Object> room = getRoom(roomId);
            if (room == null) {
                return;
            }

            String sql = """
                UPDATE dbo.watch_rooms
                SET current_time_ms = ?, playback_state = 1, updated_at = GETDATE()
                WHERE room_id = ?
                """;

            int rowsUpdated = jdbcTemplate.update(sql, positionMs, UUID.fromString(roomId));
            lastUpdateTime.put(roomId, now);

            // Only log significant updates
            if (positionMs % 5000 < 1000) { // Log every 5 seconds
                System.out.println("👑 Host updated position for room " + roomId + ": " + positionMs + "ms");
            }
        } catch (Exception e) {
            System.err.println("❌ Error updating host video position for room " + roomId + ": " + e.getMessage());
        }
    }

    /**
     * Get current server-controlled video position for sync
     */
    public Long getServerVideoPosition(String roomId) {
        try {
            Map<String, Object> room = getRoom(roomId);
            if (room == null) {
                return 0L;
            }

            Long storedPosition = (Long) room.get("current_time_ms");
            Integer playbackState = room.get("playback_state") instanceof Short ?
                ((Short) room.get("playback_state")).intValue() : 0;

            // If video is playing and has a stored position, return it
            if (playbackState == 1 && storedPosition != null && storedPosition > 0) {
                return storedPosition;
            }

            return storedPosition != null ? storedPosition : 0L;
        } catch (Exception e) {
            System.err.println("❌ Error getting server video position for room " + roomId + ": " + e.getMessage());
            return 0L;
        }
    }

    /**
     * Get room playback state
     */
    public Integer getRoomPlaybackState(String roomId) {
        try {
            Map<String, Object> room = getRoom(roomId);
            if (room == null) {
                return 0; // stopped
            }

            return room.get("playback_state") instanceof Short ?
                ((Short) room.get("playback_state")).intValue() : 0;
        } catch (Exception e) {
            System.err.println("❌ Error getting room playback state for room " + roomId + ": " + e.getMessage());
            return 0;
        }
    }
}