package com.thangbui.cv_management.entity;

import com.thangbui.cv_management.enums.ApprovalAction;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cv_approval_logs")
@Getter
@Setter
@NoArgsConstructor
public class CvApprovalLog extends BaseEntity {
// Bảng LOG — ghi lại lịch sử mỗi lần Tech Lead hoặc HR duyệt/từ chối bản nháp
// Mỗi lần duyệt/từ chối tạo ra 1 bản ghi → tra cứu lịch sử đầy đủ

    // ===================== QUAN HỆ FK =====================

    // FK 1: draft_id → cv_drafts.id
    // Bản NHÁP nào đang được duyệt? (KHÔNG phải CV gốc)
    // → Quá trình duyệt xảy ra trên bản nháp, CV gốc vẫn nguyên vẹn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_id", nullable = false)
    private CvDraft draft;

    // FK 2: approver_id → users.id
    // Ai là người thực hiện hành động duyệt? (TECH_LEAD hoặc HR)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;

    // ===================== CÁC FIELD THƯỜNG =====================

    // Hành động duyệt — phân biệt rõ Tech Lead vs HR để hỗ trợ Smart Routing
    //   APPROVED_BY_TECH → chuyển draft sang PENDING_HR
    //   APPROVED_BY_HR   → hoàn tất, CV gốc được nâng version
    //   REJECTED_BY_TECH → trả về nhân viên, phải qua Trạm 1 lại
    //   REJECTED_BY_HR   → trả về nhân viên, Smart Routing bỏ qua Trạm 1
    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private ApprovalAction action;

    // Lý do duyệt/từ chối — Tech Lead/HR gõ vào popup Textbox (Luồng 6)
    // nullable = true → khi APPROVED không bắt buộc phải có comment
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

}

