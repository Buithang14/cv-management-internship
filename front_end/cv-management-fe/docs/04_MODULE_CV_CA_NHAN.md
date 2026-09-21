# 04. Module CV Cá Nhân Dành Cho User / Intern (MyCvPage)

Tài liệu chi tiết kỹ thuật về giao diện, luồng gọi API và cách thức tương tác với Back-End Spring Boot cho tính năng CV Cá Nhân.

---

## 🎯 1. Các Thao Tác Kỹ Thuật (API Mapping chuẩn từ Back-End)

| Thao Tác Trên Giao Diện | Hàm Service Front-End (`cvApi.js`) | API Controller Back-End | Method | Input Data | Output Data (Response) |
|---|---|---|---|---|---|
| **Xem CV chính thức** | `cvApi.getMyCv()` | `/api/v1/cvs/me` | `GET` | *(Không có, truyền Token)* | `CvDTO` |
| **Khởi tạo / Lấy bản nháp** | `cvApi.initDraft()` | `/api/v1/cv-drafts/init` | `POST` | *(Không có, truyền Token)* | `CvDraftDTO` |
| **Lưu bản nháp** | `cvApi.updateDraft(id, values)` | `/api/v1/cv-drafts/{id}` | `PUT` | `UpdateCvDraftRequest` | `CvDraftDTO` |
| **Nộp bài gửi duyệt** | `cvApi.submitDraft(id)` | `/api/v1/cv-drafts/{id}/submit` | `POST` | `@PathVariable("id") Long id` | `CvDraftDTO` |
| **Xem lịch sử duyệt** | `cvApi.getDraftLogs(id)` | `/api/v1/cv-drafts/{id}/logs` | `GET` | `@PathVariable("id") Long id` | `List<CvApprovalLogDTO>` |

---

## 📁 2. Các File Mã Nguồn Đã Tạo

1. **`src/api/cvApi.js`**: Chứa các hàm gọi REST API sử dụng `axiosClient`.
2. **`src/pages/MyCvPage.jsx`**: Trang hiển thị CV chính thức, có nút mở Form Modal Soạn Thảo Bản Nháp, nút Lưu Nháp và Nộp Bài Gửi Duyệt.
3. **`src/routes/AppRoutes.jsx`**: Đăng ký đường dẫn `/my-cv` được bảo vệ bởi `ProtectedRoute`.
