package com.thangbui.cv_management.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thangbui.cv_management.entity.CvApprovalLog;
import java.util.List;

@Repository
public interface CvApprovalLogRepository extends JpaRepository<CvApprovalLog, Long> {
    /**
     * UC16: Lấy toàn bộ lịch sử phê duyệt của một bản nháp CV, sắp xếp theo thời
     * gian tăng dần
     */
    List<CvApprovalLog> findByDraftIdOrderByCreatedAtAsc(Long draftId);
    // Sắp xếp theo thời gian tạo từ cũ đến mới (Asc - tăng dần), để người xem
    // thấy được thứ tự diễn biến các lần duyệt theo đúng dòng thời gian.
}
