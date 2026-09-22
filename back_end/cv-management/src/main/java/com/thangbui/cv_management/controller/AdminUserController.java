package com.thangbui.cv_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.ApiResponse;
import com.thangbui.cv_management.dto.request.CreateUserRequest;
import com.thangbui.cv_management.dto.response.UserDTO;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // 🔒 Chỉ có ADMIN mới được phép thao tác
public class AdminUserController {

    private final UserService userService;

    /**
     * Lấy danh sách toàn bộ người dùng trong hệ thống
     * Endpoint: GET /api/v1/admin/users
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> response = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", response));
    }

    /**
     * Admin tạo mới tài khoản người dùng
     * Endpoint: POST /api/v1/admin/users
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDTO response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tài khoản người dùng thành công", response));
    }

    /**
     * UC17: Admin khóa hoặc mở khóa tài khoản người dùng
     * Endpoint: PUT /api/v1/admin/users/{id}/status?isActive=true/false
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @RequestParam boolean isActive) {

        Long adminUserId = userDetails.getId();
        UserDTO response = userService.updateUserStatus(adminUserId, id, isActive);
        String message = isActive ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

}

