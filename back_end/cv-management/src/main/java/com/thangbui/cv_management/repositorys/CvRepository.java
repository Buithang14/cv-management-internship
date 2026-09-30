package com.thangbui.cv_management.repositorys;

import com.thangbui.cv_management.entity.Cv;
import com.thangbui.cv_management.enums.CvLanguage;
import com.thangbui.cv_management.enums.CvStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác với bảng cvs trong database.
 */
@Repository
public interface CvRepository extends JpaRepository<Cv, Long> {

    // tìm theo id của user và isActive = true
    Optional<Cv> findFirstByUserIdAndIsActiveTrue(Long userId);

    default Optional<Cv> findByUserIdAndIsActiveTrue(Long userId) {
        return findFirstByUserIdAndIsActiveTrue(userId);
    }

    // Fallback cho dữ liệu cũ (language IS NULL)
    Optional<Cv> findFirstByUserIdAndLanguageIsNullAndIsActiveTrue(Long userId);

    // Tìm CV đang active theo user và ngôn ngữ cụ thể (luôn lấy version mới nhất để tránh crash)
    Optional<Cv> findFirstByUserIdAndLanguageAndIsActiveTrueOrderByVersionDesc(Long userId, CvLanguage language);

    // Lấy tất cả CV đang active của 1 user (để kiểm tra xem user có những ngôn ngữ nào)
    List<Cv> findAllByUserIdAndIsActiveTrue(Long userId);

    /**
     * UC13: HR xem và lọc toàn bộ CV của công ty
     * - Chỉ lấy CV đang hoạt động (isActive = true)
     * - Nếu deptId = null: lấy mọi phòng ban
     * - Nếu status = null: lấy mọi trạng thái
     */
    @Query("SELECT c FROM Cv c WHERE c.isActive = true " +
            "AND (:deptId IS NULL OR c.user.department.id = :deptId) " +
            "AND (:status IS NULL OR c.overallStatus = :status)")
    List<Cv> findActiveCvsWithFilter(
            @Param("deptId") Long deptId,
            @Param("status") CvStatus status);

    // Dashboard: đếm số CV đang hoạt động theo trạng thái (UPDATED / NOT_UPDATED)
    long countByOverallStatusAndIsActiveTrue(CvStatus status);

    // Dashboard: lấy tất cả CV đang hoạt động (để tính thống kê theo phòng ban)
    List<Cv> findAllByIsActiveTrue();
}
