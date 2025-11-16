# Authentication Fix Guide

## Issue: Can't Sign In After Email Confirmation

If you've confirmed your email but still can't sign in, here are the steps to fix it:

### Option 1: Disable Email Confirmation (Recommended for Development)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Navigate to **Authentication** > **Settings**
3. Scroll down to **Email Auth** section
4. Find **"Enable email confirmations"** toggle
5. **Turn it OFF** (disable email confirmations)
6. Save the changes

Now users can sign in immediately after signing up without needing to confirm their email.

### Option 2: Keep Email Confirmation Enabled

If you want to keep email confirmation enabled:

1. Make sure you've clicked the confirmation link in your email
2. The confirmation link should redirect you to: `http://localhost:3000/auth/callback`
3. After clicking the link, try signing in again

### Common Issues:

1. **"Invalid login credentials"** error:
   - Make sure you're using the correct email and password
   - If you just signed up, make sure you confirmed your email first (if email confirmation is enabled)
   - Try resetting your password if needed

2. **Email not received**:
   - Check your spam folder
   - Make sure the email address is correct
   - In Supabase dashboard, check **Authentication** > **Users** to see if the user exists

3. **Password reset**:
   - Go to `/auth` page
   - You can add a "Forgot Password" link if needed
   - Or reset password directly in Supabase dashboard: **Authentication** > **Users** > Select user > Reset password

### Testing Authentication:

1. **Sign Up**: Create a new account
2. **If email confirmation is disabled**: You should be able to sign in immediately
3. **If email confirmation is enabled**: Check your email and click the confirmation link, then sign in

### For Production:

- Keep email confirmation **ENABLED** for security
- Make sure your email templates are configured properly
- Test the full flow: Sign up → Confirm email → Sign in

