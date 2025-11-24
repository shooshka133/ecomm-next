-- Add admin role to user_profiles table
-- Run this in your Supabase SQL Editor

-- Add is_admin column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin) WHERE is_admin = true;

-- Update RLS policy to allow admins to view all profiles (for admin dashboard)
-- Note: This allows admins to see all profiles, but regular users can still only see their own
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Instructions:
-- To make a user an admin, run this SQL (replace USER_EMAIL with the actual email):
-- UPDATE user_profiles
-- SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'USER_EMAIL@example.com');
--
-- Or update by user ID:
-- UPDATE user_profiles
-- SET is_admin = true
-- WHERE id = 'USER_UUID_HERE';

