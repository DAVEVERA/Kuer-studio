export const SCHEMA_SQL = `
-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brand Kits
CREATE TABLE IF NOT EXISTS brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#000000',
  secondary_color TEXT NOT NULL DEFAULT '#FFFFFF',
  accent_color TEXT NOT NULL DEFAULT '#E07856',
  font_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- QR Projects
CREATE TABLE IF NOT EXISTS qr_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  target_url TEXT NOT NULL,
  short_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('static', 'dynamic')),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_projects_short_id ON qr_projects(short_id);
CREATE INDEX IF NOT EXISTS idx_qr_projects_user_id ON qr_projects(user_id);

-- Uploaded Images
CREATE TABLE IF NOT EXISTS uploaded_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES qr_projects(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL DEFAULT '',
  analysis_json JSONB NOT NULL DEFAULT '{}',
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  file_size INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'image/png',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uploaded_images_project_id ON uploaded_images(project_id);

-- QR Variants
CREATE TABLE IF NOT EXISTS qr_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES qr_projects(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL DEFAULT '',
  style_preset TEXT NOT NULL DEFAULT 'corporate-clean',
  image_url TEXT NOT NULL DEFAULT '',
  base_qr_url TEXT NOT NULL DEFAULT '',
  scanability_score INTEGER NOT NULL DEFAULT 0,
  validation_status TEXT NOT NULL DEFAULT 'pending',
  validation_report_json JSONB NOT NULL DEFAULT '{}',
  export_urls_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_variants_project_id ON qr_variants(project_id);

-- Scan Events
CREATE TABLE IF NOT EXISTS scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES qr_projects(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES qr_variants(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT NOT NULL DEFAULT '',
  device_type TEXT NOT NULL DEFAULT '',
  browser TEXT NOT NULL DEFAULT '',
  os TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  ip_hash TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_scan_events_project_id ON scan_events(project_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_timestamp ON scan_events(timestamp);

-- Export History
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES qr_variants(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_export_history_variant_id ON export_history(variant_id);
`
