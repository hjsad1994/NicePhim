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

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class RoomController {

	@Autowired
	private WatchRoomService watchRoomService;

	
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

			// Generate user ID for username
			UUID userId = UUID.nameUUIDFromBytes(username.getBytes());

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

	// WebSocket message handlers (existing functionality)

	/**
	 * Host controls: play/pause (seek disabled in broadcast mode)
	 */
	@MessageMapping("/room/{roomId}/control")
	@SendTo("/topic/room.{roomId}")
	public Map<String, Object> handleControl(
			@DestinationVariable String roomId,
			Map<String, Object> message) {

		// Add timestamp for drift calculation
		message.put("timestamp", System.currentTimeMillis());

		// For broadcast mode, only allow play/pause, disable seek
		String action = (String) message.get("action");
		if ("seek".equals(action)) {
			message.put("error", "Seeking is disabled in broadcast mode");
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
	 * User join/leave notifications
	 */
	@MessageMapping("/room/{roomId}/join")
	@SendTo("/topic/room.{roomId}")
	public Map<String, Object> handleJoin(
			@DestinationVariable String roomId,
			Map<String, Object> message) {

		message.put("timestamp", System.currentTimeMillis());
		message.put("type", "user_join");
		return message;
	}
}
