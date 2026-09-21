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
@PreAuthorize("hasAnyRole('HR','ADMIN')")
public class HrCvController {
    private final CvUpdateRequestService cvUpdateRequestService;
    private final CvService cvService;
    private final CvDraftService cvDraftService;

    /**
     * UC11: HR tạo đợt phát lệnh yêu cầu nhân viên cập nhật CV
     * Endpoint: POST /api/v1/hr/requests
     */
    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<List<CvUpdateRequestDTO>>> createUpdateRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateCvUpdateRequestRequest request) {
        Long hrUserId = userDetails.getId();
        List<CvUpdateRequestDTO> response = cvUpdateRequestService.creatUpdateRequest(hrUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo đợt yêu cầu cập nhật CV thành công", response));
    }

    /**
     * UC12: HR hủy yêu cầu cập nhật CV
     * Endpoint: PUT /api/v1/hr/requests/{id}/cancel
     */
    @PutMapping("/requests/{id}/cancel")
    public ResponseEntity<ApiResponse<CvUpdateRequestDTO>> cancelUpdateRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id) {
        Long hrUserID = userDetails.getId();
        CvUpdateRequestDTO response = cvUpdateRequestService.cancelUpdateRequest(hrUserID, id);
        return ResponseEntity.ok(ApiResponse.success("Hủy yêu cầu cập nhật CV thành công", response));
    }

    /**
     * UC13: HR Master Dashboard xem và lọc toàn bộ CV của công ty
     * Endpoint: GET /api/v1/hr/cvs
     */
    @GetMapping("/cvs")
    public ResponseEntity<ApiResponse<List<CvDTO>>> getAllCvs(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) CvStatus status) {
        List<CvDTO> response = cvService.getAllActiveCvsForHr(departmentId, status);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách CV thành công", response));
    }

    /**
     * HR lấy danh sách bản nháp CV chờ duyệt Trạm 2 (PENDING_HR)
     * Endpoint: GET /api/v1/hr/drafts/pending
     */
    @GetMapping("/drafts/pending")
    public ResponseEntity<ApiResponse<List<CvDraftDTO>>> getPendingDrafts() {
        List<CvDraftDTO> response = cvDraftService.getPendingDraftsForHr();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bản nháp chờ HR duyệt thành công", response));
    }

    /**
     * UC14 & UC19: HR duyệt chót bản nháp CV và nâng version CV gốc
     * Endpoint: POST /api/v1/hr/drafts/{id}/approve
     */
    @PostMapping("/drafts/{id}/approve")
    public ResponseEntity<ApiResponse<CvDraftDTO>> approveDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @RequestParam(required = false) String comment) {
        Long hrUserId = userDetails.getId();
        CvDraftDTO response = cvDraftService.approveDraftByHr(hrUserId, id, comment);
        return ResponseEntity.ok(ApiResponse.success("Duyệt chót bản nháp và nâng version CV thành công", response));
    }

    /**
     * UC15: HR từ chối bản nháp Trạm 2 kèm lý do (kích hoạt Smart Routing)
     * Endpoint: POST /api/v1/hr/drafts/{id}/reject
     */
    @PostMapping("/drafts/{id}/reject")
    public ResponseEntity<ApiResponse<CvDraftDTO>> rejectDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody RejectDraftRequest request) {
        Long hrUserId = userDetails.getId();
        CvDraftDTO response = cvDraftService.rejectDraftByHr(hrUserId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Từ chối bản nháp thành công", response));
    }

}
