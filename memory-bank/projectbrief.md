# Project Brief: NicePhim - Movie Streaming Platform

## Project Overview
**NicePhim** is a comprehensive movie streaming platform built with modern web technologies, featuring both individual viewing and collaborative "watch together" functionality. The platform consists of 40 Java backend files and 45 TypeScript/React frontend files, implementing a complete streaming solution.

## Core Requirements
- **Movie Streaming**: High-quality video streaming with multiple quality options and HLS adaptive streaming
- **User Management**: Complete registration, authentication, and user preferences system
- **Watch Together**: Real-time collaborative viewing with WebSocket synchronization and broadcast scheduling
- **Broadcast Scheduling**: Server-managed time coordination for scheduled video broadcasts with synchronized playback
- **Admin Panel**: Comprehensive movie and genre management interface
- **Responsive Design**: Mobile-first approach with modern cinematic UI/UX

## Key Features
1. **Video Streaming**
   - Multiple quality options (360p, 480p, 720p, 1080p) with HLS adaptive streaming
   - Custom video player with quality selection, subtitle support, and fullscreen mode
   - Episode management for series with video upload and processing pipeline
   - Real-time video status tracking and processing feedback

2. **Watch Together**
   - Real-time room creation and management
   - Synchronized playback across users
   - WebSocket-based communication with STOMP protocol
   - Room administration features
   - Broadcast scheduling with server-managed time synchronization
   - Scheduled start times with countdown displays
   - Broadcast status management (scheduled, live, completed)
   - Video player control restrictions in broadcast mode (pause/resume only)
   - Real-time state synchronization across all connected clients

3. **Content Management**
   - Movie catalog with genres, ratings, and metadata
   - Complete admin interface for movie and genre management
   - Image upload system for posters and banners
   - Search and filtering capabilities
   - Genre-based content organization

4. **User Experience**
   - Modern, responsive design with cinematic UI
   - Single dark theme optimized for viewing
   - Auto-playing homepage carousel with progress indicator
   - Movie detail pages with real database integration
   - Favorites and watch history functionality

## Technical Architecture
- **Backend**: Spring Boot MVC with controllers, services, repositories, and DTOs
- **Frontend**: Next.js App Router with TypeScript and React hooks
- **Database**: SQL Server with UUID primary keys and proper relationships
- **Video Processing**: FFmpeg HLS conversion with multiple quality variants
- **Authentication**: BCrypt password hashing with registration/login system

## Success Criteria
- Seamless video streaming experience with adaptive quality
- Real-time synchronization in watch-together mode
- Broadcast scheduling functionality with server-managed time coordination
- Intuitive user interface with cinematic design and broadcast time selection
- Scalable architecture for future growth
- Mobile-responsive design with modern UI patterns
- Complete room management with broadcast scheduling capabilities

## Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Spring Boot 3.1.5, Java 17, SQL Server with JDBC
- **Real-time**: WebSocket, STOMP protocol
- **Database**: Microsoft SQL Server with Flyway migrations
- **Video Processing**: FFmpeg for HLS conversion
- **UI Components**: Headless UI, Heroicons, React Player, HLS.js


