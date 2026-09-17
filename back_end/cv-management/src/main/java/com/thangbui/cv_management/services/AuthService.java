package com.thangbui.cv_management.services;

import com.thangbui.cv_management.dto.request.LoginRequest;
import com.thangbui.cv_management.dto.response.LoginResponse;
import com.thangbui.cv_management.dto.response.UserDTO;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.UserRepository;
import com.thangbui.cv_management.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Xử lý đăng nhập:
     *   1. AuthenticationManager xác thực username/password (tự throw nếu sai)
     *   2. Load UserDetails để tạo token
     *   3. Thêm role vào extra claims trong token
     *   4. Trả về token + thông tin user (dạng UserDTO)
     */
    public LoginResponse login(LoginRequest request) {
        try {
            // Bước 1: Xác thực credentials — throw BadCredentialsException hoặc DisabledException
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Username hoặc password không đúng");
        } catch (DisabledException e) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa");
        }

        // Bước 2: Load user từ DB (đã xác thực thành công)
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // Bước 3: Load thông tin đầy đủ của user (để build UserDTO + extra claims)
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống"));

        // Bước 4: Thêm role + userId vào JWT để client decode được
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId());

        // Bước 5: Tạo JWT token
        String token = jwtService.generateToken(extraClaims, userDetails);

        // Bước 6: Build UserDTO từ entity
        UserDTO userDTO = new UserDTO(user);

        return new LoginResponse(token, userDTO);
    }
}
