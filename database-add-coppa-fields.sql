-- =====================================================
-- CoolPlay InstaPlay V7 - COPPA Compliance Migration
-- =====================================================
-- This migration adds COPPA-compliant fields to the profiles table
-- Date: 2025-11-19
-- Purpose: Add parental consent tracking for users under 13 years old

-- Add COPPA compliance fields if they don't exist
DO $$ 
BEGIN
    -- Add parental_consent field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'parental_consent'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN parental_consent BOOLEAN DEFAULT FALSE;
        
        COMMENT ON COLUMN profiles.parental_consent IS 
        'COPPA compliance: Indicates if parental consent has been obtained for users under 13';
    END IF;

    -- Add parental_email field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'parental_email'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN parental_email TEXT;
        
        COMMENT ON COLUMN profiles.parental_email IS 
        'COPPA compliance: Email address of parent/guardian for users under 13';
    END IF;

    -- Add age_verification_date field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'age_verification_date'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN age_verification_date TIMESTAMPTZ;
        
        COMMENT ON COLUMN profiles.age_verification_date IS 
        'Timestamp when age verification was completed';
    END IF;

    -- Ensure age_verified exists (should already exist from previous migrations)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'age_verified'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN age_verified BOOLEAN DEFAULT FALSE;
        
        COMMENT ON COLUMN profiles.age_verified IS 
        'Indicates if user has completed age verification (18+ for adult content)';
    END IF;

    -- Ensure date_of_birth exists (should already exist from previous migrations)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN date_of_birth DATE;
        
        COMMENT ON COLUMN profiles.date_of_birth IS 
        'User date of birth for age verification and COPPA compliance';
    END IF;

END $$;

-- Create index for parental consent queries
CREATE INDEX IF NOT EXISTS idx_profiles_parental_consent 
ON profiles(parental_consent) 
WHERE parental_consent = TRUE;

-- Create index for age verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_age_verified 
ON profiles(age_verified) 
WHERE age_verified = TRUE;

-- Update RLS policies to ensure users can only update their own age-related data
DROP POLICY IF EXISTS "Users can update their own age verification" ON profiles;
CREATE POLICY "Users can update their own age verification" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Log completion
DO $$ 
BEGIN
    RAISE NOTICE 'COPPA compliance fields migration completed successfully';
    RAISE NOTICE 'Added fields: parental_consent, parental_email, age_verification_date';
    RAISE NOTICE 'Verified fields: age_verified, date_of_birth';
END $$;
