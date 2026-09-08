package com.thangbui.cv_management.config;

import com.thangbui.cv_management.entity.Cv;
import com.thangbui.cv_management.entity.Department;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.enums.CvStatus;
import com.thangbui.cv_management.enums.UserRole;
import com.thangbui.cv_management.repositorys.CvRepository;
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
    private final CvRepository cvRepository;
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

        // Bước 3: Khởi tạo CV mẫu ban đầu cho employee1 nếu chưa có
        userRepository.findByUsername("employee1").ifPresent(this::createSampleCvIfNotFound);

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

    /**
     * Hàm phụ trợ: Tạo CV mẫu ban đầu cho user nếu chưa có CV đang hoạt động
     */
    private void createSampleCvIfNotFound(User user) {
        if (cvRepository.findByUserIdAndIsActiveTrue(user.getId()).isEmpty()) {
            Cv cv = new Cv();
            cv.setUser(user);
            cv.setVersion(1);
            cv.setIsActive(true);
            cv.setOverallStatus(CvStatus.UPDATED);
            cv.setFullName(user.getFullName());
            cv.setPhone("0987654321");
            cv.setSummary("Lập trình viên Java Backend nhiệt huyết, đam mê tìm hiểu Spring Boot và Microservices.");
            cv.setObjective("Trở thành Senior Backend Developer trong 2 năm tới.");
            cv.setSkillsJson("[\"Java\", \"Spring Boot\", \"MySQL\", \"Docker\"]");
            cv.setExperiencesJson("[{\"company\": \"ABC Tech\", \"role\": \"Java Intern\", \"duration\": \"6 months\"}]");
            cv.setEducationsJson("[{\"school\": \"Đại học Công Nghệ\", \"degree\": \"Kỹ sư CNTT\", \"year\": \"2020-2024\"}]");

            cvRepository.save(cv);
            log.info(">>> Đã tạo CV mẫu ban đầu cho user: {}", user.getUsername());
        }
    }
}
