package com.thangbui.cv_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thangbui.cv_management.dto.ApiResponse;
import com.thangbui.cv_management.dto.request.CreateDepartmentRequest;
import com.thangbui.cv_management.dto.response.DepartmentDTO;
import com.thangbui.cv_management.services.DepartmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/departments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'HR')") // 🔒 ADMIN và HR đều có thể xem danh sách phòng ban
public class AdminDepartmentController {

    private final DepartmentService departmentService;

    /**
     * Lấy danh sách toàn bộ phòng ban
     * Endpoint: GET /api/v1/admin/departments
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getAllDepartments() {
        List<DepartmentDTO> response = departmentService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phòng ban thành công", response));
    }

    /**
     * Tạo phòng ban mới (Chỉ ADMIN được tạo)
     * Endpoint: POST /api/v1/admin/departments
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDTO>> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        DepartmentDTO response = departmentService.createDepartment(request.getCode(), request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phòng ban thành công", response));
    }

}
