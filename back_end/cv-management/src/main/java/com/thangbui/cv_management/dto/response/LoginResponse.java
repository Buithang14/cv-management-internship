package com.thangbui.cv_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Data trả về cho client sau khi đăng nhập thành công
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    // Token dùng để gửi kèm trong Header cho các Request sau (Authentication: Bearer <token>)
    private String accessToken;

    // Thông tin cơ bản của người dùng để hiển thị trên UI và phân quyền (dựa vào Role)
    private UserDTO user;

}
