# Technical Context: NicePhim Platform

## Architecture Overview
- **Frontend**: Next.js 15 with App Router
- **Backend**: Spring Boot 3.1.5 with Java 17
- **Database**: Microsoft SQL Server with Flyway migrations
- **Real-time**: WebSocket with STOMP protocol
- **Video Processing**: FFmpeg for HLS conversion

## Frontend Stack
- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Headless UI, Heroicons
- **State Management**: React hooks and context
- **Video Player**: React Player, HLS.js for adaptive streaming

## Backend Stack
- **Framework**: Spring Boot 3.1.5
- **Language**: Java 17
- **Database**: SQL Server with JDBC
- **Security**: Spring Security with BCrypt
- **Validation**: Jakarta Validation
- **Migration**: Flyway 9.16.0
- **WebSocket**: Spring WebSocket with STOMP
- **Authentication**: Complete login/register system
- **Password Security**: BCrypt hashing with salt

## Database Schema
- **Users**: Authentication and profile data
- **Movies**: Content metadata and relationships (includes video_id, hls_url, video_status fields)
- **Genres**: Movie categorization system
- **Movie_Genres**: Many-to-many relationship between movies and genres
- **Episodes**: Series episode management
- **Assets**: Video file storage references
- **Watch Rooms**: Collaborative viewing sessions
- **Comments**: User interactions and feedback
- **Video Renditions**: HLS streaming quality variants
- **Video Player Components**: SimpleHLSPlayer, HLSVideoPlayer, VideoPlayer wrapper

## Development Environment
- **Database**: SQL Server on KARIU:1435
- **Media Storage**: Local file system (D:/videos_demo, D:/media)
- **FFmpeg**: C:/ProgramData/chocolatey/bin/ffmpeg.exe
- **CORS**: Configured for cross-origin requests
- **Upload Limits**: Spring Boot configured for 500MB file uploads
- **Video Processing**: FFmpeg creating HLS streams with multiple quality variants
- **Video Player Libraries**: hls.js for adaptive streaming, @types/hls.js for TypeScript support

## Key Dependencies
- Spring Boot Web, WebSocket, Security
- Microsoft SQL Server JDBC Driver
- Flyway for database migrations
- BCrypt for password hashing
- Next.js with TypeScript and Tailwind
- Jakarta Validation for input validation
- Spring JDBC for database operations
- hls.js for adaptive video streaming
- @types/hls.js for TypeScript support

## Authentication System
- **Registration**: Complete with validation and error handling
- **Login**: Complete with both backend and frontend implementation
- **Password Security**: BCrypt hashing with salt rounds
- **User Lookup**: Supports both username and email
- **Error Handling**: Comprehensive validation with Vietnamese messages

## Movie Management System
- **MovieService**: Complete CRUD operations for movie management
- **Database Operations**: Full integration with MovieRepository
- **Error Handling**: Vietnamese error messages and proper exception handling
- **Validation**: Input validation for all movie operations
- **Response Mapping**: Proper DTO conversion for API responses

## Genre Management System
- **GenreController**: REST API endpoints for genre CRUD operations
- **GenreService**: Business logic layer with validation and error handling
- **GenreRepository**: Database operations with JdbcTemplate
- **Genre Model**: UUID-based entity with name field
- **DTOs**: CreateGenreRequest, UpdateGenreRequest, GenreResponse
- **Frontend Integration**: Complete admin interface with create, read, update, delete
- **Error Handling**: Enhanced frontend error handling with warning vs error classification
- **Validation**: Server-side validation with Vietnamese error messages

## Development Environment & Standards
- **Database Migration**: Flyway automatic migration execution during Spring Boot startup
- **Migration Management**: V2 migration successfully applied with video fields (video_id, hls_url, video_status)
- **Error Resolution**: Temporary feature disabling during migration issues, then re-enabling
- **Cursor Rules**: Comprehensive development guidelines and standards
- **Memory Bank**: Complete documentation system with hierarchical structure
- **Code Quality**: TypeScript interfaces, Java best practices, database optimization
- **Documentation Workflow**: Memory bank updates triggered by significant changes
- **Development Guidelines**: Complete cursor rules integration with memory bank system
- **Error Handling**: Warning vs error classification, auto-clear functionality
- **Security Standards**: BCrypt hashing, input validation, SQL injection prevention
- **Performance Standards**: Efficient queries, caching, parallel API calls


