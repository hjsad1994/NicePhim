package demo.demo.services.room;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.util.*;
import java.util.UUID;

@Service
public class WatchRoomService {

    private final JdbcTemplate jdbcTemplate;

    public WatchRoomService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public JdbcTemplate getJdbcTemplate() {
        return jdbcTemplate;
    }

    // Row mapper for watch room
    private static final RowMapper<Map<String, Object>> watchRoomRowMapper = (rs, rowNum) -> {
        Map<String, Object> room = new HashMap<>();
        room.put("room_id", rs.getString("room_id"));
        room.put("name", rs.getString("name"));
        room.put("created_by", rs.getString("created_by"));
        room.put("movie_id", rs.getString("movie_id"));
        room.put("episode_id", rs.getString("episode_id"));
        room.put("is_private", rs.getBoolean("is_private"));
        room.put("invite_code", rs.getString("invite_code"));
        room.put("current_time_ms", rs.getLong("current_time_ms"));
        room.put("playback_state", rs.getInt("playback_state"));
        room.put("playback_rate", rs.getBigDecimal("playback_rate"));
        room.put("scheduled_start_time", rs.getLong("scheduled_start_time"));
        room.put("broadcast_start_time_type", rs.getString("broadcast_start_time_type"));
        room.put("broadcast_status", rs.getString("broadcast_status"));
        room.put("actual_start_time", rs.getLong("actual_start_time"));
        room.put("server_managed_time", rs.getLong("server_managed_time"));
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
            return createRoom(roomId, "Watch Together Room", UUID.randomUUID());
        } catch (Exception e) {
            System.err.println("❌ Error getting/creating room " + roomId + ": " + e.getMessage());
            e.printStackTrace();
            // Return empty room state as fallback
            Map<String, Object> fallbackRoom = new HashMap<>();
            fallbackRoom.put("room_id", roomId);
            fallbackRoom.put("current_time_ms", 0L);
            fallbackRoom.put("playback_state", 0);
            fallbackRoom.put("playback_rate", 1.0);
            fallbackRoom.put("scheduled_start_time", 0L);
            fallbackRoom.put("broadcast_start_time_type", "now");
            fallbackRoom.put("broadcast_status", "live");
            fallbackRoom.put("actual_start_time", 0L);
            fallbackRoom.put("server_managed_time", 0L);
            return fallbackRoom;
        }
    }

    @Transactional
    public Map<String, Object> createRoom(String roomId, String name, UUID createdBy) {
        try {
            String sql = """
                INSERT INTO dbo.watch_rooms (room_id, name, created_by, current_time_ms, playback_state, playback_rate, invite_code, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
                """;

            // Generate a unique invite code
            String inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            jdbcTemplate.update(sql,
                UUID.fromString(roomId),
                name,
                createdBy,
                0L, // current_time_ms
                0,  // playback_state
                1.0, // playback_rate
                inviteCode // invite_code
            );

            return getRoom(roomId);
        } catch (Exception e) {
            System.err.println("Error creating room: " + e.getMessage());
            throw new RuntimeException("Failed to create room", e);
        }
    }

    /**
     * Create room with broadcast scheduling
     */
    @Transactional
    public Map<String, Object> createRoomWithSchedule(String roomId, String name, UUID createdBy, String movieId, Long scheduledStartTime, String broadcastStartTimeType) {
        try {
            System.out.println("🚀 Creating room with schedule: " + roomId + ", name: " + name + ", movieId: " + movieId);

            // Create user first if not exists
            String username = name; // Use room name as username for now
            createOrUpdateSimpleUser(username);
            UUID userId = UUID.nameUUIDFromBytes(username.getBytes());
            System.out.println("👤 User ID for room creation: " + userId);

            String sql = """
                INSERT INTO dbo.watch_rooms (room_id, name, created_by, movie_id, scheduled_start_time, broadcast_start_time_type,
                    broadcast_status, current_time_ms, playback_state, playback_rate, invite_code, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())
                """;

            // Generate a unique invite code
            String inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            jdbcTemplate.update(sql,
                UUID.fromString(roomId),
                name,
                userId,
                movieId != null && !movieId.isEmpty() && !movieId.equals("null") ? UUID.fromString(movieId) : null,
                scheduledStartTime,
                broadcastStartTimeType != null ? broadcastStartTimeType : "now",
                scheduledStartTime != null ? "scheduled" : "live",
                0L, // current_time_ms
                0,  // playback_state
                1.0, // playback_rate
                inviteCode // invite_code
            );

            System.out.println("✅ Room created successfully: " + roomId);
            return getRoom(roomId);
        } catch (Exception e) {
            System.err.println("❌ Error creating room with schedule: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create room with schedule", e);
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
     * Get rooms created by a specific user
     */
    public List<Map<String, Object>> getRoomsByUser(String username) {
        try {
            // Generate user ID from username
            UUID userId = UUID.nameUUIDFromBytes(username.getBytes());

            String sql = "SELECT * FROM dbo.watch_rooms WHERE created_by = ? ORDER BY created_at DESC";
            return jdbcTemplate.query(sql, watchRoomRowMapper, userId);
        } catch (Exception e) {
            System.err.println("Error getting rooms by user: " + e.getMessage());
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
                return false;
            }

            // Generate user ID from username
            UUID userId = UUID.nameUUIDFromBytes(username.getBytes());

            // Check if user owns the room
            UUID createdBy = (UUID) room.get("created_by");
            if (!createdBy.equals(userId)) {
                return false; // User doesn't own the room
            }

            // Delete the room
            String sql = "DELETE FROM dbo.watch_rooms WHERE room_id = ?";
            int rowsDeleted = jdbcTemplate.update(sql, UUID.fromString(roomId));

            return rowsDeleted > 0;
        } catch (Exception e) {
            System.err.println("Error deleting room: " + e.getMessage());
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
                createRoom(roomId, "Watch Together Room", UUID.randomUUID());
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
            // Don't throw exception to avoid disrupting WebSocket communication
        }
    }

    @Transactional
    public void updateScheduledTime(String roomId, Long scheduledStartTime) {
        try {
            String sql = """
                UPDATE dbo.watch_rooms
                SET scheduled_start_time = ?, playback_state = 0, current_time_ms = 0, updated_at = GETDATE()
                WHERE room_id = ?
                """;

            jdbcTemplate.update(sql, scheduledStartTime, UUID.fromString(roomId));
        } catch (Exception e) {
            System.err.println("Error updating scheduled time: " + e.getMessage());
            // Don't throw exception to avoid disrupting WebSocket communication
        }
    }

    /**
     * Calculate current playback position based on broadcast time
     * Returns the current position in milliseconds that the video should be at
     */
    public Long calculateCurrentPosition(String roomId) {
        try {
            Map<String, Object> room = getRoom(roomId);
            if (room == null) {
                return 0L;
            }

            Long scheduledStartTime = (Long) room.get("scheduled_start_time");
            Short playbackStateShort = (Short) room.get("playback_state");
            Integer playbackState = playbackStateShort != null ? playbackStateShort.intValue() : null;
            Long pausedAt = (Long) room.get("current_time_ms");

            if (scheduledStartTime == null || scheduledStartTime == 0) {
                // No scheduled time, return current position
                return pausedAt != null ? pausedAt : 0L;
            }

            long now = System.currentTimeMillis();
            
            // If broadcast hasn't started yet
            if (now < scheduledStartTime) {
                return 0L;
            }

            // If video is paused, return the paused position
            if (playbackState != null && playbackState == 2) {
                return pausedAt != null ? pausedAt : 0L;
            }

            // If video is playing, calculate position based on elapsed time
            if (playbackState != null && playbackState == 1) {
                long elapsedTime = now - scheduledStartTime;
                return elapsedTime;
            }

            // If stopped or not started (state = 0), check if it should auto-start
            if (now >= scheduledStartTime) {
                // Auto-start the video
                updateRoomState(roomId, now - scheduledStartTime, 1, 1.0);
                return now - scheduledStartTime;
            }

            return 0L;
        } catch (Exception e) {
            System.err.println("Error calculating current position: " + e.getMessage());
            return 0L;
        }
    }

    /**
     * Handle pause/resume for broadcast mode
     */
    @Transactional
    public void togglePlayPause(String roomId, boolean pause) {
        try {
            Map<String, Object> room = getRoom(roomId);
            if (room == null) return;

            Long currentPos = calculateCurrentPosition(roomId);
            Integer newState = pause ? 2 : 1; // 2 = paused, 1 = playing

            // For broadcast mode, also update the actual start time when resuming
            Long actualStartTime = (Long) room.get("actual_start_time");
            String broadcastStatus = (String) room.get("broadcast_status");

            if (!pause && "live".equals(broadcastStatus)) {
                // When resuming in live mode, adjust actual start time to maintain continuity
                if (actualStartTime != null && currentPos > 0) {
                    actualStartTime = System.currentTimeMillis() - currentPos;
                }
            }

            String sql = """
                UPDATE dbo.watch_rooms
                SET playback_state = ?, current_time_ms = ?, actual_start_time = ?, updated_at = GETDATE()
                WHERE room_id = ?
                """;

            // Convert Integer to Short for TINYINT database column
            Short newStateShort = newState != null ? newState.shortValue() : null;
            jdbcTemplate.update(sql, newStateShort, currentPos, actualStartTime, UUID.fromString(roomId));

            System.out.println("💾 Toggled play/pause for room " + roomId + ": state=" + newState + ", position=" + currentPos + ", adjustedStartTime=" + actualStartTime);
        } catch (Exception e) {
            System.err.println("Error toggling play/pause: " + e.getMessage());
        }
    }

    
    /**
     * Get rooms by broadcast status
     */
    public List<Map<String, Object>> getRoomsByStatus(String status) {
        try {
            String sql = "SELECT * FROM dbo.watch_rooms WHERE broadcast_status = ?";
            return jdbcTemplate.query(sql, watchRoomRowMapper, status);
        } catch (Exception e) {
            System.err.println("Error getting rooms by status: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Update broadcast status
     */
    @Transactional
    public void updateBroadcastStatus(String roomId, String status, Long actualStartTime) {
        try {
            String sql = """
                UPDATE dbo.watch_rooms
                SET broadcast_status = ?, actual_start_time = ?, updated_at = GETDATE()
                WHERE room_id = ?
                """;

            jdbcTemplate.update(sql, status, actualStartTime, UUID.fromString(roomId));
        } catch (Exception e) {
            System.err.println("Error updating broadcast status: " + e.getMessage());
        }
    }

    /**
     * Update server managed time
     */
    @Transactional
    public void updateServerManagedTime(String roomId, Long serverManagedTime) {
        try {
            String sql = """
                UPDATE dbo.watch_rooms
                SET server_managed_time = ?, updated_at = GETDATE()
                WHERE room_id = ?
                """;

            jdbcTemplate.update(sql, serverManagedTime, UUID.fromString(roomId));
        } catch (Exception e) {
            System.err.println("Error updating server managed time: " + e.getMessage());
        }
    }

    /**
     * Get current server time for a room
     */
    public Long getServerTime(String roomId) {
        try {
            Map<String, Object> room = getRoom(roomId);
            if (room == null) {
                return 0L;
            }

            return (Long) room.get("server_managed_time");
        } catch (Exception e) {
            System.err.println("Error getting server time: " + e.getMessage());
            return 0L;
        }
    }

    /**
     * Create a simple user if it doesn't exist
     */
    public void createOrUpdateSimpleUser(String username) {
        try {
            UUID userId = UUID.nameUUIDFromBytes(username.getBytes());
            System.out.println("🔧 Creating user: " + username + " with ID: " + userId);

            // Check if user exists
            String checkSql = "SELECT COUNT(*) FROM dbo.users WHERE user_id = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId);
            System.out.println("🔧 User count: " + count);

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
            } else {
                System.out.println("✅ User already exists: " + username);
            }
        } catch (Exception e) {
            System.err.println("Error creating user " + username + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}