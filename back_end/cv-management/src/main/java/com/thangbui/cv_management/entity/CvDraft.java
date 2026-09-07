package com.thangbui.cv_management.entity;

import com.thangbui.cv_management.enums.DraftStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cv_drafts")
@Getter
@Setter
@NoArgsConstructor
public class CvDraft extends BaseEntity {
// Bản Nháp (Draft) — tồn tại song song với CV gốc, không ảnh hưởng nhau
// Vòng đời: DRAFTING → PENDING_TECH → PENDING_HR → [Hoàn tất: thăng cấp thành Cv version mới]
//                                                  → [Từ chối: quay về REJECTED_BY_TECH/HR]
//                                                  → [HR hủy: CANCELED]

    // ===================== QUAN HỆ FK =====================

    // Bản nháp này của nhân viên nào?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Yêu cầu cập nhật nào tạo ra bản nháp này?
    // nullable = true → nhân viên có thể tự giác tạo nháp (không cần HR phát lệnh)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = true)
    private CvUpdateRequest request;

    // Bản nháp này được nhân bản (clone) từ phiên bản CV gốc nào?
    // → Luồng 5: "Hệ thống nhân bản CV gốc thành một Bản Nháp"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "based_on_cv_id", nullable = true)
    private Cv basedOnCv;

    // ===================== TRẠNG THÁI NHÁP =====================

    // Trạng thái bản nháp (TÁCH BIỆT hoàn toàn với overall_status của CV gốc)
    //   DRAFTING        → Nhân viên đang soạn, chưa gửi duyệt
    //   PENDING_TECH    → Chờ Tech Lead duyệt (Trạm 1)
    //   PENDING_HR      → Chờ HR duyệt chót  (Trạm 2)
    //   REJECTED_BY_TECH→ Tech Lead từ chối → mở khóa cho nhân viên sửa lại
    //   REJECTED_BY_HR  → HR từ chối → mở khóa + Smart Routing (bỏ qua Trạm 1)
    //   CANCELED        → HR hủy yêu cầu (xóa mềm, nhân viên vẫn copy lại được)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DraftStatus status = DraftStatus.DRAFTING;

    // Lý do từ chối gần nhất (Tech Lead hoặc HR ghi vào popup)
    // Ghi đè mỗi lần có vòng từ chối mới
    @Column(name = "rejection_note", columnDefinition = "TEXT")
    private String rejectionNote;

    // ===================== NỘI DUNG CV (BẢN COPY) =====================
    // Copy từ CV gốc khi tạo nháp, nhân viên chỉnh sửa trên đây
    // CV gốc vẫn nguyên vẹn trong suốt quá trình

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "objective", columnDefinition = "TEXT")
    private String objective;

    // Danh sách kinh nghiệm làm việc (JSON string)
    @Column(name = "experiences_json", columnDefinition = "TEXT")
    private String experiencesJson;

    // Danh sách học vấn (JSON string)
    @Column(name = "educations_json", columnDefinition = "TEXT")
    private String educationsJson;

    // Danh sách kỹ năng (JSON string)
    @Column(name = "skills_json", columnDefinition = "TEXT")
    private String skillsJson;

}
