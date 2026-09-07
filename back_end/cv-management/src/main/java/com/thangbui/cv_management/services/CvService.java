package com.thangbui.cv_management.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.thangbui.cv_management.dto.response.CvDTO;
import com.thangbui.cv_management.entity.Cv;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.CvRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok, tạo contructor cho các thuộc tính final
public class CvService {
    // tiêm cvRepository vào Service
    private final CvRepository cvRepository;

    // lấy cv đang hoạt động của user hiện tại

    public CvDTO getMyCv(Long userId) {
        // 1. tìm cv trong db theo userId và isActive = true
        Cv cv = cvRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy CV nào trong hệ thống"));

        // 2.chuyển đổi Entity sang DTO để trả về
        return mapToDTO(cv);
    }

    private CvDTO mapToDTO(Cv cv) {
        CvDTO dto = new CvDTO();
        dto.setId(cv.getId());

        // lấy thông tin từ đối tượng User liên kết trong Cv
        if (cv.getUser() != null) {
            dto.setUserId(cv.getUser().getId());
            dto.setUserFullName(cv.getUser().getFullName());
        }
        dto.setVersion(cv.getVersion());
        dto.setOverallStatus(cv.getOverallStatus());
        dto.setAvatarUrl(cv.getAvatarUrl());
        dto.setPhone(cv.getPhone());
        dto.setSummary(cv.getSummary());
        dto.setObjective(cv.getObjective());
        dto.setExperiencesJson(cv.getExperiencesJson());
        dto.setEducationsJson(cv.getEducationsJson());
        dto.setCreatedAt(cv.getCreatedAt());
        dto.setUpdatedAt(cv.getUpdatedAt());
        dto.setSkillsJson(cv.getSkillsJson());
        dto.setFullName(cv.getFullName());

        return dto;

    }

}
