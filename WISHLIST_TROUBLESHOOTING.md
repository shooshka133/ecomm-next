# Wishlist Troubleshooting Guide

## ❌ Issue: Wishlist Not Saving

If the heart icon doesn't persist after page refresh, the most common cause is that the **wishlist table hasn't been created** in your Supabase database.

## 🔍 Quick Check

1. **Open your browser's Developer Console** (F12)
2. **Click the heart icon** on a product
3. **Look for errors** in the console

If you see an error like:
- `relation "wishlist" does not exist`
- `42P01` error code
- `does not exist`

This means the table hasn't been created yet.

## ✅ Solution: Create the Wishlist Table

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Click **SQL Editor** in the left sidebar

### Step 2: Run the SQL Script

1. Open the file `supabase-wishlist.sql` in your project
2. **Copy the entire contents** of the file
3. **Paste** into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Table Was Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should see a **wishlist** table in the list
3. Click on it to see the columns:
   - `id`
   - `user_id`
   - `product_id`
   - `created_at`

### Step 4: Test Again

1. **Refresh your website**
2. **Sign in** (if not already)
3. **Click the heart icon** on a product
4. **Refresh the page** - heart should still be filled! ✅

## 🐛 Other Common Issues

### Issue: "Permission denied" or RLS error

**Solution:**
- Make sure RLS policies were created
- Re-run the SQL script (it includes `DROP POLICY IF EXISTS` so it's safe)

### Issue: Heart icon doesn't appear

**Solution:**
- Make sure you're **signed in**
- The heart icon only shows for authenticated users

### Issue: Heart works but doesn't persist

**Solution:**
- Check browser console for errors
- Verify the wishlist table exists in Supabase
- Check that RLS policies allow SELECT, INSERT, DELETE

## 📋 Complete SQL Script

If you need to copy it again, here's the full script:

```sql
-- Wishlist table for storing user's favorite products
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, product_id) -- Prevent duplicate wishlist entries
);

-- Enable Row Level Security
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON wishlist;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON wishlist;

-- Wishlist policies (users can only see their own wishlist)
CREATE POLICY "Users can view their own wishlist" ON wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" ON wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" ON wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);
```

## ✅ Verification Checklist

After running the SQL script, verify:

- [ ] `wishlist` table exists in Table Editor
- [ ] Table has 4 columns: `id`, `user_id`, `product_id`, `created_at`
- [ ] RLS is enabled (check in Table Editor)
- [ ] Can click heart icon without errors
- [ ] Heart state persists after page refresh

## 🆘 Still Not Working?

1. **Check Browser Console** (F12) for errors
2. **Check Supabase Logs**:
   - Go to Supabase Dashboard
   - Click **Logs** in left sidebar
   - Look for any errors related to wishlist

3. **Verify Authentication**:
   - Make sure you're signed in
   - Check that `user` object exists in React DevTools

4. **Test Database Connection**:
   - Try adding a product to cart (this uses the same Supabase connection)
   - If cart works but wishlist doesn't, it's likely a table/policy issue

## 📞 Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Check Supabase logs for database errors
3. Verify the SQL script ran successfully (no errors in SQL Editor)

---

**Last Updated:** $(date)

