import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Client-side protection in components handles auth redirects
  // This middleware can be extended for additional server-side checks if needed
  return NextResponse.next()
}

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/orders/:path*'],
}

