import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Protect only /orders (or other private pages)
  const isProtected = pathname.startsWith('/orders') || 
                      pathname.startsWith('/cart') || 
                      pathname.startsWith('/checkout')

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

  return NextResponse.next()
}

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/orders/:path*'],
}

