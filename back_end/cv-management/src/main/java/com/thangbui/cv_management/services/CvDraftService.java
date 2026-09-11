package com.thangbui.cv_management.services;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thangbui.cv_management.dto.request.RejectDraftRequest;
import com.thangbui.cv_management.dto.request.UpdateCvDraftRequest;
import com.thangbui.cv_management.dto.response.CvDraftDTO;
import com.thangbui.cv_management.entity.Cv;
import com.thangbui.cv_management.entity.CvDraft;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.enums.DraftStatus;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.CvApprovalLogRepository;
import com.thangbui.cv_management.repositorys.CvDraftRepository;
import com.thangbui.cv_management.repositorys.CvRepository;
import com.thangbui.cv_management.repositorys.UserRepository;

import lombok.RequiredArgsConstructor;

import com.thangbui.cv_management.entity.CvApprovalLog;
import com.thangbui.cv_management.enums.ApprovalAction;

@Service
@RequiredArgsConstructor // tiêm phụ thuộc không cần viết contructor
public class CvDraftService {
    private final CvDraftRepository cvDraftRepository;
    private final CvRepository cvRepository;
    private final UserRepository userRepository;
    private final CvApprovalLogRepository cvApprovalLogRepository;

    // khởi tạo một cv
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

    // cập nhật cv
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

    // gửi bản nháp để duyệt
    @Transactional
    public CvDraftDTO submitDraft(Long userId, Long draftId) {
        // 1.tìm bản nháp theo draftId
        CvDraft draft = cvDraftRepository.findById(draftId).orElseThrow(
                () -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy bản nháp với ID: " + draftId));
        // 2.kiểm tra xem cv có đúng chủ nhân không ?
        if (!draft.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền nộp bản nháp này");
        }
        // 3.kiểm tra trạng thái: chỉ cho nộp nếu Drafting, reject by tech, reject by hr
        if (draft.getStatus() != DraftStatus.DRAFTING
                && draft.getStatus() != DraftStatus.REJECTED_BY_TECH
                && draft.getStatus() != DraftStatus.REJECTED_BY_HR) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Bản nháp đang trong quá trình duyệt hoặc đã đóng, không thể nộp lại");
        }
        // 4. xử lý thông minh
        if (draft.getStatus() == DraftStatus.REJECTED_BY_HR) {
            draft.setStatus(DraftStatus.PENDING_HR);
        } else {
            draft.setStatus(DraftStatus.PENDING_TECH);

        }
        // 5. lưu xuống db và trả về DTO
        CvDraft savedDraft = cvDraftRepository.save(draft);
        return mapToDTO(savedDraft);

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

    // UC8: techlead xem các bản nháp chờ duyệt mà employee gửi
    @Transactional(readOnly = true)
    public List<CvDraftDTO> getPendingDraftsForTechLead(Long techLeadUserId) {
        // 1.tìm thông tin Teach Lead
        User techLead = userRepository.findById(techLeadUserId)
                .orElseThrow(
                        () -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản tech lead"));
        // 2. Kiểm tra xem tài khoản xem tài khoản này đã được gán vào phòng nào chưa?
        if (techLead.getDepartment() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tài khoản tech lead chưa được gán vào phòng ban nào");

        }

        Long departmentId = techLead.getDepartment().getId();

        // 3. Lấy danh sách bản nháp có status = PENDING_TECH thuộc phòng ban đó
        List<CvDraft> draft = cvDraftRepository.findByStatusAndUserDepartmentId(DraftStatus.PENDING_TECH, departmentId);
        return draft.stream().map(this::mapToDTO).toList();
    }
    // UC9: tech_lead duyệt bản nháp

    @Transactional
    public CvDraftDTO approCvDrafByTechLead(Long techLeadUserId, Long draftId, String comment) {
        // 1. tìm thông tin TechLead và bản nháp từ database
        User techLead = userRepository.findById(techLeadUserId)
                .orElseThrow(
                        () -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản TechLead"));
        // tìm bản nháp theo id
        CvDraft draft = cvDraftRepository.findById(draftId).orElseThrow(
                () -> new AppException(HttpStatus.NOT_FOUND, "không tìm thấy bản nháp với ID: " + draftId));
        // 2. kiểm tra thẩm quyền phòng ban: tech-lead chỉ được duyệt Cv nhân viên thuộc
        // phòng ban mình
        Long techLeadDeptId = techLead.getDepartment().getId();
        Long employeeDeptId = draft.getUser().getDepartment().getId();

        if (!techLeadDeptId.equals(employeeDeptId)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "Bạn chỉ có quyền duyệt CV của nhân viên trong phòng ban của mình");
        }
        // 3. Kiểm tra trạng thái: Bản nháp phải đang ở trạng thái PENDING_TECH (chờ
        // Tech Lead duyệt)
        if (draft.getStatus() != DraftStatus.PENDING_TECH) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bản nháp không ở trạng thái chờ Tech Lead duyệt");
        }
        // 4: Chuyển trạng thái bản nháp sang PENDING_HR và lưu lại vào DB

        draft.setStatus(DraftStatus.PENDING_HR);
        CvDraft savedDraft = cvDraftRepository.save(draft);
        // 5: Tạo bản ghi lịch sử phê duyệt (CvApprovalLog) và lưu vào DB

        CvApprovalLog log = new CvApprovalLog();
        log.setDraft(draft);
        log.setApprover(techLead);
        log.setAction(ApprovalAction.APPROVED_BY_TECH);
        log.setComment(comment);
        cvApprovalLogRepository.save(log);
        // 6. Trả về DTO
        return mapToDTO(savedDraft);

    }

    // UC10: TechLead từ chối bản nháp(trạm 1)
    @Transactional
    public CvDraftDTO rejectDraftByTechLead(Long techLeadId, Long draftId, RejectDraftRequest request) {
        // 1. tìm thông tin TechLead và bản nháp từ database
        User techLead = userRepository.findById(techLeadId)
                .orElseThrow(
                        () -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản TechLead"));
        CvDraft draft = cvDraftRepository.findById(draftId)
                .orElseThrow(
                        () -> new AppException(HttpStatus.NOT_FOUND, "không tìm thấy bản nháp với id: " + draftId));
        // 2. kiểm tra thẩm quyền phòng ban: tech-lead chỉ được duyệt Cv nhân viên thuộc
        // phòng ban mình
        Long techLeadDeptId = techLead.getDepartment().getId();
        Long employeeDeptId = draft.getUser().getDepartment().getId();

        if (!techLeadDeptId.equals(employeeDeptId)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "Bạn chỉ có quyền duyệt CV của nhân viên trong phòng ban của mình");
        }
        // 3. bản nháp có đang ở trạng thái pending_tech không ?
        if (draft.getStatus() != DraftStatus.PENDING_TECH) {
            throw new AppException(HttpStatus.BAD_REQUEST, "bản nháp không ở trạng thái để tech_lead duyệt");
        }
        // 4.cập nhật bản nháp sang trạng thái reject_by_tech
        draft.setStatus(DraftStatus.REJECTED_BY_TECH);
        draft.setRejectionNote(request.getRejectionNote());
        CvDraft savedDraft = cvDraftRepository.save(draft);
        // 5. lưu lại log
        CvApprovalLog log = new CvApprovalLog();
        log.setDraft(savedDraft);
        log.setApprover(techLead);
        log.setAction(ApprovalAction.REJECTED_BY_TECH);
        log.setComment(request.getRejectionNote());
        cvApprovalLogRepository.save(log);

        return mapToDTO(savedDraft);

    }

}
