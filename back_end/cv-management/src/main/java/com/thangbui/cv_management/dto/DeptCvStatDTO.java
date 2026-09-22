package com.thangbui.cv_management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO chứa thống kê CV của MỘT phòng ban.
 * Được dùng trong danh sách byDepartment của DashboardStatsDTO.
 *
 * Ví dụ:
 *   { "departmentName": "Backend", "updatedCount": 8, "notUpdatedCount": 2 }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeptCvStatDTO {

    // Tên phòng ban
    private String departmentName;

    // Số CV đã cập nhật (overallStatus = UPDATED)
    private long updatedCount;

    // Số CV chưa cập nhật (overallStatus = NOT_UPDATED)
    private long notUpdatedCount;
}
