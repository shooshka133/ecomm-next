-- Quick SQL to verify and test local domain matching
-- This is for reference - the code now supports subdomain matching automatically

-- Check current brand domains
SELECT 
  id,
  slug,
  name,
  domain,
  is_active
FROM brands
ORDER BY domain;

-- The code now automatically matches:
-- "grocery.local" → brand with domain "grocery.shooshka.online"
-- "store.local" → brand with domain "store.shooshka.online"
-- 
-- No database changes needed! The subdomain matching handles it.

-- Optional: If you want to explicitly add .local domains for testing
-- (not required, but can be useful for clarity)
/*
UPDATE brands
SET domain = 'grocery.local'
WHERE slug = 'grocery-store';

-- Remember to change back after testing:
UPDATE brands
SET domain = 'grocery.shooshka.online'
WHERE slug = 'grocery-store';
*/

