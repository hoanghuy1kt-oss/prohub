-- ============================================
-- TRUSTED PARTNERS (CLIENTS) TABLE
-- ============================================
-- Chạy script này trong Supabase SQL Editor

-- 1. Tạo table trusted_partners
CREATE TABLE IF NOT EXISTS trusted_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Insert default clients (nếu chưa có)
INSERT INTO trusted_partners (name, logo_url, website_url, order_index, is_active) VALUES
  ('Microsoft', 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', 'https://www.microsoft.com', 0, true),
  ('Land Rover', 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Land_Rover_logo_black.svg/1200px-Land_Rover_logo_black.svg.png', 'https://www.landrover.com', 1, true),
  ('Porsche', 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Porsche_Wappen.svg/1200px-Porsche_Wappen.svg.png', 'https://www.porsche.com', 2, true),
  ('VietinBank', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Logo_VietinBank.svg/2560px-Logo_VietinBank.svg.png', 'https://www.vietinbank.vn', 3, true),
  ('Vietravel', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_Vietravel.svg/2560px-Logo_Vietravel.svg.png', 'https://www.vietravel.com', 4, true),
  ('Diageo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Diageo_logo.svg/2560px-Diageo_logo.svg.png', 'https://www.diageo.com', 5, true),
  ('TOTO', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/TOTO_Logo.svg/2560px-TOTO_Logo.svg.png', 'https://www.toto.com', 6, true)
ON CONFLICT DO NOTHING;

-- 3. Enable RLS
ALTER TABLE trusted_partners ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
DROP POLICY IF EXISTS "Public can read trusted_partners" ON trusted_partners;
CREATE POLICY "Public can read trusted_partners" ON trusted_partners
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage trusted_partners" ON trusted_partners;
CREATE POLICY "Admin can manage trusted_partners" ON trusted_partners
  FOR ALL USING (true);
