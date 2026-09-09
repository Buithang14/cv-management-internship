package com.thangbui.cv_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.request.UpdateCvDraftRequest;
import com.thangbui.cv_management.dto.response.CvDraftDTO;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.CvDraftService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

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
    public ResponseEntity<CvDraftDTO> initDraft(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();

        CvDraftDTO cvDraftDTO = cvDraftService.initDraft(userId);

        return ResponseEntity.ok(cvDraftDTO);

    }

    /**
     * UC04: Chỉnh sửa nội dung bản nháp CV
     * Endpoint: PUT /api/v1/cv-drafts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CvDraftDTO> updateDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateCvDraftRequest request) {
        // 1. lấy userId từ userDetails
        Long userId = userDetails.getId();
        // 2.
        CvDraftDTO cvDraftDTO = cvDraftService.updateDraft(userId, id, request);
        return ResponseEntity.ok(cvDraftDTO);
    }

}
