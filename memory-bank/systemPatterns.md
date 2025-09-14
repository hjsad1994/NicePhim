# System Patterns: Rophim Architecture

## Overall Architecture
```
Frontend (Next.js) ←→ Backend (Spring Boot) ←→ Database (SQL Server)
                           ↕
                    WebSocket (STOMP)
                           ↕
                    Video Processing (FFmpeg)
```

## Frontend Patterns
- **App Router**: Next.js 15 App Router for routing
- **Component Architecture**: Reusable UI components
- **Type Safety**: TypeScript interfaces for all data models
- **Responsive Design**: Mobile-first with Tailwind CSS
- **State Management**: React hooks and context

## Backend Patterns
- **MVC Architecture**: Controllers, Services, Repositories
- **Dependency Injection**: Spring IoC container
- **Data Access**: JdbcTemplate for database operations
- **Security**: BCrypt password hashing
- **Validation**: Jakarta Bean Validation

## Database Patterns
- **UUID Primary Keys**: Unique identifiers for all entities
- **Foreign Key Constraints**: Referential integrity
- **Audit Fields**: created_at, updated_at timestamps
- **Soft Deletes**: is_deleted flags where appropriate
- **Indexes**: Performance optimization for queries
- **Junction Tables**: Many-to-many relationships (movie_genres)
- **Normalized Design**: Separate tables for entities with proper relationships

## Real-time Communication
- **WebSocket**: STOMP protocol for watch-together features
- **Event Broadcasting**: Real-time updates to connected clients
- **Room Management**: User sessions and permissions

## Video Processing Pipeline
1. **Upload**: Original video files stored locally (D:/videos_demo)
2. **Processing**: FFmpeg converts to HLS format with multiple quality variants (360p, 720p, 1080p)
3. **Storage**: HLS segments stored in media directory (D:/media)
4. **Streaming**: Direct file serving via Spring static resources
5. **Database Integration**: Video metadata (video_id, hls_url, video_status) stored in movies table

## Video Player Architecture
- **SimpleHLSPlayer Component**: Simplified video player built from scratch for better maintainability
- **HLS.js Integration**: Adaptive video streaming with multiple quality options
- **Event Handling**: Proper click (play/pause) and double-click (fullscreen) functionality
- **Control Layout**: User-requested layout with timeline, seek buttons, volume, quality, and fullscreen controls
- **State Management**: Controls timeout, volume state, and fullscreen state management
- **CSS Optimization**: Pointer events management and z-index handling for proper layering
- **Event Conflict Resolution**: stopPropagation to prevent conflicts between video element and controls overlay

## Security Patterns
- **Password Hashing**: BCrypt with salt rounds
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Controlled cross-origin access
- **SQL Injection Prevention**: Parameterized queries

## Admin Management Patterns
- **CRUD Operations**: Complete Create, Read, Update, Delete for all entities
- **Validation Layers**: Frontend client-side + backend server-side validation
- **Error Classification**: Warning vs Error distinction for better UX
- **Real-time Feedback**: Auto-clear errors when user starts typing
- **Consistent UI**: ## Genre-Movie Integration Patterns
- **Many-to-Many Relationships**: Proper junction table (movie_genres) design
- **Embedded Data**: MovieResponse includes genres to reduce API calls
- **Hybrid Loading**: Frontend uses embedded data with fallback to separate API calls
- **Visual Indicators**: Genre tags with icons and color coding in admin interface
- **Bulk Operations**: Support for assigning multiple genres during movie creation/editing
- **Debug Logging**: Console logging for tracking data flow between backend and frontend

## Development Standards Patterns
- **Cursor Rules Integration**: Comprehensive development guidelines documented in .cursorrules
- **Memory Bank Documentation**: Complete documentation system with hierarchical structure
- **Code Quality Standards**: TypeScript interfaces, Java best practices, database optimization
- **Error Handling Patterns**: Warning vs error classification, auto-clear functionality
- **Security Patterns**: BCrypt hashing, input validation, SQL injection prevention
- **Performance Patterns**: Efficient queries, caching, parallel API calls
- **Testing Patterns**: Comprehensive validation, responsive design testing
- **File Organization**: Standardized frontend and backend structures
- **Documentation Workflow**: Memory bank updates triggered by significant changes or user requests
- **Development Guidelines**: Complete cursor rules integration with memory bank system
- **Debug Logging**: Console logging for tracking data flow between backend and frontend

## Database Migration Patterns
- **Flyway Integration**: Automatic database migration execution during Spring Boot startup
- **Migration Versioning**: Sequential version numbering (V1, V2, V3) for database schema changes
- **Backward Compatibility**: Temporary feature disabling during migration issues
- **Error Resolution Strategy**: Fix repository layer first, then re-enable features
- **Schema Evolution**: Add new columns with NULL defaults to avoid breaking existing data
- **Migration Rollback**: Proper migration design to allow rollback if needed
- **Column Addition Pattern**: ALTER TABLE ADD COLUMN with appropriate defaults and constraints


