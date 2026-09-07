package com.thangbui.cv_management.enums;

/**
 * Phân quyền người dùng trong hệ thống (4 vai trò):
 * - ADMIN: Quản trị hệ thống/IT — Quản lý nhân sự (tạo tài khoản, khóa/mở khóa - UC17), quản lý phòng ban.
 * - HR: Nghiệp vụ nhân sự — Master Dashboard xem CV (UC13), tạo yêu cầu nộp CV (UC11, UC12), duyệt chót Trạm 2 (UC14, UC15).
 * - TECH_LEAD: Chuyên môn kỹ thuật — Quản lý cấp phòng ban, duyệt kỹ thuật Trạm 1 (UC08, UC09, UC10).
 * - EMPLOYEE: Nhân viên — Xem CV cá nhân (UC02), soạn nháp (UC03, UC04) và gửi duyệt (UC05).
 */
public enum UserRole {
    ADMIN,
    HR,
    TECH_LEAD,
    EMPLOYEE
}
