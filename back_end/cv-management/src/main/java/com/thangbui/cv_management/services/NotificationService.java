package com.thangbui.cv_management.services;

import com.thangbui.cv_management.dto.response.NotificationDTO;
import com.thangbui.cv_management.entity.Notification;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * UC06: Lấy danh sách thông báo của người dùng hiện tại (sắp xếp mới nhất trước)
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getMyNotifications(Long userId) {
        List<Notification> list = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        return list.stream().map(this::mapToDTO).toList();
    }

    /**
     * Lấy số lượng thông báo chưa đọc của người dùng
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * UC07: Đánh dấu một thông báo là đã đọc
     */
    @Transactional
    public NotificationDTO markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo hoặc bạn không có quyền truy cập"));

        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification = notificationRepository.save(notification);
        }
        return mapToDTO(notification);
    }

    /**
     * UC07: Đánh dấu tất cả thông báo của người dùng là đã đọc
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadList = notificationRepository.findAllByUserIdAndIsReadFalse(userId);
        for (Notification notif : unreadList) {
            notif.setIsRead(true);
        }
        notificationRepository.saveAll(unreadList);
    }

    /**
     * UC21: Tự động tạo và lưu thông báo hệ thống gửi tới người dùng
     */
    @Transactional
    public Notification createNotification(User targetUser, String title, String message) {
        if (targetUser == null) {
            log.warn("Không thể tạo thông báo vì targetUser là null");
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(targetUser);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);
        log.info("Đã tạo thông báo tự động (ID: {}) tới user ID {}: {}", saved.getId(), targetUser.getId(), title);
        return saved;
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getUser() != null ? notification.getUser().getId() : null,
                notification.getTitle(),
                notification.getMessage(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }
}
