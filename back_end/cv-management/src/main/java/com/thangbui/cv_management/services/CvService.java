package com.thangbui.cv_management.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thangbui.cv_management.dto.response.CvDTO;
import com.thangbui.cv_management.entity.Cv;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.enums.CvLanguage;
import com.thangbui.cv_management.enums.CvStatus;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.CvRepository;
import com.thangbui.cv_management.repositorys.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok, tạo contructor cho các thuộc tính final
public class CvService {
    // tiêm repository vào Service
    private final CvRepository cvRepository;
    private final UserRepository userRepository;

    // lấy cv đang hoạt động của user hiện tại (mặc định Tiếng Việt)
    public CvDTO getMyCv(Long userId) {
        return getMyCv(userId, CvLanguage.VI);
    }

    // Lấy CV đang hoạt động theo ngôn ngữ cụ thể
    public CvDTO getMyCv(Long userId, CvLanguage language) {
        if (language == null) {
            language = CvLanguage.VI;
        }
        Cv cv = cvRepository.findFirstByUserIdAndLanguageAndIsActiveTrueOrderByVersionDesc(userId, language)
                .orElse(null);
        if (cv == null && language == CvLanguage.VI) {
            // fallback cho data cũ chưa có cột language
            cv = cvRepository.findFirstByUserIdAndLanguageIsNullAndIsActiveTrue(userId).orElse(null);
        }
        if (cv == null) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy CV " + language.getLabel() + " nào trong hệ thống");
        }
        return mapToDTO(cv);
    }

    // Lấy danh sách ngôn ngữ mà nhân viên đã có CV active
    // (bao gồm cả data cũ language=null, được map sang VI)
    public List<CvLanguage> getActiveLanguages(Long userId) {
        List<Cv> cvs = cvRepository.findAllByUserIdAndIsActiveTrue(userId);
        return cvs.stream()
                .map(cv -> cv.getLanguage() != null ? cv.getLanguage() : CvLanguage.VI)
                .distinct()
                .toList();
    }

    /**
     * UC13: HR xem và lọc toàn bộ CV của công ty
     */

    @Transactional(readOnly = true)
    public List<CvDTO> getAllActiveCvsForHr(Long departmentId, CvStatus status) {
        // 1. gọi repository lấy danh sách CV đã lọc từ database
        List<Cv> cvList = cvRepository.findActiveCvsWithFilter(departmentId, status);
        // 2. chuyển đổi danh sách Entity sang DTO và trả về
        return cvList.stream().map(this::mapToDTO).toList();
    }

    /**
     * Tech Lead xem danh sách CV đang hoạt động của các nhân viên thuộc phòng ban mình (phục vụ Diff / So sánh)
     */
    @Transactional(readOnly = true)
    public List<CvDTO> getAllActiveCvsForTechLead(Long techLeadUserId) {
        User techLead = userRepository.findById(techLeadUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin Tech Lead"));
        if (techLead.getDepartment() == null) {
            return List.of();
        }
        Long departmentId = techLead.getDepartment().getId();
        List<Cv> cvList = cvRepository.findActiveCvsWithFilter(departmentId, null);
        return cvList.stream().map(this::mapToDTO).toList();
    }

    private CvDTO mapToDTO(Cv cv) {
        CvDTO dto = new CvDTO();
        dto.setId(cv.getId());

        // lấy thông tin từ đối tượng User liên kết trong Cv
        if (cv.getUser() != null) {
            dto.setUserId(cv.getUser().getId());
            dto.setUserFullName(cv.getUser().getFullName());
            dto.setEmail(cv.getUser().getEmail());
            if (cv.getUser().getDepartment() != null) {
                dto.setDepartmentId(cv.getUser().getDepartment().getId());
                dto.setDepartmentName(cv.getUser().getDepartment().getName());
            }
        }
        dto.setVersion(cv.getVersion());
        dto.setOverallStatus(cv.getOverallStatus());
        dto.setLanguage(cv.getLanguage());
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
