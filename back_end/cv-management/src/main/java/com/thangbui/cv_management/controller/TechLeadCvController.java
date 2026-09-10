package com.thangbui.cv_management.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.response.CvDraftDTO;
import com.thangbui.cv_management.security.CustomUserDetails;
import com.thangbui.cv_management.services.CvDraftService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/tech-lead/drafts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TECH_LEAD','ADMIN')") // CHỈ TECH VÀ ADMIN MỚI ĐƯỢC VÀO
public class TechLeadCvController {
    private final CvDraftService cvDraftService;

    /**
     * UC08: Xem danh sách bản nháp CV đang chờ duyệt trong phòng ban của mình
     * Endpoint: GET /api/v1/tech-lead/drafts/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<CvDraftDTO>> getPendingDrafts(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long techLeadId = userDetails.getId();

        List<CvDraftDTO> listcvDraftDTO = cvDraftService.getPendingDraftsForTechLead(techLeadId);
        return ResponseEntity.ok(listcvDraftDTO);
    }

    /**
     * UC09: Tech Lead duyệt bản nháp Trạm 1 (chuyển sang PENDING_HR và ghi log)
     * Endpoint: POST /api/v1/tech-lead/drafts/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<CvDraftDTO> approveDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @RequestParam(required = false) String comment) {

        // 1. Lấy techLeadId từ userDetails
        Long techLeadId = userDetails.getId();
        // 2. Gọi cvDraftService.approveDraftByTechLead(techLeadId, id, comment)
        CvDraftDTO cvDraftDTO = cvDraftService.approCvDrafByTechLead(techLeadId, id, comment);
        // 3. Trả về ResponseEntity.ok(...) chứa kết quả DTO
        return ResponseEntity.ok(cvDraftDTO);
    }

}
