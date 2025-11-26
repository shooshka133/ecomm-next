import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/admin/check'
import { getAllBrands, saveBrand } from '@/lib/brand/storage'
import { logBrandAction } from '@/lib/brand/storage'

/**
 * GET /api/admin/brands
 * List all brands
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin status
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get all brands
    const brands = await getAllBrands()

    return NextResponse.json({ brands })
  } catch (error: any) {
    console.error('Error fetching brands:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/brands
 * Create a new brand
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin status
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { slug, name, config, is_active, asset_urls } = body

    // Validate required fields
    if (!slug || !name || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, name, config' },
        { status: 400 }
      )
    }

    // Create brand
    const brandData = {
      slug,
      name,
      is_active: is_active || false,
      config,
      asset_urls: asset_urls || {},
    }

    const savedBrand = await saveBrand(brandData, user.id)

    // Log action
    await logBrandAction('create', savedBrand.id || null, user.id, user.email || null, {
      slug,
      name,
    })

    return NextResponse.json({ brand: savedBrand }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating brand:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

