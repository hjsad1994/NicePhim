-- Add video fields to movies table for direct video uploads
ALTER TABLE dbo.movies ADD 
  video_id NVARCHAR(255) NULL,
  hls_url NVARCHAR(1000) NULL,
  video_status NVARCHAR(20) NULL DEFAULT 'ready';