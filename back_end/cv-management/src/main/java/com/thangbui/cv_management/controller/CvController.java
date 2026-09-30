package com.thangbui.cv_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.ApiResponse;
import com.thangbui.cv_management.dto.response.CvDTO;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.CvService;
import com.thangbui.cv_management.services.CvUpdateRequestService;
import com.thangbui.cv_management.dto.response.CvUpdateRequestDTO;
import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/cvs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYEE')") // Chỉ có EMPLOYEE mới thao tác hồ sơ và yêu cầu cá nhân
public class CvController {
    private final CvService cvsService;
    private final CvUpdateRequestService cvUpdateRequestService;

    @GetMapping("/requests/me")
    public ResponseEntity<ApiResponse<List<CvUpdateRequestDTO>>> getMyUpdateRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();
        List<CvUpdateRequestDTO> requests = cvUpdateRequestService.getMyUpdateRequests(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu cầu cập nhật CV thành công", requests));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CvDTO>> getMyCv(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();
        CvDTO cvDTO = cvsService.getMyCv(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy CV thành công", cvDTO));
    }
}
