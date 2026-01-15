# 🚨 QUAN TRỌNG: Tạo Bucket trong Supabase Dashboard

## Vấn đề
SQL script chỉ tạo **policies** (quyền truy cập), **KHÔNG tạo bucket**. Bucket phải được tạo **thủ công** trong Supabase Dashboard.

## Cách tạo bucket (BẮT BUỘC)

### Bước 1: Vào Storage trong Supabase Dashboard

1. Mở: https://supabase.com/dashboard
2. Chọn project của bạn
3. Click menu **Storage** (bên trái) - icon giống folder/file

### Bước 2: Tạo bucket mới

1. Click nút **"+ New bucket"** (màu xanh lá, góc trên bên phải)
2. Điền form:
   - **Name**: `project-images` ⚠️ **CHÍNH XÁC** như vậy (không có khoảng trắng, không viết hoa)
   - **Public bucket**: ✅ **BẬT** (toggle switch sang ON) - **QUAN TRỌNG!**
   - **File size limit**: Có thể để trống hoặc set 50MB
   - **Allowed MIME types**: Có thể để "Any" hoặc chọn image types
3. Click **"Create bucket"**

### Bước 3: Xác nhận

Sau khi tạo, bạn sẽ thấy:
- Bucket `project-images` xuất hiện trong danh sách
- Có tag **"PUBLIC"** màu cam bên cạnh tên bucket
- Cột "POLICIES" sẽ hiển thị số policies (sau khi chạy SQL)

### Bước 4: Kiểm tra lại

1. Refresh trang test: `http://localhost:5173/test-supabase`
2. Kiểm tra section **"Storage Buckets"**:
   - ✅ Total Buckets: 1 (hoặc nhiều hơn)
   - ✅ Has project-images bucket: **Yes** ✅

## Lưu ý quan trọng

⚠️ **Public bucket PHẢI BẬT** - Nếu không:
- Images upload được nhưng **KHÔNG hiển thị** được trên website
- Browser sẽ block vì CORS policy
- Users không thể xem images

## Sau khi tạo bucket

Nếu bạn đã chạy SQL policies trước đó:
- Policies đã sẵn sàng, không cần chạy lại
- Bucket sẽ tự động áp dụng các policies đã tạo

Nếu chưa chạy SQL policies:
- Chạy file `supabase-storage-setup.sql` trong SQL Editor
- Để tạo các policies cho bucket

## Test upload

Sau khi tạo bucket xong:
1. Vào Admin → Projects
2. Chọn một project
3. Upload hình ảnh
4. Nếu thành công → Bucket đã hoạt động ✅
