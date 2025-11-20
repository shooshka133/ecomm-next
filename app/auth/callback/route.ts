import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * OAuth Callback Route Handler
 * Handles the redirect from Google OAuth and exchanges the code for a session
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/'

  // Logging helper for development only
  const logError = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[OAuth Callback] ${message}`, data || '')
    }
  }

  const log = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OAuth Callback] ${message}`, data || '')
    }
  }

  // Handle OAuth errors from provider
  if (error) {
    logError('OAuth error from provider:', { error, errorDescription })
    const errorMessage = errorDescription || error
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }

  // Exchange code for session
  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createServerComponentClient({ cookies: () => cookieStore })

      log('Exchanging code for session...', { code: code.substring(0, 20) + '...' })

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        logError('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(
          new URL(
            `/auth?error=${encodeURIComponent(exchangeError.message)}`,
            requestUrl.origin
          )
        )
      }

      // Successfully authenticated
      if (data.session) {
        log('OAuth success - Session created for user:', {
          email: data.session.user.email,
          userId: data.session.user.id,
        })

        // The session cookies are automatically set by exchangeCodeForSession
        // Redirect to the requested page (or homepage)
        const redirectUrl = new URL(next === '/' ? '/' : next, requestUrl.origin)
        
        // Add success flag to help client-side detect successful auth
        redirectUrl.searchParams.set('auth', 'success')

        return NextResponse.redirect(redirectUrl)
      } else {
        logError('No session returned from exchangeCodeForSession')
        return NextResponse.redirect(
          new URL('/auth?error=No session created', requestUrl.origin)
        )
      }
    } catch (err: any) {
      logError('Unexpected error in callback:', err)
      return NextResponse.redirect(
        new URL(
          `/auth?error=${encodeURIComponent(err.message || 'authentication_failed')}`,
          requestUrl.origin
        )
      )
    }
  }

  // If no code, redirect to auth page
  logError('No authorization code in callback URL')
  return NextResponse.redirect(
    new URL('/auth?error=No authorization code', requestUrl.origin)
  )
}
