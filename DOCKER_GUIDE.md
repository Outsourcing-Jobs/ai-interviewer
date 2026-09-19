# 🐳 Hướng Dẫn Build & Chạy Toàn Bộ Dự Án Bằng Docker Local

Tài liệu này hướng dẫn chi tiết từng bước từ cơ bản đến nâng cao để khởi chạy toàn bộ cụm dịch vụ của **AI Interviewer** (bao gồm: Frontend, Backend API, AI Service Python, Redis) trên máy tính cá nhân bằng Docker & Docker Compose.

---

## 📋 Mục Lục
1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cấu trúc cụm dịch vụ Docker](#2-cấu-trúc-cụm-dịch-vụ-docker)
3. [Bước 1: Chuẩn bị file cấu hình môi trường (.env)](#bước-1-chuẩn-bị-file-cấu-hình-môi-trường-env)
4. [Bước 2: Lệnh Build & Chạy từng bước](#bước-2-lệnh-build--chạy-từng-bước)
5. [Bước 3: Nạp dữ liệu mẫu (Database Seeder)](#bước-3-nạp-dữ-liệu-mẫu-database-seeder)
6. [Bước 4: Kiểm tra và sử dụng hệ thống](#bước-4-kiểm-tra-và-sử-dụng-hệ-thống)
7. [Các lệnh quản lý Docker thường dùng](#các-lệnh-quản-lý-docker-thường-dùng)
8. [Khắc phục sự cố thường gặp (Troubleshooting)](#khắc-phục-sự-cố-thường-gặp-troubleshooting)

---

## 1. Yêu cầu hệ thống
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
- **Docker Desktop** (cho Windows / macOS) hoặc **Docker Engine + Docker Compose** (cho Linux/WSL2).
- Khởi động Docker Desktop và đảm bảo trạng thái hiển thị **"Engine running"** (biểu tượng màu xanh).

---

## 2. Cấu trúc cụm dịch vụ Docker

Khi chạy `docker compose`, hệ thống sẽ tự động khởi tạo 4 dịch vụ trong cùng một mạng nội bộ (`ai_network`):

```
+-------------------------------------------------------------------------+
|                              ai_network                                 |
|                                                                         |
|   +-------------------+       +------------------------------------+    |
|   |  Frontend         | ----> |  Backend (Node.js API)             |    |
|   |  (React + Nginx)  |       |  Port 5000                         |    |
|   |  Port 5173        |       +------------------------------------+    |
|   +-------------------+                  |                 |            |
|                                          v                 v            |
|                               +-------------------+ +--------------+    |
|                               |  AI Service       | |  Redis       |    |
|                               |  (FastAPI Python) | |  (BullMQ)    |    |
|                               |  Port 8000        | |  Port 6379   |    |
|                               +-------------------+ +--------------+    |
+-------------------------------------------------------------------------+
```

---

## Bước 1: Chuẩn bị file cấu hình môi trường (.env)

Đảm bảo các file `.env` đã có sẵn tại các thư mục con:

### 1. File `ai-service/.env`
Tạo hoặc kiểm tra file `ai-service/.env`:
```env
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_here
INTERNAL_API_KEY=internal-secret-key-ai-interviewer-2026
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000,http://localhost:80,http://localhost
REQUEST_TIMEOUT=60
```
> *(Lưu ý: Không bắt buộc set `MODEL_NAME`, hệ thống sẽ tự động fallback chuỗi model thông minh).*

### 2. File `backend/.env`
Tạo hoặc kiểm tra file `backend/.env`:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://haiddcontactjob_db_user:haiddcontactjob_db_user@myjobs.c2owprb.mongodb.net/ai-interviewer?appName=MyJobs
JWT_SECRET=ai-interviewer-super-secret-jwt-key-2026
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://ai-service:8000
REDIS_URL=redis://redis:6379
INTERNAL_API_KEY=internal-secret-key-ai-interviewer-2026
```

---

## Bước 2: Lệnh Build & Chạy từng bước

Mở ứng dụng Terminal / PowerShell / Command Prompt trên máy:

### Bước 2.1: Điều hướng vào thư mục gốc của dự án
```powershell
cd d:\Jobs\AI-Interviewer
```

### Bước 2.2: Tải image và build toàn bộ cụm container
```powershell
docker compose up --build
```

> 💡 **Mẹo chạy ngầm (Background / Detached mode):**
> Nếu muốn terminal không bị khóa và các container chạy nền:
> ```powershell
> docker compose up --build -d
> ```

---

## Bước 3: Nạp dữ liệu mẫu (Database Seeder)

Sau khi cụm container đã khởi động thành công, bạn có thể chạy seeder để nạp sẵn câu hỏi, bài phỏng vấn, huy hiệu và tài khoản quản trị viên:

```powershell
# Nạp dữ liệu mẫu tiêu chuẩn (Tự động xóa sạch dữ liệu cũ và seed mới)
docker compose exec backend npm run db:seed
```

> Hoặc nạp tập dữ liệu lớn (stress test):
> ```powershell
> docker compose exec backend npm run db:seed:large
> ```

### 🔑 Tài khoản đăng nhập sẵn sau khi seed:
- **Tài khoản Quản trị viên (Admin)**:
  - Email: `admin@aiinterviewer.com`
  - Mật khẩu: `AdminPassword123!`
  - Đường dẫn trang quản trị: `http://localhost:5173/admin`
- **Tài khoản Ứng viên (User)**:
  - Email: `john.doe@example.com`
  - Mật khẩu: `UserPassword123!`

---

## Bước 4: Kiểm tra và sử dụng hệ thống

Mở trình duyệt web của bạn và truy cập các cổng tương ứng:

| Dịch vụ | Địa chỉ truy cập | Ghi chú |
| :--- | :--- | :--- |
| **Giao diện người dùng (Frontend)** | [http://localhost:5173](http://localhost:5173) | Đăng ký, đăng nhập, phỏng vấn AI, phân tích CV |
| **Backend API Health** | [http://localhost:5000/health](http://localhost:5000/health) | Trả về `{ "status": "ok", "db": "connected" }` |
| **AI Service Docs (Swagger UI)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Tài liệu API FastAPI & test endpoint AI |
| **Redis Server** | `localhost:6379` | Quản lý hàng đợi xử lý ngầm BullMQ |

---

## Các lệnh quản lý Docker thường dùng

### 1. Xem trạng thái các container đang chạy
```powershell
docker compose ps
```

### 2. Xem log thời gian thực (Real-time Logs)
```powershell
# Xem toàn bộ log của tất cả services:
docker compose logs -f

# Xem riêng log của Backend:
docker compose logs -f backend

# Xem riêng log của AI Service:
docker compose logs -f ai-service

# Xem riêng log của Frontend:
docker compose logs -f frontend
```

### 3. Dừng hệ thống
```powershell
# Dừng các container nhưng giữ nguyên dữ liệu Redis:
docker compose stop

# Dừng và gỡ bỏ toàn bộ container + network:
docker compose down
```

### 4. Build lại không dùng cache (khi sửa code nhiều)
```powershell
docker compose build --no-cache
docker compose up -d
```

### 5. Truy cập trực tiếp vào Terminal bên trong Container
```powershell
# Vào terminal của Backend (Node.js):
docker compose exec backend sh

# Vào terminal của AI Service (Python):
docker compose exec ai-service bash
```

---

## Khắc phục sự cố thường gặp (Troubleshooting)

### 1. Lỗi xung đột cổng (Port is already allocated)
- **Hiện tượng**: `Bind for 0.0.0.0:5000 failed: port is already allocated` hoặc `port 5173 / 8000 / 6379`.
- **Nguyên nhân**: Bạn đang có tiến trình local (như `npm run dev`, `python main.py` hoặc Redis chạy ngầm) chiếm port.
- **Cách xử lý**:
  1. Tắt các terminal local đang chạy `npm run dev` hoặc `python main.py`.
  2. Trên Windows PowerShell, tìm và kill process đang chiếm port (ví dụ port 5000):
     ```powershell
     Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
     ```

### 2. Sửa file code nhưng trong Docker không đổi
- Vì Docker build tạo ra image tĩnh, khi bạn cập nhật code frontend hoặc backend, hãy chạy lệnh build lại:
  ```powershell
  docker compose up --build -d
  ```

### 3. Lỗi kết nối Redis giữa Backend và Redis Container
- Trong môi trường Docker, biến `REDIS_URL` của Backend phải là `redis://redis:6379` (dùng tên hostname của container `redis`, không dùng `localhost`). Điều này đã được tự động cấu hình trong `docker-compose.yml`.

---
*Chúc bạn trải nghiệm và phát triển ứng dụng thuận lợi với Docker!* 🚀
