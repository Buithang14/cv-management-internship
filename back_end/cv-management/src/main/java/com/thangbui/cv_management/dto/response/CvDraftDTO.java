package com.thangbui.cv_management.dto.response;

import com.thangbui.cv_management.enums.DraftStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// DTO trả về thông tin của một Bản nháp (CvDraft)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CvDraftDTO {

    private Long id;

    // Lấy thông tin cơ bản của User (tránh vòng lặp JSON như trong CvDTO)
    private Long userId;
    private String userFullName;

    // Các khóa ngoại liên quan
    private Long requestId;     // ID của yêu cầu cập nhật CV (nếu có)
    private Long basedOnCvId;   // ID của CV gốc mà bản nháp này clone ra

    // Trạng thái của bản nháp
    private DraftStatus status;
    private String rejectionNote; // Lý do từ chối (hiển thị khi status là REJECTED_BY_TECH hoặc REJECTED_BY_HR)

    // Nội dung CV
    private String fullName;
    private String avatarUrl;
    private String phone;
    private String summary;
    private String objective;
    private String experiencesJson;
    private String educationsJson;
    private String skillsJson;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
