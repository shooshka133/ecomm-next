-- Migration: Add brand_id to products table for brand-based filtering
-- This allows products to be associated with specific brands

-- Add brand_id column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- Create index for faster brand-based queries
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id) WHERE brand_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN products.brand_id IS 'Brand ID this product belongs to. NULL means product is available for all brands.';

