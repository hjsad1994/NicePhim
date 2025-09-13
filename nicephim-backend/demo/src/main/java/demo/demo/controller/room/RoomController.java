package demo.demo.controller.room;

import java.util.Map;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class RoomController {

	// Host controls: play/pause/seek
	@MessageMapping("/room/{roomId}/control")
	@SendTo("/topic/room.{roomId}")
	public Map<String, Object> handleControl(
			@DestinationVariable String roomId,
			Map<String, Object> message) {
		
		// Add timestamp for drift calculation
		message.put("timestamp", System.currentTimeMillis());
		return message;
	}

	// Chat messages
	@MessageMapping("/room/{roomId}/chat")
	@SendTo("/topic/room.{roomId}")
	public Map<String, Object> handleChat(
			@DestinationVariable String roomId,
			Map<String, Object> message) {
		
		message.put("timestamp", System.currentTimeMillis());
		message.put("type", "chat");
		return message;
	}

	// User join/leave notifications
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
