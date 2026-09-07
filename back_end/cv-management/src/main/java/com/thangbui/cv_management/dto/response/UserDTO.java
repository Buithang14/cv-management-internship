package com.thangbui.cv_management.dto.response;

import com.thangbui.cv_management.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// DTO trả về thông tin User cho client
// Lưu ý:
//   - KHÔNG chứa password (bảo mật)
//   - KHÔNG chứa List<Cv> hay List<Notification> (tránh vòng lặp)
//   - Thay vì embed cả object Department → chỉ lấy departmentId + departmentName
@Getter
@Setter
@AllArgsConstructor
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

}
