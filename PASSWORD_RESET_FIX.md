# Password Reset Link Fix

## Issue
The password reset link received in email doesn't contain a valid link - it just redirects to the website.

## Solution

### 1. Code Changes (Already Applied)
- ✅ Updated `app/auth/page.tsx` to use `NEXT_PUBLIC_APP_URL` for the redirect URL
- ✅ Updated `app/auth/reset-password/page.tsx` to properly exchange tokens from the email link

### 2. Supabase Configuration (REQUIRED)

You **MUST** configure the redirect URL in your Supabase dashboard:

1. Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Navigate to **Authentication** > **URL Configuration**
3. Under **Redirect URLs**, add:
   ```
   https://shooshka.online/auth/reset-password
   ```
   (For local development, also add: `http://localhost:3000/auth/reset-password`)

4. **Save** the changes

### 3. How Password Reset Works

1. User clicks "Forgot password?" on `/auth` page
2. User enters their email
3. Supabase sends an email with a link like:
   ```
   https://shooshka.online/auth/reset-password#access_token=xxx&type=recovery&refresh_token=yyy
   ```
4. When user clicks the link:
   - The page extracts tokens from the URL hash (`#access_token=...`)
   - Exchanges tokens for a session using `supabase.auth.setSession()`
   - User can then enter a new password
   - Password is updated using `supabase.auth.updateUser()`

### 4. Testing

1. Go to `/auth` page
2. Click "Forgot password?"
3. Enter your email
4. Check your email for the reset link
5. Click the link - it should:
   - Redirect to `/auth/reset-password`
   - Show "Please enter your new password below."
   - Allow you to set a new password

### 5. Common Issues

**Issue: Link redirects but shows "Invalid reset link"**
- **Cause**: Redirect URL not configured in Supabase
- **Fix**: Add the redirect URL in Supabase dashboard (step 2 above)

**Issue: "Invalid or expired reset link"**
- **Cause**: Tokens expired (links expire after 1 hour by default)
- **Fix**: Request a new password reset link

**Issue: Link doesn't work in production**
- **Cause**: `NEXT_PUBLIC_APP_URL` not set correctly in Vercel
- **Fix**: Set `NEXT_PUBLIC_APP_URL=https://shooshka.online` in Vercel environment variables

### 6. Environment Variables

Make sure these are set in Vercel:
- `NEXT_PUBLIC_APP_URL=https://shooshka.online`
- `NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`

### 7. Email Template (Optional)

If you want to customize the password reset email:
1. Go to Supabase Dashboard > Authentication > Email Templates
2. Select "Reset Password" template
3. Customize the template
4. Make sure the link uses: `{{ .ConfirmationURL }}`

---

## Summary

The fix includes:
1. ✅ Proper token exchange in `app/auth/reset-password/page.tsx`
2. ✅ Using production URL in `app/auth/page.tsx`
3. ⚠️ **YOU MUST**: Configure redirect URL in Supabase dashboard

After configuring the redirect URL in Supabase, the password reset should work correctly!

