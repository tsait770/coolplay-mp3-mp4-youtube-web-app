-- Step 2: Create missing settings tables only

CREATE TABLE IF NOT EXISTS public.voice_usage_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'en',
  voice_enabled BOOLEAN DEFAULT TRUE,
  mic_sensitivity NUMERIC(3,2) DEFAULT 0.80 CHECK (mic_sensitivity >= 0 AND mic_sensitivity <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.voice_consent_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  parental_consent BOOLEAN DEFAULT FALSE,
  age_verified BOOLEAN DEFAULT FALSE,
  date_of_birth DATE NULL,
  consent_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);