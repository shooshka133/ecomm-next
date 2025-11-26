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
-- Note: Admin checks are performed in the application layer using service role key
-- RLS here provides basic protection, but service role bypasses RLS for admin operations
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read brands (admin check in app layer)
CREATE POLICY "Authenticated users can read brands"
  ON brands FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to manage brands (admin check in app layer)
-- The application uses service role key and verifies admin status before allowing operations
CREATE POLICY "Authenticated users can insert brands"
  ON brands FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update brands"
  ON brands FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete brands"
  ON brands FOR DELETE
  USING (auth.uid() IS NOT NULL);

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

-- RLS for audit (read-only for authenticated users, admin check in app layer)
ALTER TABLE brand_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read audit logs"
  ON brand_audit FOR SELECT
  USING (auth.uid() IS NOT NULL);

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

