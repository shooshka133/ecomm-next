/**
 * Migrate Brands from File to Database
 * 
 * This script reads brands from data/brands/brands.json and inserts them into the database.
 * 
 * Usage:
 *   npx tsx scripts/migrate-brands-to-db.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import path from 'path'

// Load brands from file
async function loadBrandsFromFile() {
  const brandsFile = path.join(process.cwd(), 'data', 'brands', 'brands.json')
  try {
    const content = await readFile(brandsFile, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading brands file:', error)
    return []
  }
}

// Migrate brands to database
async function migrateBrands() {
  console.log('🔄 Starting brand migration from file to database...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
    console.error('\nPlease set these in .env.local or environment variables')
    process.exit(1)
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Load brands from file
  console.log('📂 Loading brands from file...')
  const brands = await loadBrandsFromFile()

  if (brands.length === 0) {
    console.log('⚠️  No brands found in file. Nothing to migrate.')
    return
  }

  console.log(`✅ Found ${brands.length} brand(s) in file\n`)

  // Check existing brands in database
  const { data: existingBrands } = await supabase
    .from('brands')
    .select('slug')

  const existingSlugs = new Set(existingBrands?.map(b => b.slug) || [])
  console.log(`📊 Existing brands in database: ${existingSlugs.size}`)

  // Migrate each brand
  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const brand of brands) {
    try {
      // Skip if already exists
      if (existingSlugs.has(brand.slug)) {
        console.log(`⏭️  Skipping "${brand.name}" (slug: ${brand.slug}) - already exists`)
        skipped++
        continue
      }

      // Prepare brand data
      const brandData = {
        slug: brand.slug,
        name: brand.name,
        is_active: brand.is_active || false,
        config: brand.config,
        asset_urls: brand.asset_urls || {},
        created_at: brand.created_at || new Date().toISOString(),
        updated_at: brand.updated_at || new Date().toISOString(),
        // Note: created_by and updated_by will be null (no user context in migration)
      }

      // Insert into database
      const { data, error } = await supabase
        .from('brands')
        .insert(brandData)
        .select()
        .single()

      if (error) {
        console.error(`❌ Error migrating "${brand.name}":`, error.message)
        errors++
      } else {
        console.log(`✅ Migrated "${brand.name}" (slug: ${brand.slug})`)
        migrated++
      }
    } catch (error: any) {
      console.error(`❌ Error processing "${brand.name}":`, error.message)
      errors++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Migration Summary:')
  console.log(`   ✅ Migrated: ${migrated}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log('='.repeat(50))

  if (migrated > 0) {
    console.log('\n🎉 Migration complete! Brands are now in the database.')
    console.log('   You can now use the admin panel to manage them.')
  }
}

// Run migration
migrateBrands().catch(console.error)

