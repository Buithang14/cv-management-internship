package com.thangbui.cv_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.response.UserDTO;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // 🔒 Chỉ có ADMIN mới được phép thao tác
public class AdminUserController {

    private final UserService userService;

    /**
     * UC17: Admin khóa hoặc mở khóa tài khoản người dùng
     * Endpoint: PUT /api/v1/admin/users/{id}/status?isActive=true/false
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @RequestParam boolean isActive) {

        // 1. Lấy ID của Admin từ token đăng nhập
        Long adminUserId = userDetails.getId();

        // 2. Gọi service cập nhật trạng thái
        UserDTO response = userService.updateUserStatus(adminUserId, id, isActive);

        // 3. Trả về kết quả 200 OK
        return ResponseEntity.ok(response);
    }

}
