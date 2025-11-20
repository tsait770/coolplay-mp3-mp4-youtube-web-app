-- Voice Control Settings and Usage Tables
-- This SQL script creates the necessary tables for voice control functionality
-- Execute this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Voice Control Settings Table
-- Stores user preferences for voice control features
CREATE TABLE IF NOT EXISTS voice_control_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Voice control preferences
  always_listening BOOLEAN DEFAULT false,
  enable_background_listening BOOLEAN DEFAULT false,
  enable_wake_word BOOLEAN DEFAULT false,
  wake_words TEXT[] DEFAULT ARRAY['hey coolplay', 'ok coolplay'],
  
  -- ASR settings
  preferred_language VARCHAR(10) DEFAULT 'en-US',
  enable_local_processing BOOLEAN DEFAULT true,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.60,
  
  -- Usage limits and quotas
  daily_limit INTEGER DEFAULT 100,
  monthly_limit INTEGER DEFAULT 1000,
  enable_usage_tracking BOOLEAN DEFAULT true,
  
  -- Privacy settings
  enable_cloud_asr BOOLEAN DEFAULT false,
  cloud_asr_consent_given BOOLEAN DEFAULT false,
  cloud_asr_consent_date TIMESTAMP WITH TIME ZONE,
  
  -- Feedback preferences
  enable_visual_feedback BOOLEAN DEFAULT true,
  enable_audio_feedback BOOLEAN DEFAULT false,
  enable_haptic_feedback BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Voice Command Usage Logs
-- Tracks all voice commands executed by users
CREATE TABLE IF NOT EXISTS voice_command_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Command details
  command_text TEXT NOT NULL,
  intent VARCHAR(100),
  action VARCHAR(100),
  slot JSONB,
  
  -- Recognition details
  confidence DECIMAL(3,2) NOT NULL,
  language VARCHAR(10) NOT NULL,
  asr_provider VARCHAR(50) DEFAULT 'web_speech_api',
  processing_time_ms INTEGER,
  
  -- Execution details
  executed BOOLEAN DEFAULT false,
  execution_success BOOLEAN,
  execution_error TEXT,
  
  -- Context
  player_type VARCHAR(50),
  video_url TEXT,
  device_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Voice Usage Stats
-- Aggregated daily usage statistics per user
CREATE TABLE IF NOT EXISTS voice_usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Usage counts
  total_commands INTEGER DEFAULT 0,
  successful_commands INTEGER DEFAULT 0,
  failed_commands INTEGER DEFAULT 0,
  low_confidence_commands INTEGER DEFAULT 0,
  
  -- Average metrics
  avg_confidence DECIMAL(3,2),
  avg_processing_time_ms INTEGER,
  
  -- Command type breakdown
  playback_commands INTEGER DEFAULT 0,
  seek_commands INTEGER DEFAULT 0,
  volume_commands INTEGER DEFAULT 0,
  speed_commands INTEGER DEFAULT 0,
  fullscreen_commands INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_settings_user ON voice_control_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_logs_user ON voice_command_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_logs_created ON voice_command_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_logs_intent ON voice_command_logs(intent);
CREATE INDEX IF NOT EXISTS idx_voice_stats_user_date ON voice_usage_stats(user_id, date DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE voice_control_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_command_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_usage_stats ENABLE ROW LEVEL SECURITY;

-- Policies for voice_control_settings
CREATE POLICY "Users can view their own voice settings"
  ON voice_control_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice settings"
  ON voice_control_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice settings"
  ON voice_control_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for voice_command_logs
CREATE POLICY "Users can view their own command logs"
  ON voice_command_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own command logs"
  ON voice_command_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for voice_usage_stats
CREATE POLICY "Users can view their own usage stats"
  ON voice_usage_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage stats"
  ON voice_usage_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage stats"
  ON voice_usage_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_voice_settings_updated_at
  BEFORE UPDATE ON voice_control_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_stats_updated_at
  BEFORE UPDATE ON voice_usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize default voice settings for new users
CREATE OR REPLACE FUNCTION create_default_voice_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO voice_control_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings when a new profile is created
CREATE TRIGGER on_profile_created_voice_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_voice_settings();

-- Function to log voice command usage
CREATE OR REPLACE FUNCTION log_voice_command(
  p_user_id UUID,
  p_command_text TEXT,
  p_intent VARCHAR,
  p_action VARCHAR,
  p_slot JSONB,
  p_confidence DECIMAL,
  p_language VARCHAR,
  p_asr_provider VARCHAR,
  p_processing_time_ms INTEGER,
  p_executed BOOLEAN,
  p_execution_success BOOLEAN,
  p_execution_error TEXT DEFAULT NULL,
  p_player_type VARCHAR DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO voice_command_logs (
    user_id, command_text, intent, action, slot,
    confidence, language, asr_provider, processing_time_ms,
    executed, execution_success, execution_error,
    player_type, video_url, device_id
  ) VALUES (
    p_user_id, p_command_text, p_intent, p_action, p_slot,
    p_confidence, p_language, p_asr_provider, p_processing_time_ms,
    p_executed, p_execution_success, p_execution_error,
    p_player_type, p_video_url, p_device_id
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily usage stats
CREATE OR REPLACE FUNCTION update_voice_usage_stats(
  p_user_id UUID,
  p_intent VARCHAR,
  p_confidence DECIMAL,
  p_processing_time_ms INTEGER,
  p_success BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO voice_usage_stats (
    user_id, date, total_commands,
    successful_commands, failed_commands,
    low_confidence_commands,
    avg_confidence, avg_processing_time_ms
  ) VALUES (
    p_user_id, v_today, 1,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN NOT p_success THEN 1 ELSE 0 END,
    CASE WHEN p_confidence < 0.6 THEN 1 ELSE 0 END,
    p_confidence, p_processing_time_ms
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_commands = voice_usage_stats.total_commands + 1,
    successful_commands = voice_usage_stats.successful_commands + 
      CASE WHEN p_success THEN 1 ELSE 0 END,
    failed_commands = voice_usage_stats.failed_commands + 
      CASE WHEN NOT p_success THEN 1 ELSE 0 END,
    low_confidence_commands = voice_usage_stats.low_confidence_commands + 
      CASE WHEN p_confidence < 0.6 THEN 1 ELSE 0 END,
    avg_confidence = (voice_usage_stats.avg_confidence * voice_usage_stats.total_commands + p_confidence) / 
      (voice_usage_stats.total_commands + 1),
    avg_processing_time_ms = (voice_usage_stats.avg_processing_time_ms * voice_usage_stats.total_commands + p_processing_time_ms) / 
      (voice_usage_stats.total_commands + 1),
    updated_at = NOW();
    
  -- Update intent-specific counters
  UPDATE voice_usage_stats
  SET
    playback_commands = playback_commands + CASE WHEN p_intent = 'playback_control' THEN 1 ELSE 0 END,
    seek_commands = seek_commands + CASE WHEN p_intent = 'seek_control' THEN 1 ELSE 0 END,
    volume_commands = volume_commands + CASE WHEN p_intent = 'volume_control' THEN 1 ELSE 0 END,
    speed_commands = speed_commands + CASE WHEN p_intent = 'speed_control' THEN 1 ELSE 0 END,
    fullscreen_commands = fullscreen_commands + CASE WHEN p_intent = 'fullscreen_control' THEN 1 ELSE 0 END
  WHERE user_id = p_user_id AND date = v_today;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON voice_control_settings TO authenticated;
GRANT ALL ON voice_command_logs TO authenticated;
GRANT ALL ON voice_usage_stats TO authenticated;

-- Comments for documentation
COMMENT ON TABLE voice_control_settings IS 'Stores user preferences and settings for voice control features';
COMMENT ON TABLE voice_command_logs IS 'Logs all voice commands executed by users for analytics and debugging';
COMMENT ON TABLE voice_usage_stats IS 'Aggregated daily statistics for voice command usage per user';
COMMENT ON FUNCTION log_voice_command IS 'Logs a voice command execution with all relevant details';
COMMENT ON FUNCTION update_voice_usage_stats IS 'Updates daily aggregated usage statistics for voice commands';
