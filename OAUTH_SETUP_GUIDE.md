# Google OAuth Setup & Troubleshooting Guide

Complete guide for implementing Google OAuth with Supabase in Next.js 14 App Router.

---

## 🎯 What Was The Problem? (Root Cause Analysis)

### The Journey of Bugs We Fixed:

#### **1. Initial Problem: Build Error**
**Symptoms:**
```
Type error: File '/vercel/path0/app/api/auth/callback/route.ts' is not a module.
```

**Root Cause:**
- `app/api/auth/callback/route.ts` was entirely commented out
- Next.js saw it as "not a module" → build failed

**Fix:**
- Deleted conflicting old route at `app/api/auth/callback/route.ts`
- Moved to correct App Router location: `app/auth/callback/route.ts`

---

#### **2. Redirect Configuration Hell**
**Symptoms:**
- OAuth code landing on homepage instead of callback route
- URL showed: `https://shooshka.online/?code=...` (wrong!)
- Should be: `https://shooshka.online/auth/callback?code=...`

**Root Causes (Multiple compounding issues):**

**Issue A: Malformed Supabase Redirect URLs**
```
❌ BAD (two URLs concatenated on one line):
http://localhost:3000/auth/callbackhttps://shooshka.online/auth/callback

✅ GOOD (separate lines):
http://localhost:3000/auth/callback
https://shooshka.online/auth/callback
```

**Issue B: Wrong Path in Supabase**
```
❌ OLD PATH: /api/auth/callback (Pages Router style)
✅ NEW PATH: /auth/callback (App Router style)
```

**Issue C: Vercel Custom Domain Misconfiguration**
- Vercel domain had 308 redirect enabled
- This stripped the OAuth `code` parameter
- **Fix:** Changed to "Connect to environment" with "No Redirect"

**Issue D: Missing/Wrong Environment Variable**
```
❌ NEXT_PUBLIC_APP_URL was missing or incorrect in Vercel
✅ Set to: https://shooshka.online
```

**Fix:**
1. Fixed Supabase Redirect URLs (one per line, correct paths)
2. Updated Google Cloud Console redirect URIs
3. Changed Vercel domain configuration to "No Redirect"
4. Set correct `NEXT_PUBLIC_APP_URL` in Vercel

---

#### **3. The Final Boss: Session Persistence Bug** 🐛
**Symptoms:**
- Server logs showed: "✅ SUCCESS! Authentication complete"
- Browser showed: "Auth state changed: INITIAL_SESSION undefined"
- `localStorage` was `null` (no auth token)
- User appeared not logged in despite successful OAuth

**Root Cause:**
Using the **WRONG Supabase client type** for route handlers!

```typescript
// ❌ WRONG - In API Route Handler
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
const supabase = createServerComponentClient({ cookies: () => cookieStore })

// ✅ CORRECT - In API Route Handler
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
```

**Why it matters:**
- **Server Component client:** Designed for React Server Components, reads cookies but doesn't always write them properly in route handlers
- **Route Handler client:** Explicitly designed for API routes, properly writes auth cookies to the browser

**Fix:**
1. Changed `createServerComponentClient` to `createRouteHandlerClient`
2. Added explicit `setSession()` call to ensure cookies are written:
```typescript
await supabase.auth.setSession({
  access_token: data.session.access_token,
  refresh_token: data.session.refresh_token,
})
```

---

## 📚 Complete Implementation Guide

### **Part 1: Supabase Setup**

#### Step 1: Enable Google Provider in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click **Enable**
5. You'll need Google OAuth credentials (get these in Step 2)

---

#### Step 2: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure OAuth consent screen first
6. Select **Web application**
7. Configure URLs:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-vercel-url.vercel.app
https://your-custom-domain.com
https://YOUR-PROJECT-REF.supabase.co
```

**Authorized redirect URIs:**
```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

**⚠️ CRITICAL:** The redirect URI MUST point to Supabase, NOT your app!

8. Copy **Client ID** and **Client Secret**

---

#### Step 3: Configure Supabase with Google Credentials

1. Back in Supabase Dashboard
2. **Authentication** → **Providers** → **Google**
3. Paste:
   - **Client ID** (from Google)
   - **Client Secret** (from Google)
4. Click **Save**

---

#### Step 4: Configure Redirect URLs in Supabase

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** (your production URL):
   ```
   https://your-custom-domain.com
   ```

3. Set **Redirect URLs** (⚠️ ONE PER LINE, NO SPACES):
   ```
   http://localhost:3000/auth/callback
   https://your-vercel-url.vercel.app/auth/callback
   https://your-custom-domain.com/auth/callback
   ```

**⚠️ COMMON MISTAKES:**
- ❌ Two URLs on one line: `http://localhost:3000/auth/callbackhttps://prod.com/auth/callback`
- ❌ Using old path: `/api/auth/callback`
- ❌ Extra spaces or trailing slashes
- ✅ ONE URL per line, exact path: `/auth/callback`

---

### **Part 2: Next.js Project Setup**

#### Step 1: Install Dependencies

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

---

#### Step 2: Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Production URL (CRITICAL for OAuth!)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Optional: Service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ MUST also set in Vercel:**
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add ALL the same variables
3. Set for **Production**, **Preview**, and **Development** environments

---

### **Part 3: Code Implementation**

#### File 1: `lib/supabase/client.ts` (Client-side Supabase)

```typescript
'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Create a Supabase client for client-side use
 * Use this in 'use client' components
 */
export const createSupabaseClient = () => {
  return createClientComponentClient();
};
```

**🔑 Key Point:** Only create ONE client instance using `createClientComponentClient`.

---

#### File 2: `lib/auth/google.ts` (Client-side OAuth Helper)

```typescript
'use client'

import { createSupabaseClient } from '@/lib/supabase/client'

export interface GoogleOAuthOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  redirectTo?: string
}

export interface GoogleOAuthResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

/**
 * Client-side helper for Google OAuth sign-in
 * Initiates the OAuth flow and redirects to Google
 */
export async function signInWithGoogle(
  options: GoogleOAuthOptions = {}
): Promise<GoogleOAuthResult> {
  const { onSuccess, onError, redirectTo = '/' } = options

  try {
    const supabase = createSupabaseClient()

    // CRITICAL: Use production URL if available
    // This ensures correct callback URL in production
    const origin =
      typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
        : process.env.NEXT_PUBLIC_APP_URL || ''

    if (!origin) {
      const errorMessage = 'Unable to determine application URL'
      if (onError) onError(errorMessage)
      return { success: false, error: errorMessage }
    }

    // Build callback URL - this is where Google redirects back
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

    console.log('🔗 [Google OAuth] Starting OAuth flow...', {
      origin,
      callbackUrl,
      redirectTo,
    })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      const errorMessage = error.message || 'An error occurred with Google sign-in'
      if (onError) onError(errorMessage)
      return { success: false, error: errorMessage }
    }

    if (data?.url) {
      console.log('✅ [Google OAuth] Supabase returned URL:', data.url)
      if (onSuccess) onSuccess()
      // Redirect to Google OAuth page
      window.location.href = data.url
      return { success: true, redirectUrl: data.url }
    }

    const errorMessage = 'Google sign-in did not return a redirect URL'
    if (onError) onError(errorMessage)
    return { success: false, error: errorMessage }
  } catch (err: any) {
    const errorMessage = err.message || 'An unexpected error occurred'
    if (onError) onError(errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Check if Google OAuth is available/configured
 */
export function isGoogleOAuthAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const supabase = createSupabaseClient()
    return !!supabase
  } catch {
    return false
  }
}
```

**🔑 Key Points:**
- Runs in browser (client-side)
- Prioritizes `NEXT_PUBLIC_APP_URL` for production consistency
- Builds `callbackUrl` pointing to `/auth/callback`
- Redirects user to Google login page

---

#### File 3: `app/auth/callback/route.ts` (Server-side Callback Handler)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * OAuth Callback Route Handler
 * 
 * This route handles the OAuth callback after user signs in with Google.
 * Google redirects to Supabase, which then redirects here with a code.
 * We exchange the code for a session and redirect to the app.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const next = url.searchParams.get('next') || '/'

  // Handle OAuth errors from provider
  if (error) {
    console.error('[OAuth Callback] Provider error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, url.origin)
    )
  }

  // No code provided
  if (!code) {
    console.error('[OAuth Callback] No authorization code provided')
    return NextResponse.redirect(
      new URL('/auth?error=No authorization code', url.origin)
    )
  }

  try {
    const cookieStore = cookies()
    
    // CRITICAL: Use createRouteHandlerClient for API routes!
    // This ensures cookies are properly set in the browser
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    console.log('[OAuth Callback] Exchanging code for session...')
    
    // Exchange the OAuth code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[OAuth Callback] Error exchanging code:', exchangeError)
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, url.origin)
      )
    }

    if (!data?.session) {
      console.error('[OAuth Callback] No session returned')
      return NextResponse.redirect(
        new URL('/auth?error=No session created', url.origin)
      )
    }

    console.log('[OAuth Callback] ✅ Success! User:', data.session.user.email)
    
    // CRITICAL: Explicitly set the session to ensure cookies are written
    // Without this, cookies may not persist in the browser
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
    
    console.log('[OAuth Callback] Session set in Supabase client')
    
    // Redirect to the intended destination
    const redirectUrl = new URL(next, url.origin)
    const response = NextResponse.redirect(redirectUrl)
    
    // Prevent caching to ensure fresh auth state
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (err: any) {
    console.error('[OAuth Callback] Unexpected error:', err)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(err.message || 'Authentication failed')}`, url.origin)
    )
  }
}
```

**🔑 Key Points:**
- **MUST use** `createRouteHandlerClient` (not `createServerComponentClient`)
- Exchanges OAuth `code` for session
- **Explicitly calls** `setSession()` to write cookies
- Redirects to final destination with proper cache headers

---

#### File 4: `app/auth/page.tsx` (Sign-In Page)

```typescript
'use client'

import { useState } from 'react'
import { signInWithGoogle } from '@/lib/auth/google'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    await signInWithGoogle({
      redirectTo: '/', // Where to go after sign-in
      onError: (err) => {
        setError(err)
        setLoading(false)
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                {/* Google logo SVG */}
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>
      </div>
    </div>
  )
}
```

---

### **Part 4: Vercel Configuration**

#### Step 1: Custom Domain Setup (If Using)

1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain: `your-domain.com`
3. **CRITICAL:** Configure as **"Connect to an environment"** with **"No Redirect"**
   - ❌ NOT "Redirect to..." (this strips OAuth code!)
   - ✅ "Production Environment, No Redirect"

#### Step 2: DNS Configuration

Point your domain to Vercel:
- **CNAME Record:** `your-domain.com` → `cname.vercel-dns.com`

#### Step 3: Environment Variables in Vercel

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (if needed)
```

3. **Set for all environments:** Production, Preview, Development

---

## 🔍 Common Pitfalls & How to Avoid

### ❌ Pitfall 1: Using Wrong Supabase Client

```typescript
// ❌ WRONG - In API Route Handler
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// ✅ CORRECT - In API Route Handler
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// ✅ CORRECT - In Client Component
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// ✅ CORRECT - In Server Component (page.tsx, layout.tsx)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
```

**Rule:**
- API Routes (`app/*/route.ts`) → `createRouteHandlerClient`
- Server Components (`page.tsx`, `layout.tsx`) → `createServerComponentClient`
- Client Components (`'use client'`) → `createClientComponentClient`

---

### ❌ Pitfall 2: Malformed Supabase Redirect URLs

```
❌ BAD (two URLs on one line):
http://localhost:3000/auth/callbackhttps://prod.com/auth/callback

✅ GOOD (separate lines):
http://localhost:3000/auth/callback
https://prod.com/auth/callback
```

**How to fix:**
1. Go to Supabase → Authentication → URL Configuration
2. Check Redirect URLs
3. Ensure ONE URL per line, no extra spaces

---

### ❌ Pitfall 3: Wrong Redirect Path

```
❌ OLD (Pages Router):
https://your-site.com/api/auth/callback

✅ NEW (App Router):
https://your-site.com/auth/callback
```

**Update everywhere:**
- Supabase Redirect URLs
- Google Cloud Console redirect URIs (no, keep Supabase URL)
- Your code

---

### ❌ Pitfall 4: Missing `NEXT_PUBLIC_APP_URL`

**Problem:**
- In production, `window.location.origin` might be wrong during SSR
- Callback URL becomes incorrect

**Solution:**
- Always set `NEXT_PUBLIC_APP_URL` in Vercel env vars
- Use it as the primary source for origin:
```typescript
const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
```

---

### ❌ Pitfall 5: Domain Redirect Enabled in Vercel

**Problem:**
- Vercel domain configured with "Redirect to..."
- 308 redirect strips OAuth `code` parameter
- User lands on homepage without code

**Solution:**
- Vercel Dashboard → Settings → Domains
- Click domain → **Edit**
- Change to: "Connect to Production, No Redirect"

---

### ❌ Pitfall 6: Multiple Supabase Client Instances

**Problem:**
- Creating multiple clients causes "Multiple GoTrueClient instances" warning
- Can cause auth state sync issues

**Solution:**
- Use singleton pattern
- Import from centralized file (`lib/supabase/client.ts`)
- Never call `createClient()` directly

---

## 🧪 Testing Checklist

### ✅ Localhost Testing

- [ ] Visit `http://localhost:3000/auth`
- [ ] Click "Sign in with Google"
- [ ] Redirects to Google login page
- [ ] Select Google account
- [ ] Redirects back to `http://localhost:3000/` (or your `redirectTo`)
- [ ] Top-right shows user email (signed in)
- [ ] Browser console shows: `Auth state changed: SIGNED_IN`
- [ ] Run in console: `localStorage.getItem('sb-xxx-auth-token')` → Should show JSON (not null)
- [ ] Refresh page → Still signed in

### ✅ Production Testing (Vercel URL)

- [ ] Visit `https://your-project.vercel.app/auth`
- [ ] Click "Sign in with Google"
- [ ] OAuth flow completes
- [ ] Redirects back correctly
- [ ] User is signed in
- [ ] Session persists after refresh

### ✅ Custom Domain Testing

- [ ] Visit `https://your-domain.com/auth`
- [ ] OAuth flow works
- [ ] Redirects back correctly
- [ ] User is signed in

### ✅ Error Scenarios

- [ ] Cancel OAuth flow → Redirects to `/auth` with error
- [ ] Invalid code → Shows error message
- [ ] Network failure → Handles gracefully

---

## 🐛 Debugging Guide

### Issue: "No authorization code"

**Symptoms:**
- Callback route logs: "CRITICAL: No authorization code in callback URL!"
- User lands on `/auth?error=No authorization code`

**Causes:**
1. Wrong redirect URL in Supabase
2. Domain redirect stripping `code` parameter
3. Wrong callback path in client code

**Debug:**
1. Check Supabase logs for OAuth attempts
2. Check browser network tab for redirects
3. Look for 308 redirects (Vercel domain issue)

**Fix:**
- Verify Supabase Redirect URLs
- Check Vercel domain configuration
- Ensure `NEXT_PUBLIC_APP_URL` is correct

---

### Issue: Session created but not persisting

**Symptoms:**
- Server logs: "✅ SUCCESS! Authentication complete"
- Browser: `localStorage` is null
- User appears not signed in

**Cause:**
- Using `createServerComponentClient` instead of `createRouteHandlerClient`

**Fix:**
```typescript
// Change this:
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// To this:
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
```

---

### Issue: "Multiple GoTrueClient instances detected"

**Symptoms:**
- Console warning about multiple clients
- Inconsistent auth state

**Cause:**
- Creating Supabase clients in multiple places
- Calling `createClient()` directly

**Fix:**
- Use centralized `lib/supabase/client.ts`
- Remove any direct `createClient()` calls
- Import from one source

---

### Issue: Redirect loop

**Symptoms:**
- OAuth keeps redirecting back and forth
- URL constantly changing

**Causes:**
1. Auth page redirects signed-in users back to itself
2. Middleware interfering with callback route
3. Wrong redirect logic

**Debug:**
1. Check auth page `useEffect` for redirect logic
2. Check middleware configuration
3. Look for circular redirects

**Fix:**
- Exclude `/auth/callback` from middleware
- Fix auth page redirect conditions
- Check `next` parameter handling

---

## 📖 OAuth Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│  1. User clicks "Sign in with Google"                             │
│     ↓                                                              │
│  2. Client calls signInWithGoogle()                               │
│     - Builds callbackUrl: https://app.com/auth/callback?next=/   │
│     - Calls supabase.auth.signInWithOAuth()                       │
│     ↓                                                              │
│  3. Supabase returns Google OAuth URL                             │
│     ↓                                                              │
│  4. Browser redirects to Google login                             │
│     https://accounts.google.com/...                               │
│     ↓                                                              │
│  5. User signs in with Google                                     │
│     ↓                                                              │
│  6. Google redirects to Supabase                                  │
│     https://xxx.supabase.co/auth/v1/callback?code=...            │
│     ↓                                                              │
│  7. Supabase processes OAuth                                      │
│     - Exchanges code with Google                                  │
│     - Creates session code                                        │
│     ↓                                                              │
│  8. Supabase redirects to your app                                │
│     https://app.com/auth/callback?code=abc123&next=/             │
│     ↓                                                              │
│  9. Your callback route (GET handler)                             │
│     - Creates RouteHandlerClient                                  │
│     - Calls exchangeCodeForSession(code)                          │
│     - Calls setSession() to write cookies                         │
│     ↓                                                              │
│  10. Redirect to final destination                                │
│     https://app.com/                                              │
│     ↓                                                              │
│  11. User is signed in! 🎉                                        │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📝 Summary

### What Was Broken:
1. ❌ Build error: Invalid module at `app/api/auth/callback/route.ts`
2. ❌ Wrong Supabase redirect URLs (malformed, wrong path)
3. ❌ Wrong Vercel domain configuration (308 redirect)
4. ❌ Missing/wrong `NEXT_PUBLIC_APP_URL`
5. ❌ **Wrong Supabase client type** (used `createServerComponentClient` in route handler)
6. ❌ Missing explicit `setSession()` call

### What Fixed It:
1. ✅ Deleted old route, moved to `app/auth/callback/route.ts`
2. ✅ Fixed Supabase redirect URLs (one per line, correct path)
3. ✅ Changed Vercel domain to "No Redirect"
4. ✅ Set correct `NEXT_PUBLIC_APP_URL` in Vercel
5. ✅ **Changed to `createRouteHandlerClient`** in callback route
6. ✅ Added explicit `setSession()` call after code exchange

### The Critical Fix:
```typescript
// app/auth/callback/route.ts

// BEFORE: ❌
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
const supabase = createServerComponentClient({ cookies: () => cookieStore })

// AFTER: ✅
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

// Plus:
await supabase.auth.setSession({
  access_token: data.session.access_token,
  refresh_token: data.session.refresh_token,
})
```

---

## 🎉 Final Result

**OAuth now works perfectly:**
- ✅ Localhost: Works
- ✅ Vercel URL: Works
- ✅ Custom domain: Works
- ✅ Session persists: Yes
- ✅ Cookies set correctly: Yes
- ✅ User stays signed in: Yes

**Time to debug:** ~3 hours (multiple configuration issues)
**Key learning:** Always use the correct Supabase client for your context!

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js 14 App Router Docs](https://nextjs.org/docs/app)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**Created:** Based on real debugging session
**Last Updated:** November 2024
**Status:** ✅ Working Solution

