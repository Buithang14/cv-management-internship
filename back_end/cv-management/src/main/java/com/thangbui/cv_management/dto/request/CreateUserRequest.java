package com.thangbui.cv_management.dto.request;

import com.thangbui.cv_management.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Data client gửi lên khi tạo User mới (POST /api/users)
// @NotBlank, @Email... → validation tự động (dùng với @Valid ở Controller)
@Getter
@Setter
public class CreateUserRequest {

    @NotNull(message = "Department không được để trống")
    private Long departmentId;

    @NotBlank(message = "Username không được để trống")
    @Size(max = 50, message = "Username tối đa 50 ký tự")
    private String username;

    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, message = "Password tối thiểu 6 ký tự")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotNull(message = "Role không được để trống")
    private UserRole role;

}
