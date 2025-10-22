# 🔌 WebSocket Code Examples - Subscribe & Publish

## 📡 FRONTEND - Subscribe & Publish

### **1. SUBSCRIBE - Nhận messages từ server**

**File:** `nicephim-frontend/src/components/video/WatchTogetherPlayer.tsx`  
**Location:** Lines 354-368

```typescript
// Subscribe to room messages
try {
  const topic = `/topic/room.${roomId}`;
  console.log('📨 Subscribing to topic:', topic);
  
  const subscription = client.subscribe(topic, (message) => {
    console.log('📨 Received message from room topic:', topic);
    try {
      const data = JSON.parse(message.body);
      console.log('📋 Parsed message data:', data);
      handleRoomMessage(data);
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  });
  
  console.log('✅ Subscription successful:', subscription.id);
  setRoomSubscription(subscription);
} catch (error) {
  console.error('❌ Error subscribing to room topic:', error);
}
```

**Giải thích:**
- `client.subscribe(topic, callback)` - Subscribe to topic
- `topic = "/topic/room.{roomId}"` - Room-specific topic
- `callback(message)` - Function được gọi khi nhận message
- `message.body` - JSON string chứa data
- `JSON.parse()` - Parse thành object
- `handleRoomMessage(data)` - Process message

---

### **2. PUBLISH - Gửi messages đến server**

#### **A. Publish Chat Message**

**File:** `nicephim-frontend/src/components/video/WatchTogetherPlayer.tsx`  
**Location:** Lines 510-542

```typescript
const sendChat = useCallback((message: string) => {
  console.log('💬 sendChat called:', {
    message,
    currentUser,
    roomId,
    connected: isWebSocketConnected(),
    stompClientExists: !!stompClient,
    stompClientConnected: stompClient?.connected
  });

  if (isWebSocketConnected()) {
    const chatMessage = {
      type: 'chat',
      message,
      username: currentUser,
      timestamp: Date.now()
    };
    console.log('💬 Sending chat message:', chatMessage);
    console.log('💬 Destination:', `/app/room/${roomId}/chat`);

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

**Giải thích:**
- `stompClient.publish({ destination, body })` - Send message
- `destination = "/app/room/{roomId}/chat"` - Target endpoint
- `body = JSON.stringify(object)` - Message payload as JSON string
- Backend nhận tại `@MessageMapping("/room/{roomId}/chat")`

---

#### **B. Publish Join Notification**

**File:** `nicephim-frontend/src/components/video/WatchTogetherPlayer.tsx`  
**Location:** Lines 544-587

```typescript
const sendJoin = useCallback((client: Client) => {
  // Prevent duplicate joins
  if (hasJoinedRoom.current) {
    console.log('🔄 Already joined room, skipping duplicate join');
    return;
  }

  console.log('📋 Sending join message...');
  console.log('📋 Username:', currentUser);
  console.log('📋 Room ID:', roomId);
  console.log('📋 Client connected:', client.connected);

  if (client.connected) {
    try {
      client.publish({
        destination: `/app/room/${roomId}/join`,
        body: JSON.stringify({
          username: currentUser
        })
      });
      
      hasJoinedRoom.current = true; // Mark as joined
      console.log('✅ Join message sent successfully');
    } catch (error) {
      console.error('❌ Error sending join message:', error);
    }
  } else {
    console.error('❌ Cannot send join message - client not connected');
  }
}, [roomId, currentUser]);
```

**Giải thích:**
- `client.publish()` - Có thể dùng client trực tiếp hoặc `stompClient.publish()`
- `destination = "/app/room/{roomId}/join"` - Join endpoint
- `body` chỉ chứa username (minimal payload)
- Backend nhận tại `@MessageMapping("/room/{roomId}/join")`

---

#### **C. Publish Leave Notification**

**File:** `nicephim-frontend/src/components/video/WatchTogetherPlayer.tsx`  
**Location:** Lines 406-417 (in cleanup function)

```typescript
// Cleanup on unmount
return () => {
  console.log('🧹 Cleaning up WebSocket connection...');
  if (client && client.connected) {
    if (roomSubscription) {
      console.log('🔄 Unsubscribing from room subscription on cleanup');
      roomSubscription.unsubscribe();
      setRoomSubscription(null);
    }

    // Send leave message before disconnecting
    if (isConnected && roomId && currentUser) {
      try {
        client.publish({
          destination: `/app/room/${roomId}/leave`,
          body: JSON.stringify({
            username: currentUser
          })
        });
        console.log('👋 Leave message sent');
      } catch (error) {
        console.error('❌ Error sending leave message:', error);
      }
    }

    // Deactivate client
    client.deactivate();
    setStompClient(null);
    setIsConnected(false);
  }
};
```

**Giải thích:**
- Chạy khi component unmount (user rời trang)
- `client.publish()` - Send leave notification
- `destination = "/app/room/{roomId}/leave"` - Leave endpoint
- Backend cleanup user tracking, KHÔNG broadcast

---

## 📡 BACKEND - MessageMapping & SendTo

### **1. Receive & Broadcast: Chat Handler**

**File:** `nicephim-backend/demo/src/main/java/demo/demo/controller/room/RoomController.java`  
**Location:** Lines 178-189

```java
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
```

**Giải thích:**
- `@MessageMapping("/room/{roomId}/chat")` - **NHẬN** (subscribe) message từ client gửi đến `/app/room/{roomId}/chat`
- `@SendTo("/topic/room.{roomId}")` - **GỬI** (publish) message đến all clients subscribe `/topic/room.{roomId}`
- `@DestinationVariable String roomId` - Extract roomId từ URL
- `return message` - Object này sẽ được broadcast

**Flow:**
```
Client A publish → /app/room/123/chat
    ↓
@MessageMapping receives
    ↓
handleChat() adds timestamp & type
    ↓
@SendTo broadcasts → /topic/room.123
    ↓
All clients subscribed to /topic/room.123 receive
```

---

### **2. Receive & Broadcast: Join Handler**

**File:** `nicephim-backend/demo/src/main/java/demo/demo/controller/room/RoomController.java`  
**Location:** Lines 195-219

```java
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
```

**Giải thích:**
- `@MessageMapping("/room/{roomId}/join")` - Nhận join message
- `watchRoomService.addUserToRoom()` - Track user, return false if duplicate
- `if (userAdded)` - Chỉ broadcast nếu user mới
- `else` - Return system message (không broadcast duplicate)
- `@SendTo` - Broadcast result

---

### **3. Receive Only: Leave Handler**

**File:** `nicephim-backend/demo/src/main/java/demo/demo/controller/room/RoomController.java`  
**Location:** Lines 224-232

```java
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
```

**Giải thích:**
- `@MessageMapping("/room/{roomId}/leave")` - Nhận leave message
- **KHÔNG có @SendTo** - Không broadcast (silent cleanup)
- `watchRoomService.removeUserFromRoom()` - Remove user, save state
- Return type `void` - Không send response

---

## 📊 Summary Table - Subscribe & Publish Locations

### **FRONTEND Subscribe:**

| Code | File | Line | Topic | Purpose |
|------|------|------|-------|---------|
| `client.subscribe("/topic/room.{roomId}", callback)` | WatchTogetherPlayer.tsx | 354-368 | `/topic/room.{roomId}` | Nhận tất cả messages từ room |

### **FRONTEND Publish:**

| Code | File | Line | Destination | Purpose |
|------|------|------|-------------|---------|
| `stompClient.publish({ destination: "/app/room/{roomId}/chat", ... })` | WatchTogetherPlayer.tsx | 528-531 | `/app/room/{roomId}/chat` | Gửi chat message |
| `client.publish({ destination: "/app/room/{roomId}/join", ... })` | WatchTogetherPlayer.tsx | 555-561 | `/app/room/{roomId}/join` | Gửi join notification |
| `client.publish({ destination: "/app/room/{roomId}/leave", ... })` | WatchTogetherPlayer.tsx | 410-416 | `/app/room/{roomId}/leave` | Gửi leave notification |

### **BACKEND Receive (MessageMapping):**

| Code | File | Line | Endpoint | Purpose |
|------|------|------|----------|---------|
| `@MessageMapping("/room/{roomId}/chat")` | RoomController.java | 178 | `/app/room/{roomId}/chat` | Nhận chat từ client |
| `@MessageMapping("/room/{roomId}/join")` | RoomController.java | 195 | `/app/room/{roomId}/join` | Nhận join từ client |
| `@MessageMapping("/room/{roomId}/leave")` | RoomController.java | 224 | `/app/room/{roomId}/leave` | Nhận leave từ client |

### **BACKEND Broadcast (SendTo):**

| Code | File | Line | Topic | Purpose |
|------|------|------|-------|---------|
| `@SendTo("/topic/room.{roomId}")` | RoomController.java | 179 | `/topic/room.{roomId}` | Broadcast chat message |
| `@SendTo("/topic/room.{roomId}")` | RoomController.java | 196 | `/topic/room.{roomId}` | Broadcast join notification |
| *(No SendTo)* | RoomController.java | 224 | - | Leave không broadcast |

---

## 🎯 Complete Code Flow Examples

### **Example 1: User A sends chat "Hello"**

```
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND (User A)                                                 │
│ WatchTogetherPlayer.tsx:528-531                                   │
├──────────────────────────────────────────────────────────────────┤
│ stompClient.publish({                                             │
│   destination: "/app/room/123/chat",                              │
│   body: JSON.stringify({                                          │
│     type: "chat",                                                 │
│     message: "Hello",                                             │
│     username: "UserA",                                            │
│     timestamp: 1729593600000                                      │
│   })                                                              │
│ });                                                               │
└──────────────────────────────────────────────────────────────────┘
                            ↓ WebSocket
┌──────────────────────────────────────────────────────────────────┐
│ BACKEND                                                           │
│ RoomController.java:178-189                                       │
├──────────────────────────────────────────────────────────────────┤
│ @MessageMapping("/room/{roomId}/chat")  ← NHẬN TẠI ĐÂY          │
│ @SendTo("/topic/room.{roomId}")         ← GỬI ĐẾN ĐÂY           │
│ public Map<String, Object> handleChat(...) {                     │
│     message.put("timestamp", currentTimeMillis());               │
│     message.put("type", "chat");                                 │
│     return message; // ← Object này được broadcast               │
│ }                                                                 │
└──────────────────────────────────────────────────────────────────┘
                            ↓ Broadcast
┌──────────────────────────────────────────────────────────────────┐
│ ALL CLIENTS subscribed to /topic/room.123                        │
│ WatchTogetherPlayer.tsx:354-368                                  │
├──────────────────────────────────────────────────────────────────┤
│ client.subscribe("/topic/room.123", (message) => {              │
│   const data = JSON.parse(message.body);                        │
│   // data = {                                                     │
│   //   type: "chat",                                             │
│   //   message: "Hello",                                         │
│   //   username: "UserA",                                        │
│   //   timestamp: 1729593600000                                  │
│   // }                                                            │
│   handleRoomMessage(data);                                       │
│ });                                                               │
│                                                                   │
│ handleRoomMessage → case 'chat' → setChatMessages(...)           │
│ → UI updates: "UserA: Hello"                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

### **Example 2: User B joins room**

```
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND (User B)                                                 │
│ WatchTogetherPlayer.tsx:555-561                                   │
├──────────────────────────────────────────────────────────────────┤
│ const sendJoin = (client: Client) => {                           │
│   client.publish({                                               │
│     destination: "/app/room/123/join",                           │
│     body: JSON.stringify({                                       │
│       username: "UserB"                                          │
│     })                                                           │
│   });                                                            │
│ };                                                               │
└──────────────────────────────────────────────────────────────────┘
                            ↓ WebSocket
┌──────────────────────────────────────────────────────────────────┐
│ BACKEND                                                           │
│ RoomController.java:195-219                                       │
├──────────────────────────────────────────────────────────────────┤
│ @MessageMapping("/room/{roomId}/join")  ← NHẬN                  │
│ @SendTo("/topic/room.{roomId}")         ← BROADCAST              │
│ public Map<String, Object> handleJoin(...) {                    │
│     String username = message.get("username");                  │
│     boolean added = watchRoomService.addUserToRoom(roomId, username); │
│                                                                  │
│     if (added) {                                                │
│         message.put("timestamp", currentTimeMillis());          │
│         message.put("type", "user_join");                       │
│         return message; // ← Broadcast này                      │
│     } else {                                                    │
│         return Map.of(                                          │
│             "type", "system",                                   │
│             "message", "duplicate_join"                         │
│         ); // ← Hoặc này nếu duplicate                          │
│     }                                                           │
│ }                                                               │
│     ↓                                                            │
│ WatchRoomService.java:389-421                                   │
│ public boolean addUserToRoom(String roomId, String username) { │
│     roomUsers.putIfAbsent(roomId, ConcurrentHashMap.newKeySet()); │
│     Set<String> users = roomUsers.get(roomId);                 │
│                                                                  │
│     if (users.contains(username)) {                            │
│         return false; // ← Already joined                      │
│     }                                                           │
│     users.add(username);                                        │
│     return true; // ← New user added                           │
│ }                                                               │
└──────────────────────────────────────────────────────────────────┘
                            ↓ Broadcast
┌──────────────────────────────────────────────────────────────────┐
│ ALL CLIENTS (including User A, User B, User C)                   │
│ WatchTogetherPlayer.tsx:439-551                                  │
├──────────────────────────────────────────────────────────────────┤
│ handleRoomMessage(data)                                          │
│     ↓                                                             │
│ case 'user_join':                                                │
│     setChatMessages([...prev, {                                  │
│         username: 'system',                                      │
│         message: 'UserB đã tham gia phòng',                     │
│         timestamp: data.timestamp,                               │
│         type: 'system'                                           │
│     }]);                                                         │
│     ↓                                                             │
│ UI shows: "UserB đã tham gia phòng" (system message)            │
└──────────────────────────────────────────────────────────────────┘
```

---

### **Example 3: User C leaves room**

```
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND (User C)                                                 │
│ WatchTogetherPlayer.tsx:410-416                                   │
├──────────────────────────────────────────────────────────────────┤
│ // Component unmount / user closes tab                           │
│ return () => {                                                   │
│   client.publish({                                               │
│     destination: "/app/room/123/leave",                          │
│     body: JSON.stringify({                                       │
│       username: "UserC"                                          │
│     })                                                           │
│   });                                                            │
│   client.deactivate();                                           │
│ };                                                               │
└──────────────────────────────────────────────────────────────────┘
                            ↓ WebSocket
┌──────────────────────────────────────────────────────────────────┐
│ BACKEND                                                           │
│ RoomController.java:224-232                                       │
├──────────────────────────────────────────────────────────────────┤
│ @MessageMapping("/room/{roomId}/leave")  ← NHẬN                 │
│ ⚠️ KHÔNG CÓ @SendTo (silent cleanup)                            │
│ public void handleLeave(...) {                                   │
│     String username = message.get("username");                  │
│     watchRoomService.removeUserFromRoom(roomId, username);      │
│     // ← Không return, không broadcast                          │
│ }                                                                │
│     ↓                                                             │
│ WatchRoomService.java:428-465                                    │
│ public void removeUserFromRoom(String roomId, String username) {│
│     Set<String> users = roomUsers.get(roomId);                  │
│     users.remove(username);                                     │
│                                                                  │
│     if (users.isEmpty()) {                                      │
│         saveRoomStateOnEmpty(roomId);                           │
│         roomUsers.remove(roomId);                               │
│     }                                                            │
│ }                                                                │
└──────────────────────────────────────────────────────────────────┘
                            ↓ NO BROADCAST
┌──────────────────────────────────────────────────────────────────┐
│ OTHER CLIENTS                                                     │
├──────────────────────────────────────────────────────────────────┤
│ ⚠️ Không nhận leave notification                                 │
│ (Silent cleanup - không có thông báo "UserC đã rời phòng")      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Differences: Subscribe vs Publish

### **📥 SUBSCRIBE (Nhận):**

**Frontend:**
```typescript
client.subscribe("/topic/room.123", (message) => {
  const data = JSON.parse(message.body);
  handleRoomMessage(data);
});
```
- **Passive** - Chờ messages từ server
- **Callback** - Function được gọi khi có message mới
- **Topic pattern** - `/topic/room.{roomId}` (broker prefix)

**Backend:**
```java
@MessageMapping("/room/{roomId}/chat")
public Map<String, Object> handleChat(...) { ... }
```
- **Passive** - Chờ messages từ client
- **App prefix** - Client send đến `/app/room/{roomId}/chat`
- **Spring auto-maps** - Method được gọi khi có message

---

### **📤 PUBLISH (Gửi):**

**Frontend:**
```typescript
stompClient.publish({
  destination: "/app/room/123/chat",
  body: JSON.stringify({ message: "Hello" })
});
```
- **Active** - Chủ động gửi message
- **Destination** - Target endpoint trên server
- **Body** - JSON string payload

**Backend:**
```java
@SendTo("/topic/room.{roomId}")
public Map<String, Object> handleChat(...) {
  return message; // This gets broadcasted
}
```
- **Active** - Gửi message đến all subscribers
- **Topic** - `/topic/room.{roomId}` (broker)
- **Return value** - Object được serialize và broadcast

---

## 💡 Analogy:

```
SUBSCRIBE = Mở radio để NGHE
PUBLISH  = Nói vào microphone để GỬI

Frontend subscribe "/topic/room.123" 
  = Mở radio nghe kênh "room 123"
  
Frontend publish "/app/room/123/chat"
  = Nói vào mic gửi đến "chat của room 123"
  
Backend @MessageMapping
  = Server nghe (listen) message từ client
  
Backend @SendTo
  = Server phát (broadcast) message đến all clients
```

---

## 📝 Quick Reference:

**Frontend Client Code:**
- **Connect:** `new SockJS()` + `new Client()` + `client.activate()`
- **Subscribe:** `client.subscribe(topic, callback)` - Lines 354-368
- **Publish Chat:** `stompClient.publish({ destination: "/app/room/{roomId}/chat", ... })` - Lines 528-531
- **Publish Join:** `client.publish({ destination: "/app/room/{roomId}/join", ... })` - Lines 555-561
- **Publish Leave:** `client.publish({ destination: "/app/room/{roomId}/leave", ... })` - Lines 410-416

**Backend Handler Code:**
- **Receive Chat:** `@MessageMapping("/room/{roomId}/chat")` - Line 178
- **Broadcast Chat:** `@SendTo("/topic/room.{roomId}")` - Line 179
- **Receive Join:** `@MessageMapping("/room/{roomId}/join")` - Line 195
- **Broadcast Join:** `@SendTo("/topic/room.{roomId}")` - Line 196
- **Receive Leave:** `@MessageMapping("/room/{roomId}/leave")` - Line 224
- **No Broadcast:** *(No @SendTo for leave)*

🎬💬✨
