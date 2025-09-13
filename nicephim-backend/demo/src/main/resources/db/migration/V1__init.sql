-- USERS & ROLES
CREATE TABLE dbo.users (
  user_id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  username          NVARCHAR(100)    NOT NULL UNIQUE,
  email             NVARCHAR(255)    NOT NULL UNIQUE,
  password_hash     VARBINARY(256)   NOT NULL,
  display_name      NVARCHAR(120)    NULL,
  avatar_url        NVARCHAR(500)    NULL,
  is_admin          BIT              NOT NULL DEFAULT 0,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at        DATETIME2(3)     NULL
);

-- MOVIES / SERIES
CREATE TABLE dbo.movies (
  movie_id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  title             NVARCHAR(255)    NOT NULL,
  alias_title       NVARCHAR(255)    NULL,
  description       NVARCHAR(MAX)    NULL,
  release_year      SMALLINT         NULL,
  age_rating        NVARCHAR(10)     NULL,
  imdb_rating       DECIMAL(3,1)     NULL,
  is_series         BIT              NOT NULL DEFAULT 0,
  poster_url        NVARCHAR(500)    NULL,
  banner_url        NVARCHAR(500)    NULL,
  created_by        UNIQUEIDENTIFIER NOT NULL,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at        DATETIME2(3)     NULL,
  CONSTRAINT FK_movies_user FOREIGN KEY (created_by) REFERENCES dbo.users(user_id)
);

-- GENRES
CREATE TABLE dbo.genres (
  genre_id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name              NVARCHAR(80)     NOT NULL UNIQUE
);
CREATE TABLE dbo.movie_genres (
  movie_id          UNIQUEIDENTIFIER NOT NULL,
  genre_id          UNIQUEIDENTIFIER NOT NULL,
  CONSTRAINT PK_movie_genres PRIMARY KEY (movie_id, genre_id),
  CONSTRAINT FK_mg_movie FOREIGN KEY (movie_id) REFERENCES dbo.movies(movie_id) ON DELETE CASCADE,
  CONSTRAINT FK_mg_genre FOREIGN KEY (genre_id) REFERENCES dbo.genres(genre_id) ON DELETE CASCADE
);

-- EPISODES
CREATE TABLE dbo.episodes (
  episode_id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  movie_id          UNIQUEIDENTIFIER NOT NULL,
  season_number     INT              NOT NULL DEFAULT 1,
  episode_number    INT              NOT NULL DEFAULT 1,
  title             NVARCHAR(255)    NULL,
  duration_sec      INT              NULL,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at        DATETIME2(3)     NULL,
  CONSTRAINT FK_ep_movie FOREIGN KEY (movie_id) REFERENCES dbo.movies(movie_id) ON DELETE CASCADE,
  CONSTRAINT UQ_ep_order UNIQUE(movie_id, season_number, episode_number)
);

-- ASSETS (original MP4)
CREATE TABLE dbo.assets (
  asset_id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  episode_id        UNIQUEIDENTIFIER NOT NULL,
  storage_type      TINYINT          NOT NULL,
  path_or_url       NVARCHAR(1000)   NOT NULL,
  mime_type         NVARCHAR(100)    NOT NULL,
  size_bytes        BIGINT           NULL,
  status            TINYINT          NOT NULL DEFAULT 1,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at        DATETIME2(3)     NULL,
  CONSTRAINT FK_assets_episode FOREIGN KEY (episode_id) REFERENCES dbo.episodes(episode_id) ON DELETE CASCADE
);

-- HLS RENDITIONS
CREATE TABLE dbo.video_renditions (
  rendition_id      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  episode_id        UNIQUEIDENTIFIER NOT NULL,
  quality_label     NVARCHAR(20)     NOT NULL,
  bandwidth_kbps    INT              NULL,
  resolution        NVARCHAR(20)     NULL,
  playlist_url      NVARCHAR(1000)   NOT NULL,
  is_default        BIT              NOT NULL DEFAULT 0,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_renditions_episode FOREIGN KEY (episode_id) REFERENCES dbo.episodes(episode_id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX UQ_renditions_default ON dbo.video_renditions(episode_id, is_default) WHERE is_default=1;

-- COMMENTS
CREATE TABLE dbo.comments (
  comment_id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id           UNIQUEIDENTIFIER NOT NULL,
  movie_id          UNIQUEIDENTIFIER NULL,
  episode_id        UNIQUEIDENTIFIER NULL,
  parent_id         UNIQUEIDENTIFIER NULL,
  content           NVARCHAR(MAX)    NOT NULL,
  is_deleted        BIT              NOT NULL DEFAULT 0,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at        DATETIME2(3)     NULL,
  CONSTRAINT FK_c_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE CASCADE,
  CONSTRAINT FK_c_movie FOREIGN KEY (movie_id) REFERENCES dbo.movies(movie_id),
  CONSTRAINT FK_c_episode FOREIGN KEY (episode_id) REFERENCES dbo.episodes(episode_id),
  CONSTRAINT FK_c_parent FOREIGN KEY (parent_id) REFERENCES dbo.comments(comment_id),
  CONSTRAINT CK_c_target CHECK (movie_id IS NOT NULL OR episode_id IS NOT NULL)
);
CREATE INDEX IX_c_movie_time ON dbo.comments(movie_id, created_at DESC);
CREATE INDEX IX_c_episode_time ON dbo.comments(episode_id, created_at DESC);

CREATE TABLE dbo.comment_reactions (
  comment_id        UNIQUEIDENTIFIER NOT NULL,
  user_id           UNIQUEIDENTIFIER NOT NULL,
  reaction_type     TINYINT          NOT NULL,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_comment_reactions PRIMARY KEY (comment_id, user_id),
  CONSTRAINT FK_cr_comment FOREIGN KEY (comment_id) REFERENCES dbo.comments(comment_id) ON DELETE CASCADE,
  CONSTRAINT FK_cr_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id)
);

-- FAVORITES
CREATE TABLE dbo.user_favorites (
  user_id           UNIQUEIDENTIFIER NOT NULL,
  movie_id          UNIQUEIDENTIFIER NOT NULL,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_user_fav PRIMARY KEY (user_id, movie_id),
  CONSTRAINT FK_uf_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE CASCADE,
  CONSTRAINT FK_uf_movie FOREIGN KEY (movie_id) REFERENCES dbo.movies(movie_id) ON DELETE CASCADE
);

-- WATCH ROOMS
CREATE TABLE dbo.watch_rooms (
  room_id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name              NVARCHAR(200)    NOT NULL,
  created_by        UNIQUEIDENTIFIER NOT NULL,
  movie_id          UNIQUEIDENTIFIER NULL,
  episode_id        UNIQUEIDENTIFIER NULL,
  is_private        BIT              NOT NULL DEFAULT 0,
  invite_code       NVARCHAR(64)     NULL UNIQUE,
  current_rendition UNIQUEIDENTIFIER NULL,
  current_time_ms   BIGINT           NOT NULL DEFAULT 0,
  playback_state    TINYINT          NOT NULL DEFAULT 0,
  playback_rate     DECIMAL(3,2)     NOT NULL DEFAULT 1.0,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at        DATETIME2(3)     NULL,
  row_version       ROWVERSION,
  CONSTRAINT FK_wr_owner FOREIGN KEY (created_by) REFERENCES dbo.users(user_id),
  CONSTRAINT FK_wr_movie FOREIGN KEY (movie_id) REFERENCES dbo.movies(movie_id),
  CONSTRAINT FK_wr_episode FOREIGN KEY (episode_id) REFERENCES dbo.episodes(episode_id),
  CONSTRAINT FK_wr_rend FOREIGN KEY (current_rendition) REFERENCES dbo.video_renditions(rendition_id)
);
CREATE INDEX IX_wr_priv ON dbo.watch_rooms(is_private, created_at DESC);

CREATE TABLE dbo.watch_room_members (
  room_id           UNIQUEIDENTIFIER NOT NULL,
  user_id           UNIQUEIDENTIFIER NOT NULL,
  role              TINYINT          NOT NULL DEFAULT 3,
  joined_at         DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  is_muted          BIT              NOT NULL DEFAULT 0,
  CONSTRAINT PK_wr_members PRIMARY KEY (room_id, user_id),
  CONSTRAINT FK_wrm_room FOREIGN KEY (room_id) REFERENCES dbo.watch_rooms(room_id) ON DELETE CASCADE,
  CONSTRAINT FK_wrm_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE CASCADE
);

CREATE TABLE dbo.watch_room_control_delegations (
  delegation_id     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  room_id           UNIQUEIDENTIFIER NOT NULL,
  granted_to        UNIQUEIDENTIFIER NOT NULL,
  granted_by        UNIQUEIDENTIFIER NOT NULL,
  can_control       BIT              NOT NULL DEFAULT 1,
  granted_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  expires_at        DATETIME2(3)     NULL,
  revoked_at        DATETIME2(3)     NULL,
  CONSTRAINT FK_wrcd_room FOREIGN KEY (room_id) REFERENCES dbo.watch_rooms(room_id) ON DELETE CASCADE,
  CONSTRAINT FK_wrcd_to FOREIGN KEY (granted_to) REFERENCES dbo.users(user_id) ON DELETE CASCADE,
  CONSTRAINT FK_wrcd_by FOREIGN KEY (granted_by) REFERENCES dbo.users(user_id)
);
CREATE INDEX IX_wrcd_active ON dbo.watch_room_control_delegations(room_id, granted_to, can_control) INCLUDE (expires_at, revoked_at);

CREATE TABLE dbo.watch_room_events (
  event_id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  room_id           UNIQUEIDENTIFIER NOT NULL,
  user_id           UNIQUEIDENTIFIER NULL,
  event_type        TINYINT          NOT NULL,
  position_ms       BIGINT           NULL,
  playback_rate     DECIMAL(3,2)     NULL,
  payload           NVARCHAR(MAX)    NULL,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_wre_room FOREIGN KEY (room_id) REFERENCES dbo.watch_rooms(room_id) ON DELETE CASCADE,
  CONSTRAINT FK_wre_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE SET NULL
);
CREATE INDEX IX_wre_room_time ON dbo.watch_room_events(room_id, created_at DESC);

CREATE TABLE dbo.watch_room_messages (
  message_id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  room_id           UNIQUEIDENTIFIER NOT NULL,
  user_id           UNIQUEIDENTIFIER NOT NULL,
  message_type      TINYINT          NOT NULL DEFAULT 1,
  content           NVARCHAR(MAX)    NOT NULL,
  created_at        DATETIME2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_wrmmsg_room FOREIGN KEY (room_id) REFERENCES dbo.watch_rooms(room_id) ON DELETE CASCADE,
  CONSTRAINT FK_wrmmsg_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE CASCADE
);
CREATE INDEX IX_wrm_room_time ON dbo.watch_room_messages(room_id, created_at DESC);


