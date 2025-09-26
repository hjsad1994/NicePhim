# Product Context: NicePhim Streaming Platform

## Problem Statement
Users need a modern, feature-rich movie streaming platform that supports both individual viewing and social watching experiences, with high-quality video delivery, intuitive content discovery, comprehensive content management capabilities, and scheduled broadcast functionality for coordinated viewing events.

## Target Users
- **Primary**: Movie enthusiasts seeking high-quality streaming with adaptive quality and modern UI
- **Secondary**: Groups wanting to watch together remotely with real-time synchronization
- **Tertiary**: Event organizers wanting to schedule coordinated movie viewing sessions
- **Quaternary**: Content administrators managing movies, genres, and platform content
- **Quinary**: Developers maintaining and extending the platform functionality

## User Experience Goals
1. **Seamless Streaming**: Buffer-free, high-quality video playback with HLS adaptive streaming
2. **Social Interaction**: Easy sharing and collaborative viewing with real-time room synchronization
3. **Broadcast Scheduling**: Intuitive scheduling interface for coordinated viewing events with countdown displays
4. **Content Discovery**: Intuitive browsing by genre, with movie cards, posters, and detailed information
5. **Personalization**: User authentication, favorites, and watch history tracking
6. **Accessibility**: Mobile-responsive design with cinematic UI optimized for all devices

## Key User Journeys
1. **New User Registration**
   - Simple sign-up process with validation
   - BCrypt password hashing security
   - Profile setup with localStorage session management

2. **Content Discovery**
   - Browse by genre with dynamic content loading
   - Movie cards with hover effects and detailed information
   - Auto-playing homepage carousel with progress indicator
   - Real database integration with fallback systems

3. **Video Streaming**
   - Adaptive quality selection (360p, 480p, 720p, 1080p)
   - Custom video player with fullscreen and subtitle support
   - HLS streaming with real-time quality switching
   - Movie detail pages with comprehensive information

4. **Content Management**
   - Admin interface for movie and genre CRUD operations
   - Image upload system for posters and banners
   - Genre assignment and movie categorization
   - Video upload and processing pipeline

5. **Watch Together**
   - Create/join rooms with real-time synchronization
   - WebSocket-based communication with STOMP protocol
   - Movie context integration with room management
   - Broadcast scheduling with time selection and countdown displays
   - Server-managed time synchronization for coordinated playback
   - Broadcast status management and visual indicators

## Technical Implementation
- **Backend Architecture**: Spring Boot MVC with proper separation of concerns
- **Frontend Architecture**: Next.js App Router with TypeScript and React hooks
- **Database Design**: SQL Server with UUID primary keys and proper relationships
- **Video Processing**: FFmpeg HLS conversion with multiple quality variants
- **Real-time Features**: WebSocket integration for collaborative watching

## Business Goals
- Build a competitive streaming platform with modern technology stack
- Foster community through social features and collaborative viewing
- Enable event-based viewing experiences through broadcast scheduling
- Provide high-quality user experience with cinematic UI design
- Scale to support growing user base and content library
- Maintain comprehensive content management system
- Ensure code quality with TypeScript interfaces and Java best practices

## Success Metrics
- User engagement through watch-together features
- Event participation through broadcast scheduling functionality
- Content discovery effectiveness through genre-based organization
- Streaming quality with adaptive HLS technology
- Broadcast synchronization accuracy and reliability
- Admin productivity through comprehensive management interface
- Code maintainability through proper architecture and documentation


