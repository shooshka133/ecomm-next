import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/admin/check'
import { getBrandById, saveBrand } from '@/lib/brand/storage'
import { createClient } from '@supabase/supabase-js'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ASSET_BACKEND = process.env.BRAND_ASSET_BACKEND || 'SUPABASE'
const USE_SUPABASE_STORAGE = ASSET_BACKEND === 'SUPABASE' && process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * POST /api/admin/brands/[id]/upload-asset
 * Upload brand asset (logo, favicon, og image, etc.)
 */
export async function POST(
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const assetType = formData.get('type') as string // 'logo', 'favicon', 'appleIcon', 'ogImage'

    if (!file || !assetType) {
      return NextResponse.json(
        { error: 'Missing file or asset type' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPEG, SVG, WebP' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      )
    }

    let assetUrl: string

    if (USE_SUPABASE_STORAGE) {
      // Upload to Supabase Storage
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const fileExt = file.name.split('.').pop()
      const fileName = `${assetType}-${Date.now()}.${fileExt}`
      const bucket = 'brand-assets'
      const filePath = `${brand.slug}/${fileName}`

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        })

      if (uploadError) {
        // Try to create bucket if it doesn't exist
        await supabaseAdmin.storage.createBucket(bucket, { public: true })
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from(bucket)
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          })

        if (retryError) {
          console.error('Error uploading to Supabase Storage:', retryError)
          throw retryError
        }

        assetUrl = retryData?.path || filePath
      } else {
        assetUrl = uploadData?.path || filePath
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(filePath)

      assetUrl = urlData.publicUrl
    } else {
      // Upload to local file system
      const brandDir = path.join(process.cwd(), 'public', 'brand', brand.slug)
      if (!existsSync(brandDir)) {
        await mkdir(brandDir, { recursive: true })
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${assetType}.${fileExt}`
      const filePath = path.join(brandDir, fileName)

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await writeFile(filePath, buffer)

      assetUrl = `/brand/${brand.slug}/${fileName}`
    }

    // Update brand asset URLs
    const updatedAssetUrls = {
      ...(brand.asset_urls || {}),
      [assetType]: assetUrl,
    }

    const updatedBrand = {
      ...brand,
      asset_urls: updatedAssetUrls,
    }

    await saveBrand(updatedBrand, user.id)

    return NextResponse.json({
      success: true,
      assetUrl,
      message: 'Asset uploaded successfully',
    })
  } catch (error: any) {
    console.error('Error uploading asset:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

