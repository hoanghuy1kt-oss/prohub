-- ============================================
-- FIX CONTACT_INFO TABLE - CHỈ GIỮ LẠI 1 ROW
-- ============================================
-- Chạy script này trong Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste và Run

-- 1. Xóa tất cả rows cũ (giữ lại row mới nhất nếu có)
-- Lưu ý: Nếu bạn muốn giữ lại row có updated_at mới nhất, uncomment phần dưới
-- DELETE FROM contact_info
-- WHERE id NOT IN (
--   SELECT id 
--   FROM contact_info 
--   ORDER BY updated_at DESC NULLS LAST
--   LIMIT 1
-- );

-- Hoặc xóa tất cả và tạo row mới
DELETE FROM contact_info;

-- 2. Tạo 1 row mới với giá trị mặc định
INSERT INTO contact_info (email, hotline, business_registration_address, office_address, google_map_url)
VALUES (
  'vannhi@prohub.com.vn',  -- Thay bằng email bạn muốn
  '(+84) 908 583 042',      -- Thay bằng hotline bạn muốn
  'No 5, B12, TT51, Cam Hoi, Dong Nhan, Hai Ba Trung, Hanoi',  -- Thay bằng địa chỉ bạn muốn
  'Floor 4, MindX, 505 Minh Khai, Vinh Tuy, Hai Ba Trung, Hanoi',  -- Thay bằng địa chỉ bạn muốn
  'https://maps.app.goo.gl/itzqYqQWK1zt9HLN9'  -- Thay bằng link bạn muốn
);

-- 3. (Tùy chọn) Thêm trigger để đảm bảo chỉ có 1 row trong tương lai
-- Tạo function để giới hạn chỉ 1 row
CREATE OR REPLACE FUNCTION check_single_contact_info()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM contact_info) > 1 THEN
    -- Xóa tất cả rows cũ, chỉ giữ lại row mới nhất
    DELETE FROM contact_info
    WHERE id NOT IN (
      SELECT id 
      FROM contact_info 
      ORDER BY updated_at DESC NULLS LAST
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger để enforce constraint
DROP TRIGGER IF EXISTS enforce_single_contact_info ON contact_info;
CREATE TRIGGER enforce_single_contact_info
  AFTER INSERT OR UPDATE ON contact_info
  FOR EACH STATEMENT
  EXECUTE FUNCTION check_single_contact_info();

-- ============================================
-- HƯỚNG DẪN:
-- ============================================
-- 1. Chạy script này trong Supabase SQL Editor
-- 2. Sau khi chạy, table contact_info sẽ chỉ có 1 row
-- 3. Trigger sẽ tự động xóa rows cũ nếu có nhiều hơn 1 row
-- 4. Bạn có thể chỉnh sửa giá trị mặc định ở phần INSERT ở trên
