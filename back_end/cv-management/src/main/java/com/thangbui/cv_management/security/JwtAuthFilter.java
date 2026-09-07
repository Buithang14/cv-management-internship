package com.thangbui.cv_management.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    /**
     * Filter này chạy MỘT LẦN cho mỗi HTTP request.
     * Quy trình:
     *   1. Đọc header "Authorization: Bearer <token>"
     *   2. Trích xuất username từ token
     *   3. Load UserDetails từ DB
     *   4. Kiểm tra token hợp lệ → set Authentication vào SecurityContext
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Nếu không có header hoặc không bắt đầu bằng "Bearer " → bỏ qua
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Cắt bỏ "Bearer " (7 ký tự) để lấy token thuần
        final String jwt = authHeader.substring(7);

        try {
            final String username = jwtService.extractUsername(jwt);

            // Chỉ xử lý nếu có username và SecurityContext chưa có auth (chưa đăng nhập)
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Tạo Authentication object và set vào SecurityContext
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,               // credentials = null (đã xác thực qua JWT)
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token không hợp lệ (hết hạn, sai chữ ký...) → không set Authentication
            // Spring Security sẽ tự trả 401 Unauthorized
        }

        filterChain.doFilter(request, response);
    }
}
