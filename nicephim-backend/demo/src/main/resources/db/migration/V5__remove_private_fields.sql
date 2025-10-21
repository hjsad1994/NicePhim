-- Remove private room fields that are no longer needed
-- All rooms are now public, anyone can join with the link

-- Drop index first
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_wr_priv' AND object_id = OBJECT_ID('dbo.watch_rooms'))
BEGIN
    DROP INDEX IX_wr_priv ON dbo.watch_rooms;
END
GO

-- Drop default constraint for is_private column (SQL Server requires this before dropping column)
DECLARE @ConstraintName NVARCHAR(200);
SELECT @ConstraintName = name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('dbo.watch_rooms')
AND parent_column_id = (SELECT column_id FROM sys.columns WHERE name = 'is_private' AND object_id = OBJECT_ID('dbo.watch_rooms'));

IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE dbo.watch_rooms DROP CONSTRAINT ' + @ConstraintName);
END
GO

-- Drop is_private column
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'watch_rooms' AND COLUMN_NAME = 'is_private')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP COLUMN is_private;
END
GO

-- Keep invite_code for sharing room link (but remove UNIQUE constraint if it exists)
-- Note: invite_code is still useful for creating shareable room links
