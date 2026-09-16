-- ═══════════════════════════════════════════════════════════════
-- CV MANAGEMENT SYSTEM — DATABASE SCHEMA
-- Cập nhật: Tách cv_drafts riêng, sửa enum theo luồng nghiệp vụ
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. DEPARTMENTS — Phòng ban
-- ─────────────────────────────────────────────
CREATE TABLE `departments` (
  `id`         int          PRIMARY KEY AUTO_INCREMENT,
  `code`       varchar(20)  UNIQUE NOT NULL,   -- Mã phòng ban (dùng để validate import Excel)
  `name`       varchar(100) NOT NULL,
  `created_at` datetime     DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime     DEFAULT (CURRENT_TIMESTAMP)
);

-- ─────────────────────────────────────────────
-- 2. USERS — Nhân sự
-- ─────────────────────────────────────────────
CREATE TABLE `users` (
  `id`            int          PRIMARY KEY AUTO_INCREMENT,
  `department_id` int          NOT NULL,
  `username`      varchar(50)  UNIQUE NOT NULL,
  `password`      varchar(255) NOT NULL,           -- Lưu bcrypt hash
  `full_name`     varchar(100) NOT NULL,
  `email`         varchar(100) UNIQUE NOT NULL,
  `role`          ENUM ('ADMIN', 'HR', 'TECH_LEAD', 'EMPLOYEE') NOT NULL,
  --   ADMIN    : Quản trị hệ thống — Quản lý tài khoản nhân viên (tạo mới, khóa/mở khóa), phòng ban
  --   HR       : Nghiệp vụ nhân sự — Master Dashboard, tạo yêu cầu cập nhật CV, duyệt Trạm 2
  --   TECH_LEAD: Chuyên môn kỹ thuật — Quản lý cấp phòng ban, duyệt kỹ thuật Trạm 1
  --   EMPLOYEE : Nhân viên — Xem/sửa và gửi duyệt CV của mình
  `is_active`     boolean      DEFAULT true,
  `created_at`    datetime     DEFAULT (CURRENT_TIMESTAMP),
  `updated_at`    datetime     DEFAULT (CURRENT_TIMESTAMP)
);

-- ─────────────────────────────────────────────
-- 3. CVS — CV gốc (mỗi version là 1 row riêng)
-- ─────────────────────────────────────────────
CREATE TABLE `cvs` (
  `id`             int          PRIMARY KEY AUTO_INCREMENT,
  `user_id`        int          NOT NULL,
  `version`        int          DEFAULT 1,
  --   Số thứ tự phiên bản: 1 → 2 → 3...
  --   Tăng mỗi khi HR duyệt chót bản nháp (Luồng 6 — Hoàn tất)
  `is_active`      boolean      DEFAULT true,
  --   true  = Phiên bản hiện hành (chỉ 1 row true/user)
  --   false = Archived (lưu lại lịch sử, không dùng nữa)
  `overall_status` ENUM ('UPDATED', 'NOT_UPDATED', 'REQUEST_CANCELED') NOT NULL DEFAULT 'UPDATED',
  --   UPDATED         : CV đã được cập nhật — hiển thị màu Xanh
  --   NOT_UPDATED     : HR phát lệnh, nhân viên chưa hoàn thành — hiển thị màu Đỏ/Cam
  --   REQUEST_CANCELED: HR hủy yêu cầu — hiển thị màu Xám (CV vẫn dùng tốt)
  -- Nội dung CV
  `full_name`         varchar(100),
  `avatar_url`        varchar(255),
  `phone`             varchar(20),
  `summary`           text,
  `objective`         text,
  `experiences_json`  text,
  `educations_json`   text,
  `skills_json`       text,
  `created_at`        datetime DEFAULT (CURRENT_TIMESTAMP),
  `updated_at`        datetime DEFAULT (CURRENT_TIMESTAMP)
);

-- ─────────────────────────────────────────────
-- 4. CV_UPDATE_REQUESTS — Yêu cầu cập nhật CV (từ HR)
-- ─────────────────────────────────────────────
CREATE TABLE `cv_update_requests` (
  `id`             int          PRIMARY KEY AUTO_INCREMENT,
  `requested_by`   int          NOT NULL,  -- FK → users (người gửi: HR)
  `target_user_id` int          NOT NULL,  -- FK → users (người nhận: Employee)
  `deadline`       datetime     NOT NULL,
  `batch_name`     varchar(100),           -- Tên đợt thu thập (ví dụ: "Q3/2026")
  `status`         ENUM ('PENDING', 'COMPLETED', 'CANCELED') DEFAULT 'PENDING',
  --   PENDING  : Yêu cầu đang chờ xử lý
  --   COMPLETED: CV đã được duyệt xong (Luồng 6 — Hoàn tất)
  --   CANCELED : HR hủy yêu cầu (Luồng 4b)
  `created_at`     datetime     DEFAULT (CURRENT_TIMESTAMP),
  `updated_at`     datetime     DEFAULT (CURRENT_TIMESTAMP)   -- Đồng bộ với BaseEntity.java (@LastModifiedDate)
);

-- ─────────────────────────────────────────────
-- 5. CV_DRAFTS — Bản nháp (tồn tại song song với CV gốc)
-- ─────────────────────────────────────────────
CREATE TABLE `cv_drafts` (
  `id`              int  PRIMARY KEY AUTO_INCREMENT,
  `user_id`         int  NOT NULL,    -- FK → users
  `request_id`      int,              -- FK → cv_update_requests (NULL nếu tự giác tạo nháp)
  `based_on_cv_id`  int,              -- FK → cvs (clone từ version nào)
  `status`          ENUM (
    'DRAFTING',         -- Nhân viên đang soạn, chưa gửi duyệt
    'PENDING_TECH',     -- Chờ Tech Lead duyệt (Trạm 1)
    'PENDING_HR',       -- Tech Lead đã duyệt, chờ HR duyệt chót (Trạm 2)
    'REJECTED_BY_TECH', -- Tech Lead từ chối → mở khóa cho nhân viên sửa lại
    'REJECTED_BY_HR',   -- HR từ chối → mở khóa + Smart Routing (bỏ qua Trạm 1)
    'CANCELED',         -- HR hủy yêu cầu — xóa mềm, nhân viên vẫn copy lại được
    'APPROVED'          -- HR duyệt chót thành công (hoàn tất vòng đời bản nháp)
  ) NOT NULL DEFAULT 'DRAFTING',
  `rejection_note`    text,           -- Lý do từ chối gần nhất (Tech Lead/HR ghi vào popup)
  -- Nội dung bản nháp (copy từ CV gốc, nhân viên chỉnh sửa trên đây)
  `full_name`         varchar(100),
  `avatar_url`        varchar(255),
  `phone`             varchar(20),
  `summary`           text,
  `objective`         text,
  `experiences_json`  text,
  `educations_json`   text,
  `skills_json`       text,
  `created_at`        datetime DEFAULT (CURRENT_TIMESTAMP),
  `updated_at`        datetime DEFAULT (CURRENT_TIMESTAMP)
);

-- ─────────────────────────────────────────────
-- 6. CV_APPROVAL_LOGS — Lịch sử duyệt/từ chối
-- ─────────────────────────────────────────────
CREATE TABLE `cv_approval_logs` (
  `id`          int  PRIMARY KEY AUTO_INCREMENT,
  `draft_id`    int  NOT NULL,  -- FK → cv_drafts (duyệt trên BẢN NHÁP, không phải CV gốc)
  `approver_id` int  NOT NULL,  -- FK → users (Tech Lead hoặc HR)
  `action`      ENUM (
    'APPROVED_BY_TECH',  -- Tech Lead duyệt → draft chuyển sang PENDING_HR
    'APPROVED_BY_HR',    -- HR duyệt chót   → CV gốc lên version mới
    'REJECTED_BY_TECH',  -- Tech Lead từ chối → nhân viên sửa lại, qua Trạm 1
    'REJECTED_BY_HR'     -- HR từ chối       → nhân viên sửa lại, Smart Routing Trạm 2
  ) NOT NULL,
  `comment`     text,           -- Lý do (bắt buộc khi REJECTED, optional khi APPROVED)
  `created_at`  datetime DEFAULT (CURRENT_TIMESTAMP),
  `updated_at`  datetime DEFAULT (CURRENT_TIMESTAMP)   -- Đồng bộ với BaseEntity.java (@LastModifiedDate)
);

-- ─────────────────────────────────────────────
-- 7. NOTIFICATIONS — Thông báo trong hệ thống
-- ─────────────────────────────────────────────
CREATE TABLE `notifications` (
  `id`         int          PRIMARY KEY AUTO_INCREMENT,
  `user_id`    int          NOT NULL,   -- FK → users (thông báo gửi đến ai)
  `title`      varchar(200) NOT NULL,
  `message`    text         NOT NULL,
  `is_read`    boolean      DEFAULT false,
  `created_at` datetime     DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime     DEFAULT (CURRENT_TIMESTAMP)   -- Đồng bộ với BaseEntity.java (@LastModifiedDate)
);

-- ═══════════════════════════════════════════════════════════════
-- FOREIGN KEYS
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE `users`              ADD FOREIGN KEY (`department_id`)   REFERENCES `departments` (`id`);

ALTER TABLE `cvs`                ADD FOREIGN KEY (`user_id`)         REFERENCES `users` (`id`);

ALTER TABLE `cv_update_requests` ADD FOREIGN KEY (`requested_by`)    REFERENCES `users` (`id`);
ALTER TABLE `cv_update_requests` ADD FOREIGN KEY (`target_user_id`)  REFERENCES `users` (`id`);

ALTER TABLE `cv_drafts`          ADD FOREIGN KEY (`user_id`)         REFERENCES `users` (`id`);
ALTER TABLE `cv_drafts`          ADD FOREIGN KEY (`request_id`)      REFERENCES `cv_update_requests` (`id`);
ALTER TABLE `cv_drafts`          ADD FOREIGN KEY (`based_on_cv_id`)  REFERENCES `cvs` (`id`);

ALTER TABLE `cv_approval_logs`   ADD FOREIGN KEY (`draft_id`)        REFERENCES `cv_drafts` (`id`);
ALTER TABLE `cv_approval_logs`   ADD FOREIGN KEY (`approver_id`)     REFERENCES `users` (`id`);

ALTER TABLE `notifications`      ADD FOREIGN KEY (`user_id`)         REFERENCES `users` (`id`);
