# Admin Role Setup Guide

## 🔐 Security Implementation

The admin dashboard is now properly secured. Only users with admin privileges can access it.

## 📋 Setup Steps

### 1. Run the SQL Migration

Run the SQL script to add the `is_admin` field to the `user_profiles` table:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase-admin-role.sql`
3. Copy and paste the contents
4. Click **Run**

This will:
- Add `is_admin` column to `user_profiles` table
- Create an index for faster admin lookups
- Update RLS policies to allow admins to view all profiles

### 2. Make a User an Admin

You have two options:

#### Option A: Update by Email (Recommended)
```sql
UPDATE user_profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');
```

#### Option B: Update by User ID
```sql
UPDATE user_profiles
SET is_admin = true
WHERE id = 'USER_UUID_HERE';
```

**Note:** If the user doesn't have a profile yet, create one first:
```sql
INSERT INTO user_profiles (id, is_admin)
VALUES ((SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'), true);
```

### 3. (Optional) Set Admin Emails via Environment Variable

As a fallback, you can also set admin emails in your `.env.local`:

```env
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

This is useful if a user doesn't have a profile yet, but you want to grant them admin access.

## ✅ Security Features

1. **Database-Level Check**: Primary check uses `is_admin` field in `user_profiles` table
2. **API Route Protection**: All admin API routes check admin status server-side
3. **Page-Level Protection**: Admin page checks status and shows "Access Denied" if not admin
4. **Navbar Visibility**: Admin link only shows for admin users
5. **Middleware Protection**: `/admin` routes require authentication (additional admin check in page/API)

## 🔍 How It Works

1. **User Authentication**: User must be logged in (handled by middleware)
2. **Admin Check**: System checks `user_profiles.is_admin` field
3. **Fallback**: If no profile exists, checks `ADMIN_EMAILS` environment variable
4. **Access Control**: 
   - Admin page shows dashboard if admin
   - Admin page shows "Access Denied" if not admin
   - API routes return 403 Forbidden if not admin
   - Navbar only shows admin link for admins

## 🧪 Testing

1. **Test as Non-Admin User**:
   - Sign in with a regular user account
   - Try to access `/admin` → Should see "Access Denied"
   - Admin link should NOT appear in navbar

2. **Test as Admin User**:
   - Sign in with an admin account
   - Access `/admin` → Should see admin dashboard
   - Admin link should appear in navbar
   - All admin API routes should work

## 📝 Notes

- The admin check is performed server-side in API routes (most secure)
- Client-side checks are for UX only (showing/hiding UI elements)
- Always verify admin status server-side - never trust client-side checks alone
- The `is_admin` field defaults to `false` for all new users

## 🚨 Important Security Notes

- **Never** rely solely on client-side checks
- All admin API routes verify admin status server-side
- The service role key is used to bypass RLS for admin checks (server-side only)
- Regular users cannot modify their own `is_admin` status due to RLS policies

