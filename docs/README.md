# 📁 Tài Liệu Hệ Thống — CV Management

> Thư mục này chứa toàn bộ tài liệu phân tích hệ thống quản lý CV nội bộ.

## 📂 Danh sách tài liệu

| File | Nội dung |
|---|---|
| 00_glossary.md | 📖 Bảng chú thích thuật ngữ Tiếng Anh → Tiếng Việt |
| 01_use_case_diagram.md | 🗂️ Use Case Diagram — Sơ đồ ca sử dụng |
| 02_use_case_description.md | 📋 Use Case Description — Mô tả chi tiết 21 ca sử dụng |
| 03_state_diagram.md | 🔄 State Diagram — Sơ đồ trạng thái |

## 👥 Actors (Tác nhân)

| Tên | Vai trò |
|---|---|
| **Employee** — Nhân viên | Xem và chỉnh sửa CV cá nhân |
| **Tech Lead** — Trưởng nhóm kỹ thuật | Duyệt bản nháp Trạm 1 |
| **HR** — Nhân sự | Toàn quyền quản lý — duyệt Trạm 2 |
| **System** — Hệ thống | Tự động hóa: clone, nâng version, thông báo |

## 🔑 Luồng chính (Happy Path — Luồng hạnh phúc)

HR tạo yêu cầu → System clone CV → Employee chỉnh sửa & nộp
→ Tech Lead duyệt Trạm 1 → HR duyệt Trạm 2
→ System nâng version CV + gửi thông báo
