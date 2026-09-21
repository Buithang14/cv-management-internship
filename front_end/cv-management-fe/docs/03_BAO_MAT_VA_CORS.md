# 03. Bản Chất CORS & Cấu Hình Bảo Mật Spring Security

Tài liệu giải thích tại sao lại cần cấu hình CORS ở Back-End và cách 2 bên giao tiếp an toàn.

---

## 🌐 1. CORS (Cross-Origin Resource Sharing) Là Gì?

- Trình duyệt web có cơ chế bảo mật tên là **Same-Origin Policy**.
- Front-End chạy ở Domain: `http://localhost:5173` (Cổng 5173).
- Back-End chạy ở Domain: `http://localhost:8080` (Cổng 8080).
- Vì **khác cổng (Port)**, trình duyệt sẽ tự động chặn các request từ 5173 sang 8080 trừ khi Spring Boot cho phép công khai.

---

## 🛠️ 2. Cấu Hình CORS Trong Spring Security (`SecurityConfig.java`)

Để Front-End gửi được request đăng nhập và truyền Header `Authorization`, Back-End cần thêm bean `CorsConfigurationSource`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    // Cho phép Front-End Vite (5173) truy cập
    configuration.setAllowedOrigins(List.of("http://localhost:5173"));
    // Cho phép các phương thức HTTP
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    // Cho phép gửi mọi Header (bao gồm Authorization và Content-Type)
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```
