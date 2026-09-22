package com.thangbui.cv_management.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thangbui.cv_management.dto.request.CreateUserRequest;
import com.thangbui.cv_management.dto.response.UserDTO;
import com.thangbui.cv_management.entity.Department;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.DepartmentRepository;
import com.thangbui.cv_management.repositorys.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Lấy danh sách toàn bộ người dùng trong hệ thống
     */
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::new)
                .toList();
    }

    /**
     * Admin tạo mới tài khoản người dùng
     */
    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tên đăng nhập (username) đã tồn tại trong hệ thống");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email này đã được sử dụng");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phòng ban với ID: " + request.getDepartmentId()));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setDepartment(department);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        return new UserDTO(savedUser);
    }

    /**
     * UC17: Admin khóa hoặc mở khóa tài khoản người dùng
     */
    @Transactional
    public UserDTO updateUserStatus(Long adminUserId, Long targetUserId, boolean isActive) {
        userRepository.findById(adminUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản Admin"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng với ID: " + targetUserId));

        if (targetUserId.equals(adminUserId) && !isActive) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bạn không thể tự khóa tài khoản của chính mình");
        }

        targetUser.setIsActive(isActive);
        User savedUser = userRepository.save(targetUser);

        return new UserDTO(savedUser);
    }

}

