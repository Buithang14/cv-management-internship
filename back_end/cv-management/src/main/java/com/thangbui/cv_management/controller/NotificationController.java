package com.thangbui.cv_management.controller;

import com.thangbui.cv_management.dto.ApiResponse;
import com.thangbui.cv_management.dto.response.NotificationDTO;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()") // Bất kỳ tài khoản đăng nhập nào (Employee, Tech Lead, HR, Admin) đều dùng được
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * UC06: Lấy danh sách thông báo của người dùng hiện tại
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();
        List<NotificationDTO> list = notificationService.getMyNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thông báo thành công", list));
    }

    /**
     * Lấy số lượng thông báo chưa đọc
     */
    @GetMapping("/me/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();
        long unreadCount = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy số lượng thông báo chưa đọc thành công", unreadCount));
    }

    /**
     * UC07: Đánh dấu 1 thông báo là đã đọc
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDTO>> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        Long userId = userDetails.getId();
        NotificationDTO dto = notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Đánh dấu đã đọc thành công", dto));
    }

    /**
     * UC07: Đánh dấu tất cả thông báo của người dùng là đã đọc
     */
    @PutMapping("/me/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu tất cả thông báo là đã đọc"));
    }
}
