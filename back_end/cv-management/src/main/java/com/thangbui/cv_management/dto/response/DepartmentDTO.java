package com.thangbui.cv_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// DTO trả về thông tin Department cho client
// Không expose Entity trực tiếp → tránh vòng lặp, kiểm soát data
@Getter
@Setter
@AllArgsConstructor
public class DepartmentDTO {

    private Long id;
    private String code;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
