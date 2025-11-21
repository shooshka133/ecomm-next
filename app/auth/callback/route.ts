import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const next = url.searchParams.get('next') || '/'

  // ALWAYS log in production to debug issues
  const logError = (msg: string, data?: any) => {
    console.error('[OAuth Callback ERROR]', msg, data || '')
  }
  const log = (msg: string, data?: any) => {
    console.log('[OAuth Callback]', msg, data || '')
  }

  // Log all incoming parameters
  log('Callback invoked with params:', {
    hasCode: !!code,
    hasError: !!error,
    code: code?.substring(0, 20) + '...',
    error,
    errorDescription,
    next,
    fullUrl: url.href
  })

  // Handle OAuth errors from provider
  if (error) {
    logError('OAuth provider error detected', { error, errorDescription })
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, url.origin))
  }

  // No code provided - this shouldn't happen
  if (!code) {
    logError('CRITICAL: No authorization code in callback URL!', {
      allParams: Object.fromEntries(url.searchParams.entries()),
      url: url.href
    })
    return NextResponse.redirect(new URL('/auth?error=No authorization code', url.origin))
  }

  // Handle OAuth code (works for both OAuth providers and email confirmation)
  try {
    log('Creating Supabase client...')
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    log('Exchanging code for session...', { 
      codePrefix: code.substring(0, 20) + '...',
      nextUrl: next 
    })
    
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      logError('FAILED: Error exchanging code for session', {
        error: exchangeError,
        message: exchangeError.message,
        status: exchangeError.status,
        code: exchangeError.code
      })
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(exchangeError.message || 'Authentication failed')}`, url.origin)
      )
    }

    if (!data?.session) {
      logError('FAILED: No session returned from Supabase', { 
        hasData: !!data,
        hasSession: !!data?.session,
        data 
      })
      return NextResponse.redirect(new URL('/auth?error=No session created', url.origin))
    }

    log('✅ SUCCESS! Authentication complete', { 
      email: data.session.user.email, 
      userId: data.session.user.id,
      hasAccessToken: !!data.session.access_token,
      redirectTo: next 
    })
    
    // IMPORTANT: Set the session explicitly to ensure cookies are properly set
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
    
    log('Session set in Supabase client')
    
    // Create redirect URL with a small delay parameter to ensure cookies propagate
    const redirectUrl = new URL(next, url.origin)
    redirectUrl.searchParams.set('_t', Date.now().toString())
    
    log('Creating redirect response to:', redirectUrl.href)
    
    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl)
    
    // Ensure cookies are set properly and prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    log('Redirect response created successfully')
    
    return response
  } catch (err: any) {
    logError('EXCEPTION: Unexpected error in callback', {
      error: err,
      message: err?.message,
      stack: err?.stack,
      name: err?.name
    })
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(err.message || 'authentication_failed')}`, url.origin)
    )
  }
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
