# NicePhim - System Workflow Diagrams

## 1. Video Upload Workflow

```mermaid
flowchart TD
    Start([Người dùng chọn file video]) --> Upload[Upload file lên server]
    Upload --> CreateVideo{VideoService.handleUpload}
    
    CreateVideo --> GenID[Tạo UUID cho video]
    GenID --> SaveFile[Lưu file vào thư mục upload<br/>D:/videos_demo/videoId.mp4]
    SaveFile --> CreateDir[Tạo thư mục HLS<br/>D:/media/videoId/]
    CreateDir --> SetStatus[Set status = PROCESSING]
    
    SetStatus --> CheckFFmpeg{FFmpeg<br/>có sẵn?}
    
    CheckFFmpeg -->|Có| StartFFmpeg[Khởi động FFmpeg Thread]
    CheckFFmpeg -->|Không| CreateMock[Tạo mock HLS files]
    
    StartFFmpeg --> FFmpegProcess[FFmpeg xử lý video]
    FFmpegProcess --> CreateVariants[Tạo 3 variants HLS]
    CreateVariants --> V1080[1080p - 5000kbps<br/>v0/prog.m3u8]
    CreateVariants --> V720[720p - 3000kbps<br/>v1/prog.m3u8]
    CreateVariants --> V360[360p - 1000kbps<br/>v2/prog.m3u8]
    
    V1080 --> CreateMaster[Tạo master.m3u8]
    V720 --> CreateMaster
    V360 --> CreateMaster
    
    CreateMaster --> FFmpegDone{FFmpeg<br/>exit code?}
    FFmpegDone -->|0 Success| SetReady[Set status = READY]
    FFmpegDone -->|Error| SetFailed[Set status = FAILED]
    
    CreateMock --> MockMaster[Tạo master.m3u8<br/>và variant playlists]
    MockMaster --> MockReady[Set status = READY]
    
    SetReady --> SaveDB[Lưu vào database<br/>video_id, hls_url, video_status]
    MockReady --> SaveDB
    SetFailed --> SaveDB
    
    SaveDB --> ReturnResult[Trả về response<br/>videoId, hlsUrl, status]
    ReturnResult --> End([Hoàn tất])
    
    style Start fill:#4ade80
    style End fill:#22c55e
    style SetReady fill:#3b82f6
    style SetFailed fill:#ef4444
    style CreateMaster fill:#8b5cf6
```

## 2. Video Loading & Playback Workflow

```mermaid
flowchart TD
    Start([Người dùng vào trang xem phim]) --> LoadPage[Load Movie Page]
    LoadPage --> FetchMovie[API: GET /movies/:slug]
    FetchMovie --> GetMovieData[Nhận movie data<br/>hlsUrl, title, poster, etc.]
    
    GetMovieData --> InitPlayer[Khởi tạo SimpleHLSPlayer]
    InitPlayer --> CheckSupport{Trình duyệt<br/>hỗ trợ HLS?}
    
    CheckSupport -->|HLS.js supported| CreateHLS[Khởi tạo HLS.js instance]
    CheckSupport -->|Native HLS| UseNative[Dùng native HLS<br/>Safari]
    
    CreateHLS --> LoadManifest[Load master.m3u8]
    LoadManifest --> ParseManifest[Parse manifest]
    ParseManifest --> GetLevels[Lấy available levels<br/>360p, 480p, 720p, 1080p]
    
    GetLevels --> SetDefault[Set default quality<br/>Highest available: 1080p]
    SetDefault --> AttachVideo[Attach media to video element]
    AttachVideo --> PlayerReady[Video Player sẵn sàng]
    
    UseNative --> NativeLoad[Load HLS trực tiếp<br/>video.src = hlsUrl]
    NativeLoad --> PlayerReady
    
    PlayerReady --> ShowControls[Hiển thị video controls]
    
    %% User Interactions
    ShowControls --> UserAction{User thao tác?}
    
    %% Play/Pause
    UserAction -->|Click Play/Pause| TogglePlay[Toggle play/pause state]
    TogglePlay --> UpdatePlayState[Cập nhật isPlaying state]
    UpdatePlayState --> UserAction
    
    %% Quality Selection
    UserAction -->|Click Quality Button| ShowQualityMenu[Hiện menu chất lượng<br/>360p, 480p, 720p, 1080p]
    ShowQualityMenu --> UserSelectQuality[User chọn quality]
    UserSelectQuality --> SwitchQuality[HLS.js: hls.currentLevel = index]
    SwitchQuality --> LoadNewLevel[Load video ở quality mới]
    LoadNewLevel --> UpdateQualityDisplay[Cập nhật display: currentQuality]
    UpdateQualityDisplay --> UserAction
    
    %% Speed Selection
    UserAction -->|Click Speed Button| ShowSpeedMenu[Hiện menu tốc độ<br/>0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x]
    ShowSpeedMenu --> UserSelectSpeed[User chọn speed]
    UserSelectSpeed --> SetPlaybackRate[video.playbackRate = rate]
    SetPlaybackRate --> UpdateSpeedDisplay[Cập nhật display: playbackRate]
    UpdateSpeedDisplay --> UserAction
    
    %% Seeking
    UserAction -->|Drag Progress Bar| SeekVideo[video.currentTime = newTime]
    SeekVideo --> UpdateTimeDisplay[Cập nhật currentTime display]
    UpdateTimeDisplay --> UserAction
    
    %% Seek Forward/Backward
    UserAction -->|Click Seek +10s| SeekForward[currentTime += 10s]
    UserAction -->|Click Seek -10s| SeekBackward[currentTime -= 10s]
    SeekForward --> UpdateTimeDisplay
    SeekBackward --> UpdateTimeDisplay
    
    %% Volume Control
    UserAction -->|Adjust Volume| SetVolume[video.volume = newVolume]
    SetVolume --> UpdateVolumeDisplay[Cập nhật volume slider]
    UpdateVolumeDisplay --> UserAction
    
    %% Fullscreen
    UserAction -->|Double Click/Fullscreen| ToggleFullscreen[Toggle fullscreen mode]
    ToggleFullscreen --> UserAction
    
    %% Auto-hide controls
    UserAction -->|Mouse Move| ShowControlsTemp[Hiện controls]
    ShowControlsTemp --> SetTimeout[Set timeout 3s]
    SetTimeout --> HideControls[Ẩn controls sau 3s]
    HideControls --> UserAction
    
    style Start fill:#4ade80
    style PlayerReady fill:#3b82f6
    style ShowControls fill:#8b5cf6
    style SwitchQuality fill:#f59e0b
    style SetPlaybackRate fill:#10b981
```

## 3. Watch Together (Xem Chung) Workflow

```mermaid
flowchart TD
    Start([Người dùng tạo phòng xem chung]) --> CheckAuth{User đã<br/>đăng nhập?}
    
    CheckAuth -->|Có| GetUsername[Lấy username từ localStorage]
    CheckAuth -->|Không| RequireAuth[Yêu cầu đăng nhập]
    RequireAuth --> End1([Kết thúc])
    
    GetUsername --> CreateRoom[API: POST /api/rooms/create]
    CreateRoom --> GenRoomID[Tạo roomId UUID]
    GenRoomID --> GenInviteCode[Tạo invite code 8 ký tự]
    GenInviteCode --> CreateUser[createOrUpdateSimpleUser<br/>Tạo/lấy user UUID]
    
    CreateUser --> SaveRoom[Lưu room vào database<br/>room_id, name, created_by, movie_id]
    SaveRoom --> ReturnRoom[Trả về room data<br/>roomId, inviteCode, creator]
    
    ReturnRoom --> HostJoin[Host vào phòng<br/>URL: /xem-chung/phong/:roomId]
    
    %% WebSocket Connection
    HostJoin --> InitWS[Khởi tạo WebSocket<br/>SockJS + STOMP]
    InitWS --> ConnectWS[Connect to ws://localhost:8080/ws]
    ConnectWS --> WSConnected{WebSocket<br/>connected?}
    
    WSConnected -->|Không| RetryWS[Retry sau 5s]
    RetryWS --> ConnectWS
    
    WSConnected -->|Có| Subscribe[Subscribe to /topic/room.roomId]
    Subscribe --> SendJoin[Gửi join message<br/>/app/room/:roomId/join]
    SendJoin --> BroadcastJoin[Broadcast join notification<br/>cho tất cả users trong phòng]
    
    %% Viewer joins
    BroadcastJoin --> ViewerJoin[Viewer vào phòng<br/>qua invite code/link]
    ViewerJoin --> ViewerWS[Viewer connect WebSocket]
    ViewerWS --> ViewerSubscribe[Subscribe to room topic]
    ViewerSubscribe --> ViewerSendJoin[Gửi join message]
    ViewerSendJoin --> AllConnected[Tất cả users connected]
    
    %% Host Detection
    AllConnected --> CheckHost{So sánh<br/>currentUser UUID<br/>với roomCreator?}
    CheckHost -->|Match| SetHost[Set isHost = true<br/>Hiện 👑 Chủ phòng]
    CheckHost -->|Not Match| SetViewer[Set isHost = false<br/>Hiện sync button]
    
    SetHost --> LoadVideo[Load video với HLS URL]
    SetViewer --> LoadVideo
    
    %% Video Playback Control
    LoadVideo --> VideoReady[Video player ready]
    VideoReady --> UserControl{User điều khiển?}
    
    %% Host Controls
    UserControl -->|Host Play| HostPlay[Host: video.play]
    HostPlay --> SendControlPlay[WebSocket: /app/room/:roomId/control<br/>action: play, time: currentTime]
    SendControlPlay --> BroadcastPlay[Broadcast đến viewers]
    BroadcastPlay --> ViewerAutoPlay[Viewers: auto video.play]
    ViewerAutoPlay --> ShowPlayNotif[Chat: Tự động đồng bộ - bắt đầu phát]
    ShowPlayNotif --> UserControl
    
    UserControl -->|Host Pause| HostPause[Host: video.pause]
    HostPause --> SendControlPause[WebSocket: control<br/>action: pause]
    SendControlPause --> UpdateDB[Backend: update playback_state = 2]
    UpdateDB --> BroadcastPause[Broadcast đến viewers]
    BroadcastPause --> ViewerAutoPause[Viewers: auto video.pause]
    ViewerAutoPause --> ShowPauseNotif[Chat: Tự động đồng bộ - tạm dừng]
    ShowPauseNotif --> UserControl
    
    UserControl -->|Host Seek| HostSeek[Host: video.currentTime = time]
    HostSeek --> SendControlSeek[WebSocket: control<br/>action: seek, time: newTime]
    SendControlSeek --> BroadcastSeek[Broadcast đến viewers]
    BroadcastSeek --> ViewerAutoSeek[Viewers: auto seek to time]
    ViewerAutoSeek --> ShowSeekNotif[Chat: Tự động đồng bộ - tua đến time]
    ShowSeekNotif --> UserControl
    
    %% Viewer Controls
    UserControl -->|Viewer Play/Pause| ViewerControl[Viewer: control video locally]
    ViewerControl --> ViewerUpdate[Cập nhật local state]
    ViewerUpdate --> UserControl
    
    UserControl -->|Viewer Seek| ViewerSeek[Viewer: seek video locally]
    ViewerSeek --> ViewerUpdate
    
    %% Sync Button (Viewers only)
    UserControl -->|Viewer Click Sync| StartSync[Fetch: GET /api/rooms/:roomId/server-position]
    StartSync --> GetServerPos[Nhận server position<br/>positionMs, playbackState]
    GetServerPos --> SyncPosition[video.currentTime = positionMs / 1000]
    SyncPosition --> SyncState{playbackState?}
    
    SyncState -->|1 - Playing| SyncPlay[video.play]
    SyncState -->|2 - Paused| SyncPause[video.pause]
    
    SyncPlay --> ShowSyncMsg[Chat: Đồng bộ với chủ phòng - position + đang phát]
    SyncPause --> ShowSyncMsg
    ShowSyncMsg --> UserControl
    
    %% Host Position Updates
    UserControl -->|Host video playing| HostPositionUpdate[Host: Gửi position update<br/>mỗi 2 giây]
    HostPositionUpdate --> UpdateServerPos[POST /api/rooms/:roomId/update-position<br/>positionMs, isHost: true]
    UpdateServerPos --> SavePosition[Backend: update current_time_ms]
    SavePosition --> UserControl
    
    %% Chat System
    UserControl -->|User gửi chat| ChatInput[User nhập message]
    ChatInput --> SendChat[WebSocket: /app/room/:roomId/chat<br/>message, username, timestamp]
    SendChat --> BroadcastChat[Broadcast đến all users]
    BroadcastChat --> DisplayChat[Hiển thị message trong chat panel]
    DisplayChat --> UserControl
    
    %% Leave Room
    UserControl -->|User rời phòng| SendLeave[WebSocket: /app/room/:roomId/leave]
    SendLeave --> RemoveUser[Backend: removeUserFromRoom]
    RemoveUser --> CheckEmpty{Room<br/>còn users?}
    
    CheckEmpty -->|Có| BroadcastLeave[Broadcast leave notification]
    CheckEmpty -->|Không| SaveRoomState[Lưu room state<br/>position, playback_state]
    
    BroadcastLeave --> UserControl
    SaveRoomState --> CleanupRoom[Cleanup room từ memory]
    CleanupRoom --> End2([Kết thúc])
    
    style Start fill:#4ade80
    style End1 fill:#6b7280
    style End2 fill:#22c55e
    style SetHost fill:#f59e0b
    style SetViewer fill:#3b82f6
    style BroadcastPlay fill:#10b981
    style BroadcastPause fill:#ef4444
    style BroadcastSeek fill:#8b5cf6
    style ShowSyncMsg fill:#06b6d4
```

## Giải thích chi tiết

### 1. Video Upload
- User upload file video qua frontend
- Backend tạo UUID cho video và lưu file gốc
- FFmpeg xử lý video thành 3 variants HLS (360p, 720p, 1080p)
- Tạo master.m3u8 playlist cho adaptive streaming
- Lưu metadata vào database (video_id, hls_url, video_status)

### 2. Video Loading & Playback
- Frontend load movie data từ API
- Khởi tạo HLS.js player với adaptive streaming
- User có thể chọn chất lượng video (360p - 1080p)
- User có thể điều chỉnh tốc độ phát (0.5x - 2x)
- Controls tự động ẩn/hiện sau 3 giây

### 3. Watch Together
- Host tạo phòng với roomId và inviteCode
- WebSocket kết nối cho real-time communication
- Host điều khiển video → broadcast đến viewers
- Viewers tự động sync theo host (play/pause/seek)
- Viewers có thể dùng sync button để đồng bộ thủ công
- Chat system cho giao tiếp trong phòng
- Host position được cập nhật mỗi 2 giây
