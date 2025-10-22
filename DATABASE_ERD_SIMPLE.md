# 🗄️ NicePhim Database - Simple ERD

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ movies : creates
    users ||--o{ watch_rooms : hosts
    movies ||--o{ movie_genres : has
    genres ||--o{ movie_genres : categorizes
    movies ||--o{ watch_rooms : "played in"
    
    users {
        uuid user_id PK
        string username UK
        string email UK
        binary password_hash
        string display_name
        string avatar_url
        bool is_admin
        datetime created_at
        datetime updated_at
    }
    
    movies {
        uuid movie_id PK
        string title
        string alias_title
        text description
        int release_year
        string age_rating
        decimal imdb_rating
        bool is_series
        string poster_url
        string banner_url
        uuid created_by FK
        string video_id
        string hls_url
        string video_status
        datetime created_at
        datetime updated_at
    }
    
    genres {
        uuid genre_id PK
        string name UK
    }
    
    movie_genres {
        uuid movie_id PK_FK
        uuid genre_id PK_FK
    }
    
    watch_rooms {
        uuid room_id PK
        string name
        uuid created_by FK
        uuid movie_id FK
        bigint current_time_ms
        int playback_state
        decimal playback_rate
        datetime created_at
        datetime updated_at
        timestamp row_version
    }
```

---

## 🎯 Simple Relationships

```mermaid
graph LR
    U[👤 Users] -->|creates| M[🎬 Movies]
    U -->|hosts| W[📺 Watch Rooms]
    M -->|has| G[🏷️ Genres]
    M -->|played in| W
    
    style U fill:#4a90e2,color:#fff,stroke:#333
    style M fill:#f39c12,color:#fff,stroke:#333
    style G fill:#9b59b6,color:#fff,stroke:#333
    style W fill:#27ae60,color:#fff,stroke:#333
```

---

## 📋 Tables Summary

| # | Table | Records | Description |
|---|-------|---------|-------------|
| 1 | **users** | User accounts | Authentication & profiles |
| 2 | **movies** | Video library | Movies with metadata |
| 3 | **genres** | Categories | Action, Drama, Comedy, etc |
| 4 | **movie_genres** | Links | Many-to-many junction |
| 5 | **watch_rooms** | Rooms | Watch together rooms |

**Total: 5 tables** (6 including system table)

---

## 🔗 Foreign Keys

```mermaid
graph TD
    U[users<br/>user_id]
    M[movies<br/>movie_id]
    G[genres<br/>genre_id]
    MG[movie_genres]
    WR[watch_rooms]
    
    M -->|created_by| U
    WR -->|created_by| U
    WR -->|movie_id| M
    MG -->|movie_id| M
    MG -->|genre_id| G
    
    style U fill:#e1f5ff
    style M fill:#fff4e1
    style G fill:#f0e1ff
    style MG fill:#e8e8e8
    style WR fill:#e1ffe1
```

**5 Foreign Keys:**
1. movies.created_by → users.user_id
2. watch_rooms.created_by → users.user_id
3. watch_rooms.movie_id → movies.movie_id
4. movie_genres.movie_id → movies.movie_id (CASCADE)
5. movie_genres.genre_id → genres.genre_id (CASCADE)

---

## 💡 Key Points

### **users**
- Stores login credentials (bcrypt hashed)
- Username & email are unique
- Can create movies and watch rooms

### **movies**
- Video metadata (title, description, poster, etc)
- Links to HLS video file (.m3u8)
- Can have multiple genres

### **genres**
- Simple category names (Action, Drama, etc)
- Reusable across movies

### **movie_genres**
- Junction table (no extra data)
- Connects movies ↔ genres (many-to-many)

### **watch_rooms**
- Watch together session
- Tracks current playback position & state
- Host controls room

---

## 📊 Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Movie
    participant G as Genre
    participant W as Watch Room
    
    Note over U: 1. User signs up
    U->>M: 2. Creates movie
    M->>G: 3. Assigns genres
    U->>W: 4. Creates watch room
    W->>M: 5. Selects movie
    Note over W: 6. Ready to watch!
```

---

**Schema Version:** V7 (2025-10-22)  
**Tables:** 5 active + 1 system  
**Database:** nicephim (SQL Server 2022)
