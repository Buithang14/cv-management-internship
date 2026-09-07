package com.thangbui.cv_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.response.CvDTO;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.CvService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/cvs")
@RequiredArgsConstructor
public class CvController {
    private final CvService cvsService;

    /**
     * UC02: Xem CV cá nhân đang hoạt động
     * Endpoint: GET /api/v1/cvs/me
     */

    @GetMapping("/me")
    public ResponseEntity<CvDTO> getMyCv(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();

        CvDTO cvDTO = cvsService.getMyCv(userId);

        return ResponseEntity.ok(cvDTO);

    }

}
