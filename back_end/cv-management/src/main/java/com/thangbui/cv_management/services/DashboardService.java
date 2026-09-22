package com.thangbui.cv_management.services;

import com.thangbui.cv_management.dto.DashboardStatsDTO;
import com.thangbui.cv_management.dto.DeptCvStatDTO;
import com.thangbui.cv_management.entity.Cv;
import com.thangbui.cv_management.entity.Department;
import com.thangbui.cv_management.enums.CvStatus;
import com.thangbui.cv_management.enums.DraftStatus;
import com.thangbui.cv_management.repositorys.CvDraftRepository;
import com.thangbui.cv_management.repositorys.CvRepository;
import com.thangbui.cv_management.repositorys.DepartmentRepository;
import com.thangbui.cv_management.repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final CvRepository cvRepository;
    private final CvDraftRepository cvDraftRepository;
    private final DepartmentRepository departmentRepository;

    /**
     * Tính toán và trả về toàn bộ số liệu thống kê cho trang Dashboard.
     *
     * Luồng xử lý:
     * 1. Đếm tổng số nhân viên (user.count)
     * 2. Đếm CV theo trạng thái UPDATED / NOT_UPDATED
     * 3. Đếm bản nháp đang chờ duyệt (PENDING_TECH + PENDING_HR)
     * 4. Tính thống kê CV theo từng phòng ban (cho biểu đồ)
     */
    public DashboardStatsDTO getStats() {

        // ── Bước 1: Tổng số nhân viên ──────────────────────────────────────
        long totalEmployees = userRepository.count();

        // ── Bước 2: Đếm CV theo trạng thái ────────────────────────────────
        long cvUpdatedCount = cvRepository.countByOverallStatusAndIsActiveTrue(CvStatus.UPDATED);
        long cvNotUpdatedCount = cvRepository.countByOverallStatusAndIsActiveTrue(CvStatus.NOT_UPDATED);

        // ── Bước 3: Đếm bản nháp đang chờ duyệt ──────────────────────────
        long pendingApprovalCount = cvDraftRepository.countByStatusIn(
                List.of(DraftStatus.PENDING_TECH, DraftStatus.PENDING_HR)
        );

        // ── Bước 4: Thống kê CV theo phòng ban (dùng cho biểu đồ) ─────────
        // Lấy tất cả phòng ban
        List<Department> departments = departmentRepository.findAll();

        // Lấy tất cả CV đang hoạt động
        List<Cv> allActiveCvs = cvRepository.findAllByIsActiveTrue();

        // Nhóm CV theo departmentId:  Map<deptId, List<Cv>>
        Map<Long, List<Cv>> cvByDept = allActiveCvs.stream()
                .filter(cv -> cv.getUser() != null && cv.getUser().getDepartment() != null)
                .collect(Collectors.groupingBy(cv -> cv.getUser().getDepartment().getId()));

        // Duyệt từng phòng ban → tính updated / notUpdated
        List<DeptCvStatDTO> byDepartment = new ArrayList<>();
        for (Department dept : departments) {
            List<Cv> deptCvs = cvByDept.getOrDefault(dept.getId(), List.of());

            long updated = deptCvs.stream()
                    .filter(cv -> cv.getOverallStatus() == CvStatus.UPDATED)
                    .count();
            long notUpdated = deptCvs.stream()
                    .filter(cv -> cv.getOverallStatus() == CvStatus.NOT_UPDATED)
                    .count();

            byDepartment.add(new DeptCvStatDTO(dept.getName(), updated, notUpdated));
        }

        return new DashboardStatsDTO(
                totalEmployees,
                cvUpdatedCount,
                cvNotUpdatedCount,
                pendingApprovalCount,
                byDepartment
        );
    }
}
