-- Add media_type column to voice_logs table
-- This column tracks the type of media being controlled by voice commands
-- Purpose: Analytics and usage tracking for different media formats

ALTER TABLE public.voice_logs 
ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.voice_logs.media_type IS 'Type of media being controlled: MP4, HLS, DASH, MP3, YouTube, Vimeo, Twitch, etc.';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_logs_media_type ON public.voice_logs(media_type);

-- Update existing rows with default value if needed
UPDATE public.voice_logs 
SET media_type = COALESCE(video_platform, 'unknown')
WHERE media_type IS NULL;

COMMENT ON TABLE public.voice_logs IS 'Tracks voice command usage with media type information for analytics';
