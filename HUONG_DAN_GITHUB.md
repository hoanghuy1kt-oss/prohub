# Hướng dẫn liên kết với GitHub

Repository GitHub của bạn: **https://github.com/hoanghuy1kt-oss/prohub.git**

## Cách 1: Dùng GitHub Desktop (Dễ nhất - Khuyến nghị) ⭐

### Bước 1: Cài GitHub Desktop
1. Tải từ: https://desktop.github.com/
2. Cài đặt và đăng nhập với tài khoản GitHub của bạn

### Bước 2: Kết nối repository
1. Mở GitHub Desktop
2. Click **File** → **Add Local Repository**
3. Chọn thư mục: `C:\Users\Hp\Desktop\Prohub`
4. Click **Add Repository**

### Bước 3: Publish lên GitHub
1. Nếu repository chưa có trên GitHub, click **Publish repository**
2. Chọn repository: `hoanghuy1kt-oss/prohub`
3. Click **Publish Repository**

### Bước 4: Commit và Push
1. Trong GitHub Desktop, bạn sẽ thấy các file đã thay đổi
2. Nhập commit message (ví dụ: "Initial commit")
3. Click **Commit to main**
4. Click **Push origin** để đẩy code lên GitHub

---

## Cách 2: Dùng Git Command Line

### Bước 1: Cài Git
1. Tải Git từ: https://git-scm.com/download/win
2. Cài đặt với các tùy chọn mặc định
3. Mở lại PowerShell sau khi cài xong

### Bước 2: Chạy script tự động
Mở PowerShell trong thư mục `C:\Users\Hp\Desktop\Prohub` và chạy:
```powershell
.\connect-github.ps1
```

### Bước 3: Push lên GitHub
Sau khi script chạy xong, chạy lệnh:
```powershell
git push -u origin main
```

### Bước 4: Nếu gặp lỗi Authentication
1. Tạo Personal Access Token:
   - Vào: https://github.com/settings/tokens
   - Click **Generate new token (classic)**
   - Đặt tên token (ví dụ: "Prohub Token")
   - Chọn quyền: **repo** (tích tất cả các quyền trong repo)
   - Click **Generate token**
   - **Copy token ngay** (chỉ hiện 1 lần)

2. Khi push, nhập:
   - **Username**: `hoanghuy1kt-oss`
   - **Password**: `[dán token vừa copy]`

---

## Cách 3: Làm thủ công (nếu không dùng script)

Mở PowerShell trong thư mục `C:\Users\Hp\Desktop\Prohub` và chạy từng lệnh:

```powershell
# Khởi tạo Git repository
git init

# Thêm remote GitHub
git remote add origin https://github.com/hoanghuy1kt-oss/prohub.git

# Thêm tất cả file
git add .

# Commit
git commit -m "Initial commit - Prohub project"

# Đổi tên branch thành main
git branch -M main

# Push lên GitHub
git push -u origin main
```

---

## Sau khi push thành công:

1. Vào GitHub: https://github.com/hoanghuy1kt-oss/prohub
2. Kiểm tra code đã được upload chưa
3. Vào Vercel dashboard
4. Project sẽ tự động deploy lại, hoặc click **Redeploy**

---

## Lưu ý:

- File `.gitignore` đã được cấu hình để bỏ qua `node_modules` và `dist`
- File `vercel.json` và `.npmrc` đã được thêm để cấu hình Vercel
- Nếu có lỗi, hãy kiểm tra lại Git đã được cài đặt chưa
