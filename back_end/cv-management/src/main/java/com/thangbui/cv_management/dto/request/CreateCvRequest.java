package com.thangbui.cv_management.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Data client gửi lên khi tạo/cập nhật CV (POST /api/cvs)
// Không cần userId vì lấy từ token người đang đăng nhập
@Getter
@Setter
public class CreateCvRequest {

    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String fullName;

    @Size(max = 255, message = "Avatar URL tối đa 255 ký tự")
    private String avatarUrl;

    @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
    private String phone;

    private String summary;
    private String objective;

    // JSON string — frontend tự build rồi gửi lên
    private String experiencesJson;
    private String educationsJson;
    private String skillsJson;

}
