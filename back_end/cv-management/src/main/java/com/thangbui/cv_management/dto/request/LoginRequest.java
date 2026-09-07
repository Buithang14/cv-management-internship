package com.thangbui.cv_management.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// Data client gửi lên khi thực hiện đăng nhập (POST /api/auth/login)
@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Username không được để trống")
    private String username;

    @NotBlank(message = "Password không được để trống")
    private String password;

}
