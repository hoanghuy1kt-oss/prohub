-- ============================================
-- SUPABASE ADMIN SETUP - Download Profile Table
-- ============================================
-- Chạy script này trong Supabase SQL Editor sau khi đã chạy supabase-setup.sql

-- 6. Download Profile Table
CREATE TABLE IF NOT EXISTS download_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  file_size INTEGER,
  file_type TEXT,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default profiles (EN và VN)
INSERT INTO download_profile (title, description, file_name, file_url, is_active, order_index)
VALUES 
  (
    'Download Profile EN',
    'English Company Profile',
    '',
    '',
    true,
    0
  ),
  (
    'Download Profile VN',
    'Vietnamese Company Profile',
    '',
    '',
    true,
    1
  )
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE download_profile ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Public can read download_profile" ON download_profile
  FOR SELECT USING (is_active = true);

-- Admin manage policy
CREATE POLICY "Admin can manage download_profile" ON download_profile
  FOR ALL USING (true);
