package com.thangbui.cv_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.response.CvDraftDTO;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.CvDraftService;

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
}
