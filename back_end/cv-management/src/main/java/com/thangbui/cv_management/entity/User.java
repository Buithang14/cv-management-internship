package com.thangbui.cv_management.entity;

import com.thangbui.cv_management.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// @Entity: Đánh dấu class này là một Entity — tức là nó tương ứng với 1 bảng trong database
// Nếu không có @Entity → Spring/JPA không nhận ra, sẽ bỏ qua class này hoàn toàn
@Entity

// @Table: Chỉ định tên bảng trong DB là "users"
// Nếu không có @Table → JPA tự đặt tên bảng = tên class (User → "user") — có thể sai
@Table(name = "users")

// @Getter: Lombok tự tạo tất cả phương thức getXxx() cho mọi field
// @Setter: Lombok tự tạo tất cả phương thức setXxx() cho mọi field
// @NoArgsConstructor: Lombok tự tạo constructor rỗng — JPA bắt buộc phải có constructor rỗng
@Getter
@Setter
@NoArgsConstructor
public class User extends BaseEntity {
// extends BaseEntity → kế thừa sẵn 3 field:
//   - Long id          (@Id, @GeneratedValue → tự tăng)
//   - LocalDateTime createdAt  (@CreatedDate → tự điền khi tạo)
//   - LocalDateTime updatedAt  (@LastModifiedDate → tự cập nhật khi sửa)
// → KHÔNG cần khai báo lại 3 field này ở đây

    // ===================== QUAN HỆ FK =====================

    // @ManyToOne: Nhiều User thuộc về 1 Department
    //   → Đây là bên "nhiều" vì bảng users chứa cột department_id (Foreign Key)
    // fetch = FetchType.LAZY: Chỉ load Department khi gọi user.getDepartment()
    //   → Tránh query thừa khi chỉ cần thông tin User, không cần Department
    @ManyToOne(fetch = FetchType.LAZY)

    // @JoinColumn: Chỉ định tên cột FK trong bảng users là "department_id"
    //   nullable = false → NOT NULL, mọi user đều phải thuộc 1 department
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // ===================== CÁC FIELD THƯỜNG =====================

    // unique = true  → UNIQUE trong DB (không có 2 user trùng username)
    // nullable = false → NOT NULL
    // length = 50    → VARCHAR(50)
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    // length = 255 → đủ chỗ chứa password đã được mã hoá (bcrypt hash)
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    // name = "full_name" → tên cột trong DB là full_name (snake_case)
    // Java dùng camelCase (fullName) → DB dùng snake_case (full_name)
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    // ===================== ENUM =====================

    // @Enumerated(EnumType.STRING): Lưu giá trị Enum vào DB dưới dạng chuỗi chữ
    //   → Ví dụ: lưu "ADMIN", "HR", "TECH_LEAD", "EMPLOYEE" (không dùng số thứ tự 0, 1, 2, 3)
    //   → Lý do: Nếu dùng EnumType.ORDINAL (số thứ tự), thêm/xóa enum value
    //            sẽ làm sai lệch toàn bộ data cũ trong DB
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role; // Vai trò người dùng (UserRole gồm 4 role: ADMIN, HR, TECH_LEAD, EMPLOYEE)

    // ===================== BOOLEAN =====================

    // Boolean (viết hoa) thay vì boolean (viết thường)
    //   → Boolean có thể = null (chưa set), boolean chỉ có true/false
    //   → Dùng Boolean để tương thích với DB (có thể NULL)
    // = true: Giá trị mặc định khi tạo User mới → user đang hoạt động
    @Column(name = "is_active")
    private Boolean isActive = true;

}
