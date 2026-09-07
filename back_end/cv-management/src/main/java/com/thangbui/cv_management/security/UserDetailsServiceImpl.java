package com.thangbui.cv_management.security;

import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Spring Security gọi method này khi cần xác thực user.
     * Load user từ DB theo username, bao gồm cả role (authority).
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));

        if (!user.getIsActive()) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản đã bị vô hiệu hóa");
        }

        // Gán role thành GrantedAuthority → dùng prefix "ROLE_" theo convention Spring
        // Security
        // Ví dụ: UserRole.HR → authority = "ROLE_HR"
        var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        return new CustomUserDetails(user, List.of(authority));
    }
}
