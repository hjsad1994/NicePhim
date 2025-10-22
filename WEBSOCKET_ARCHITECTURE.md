# 🔌 WebSocket Architecture - NicePhim Watch Together

## 📊 Overview

NicePhim sử dụng **WebSocket (STOMP over SockJS)** cho tính năng xem phim cùng nhau (Watch Together). Người dùng có thể:
- Tạo phòng xem phim
- Chat real-time
- Đồng bộ video (play/pause/seek) với host
- Thông báo join/leave

---

## 🏗️ Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Next.js)                     │
├─────────────────────────────────────────────────────────────────────┤
│  Page: /xem-chung/phong/[roomId]/page.tsx                           │
│    ↓                                                                 │
│  Component: WatchTogetherPlayer.tsx                                 │
│    ↓                                                                 │
│  WebSocket Client Setup:                                            │
│    • SockJS: new SockJS('http://localhost:8080/ws')                 │
│    • STOMP Client: @stomp/stompjs                                   │
│    • Subscribe: /topic/room.{roomId}                                │
│    • Publish: /app/room/{roomId}/control|chat|join|leave           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓↑ WebSocket/SockJS
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Spring Boot)                         │
├─────────────────────────────────────────────────────────────────────┤
│  Config: WebSocketConfig.java                                       │
│    • Endpoint: /ws (with SockJS)                                    │
│    • Broker: /topic, /queue                                         │
│    • App prefix: /app                                               │
│    ↓                                                                 │
│  Controller: RoomController.java                                    │
│    • @MessageMapping("/room/{roomId}/control")                      │
│    • @MessageMapping("/room/{roomId}/chat")                         │
│    • @MessageMapping("/room/{roomId}/join")                         │
│    • @MessageMapping("/room/{roomId}/leave")                        │
│    • @SendTo("/topic/room.{roomId}") → broadcast to all            │
│    ↓                                                                 │
│  Service: WatchRoomService.java                                     │
│    • addUserToRoom() - track users                                  │
│    • removeUserFromRoom() - cleanup                                 │
│    • calculateCurrentPosition() - sync position                     │
│    ↓                                                                 │
│  Database: SQL Server (watch_rooms table)                           │
│    • room_id, name, created_by                                      │
│    • movie_id, current_time_ms, playback_state                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📡 WebSocket Endpoints

### 1. **Connection Endpoint**
```
ws://localhost:8080/ws (with SockJS fallback)
```

### 2. **Subscribe Topics (Receive)**
```
/topic/room.{roomId}
```
- Nhận tất cả messages từ phòng: control, chat, join/leave

### 3. **Publish Destinations (Send)**

#### a. Control Messages
```
Destination: /app/room/{roomId}/control
Payload: {
  type: "control",
  action: "play" | "pause" | "seek",
  time: number (seconds),
  username: string,
  timestamp: number
}
```

#### b. Chat Messages
```
Destination: /app/room/{roomId}/chat
Payload: {
  type: "chat",
  message: string,
  username: string,
  timestamp: number
}
```

#### c. Join Room
```
Destination: /app/room/{roomId}/join
Payload: {
  username: string,
  timestamp: number
}
```

#### d. Leave Room
```
Destination: /app/room/{roomId}/leave
Payload: {
  username: string,
  timestamp: number
}
```

---

## 🔧 Backend Implementation

### **1. WebSocketConfig.java**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}
```

### **2. RoomController.java WebSocket Handlers**

#### Control Handler
```java
@MessageMapping("/room/{roomId}/control")
@SendTo("/topic/room.{roomId}")
public Map<String, Object> handleControl(
        @DestinationVariable String roomId,
        Map<String, Object> message) {
    
    String action = (String) message.get("action");
    String username = (String) message.get("username");
    
    // Add timestamp
    message.put("timestamp", System.currentTimeMillis());
    
    // Handle sync requests
    if ("sync".equals(action)) {
        Long currentPosition = watchRoomService.calculateCurrentPosition(roomId);
        message.put("currentPosition", currentPosition);
        message.put("type", "sync_response");
    }
    
    return message; // Broadcast to all subscribers
}
```

#### Chat Handler
```java
@MessageMapping("/room/{roomId}/chat")
@SendTo("/topic/room.{roomId}")
public Map<String, Object> handleChat(
        @DestinationVariable String roomId,
        Map<String, Object> message) {
    
    message.put("timestamp", System.currentTimeMillis());
    message.put("type", "chat");
    return message;
}
```

#### Join Handler
```java
@MessageMapping("/room/{roomId}/join")
@SendTo("/topic/room.{roomId}")
public Map<String, Object> handleJoin(
        @DestinationVariable String roomId,
        Map<String, Object> message) {
    
    String username = (String) message.get("username");
    boolean userAdded = watchRoomService.addUserToRoom(roomId, username);
    
    if (userAdded) {
        message.put("timestamp", System.currentTimeMillis());
        message.put("type", "user_join");
        return message;
    } else {
        // Duplicate join, return system message
        return Map.of(
            "type", "system",
            "message", "duplicate_join",
            "timestamp", System.currentTimeMillis()
        );
    }
}
```

#### Leave Handler
```java
@MessageMapping("/room/{roomId}/leave")
public void handleLeave(
        @DestinationVariable String roomId,
        Map<String, Object> message) {
    
    String username = (String) message.get("username");
    watchRoomService.removeUserFromRoom(roomId, username);
    // No broadcast needed
}
```

---

## 🎨 Frontend Implementation

### **1. Connection Setup (WatchTogetherPlayer.tsx)**

```typescript
// Initialize WebSocket
const socket = new SockJS('http://localhost:8080/ws');
const client = new Client({
  webSocketFactory: () => socket,
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000
});

client.onConnect = () => {
  console.log('✅ WebSocket connected');
  setIsConnected(true);
  setStompClient(client);
  
  // Subscribe to room topic
  const subscription = client.subscribe(
    `/topic/room.${roomId}`,
    (message) => {
      const data = JSON.parse(message.body);
      handleRoomMessage(data);
    }
  );
  
  // Send join message
  sendJoin(client);
};

client.activate();
```

### **2. Send Messages**

```typescript
// Send control (play/pause/seek)
const sendControl = (action: 'play' | 'pause' | 'seek', time: number) => {
  stompClient.publish({
    destination: `/app/room/${roomId}/control`,
    body: JSON.stringify({
      type: 'control',
      action,
      time,
      username: currentUser,
      timestamp: Date.now()
    })
  });
};

// Send chat
const sendChat = (message: string) => {
  stompClient.publish({
    destination: `/app/room/${roomId}/chat`,
    body: JSON.stringify({
      type: 'chat',
      message,
      username: currentUser,
      timestamp: Date.now()
    })
  });
};

// Send join
const sendJoin = (client: Client) => {
  client.publish({
    destination: `/app/room/${roomId}/join`,
    body: JSON.stringify({
      username: currentUser,
      timestamp: Date.now()
    })
  });
};
```

### **3. Handle Received Messages**

```typescript
const handleRoomMessage = (data: MessageData) => {
  switch(data.type) {
    case 'control':
      // Only non-host processes host's control
      if (data.username === roomCreator && !isHost) {
        if (data.action === 'play') video.play();
        if (data.action === 'pause') video.pause();
        if (data.action === 'seek') video.currentTime = data.time;
      }
      break;
      
    case 'chat':
      setChatMessages(prev => [...prev, {
        username: data.username,
        message: data.message,
        timestamp: data.timestamp
      }]);
      break;
      
    case 'user_join':
      setChatMessages(prev => [...prev, {
        username: 'system',
        message: `${data.username} đã tham gia phòng`,
        timestamp: data.timestamp
      }]);
      break;
  }
};
```

---

## 📄 Pages Using WebSocket

### **1. Watch Together Room**
```
Path: /xem-chung/phong/[roomId]/page.tsx
Component: WatchTogetherPlayer.tsx
Features:
  ✅ Real-time chat
  ✅ Host control sync (play/pause/seek)
  ✅ User join/leave notifications
  ✅ Manual sync button
```

### **2. Room Management**
```
Path: /xem-chung/quan-ly/page.tsx
Features:
  ✅ Create room
  ✅ List rooms
  ✅ Delete room
Note: No WebSocket (REST API only)
```

### **3. Create Room**
```
Path: /xem-chung/tao-moi/page.tsx
Features:
  ✅ Create room form
Note: No WebSocket (REST API only)
```

---

## 🔄 Message Flow Examples

### **Example 1: Host Plays Video**
```
1. Host clicks play button
   ↓
2. Frontend: video.play() + sendControl('play', currentTime)
   ↓
3. WebSocket: /app/room/{roomId}/control
   ↓
4. Backend: RoomController.handleControl()
   ↓
5. Broadcast: /topic/room.{roomId} → all subscribers
   ↓
6. Non-host clients: receive message → auto play video
```

### **Example 2: User Sends Chat**
```
1. User types message and sends
   ↓
2. Frontend: sendChat(message)
   ↓
3. WebSocket: /app/room/{roomId}/chat
   ↓
4. Backend: RoomController.handleChat()
   ↓
5. Broadcast: /topic/room.{roomId} → all subscribers
   ↓
6. All clients: receive message → display in chat
```

### **Example 3: User Joins Room**
```
1. User enters room page
   ↓
2. Frontend: WebSocket connects → sendJoin()
   ↓
3. WebSocket: /app/room/{roomId}/join
   ↓
4. Backend: RoomController.handleJoin()
   ↓
5. WatchRoomService.addUserToRoom() → track user
   ↓
6. Broadcast: /topic/room.{roomId} → all subscribers
   ↓
7. All clients: show "{username} đã tham gia phòng"
```

---

## 🗄️ Database Integration

### **watch_rooms Table**
```sql
CREATE TABLE watch_rooms (
    room_id           UNIQUEIDENTIFIER PRIMARY KEY,
    name              NVARCHAR(255) NOT NULL,
    created_by        UNIQUEIDENTIFIER NOT NULL,
    movie_id          UNIQUEIDENTIFIER NULL,
    episode_id        UNIQUEIDENTIFIER NULL,
    current_time_ms   BIGINT DEFAULT 0,
    playback_state    TINYINT DEFAULT 0,  -- 0=stopped, 1=playing
    playback_rate     DECIMAL(3,2) DEFAULT 1.0,
    created_at        DATETIME2 DEFAULT GETDATE(),
    updated_at        DATETIME2 DEFAULT GETDATE()
);
```

**WatchRoomService tracks:**
- Active users per room (in-memory)
- Last update time (rate limiting)
- Room state (database)

---

## 🔐 Security & Best Practices

### **1. CORS Configuration**
```java
@CrossOrigin(origins = "http://localhost:3000")
// Production: specific origins only
```

### **2. Rate Limiting**
```java
private static final long MIN_UPDATE_INTERVAL = 1000; // 1 second
// Prevents database spam from frequent position updates
```

### **3. Duplicate Prevention**
```java
// Backend: addUserToRoom() returns false if already joined
// Frontend: processedMessages.current (Set) for deduplication
```

### **4. Connection Management**
```typescript
// Auto reconnect on disconnect
reconnectDelay: 5000

// Heartbeat to keep connection alive
heartbeatIncoming: 4000,
heartbeatOutgoing: 4000

// Cleanup on unmount
useEffect(() => {
  return () => {
    client.deactivate();
  };
}, []);
```

---

## 📦 Dependencies

### **Backend**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### **Frontend**
```json
{
  "dependencies": {
    "@stomp/stompjs": "^7.2.0",
    "sockjs-client": "^1.6.1"
  }
}
```

---

## 🚀 Testing WebSocket

### **Manual Test Steps**

1. **Start Backend**
   ```bash
   cd nicephim-backend/demo
   ./mvnw spring-boot:run
   ```

2. **Start Frontend**
   ```bash
   cd nicephim-frontend
   npm run dev
   ```

3. **Create Room**
   - Navigate to: http://localhost:3000/xem-chung/tao-moi
   - Fill form and create room

4. **Join Room (Multiple Tabs)**
   - Tab 1: http://localhost:3000/xem-chung/phong/{roomId}?username=User1&isHost=true
   - Tab 2: http://localhost:3000/xem-chung/phong/{roomId}?username=User2&isHost=false

5. **Test Features**
   - ✅ Chat: Type message in Tab 1 → appears in Tab 2
   - ✅ Host Control: Play video in Tab 1 → auto plays in Tab 2
   - ✅ Join Notification: Tab 2 joins → Tab 1 sees notification

### **Console Logs to Check**
```
Frontend:
  🔌 Initializing WebSocket connection...
  ✅ WebSocket connected successfully
  📨 Subscribing to topic: /topic/room.{roomId}
  ✅ Subscription successful

Backend:
  👥 User {username} joined room {roomId}. Total users: {count}
  💾 Room state update for {roomId}: {rows} rows affected
```

---

## 🎯 Summary

✅ **Technology**: WebSocket (STOMP over SockJS)  
✅ **Endpoint**: `ws://localhost:8080/ws`  
✅ **Protocol**: STOMP (Simple Text Oriented Messaging Protocol)  
✅ **Fallback**: SockJS (for browsers without WebSocket support)  
✅ **Backend**: Spring WebSocket + STOMP  
✅ **Frontend**: `@stomp/stompjs` + `sockjs-client`  
✅ **Features**: Real-time chat, Host control sync, Join/leave notifications  
✅ **Used In**: `/xem-chung/phong/[roomId]` (WatchTogetherPlayer component)

**RoomSSEController.java** đã xóa vì không được sử dụng (SSE alternative).
