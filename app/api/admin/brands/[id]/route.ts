import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/admin/check'
import { getBrandById, saveBrand, deleteBrand } from '@/lib/brand/storage'
import { logBrandAction } from '@/lib/brand/storage'

/**
 * GET /api/admin/brands/[id]
 * Get a specific brand
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get brand
    const brand = await getBrandById(params.id)

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({ brand })
  } catch (error: any) {
    console.error('Error fetching brand:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/brands/[id]
 * Update a brand
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get existing brand
    const existingBrand = await getBrandById(params.id)
    if (!existingBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { slug, name, config, is_active, asset_urls } = body

    // Update brand
    const updatedBrand = {
      ...existingBrand,
      slug: slug || existingBrand.slug,
      name: name || existingBrand.name,
      config: config || existingBrand.config,
      is_active: is_active !== undefined ? is_active : existingBrand.is_active,
      asset_urls: asset_urls || existingBrand.asset_urls,
    }

    const savedBrand = await saveBrand(updatedBrand, user.id)

    // Log action
    await logBrandAction('update', savedBrand.id || null, user.id, user.email || null, {
      changes: body,
    })

    return NextResponse.json({ brand: savedBrand })
  } catch (error: any) {
    console.error('Error updating brand:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/brands/[id]
 * Delete a brand
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get brand before deleting (for logging)
    const brand = await getBrandById(params.id)
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Prevent deleting active brand
    if (brand.is_active) {
      return NextResponse.json(
        { error: 'Cannot delete active brand. Please activate another brand first.' },
        { status: 400 }
      )
    }

    // Delete brand
    const success = await deleteBrand(params.id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
    }

    // Log action
    await logBrandAction('delete', brand.id || null, user.id, user.email || null, {
      brand_name: brand.name,
      brand_slug: brand.slug,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

