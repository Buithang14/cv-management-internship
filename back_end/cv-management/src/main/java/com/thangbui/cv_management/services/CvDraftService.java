package com.thangbui.cv_management.services;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thangbui.cv_management.dto.request.RejectDraftRequest;
import com.thangbui.cv_management.dto.request.UpdateCvDraftRequest;
import com.thangbui.cv_management.dto.response.CvApprovalLogDTO;
import com.thangbui.cv_management.dto.response.CvDraftDTO;
import com.thangbui.cv_management.entity.Cv;
import com.thangbui.cv_management.entity.CvApprovalLog;
import com.thangbui.cv_management.entity.CvDraft;
import com.thangbui.cv_management.entity.CvUpdateRequest;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.enums.ApprovalAction;
import com.thangbui.cv_management.enums.CvLanguage;
import com.thangbui.cv_management.enums.CvStatus;
import com.thangbui.cv_management.enums.DraftStatus;
import com.thangbui.cv_management.enums.RequestStatus;
import com.thangbui.cv_management.enums.UserRole;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.CvApprovalLogRepository;
import com.thangbui.cv_management.repositorys.CvDraftRepository;
import com.thangbui.cv_management.repositorys.CvRepository;
import com.thangbui.cv_management.repositorys.CvUpdateRequestRepository;
import com.thangbui.cv_management.repositorys.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor // tiêm phụ thuộc không cần viết contructor
public class CvDraftService {
    private final CvDraftRepository cvDraftRepository;
    private final CvRepository cvRepository;
    private final UserRepository userRepository;
    private final CvApprovalLogRepository cvApprovalLogRepository;
    private final CvUpdateRequestRepository cvUpdateRequestRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // khởi tạo hoặc lấy bản nháp CV để soạn thảo (mặc định Tiếng Việt)
    @Transactional
    public CvDraftDTO initDraft(Long userId) {
        return initDraft(userId, CvLanguage.VI);
    }

    // khởi tạo hoặc lấy bản nháp CV theo ngôn ngữ cụ thể (VI, EN, JA)
    @Transactional
    public CvDraftDTO initDraft(Long userId, CvLanguage language) {
        if (language == null) {
            language = CvLanguage.VI;
        }

        // 1. Kiểm tra nếu có bản nháp đang chờ duyệt (PENDING_TECH hoặc PENDING_HR) của ngôn ngữ này -> Chặn không cho tạo mới
        boolean hasPendingDraft = cvDraftRepository.existsByUserIdAndLanguageAndStatusIn(
                userId,
                language,
                List.of(DraftStatus.PENDING_TECH, DraftStatus.PENDING_HR)
        );
        if (hasPendingDraft) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bản nháp " + language.getLabel() + " đang trong quá trình xét duyệt, không thể tạo mới");
        }

        // 2. Tìm bản nháp hiện có đang ở trạng thái có thể chỉnh sửa (DRAFTING, REJECTED_BY_TECH, REJECTED_BY_HR)
        Optional<CvDraft> editableDraft = cvDraftRepository.findFirstByUserIdAndLanguageAndStatusInOrderByUpdatedAtDesc(
                userId,
                language,
                List.of(DraftStatus.DRAFTING, DraftStatus.REJECTED_BY_TECH, DraftStatus.REJECTED_BY_HR)
        );
        if (editableDraft.isPresent()) {
            return mapToDTO(editableDraft.get());
        }

        // 3. Nếu chưa có bản nháp nào đang sửa:
        // 3.1. Tìm CV đang hoạt động của chính ngôn ngữ này
        Optional<Cv> activeCvOpt = cvRepository.findFirstByUserIdAndLanguageAndIsActiveTrueOrderByVersionDesc(userId, language);
        if (activeCvOpt.isEmpty() && language == CvLanguage.VI) {
            activeCvOpt = cvRepository.findFirstByUserIdAndLanguageIsNullAndIsActiveTrue(userId);
        }

        CvDraft draft = new CvDraft();
        draft.setLanguage(language);
        draft.setStatus(DraftStatus.DRAFTING);

        if (activeCvOpt.isPresent()) {
            // Clone từ CV chính thức của chính ngôn ngữ này
            Cv activeCv = activeCvOpt.get();
            draft.setUser(activeCv.getUser());
            draft.setBasedOnCv(activeCv);
            draft.setFullName(activeCv.getFullName());
            draft.setAvatarUrl(activeCv.getAvatarUrl());
            draft.setPhone(activeCv.getPhone());
            draft.setSummary(activeCv.getSummary());
            draft.setObjective(activeCv.getObjective());
            draft.setExperiencesJson(activeCv.getExperiencesJson());
            draft.setEducationsJson(activeCv.getEducationsJson());
            draft.setSkillsJson(activeCv.getSkillsJson());
        } else if (language != CvLanguage.VI) {
            // Tạo bản dịch (EN hoặc JA) lần đầu: Đồng bộ cấu trúc khung từ bản Gốc Tiếng Việt (Master CV)
            Optional<Cv> masterCvOpt = cvRepository.findFirstByUserIdAndLanguageAndIsActiveTrueOrderByVersionDesc(userId, CvLanguage.VI);
            if (masterCvOpt.isEmpty()) {
                masterCvOpt = cvRepository.findFirstByUserIdAndLanguageIsNullAndIsActiveTrue(userId);
            }
            if (masterCvOpt.isEmpty()) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Bạn chưa có CV Tiếng Việt chính thức. Vui lòng hoàn thành và nộp duyệt CV Tiếng Việt trước khi tạo bản dịch Tiếng Anh / Tiếng Nhật.");
            }
            Cv masterCv = masterCvOpt.get();
            draft.setUser(masterCv.getUser());
            draft.setBasedOnCv(masterCv);
            draft.setFullName(masterCv.getFullName());
            draft.setAvatarUrl(masterCv.getAvatarUrl());
            draft.setPhone(masterCv.getPhone());
            draft.setSummary(""); // để trống chờ nhân viên dịch
            draft.setObjective(""); // để trống chờ nhân viên dịch
            draft.setExperiencesJson(buildSkeletonExperiences(masterCv.getExperiencesJson(), null));
            draft.setEducationsJson(buildSkeletonEducations(masterCv.getEducationsJson(), null));
            draft.setSkillsJson(masterCv.getSkillsJson());
        } else {
            // Nhân viên mới toanh chưa có CV nào (Tiếng Việt)
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin nhân viên"));
            draft.setUser(user);
            draft.setFullName(user.getFullName());
            draft.setPhone("");
            draft.setSummary("");
            draft.setObjective("");
            draft.setExperiencesJson("[]");
            draft.setEducationsJson("[]");
            draft.setSkillsJson("[]");
        }

        // 4. Nếu có yêu cầu cập nhật CV đang PENDING từ HR, tự động liên kết vào bản nháp
        cvUpdateRequestRepository.findAllByTargetUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(req -> req.getStatus() == RequestStatus.PENDING)
                .findFirst()
                .ifPresent(draft::setRequest);

        CvDraft savedDraft = cvDraftRepository.save(draft);

        return mapToDTO(savedDraft);
    }

    /**
     * Đồng bộ lại cấu trúc khung (Skeleton) từ CV Tiếng Việt gốc sang bản dịch (EN/JA)
     * - Giữ nguyên các nội dung đã dịch
     * - Cập nhật số lượng công ty, trường học và mốc thời gian theo bản Tiếng Việt mới nhất
     */
    @Transactional
    public CvDraftDTO syncSkeletonFromMaster(Long userId, Long draftId) {
        CvDraft draft = cvDraftRepository.findById(draftId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy bản nháp"));

        if (!draft.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác bản nháp này");
        }

        if (draft.getLanguage() == CvLanguage.VI) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bản nháp Tiếng Việt là bản gốc, không cần đồng bộ");
        }

        if (draft.getStatus() != DraftStatus.DRAFTING
                && draft.getStatus() != DraftStatus.REJECTED_BY_TECH
                && draft.getStatus() != DraftStatus.REJECTED_BY_HR) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bản nháp đang trong quá trình xét duyệt, không thể đồng bộ");
        }

        Optional<Cv> masterCvOpt = cvRepository.findFirstByUserIdAndLanguageAndIsActiveTrueOrderByVersionDesc(userId, CvLanguage.VI);
        if (masterCvOpt.isEmpty()) {
            masterCvOpt = cvRepository.findFirstByUserIdAndLanguageIsNullAndIsActiveTrue(userId);
        }
        if (masterCvOpt.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không tìm thấy CV Tiếng Việt gốc để đồng bộ");
        }

        Cv masterCv = masterCvOpt.get();
        draft.setExperiencesJson(buildSkeletonExperiences(masterCv.getExperiencesJson(), draft.getExperiencesJson()));
        draft.setEducationsJson(buildSkeletonEducations(masterCv.getEducationsJson(), draft.getEducationsJson()));

        CvDraft updatedDraft = cvDraftRepository.save(draft);
        return mapToDTO(updatedDraft);
    }

    private String buildSkeletonExperiences(String masterJson, String currentJson) {
        if (masterJson == null || masterJson.isBlank()) {
            return "[]";
        }
        try {
            List<Map<String, Object>> masterList = objectMapper.readValue(masterJson, new TypeReference<List<Map<String, Object>>>() {});
            List<Map<String, Object>> currentList = (currentJson != null && !currentJson.isBlank())
                    ? objectMapper.readValue(currentJson, new TypeReference<List<Map<String, Object>>>() {})
                    : List.of();

            List<Map<String, Object>> result = new ArrayList<>();
            for (int i = 0; i < masterList.size(); i++) {
                Map<String, Object> masterItem = masterList.get(i);
                String masterCompany = String.valueOf(masterItem.getOrDefault("company", ""));

                // Tìm item tương ứng trong currentList (theo tên company hoặc index)
                Map<String, Object> matchingCurrent = null;
                for (Map<String, Object> cur : currentList) {
                    if (masterCompany.equalsIgnoreCase(String.valueOf(cur.getOrDefault("company", "")))) {
                        matchingCurrent = cur;
                        break;
                    }
                }
                if (matchingCurrent == null && i < currentList.size()) {
                    matchingCurrent = currentList.get(i);
                }

                Map<String, Object> newItem = new LinkedHashMap<>();
                newItem.put("company", masterCompany);
                newItem.put("duration", masterItem.getOrDefault("duration", ""));
                newItem.put("role", matchingCurrent != null ? matchingCurrent.getOrDefault("role", "") : "");
                newItem.put("description", matchingCurrent != null ? matchingCurrent.getOrDefault("description", "") : "");

                result.add(newItem);
            }
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            return masterJson;
        }
    }

    private String buildSkeletonEducations(String masterJson, String currentJson) {
        if (masterJson == null || masterJson.isBlank()) {
            return "[]";
        }
        try {
            List<Map<String, Object>> masterList = objectMapper.readValue(masterJson, new TypeReference<List<Map<String, Object>>>() {});
            List<Map<String, Object>> currentList = (currentJson != null && !currentJson.isBlank())
                    ? objectMapper.readValue(currentJson, new TypeReference<List<Map<String, Object>>>() {})
                    : List.of();

            List<Map<String, Object>> result = new ArrayList<>();
            for (int i = 0; i < masterList.size(); i++) {
                Map<String, Object> masterItem = masterList.get(i);
                String masterSchool = String.valueOf(masterItem.getOrDefault("school", ""));

                Map<String, Object> matchingCurrent = null;
                for (Map<String, Object> cur : currentList) {
                    if (masterSchool.equalsIgnoreCase(String.valueOf(cur.getOrDefault("school", "")))) {
                        matchingCurrent = cur;
                        break;
                    }
                }
                if (matchingCurrent == null && i < currentList.size()) {
                    matchingCurrent = currentList.get(i);
                }

                Map<String, Object> newItem = new LinkedHashMap<>();
                newItem.put("school", masterSchool);
                newItem.put("year", masterItem.getOrDefault("year", ""));
                newItem.put("degree", matchingCurrent != null ? matchingCurrent.getOrDefault("degree", "") : "");

                result.add(newItem);
            }
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            return masterJson;
        }
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

        // 4. Nếu là bản dịch (EN/JA): validate skeleton (số lượng entry phải khớp Master VI)
        if (draft.getLanguage() != null && draft.getLanguage() != CvLanguage.VI) {
            Optional<Cv> masterOpt = cvRepository.findFirstByUserIdAndLanguageAndIsActiveTrueOrderByVersionDesc(userId, CvLanguage.VI);
            if (masterOpt.isEmpty()) {
                masterOpt = cvRepository.findFirstByUserIdAndLanguageIsNullAndIsActiveTrue(userId);
            }
            if (masterOpt.isPresent()) {
                Cv master = masterOpt.get();
                int masterExpCount = countJsonArray(master.getExperiencesJson());
                int masterEduCount = countJsonArray(master.getEducationsJson());
                int masterSkillCount = countJsonArray(master.getSkillsJson());
                int reqExpCount = countJsonArray(request.getExperiencesJson());
                int reqEduCount = countJsonArray(request.getEducationsJson());
                int reqSkillCount = countJsonArray(request.getSkillsJson());

                if (reqExpCount != masterExpCount) {
                    throw new AppException(HttpStatus.BAD_REQUEST,
                            "Số lượng kinh nghiệm làm việc phải khớp với bản Tiếng Việt gốc (" + masterExpCount + " công ty). Hiện tại: " + reqExpCount);
                }
                if (reqEduCount != masterEduCount) {
                    throw new AppException(HttpStatus.BAD_REQUEST,
                            "Số lượng học vấn phải khớp với bản Tiếng Việt gốc (" + masterEduCount + " trường). Hiện tại: " + reqEduCount);
                }
                if (reqSkillCount != masterSkillCount) {
                    throw new AppException(HttpStatus.BAD_REQUEST,
                            "Số lượng kỹ năng phải khớp với bản Tiếng Việt gốc (" + masterSkillCount + " kỹ năng). Hiện tại: " + reqSkillCount);
                }
            }
        }

        // 5. cập nhật các trường thông tin mới từ 'request' vào draft
        draft.setFullName(request.getFullName());
        draft.setAvatarUrl(request.getAvatarUrl());
        draft.setPhone(request.getPhone());
        draft.setSummary(request.getSummary());
        draft.setObjective(request.getObjective());
        draft.setExperiencesJson(request.getExperiencesJson());
        draft.setEducationsJson(request.getEducationsJson());
        draft.setSkillsJson(request.getSkillsJson());

        // 6. lưu lại vào db và chuyển đổi sang dto trả về
        CvDraft updateDraft = cvDraftRepository.save(draft);
        return mapToDTO(updateDraft);

    }

    /** Đếm số phần tử trong JSON array string */
    private int countJsonArray(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) return 0;
        try {
            return objectMapper.readTree(json).size();
        } catch (Exception e) {
            return 0;
        }
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

        // UC21: Tự động gửi thông báo xác nhận cho nhân viên (kèm tên ngôn ngữ)
        String submitLangLabel = draft.getLanguage() != null ? draft.getLanguage().getLabel() : "Tiếng Việt";
        if (draft.getStatus() == DraftStatus.PENDING_HR) {
            notificationService.createNotification(
                    draft.getUser(),
                    "Nộp lại bản nháp CV (" + submitLangLabel + ") lên HR thành công",
                    "Bạn đã nộp lại bản nháp CV (" + submitLangLabel + ") trực tiếp lên HR (Smart Routing) sau khi hoàn thiện theo góp ý."
            );
        } else {
            notificationService.createNotification(
                    draft.getUser(),
                    "Nộp bản nháp CV (" + submitLangLabel + ") thành công",
                    "Bạn đã nộp bản nháp CV (" + submitLangLabel + ") lên Tech Lead phê duyệt. Vui lòng theo dõi trạng thái hồ sơ."
            );
        }


        return mapToDTO(savedDraft);
    }

    private CvDraftDTO mapToDTO(CvDraft draft) {
        CvDraftDTO dto = new CvDraftDTO();
        dto.setId(draft.getId());
        if (draft.getUser() != null) {
            dto.setUserId(draft.getUser().getId());
            dto.setUserFullName(draft.getUser().getFullName());
            dto.setEmail(draft.getUser().getEmail());
            if (draft.getUser().getDepartment() != null) {
                dto.setDepartmentName(draft.getUser().getDepartment().getName());
            }
        }
        if (draft.getBasedOnCv() != null) {
            dto.setBasedOnCvId(draft.getBasedOnCv().getId());
        }
        dto.setStatus(draft.getStatus());
        dto.setLanguage(draft.getLanguage());
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

    // HR xem các bản nháp chờ duyệt Trạm 2 (PENDING_HR)
    @Transactional(readOnly = true)
    public List<CvDraftDTO> getPendingDraftsForHr() {
        List<CvDraft> drafts = cvDraftRepository.findByStatus(DraftStatus.PENDING_HR);
        return drafts.stream().map(this::mapToDTO).toList();
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

        // UC21: Tự động gửi thông báo cho nhân viên
        notificationService.createNotification(
                draft.getUser(),
                "Bản nháp CV được duyệt Trạm 1",
                "Tech Lead (" + techLead.getFullName() + ") đã duyệt bản nháp CV của bạn. Hồ sơ đã được chuyển tiếp tới phòng Nhân Sự (HR) để phê duyệt chót."
        );

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

        // UC21: Tự động gửi thông báo cho nhân viên
        String reason = (request != null && request.getRejectionNote() != null && !request.getRejectionNote().isBlank())
                ? request.getRejectionNote() : "Không có lý do chi tiết";
        notificationService.createNotification(
                draft.getUser(),
                "Bản nháp CV bị Tech Lead từ chối",
                "Tech Lead (" + techLead.getFullName() + ") đã từ chối bản nháp CV của bạn. Lý do: " + reason
        );

        return mapToDTO(savedDraft);

    }

    /**
     * UC14 & UC19: HR duyệt chót bản nháp CV và nâng version CV gốc
     */
    @Transactional
    public CvDraftDTO approveDraftByHr(Long hrUserId, Long draftId, String comment) {
        // 1. tìm thông tin hr
        User hr = userRepository.findById(hrUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "không tìm thấy tài khoản HR"));
        // 2. tìm thông tin bản nháp
        CvDraft draft = cvDraftRepository.findById(draftId)
                .orElseThrow(
                        () -> new AppException(HttpStatus.NOT_FOUND, "không tìm thấy bản nháp với id: " + draftId));
        // 3. bản nháp có được sử dụng không, đK: PENDING_HR
        if (draft.getStatus() != DraftStatus.PENDING_HR) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bản nháp không ở trạng thái chờ HR duyệt");
        }
        // 4. những thay đổi trong database.
        // 4.1. đổi trạng thái bản nháp thành APPROVED
        draft.setStatus(DraftStatus.APPROVED);
        draft.setRejectionNote(null);
        CvDraft savedDraft = cvDraftRepository.save(draft);

        // 4.2. ghi lại lịch sử duyệt
        CvApprovalLog log = new CvApprovalLog();
        log.setDraft(savedDraft);
        log.setApprover(hr);
        log.setAction(ApprovalAction.APPROVED_BY_HR);
        log.setComment(comment);
        cvApprovalLogRepository.save(log);

        // 4.3 nâng version Cv gốc (UC19)
        // tìm CV chính thức hiện tại đang hoạt động theo đúng ngôn ngữ của bản nháp
        Optional<Cv> oldCvOpt = cvRepository.findFirstByUserIdAndLanguageAndIsActiveTrueOrderByVersionDesc(draft.getUser().getId(), draft.getLanguage());
        if (oldCvOpt.isEmpty() && draft.getLanguage() == CvLanguage.VI) {
            oldCvOpt = cvRepository.findFirstByUserIdAndLanguageIsNullAndIsActiveTrue(draft.getUser().getId());
        }
        int newVersion = 1; // Mặc định bản mới là version 1

        if (oldCvOpt.isPresent()) {
            Cv oldCv = oldCvOpt.get();
            oldCv.setIsActive(false);
            cvRepository.save(oldCv);
            newVersion = oldCv.getVersion() + 1;
        }

        // 1. khởi tạo bản ghi Cv chính thức mới
        Cv newCv = new Cv();
        newCv.setUser(draft.getUser());
        newCv.setLanguage(draft.getLanguage());
        newCv.setVersion(newVersion);
        newCv.setIsActive(true);
        newCv.setOverallStatus(CvStatus.UPDATED);

        // 2. Copy tường minh nội dung từ bản nháp (an toàn, không phụ thuộc BeanUtils)
        newCv.setFullName(draft.getFullName());
        newCv.setAvatarUrl(draft.getAvatarUrl());
        newCv.setPhone(draft.getPhone());
        newCv.setSummary(draft.getSummary());
        newCv.setObjective(draft.getObjective());
        newCv.setExperiencesJson(draft.getExperiencesJson());
        newCv.setEducationsJson(draft.getEducationsJson());
        newCv.setSkillsJson(draft.getSkillsJson());

        // 3. Lưu CV chính thức mới vào DB
        cvRepository.save(newCv);


        // 4.4. Nếu có yêu cầu cập nhật đi kèm, đổi trạng thái sang COMPLETED
        if (draft.getRequest() != null) {
            CvUpdateRequest request = draft.getRequest();
            request.setStatus(RequestStatus.COMPLETED);
            cvUpdateRequestRepository.save(request);
        }

        // UC21: Tự động gửi thông báo cho nhân viên khi CV được duyệt chính thức
        String langLabel = draft.getLanguage() != null ? draft.getLanguage().getLabel() : "Tiếng Việt";
        notificationService.createNotification(
                savedDraft.getUser(),
                "🎉 Bản nháp CV (" + langLabel + ") được duyệt chính thức!",
                "HR (" + hr.getFullName() + ") đã phê duyệt bản nháp CV (" + langLabel + ") của bạn. CV đã được nâng lên phiên bản mới (v" + newVersion + ") và có hiệu lực từ bây giờ."
        );

        // BƯỚC 5: TRẢ VỀ DTO
        return mapToDTO(savedDraft);

    }

    /**
     * UC15: HR từ chối bản nháp Trạm 2 kèm lý do (kích hoạt Smart Routing)
     */
    @Transactional // nhận đầu vào là id của hr, id của bản nháp, request mà client lên
    public CvDraftDTO rejectDraftByHr(Long hrUserId, Long draftId, RejectDraftRequest request) {
        // 1. tìm thông tin của hr
        User hr = userRepository.findById(hrUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "không tìm thấy tài khoản"));
        // 2. tìm thông tin bản nháp
        CvDraft draft = cvDraftRepository.findById(draftId).orElseThrow(
                () -> new AppException(HttpStatus.NOT_FOUND, "không tìm thấy bản nháp với id: " + draftId));
        // 3. bản nháp phải chờ HR duyệt
        if (draft.getStatus() != DraftStatus.PENDING_HR) {
            throw new AppException(HttpStatus.BAD_REQUEST, "bản nháp này không ở trạng thái chờ HR duyệt");
        }

        // 4. những thay đổi trong database
        // 4.1 thay đổi status Rejected_by_hr và lưu lại lí do từ chối
        draft.setStatus(DraftStatus.REJECTED_BY_HR);
        draft.setRejectionNote(request.getRejectionNote());
        CvDraft savedDraft = cvDraftRepository.save(draft);

        // 4.2. Ghi lịch sử từ chối vào bảng cv_approval_logs
        CvApprovalLog log = new CvApprovalLog();
        log.setDraft(savedDraft);
        log.setApprover(hr);
        log.setAction(ApprovalAction.REJECTED_BY_HR);
        log.setComment(request.getRejectionNote());
        cvApprovalLogRepository.save(log);

        // UC21: Tự động gửi thông báo cho nhân viên khi HR từ chối
        String hrReason = (request.getRejectionNote() != null && !request.getRejectionNote().isBlank())
                ? request.getRejectionNote() : "Không có lý do chi tiết";
        notificationService.createNotification(
                savedDraft.getUser(),
                "Bản nháp CV bị HR từ chối",
                "HR (" + hr.getFullName() + ") đã từ chối bản nháp CV của bạn. Lý do: " + hrReason + ". Vui lòng chỉnh sửa lại và nộp lại."
        );

        return mapToDTO(savedDraft);
    }

    /**
     * UC16: Xem lịch sử duyệt của một bản nháp CV (Audit Logs)
     */
    @Transactional(readOnly = true)
    public List<CvApprovalLogDTO> getDraftApprovalLogs(Long currentUserId, Long draftId) {
        // 1. Tìm thông tin người dùng đang gọi
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin người dùng"));

        // 2. Tìm bản nháp theo draftId
        CvDraft draft = cvDraftRepository.findById(draftId)
                .orElseThrow(
                        () -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy bản nháp với ID: " + draftId));

        // 3. Kiểm tra quyền xem lịch sử duyệt
        if (currentUser.getRole() == UserRole.EMPLOYEE) {
            if (!draft.getUser().getId().equals(currentUserId)) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem lịch sử duyệt của người khác");
            }
        } else if (currentUser.getRole() == UserRole.TECH_LEAD) {
            Long techLeadDeptId = currentUser.getDepartment() != null ? currentUser.getDepartment().getId() : null;
            Long employeeDeptId = draft.getUser().getDepartment() != null ? draft.getUser().getDepartment().getId()
                    : null;

            if (techLeadDeptId == null || !techLeadDeptId.equals(employeeDeptId)) {
                throw new AppException(HttpStatus.FORBIDDEN,
                        "Bạn chỉ có quyền xem lịch sử duyệt của nhân viên trong phòng ban mình");
            }
        }

        // 4. Lấy danh sách log từ DB
        List<CvApprovalLog> logs = cvApprovalLogRepository.findByDraftIdOrderByCreatedAtAsc(draftId);

        // 5. Trả về DTO (viết kiểu lambda rõ ràng, dễ hiểu!)
        return logs.stream().map(log -> new CvApprovalLogDTO(log)).toList();
    }

    /**
     * Xem toàn bộ lịch sử duyệt của nhân viên hiện tại (gộp từ mọi bản nháp theo ngôn ngữ)
     */
    @Transactional(readOnly = true)
    public List<CvApprovalLogDTO> getMyDraftApprovalLogs(Long currentUserId) {
        return getMyDraftApprovalLogs(currentUserId, null);
    }

    @Transactional(readOnly = true)
    public List<CvApprovalLogDTO> getMyDraftApprovalLogs(Long currentUserId, CvLanguage language) {
        // Lấy toàn bộ logs của user theo ngôn ngữ (gộp từ TẤT CẢ bản nháp, không chỉ mới nhất)
        List<CvApprovalLog> logs = cvApprovalLogRepository.findAllByUserIdAndLanguage(currentUserId, language);
        return logs.stream().map(log -> new CvApprovalLogDTO(log)).toList();
    }


    /**
     * Lấy lịch sử các bản nháp đã được Tech Lead xử lý (duyệt hoặc từ chối) trong phòng ban
     */
    @Transactional(readOnly = true)
    public List<CvApprovalLogDTO> getProcessedDraftsByTechLead(Long techLeadUserId) {
        User techLead = userRepository.findById(techLeadUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản Tech Lead"));

        if (techLead.getDepartment() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tech Lead chưa được gán vào phòng ban nào");
        }

        Long departmentId = techLead.getDepartment().getId();

        List<CvApprovalLog> logs = cvApprovalLogRepository.findByActionsAndDepartmentId(
                List.of(ApprovalAction.APPROVED_BY_TECH, ApprovalAction.REJECTED_BY_TECH),
                departmentId
        );

        return logs.stream().map(CvApprovalLogDTO::new).toList();
    }

    /**
     * Lấy lịch sử các bản nháp đã được HR xử lý (duyệt chót hoặc từ chối) toàn công ty
     */
    @Transactional(readOnly = true)
    public List<CvApprovalLogDTO> getProcessedDraftsByHr() {
        List<CvApprovalLog> logs = cvApprovalLogRepository.findByActions(
                List.of(ApprovalAction.APPROVED_BY_HR, ApprovalAction.REJECTED_BY_HR)
        );
        return logs.stream().map(CvApprovalLogDTO::new).toList();
    }

}
