import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/'

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    )
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }

      // Successfully authenticated
      if (data.session) {
        console.log('OAuth success - Session created for user:', data.session.user.email)
        
        // Create redirect response
        const response = NextResponse.redirect(new URL(next, requestUrl.origin))
        
        // The session cookies are automatically set by exchangeCodeForSession
        // But we can also manually ensure they're set
        if (data.session.access_token) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          })
        }
        
        if (data.session.refresh_token) {
          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          })
        }
        
        return response
      } else {
        console.error('No session returned from exchangeCodeForSession')
        return NextResponse.redirect(
          new URL('/auth?error=No session created', requestUrl.origin)
        )
      }
    } catch (err: any) {
      console.error('Unexpected error in callback:', err)
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(err.message || 'authentication_failed')}`, requestUrl.origin)
      )
    }
  }

  // If no code, redirect to auth page
  return NextResponse.redirect(new URL('/auth?error=No authorization code', requestUrl.origin))
}
