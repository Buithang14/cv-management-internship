package com.thangbui.cv_management.controller;

import com.thangbui.cv_management.dto.ApiResponse;
import com.thangbui.cv_management.dto.DashboardStatsDTO;
import com.thangbui.cv_management.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * UC: Xem Dashboard thống kê tổng quan.
     * Ai làm?       → HR, Tech Lead, Admin (3 role)
     * Làm gì?       → Đọc số liệu thống kê tổng hợp
     * Được phép?    → Có role HR / TECH_LEAD / ADMIN
     * Thay đổi DB?  → Không (chỉ đọc)
     * Trả về?       → DashboardStatsDTO
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('HR', 'TECH_LEAD', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStats() {
        DashboardStatsDTO stats = dashboardService.getStats();
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê dashboard thành công", stats));
    }
}
