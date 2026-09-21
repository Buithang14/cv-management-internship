# CV Management System - Front-End (ReactJS + Ant Design)

Tài liệu tóm tắt dành cho Back-End Developer để nắm bắt và kiểm soát toàn bộ mã nguồn Front-End.

---

## 📌 1. Các File & Thư mục CẦN QUAN TÂM

| Thư mục / File | Tương đương ở Back-End | Chức năng & Ý nghĩa |
|---|---|---|
| `nguyenTacDesign.txt` | Tài liệu Quy chuẩn Design | Bộ quy chuẩn thiết kế UI Enterprise: Dùng Ant Design, tối giản, thông tin mật độ cao, cấm màu tím dốc / glassmorphism / hiệu ứng màu mè (Anti-AI-Slop). |
| `src/api/axiosClient.js` | `SecurityFilter` + `RestTemplate` | Cầu nối gọi API trỏ tới Spring Boot (`http://localhost:8080/api/v1`), tự đính kèm JWT Token vào Header và tự xử lý xóa token/đẩy về Login khi bị lỗi `401 Unauthorized`. |
| `src/api/authApi.js` | FeignClient / API Service | Tập hợp các hàm gọi API Đăng nhập (`POST /auth/login`) gửi tới `AuthController` của Back-End. |
| `src/pages/` | Thư mục View / Controller | Chứa giao diện của từng màn hình (ví dụ: `LoginPage.jsx`, `CvManagementPage.jsx`...). |
| `src/routes/` | Security Config / Routing | Chứa file quản lý điều hướng trang và bộ lọc phân quyền (Protected Routes theo Role: ADMIN, HR, TECH_LEAD, USER). |
| `src/components/` | Component dùng chung | Chứa các thành phần UI dùng lại nhiều lần như Navbar, Sidebar, Modal, Badge trạng thái CV... |

---

## 🙈 2. Các File TẠM THỜI BỎ QUA (Khung mặc định)

Bạn không cần sửa hoặc bận tâm tới các file cấu hình mặc định này:

- **`package.json`**: Khai báo danh sách thư viện (tương tự `pom.xml` của Maven).
- **`node_modules/`**: Thư mục chứa mã nguồn thư viện đã tải về (tương tự thư mục `.m2` của Maven).
- **`vite.config.js`**: Cấu hình công cụ đóng gói Vite.
- **`index.html`**: File HTML duy nhất chứa thẻ `<div id="root"></div>` để React render ứng dụng.
- **`src/main.jsx`**: File kích hoạt ứng dụng React (tương tự hàm `main()` trong Spring Boot).

---

## 🚀 3. Các Lệnh Thao Tác Cơ Bản

Chạy tại thư mục `front_end/cv-management-fe`:

- **Khởi chạy Dev Server:**
  ```bash
  npm run dev
  ```
- **Cài đặt thêm thư viện mới:**
  ```bash
  npm install <ten-thu-vien>
  ```
