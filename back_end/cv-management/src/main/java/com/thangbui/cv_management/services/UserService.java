package com.thangbui.cv_management.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thangbui.cv_management.dto.response.UserDTO;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * UC17: Admin khóa hoặc mở khóa tài khoản người dùng
     * 
     * @param adminUserId  ID của Admin đang thực hiện thao tác
     * @param targetUserId ID của người dùng cần khóa/mở khóa
     * @param isActive     true = mở khóa (hoạt động), false = khóa tài khoản
     */
    @Transactional
    public UserDTO updateUserStatus(Long adminUserId, Long targetUserId, boolean isActive) {
        // BƯỚC 1: AI LÀM? (Tìm Admin)
        userRepository.findById(adminUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản Admin"));

        // BƯỚC 2: LÀM VỚI CÁI GÌ? (Tìm người dùng mục tiêu)
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng với ID: " + targetUserId));

        // BƯỚC 3: CÓ ĐƯỢC PHÉP LÀM KHÔNG? (Quy tắc chống Admin tự khóa chính mình)
        if (targetUserId.equals(adminUserId) && !isActive) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bạn không thể tự khóa tài khoản của chính mình");
        }

        // BƯỚC 4: THAY ĐỔI GÌ TRONG DATABASE?
        targetUser.setIsActive(isActive);
        User savedUser = userRepository.save(targetUser);

        // BƯỚC 5: TRẢ VỀ DTO CHO CLIENT
        return new UserDTO(savedUser);
    }

}
