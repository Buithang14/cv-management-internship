# 01. Tổng Quan Kiến Trúc Front-End (Dành cho Dev Back-End)

Tài liệu này tổng hợp cấu trúc kiến trúc Front-End của hệ thống CV Management, tương quan trực tiếp với mô hình Back-End Spring Boot.

---

## 🏗️ 1. Cấu Trúc Các Tầng (Layers Architecture)

Giống như mô hình **Controller -> Service -> Repository -> Database** ở Back-End Spring Boot, Front-End React được tổ chức theo các tầng trách nhiệm riêng biệt:

```text
[Giao diện User (View)]
       │
       ▼
[MainLayout.jsx] (Khung App Shell: Sidebar + Topbar + User Profile)
       │
       ▼
[Pages / Components] (LoginPage.jsx, DashboardPage.jsx)
       │ (Gọi hàm API)
       ▼
[API Services] (authApi.js, cvApi.js)
       │ (Truyền Request)
       ▼
[HTTP Client] (axiosClient.js - Interceptor đính kèm JWT Token)
       │ (HTTP REST Request: POST/GET/PUT/DELETE)
       ▼
[Back-End Spring Boot Controller] (http://localhost:8080/api/v1/...)
```

---

## 📁 2. Vai Trò Chi Tiết Của Từng Thư Mục

### 1. `src/api/` (Tầng kết nối API)
- **Tương đương ở BE:** RestTemplate / WebClient / FeignClient.
- **Chức năng:** Chịu trách nhiệm gửi request HTTP (GET, POST, PUT, DELETE) tới Spring Boot.
- **Các file chính:**
  - `axiosClient.js`: Cấu hình BaseURL (`http://localhost:8080/api/v1`), tự động đính kèm Token vào Header `Authorization: Bearer <token>` và tự động bắt lỗi HTTP status `401 Unauthorized`.
  - `authApi.js`: Tập hợp các hàm gọi API liên quan tới xác thực (Đăng nhập `POST /auth/login`).

### 2. `src/components/` (Tầng Layout & Component Khung)
- **MainLayout.jsx**: Khung ứng dụng doanh nghiệp chuẩn Enterprise (Sidebar bên trái hiển thị Menu tự đổi theo Role, Topbar ở trên hiển thị Avatar & Badge Role người dùng).
- **ProtectedRoute.jsx**: Bộ lọc phân quyền bảo vệ đường dẫn (Tương đương `@PreAuthorize` ở Spring Security).

### 3. `src/pages/` (Tầng Màn hình Giao diện)
- **LoginPage.jsx**: Màn hình Đăng nhập.
- **DashboardPage.jsx**: Màn hình Tổng quan sau khi đăng nhập.
- **UnauthorizedPage.jsx**: Trang báo lỗi 403 Forbidden khi người dùng truy cập trái phép.

### 4. `src/routes/` (Tầng Định tuyến & Phân quyền)
- **AppRoutes.jsx**: Khai báo danh sách đường dẫn ứng dụng (`/login`, `/dashboard`, `/unauthorized`).
