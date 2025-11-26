-- ============================================
-- Domain Routing Debug Queries
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. Check if domain column exists
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'brands' 
  AND column_name = 'domain';

-- Expected: Should show one row with domain | text | YES

-- ============================================

-- 2. If domain column doesn't exist, add it:
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS domain TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_brands_domain 
ON brands(domain) 
WHERE domain IS NOT NULL;

-- ============================================

-- 3. View all brands and their domains
SELECT 
  id,
  slug,
  name,
  domain,
  is_active,
  created_at
FROM brands 
ORDER BY created_at DESC;

-- ============================================

-- 4. Check if grocery brand exists
SELECT 
  id,
  slug,
  name,
  domain,
  is_active
FROM brands 
WHERE name ILIKE '%grocery%' 
   OR slug ILIKE '%grocery%';

-- ============================================

-- 5. Check if domain is set for grocery
SELECT 
  id,
  slug,
  name,
  domain,
  is_active
FROM brands 
WHERE domain = 'grocery.shooshka.online';

-- Expected: Should show your grocery brand with domain set

-- ============================================

-- 6. Set domain on grocery brand (if not set)
-- First, find your grocery brand slug from query #4, then run:

UPDATE brands 
SET domain = 'grocery.shooshka.online'
WHERE slug = 'grocery-store';  -- Replace with your actual slug

-- Or if you know the brand ID:
-- UPDATE brands 
-- SET domain = 'grocery.shooshka.online'
-- WHERE id = 'your-brand-id-here';

-- ============================================

-- 7. Verify the update worked
SELECT 
  id,
  slug,
  name,
  domain,
  is_active
FROM brands 
WHERE domain = 'grocery.shooshka.online';

-- Should show your grocery brand

-- ============================================

-- 8. Check environment variables (can't query, but verify in Vercel)
-- Make sure these are set in Vercel:
-- NEXT_PUBLIC_SUPABASE_URL = (should point to THIS Supabase project)
-- SUPABASE_SERVICE_ROLE_KEY = (from THIS Supabase project)

-- ============================================

-- 9. Test domain lookup (simulate what the code does)
SELECT 
  id,
  slug,
  name,
  domain,
  is_active,
  config->>'name' as config_name,
  config->'colors'->>'primary' as primary_color
FROM brands 
WHERE domain = 'grocery.shooshka.online'
LIMIT 1;

-- Expected: Should return your grocery brand with green colors

-- ============================================

-- 10. Check if any brands have NULL domain
SELECT 
  COUNT(*) as brands_without_domain
FROM brands 
WHERE domain IS NULL;

-- ============================================

-- SUMMARY CHECKLIST:
-- [ ] Domain column exists (query #1)
-- [ ] Grocery brand exists (query #4)
-- [ ] Domain is set on grocery brand (query #5)
-- [ ] Domain lookup works (query #9)
-- [ ] Environment variables set in Vercel

