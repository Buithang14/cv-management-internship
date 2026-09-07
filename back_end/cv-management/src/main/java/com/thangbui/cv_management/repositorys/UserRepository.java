package com.thangbui.cv_management.repositorys;

import com.thangbui.cv_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm user theo username (dùng cho login + UserDetailsService)
    Optional<User> findByUsername(String username);

    // Kiểm tra username đã tồn tại chưa (dùng khi tạo user mới)
    boolean existsByUsername(String username);

    // Kiểm tra email đã tồn tại chưa (dùng khi tạo user mới)
    boolean existsByEmail(String email);
}
