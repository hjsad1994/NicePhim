# 🗺️ WebSocket Usage Map - Watch Together & Chat

## 📍 Backend (Spring Boot)

### **1. Configuration**
**File:** `nicephim-backend/demo/src/main/java/demo/demo/config/WebSocketConfig.java`

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for /topic and /queue
        config.enableSimpleBroker("/topic", "/queue");
        // Set application destination prefix
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register /ws endpoint, allow all origins for demo
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}
```

**Chức năng:**
- ✅ Enable WebSocket endpoint tại `ws://localhost:8080/ws`
- ✅ Enable SockJS fallback (cho browsers không hỗ trợ WebSocket)
- ✅ Set application prefix `/app` cho incoming messages
- ✅ Set broker prefix `/topic` cho outgoing messages (broadcast)

---

### **2. WebSocket Handlers**
**File:** `nicephim-backend/demo/src/main/java/demo/demo/controller/room/RoomController.java`

#### **Handler 1: Chat Messages**
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

**Location:** Line 178-189
**Chức năng:**
- Nhận chat message từ client qua `/app/room/{roomId}/chat`
- Add timestamp và type
- Broadcast đến tất cả clients subscribe `/topic/room.{roomId}`

---

#### **Handler 2: User Join Notifications**
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
        Map<String, Object> emptyMessage = new HashMap<>();
        emptyMessage.put("type", "system");
        emptyMessage.put("message", "duplicate_join");
        emptyMessage.put("timestamp", System.currentTimeMillis());
        return emptyMessage;
    }
}
```

**Location:** Line 195-219
**Chức năng:**
- Nhận join notification từ client
- Track user trong `WatchRoomService.addUserToRoom()`
- Prevent duplicate join notifications
- Broadcast join message đến all clients

---

#### **Handler 3: User Leave Cleanup**
```java
@MessageMapping("/room/{roomId}/leave")
public void handleLeave(
        @DestinationVariable String roomId,
        Map<String, Object> message) {

    String username = (String) message.get("username");
    watchRoomService.removeUserFromRoom(roomId, username);
}
```

**Location:** Line 224-232
**Chức năng:**
- Nhận leave notification từ client
- Remove user từ room tracking
- Save room state nếu room empty
- **KHÔNG broadcast** (silent cleanup)

---

### **3. Service Layer**
**File:** `nicephim-backend/demo/src/main/java/demo/demo/services/room/WatchRoomService.java`

#### **User Tracking Methods:**

```java
// Track active users per room (in-memory)
private Map<String, Set<String>> roomUsers = new ConcurrentHashMap<>();

// Add user to room
public boolean addUserToRoom(String roomId, String username) {
    roomUsers.putIfAbsent(roomId, ConcurrentHashMap.newKeySet());
    Set<String> users = roomUsers.get(roomId);
    
    if (users.contains(username)) {
        return false; // Already in room
    }
    
    users.add(username);
    return true; // Added successfully
}

// Remove user from room
public void removeUserFromRoom(String roomId, String username) {
    Set<String> users = roomUsers.get(roomId);
    if (users != null) {
        users.remove(username);
        
        if (users.isEmpty()) {
            saveRoomStateOnEmpty(roomId);
            roomUsers.remove(roomId);
        }
    }
}

// Get active user count
public int getActiveUserCount(String roomId) {
    Set<String> users = roomUsers.get(roomId);
    return users != null ? users.size() : 0;
}
```

**Location:** Lines 389-465
**Chức năng:**
- Track active users in-memory (ConcurrentHashMap)
- Prevent duplicate join notifications
- Auto-save room state when empty
- Provide user count for UI

---

## 📍 Frontend (React/TypeScript)

### **1. WebSocket Client Setup**
**File:** `nicephim-frontend/src/components/video/WatchTogetherPlayer.tsx`

#### **Connection Initialization:**

```typescript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// State
const [stompClient, setStompClient] = useState<Client | null>(null);
const [isConnected, setIsConnected] = useState(false);
const [roomSubscription, setRoomSubscription] = useState<any>(null);

// Initialize WebSocket connection
useEffect(() => {
  if (!roomId || !currentUser || connectionAttempted.current) {
    return;
  }

  console.log('🔌 Initializing WebSocket connection...');
  connectionAttempted.current = true;

  // Create SockJS connection
  const socket = new SockJS('http://localhost:8080/ws');
  
  // Create STOMP client
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      console.log('🔌 STOMP Debug:', str);
    }
  });

  // Connection success handler
  client.onConnect = () => {
    console.log('✅ WebSocket connected successfully');
    setIsConnected(true);
    setStompClient(client);

    // Subscribe to room topic
    const topic = `/topic/room.${roomId}`;
    console.log('📨 Subscribing to topic:', topic);
    
    const subscription = client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        handleRoomMessage(data);
      } catch (error) {
        console.error('❌ Error parsing message:', error);
      }
    });
    
    setRoomSubscription(subscription);

    // Send join message
    sendJoin(client);
  };

  // Error handlers
  client.onStompError = (frame) => {
    console.error('❌ WebSocket STOMP error:', frame);
    setIsConnected(false);
  };

  client.onWebSocketError = (error) => {
    console.error('❌ WebSocket connection error:', error);
    setIsConnected(false);
  };

  client.onWebSocketClose = () => {
    console.log('🔌 WebSocket connection closed');
    setIsConnected(false);
  };

  // Activate client
  client.activate();

  // Cleanup on unmount
  return () => {
    console.log('🧹 Cleaning up WebSocket connection...');
    if (client && client.connected) {
      if (roomSubscription) {
        roomSubscription.unsubscribe();
      }
      
      // Send leave message
      client.publish({
        destination: `/app/room/${roomId}/leave`,
        body: JSON.stringify({
          username: currentUser,
          timestamp: Date.now()
        })
      });
      
      client.deactivate();
    }
  };
}, [roomId, currentUser]);
```

**Location:** Lines 319-436
**Chức năng:**
- Tạo SockJS connection tới `http://localhost:8080/ws`
- Wrap với STOMP protocol client
- Subscribe to `/topic/room.{roomId}` để nhận messages
- Auto send join message khi connected
- Auto send leave message khi unmount
- Handle reconnection và errors

---

### **2. Message Handlers**
**File:** `nicephim-frontend/src/components/video/WatchTogetherPlayer.tsx`

#### **Receive Message Handler:**

```typescript
const handleRoomMessage = useCallback((data: unknown) => {
  console.log('📨 Received WebSocket message:', data);

  const messageData = data as ChatMessage | { type: string; [key: string]: unknown };

  // Deduplication
  const messageId = `${messageData.type}_${(messageData as any).timestamp}_${(messageData as any).username}`;
  if (processedMessages.current.has(messageId)) {
    console.log('🔄 Duplicate message detected, skipping');
    return;
  }
  processedMessages.current.add(messageId);

  switch(messageData.type) {
    case 'system':
      // Handle system messages
      if ((messageData as any).message === 'duplicate_join') {
        return;
      }
      break;
      
    case 'chat':
      console.log('💬 Chat message received:', messageData);
      const chatData = messageData as ChatMessage;
      
      setChatMessages(prev => [...prev, {
        username: chatData.username,
        message: chatData.message,
        timestamp: chatData.timestamp,
        type: 'chat'
      }]);
      break;
      
    case 'user_join':
      console.log('👋 User joined:', (messageData as any).username);
      
      setChatMessages(prev => [...prev, {
        username: 'system',
        message: `${(messageData as any).username} đã tham gia phòng`,
        timestamp: (messageData as any).timestamp,
        type: 'system'
      }]);
      break;
  }
}, [currentUser, roomCreator, isHost]);
```

**Location:** Lines 439-551
**Chức năng:**
- Parse incoming WebSocket messages
- Deduplication (prevent duplicate notifications)
- Route messages by type: chat, user_join, system
- Update UI state (chatMessages)

---

### **3. Send Message Functions**
**File:** `nicephim-frontend/src/components/video/WatchTogetherPlayer.tsx`

#### **Send Chat Message:**

```typescript
const sendChat = useCallback((message: string) => {
  console.log('💬 sendChat called:', message);

  if (isWebSocketConnected()) {
    const chatMessage = {
      type: 'chat',
      message,
      username: currentUser,
      timestamp: Date.now()
    };
    
    console.log('💬 Sending chat message:', chatMessage);

    stompClient.publish({
      destination: `/app/room/${roomId}/chat`,
      body: JSON.stringify(chatMessage)
    });
    
    console.log('💬 Chat message sent successfully');
  } else {
    console.error('💬 Cannot send chat - WebSocket not connected');
  }
}, [stompClient, isConnected, roomId, currentUser]);
```

**Location:** Lines 543-563
**Chức năng:**
- Check WebSocket connected
- Create chat message object
- Publish to `/app/room/{roomId}/chat`
- Backend broadcasts to all clients

---

#### **Send Join Message:**

```typescript
const sendJoin = useCallback((client: Client) => {
  if (hasJoinedRoom.current) {
    console.log('🔄 Already joined room, skipping duplicate join');
    return;
  }

  console.log('📋 Sending join message...');

  if (client.connected) {
    try {
      client.publish({
        destination: `/app/room/${roomId}/join`,
        body: JSON.stringify({
          username: currentUser,
          timestamp: Date.now()
        })
      });
      
      hasJoinedRoom.current = true;
      console.log('✅ Join message sent');
    } catch (error) {
      console.error('❌ Error sending join message:', error);
    }
  }
}, [roomId, currentUser]);
```

**Location:** Lines 565-586
**Chức năng:**
- Prevent duplicate join (using ref flag)
- Publish to `/app/room/{roomId}/join`
- Backend tracks user and broadcasts to all

---

### **4. UI Integration**
**File:** `nicephim-frontend/src/components/video/WatchTogetherPlayer.tsx`

#### **Chat Input:**

```typescript
<div className="flex gap-2">
  <input
    type="text"
    value={chatInput}
    onChange={(e) => setChatInput(e.target.value)}
    onKeyPress={(e) => {
      if (e.key === 'Enter' && chatInput.trim()) {
        sendChat(chatInput);
        setChatInput('');
      }
    }}
    placeholder="Nhập tin nhắn..."
    className="flex-1 px-3 py-2 rounded bg-black/50 text-white border border-white/20"
  />
  <button
    onClick={() => {
      if (chatInput.trim()) {
        sendChat(chatInput);
        setChatInput('');
      }
    }}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Gửi
  </button>
</div>
```

**Location:** Lines 1262-1286
**Chức năng:**
- Text input for chat
- Enter key or button click → `sendChat()`
- Clear input after send

---

#### **Chat Messages Display:**

```typescript
<div className="flex-1 overflow-y-auto space-y-2 p-4">
  {chatMessages.map((msg, index) => (
    <div
      key={index}
      className={`p-2 rounded ${
        msg.type === 'system' 
          ? 'bg-gray-700/50 text-gray-300 text-sm italic' 
          : 'bg-black/50'
      }`}
    >
      {msg.type === 'chat' ? (
        <>
          <span className="font-bold text-blue-400">{msg.username}: </span>
          <span className="text-white">{msg.message}</span>
        </>
      ) : (
        <span className="text-gray-300">{msg.message}</span>
      )}
      <div className="text-xs text-gray-500 mt-1">
        {new Date(msg.timestamp).toLocaleTimeString()}
      </div>
    </div>
  ))}
</div>
```

**Location:** Lines 1233-1255
**Chức năng:**
- Display all chat messages
- Different styles for chat vs system messages
- Show username, message, timestamp

---

#### **Connection Status Indicator:**

```typescript
<div className={`px-2 py-1 rounded text-xs ${
  stompClient?.connected ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
}`}>
  {stompClient?.connected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
</div>
```

**Location:** Lines 1169-1173
**Chức năng:**
- Show real-time connection status
- Green = connected, Red = disconnected

---

### **5. Page Integration**
**File:** `nicephim-frontend/src/app/xem-chung/phong/[roomId]/page.tsx`

```typescript
'use client';

import WatchTogetherPlayer from '@/components/video/WatchTogetherPlayer';

function RoomContent() {
  const params = useParams();
  const roomId = params.roomId as string;
  
  // ... load room data ...
  
  return (
    <WatchTogetherPlayer
      videoUrl={roomData.hlsUrl}
      roomId={roomId}
      currentUser={user.username}
      isHost={isHost}
      // ... other props ...
    />
  );
}
```

**Location:** Full page at `/xem-chung/phong/[roomId]/page.tsx`
**Route:** `http://localhost:3000/xem-chung/phong/{roomId}`
**Chức năng:**
- Load room data from backend
- Pass roomId, currentUser, isHost to WatchTogetherPlayer
- WatchTogetherPlayer auto-init WebSocket

---

## 🔄 Message Flow Diagram

### **Chat Message Flow:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USER A                                    │
├─────────────────────────────────────────────────────────────────────┤
│  WatchTogetherPlayer.tsx                                            │
│  1. User types: "Hello!"                                            │
│  2. Click Send or press Enter                                       │
│  3. sendChat("Hello!")                                              │
│     ↓                                                                │
│  4. stompClient.publish({                                           │
│       destination: "/app/room/123/chat",                            │
│       body: JSON.stringify({                                        │
│         type: "chat",                                               │
│         message: "Hello!",                                          │
│         username: "UserA",                                          │
│         timestamp: 1234567890                                       │
│       })                                                            │
│     })                                                              │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ WebSocket
┌─────────────────────────────────────────────────────────────────────┐
│                          BACKEND                                     │
├─────────────────────────────────────────────────────────────────────┤
│  RoomController.java                                                │
│  @MessageMapping("/room/{roomId}/chat")                            │
│  @SendTo("/topic/room.{roomId}")                                   │
│  public Map<String, Object> handleChat(...) {                      │
│      message.put("timestamp", currentTimeMillis());                │
│      message.put("type", "chat");                                  │
│      return message; // Broadcast to all                           │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ Broadcast to /topic/room.123
┌─────────────────────────────────────────────────────────────────────┐
│                         ALL USERS IN ROOM                            │
├─────────────────────────────────────────────────────────────────────┤
│  WatchTogetherPlayer.tsx                                            │
│  Subscribed to: /topic/room.123                                     │
│     ↓                                                                │
│  handleRoomMessage(data)                                            │
│  → Parse message                                                    │
│  → Add to chatMessages state                                        │
│  → UI updates with new message:                                     │
│     "UserA: Hello!"                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

### **Join Notification Flow:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                            NEW USER                                  │
├─────────────────────────────────────────────────────────────────────┤
│  1. Navigate to /xem-chung/phong/123                               │
│  2. WatchTogetherPlayer mounts                                      │
│  3. WebSocket connects                                              │
│  4. client.onConnect = () => {                                      │
│       sendJoin(client);                                             │
│     }                                                               │
│     ↓                                                                │
│  5. client.publish({                                                │
│       destination: "/app/room/123/join",                            │
│       body: JSON.stringify({                                        │
│         username: "UserB",                                          │
│         timestamp: 1234567890                                       │
│       })                                                            │
│     })                                                              │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ WebSocket
┌─────────────────────────────────────────────────────────────────────┐
│                          BACKEND                                     │
├─────────────────────────────────────────────────────────────────────┤
│  RoomController.java                                                │
│  @MessageMapping("/room/{roomId}/join")                            │
│  public Map<String, Object> handleJoin(...) {                      │
│      String username = message.get("username");                    │
│      boolean added = watchRoomService.addUserToRoom(roomId, username); │
│                                                                     │
│      if (added) {                                                  │
│          message.put("type", "user_join");                         │
│          return message; // Broadcast                              │
│      } else {                                                      │
│          return duplicate_join; // Skip broadcast                  │
│      }                                                             │
│  }                                                                  │
│     ↓                                                                │
│  WatchRoomService.java                                             │
│  - Track user in roomUsers Map                                      │
│  - Return false if already joined                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ Broadcast
┌─────────────────────────────────────────────────────────────────────┐
│                      ALL USERS IN ROOM                               │
├─────────────────────────────────────────────────────────────────────┤
│  handleRoomMessage(data)                                            │
│  case 'user_join':                                                  │
│      setChatMessages([...prev, {                                    │
│          username: 'system',                                        │
│          message: 'UserB đã tham gia phòng'                        │
│      }])                                                            │
│  → UI shows: "UserB đã tham gia phòng"                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Dependencies

### **Backend (pom.xml):**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### **Frontend (package.json):**
```json
{
  "dependencies": {
    "@stomp/stompjs": "^7.2.0",
    "sockjs-client": "^1.6.1"
  }
}
```

---

## 🎯 Summary

### **Backend WebSocket Files:**
```
nicephim-backend/demo/src/main/java/demo/demo/
├── config/
│   └── WebSocketConfig.java              ← Config: endpoint /ws, broker /topic
├── controller/room/
│   └── RoomController.java                ← Handlers: chat, join, leave
└── services/room/
    └── WatchRoomService.java              ← Service: user tracking, room state
```

### **Frontend WebSocket Files:**
```
nicephim-frontend/src/
├── components/video/
│   └── WatchTogetherPlayer.tsx            ← Client: connect, subscribe, send/receive
└── app/xem-chung/phong/[roomId]/
    └── page.tsx                           ← Page: integrate player with routing
```

### **WebSocket Endpoints:**
| Type | Endpoint | Description |
|------|----------|-------------|
| **Connect** | `ws://localhost:8080/ws` | WebSocket connection endpoint |
| **Subscribe** | `/topic/room.{roomId}` | Receive all room messages |
| **Publish** | `/app/room/{roomId}/chat` | Send chat message |
| **Publish** | `/app/room/{roomId}/join` | Send join notification |
| **Publish** | `/app/room/{roomId}/leave` | Send leave notification |

### **Features:**
- ✅ Real-time chat
- ✅ User join/leave notifications
- ✅ Connection status indicator
- ✅ Duplicate message prevention
- ✅ Auto reconnection
- ✅ Room user tracking
- ❌ ~~Auto play/pause sync~~ (đã xóa)

**Watch Together & Chat hoàn toàn dựa trên WebSocket (STOMP over SockJS)!** 🎬💬✨
