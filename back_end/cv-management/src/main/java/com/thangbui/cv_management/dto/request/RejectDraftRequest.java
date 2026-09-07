package com.thangbui.cv_management.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// Data client gửi lên khi Tech Lead hoặc HR từ chối bản nháp (POST /api/v1/drafts/{id}/reject-tech hoặc /reject-hr)
@Getter
@Setter
public class RejectDraftRequest {

    @NotBlank(message = "Bắt buộc phải nhập lý do từ chối để nhân viên biết cách sửa")
    private String rejectionNote;

}
