package com.thangbui.cv_management.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.thangbui.cv_management.entity.User;

import lombok.Getter;

@Getter
public class CustomUserDetails implements UserDetails {

    // 1. NHÉT ĐỐI TƯỢNG USER CỦA DỰ ÁN VÀO ĐÂY (chứa cả id, username, password...)

    private final User user;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user, Collection<? extends GrantedAuthority> authorities) {
        this.user = user;
        this.authorities = authorities;
    }

    public Long getId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getUsername() {
        return user.getUsername(); // Lấy username từ user của bạn
    }

    @Override
    public String getPassword() {
        return user.getPassword(); // Lấy mật khẩu từ user của bạn
    }

    @Override
    public boolean isEnabled() {
        // Tài khoản có đang hoạt động không (dựa vào cột isActive trong database)
        return user.getIsActive() != null && user.getIsActive();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Mật khẩu không hết hạn
    }

}