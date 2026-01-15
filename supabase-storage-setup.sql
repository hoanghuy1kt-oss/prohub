-- ============================================
-- SETUP STORAGE BUCKET FOR PROJECT IMAGES
-- ============================================
-- Chạy script này trong Supabase SQL Editor

-- 1. Tạo bucket "project-images" (nếu chưa có)
-- Lưu ý: Bucket phải được tạo trong Supabase Dashboard > Storage
-- Vào Storage > Create bucket > Tên: "project-images" > Public: Yes

-- 2. Tạo policies cho bucket "project-images"
-- Sau khi tạo bucket, chạy các policies sau:

-- Policy: Public có thể xem images
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-images');

-- Policy: Public có thể upload images (cho admin)
DROP POLICY IF EXISTS "Public can upload images" ON storage.objects;
CREATE POLICY "Public can upload images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'project-images');

-- Policy: Public có thể update images
DROP POLICY IF EXISTS "Public can update images" ON storage.objects;
CREATE POLICY "Public can update images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'project-images');

-- Policy: Public có thể delete images
DROP POLICY IF EXISTS "Public can delete images" ON storage.objects;
CREATE POLICY "Public can delete images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'project-images');

-- ============================================
-- HƯỚNG DẪN TẠO BUCKET TRONG SUPABASE DASHBOARD:
-- ============================================
-- 1. Vào Supabase Dashboard
-- 2. Chọn project của bạn
-- 3. Vào Storage (menu bên trái)
-- 4. Click "New bucket"
-- 5. Điền thông tin:
--    - Name: project-images
--    - Public bucket: ✅ Bật (quan trọng!)
-- 6. Click "Create bucket"
-- 7. Sau đó chạy các policies ở trên
