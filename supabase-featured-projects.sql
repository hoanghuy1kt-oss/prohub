-- ============================================
-- ADD FEATURED PROJECTS FOR HOME PAGE
-- ============================================
-- Chạy script này trong Supabase SQL Editor để thêm tính năng SELECTED WORKS

-- Thêm columns vào table projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS home_order INTEGER DEFAULT NULL;

-- Tạo index để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured, home_order) 
WHERE is_featured = true;

-- Comment: 
-- is_featured: Đánh dấu project có được hiển thị ở Home page không
-- home_order: Thứ tự hiển thị (1, 2, 3, 4) - tối đa 4 projects
