package com.thangbui.cv_management.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification extends BaseEntity {
// extends BaseEntity → kế thừa: id, createdAt, updatedAt
// Bảng này lưu thông báo gửi đến từng user
// Ví dụ: "CV của bạn đã được duyệt", "Bạn có yêu cầu nộp CV mới"

    // ===================== QUAN HỆ FK =====================

    // FK: user_id → users.id
    // Thông báo này gửi đến user nào?
    // Nhiều Notification thuộc về 1 User → @ManyToOne
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ===================== CÁC FIELD THƯỜNG =====================

    // Tiêu đề ngắn của thông báo (ví dụ: "CV đã được duyệt")
    // nullable = false → thông báo nào cũng phải có tiêu đề
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    // Nội dung chi tiết của thông báo (có thể dài)
    // columnDefinition = "TEXT" → không giới hạn độ dài như VARCHAR
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    // User đã đọc thông báo này chưa?
    //   false = chưa đọc (mặc định khi tạo mới)
    //   true  = đã đọc
    // → Dùng để hiển thị badge "thông báo chưa đọc" ở frontend
    @Column(name = "is_read")
    private Boolean isRead = false;

}
