package com.thangbui.cv_management.services;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thangbui.cv_management.dto.request.UpdateCvDraftRequest;
import com.thangbui.cv_management.dto.response.CvDraftDTO;
import com.thangbui.cv_management.entity.Cv;
import com.thangbui.cv_management.entity.CvDraft;
import com.thangbui.cv_management.enums.DraftStatus;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.CvDraftRepository;
import com.thangbui.cv_management.repositorys.CvRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // tiêm phụ thuộc không cần viết contructor
public class CvDraftService {
    private final CvDraftRepository cvDraftRepository;
    private final CvRepository cvRepository;

    @Transactional
    public CvDraftDTO initDraft(Long userId) {

        Optional<CvDraft> existingDraft = cvDraftRepository.findByUserIdAndStatus(userId, DraftStatus.DRAFTING);
        // Nếu có rồi thì trả về luôn, không tạo mới nữa
        if (existingDraft.isPresent()) {
            return mapToDTO(existingDraft.get());
        }
        // 2. Nếu chưa có, tìm CV gốc đang hoạt động (isActive = true) để clone
        Cv activeCv = cvRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "không tìm thấy CV nào đang hoạt động để tạo bản nháp"));

        // 3. khởi tạo đối tượng CvDraft mới và clone thông tin từ actuveCv
        CvDraft draft = new CvDraft();
        draft.setUser(activeCv.getUser());
        draft.setBasedOnCv(activeCv);
        draft.setStatus(DraftStatus.DRAFTING);
        draft.setFullName(activeCv.getFullName());
        draft.setAvatarUrl(activeCv.getAvatarUrl());
        draft.setPhone(activeCv.getPhone());
        draft.setSummary(activeCv.getSummary());
        draft.setObjective(activeCv.getObjective());
        draft.setExperiencesJson(activeCv.getExperiencesJson());
        draft.setEducationsJson(activeCv.getEducationsJson());
        draft.setSkillsJson(activeCv.getSkillsJson());

        CvDraft savedDraft = cvDraftRepository.save(draft);

        return mapToDTO(savedDraft);

    }

    @Transactional
    public CvDraftDTO updateDraft(Long userId, Long draftId, UpdateCvDraftRequest request) {
        // 1. tìm bản nháp theo draftId
        CvDraft draft = cvDraftRepository.findById(draftId)
                .orElseThrow(
                        () -> new AppException(HttpStatus.NOT_FOUND, "không tìm thấy bản nháp với ID: " + draftId));
        // 2. kiểm tra bản nháp này có phải của user đang đăng nhập không ?
        if (!draft.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "bạn không có quyền chỉnh sửa bản nháp này");
        }
        // 3. kiểm tra trạng thái: Chỉ cho phép sửa nếu đang ở trạng thái DRAFTING,
        // REJECTED_BY_TECH hoặc REJECTED_BY_HR
        if (draft.getStatus() != DraftStatus.DRAFTING
                && draft.getStatus() != DraftStatus.REJECTED_BY_TECH
                && draft.getStatus() != DraftStatus.REJECTED_BY_HR) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "bản nháp dang trong quá trình duyệt hoặc đã đóng, không thể chỉnh sửa");
        }

        // 4.cập nhật các trường thông tin mới từ 'request' vào draft
        draft.setFullName(request.getFullName());
        draft.setAvatarUrl(request.getAvatarUrl());
        draft.setPhone(request.getPhone());
        draft.setSummary(request.getSummary());
        draft.setObjective(request.getObjective());
        draft.setExperiencesJson(request.getExperiencesJson());
        draft.setEducationsJson(request.getEducationsJson());
        draft.setSkillsJson(request.getSkillsJson());

        // 5.lưu lại vào db và chuyển đổi sang dto trả về
        CvDraft updateDraft = cvDraftRepository.save(draft);
        return mapToDTO(updateDraft);

    }

    private CvDraftDTO mapToDTO(CvDraft draft) {
        CvDraftDTO dto = new CvDraftDTO();
        dto.setId(draft.getId());
        if (draft.getUser() != null) {
            dto.setUserId(draft.getUser().getId());
            dto.setUserFullName(draft.getUser().getFullName());
        }
        if (draft.getBasedOnCv() != null) {
            dto.setBasedOnCvId(draft.getBasedOnCv().getId());
        }
        dto.setStatus(draft.getStatus());
        dto.setRejectionNote(draft.getRejectionNote());
        dto.setFullName(draft.getFullName());
        dto.setAvatarUrl(draft.getAvatarUrl());
        dto.setPhone(draft.getPhone());
        dto.setSummary(draft.getSummary());
        dto.setObjective(draft.getObjective());
        dto.setExperiencesJson(draft.getExperiencesJson());
        dto.setEducationsJson(draft.getEducationsJson());
        dto.setSkillsJson(draft.getSkillsJson());
        dto.setCreatedAt(draft.getCreatedAt());
        dto.setUpdatedAt(draft.getUpdatedAt());

        return dto;
    }

}
