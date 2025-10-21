-- Remove broadcast-related fields that are no longer needed
-- Keeping only: current_time_ms, playback_state, playback_rate for manual sync feature

-- Drop default constraints first
IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('watch_rooms') AND name = 'df_watch_rooms_server_managed_time')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP CONSTRAINT df_watch_rooms_server_managed_time;
END
GO

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('watch_rooms') AND name = 'df_watch_rooms_actual_start_time')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP CONSTRAINT df_watch_rooms_actual_start_time;
END
GO

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('watch_rooms') AND name = 'df_watch_rooms_broadcast_status')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP CONSTRAINT df_watch_rooms_broadcast_status;
END
GO

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('watch_rooms') AND name = 'df_watch_rooms_scheduled_start_time')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP CONSTRAINT df_watch_rooms_scheduled_start_time;
END
GO

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('watch_rooms') AND name = 'df_watch_rooms_broadcast_start_time_type')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP CONSTRAINT df_watch_rooms_broadcast_start_time_type;
END
GO

-- Drop columns
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'watch_rooms' AND COLUMN_NAME = 'server_managed_time')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP COLUMN server_managed_time;
END
GO

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'watch_rooms' AND COLUMN_NAME = 'actual_start_time')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP COLUMN actual_start_time;
END
GO

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'watch_rooms' AND COLUMN_NAME = 'broadcast_status')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP COLUMN broadcast_status;
END
GO

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'watch_rooms' AND COLUMN_NAME = 'scheduled_start_time')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP COLUMN scheduled_start_time;
END
GO

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'watch_rooms' AND COLUMN_NAME = 'broadcast_start_time_type')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP COLUMN broadcast_start_time_type;
END
GO
