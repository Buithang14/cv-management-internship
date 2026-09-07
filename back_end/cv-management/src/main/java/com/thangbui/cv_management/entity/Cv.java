package com.thangbui.cv_management.entity;

import com.thangbui.cv_management.enums.CvStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cvs")
@Getter
@Setter
@NoArgsConstructor
public class Cv extends BaseEntity {
    // extends BaseEntity → kế thừa: id, createdAt, updatedAt

    // ===================== QUAN HỆ FK =====================

    // @ManyToOne: Nhiều Cv thuộc về 1 User
    // fetch = LAZY: Không load User ngay khi load Cv
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ===================== CÁC FIELD THƯỜNG =====================

    // Số thứ tự phiên bản: 1 → 2 → 3...
    // Mỗi lần HR duyệt chót bản nháp, version tăng thêm 1
    @Column(name = "version")
    private Integer version = 1;

    // Phiên bản này có đang được dùng không?
    // true = Active (phiên bản hiện hành, chỉ có 1 row true/user)
    // false = Archived (phiên bản cũ, lưu lại để tra cứu lịch sử)
    @Column(name = "is_active")
    private Boolean isActive = true;

    // Trạng thái TỔNG của CV gốc — phản ánh tình trạng HR yêu cầu
    // UPDATED → CV đã được cập nhật (màu Xanh)
    // NOT_UPDATED → HR đã phát lệnh, nhân viên chưa xong (màu Đỏ/Cam)
    // REQUEST_CANCELED→ HR hủy yêu cầu (màu Xám) — CV vẫn dùng tốt
    // Lưu ý: KHÔNG phải trạng thái bản nháp — xem DraftStatus cho bản nháp
    @Enumerated(EnumType.STRING)
    @Column(name = "overall_status", nullable = false)
    private CvStatus overallStatus = CvStatus.UPDATED;

    // ===================== NỘI DUNG CV =====================

    // Họ tên hiển thị trong CV (có thể khác tên tài khoản)
    @Column(name = "full_name", length = 100)
    private String fullName;

    // Đường dẫn ảnh avatar
    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "phone", length = 20)
    private String phone;

    // Tóm tắt bản thân
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    // Mục tiêu nghề nghiệp
    @Column(name = "objective", columnDefinition = "TEXT")
    private String objective;

    // ===================== JSON FIELDS =====================
    // Lưu dưới dạng JSON string thay vì tạo thêm bảng riêng
    // Ví dụ experiencesJson: "[{\"company\":\"ABC\",\"year\":2023}, {...}]"

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
