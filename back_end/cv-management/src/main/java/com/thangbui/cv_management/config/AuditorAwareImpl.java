package com.thangbui.cv_management.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * ============================================================
 * AuditorAwareImpl — Tự động xác định người dùng thực hiện thao tác (STT 12 Audit)
 * ============================================================
 * Giúp Spring Data JPA tự động điền giá trị cho @CreatedBy và @LastModifiedBy.
 * - Lấy username từ Spring Security Context (JWT Authentication).
 * - Nếu không có user đăng nhập (như DataInitializer, hệ thống) -> trả về "SYSTEM".
 */
@Component("auditorProvider")
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.of("SYSTEM");
        }

        return Optional.ofNullable(authentication.getName());
    }
}


