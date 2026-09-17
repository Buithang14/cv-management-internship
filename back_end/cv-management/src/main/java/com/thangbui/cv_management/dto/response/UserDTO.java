package com.thangbui.cv_management.dto.response;

import com.thangbui.cv_management.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import com.thangbui.cv_management.entity.User;

// DTO trả về thông tin User cho client
// Lưu ý:
//   - KHÔNG chứa password (bảo mật)
//   - KHÔNG chứa List<Cv> hay List<Notification> (tránh vòng lặp)
//   - Thay vì embed cả object Department → chỉ lấy departmentId + departmentName
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private UserRole role;
    private Boolean isActive;

    // Thay vì: private Department department; ← vòng lặp!
    // Chỉ lấy 2 field cần thiết từ Department:
    private Long departmentId;
    private String departmentName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    // Constructor tự động bóc tách từ User sang DTO
    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.isActive = user.getIsActive();
        if (user.getDepartment() != null) {
            this.departmentId = user.getDepartment().getId();
            this.departmentName = user.getDepartment().getName();
        }
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.createdBy = user.getCreatedBy();
        this.updatedBy = user.getUpdatedBy();
    }


    public String getRoleDescription() {
        return role != null ? role.getDescription() : null;
    }

}

