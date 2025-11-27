# Fix Domain Routing and Link Issues

## Issues Found

1. **Both domains showing same site**: `getActiveBrand` was falling back to `is_active` brand even when domain was provided
2. **Product colors flashing**: Components were fetching brand config client-side instead of using CSS variables
3. **Links redirecting**: Need to ensure Next.js Link preserves domain

## Fixes Applied

### 1. Domain Routing Fix
- Updated `getActiveBrand` to NOT fall back to `is_active` when domain is provided
- Now: If domain provided but no match → return null (don't show wrong brand)

### 2. Color Flash Fix
- Updated `ProductCard`, `CategoryFilter`, and `AutoScrollProducts` to use CSS variables directly
- No more client-side fetching = no flash!

### 3. Next Steps for Links

Next.js Link components should preserve domain automatically. If links are still redirecting:

1. **Check for absolute URLs**: Search codebase for `http://` or `https://` in Link hrefs
2. **Verify base URL**: Check if `NEXT_PUBLIC_APP_URL` is set correctly in Vercel
3. **Check middleware**: Ensure middleware isn't redirecting

## Database Check

Run this SQL to verify domain setup:

```sql
-- Check all brands and their domains
SELECT 
  id,
  name,
  slug,
  domain,
  is_active,
  config->>'name' as config_name
FROM brands
ORDER BY is_active DESC, domain;
```

**Expected:**
- Grocery brand: `domain = 'grocery.shooshka.online'`
- Ecommerce brand: `domain = 'store.shooshka.online'` (or NULL if default)
- Only ONE brand should have `is_active = true` (the default/fallback brand)

## Testing

1. Visit `grocery.shooshka.online` → Should show grocery brand
2. Visit `store.shooshka.online` → Should show ecommerce brand
3. Click links → Should stay on same domain
4. Colors → Should be correct from start (no flash)

