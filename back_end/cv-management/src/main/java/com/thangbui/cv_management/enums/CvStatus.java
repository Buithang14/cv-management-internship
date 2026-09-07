package com.thangbui.cv_management.enums;

/**
 * Trạng thái tổng thể của CV gốc (Cv.overallStatus)
 * Phản ánh tình trạng cập nhật của CV theo yêu cầu từ phòng HR.
 * 
 * Lưu ý quan trọng:
 * - TÁCH BIỆT HOÀN TOÀN với DraftStatus (DraftStatus quản lý vòng đời duyệt của Bản Nháp).
 * - Khi HR tạo yêu cầu cập nhật (UC11) → overallStatus của CV gốc chuyển thành NOT_UPDATED.
 * - Khi HR duyệt chót bản nháp (UC14, UC19) → CV gốc được nâng version mới với overallStatus là UPDATED.
 * - Khi HR hủy yêu cầu (UC12) → overallStatus chuyển thành REQUEST_CANCELED (CV vẫn dùng bình thường).
 */
public enum CvStatus {

    /**
     * CV đã cập nhật hoàn tất, đang hoạt động bình thường.
     * Giao diện hiển thị gợi ý: Màu Xanh lá (🟢)
     */
    UPDATED,

    /**
     * HR đã phát lệnh yêu cầu cập nhật, nhân viên chưa hoàn tất nộp/duyệt.
     * Giao diện hiển thị gợi ý: Màu Đỏ / Cam (🔴)
     */
    NOT_UPDATED,

    /**
     * HR đã hủy yêu cầu cập nhật giữa chừng, phiên bản CV hiện tại vẫn giữ nguyên và dùng tốt.
     * Giao diện hiển thị gợi ý: Màu Xám (⚫)
     */
    REQUEST_CANCELED

}
