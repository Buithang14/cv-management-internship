package com.thangbui.cv_management.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// Data client gửi lên khi nhân viên chỉnh sửa Bản nháp (PUT /api/v1/drafts/{id})
@Getter
@Setter
public class UpdateCvDraftRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    private String avatarUrl;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    private String summary;
    private String objective;

    // Các trường lưu dữ liệu phức tạp dưới dạng JSON String
    private String experiencesJson;
    private String educationsJson;
    private String skillsJson;

}
