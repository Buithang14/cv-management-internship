package com.thangbui.cv_management.exception;

import com.thangbui.cv_management.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * ============================================================
 *  GlobalExceptionHandler — Bắt và xử lý lỗi tập trung
 * ============================================================
 *
 * Tất cả lỗi giờ đều trả về dạng ApiResponse.error(...):
 * {
 *   "success": false,
 *   "message": "Mô tả lỗi",
 *   "data": null
 * }
 *
 * Thứ tự ưu tiên bắt lỗi (từ cụ thể → tổng quát):
 *   1. AppException      → lỗi nghiệp vụ mình tự throw (404, 400, 403...)
 *   2. MethodArgumentNotValidException → lỗi @Valid (400 Bad Request)
 *   3. Exception         → mọi lỗi không lường trước (500 Internal Server Error)
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Bắt AppException — lỗi nghiệp vụ tự throw trong service/controller.
     * Ví dụ: throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy CV")
     * → Response: 404 + { success: false, message: "Không tìm thấy CV", data: null }
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage()),
                ex.getStatus()
        );
    }

    /**
     * Bắt lỗi validation từ @Valid trên Request DTO.
     * Ví dụ: field "deadline" bị null → "deadline: Deadline không được để trống"
     * → Response: 400 + { success: false, message: "...", data: null }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        // Lấy thông báo lỗi của field đầu tiên bị sai (thường chỉ cần 1 là đủ)
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .findFirst()
                .orElse("Dữ liệu không hợp lệ");

        return new ResponseEntity<>(
                ApiResponse.error(message),
                HttpStatus.BAD_REQUEST
        );
    }

    /**
     * Bắt lỗi AccessDeniedException từ Spring Security (@PreAuthorize).
     * Trả về 403 Forbidden thay vì rơi vào 500 lỗi hệ thống.
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("Bạn không có quyền thực hiện thao tác này"),
                HttpStatus.FORBIDDEN
        );
    }

    /**
     * Bắt lỗi AuthenticationException từ Spring Security khi xác thực không thành công.
     * Trả về 401 Unauthorized.
     */
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(org.springframework.security.core.AuthenticationException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("Yêu cầu xác thực tài khoản: " + ex.getMessage()),
                HttpStatus.UNAUTHORIZED
        );
    }

    /**
     * Bắt tất cả lỗi không mong muốn còn lại (lỗi hệ thống).
     * Ví dụ: NullPointerException, DB connection failed...
     * → Response: 500 + { success: false, message: "Lỗi hệ thống: ...", data: null }
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        return new ResponseEntity<>(
                ApiResponse.error("Lỗi hệ thống: " + ex.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
