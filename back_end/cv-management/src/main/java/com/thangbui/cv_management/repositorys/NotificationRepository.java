package com.thangbui.cv_management.repositorys;

import com.thangbui.cv_management.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lấy toàn bộ thông báo của 1 user theo thứ tự mới nhất xếp trước
    List<Notification> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    // Đếm số lượng thông báo chưa đọc của user
    long countByUserIdAndIsReadFalse(Long userId);

    // Tìm thông báo theo ID và thuộc về đúng User
    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    // Lấy tất cả thông báo chưa đọc của user (để phục vụ đánh dấu đọc tất cả)
    List<Notification> findAllByUserIdAndIsReadFalse(Long userId);
}
