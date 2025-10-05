package demo.demo.controller.room;

import demo.demo.services.room.WatchRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class RoomController {

	@Autowired
	private WatchRoomService watchRoomService;

	// Track active users in each room to prevent duplicate join notifications
	private Map<String, Set<String>> roomUsers = new ConcurrentHashMap<>();

	
	// REST API endpoints for room management

	/**
	 * Create a new watch room with broadcast scheduling
	 */
	@PostMapping("/api/rooms")
	public ResponseEntity<Map<String, Object>> createRoom(@RequestBody Map<String, Object> request) {
		try {
			String name = (String) request.get("name");
			String username = (String) request.get("username");
			String movieId = (String) request.get("movieId");
			String broadcastStartTimeType = (String) request.get("broadcastStartTimeType");
			Long scheduledStartTime = null;

			// Validate required fields
			if (name == null || name.trim().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"error", "Room name is required"
				));
			}

			if (username == null || username.trim().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"error", "Username is required"
				));
			}

			// Calculate scheduled start time
			if (broadcastStartTimeType != null && !broadcastStartTimeType.equals("now")) {
				try {
					int minutes = Integer.parseInt(broadcastStartTimeType);
					scheduledStartTime = System.currentTimeMillis() + (minutes * 60 * 1000L);
				} catch (NumberFormatException e) {
					return ResponseEntity.badRequest().body(Map.of(
						"success", false,
						"error", "Invalid broadcast start time type"
					));
				}
			}

			// Get or create user ID for username
			System.out.println("🔍 Creating room - Username: " + username);
			UUID userId = watchRoomService.createOrUpdateSimpleUser(username);
			System.out.println("👤 Using User ID for room creation: " + userId);

			// Generate room ID
			String roomId = UUID.randomUUID().toString();

			// Create room with broadcast scheduling
			Map<String, Object> room = watchRoomService.createRoomWithSchedule(
				roomId, name, userId, movieId, scheduledStartTime, broadcastStartTimeType
			);

			Map<String, Object> response = new HashMap<>(room);
			response.put("success", true);
			response.put("message", "Room created successfully");

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	/**
	 * Get room by ID
	 */
	@GetMapping("/api/rooms/{roomId}")
	public ResponseEntity<Map<String, Object>> getRoom(@PathVariable String roomId) {
		try {
			Map<String, Object> room = watchRoomService.getRoom(roomId);
			if (room == null) {
				return ResponseEntity.notFound().build();
			}

			// Calculate current position for broadcast rooms
			Long currentPosition = watchRoomService.calculateCurrentPosition(roomId);
			room.put("current_position_ms", currentPosition);

			return ResponseEntity.ok(room);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	/**
	 * Get rooms created by a user
	 */
	@GetMapping("/api/rooms/user/{username}")
	public ResponseEntity<Map<String, Object>> getRoomsByUser(@PathVariable String username) {
		try {
			List<Map<String, Object>> rooms = watchRoomService.getRoomsByUser(username);
			return ResponseEntity.ok(Map.of(
				"success", true,
				"data", rooms
			));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	/**
	 * Delete a room (only by creator)
	 */
	@DeleteMapping("/api/rooms/{roomId}")
	public ResponseEntity<Map<String, Object>> deleteRoom(
			@PathVariable String roomId,
			@RequestParam String username) {
		try {
			boolean deleted = watchRoomService.deleteRoom(roomId, username);
			if (deleted) {
				return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "Room deleted successfully"
				));
			} else {
				return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"error", "Room not found or you don't have permission to delete it"
				));
			}
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	/**
	 * Update room state (play/pause)
	 */
	@PostMapping("/api/rooms/{roomId}/state")
	public ResponseEntity<Map<String, Object>> updateRoomState(
			@PathVariable String roomId,
			@RequestBody Map<String, Object> request) {
		try {
			String action = (String) request.get("action");
			String username = (String) request.get("username");

			if (action == null) {
				return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"error", "Action is required"
				));
			}

			// Verify user owns the room
			Map<String, Object> room = watchRoomService.getRoom(roomId);
			if (room == null) {
				return ResponseEntity.notFound().build();
			}

			UUID createdBy = (UUID) room.get("created_by");
			UUID userId = UUID.nameUUIDFromBytes(username.getBytes());
			if (!createdBy.equals(userId)) {
				return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"error", "Only room creator can control playback"
				));
			}

			switch (action) {
				case "play":
					watchRoomService.togglePlayPause(roomId, false);
					break;
				case "pause":
					watchRoomService.togglePlayPause(roomId, true);
					break;
				default:
					return ResponseEntity.badRequest().body(Map.of(
						"success", false,
						"error", "Invalid action. Use 'play' or 'pause'"
					));
			}

			return ResponseEntity.ok(Map.of(
				"success", true,
				"message", "Room state updated successfully"
			));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	/**
	 * Get current server time for a room (for sync purposes)
	 */
	@GetMapping("/api/rooms/{roomId}/server-time")
	public ResponseEntity<Map<String, Object>> getServerTime(@PathVariable String roomId) {
		try {
			Long serverTime = watchRoomService.getServerTime(roomId);
			Map<String, Object> room = watchRoomService.getRoom(roomId);

			if (room == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(Map.of(
				"success", true,
				"serverTime", serverTime,
				"currentTime", System.currentTimeMillis(),
				"broadcastStatus", room.get("broadcast_status"),
				"scheduledStartTime", room.get("scheduled_start_time"),
				"actualStartTime", room.get("actual_start_time")
			));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	/**
	 * Get movie details for a room
	 */
	@GetMapping("/api/rooms/{roomId}/movie")
	public ResponseEntity<Map<String, Object>> getRoomMovie(@PathVariable String roomId) {
		try {
			Map<String, Object> movieDetails = watchRoomService.getMovieDetailsForRoom(roomId);
			if (movieDetails == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(Map.of(
				"success", true,
				"data", movieDetails
			));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	/**
	 * Get current playback position for all users to sync to
	 */
	@GetMapping("/api/rooms/{roomId}/current-position")
	public ResponseEntity<Map<String, Object>> getCurrentPosition(@PathVariable String roomId) {
		try {
			// First check if room exists, create fallback if not
			Map<String, Object> room = watchRoomService.getRoom(roomId);
			if (room == null) {
				// Create a fallback room if it doesn't exist
				System.out.println("📋 Room not found for sync, creating fallback: " + roomId);
				room = watchRoomService.getOrCreateRoom(roomId);
			}

			// Calculate the current position all users should sync to
			Long currentPosition = watchRoomService.calculateCurrentPosition(roomId);
			Long scheduledStartTime = (Long) room.get("scheduled_start_time");
			Short playbackStateShort = (Short) room.get("playback_state");
			Integer playbackState = playbackStateShort != null ? playbackStateShort.intValue() : null;

			// Reduced logging - only log significant sync events
			if (currentPosition > 0 || playbackState != 0) {
				System.out.println("🔄 Sync request for room " + roomId + ": position=" + currentPosition + "ms, state=" + playbackState);
			}

			return ResponseEntity.ok(Map.of(
				"success", true,
				"currentPositionMs", currentPosition,
				"currentTimeMs", System.currentTimeMillis(),
				"scheduledStartTime", scheduledStartTime,
				"playbackState", playbackState,
				"broadcastStatus", room.get("broadcast_status")
			));
		} catch (Exception e) {
			System.err.println("❌ Error getting current position for room " + roomId + ": " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	// WebSocket message handlers (existing functionality)

	/**
	 * Handle control messages (local only, no global broadcasting)
	 */
	@MessageMapping("/room/{roomId}/control")
	@SendTo("/topic/room.{roomId}")
	public Map<String, Object> handleControl(
			@DestinationVariable String roomId,
			Map<String, Object> message) {

		// Add timestamp for drift calculation
		message.put("timestamp", System.currentTimeMillis());

		String action = (String) message.get("action");
		String username = (String) message.get("username");

		// Handle sync requests only (no global play/pause broadcasting)
		if ("sync".equals(action)) {
			// Get current server position for sync
			Long currentPosition = watchRoomService.calculateCurrentPosition(roomId);
			message.put("currentPosition", currentPosition);
			message.put("type", "sync_response");
		}

		// For play/pause, just acknowledge but don't broadcast to others
		if ("play".equals(action) || "pause".equals(action)) {
			message.put("type", "local_control");
			message.put("message", username + " " + ("play".equals(action) ? "played" : "paused") + " locally");
		}

		return message;
	}

	/**
	 * Chat messages
	 */
	@MessageMapping("/room/{roomId}/chat")
	@SendTo("/topic/room.{roomId}")
	public Map<String, Object> handleChat(
			@DestinationVariable String roomId,
			Map<String, Object> message) {

		message.put("timestamp", System.currentTimeMillis());
		message.put("type", "chat");
		return message;
	}

	/**
	 * User join/leave notifications with duplicate prevention
	 */
	@MessageMapping("/room/{roomId}/join")
	@SendTo("/topic/room.{roomId}")
	public Map<String, Object> handleJoin(
			@DestinationVariable String roomId,
			Map<String, Object> message) {

		String username = (String) message.get("username");

		// Use service for user tracking with duplicate prevention
		boolean userAdded = watchRoomService.addUserToRoom(roomId, username);

		// Only send join notification if user was actually added
		if (userAdded) {
			message.put("timestamp", System.currentTimeMillis());
			message.put("type", "user_join");
			return message;
		} else {
			// Return empty message to prevent broadcasting duplicate notification
			Map<String, Object> emptyMessage = new HashMap<>();
			emptyMessage.put("type", "system");
			emptyMessage.put("message", "duplicate_join");
			emptyMessage.put("timestamp", System.currentTimeMillis());
			return emptyMessage;
		}
	}

	/**
	 * User leave handler for cleanup
	 */
	@MessageMapping("/room/{roomId}/leave")
	public void handleLeave(
			@DestinationVariable String roomId,
			Map<String, Object> message) {

		String username = (String) message.get("username");
		// Use service for user tracking and state saving
		watchRoomService.removeUserFromRoom(roomId, username);
	}

	/**
	 * Helper method to remove user from room (for cleanup)
	 */
	public void removeUserFromRoom(String roomId, String username) {
		Set<String> usersInRoom = roomUsers.get(roomId);
		if (usersInRoom != null && usersInRoom.remove(username)) {
			System.out.println("🧹 Cleaned up user " + username + " from room " + roomId);
			if (usersInRoom.isEmpty()) {
				roomUsers.remove(roomId);
				System.out.println("🧹 Cleaned up empty room: " + roomId);
			}
		}
	}

	/**
	 * Get server-controlled video position for manual sync
	 */
	@GetMapping("/api/rooms/{roomId}/server-position")
	public ResponseEntity<Map<String, Object>> getServerPosition(@PathVariable String roomId) {
		try {
			Long serverPosition = watchRoomService.getServerVideoPosition(roomId);
			Integer playbackState = watchRoomService.getRoomPlaybackState(roomId);
			int activeUsers = watchRoomService.getActiveUserCount(roomId);

			return ResponseEntity.ok(Map.of(
				"success", true,
				"positionMs", serverPosition,
				"playbackState", playbackState,
				"activeUsers", activeUsers,
				"timestamp", System.currentTimeMillis()
			));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	/**
	 * Handle user pause action (only action users can perform)
	 */
	@PostMapping("/api/rooms/{roomId}/pause")
	public ResponseEntity<Map<String, Object>> handleUserPause(
			@PathVariable String roomId,
			@RequestBody Map<String, Object> request) {
		try {
			String username = (String) request.get("username");
			Long positionMs = ((Number) request.get("positionMs")).longValue();

			if (username == null || positionMs == null) {
				return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"error", "Username and position are required"
				));
			}

			watchRoomService.handleUserPause(roomId, positionMs);

			return ResponseEntity.ok(Map.of(
				"success", true,
				"message", "Video paused successfully"
			));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}

	/**
	 * Update server video position (called periodically when video is playing)
	 * Only host can update position
	 */
	@PostMapping("/api/rooms/{roomId}/update-position")
	public ResponseEntity<Map<String, Object>> updateVideoPosition(
			@PathVariable String roomId,
			@RequestBody Map<String, Object> request) {
		try {
			Long positionMs = ((Number) request.get("positionMs")).longValue();
			Boolean isHost = (Boolean) request.get("isHost");

			if (positionMs == null) {
				return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"error", "Position is required"
				));
			}

			watchRoomService.updateServerVideoPosition(roomId, positionMs, isHost);

			if (isHost != null && isHost) {
				return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "Host position updated successfully"
				));
			} else {
				return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "Non-host position update ignored (as expected)"
				));
			}
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"error", e.getMessage()
			));
		}
	}
}
