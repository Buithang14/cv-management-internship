package com.thangbui.cv_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.ApiResponse;
import com.thangbui.cv_management.dto.request.UpdateCvDraftRequest;
import com.thangbui.cv_management.dto.response.CvApprovalLogDTO;
import com.thangbui.cv_management.dto.response.CvDraftDTO;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.CvDraftService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cv-drafts")
public class CvDraftController {
    private final CvDraftService cvDraftService;

    /**
     * UC03: Khởi tạo bản nháp CV (clone từ CV gốc hoặc lấy bản nháp đang soạn dở)
     * Endpoint: POST /api/v1/cv-drafts/init
     */
    @PostMapping("/init")
    public ResponseEntity<ApiResponse<CvDraftDTO>> initDraft(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();
        CvDraftDTO cvDraftDTO = cvDraftService.initDraft(userId);
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo bản nháp thành công", cvDraftDTO));
    }

    /**
     * UC04: Chỉnh sửa nội dung bản nháp CV
     * Endpoint: PUT /api/v1/cv-drafts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CvDraftDTO>> updateDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateCvDraftRequest request) {
        Long userId = userDetails.getId();
        CvDraftDTO cvDraftDTO = cvDraftService.updateDraft(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bản nháp thành công", cvDraftDTO));
    }

    /**
     * UC05: Nộp bản nháp để gửi duyệt (Chuyển sang PENDING_TECH hoặc PENDING_HR)
     * Endpoint: POST /api/v1/cv-drafts/{id}/submit
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<CvDraftDTO>> submitDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id) {
        Long userId = userDetails.getId();
        CvDraftDTO cvDraftDTO = cvDraftService.submitDraft(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Gửi duyệt thành công", cvDraftDTO));
    }

    /**
     * UC16: Xem lịch sử phê duyệt của một bản nháp CV (Audit Logs)
     * Endpoint: GET /api/v1/cv-drafts/{id}/logs
     */
    @GetMapping("/{id}/logs")
    public ResponseEntity<ApiResponse<List<CvApprovalLogDTO>>> getDraftApprovalLogs(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id) {
        Long currentUserId = userDetails.getId();
        List<CvApprovalLogDTO> logs = cvDraftService.getDraftApprovalLogs(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử phê duyệt thành công", logs));
    }

}
