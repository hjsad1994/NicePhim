-- =============================================================================
-- V7: Remove Unused Database Tables
-- =============================================================================
-- Reason: These tables were created for future features but never implemented:
-- - episodes: Series/multi-episode support not used (only single-video movies)
-- - video_renditions: HLS quality variants not stored in DB (generated dynamically)
-- - assets: Original file tracking not needed (using direct file paths)
-- - comment_reactions: Reaction feature not implemented
-- - comments: Comment system not implemented
-- - user_favorites: Favorite feature not implemented
-- - watch_room_control_delegations: Advanced permissions not needed
-- - watch_room_events: Event logging not used
-- - watch_room_members: Member tracking done in-memory (WatchRoomService)
-- - watch_room_messages: Chat messages not persisted to DB (real-time only)
-- =============================================================================

-- STEP 1: Drop all foreign keys that reference tables we're about to delete
-- Drop FK constraints in watch_rooms table first
IF OBJECT_ID('dbo.watch_rooms', 'U') IS NOT NULL
BEGIN
    -- Drop FK to episodes
    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_wr_episode')
        ALTER TABLE dbo.watch_rooms DROP CONSTRAINT FK_wr_episode;
    
    -- Drop FK to video_renditions
    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_wr_rend')
        ALTER TABLE dbo.watch_rooms DROP CONSTRAINT FK_wr_rend;
END
GO

-- STEP 2: Drop watch room related tables (due to foreign keys)
IF OBJECT_ID('dbo.watch_room_messages', 'U') IS NOT NULL
    DROP TABLE dbo.watch_room_messages;

IF OBJECT_ID('dbo.watch_room_events', 'U') IS NOT NULL
    DROP TABLE dbo.watch_room_events;

IF OBJECT_ID('dbo.watch_room_control_delegations', 'U') IS NOT NULL
    DROP TABLE dbo.watch_room_control_delegations;

IF OBJECT_ID('dbo.watch_room_members', 'U') IS NOT NULL
    DROP TABLE dbo.watch_room_members;

-- Drop comment related tables
IF OBJECT_ID('dbo.comment_reactions', 'U') IS NOT NULL
    DROP TABLE dbo.comment_reactions;

IF OBJECT_ID('dbo.comments', 'U') IS NOT NULL
    DROP TABLE dbo.comments;

-- Drop user favorites
IF OBJECT_ID('dbo.user_favorites', 'U') IS NOT NULL
    DROP TABLE dbo.user_favorites;

-- STEP 3: Drop video related tables (episodes and its dependents)
IF OBJECT_ID('dbo.video_renditions', 'U') IS NOT NULL
    DROP TABLE dbo.video_renditions;

IF OBJECT_ID('dbo.assets', 'U') IS NOT NULL
    DROP TABLE dbo.assets;

IF OBJECT_ID('dbo.episodes', 'U') IS NOT NULL
    DROP TABLE dbo.episodes;

-- STEP 4: Drop orphaned columns in watch_rooms
IF OBJECT_ID('dbo.watch_rooms', 'U') IS NOT NULL
BEGIN
    -- Drop episode_id column
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.watch_rooms') AND name = 'episode_id')
        ALTER TABLE dbo.watch_rooms DROP COLUMN episode_id;
    
    -- Drop current_rendition column
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.watch_rooms') AND name = 'current_rendition')
        ALTER TABLE dbo.watch_rooms DROP COLUMN current_rendition;
END
GO
