package com.thangbui.cv_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.ApiResponse;
import com.thangbui.cv_management.dto.request.CreateCvUpdateRequestRequest;
import com.thangbui.cv_management.dto.request.RejectDraftRequest;
import com.thangbui.cv_management.dto.response.CvApprovalLogDTO;
import com.thangbui.cv_management.dto.response.CvDTO;
import com.thangbui.cv_management.dto.response.CvDraftDTO;
import com.thangbui.cv_management.dto.response.CvUpdateRequestDTO;
import com.thangbui.cv_management.enums.CvStatus;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.CvDraftService;
import com.thangbui.cv_management.services.CvService;
import com.thangbui.cv_management.services.CvUpdateRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/hr")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR', 'ADMIN')") // 🔒 HR và ADMIN đều có quyền quản trị kho CV, phê duyệt và điều phối yêu cầu
public class HrCvController {
    private final CvUpdateRequestService cvUpdateRequestService;
    private final CvService cvService;
    private final CvDraftService cvDraftService;

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<CvUpdateRequestDTO>>> getAllUpdateRequests() {
        List<CvUpdateRequestDTO> response = cvUpdateRequestService.getAllUpdateRequests();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tất cả yêu cầu cập nhật CV thành công", response));
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<List<CvUpdateRequestDTO>>> createUpdateRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateCvUpdateRequestRequest request) {
        Long hrUserId = userDetails.getId();
        List<CvUpdateRequestDTO> response = cvUpdateRequestService.creatUpdateRequest(hrUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo đợt yêu cầu cập nhật CV thành công", response));
    }

    @PutMapping("/requests/{id}/cancel")
    public ResponseEntity<ApiResponse<CvUpdateRequestDTO>> cancelUpdateRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id) {
        Long hrUserID = userDetails.getId();
        CvUpdateRequestDTO response = cvUpdateRequestService.cancelUpdateRequest(hrUserID, id);
        return ResponseEntity.ok(ApiResponse.success("Hủy yêu cầu cập nhật CV thành công", response));
    }

    @GetMapping("/cvs")
    public ResponseEntity<ApiResponse<List<CvDTO>>> getAllCvs(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) CvStatus status) {
        List<CvDTO> response = cvService.getAllActiveCvsForHr(departmentId, status);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách CV thành công", response));
    }

    @GetMapping("/drafts/pending")
    public ResponseEntity<ApiResponse<List<CvDraftDTO>>> getPendingDrafts() {
        List<CvDraftDTO> response = cvDraftService.getPendingDraftsForHr();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bản nháp chờ HR duyệt thành công", response));
    }

    @PostMapping("/drafts/{id}/approve")
    public ResponseEntity<ApiResponse<CvDraftDTO>> approveDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @RequestParam(required = false) String comment) {
        Long hrUserId = userDetails.getId();
        CvDraftDTO response = cvDraftService.approveDraftByHr(hrUserId, id, comment);
        return ResponseEntity.ok(ApiResponse.success("Duyệt chót bản nháp và nâng version CV thành công", response));
    }

    @PostMapping("/drafts/{id}/reject")
    public ResponseEntity<ApiResponse<CvDraftDTO>> rejectDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody RejectDraftRequest request) {
        Long hrUserId = userDetails.getId();
        CvDraftDTO response = cvDraftService.rejectDraftByHr(hrUserId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Từ chối bản nháp thành công", response));
    }

    /**
     * Lấy lịch sử các bản nháp đã được HR xử lý (duyệt/từ chối) toàn công ty
     * Endpoint: GET /api/v1/hr/drafts/processed
     */
    @GetMapping("/drafts/processed")
    public ResponseEntity<ApiResponse<List<CvApprovalLogDTO>>> getProcessedDrafts() {
        List<CvApprovalLogDTO> logs = cvDraftService.getProcessedDraftsByHr();
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử xử lý thành công", logs));
    }

}
