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
1. **Upload**: Original video files stored locally
2. **Processing**: FFmpeg converts to HLS format
3. **Storage**: HLS segments stored in media directory
4. **Streaming**: Direct file serving via Spring static resources

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
- **Consistent UI**: Uniform admin interface across all management sections

## Genre-Movie Integration Patterns
- **Many-to-Many Relationships**: Proper junction table (movie_genres) design
- **Embedded Data**: MovieResponse includes genres to reduce API calls
- **Hybrid Loading**: Frontend uses embedded data with fallback to separate API calls
- **Visual Indicators**: Genre tags with icons and color coding in admin interface
- **Bulk Operations**: Support for assigning multiple genres during movie creation/editing
- **Debug Logging**: Console logging for tracking data flow between backend and frontend


