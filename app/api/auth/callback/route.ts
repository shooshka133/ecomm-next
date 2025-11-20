import { NextResponse } from 'next/server'

// This route handler is currently disabled
// Uncomment the code below if you need to use /api/auth/callback for OAuth
export async function GET(request: Request) {
  // Route is disabled - redirect to auth page
  const requestUrl = new URL(request.url)
  return NextResponse.redirect(new URL('/auth', requestUrl.origin))
}

// Original implementation (commented out):
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'

// export async function GET(request: Request) {
//   const requestUrl = new URL(request.url)
//   const code = requestUrl.searchParams.get('code')
//   const error = requestUrl.searchParams.get('error')
//   const errorDescription = requestUrl.searchParams.get('error_description')
//   const next = requestUrl.searchParams.get('next') || '/'

//   // Logging helper for development only
//   const logError = (message: string, data?: any) => {
//     if (process.env.NODE_ENV === 'development') {
//       console.error(message, data || '')
//     }
//   }

//   const log = (message: string, data?: any) => {
//     if (process.env.NODE_ENV === 'development') {
//       console.log(message, data || '')
//     }
//   }

//   // Handle OAuth errors
//   if (error) {
//     logError('OAuth error:', { error, errorDescription })
//     return NextResponse.redirect(
//       new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
//     )
//   }

//   if (code) {
//     const cookieStore = cookies()
//     const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
//     try {
//       const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
//       if (exchangeError) {
//         logError('Error exchanging code for session:', exchangeError)
//         return NextResponse.redirect(
//           new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
//         )
//       }

//       // Successfully authenticated
//       if (data.session) {
//         log('OAuth success - Session created for user:', data.session.user.email)
        
//         // The session cookies are automatically set by exchangeCodeForSession
//         // Create redirect response - redirect to home page with a flag to refresh
//         const redirectUrl = new URL(next === '/' ? '/' : next, requestUrl.origin)
//         redirectUrl.searchParams.set('auth', 'success')
        
//         // Use NextResponse.redirect which will preserve cookies set by exchangeCodeForSession
//         const response = NextResponse.redirect(redirectUrl)
        
//         return response
//       } else {
//         logError('No session returned from exchangeCodeForSession')
//         return NextResponse.redirect(
//           new URL('/auth?error=No session created', requestUrl.origin)
//         )
//       }
//     } catch (err: any) {
//       logError('Unexpected error in callback:', err)
//       return NextResponse.redirect(
//         new URL(`/auth?error=${encodeURIComponent(err.message || 'authentication_failed')}`, requestUrl.origin)
//       )
//     }
//   }

//   // If no code, redirect to auth page
//   return NextResponse.redirect(new URL('/auth?error=No authorization code', requestUrl.origin))
// }
