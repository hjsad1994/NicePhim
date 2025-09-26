-- Add broadcast scheduling fields to watch_rooms table
ALTER TABLE dbo.watch_rooms ADD
  scheduled_start_time BIGINT NULL;

ALTER TABLE dbo.watch_rooms ADD
  broadcast_start_time_type NVARCHAR(20) NULL;

ALTER TABLE dbo.watch_rooms ADD
  broadcast_status NVARCHAR(20) NULL;

ALTER TABLE dbo.watch_rooms ADD
  actual_start_time BIGINT NULL;

ALTER TABLE dbo.watch_rooms ADD
  server_managed_time BIGINT NULL;

GO

-- Set default values for existing rooms only if the column exists
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'watch_rooms' AND COLUMN_NAME = 'broadcast_status')
BEGIN
    UPDATE dbo.watch_rooms SET
      broadcast_status = 'scheduled',
      server_managed_time = 0
    WHERE broadcast_status IS NULL;
END

GO

-- Add default constraint for new records
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'watch_rooms' AND COLUMN_NAME = 'server_managed_time')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('watch_rooms') AND name = 'df_watch_rooms_server_managed_time')
    BEGIN
        ALTER TABLE dbo.watch_rooms ADD CONSTRAINT df_watch_rooms_server_managed_time
        DEFAULT 0 FOR server_managed_time;
    END
END