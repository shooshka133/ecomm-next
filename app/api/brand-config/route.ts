import { NextRequest, NextResponse } from 'next/server'
import { getDomainFromRequest } from '@/lib/brand/admin-loader'
import { getActiveBrandConfig } from '@/lib/brand/admin-loader'
import { headers } from 'next/headers'

/**
 * GET /api/brand-config
 * Returns the current brand configuration based on domain
 * Used by client components to get domain-based brand
 */
export async function GET(request: NextRequest) {
  try {
    // Get domain from request
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
    const domain = host ? host.split(':')[0] : undefined
    
    // Also try from headers() for server components
    const headersList = await headers()
    const domainFromHeaders = getDomainFromRequest(headersList)
    
    // Use domain from request or headers
    const finalDomain = domain || domainFromHeaders
    
    // Get brand config based on domain
    const brandConfig = await getActiveBrandConfig(finalDomain)
    
    return NextResponse.json({
      success: true,
      domain: finalDomain,
      brand: brandConfig,
    })
  } catch (error: any) {
    console.error('Error loading brand config:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      brand: null,
    }, { status: 500 })
  }
}

