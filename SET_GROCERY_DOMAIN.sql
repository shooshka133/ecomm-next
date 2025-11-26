-- Step 1: First, run the migration to add the domain column (if not already done)
-- Run this FIRST if you haven't already:

ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS domain TEXT;

-- Create index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_brands_domain ON brands(domain) WHERE domain IS NOT NULL;

-- Step 2: Set the domain for your grocery brand
-- Replace 'grocery-store' with your actual grocery brand slug if different

UPDATE brands 
SET domain = 'grocery.shooshka.online'
WHERE slug = 'grocery-store';

-- If the above doesn't match, try this instead:
-- UPDATE brands 
-- SET domain = 'grocery.shooshka.online'
-- WHERE name ILIKE '%grocery%';

-- Step 3: Verify the update worked
SELECT id, slug, name, domain, is_active 
FROM brands 
WHERE domain = 'grocery.shooshka.online';

-- Step 4: View all brands to see their domains
SELECT slug, name, domain, is_active 
FROM brands 
ORDER BY domain NULLS LAST;

