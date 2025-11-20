/**
 * Google OAuth Authentication Utility
 * Handles Google sign-in flow with proper error handling and logging
 */

import { createSupabaseClient } from '@/lib/supabase/client'

export interface GoogleOAuthOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  redirectTo?: string
}

//------------------------------

// response.cookies.set('sb-access-token', data.session.access_token, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production', // false on localhost
//   sameSite: 'lax',
//   path: '/',
// })

//----------------------------
// ---------- OLD IMPLEMENTATION (FULLY COMMENTED — DO NOT DELETE) ----------
/*
export interface GoogleOAuthResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

export async function signInWithGoogle(
  options: GoogleOAuthOptions = {}
): Promise<GoogleOAuthResult> {
  const { onSuccess, onError, redirectTo = '/' } = options

  try {
    const supabase = createSupabaseClient()
    
    const redirectUrl = window.location.origin
    const callbackUrl = `${redirectUrl}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`

    console.log('🔗 [Google OAuth] Starting OAuth flow...', {
      redirectUrl,
      callbackUrl,
      currentOrigin: window.location.origin,
      envUrl: process.env.NEXT_PUBLIC_APP_URL,
      redirectTo
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
      console.error('❌ [Google OAuth] Error:', error)
      const errorMessage = error.message || 'An error occurred with Google sign-in'
      if (onError) onError(errorMessage)
      return { success: false, error: errorMessage }
    }

    if (data.url) {
      console.log('✅ [Google OAuth] Redirecting to Google...', {
        urlPrefix: data.url.substring(0, 100) + '...',
        fullUrl: data.url
      })

      if (onSuccess) onSuccess()
      window.location.href = data.url
      return { success: true, redirectUrl: data.url }
    } else {
      const errorMessage = 'Failed to initiate Google sign-in. Please try again.'
      if (onError) onError(errorMessage)
      return { success: false, error: errorMessage }
    }
  } catch (error: any) {
    const errorMessage = error.message || 'An unexpected error occurred with Google sign-in'
    if (onError) onError(errorMessage)
    return { success: false, error: errorMessage }
  }
}
*/
// ------------------------------------------------------------------------



// ---------- NEW FIXED VERSION ----------
export interface GoogleOAuthResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

/**
 * Corrected Google OAuth flow.
 *
 * FIXES:
 *  - Uses window.location.origin (localhost or vercel or shooshka automatically)
 *  - Ensures Supabase session is applied on the SAME domain the user logged in from
 *  - No more redirect issues
 */
export async function signInWithGoogle(
  options: GoogleOAuthOptions = {}
): Promise<GoogleOAuthResult> {
  const { onSuccess, onError, redirectTo = '/' } = options

  try {
    const supabase = createSupabaseClient()

    // FIX: detect current domain automatically
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL

    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(
      redirectTo
    )}` 
    // const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`


    console.log('🔗 [Google OAuth - FIXED] Starting OAuth flow...', {
      origin,
      callbackUrl,
      envUrl: process.env.NEXT_PUBLIC_APP_URL,
      redirectTo,
    })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
      },
    })

    if (error) {
      const err = error.message || 'An error occurred with Google sign-in'
      if (onError) onError(err)
      return { success: false, error: err }
    }

    if (data?.url) {
      if (onSuccess) onSuccess()
      window.location.href = data.url
      return { success: true, redirectUrl: data.url }
    }

    const fallbackErr = 'Google sign-in did not return a redirect URL.'
    if (onError) onError(fallbackErr)
    return { success: false, error: fallbackErr }
  } catch (err: any) {
    const msg = err.message || 'Unexpected Google sign-in error'
    if (onError) onError(msg)
    return { success: false, error: msg }
  }
}
// ------------------------------------------------------------------------


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
