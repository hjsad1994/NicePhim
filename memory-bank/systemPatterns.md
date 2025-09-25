# System Patterns: NicePhim Architecture

## Overall Architecture
```
Frontend (Next.js) ←→ Backend (Spring Boot) ←→ Database (SQL Server)
                           ↕
                    WebSocket (STOMP)
                           ↕
                    Video Processing (FFmpeg)
```

## Codebase Analysis
- **Backend**: 40 Java files implementing complete Spring Boot MVC architecture
- **Frontend**: 45 TypeScript/React files with Next.js App Router and modern UI components
- **Database**: SQL Server with proper relationships and UUID-based primary keys
- **Video Processing**: FFmpeg HLS conversion with multiple quality variants

## Frontend Patterns
- **App Router**: Next.js 15 App Router for routing with dynamic params
- **Component Architecture**: Reusable UI components with TypeScript props
- **Type Safety**: TypeScript interfaces for all data models (Movie, Genre, User)
- **Responsive Design**: Mobile-first with Tailwind CSS and glass-morphism effects
- **State Management**: React hooks with local state and API integration
- **Cinematic UI**: Dark theme with gradients, animations, and hover effects
- **Video Player Architecture**: SimpleHLSPlayer with HLS.js adaptive streaming
- **Image Handling**: Next.js Image component with domain configuration
- **Layout Adjustments**: Negative margin utilities (-ml-*, -mt-*) for precise component positioning
- **Typography Scaling**: Responsive text sizing with consistent breakpoints (text-4xl, lg:text-6xl, etc.)

## Backend Patterns
- **MVC Architecture**: Controllers, Services, Repositories, DTOs with proper separation
- **Dependency Injection**: Spring IoC container with constructor injection
- **Data Access**: JdbcTemplate for SQL operations with manual SQL queries
- **Security**: BCrypt password hashing with proper validation
- **Validation**: Jakarta Bean Validation with Vietnamese error messages
- **Error Handling**: Comprehensive exception handling with proper HTTP responses
- **UUID Architecture**: All entities use UUID primary keys for better security
- **Service Layer**: Business logic separated from data access and presentation

## Database Patterns
- **UUID Primary Keys**: Unique identifiers for all entities (movies, users, genres)
- **Foreign Key Constraints**: Proper referential integrity with cascading updates
- **Audit Fields**: created_at, updated_at timestamps with proper timezone handling
- **Video Integration**: Movies table includes video_id, hls_url, video_status fields
- **Junction Tables**: Many-to-many relationships (movie_genres) for flexible categorization
- **Manual SQL**: Custom SQL queries with JdbcTemplate for optimal performance
- **Migration Management**: Flyway migrations for schema versioning
- **SQL Server Optimization**: Proper indexing and query optimization for large datasets

## Real-time Communication
- **WebSocket**: STOMP protocol for watch-together features
- **Event Broadcasting**: Real-time updates to connected clients
- **Room Management**: User sessions and permissions
- **Broadcast Synchronization**: Server-managed time coordination for scheduled broadcasts
- **State Synchronization**: Real-time playback state updates across all connected clients
- **Control Restrictions**: Disabled seeking in broadcast mode to maintain synchronization

## Video Processing Pipeline
1. **Upload**: Original video files stored locally (D:/videos_demo)
2. **Processing**: FFmpeg converts to HLS format with multiple quality variants (360p, 720p, 1080p)
3. **Storage**: HLS segments stored in media directory (D:/media)
4. **Streaming**: Direct file serving via Spring static resources
5. **Database Integration**: Video metadata (video_id, hls_url, video_status) stored in database
6. **Environment Configuration**: Directory paths configurable via .env file with fallback values in application.properties

## Video Player Architecture
- **SimpleHLSPlayer Component**: Simplified video player built from scratch for better maintainability
- **HLS.js Integration**: Adaptive video streaming with multiple quality options
- **Event Handling**: Proper click (play/pause) and double-click (fullscreen) functionality
- **Control Layout**: User-requested layout with timeline, seek buttons, volume, quality, and fullscreen controls
- **State Management**: Controls timeout, volume state, and fullscreen state management
- **CSS Optimization**: Pointer events management and z-index handling for proper layering
- **Event Conflict Resolution**: stopPropagation to prevent conflicts between video element and controls overlay
- **Quality/Speed Selection**: Working dropdown menus with proper state updates and click outside handling
- **Menu Management**: Data attributes and improved event handling for reliable menu interactions
- **HLS Adaptive Quality Switching**: Real-time quality switching using hls.currentLevel API with level mapping and event handling
- **Dynamic Quality Menu**: Shows only available qualities from HLS manifest with actual resolution display
- **Component Consolidation**: Single SimpleHLSPlayer component replaces legacy HLSVideoPlayer for cleaner architecture
- **Video Player Layout Optimization**: Responsive sizing with max-w-full width and optimized padding for screen utilization
- **Header Spacing Management**: Proper top padding (pt-12) applied at page level to prevent header overlap
- **Padding Configuration**: Horizontal padding (px-5) for 20px side margins and minimal vertical padding for maximum screen usage
- **Single Theme Architecture**: Simplified dark theme only, no theme switching complexity
- **Production-Only Codebase**: Clean codebase with only production features, no test files or development utilities

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
- **Environment Configuration**: .env file support for flexible configuration management without source code modifications

## Database Migration Patterns
- **Flyway Integration**: Automatic database migration execution during Spring Boot startup
- **Migration Versioning**: Sequential version numbering (V1, V2, V3) for database schema changes
- **Backward Compatibility**: Temporary feature disabling during migration issues
- **Error Resolution Strategy**: Fix repository layer first, then re-enable features
- **Schema Evolution**: Add new columns with NULL defaults to avoid breaking existing data
- **Migration Rollback**: Proper migration design to allow rollback if needed
- **Column Addition Pattern**: ALTER TABLE ADD COLUMN with appropriate defaults and constraints

## Broadcast Scheduling Patterns
- **Server-Managed Time Architecture**: Centralized time calculation for synchronized playback across multiple clients
- **Broadcast Status Management**: Lifecycle management with "scheduled", "live", and "completed" states
- **Time Calculation Algorithm**: Server-side calculation of current playback position based on scheduled start time and playback state
- **Control Restriction Pattern**: Disabled seeking in broadcast mode, allowing only pause/resume functionality
- **WebSocket State Synchronization**: Real-time broadcast state updates to all connected clients
- **Frontend-Backend Integration**: Seamless integration between broadcast time selection UI and backend scheduling APIs
- **Room Management Enhancement**: Complete CRUD operations with broadcast scheduling capabilities
- **Time Synchronization Interval**: Periodic server time checks to maintain playback synchronization
- **Broadcast Time Selection UI**: Intuitive user interface for selecting broadcast start times with countdown display
- **Status Indicator Pattern**: Visual indicators showing broadcast status and time remaining until start

## Database Integration Patterns
- **Type Safety Pattern**: Proper handling of Java type mappings for SQL Server data types (TINYINT → Short, VARCHAR → String)
- **Unique Constraint Management**: Generation of unique identifiers for fields with UNIQUE constraints to avoid null value violations
- **Cross-Origin Resource Sharing**: CORS configuration for all controllers that need to handle frontend API requests
- **Password Hashing Pattern**: Consistent use of BCrypt for all password operations with proper salt generation
- **UUID Validation**: Frontend validation of UUID format before sending to backend to prevent conversion errors
- **Database Logging**: Comprehensive logging for database operations to facilitate debugging and monitoring

## Project Structure Patterns
- **Frontend Directory**: nicephim-frontend (renamed from rophim-frontend)
- **Backend Directory**: nicephim-backend
- **Consistent Naming**: All project references use "NicePhim" branding
- **Memory Bank Integration**: All documentation files updated with new branding
- **Code References**: Updated all code references from rophim to nicephim


