-- Migration: Add domain field to brands table for domain-based routing
-- This allows each brand to be associated with a specific domain/subdomain

-- Add domain column to brands table
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS domain TEXT;

-- Create index for domain lookup (faster queries)
CREATE INDEX IF NOT EXISTS idx_brands_domain ON brands(domain) WHERE domain IS NOT NULL;

-- Add comment
COMMENT ON COLUMN brands.domain IS 'Domain or subdomain associated with this brand (e.g., grocery.shooshka.online)';

