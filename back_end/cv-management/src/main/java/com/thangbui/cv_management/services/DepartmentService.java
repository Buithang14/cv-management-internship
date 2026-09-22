package com.thangbui.cv_management.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thangbui.cv_management.dto.response.DepartmentDTO;
import com.thangbui.cv_management.entity.Department;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.DepartmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    /**
     * Lấy danh sách toàn bộ phòng ban trong hệ thống
     */
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> new DepartmentDTO(d.getId(), d.getCode(), d.getName(), d.getCreatedAt(), d.getUpdatedAt()))
                .toList();
    }

    /**
     * Tạo phòng ban mới
     */
    @Transactional
    public DepartmentDTO createDepartment(String code, String name) {
        if (departmentRepository.findByCode(code).isPresent()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã phòng ban (code) đã tồn tại");
        }

        Department department = new Department();
        department.setCode(code.toUpperCase().trim());
        department.setName(name.trim());

        Department saved = departmentRepository.save(department);
        return new DepartmentDTO(saved.getId(), saved.getCode(), saved.getName(), saved.getCreatedAt(), saved.getUpdatedAt());
    }
}
