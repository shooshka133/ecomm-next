import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const next = url.searchParams.get('next') || '/'

  const logError = (msg: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[OAuth Callback]', msg, data || '')
    }
  }
  const log = (msg: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[OAuth Callback]', msg, data || '')
    }
  }

  // Handle OAuth errors from provider
  if (error) {
    logError('OAuth provider error', { error, errorDescription })
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, url.origin))
  }

  // Handle OAuth code (works for both OAuth providers and email confirmation)
  if (code) {
    try {
      const supabase = createServerComponentClient({ cookies: () => cookies() })
      log('Exchanging code for session...', { code: code.substring(0, 20) + '...', nextUrl: next })
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        logError('Error exchanging code for session', exchangeError)
        return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, url.origin))
      }

      if (!data.session) {
        logError('No session returned from Supabase')
        return NextResponse.redirect(new URL('/auth?error=No session created', url.origin))
      }

      log('Authentication success - Redirecting to:', { 
        email: data.session.user.email, 
        id: data.session.user.id,
        redirectTo: next 
      })
      
      // Clean redirect - don't add auth=success parameter
      const redirectUrl = new URL(next, url.origin)
      
      // Create response with redirect
      const response = NextResponse.redirect(redirectUrl)
      
      // Ensure cookies are set properly
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      
      return response
    } catch (err: any) {
      logError('Unexpected error', err)
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(err.message || 'authentication_failed')}`, url.origin))
    }
  }

  // No code provided
  logError('No authorization code in callback URL')
  return NextResponse.redirect(new URL('/auth?error=No authorization code', url.origin))
}




// import { NextRequest, NextResponse } from 'next/server'
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'

// /**
//  * OAuth Callback Route Handler
//  * Handles the redirect from Google OAuth and exchanges the code for a session
//  */
// export async function GET(request: NextRequest) {
//   const requestUrl = new URL(request.url)
//   const code = requestUrl.searchParams.get('code')
//   const error = requestUrl.searchParams.get('error')
//   const errorDescription = requestUrl.searchParams.get('error_description')
//   const next = requestUrl.searchParams.get('next') || '/'

//   // Logging helper for development only
//   const logError = (message: string, data?: any) => {
//     if (process.env.NODE_ENV === 'development') {
//       console.error(`[OAuth Callback] ${message}`, data || '')
//     }
//   }

//   const log = (message: string, data?: any) => {
//     if (process.env.NODE_ENV === 'development') {
//       console.log(`[OAuth Callback] ${message}`, data || '')
//     }
//   }

//   // Handle OAuth errors from provider
//   if (error) {
//     logError('OAuth error from provider:', { error, errorDescription })
//     const errorMessage = errorDescription || error
//     return NextResponse.redirect(
//       new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
//     )
//   }

//   // Exchange code for session
//   if (code) {
//     try {
//       const cookieStore = cookies()
//       const supabase = createServerComponentClient({ cookies: () => cookieStore })

//       log('Exchanging code for session...', { code: code.substring(0, 20) + '...' })

//       const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

//       if (exchangeError) {
//         logError('Error exchanging code for session:', exchangeError)
//         return NextResponse.redirect(
//           new URL(
//             `/auth?error=${encodeURIComponent(exchangeError.message)}`,
//             requestUrl.origin
//           )
//         )
//       }

//       // Successfully authenticated
//       if (data.session) {
//         log('OAuth success - Session created for user:', {
//           email: data.session.user.email,
//           userId: data.session.user.id,
//         })

//         // The session cookies are automatically set by exchangeCodeForSession
//         // Redirect to the requested page (or homepage)
//         const redirectUrl = new URL(next === '/' ? '/' : next, requestUrl.origin)
        
//         // Add success flag to help client-side detect successful auth
//         redirectUrl.searchParams.set('auth', 'success')

//         return NextResponse.redirect(redirectUrl)
//       } else {
//         logError('No session returned from exchangeCodeForSession')
//         return NextResponse.redirect(
//           new URL('/auth?error=No session created', requestUrl.origin)
//         )
//       }
//     } catch (err: any) {
//       logError('Unexpected error in callback:', err)
//       return NextResponse.redirect(
//         new URL(
//           `/auth?error=${encodeURIComponent(err.message || 'authentication_failed')}`,
//           requestUrl.origin
//         )
//       )
//     }
//   }

//   // If no code, redirect to auth page
//   logError('No authorization code in callback URL')
//   return NextResponse.redirect(
//     new URL('/auth?error=No authorization code', requestUrl.origin)
//   )
// }
