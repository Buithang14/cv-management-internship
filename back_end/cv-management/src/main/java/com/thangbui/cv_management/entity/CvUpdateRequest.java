package com.thangbui.cv_management.entity;

import com.thangbui.cv_management.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "cv_update_requests")
@Getter
@Setter
@NoArgsConstructor
public class CvUpdateRequest extends BaseEntity {
// extends BaseEntity → kế thừa: id, createdAt, updatedAt

    // ===================== QUAN HỆ FK =====================

    // Trường hợp ĐẶC BIỆT: 2 FK cùng trỏ về bảng users
    // → Người tạo yêu cầu: HR (theo UC11 - Phát lệnh yêu cầu nộp CV mới)
    // → Người được yêu cầu nộp CV: Employee (Nhân viên được yêu cầu)
    // Tên field Java khác nhau, @JoinColumn khác nhau → Hibernate ánh xạ thành 2 FK riêng biệt

    // FK 1: requested_by → users.id
    // Người gửi yêu cầu cập nhật CV (bắt buộc là HR)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    // FK 2: target_user_id → users.id
    // Ai là người cần nộp CV? (Employee)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", nullable = false)
    private User targetUser;

    // ===================== CÁC FIELD THƯỜNG =====================

    // Deadline nộp CV — nullable = false → bắt buộc phải có deadline
    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;

    // Tên đợt thu thập CV (ví dụ: "Đợt tuyển dụng Q3/2026")
    // nullable = true (mặc định) → không bắt buộc
    @Column(name = "batch_name", length = 100)
    private String batchName;

    // Trạng thái yêu cầu: PENDING → COMPLETED hoặc CANCELED
    // = PENDING: mặc định khi tạo mới, yêu cầu đang chờ xử lý
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RequestStatus status = RequestStatus.PENDING;

}
