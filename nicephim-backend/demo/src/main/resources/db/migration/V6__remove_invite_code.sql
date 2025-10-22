-- Migration V6: Remove invite_code feature
-- Date: 2024-10-22
-- Reason: Invite code feature not used (no validation/join logic implemented)

USE nicephim;
GO

-- Drop unique constraint on invite_code dynamically (constraint name is auto-generated)
DECLARE @ConstraintName NVARCHAR(200);
SELECT @ConstraintName = name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('dbo.watch_rooms')
AND parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('dbo.watch_rooms') AND name = 'invite_code');

IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE dbo.watch_rooms DROP CONSTRAINT ' + @ConstraintName);
    PRINT 'Dropped default constraint: ' + @ConstraintName;
END

-- Drop UNIQUE constraint if exists
DECLARE @UniqueConstraintName NVARCHAR(200);
SELECT @UniqueConstraintName = kc.name
FROM sys.key_constraints kc
WHERE kc.parent_object_id = OBJECT_ID('dbo.watch_rooms')
AND kc.type = 'UQ'
AND EXISTS (
    SELECT 1 FROM sys.index_columns ic
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE ic.object_id = OBJECT_ID('dbo.watch_rooms')
    AND c.name = 'invite_code'
    AND ic.index_id = kc.unique_index_id
);

IF @UniqueConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE dbo.watch_rooms DROP CONSTRAINT ' + @UniqueConstraintName);
    PRINT 'Dropped unique constraint: ' + @UniqueConstraintName;
END

-- Drop invite_code column
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.watch_rooms') AND name = 'invite_code')
BEGIN
    ALTER TABLE dbo.watch_rooms DROP COLUMN invite_code;
    PRINT 'Dropped invite_code column from watch_rooms table';
END
GO

PRINT 'Migration V6 completed: invite_code removed';
GO
