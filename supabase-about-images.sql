-- ============================================
-- ABOUT PAGE IMAGES TABLE
-- ============================================
-- Chạy script này trong Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste và Run

-- 1. Tạo table about_images
CREATE TABLE IF NOT EXISTS about_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'CÁC KHÁCH HÀNG CỦA CHÚNG TÔI',
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Nếu table đã có image_1_url và image_2_url, migrate sang image_url
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'about_images' AND column_name = 'image_1_url'
  ) THEN
    ALTER TABLE about_images ADD COLUMN IF NOT EXISTS image_url TEXT;
    UPDATE about_images SET image_url = COALESCE(image_1_url, image_2_url) WHERE image_url IS NULL;
  END IF;
END $$;

-- 3. Insert default row (chỉ có 1 row duy nhất)
INSERT INTO about_images (title, order_index, is_active)
VALUES ('CÁC KHÁCH HÀNG CỦA CHÚNG TÔI', 0, true)
ON CONFLICT DO NOTHING;

-- 3. Enable RLS
ALTER TABLE about_images ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
DROP POLICY IF EXISTS "Public can read about_images" ON about_images;
CREATE POLICY "Public can read about_images" ON about_images
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage about_images" ON about_images;
CREATE POLICY "Admin can manage about_images" ON about_images
  FOR ALL USING (true);
