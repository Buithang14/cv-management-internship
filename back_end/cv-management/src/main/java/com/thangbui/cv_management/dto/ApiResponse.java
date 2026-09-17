package com.thangbui.cv_management.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * ============================================================
 *  ApiResponse<T> — Lớp bọc (Wrapper) thống nhất cho toàn bộ API response
 * ============================================================
 *
 * MỤC ĐÍCH:
 *   Trước đây Backend trả về 2 kiểu response khác nhau:
 *     - Thành công: trả thẳng DTO  (vd: CvDTO, LoginResponse)
 *     - Lỗi:        trả ErrorResponse { status, message, timestamp }
 *
 *   Bây giờ TẤT CẢ response đều có cùng 1 hình dạng:
 *   {
 *     "success": true/false,
 *     "message": "Nội dung thông báo",
 *     "data": { ... }   // null nếu là lỗi
 *   }
 *
 * LỢI ÍCH:
 *   - Frontend chỉ cần đọc 1 trường: success
 *       → true  → lấy data để hiển thị
 *       → false → đọc message để hiện thông báo lỗi
 *   - Không cần viết nhiều case xử lý response khác nhau
 *
 * <T> là kiểu dữ liệu của phần "data":
 *   - ApiResponse<LoginResponse>  → data là LoginResponse
 *   - ApiResponse<CvDTO>          → data là CvDTO
 *   - ApiResponse<List<CvDTO>>    → data là danh sách CvDTO
 *   - ApiResponse<Void>           → data là null (không có dữ liệu trả về)
 */
@Getter
@Setter
public class ApiResponse<T> {

    /**
     * true  = Request thành công
     * false = Request thất bại (lỗi nghiệp vụ, validation, server...)
     */
    private boolean success;

    /**
     * Thông báo ngắn gọn mô tả kết quả.
     * Ví dụ: "Đăng nhập thành công", "Không tìm thấy CV", "Dữ liệu không hợp lệ"
     */
    private String message;

    /**
     * Phần dữ liệu thực sự trả về cho Frontend.
     * - Khi success = true  → chứa DTO hoặc danh sách DTO
     * - Khi success = false → null
     */
    private T data;

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor private: buộc dùng các static factory method bên dưới
    // Lý do: tránh tạo object không hợp lệ (vd: success=true nhưng data=null)
    // ─────────────────────────────────────────────────────────────────────────
    private ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    /**
     * Tạo response THÀNH CÔNG có kèm dữ liệu.
     * Dùng khi: GET, POST, PUT trả về DTO.
     *
     * Ví dụ sử dụng:
     *   return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", loginResponse));
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * Tạo response THÀNH CÔNG không có dữ liệu kèm theo.
     * Dùng khi: DELETE, hoặc action không cần trả về object.
     *
     * Ví dụ sử dụng:
     *   return ResponseEntity.ok(ApiResponse.success("Xóa thành công"));
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /**
     * Tạo response THẤT BẠI.
     * Dùng trong GlobalExceptionHandler để trả lỗi thống nhất.
     *
     * Ví dụ sử dụng:
     *   return new ResponseEntity<>(ApiResponse.error("Không tìm thấy CV"), HttpStatus.NOT_FOUND);
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
