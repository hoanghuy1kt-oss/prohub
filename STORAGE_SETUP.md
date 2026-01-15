# Hướng dẫn Setup Storage Bucket

## Vấn đề
Storage Buckets: **Total Buckets: 0** - Chưa có bucket `project-images`

## Cách fix

### Bước 1: Tạo Bucket trong Supabase Dashboard

1. **Vào Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Chọn project của bạn

2. **Vào Storage**
   - Click menu **Storage** (bên trái)
   - Hoặc vào: `https://supabase.com/dashboard/project/[your-project-id]/storage/buckets`

3. **Tạo Bucket mới**
   - Click nút **"New bucket"** hoặc **"Create bucket"**
   - Điền thông tin:
     - **Name**: `project-images` (chính xác như vậy)
     - **Public bucket**: ✅ **BẬT** (quan trọng! Nếu không bật, images sẽ không hiển thị được)
   - Click **"Create bucket"**

### Bước 2: Tạo RLS Policies

Sau khi tạo bucket, chạy script SQL:

1. **Vào SQL Editor**
   - Click menu **SQL Editor** (bên trái)
   - Click **"New query"**

2. **Copy và chạy script**
   - Mở file `supabase-storage-setup.sql`
   - Copy toàn bộ nội dung
   - Paste vào SQL Editor
   - Click **"Run"**

### Bước 3: Kiểm tra

1. **Refresh trang test**: `http://localhost:5173/test-supabase`
2. **Kiểm tra Storage Buckets section**:
   - ✅ Total Buckets: 1 (hoặc nhiều hơn)
   - ✅ Has project-images bucket: Yes

## Lưu ý quan trọng

⚠️ **Public bucket phải BẬT** - Nếu không bật:
- Images sẽ upload được nhưng không hiển thị được trên website
- Browser sẽ block vì CORS policy

## Test upload

Sau khi setup xong, test upload:
1. Vào Admin → Projects
2. Chọn một project
3. Upload hình ảnh
4. Nếu thành công → Bucket đã hoạt động ✅
