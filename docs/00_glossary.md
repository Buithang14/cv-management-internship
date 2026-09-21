# 📖 Bảng Chú Thích Thuật Ngữ — Glossary

> Giải nghĩa toàn bộ thuật ngữ Tiếng Anh xuất hiện trong các tài liệu phân tích hệ thống CV Management.

---

## 1. Thuật ngữ UML / Phân tích hệ thống

| Thuật ngữ (EN) | Phiên âm / Viết tắt | Nghĩa Tiếng Việt | Ghi chú |
|---|---|---|---|
| Use Case | U-zơ Kei-s | Ca sử dụng | Mô tả một chức năng hệ thống từ góc nhìn người dùng |
| Use Case Diagram | — | Sơ đồ ca sử dụng | Biểu đồ thể hiện các chức năng và tác nhân |
| Use Case Description | — | Mô tả ca sử dụng | Tài liệu chi tiết từng ca sử dụng |
| Actor | Ắc-tơ | Tác nhân | Người hoặc hệ thống tương tác với phần mềm |
| State Diagram | — | Sơ đồ trạng thái | Biểu đồ thể hiện các trạng thái và chuyển đổi của đối tượng |
| Activity Diagram | — | Sơ đồ hoạt động | Biểu đồ mô tả luồng xử lý / quy trình nghiệp vụ |
| Include | In-cliu-đ | Bao gồm | Quan hệ: UC này luôn gọi UC kia |
| Extend | Ek-s-ten-đ | Mở rộng | Quan hệ: UC này có thể gọi thêm UC kia |
| Precondition | Pri-con-đi-shần | Tiền điều kiện | Điều kiện phải đúng TRƯỚC khi UC thực thi |
| Postcondition | Poust-con-đi-shần | Hậu điều kiện | Trạng thái hệ thống SAU khi UC hoàn thành |
| Main Flow | — | Luồng chính | Các bước thực thi bình thường (không có lỗi) |
| Alternative Flow | Ol-tơ-nơ-tiv Flou | Luồng thay thế | Các bước khi có lỗi hoặc ngoại lệ |
| Guard Condition | Ga-đ Con-đi-shần | Điều kiện bảo vệ | Điều kiện phải thỏa để chuyển trạng thái |
| Transition | Tran-zi-shần | Chuyển đổi / Chuyển trạng thái | Sự kiện kích hoạt thay đổi từ state này sang state khác |
| Event | I-vent | Sự kiện | Tác động từ ngoài vào khiến hệ thống phản ứng |
| Entry Action | En-tri Ắc-shần | Hành động khi vào trạng thái | Thực thi ngay khi bước vào một state |
| Do Action | Du Ắc-shần | Hành động trong khi ở trạng thái | Thực thi liên tục khi đang ở một state |
| Happy Path | Ha-pi Pát | Luồng hạnh phúc | Kịch bản lý tưởng — không có lỗi |
| Entity | En-ti-ti | Thực thể | Đối tượng được lưu vào cơ sở dữ liệu |

---

## 2. Thuật ngữ Kỹ thuật / Lập trình

| Thuật ngữ (EN) | Viết tắt | Nghĩa Tiếng Việt | Ghi chú |
|---|---|---|---|
| Entity | — | Thực thể / Bảng DB | Class Java ánh xạ tới 1 bảng trong database |
| Enum | — | Kiểu liệt kê | Tập hợp giá trị cố định (vd: PENDING, COMPLETED) |
| Foreign Key | FK | Khóa ngoại | Cột tham chiếu đến khóa chính của bảng khác |
| Primary Key | PK | Khóa chính | Định danh duy nhất cho mỗi dòng trong bảng |
| JSON | — | Định dạng dữ liệu | JavaScript Object Notation — lưu dữ liệu có cấu trúc |
| JWT | — | Mã thông báo xác thực | JSON Web Token — dùng để xác thực người dùng |
| Token | Tâu-kần | Mã xác thực | Chuỗi ký tự chứng minh người dùng đã đăng nhập |
| Session | Se-shần | Phiên làm việc | Khoảng thời gian người dùng đang hoạt động trên hệ thống |
| Hash | Ha-sh | Mã hóa một chiều | Dùng cho mật khẩu (bcrypt), không thể giải mã ngược |
| Bcrypt | Bi-crypt | Thuật toán mã hóa | Thuật toán mã hóa mật khẩu an toàn |
| Clone | Clôn | Nhân bản / Sao chép | Tạo bản sao giống hệt đối tượng gốc |
| Version | Vơ-zhần | Phiên bản | Số thứ tự cập nhật của CV (1, 2, 3...) |
| Active | Ắc-tiv | Đang hoạt động | isActive = true → đang dùng |
| Archived | A-kaivd | Đã lưu trữ | isActive = false → phiên bản cũ, lưu lịch sử |
| Dashboard | Đash-bo-đ | Bảng điều khiển | Trang tổng quan hiển thị dữ liệu tổng hợp |
| Badge | Ba-dge | Huy hiệu / Nhãn số | Số nhỏ hiển thị trên icon (vd: 3 thông báo chưa đọc) |
| Nullable | Nơ-la-bờ | Có thể để trống | Cho phép giá trị NULL trong database |
| Unique | Yu-ník | Duy nhất | Không có 2 dòng nào có cùng giá trị (vd: email) |
| Lazy Loading | Lei-zi Lou-đing | Tải lười biếng | Chỉ tải dữ liệu liên quan khi cần, không tải sẵn |
| Snake Case | Snâyk Kei-s | Kiểu gạch dưới | Cách đặt tên: full_name, department_id |
| Camel Case | Ca-mồl Kei-s | Kiểu lạc đà | Cách đặt tên: fullName, departmentId |
| Smart Routing | Sma-t Rau-ting | Định tuyến thông minh | Bỏ qua Trạm 1, thẳng lên Trạm 2 khi đã bị HR từ chối |
| Log | Lo-g | Nhật ký / Ghi chép | Bản ghi lưu lại lịch sử hành động |

---

## 3. Tên Entity (Bảng trong Database)

| Tên Entity (EN) | Tên bảng DB | Nghĩa Tiếng Việt |
|---|---|---|
| `User` | `users` | Người dùng / Tài khoản hệ thống |
| `Department` | `departments` | Phòng ban |
| `Cv` | `cvs` | Hồ sơ năng lực (CV gốc — đã được duyệt) |
| `CvDraft` | `cv_drafts` | Bản nháp CV (đang chỉnh sửa / chờ duyệt) |
| `CvApprovalLog` | `cv_approval_logs` | Nhật ký duyệt CV (lưu lịch sử từng lần duyệt/từ chối) |
| `CvUpdateRequest` | `cv_update_requests` | Yêu cầu cập nhật CV (do HR tạo ra) |
| `Notification` | `notifications` | Thông báo (gửi đến từng người dùng) |
| `BaseEntity` | — | Lớp cha chứa id, createdAt, updatedAt |

---

## 4. Tên Trường Dữ Liệu (Field Names)

| Tên trường (EN) | Nghĩa Tiếng Việt | Kiểu dữ liệu |
|---|---|---|
| `id` | Mã định danh (tự tăng) | Long |
| `createdAt` | Thời điểm tạo | LocalDateTime |
| `updatedAt` | Thời điểm cập nhật gần nhất | LocalDateTime |
| `username` | Tên đăng nhập | String |
| `password` | Mật khẩu (đã mã hóa bcrypt) | String |
| `fullName` | Họ và tên đầy đủ | String |
| `email` | Địa chỉ thư điện tử | String |
| `role` | Vai trò / Phân quyền | Enum (UserRole) |
| `isActive` | Có đang hoạt động không? | Boolean |
| `department` | Phòng ban | Department |
| `version` | Số thứ tự phiên bản CV | Integer |
| `overallStatus` | Trạng thái tổng quát của CV | Enum (CvStatus) |
| `avatarUrl` | Đường dẫn ảnh đại diện | String |
| `phone` | Số điện thoại | String |
| `summary` | Tóm tắt bản thân | Text |
| `objective` | Mục tiêu nghề nghiệp | Text |
| `experiencesJson` | Danh sách kinh nghiệm làm việc (JSON) | Text |
| `educationsJson` | Danh sách học vấn (JSON) | Text |
| `skillsJson` | Danh sách kỹ năng (JSON) | Text |
| `status` | Trạng thái hiện tại | Enum |
| `rejectionNote` | Lý do từ chối (gần nhất) | Text |
| `basedOnCv` | CV gốc được dùng để clone | Cv |
| `request` | Yêu cầu cập nhật liên kết với nháp này | CvUpdateRequest |
| `approver` | Người thực hiện duyệt | User |
| `action` | Hành động duyệt (phê duyệt / từ chối) | Enum (ApprovalAction) |
| `comment` | Nhận xét khi duyệt (tùy chọn) | Text |
| `requestedBy` | Người tạo yêu cầu (HR/Manager) | User |
| `targetUser` | Người được yêu cầu nộp CV (Employee) | User |
| `deadline` | Hạn chót nộp CV | LocalDateTime |
| `batchName` | Tên đợt thu thập CV | String |
| `title` | Tiêu đề thông báo | String |
| `message` | Nội dung chi tiết thông báo | Text |
| `isRead` | Đã đọc thông báo chưa? | Boolean |
| `user` | Liên kết đến người dùng (FK) | User |
| `draft` | Liên kết đến bản nháp (FK) | CvDraft |

---

## 5. Giá trị Enum (Enum Values)

### UserRole — Vai trò người dùng

| Giá trị | Nghĩa Tiếng Việt | Quyền hạn |
|---|---|---|
| `HR` | Nhân sự | Toàn quyền: tạo yêu cầu, duyệt Trạm 2, xem tất cả CV |
| `TECH_LEAD` | Trưởng nhóm kỹ thuật | Duyệt Trạm 1 trong phòng ban của mình |
| `EMPLOYEE` | Nhân viên | Chỉ xem và chỉnh sửa CV cá nhân |

### DraftStatus — Trạng thái bản nháp CV

| Giá trị | Nghĩa Tiếng Việt | Ai có thể hành động tiếp |
|---|---|---|
| `DRAFTING` | Đang soạn thảo | Employee |
| `PENDING_TECH` | Chờ Tech Lead duyệt (Trạm 1) | Tech Lead |
| `PENDING_HR` | Chờ HR duyệt chót (Trạm 2) | HR |
| `REJECTED_BY_TECH` | Bị Tech Lead từ chối | Employee (sửa lại) |
| `REJECTED_BY_HR` | Bị HR từ chối (Smart Routing sẵn sàng) | Employee (sửa lại) |
| `CANCELED` | Bị hủy (do HR hủy yêu cầu) | — (trạng thái cuối) |

### CvStatus — Trạng thái tổng quát CV gốc

| Giá trị | Nghĩa Tiếng Việt | Màu gợi ý |
|---|---|---|
| `UPDATED` | Đã được cập nhật — đang tốt | 🟢 Xanh lá |
| `NOT_UPDATED` | Chưa cập nhật — HR đã phát lệnh | 🔴 Đỏ / Cam |
| `REQUEST_CANCELED` | Yêu cầu đã bị hủy — CV cũ vẫn dùng được | ⚫ Xám |

### RequestStatus — Trạng thái yêu cầu cập nhật

| Giá trị | Nghĩa Tiếng Việt |
|---|---|
| `PENDING` | Đang chờ xử lý — Employee chưa hoàn thành |
| `COMPLETED` | Hoàn tất — HR đã duyệt chót thành công |
| `CANCELED` | Đã hủy — HR hủy giữa chừng |

### ApprovalAction — Hành động duyệt

| Giá trị | Nghĩa Tiếng Việt | Kết quả |
|---|---|---|
| `APPROVED_BY_TECH` | Tech Lead phê duyệt | Draft → PENDING_HR |
| `APPROVED_BY_HR` | HR phê duyệt chót | CV gốc lên version mới |
| `REJECTED_BY_TECH` | Tech Lead từ chối | Draft → REJECTED_BY_TECH |
| `REJECTED_BY_HR` | HR từ chối | Draft → REJECTED_BY_HR + Smart Routing |

---

## 6. Thuật ngữ Nghiệp vụ (Domain Terms)

| Thuật ngữ | Nghĩa |
|---|---|
| **CV** (Curriculum Vitae) | Hồ sơ năng lực / Lý lịch nghề nghiệp |
| **Draft** | Bản nháp — bản chỉnh sửa chưa được duyệt chính thức |
| **Approval** | Phê duyệt / Duyệt |
| **Rejection** | Từ chối |
| **Trạm 1** | Vòng duyệt thứ nhất — do Tech Lead thực hiện |
| **Trạm 2** | Vòng duyệt thứ hai (duyệt chót) — do HR thực hiện |
| **Smart Routing** | Định tuyến thông minh: bỏ qua Trạm 1 khi đã bị HR từ chối trước đó |
| **Clone** | Nhân bản: copy toàn bộ nội dung CV gốc vào bản nháp mới |
| **Version** | Phiên bản: mỗi lần HR duyệt chót → version CV tăng thêm 1 |
| **Batch** | Đợt: nhóm nhiều yêu cầu thu thập CV cùng một thời điểm |
| **Deadline** | Hạn chót nộp CV |
| **Badge** | Huy hiệu số: số thông báo chưa đọc hiển thị trên icon chuông 🔔 |
| **Master Dashboard** | Bảng điều khiển tổng: HR xem CV của tất cả nhân viên |
| **Happy Path** | Luồng hạnh phúc: kịch bản không có lỗi, mọi thứ diễn ra suôn sẻ |
| **Notification** | Thông báo: tin nhắn hệ thống gửi đến người dùng |
| **Log** | Nhật ký: bản ghi lưu lại lịch sử hành động duyệt |
