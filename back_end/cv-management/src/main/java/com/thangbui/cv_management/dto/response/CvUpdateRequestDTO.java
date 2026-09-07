package com.thangbui.cv_management.dto.response;

import com.thangbui.cv_management.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// DTO trả về thông tin yêu cầu nộp CV cho client
@Getter
@Setter
@AllArgsConstructor
public class CvUpdateRequestDTO {

    private Long id;

    // Người tạo yêu cầu cập nhật CV (HR - UC11)
    private Long requestedById;
    private String requestedByName;

    // Người được yêu cầu nộp CV (Employee)
    private Long targetUserId;
    private String targetUserName;

    private LocalDateTime deadline;
    private String batchName;
    private RequestStatus status;

    private LocalDateTime createdAt;

}
