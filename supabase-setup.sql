-- ============================================
-- SUPABASE DATABASE SETUP SCRIPT
-- ============================================
-- Chạy script này trong Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste và Run

-- 1. Contact Info Table
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  hotline TEXT,
  business_registration_address TEXT,
  office_address TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default contact info
INSERT INTO contact_info (email, hotline, business_registration_address, office_address)
VALUES (
  'vannhi@pro-hub.com.vn',
  '(+84) 908 583 042',
  'No 5, B12, TT51, Cam Hoi, Dong Nhan, Hai Ba Trung, Hanoi',
  'Floor 4, MindX, 505 Minh Khai, Vinh Tuy, Hai Ba Trung, Hanoi'
)
ON CONFLICT DO NOTHING;

-- 2. History Table
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default history data
INSERT INTO history (year, title, description, order_index) VALUES
  ('2017', 'Establishment', 'Founded Pro-Hub. Executed Beta Dan Phuong project.', 0),
  ('2018', 'Expansion', 'Constructed Beta Cinema chain nationwide.', 1),
  ('2019', 'Luxury Retail & Partnerships', 'Porsche Showroom at Vincom Metropolis. Appointed by DAT (IPP Group) for Vietnam''s Delight store at Trang Tien Plaza (TTP).', 2),
  ('2020', 'Retail Chain', 'Executed Eurotiles Showroom chain.', 3),
  ('2021', 'Adaptation', 'Social distancing adaptation: Aqua Online Dealer Conference. JLR Pop Up store at TTP.', 4),
  ('2022', 'Global Standards', 'Design Land Rover 3S Pilot Showroom. Officially became a vendor for Diageo Vietnam.', 5),
  ('2023', 'Realization', 'Construction of Land Rover 3S Pilot Showroom.', 6),
  ('2024', 'Nationwide Rollout', 'Executed outlet contracts for Diageo Vietnam nationwide.', 7),
  ('2025', 'Market Expansion', 'Design Land Rover 3S Showroom HCM. Expanding Southern market presence.', 8),
  ('2026', 'Future Vision', 'Developing human resources to meet international standards for the Northern market.', 9)
ON CONFLICT DO NOTHING;

-- 3. Project Categories Table
CREATE TABLE IF NOT EXISTS project_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO project_categories (name, slug, order_index) VALUES
  ('Exhibition', 'exhibition', 1),
  ('Events', 'events', 2),
  ('Design Hub', 'design-hub', 3),
  ('Project Insights', 'project-insights', 4)
ON CONFLICT (slug) DO NOTHING;

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES project_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT,
  area TEXT,
  type TEXT,
  year TEXT,
  external_content JSONB DEFAULT '{}',
  internal_content JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  layout TEXT DEFAULT 'portrait',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default projects (Exhibition)
INSERT INTO projects (category_id, title, location, area, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'exhibition' LIMIT 1),
  'VTDF @ITE 2022',
  'Ho Chi Minh City',
  '250 sqm',
  ARRAY['https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop'],
  'portrait',
  0
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'VTDF @ITE 2022');

INSERT INTO projects (category_id, title, location, area, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'exhibition' LIMIT 1),
  'Viglacera Booth',
  'Vietbuild Hanoi',
  '180 sqm',
  ARRAY['https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop'],
  'portrait',
  1
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Viglacera Booth');

-- 5. Project Insights Table
CREATE TABLE IF NOT EXISTS project_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  date TEXT,
  summary TEXT,
  content JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (tạm thời disable để dễ test)
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_insights ENABLE ROW LEVEL SECURITY;

-- Create policies để cho phép public read và admin write
-- Xóa policies cũ nếu đã tồn tại (để tránh lỗi khi chạy lại script)
DROP POLICY IF EXISTS "Public can read contact_info" ON contact_info;
DROP POLICY IF EXISTS "Public can read history" ON history;
DROP POLICY IF EXISTS "Public can read project_categories" ON project_categories;
DROP POLICY IF EXISTS "Public can read projects" ON projects;
DROP POLICY IF EXISTS "Public can read project_insights" ON project_insights;
DROP POLICY IF EXISTS "Admin can manage contact_info" ON contact_info;
DROP POLICY IF EXISTS "Admin can manage history" ON history;
DROP POLICY IF EXISTS "Admin can manage project_categories" ON project_categories;
DROP POLICY IF EXISTS "Admin can manage projects" ON projects;
DROP POLICY IF EXISTS "Admin can manage project_insights" ON project_insights;

-- Public read policies
CREATE POLICY "Public can read contact_info" ON contact_info
  FOR SELECT USING (true);

CREATE POLICY "Public can read history" ON history
  FOR SELECT USING (true);

CREATE POLICY "Public can read project_categories" ON project_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Public can read project_insights" ON project_insights
  FOR SELECT USING (true);

-- Admin write policies (sẽ được xử lý qua service role key trong admin panel)
CREATE POLICY "Admin can manage contact_info" ON contact_info
  FOR ALL USING (true);

CREATE POLICY "Admin can manage history" ON history
  FOR ALL USING (true);

CREATE POLICY "Admin can manage project_categories" ON project_categories
  FOR ALL USING (true);

CREATE POLICY "Admin can manage projects" ON projects
  FOR ALL USING (true);

CREATE POLICY "Admin can manage project_insights" ON project_insights
  FOR ALL USING (true);
