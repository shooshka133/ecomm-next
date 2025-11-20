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

    // Get the correct redirect URL - use production URL if available, otherwise use current origin
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || ''

    if (!origin) {
      const errorMessage = 'Unable to determine application URL'
      if (onError) onError(errorMessage)
      return { success: false, error: errorMessage }
    }

    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 [Google OAuth] Starting OAuth flow...', {
        origin,
        callbackUrl,
        redirectTo,
      })
    }

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
      if (onSuccess) onSuccess()
      // Redirect to Google OAuth page
      window.location.href = data.url
      return { success: true, redirectUrl: data.url }
    }

    const errorMessage = 'Google sign-in did not return a redirect URL'
    if (onError) onError(errorMessage)
    return { success: false, error: errorMessage }
  } catch (err: any) {
    const errorMessage = err.message || 'An unexpected error occurred with Google sign-in'
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

