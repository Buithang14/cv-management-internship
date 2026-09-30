package com.thangbui.cv_management.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.thangbui.cv_management.entity.CvApprovalLog;
import com.thangbui.cv_management.enums.ApprovalAction;
import java.util.List;

@Repository
public interface CvApprovalLogRepository extends JpaRepository<CvApprovalLog, Long> {
    /**
     * UC16: Lấy toàn bộ lịch sử phê duyệt của một bản nháp CV, sắp xếp theo thời
     * gian tăng dần
     */
    List<CvApprovalLog> findByDraftIdOrderByCreatedAtAsc(Long draftId);

    /**
     * Lấy lịch sử các bản nháp đã được Tech Lead xử lý (duyệt/từ chối) trong phòng ban,
     * sắp xếp mới nhất trước.
     */
    @Query("SELECT l FROM CvApprovalLog l " +
           "WHERE l.action IN :actions " +
           "AND l.draft.user.department.id = :departmentId " +
           "ORDER BY l.createdAt DESC")
    List<CvApprovalLog> findByActionsAndDepartmentId(
            @Param("actions") List<ApprovalAction> actions,
            @Param("departmentId") Long departmentId);

    /**
     * Lấy lịch sử các lần HR xử lý (duyệt chít/từ chối) toàn bộ công ty,
     * sắp xếp mới nhất trước.
     */
    @Query("SELECT l FROM CvApprovalLog l " +
           "WHERE l.action IN :actions " +
           "ORDER BY l.createdAt DESC")
    List<CvApprovalLog> findByActions(@Param("actions") List<ApprovalAction> actions);
}
