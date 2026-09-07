package com.thangbui.cv_management.dto.request;

import com.thangbui.cv_management.enums.ApprovalAction;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO nhận dữ liệu khi người có thẩm quyền (Tech Lead hoặc HR) thực hiện duyệt hoặc từ chối Bản Nháp.
 * - Trạm 1: Tech Lead duyệt (UC09: APPROVED_BY_TECH) hoặc từ chối (UC10: REJECTED_BY_TECH).
 * - Trạm 2: HR duyệt chót (UC14: APPROVED_BY_HR) hoặc từ chối (UC15: REJECTED_BY_HR).
 * 
 * Lưu ý quan trọng:
 * - Quá trình duyệt diễn ra trên BẢN NHÁP (CvDraft), không tác động trực tiếp vào CV gốc cho đến khi HR duyệt chót.
 * - approverId được tự động lấy từ Token JWT của người đang đăng nhập, client không cần gửi lên.
 */
@Getter
@Setter
public class CreateCvApprovalLogRequest {

    /**
     * ID của Bản Nháp CV cần duyệt (FK tới bảng cv_drafts).
     * Bắt buộc phải có để xác định bản nháp nào đang được duyệt/từ chối.
     */
    @NotNull(message = "Phải chỉ định bản nháp CV cần duyệt (draftId không được để trống)")
    private Long draftId;

    /**
     * Hành động phê duyệt:
     * - APPROVED_BY_TECH: Tech Lead duyệt Trạm 1 → chuyển sang PENDING_HR
     * - REJECTED_BY_TECH: Tech Lead từ chối Trạm 1 → chuyển về REJECTED_BY_TECH
     * - APPROVED_BY_HR: HR duyệt chót Trạm 2 → nâng version CV gốc và hoàn tất
     * - REJECTED_BY_HR: HR từ chối Trạm 2 → chuyển về REJECTED_BY_HR (kích hoạt Smart Routing cho lần gửi sau)
     */
    @NotNull(message = "Phải chọn hành động duyệt hợp lệ")
    private ApprovalAction action;

    /**
     * Lý do từ chối hoặc lời phê duyệt từ người duyệt.
     * - Khi REJECTED: Bắt buộc phải nhập để nhân viên biết cách sửa lại.
     * - Khi APPROVED: Tùy chọn (optional), có thể để trống.
     */
    private String comment;

}
