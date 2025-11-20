import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug endpoint to test Supabase redirects
 * Visit: https://shooshka.online/api/debug-auth
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const headers = Object.fromEntries(request.headers.entries())
  
  return NextResponse.json({
    message: 'Debug Auth Endpoint',
    url: url.href,
    origin: url.origin,
    headers: {
      host: headers.host,
      referer: headers.referer,
      origin: headers.origin,
    },
    env: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
  })
}

