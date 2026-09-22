package com.thangbui.cv_management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO tổng hợp toàn bộ số liệu thống kê cho Dashboard.
 *
 * Response mẫu:
 * {
 *   "totalEmployees": 25,
 *   "cvUpdatedCount": 18,
 *   "cvNotUpdatedCount": 7,
 *   "pendingApprovalCount": 5,
 *   "byDepartment": [
 *     { "departmentName": "Backend", "updatedCount": 8, "notUpdatedCount": 2 },
 *     { "departmentName": "Frontend", "updatedCount": 5, "notUpdatedCount": 3 }
 *   ]
 * }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    // Tổng số nhân viên trong hệ thống
    private long totalEmployees;

    // Số CV đang ở trạng thái UPDATED (Màu Xanh)
    private long cvUpdatedCount;

    // Số CV đang ở trạng thái NOT_UPDATED (Màu Đỏ)
    private long cvNotUpdatedCount;

    // Số bản nháp đang chờ duyệt (PENDING_TECH hoặc PENDING_HR)
    private long pendingApprovalCount;

    // Danh sách thống kê theo từng phòng ban (dùng cho biểu đồ)
    private List<DeptCvStatDTO> byDepartment;
}
