import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Get domain from request
  const host = req.headers.get('host') || req.headers.get('x-forwarded-host')
  const domain = host ? host.split(':')[0] : undefined

  // Store domain in request headers for use in server components
  // Note: Brand slug lookup is done in server components (not in Edge Runtime)
  // to avoid Node.js module dependencies (path, fs, etc.)
  const requestHeaders = new Headers(req.headers)
  if (domain) {
    requestHeaders.set('x-brand-domain', domain)
  }

  // Protect only /orders (or other private pages)
  const isProtected = pathname.startsWith('/orders') || 
                      pathname.startsWith('/cart') || 
                      pathname.startsWith('/checkout') ||
                      pathname.startsWith('/admin')

  if (isProtected) {
    // Check for Supabase session
    // Supabase stores auth tokens in cookies with pattern: sb-<project-ref>-auth-token
    // Check all cookies for Supabase auth tokens
    const cookies = req.cookies.getAll()
    const hasAuthCookie = cookies.some(cookie => {
      const name = cookie.name.toLowerCase()
      const value = cookie.value || ''
      // Check for Supabase auth token patterns
      return (name.includes('auth-token') || 
              (name.startsWith('sb-') && name.includes('auth'))) && 
             value.length > 10 // Ensure it's not empty
    })

    if (!hasAuthCookie) {
      // User is not authenticated, redirect to auth with return URL
      const authUrl = new URL('/auth', req.url)
      // Preserve the full path including query parameters (e.g., /orders?orderId=xxx)
      authUrl.searchParams.set('next', pathname + search)
      return NextResponse.redirect(authUrl)
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/cart/:path*', 
    '/checkout/:path*', 
    '/orders/:path*', 
    '/admin/:path*',
    '/', // Match homepage to set domain header
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // Match all routes except API and static files
  ],
}

