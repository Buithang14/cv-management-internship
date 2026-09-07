package com.thangbui.cv_management.dto.response;

import com.thangbui.cv_management.enums.ApprovalAction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO trả về thông tin lịch sử một lần phê duyệt / từ chối Bản Nháp (UC16 - Xem lịch sử duyệt CV).
 * - Được truy vấn từ bảng cv_approval_logs theo draft_id.
 * - Giúp Employee biết lý do bị từ chối và giúp HR kiểm tra toàn bộ luồng phê duyệt 2 trạm.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CvApprovalLogDTO {

    private Long id;

    /**
     * ID của Bản Nháp CV được duyệt (draft_id trong bảng cv_approval_logs).
     */
    private Long draftId;

    /**
     * Thông tin người duyệt (Tech Lead ở Trạm 1 hoặc HR ở Trạm 2).
     * Làm phẳng dữ liệu User (approverId + approverName) để tránh vòng lặp JSON.
     */
    private Long approverId;
    private String approverName;

    /**
     * Hành động đã thực hiện: APPROVED_BY_TECH, APPROVED_BY_HR, REJECTED_BY_TECH, REJECTED_BY_HR
     */
    private ApprovalAction action;

    /**
     * Lời phê duyệt hoặc lý do từ chối (bắt buộc khi REJECTED).
     */
    private String comment;

    /**
     * Thời điểm thực hiện hành động duyệt/từ chối.
     */
    private LocalDateTime createdAt;

}
