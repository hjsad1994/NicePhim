package demo.demo.controller.room;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/room")
public class RoomSSEController {

	// Store active SSE connections per room
	private final Map<String, CopyOnWriteArrayList<SseEmitter>> roomConnections = new ConcurrentHashMap<>();
	
	// Store room state
	private final Map<String, Map<String, Object>> roomState = new ConcurrentHashMap<>();

	@GetMapping(value = "/{roomId}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public SseEmitter subscribeToRoom(@PathVariable String roomId) {
		SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
		
		// Add to room connections
		roomConnections.computeIfAbsent(roomId, k -> new CopyOnWriteArrayList<>()).add(emitter);
		
		// Handle connection close
		emitter.onCompletion(() -> {
			roomConnections.get(roomId).remove(emitter);
		});
		
		emitter.onTimeout(() -> {
			roomConnections.get(roomId).remove(emitter);
		});
		
		emitter.onError((ex) -> {
			roomConnections.get(roomId).remove(emitter);
		});
		
		// Send current room state if exists
		Map<String, Object> state = roomState.get(roomId);
		if (state != null) {
			try {
				emitter.send(SseEmitter.event()
					.name("state")
					.data(state));
			} catch (Exception e) {
				// Ignore
			}
		}
		
		return emitter;
	}

	@PostMapping("/{roomId}/control")
	public Map<String, Object> sendControl(@PathVariable String roomId, @RequestBody Map<String, Object> message) {
		message.put("timestamp", System.currentTimeMillis());
		message.put("type", "control");
		message.put("roomId", roomId);
		
		// Update room state
		roomState.put(roomId, message);
		
		// Broadcast to all connections in room
		broadcastToRoom(roomId, message);
		
		return Map.of("success", true, "message", "Control sent");
	}

	@PostMapping("/{roomId}/chat")
	public Map<String, Object> sendChat(@PathVariable String roomId, @RequestBody Map<String, Object> message) {
		message.put("timestamp", System.currentTimeMillis());
		message.put("type", "chat");
		message.put("roomId", roomId);
		
		// Broadcast to all connections in room
		broadcastToRoom(roomId, message);
		
		return Map.of("success", true, "message", "Chat sent");
	}

	@PostMapping("/{roomId}/join")
	public Map<String, Object> joinRoom(@PathVariable String roomId, @RequestBody Map<String, Object> message) {
		message.put("timestamp", System.currentTimeMillis());
		message.put("type", "user_join");
		message.put("roomId", roomId);
		
		// Broadcast to all connections in room
		broadcastToRoom(roomId, message);
		
		return Map.of("success", true, "message", "Joined room");
	}

	private void broadcastToRoom(String roomId, Map<String, Object> message) {
		CopyOnWriteArrayList<SseEmitter> connections = roomConnections.get(roomId);
		if (connections != null) {
			connections.removeIf(emitter -> {
				try {
					emitter.send(SseEmitter.event()
						.name("message")
						.data(message));
					return false;
				} catch (Exception e) {
					return true; // Remove failed connection
				}
			});
		}
	}
}



