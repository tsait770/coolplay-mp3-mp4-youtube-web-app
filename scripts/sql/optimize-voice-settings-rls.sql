-- Step 3: Enable RLS, add policies and indexes for settings tables

-- Enable RLS
ALTER TABLE public.voice_usage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_consent_settings ENABLE ROW LEVEL SECURITY;

-- Policies (created only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='voice_usage_settings' AND policyname='Users can view and manage their own voice settings'
  ) THEN
    CREATE POLICY "Users can view and manage their own voice settings"
    ON public.voice_usage_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='voice_consent_settings' AND policyname='Users can view and manage their own consent settings'
  ) THEN
    CREATE POLICY "Users can view and manage their own consent settings"
    ON public.voice_consent_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS voice_usage_settings_user_id_idx ON public.voice_usage_settings(user_id);
CREATE INDEX IF NOT EXISTS voice_consent_settings_user_id_idx ON public.voice_consent_settings(user_id);

-- Optional: updated_at trigger for voice_usage_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'voice_usage_settings_set_updated_at'
  ) THEN
    CREATE TRIGGER voice_usage_settings_set_updated_at
    BEFORE UPDATE ON public.voice_usage_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;