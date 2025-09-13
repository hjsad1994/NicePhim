# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Spring Boot-based backend for a video streaming platform called "nicephim". The application supports video upload/processing, user authentication, and real-time collaborative viewing features through WebSocket connections.

## Common Commands

### Build and Run
- **Build the project**: `cd demo && ./mvnw clean compile`
- **Run the application**: `cd demo && ./mvnw spring-boot:run`
- **Run tests**: `cd demo && ./mvnw test`
- **Package as JAR**: `cd demo && ./mvnw clean package`

### Development
- **Clean build**: `cd demo && ./mvnw clean`
- **Verify dependencies**: `cd demo && ./mvnw dependency:tree`
- **Run with profile**: `cd demo && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`

## Architecture Overview

### Core Technologies
- **Spring Boot 3.1.5** with Java 17
- **SQL Server** database with Flyway migrations
- **WebSocket/STOMP** for real-time communication
- **HLS video streaming** with FFmpeg processing
- **Spring Security** for password hashing
- **Jakarta Validation** for request validation

### Main Components

#### Controllers
- `VideoController`: Handles video upload, processing, and status tracking
- `RoomController`: WebSocket-based real-time room control (play/pause/chat)
- `RoomSSEController`: Server-Sent Events for room updates
- `AuthController`: User registration with validation
- `DbHealthController`: Database connectivity health checks

#### Services
- `VideoService`: Core video processing logic using FFmpeg
- `AuthService`: User registration and password hashing

#### Data Layer
- `UserRepository`: JDBC-based user data access
- Flyway migrations in `src/main/resources/db/migration/`

### Video Processing Pipeline
1. Videos uploaded to `/api/videos` (multipart form data)
2. Files stored in configured directory (`D:/videos_demo` by default)
3. FFmpeg processes videos into HLS format
4. Processed videos served from `D:/media` directory
5. Status tracking through `/api/videos/{videoId}/status`

### Real-time Features
- **WebSocket rooms**: `/room/{roomId}/control`, `/room/{roomId}/chat`, `/room/{roomId}/join`
- **SSE endpoints**: Alternative to WebSocket for room updates
- **Collaborative viewing**: Synchronized play/pause/seek controls

## Configuration

### Database
- SQL Server connection configured in `application.properties`
- Connection pool: HikariCP (max 10 connections)
- Migrations: Flyway enabled with baseline-on-migrate

### Media Processing
- Upload directory: `media.upload.dir`
- HLS output: `media.hls.dir`
- FFmpeg path: `media.ffmpeg.path`
- Static resources mapped to serve HLS files directly

### CORS
- Configured in `WebCorsConfig` for cross-origin requests
- WebSocket CORS configured in `WebSocketConfig`

## Development Notes

### File Structure
- Main application: `demo/src/main/java/demo/demo/`
- Static files: `demo/src/main/resources/static/` (test pages included)
- Database migrations: `demo/src/main/resources/db/migration/`

### Testing
- Test files in `src/test/java/demo/demo/`
- Spring Boot test configurations available

### Static Resources
The application includes several HTML test pages:
- `debug.html`, `simple-player.html`, `video-player.html`
- `watch-together.html`, `watch-together-sse.html`

## External Dependencies

Ensure these are available in the development environment:
- **FFmpeg**: Required for video processing (configured path in properties)
- **SQL Server**: Database server running and accessible
- **Java 17**: Required runtime version