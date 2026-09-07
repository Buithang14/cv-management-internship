package com.thangbui.cv_management.config;

import com.thangbui.cv_management.entity.Department;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.enums.UserRole;
import com.thangbui.cv_management.repositorys.DepartmentRepository;
import com.thangbui.cv_management.repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * ============================================================================
 * DATA INITIALIZER (Khởi tạo dữ liệu mẫu khi Server bật lên)
 * ============================================================================
 * 
 * Lớp này triển khai giao diện CommandLineRunner của Spring Boot.
 * Hàm run(...) sẽ tự động chạy MỘT LẦN DUY NHẤT ngay khi ứng dụng khởi động xong.
 * 
 * Tác dụng:
 * - Kiểm tra nếu bảng departments và users chưa có dữ liệu thì tự động tạo mẫu.
 * - Mật khẩu được mã hóa tự động bằng BCrypt (passwordEncoder.encode("123456")).
 * - Nếu database ĐÃ CÓ dữ liệu rồi, nó sẽ bỏ qua, không bao giờ ghi đè hay trùng lặp.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Bước 1: Khởi tạo phòng ban mẫu nếu chưa có
        Department itDept = createDepartmentIfNotFound("IT", "Phòng Công Nghệ Thông Tin");
        Department hrDept = createDepartmentIfNotFound("HR", "Phòng Nhân Sự");

        // Bước 2: Khởi tạo các tài khoản mẫu đại diện cho 4 vai trò nếu chưa có
        createUserIfNotFound(
                "admin",
                "123456",
                "Quản Trị Viên Hệ Thống (System Admin)",
                "admin@company.com",
                UserRole.ADMIN,
                itDept
        );

        createUserIfNotFound(
                "hr_admin",
                "123456",
                "Nguyễn Thị HR",
                "hr@company.com",
                UserRole.HR,
                hrDept
        );

        createUserIfNotFound(
                "tech_lead",
                "123456",
                "Trần Văn Tech Lead",
                "techlead@company.com",
                UserRole.TECH_LEAD,
                itDept
        );

        createUserIfNotFound(
                "employee1",
                "123456",
                "Bùi Văn Thắng (Employee)",
                "thang@company.com",
                UserRole.EMPLOYEE,
                itDept
        );

        log.info(">>> [DataInitializer] Kiểm tra và khởi tạo dữ liệu mẫu hoàn tất!");
    }

    /**
     * Hàm phụ trợ: Tạo phòng ban mới nếu mã phòng ban chưa tồn tại trong DB
     */
    private Department createDepartmentIfNotFound(String code, String name) {
        return departmentRepository.findByCode(code).orElseGet(() -> {
            Department dept = new Department();
            dept.setCode(code);
            dept.setName(name);
            Department saved = departmentRepository.save(dept);
            log.info(">>> Đã tạo phòng ban mẫu: {} - {}", code, name);
            return saved;
        });
    }

    /**
     * Hàm phụ trợ: Tạo tài khoản user mới nếu username chưa tồn tại trong DB
     */
    private void createUserIfNotFound(
            String username,
            String rawPassword,
            String fullName,
            String email,
            UserRole role,
            Department department
    ) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User();
            user.setUsername(username);
            // Mã hóa mật khẩu thô "123456" thành chuỗi băm BCrypt trước khi lưu vào DB
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setFullName(fullName);
            user.setEmail(email);
            user.setRole(role);
            user.setDepartment(department);
            user.setIsActive(true);

            userRepository.save(user);
            log.info(">>> Đã tạo tài khoản mẫu: username='{}' | role='{}' | password='{}'", username, role, rawPassword);
        }
    }
}
