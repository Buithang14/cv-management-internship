package com.thangbui.cv_management.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass // Đánh dấu đây là class cha, không tạo bảng trong DB
@EntityListeners(AuditingEntityListener.class) //
// tự động lắng nghe và điền các thông tin kiểm toán (audit) vào cơ sở dữ
// liệu mỗi
// khi một bản ghi (Entity) được thêm mới (insert) hoặc cập nhật (update).

public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // database tự động tăng id
    private Long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    // thời gian tạo ra Entity này, không bao giờ cập nhật lại
    private LocalDateTime createdAt;

    @LastModifiedDate // tự động cập nhật thời gian mỗi khi entity được sửa.
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
