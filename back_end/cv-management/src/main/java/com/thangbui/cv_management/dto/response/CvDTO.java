package com.thangbui.cv_management.dto.response;

import com.thangbui.cv_management.enums.CvLanguage;
import com.thangbui.cv_management.enums.CvStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CvDTO {

    private Long id;
    private Long userId;
    private String userFullName;
    private String email;
    private Long departmentId;
    private String departmentName;

    // Ngôn ngữ của CV (VI, EN, JA)
    private CvLanguage language;

    // Phiên bản CV hiện tại (bắt đầu từ 1, tăng mỗi khi HR duyệt chót một bản nháp - UC19)
    private Integer version;

    private CvStatus overallStatus;

    // Thông tin cá nhân trong CV
    private String fullName;
    private String avatarUrl;
    private String phone;
    private String summary;
    private String objective;

    // Dữ liệu JSON string — frontend tự parse
    private String experiencesJson;
    private String educationsJson;
    private String skillsJson;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getOverallStatusDescription() {
        return overallStatus != null ? overallStatus.getDescription() : null;
    }

    public String getLanguageLabel() {
        return language != null ? language.getLabel() : null;
    }

    public String getLanguageFlag() {
        return language != null ? language.getFlag() : null;
    }

}

