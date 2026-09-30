package com.thangbui.cv_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// DTO trả về thông báo cho client
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private Long id;

    // Chủ sở hữu thông báo
    private Long userId;

    private String title;
    private String message;
    private Boolean isRead;

    private LocalDateTime createdAt;

}
