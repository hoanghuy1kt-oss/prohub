-- ============================================
-- ADD GOOGLE MAP URL TO CONTACT INFO
-- ============================================
-- Chạy script này trong Supabase SQL Editor

-- Thêm column google_map_url vào table contact_info
ALTER TABLE contact_info 
ADD COLUMN IF NOT EXISTS google_map_url TEXT DEFAULT NULL;

-- Update default value nếu chưa có
UPDATE contact_info 
SET google_map_url = 'https://maps.app.goo.gl/itzqYqQWK1zt9HLN9'
WHERE google_map_url IS NULL;
