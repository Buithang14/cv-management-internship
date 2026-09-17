package com.thangbui.cv_management.enums;

import lombok.Getter;

/**
 * Trạng thái tổng thể của CV gốc (Cv.overallStatus)
 * Phản ánh tình trạng cập nhật của CV theo yêu cầu từ phòng HR.
 */
@Getter
public enum CvStatus {

    /**
     * CV đã cập nhật hoàn tất, đang hoạt động bình thường.
     * Giao diện hiển thị gợi ý: Màu Xanh lá (🟢)
     */
    UPDATED("Đã cập nhật"),

    /**
     * HR đã phát lệnh yêu cầu cập nhật, nhân viên chưa hoàn tất nộp/duyệt.
     * Giao diện hiển thị gợi ý: Màu Đỏ / Cam (🔴)
     */
    NOT_UPDATED("Chưa cập nhật"),

    /**
     * HR đã hủy yêu cầu cập nhật giữa chừng, phiên bản CV hiện tại vẫn giữ nguyên và dùng tốt.
     * Giao diện hiển thị gợi ý: Màu Xám (⚫)
     */
    REQUEST_CANCELED("Đã hủy yêu cầu");

    private final String description;

    CvStatus(String description) {
        this.description = description;
    }

}

