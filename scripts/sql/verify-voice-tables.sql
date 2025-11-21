-- Verify existence and basic accessibility of voice-related tables

-- 1) Table existence (returns table name when exists)
SELECT to_regclass('public.voice_usage_logs')   AS voice_usage_logs;
SELECT to_regclass('public.voice_usage_settings') AS voice_usage_settings;
SELECT to_regclass('public.voice_consent_settings') AS voice_consent_settings;

-- 2) RLS policies (names) if readable by current role
-- Note: pg_policies may be restricted for anon; run with elevated role if needed
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('voice_usage_logs','voice_usage_settings','voice_consent_settings')
ORDER BY tablename, policyname;

-- 3) Row counts (RLS applies; may be 0 for anon)
SELECT 'voice_usage_logs' AS table, count(*) FROM public.voice_usage_logs;
SELECT 'voice_usage_settings' AS table, count(*) FROM public.voice_usage_settings;
SELECT 'voice_consent_settings' AS table, count(*) FROM public.voice_consent_settings;

-- 4) Sample limited select (should not error even if empty)
SELECT id, user_id, created_at FROM public.voice_usage_logs LIMIT 5;
SELECT user_id, preferred_language, updated_at FROM public.voice_usage_settings LIMIT 5;
SELECT user_id, parental_consent, consent_updated_at FROM public.voice_consent_settings LIMIT 5;