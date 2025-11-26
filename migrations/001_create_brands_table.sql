-- Migration: Create brands table for multi-brand management
-- This is optional - system falls back to file-based storage if BRAND_USE_DB=false

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  config JSONB NOT NULL,
  asset_urls JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index for active brand lookup
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- RLS Policies
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Only admins can read brands
CREATE POLICY "Admins can read brands"
  ON brands FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Only admins can insert brands
CREATE POLICY "Admins can insert brands"
  ON brands FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Only admins can update brands
CREATE POLICY "Admins can update brands"
  ON brands FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Only admins can delete brands
CREATE POLICY "Admins can delete brands"
  ON brands FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Audit log table (optional)
CREATE TABLE IF NOT EXISTS brand_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_audit_brand_id ON brand_audit(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_audit_created_at ON brand_audit(created_at DESC);

-- RLS for audit (read-only for admins)
ALTER TABLE brand_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs"
  ON brand_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_brands_updated_at();

