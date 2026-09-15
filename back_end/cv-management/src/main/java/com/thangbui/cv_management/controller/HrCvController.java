package com.thangbui.cv_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.request.CreateCvUpdateRequestRequest;
import com.thangbui.cv_management.dto.response.CvUpdateRequestDTO;

import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.CvUpdateRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/hr")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR','ADMIN')")
public class HrCvController {
    private final CvUpdateRequestService cvUpdateRequestService;

    /**
     * UC11: HR tạo đợt phát lệnh yêu cầu nhân viên cập nhật CV
     * Endpoint: POST /api/v1/hr/requests
     */
    @PostMapping("/requests")
    public ResponseEntity<List<CvUpdateRequestDTO>> createUpdateRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateCvUpdateRequestRequest request) {
        // 1. lấy ID của HR từ token
        Long hrUserId = userDetails.getId();
        // 2.gọi service để xử lí
        List<CvUpdateRequestDTO> response = cvUpdateRequestService.creatUpdateRequest(hrUserId, request);

        // 3.trẩ về mã 201 Created kèm danh sách DTO
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/requests/{id}/cancel")
    public ResponseEntity<CvUpdateRequestDTO> cancelUpdateRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id) {
        // 1. lấy id của HR từ token
        Long hrUserID = userDetails.getId();
        // 2. gọi service hủy yêu cầu
        CvUpdateRequestDTO response = cvUpdateRequestService.cancelUpdateRequest(hrUserID, id);
        // 3.trả về kết quả 200OK
        return ResponseEntity.ok(response);
    }
}
