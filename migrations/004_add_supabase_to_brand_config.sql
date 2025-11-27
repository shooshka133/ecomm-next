-- Migration: Add Supabase configuration support to brands table
-- This allows each brand to have its own Supabase project

-- The Supabase config will be stored in brands.config.supabase as JSONB:
-- {
--   "supabase": {
--     "url": "https://xxxxx.supabase.co",
--     "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
--     "envPrefix": "GROCERY" // Optional: for env var fallback
--   }
-- }

-- No schema changes needed - we're using the existing config JSONB column
-- This migration is informational/documentation only

-- Example: Update a brand to include Supabase config
-- UPDATE brands
-- SET config = config || '{
--   "supabase": {
--     "url": "https://xxxxx.supabase.co",
--     "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
--     "envPrefix": "GROCERY"
--   }
-- }'::jsonb
-- WHERE slug = 'grocery-store';

-- Verify Supabase config exists (optional check)
-- SELECT 
--   id,
--   slug,
--   name,
--   config->'supabase'->>'url' as supabase_url,
--   CASE 
--     WHEN config->'supabase'->>'anonKey' IS NOT NULL THEN '***configured***'
--     ELSE 'not configured'
--   END as supabase_key_status
-- FROM brands
-- ORDER BY created_at DESC;

