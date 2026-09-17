package com.thangbui.cv_management.enums;

import lombok.Getter;

@Getter
public enum DraftStatus {
    // Vòng đời của một Bản Nháp (cv_drafts)
    // ────────────────────────────────────────────────────────────────────
    //
    // [Nhân viên tạo nháp]
    // │
    // ▼
    // DRAFTING ──── (Gửi duyệt) ────► PENDING_TECH
    // │
    // ┌──────────┴──────────┐
    // (Từ chối) (Duyệt)
    // │ │
    // ▼ ▼
    // REJECTED_BY_TECH PENDING_HR
    // │ ┌──────┴──────┐
    // (Sửa & gửi lại) (Từ chối) (Duyệt chót)
    // │ │ │
    // └──► PENDING_TECH REJECTED_BY_HR ──► [HOÀN TẤT]
    // │ CV gốc lên version mới
    // (Sửa & gửi lại)
    // │
    // └──► PENDING_HR (Smart Routing)
    //
    // HR hủy yêu cầu (bất kỳ lúc nào) ──► CANCELED

    DRAFTING("Đang soạn thảo"),          // Nhân viên đang soạn thảo, chưa gửi duyệt
    PENDING_TECH("Chờ Tech Lead duyệt"), // Đã gửi, chờ Tech Lead duyệt (Trạm 1)
    PENDING_HR("Chờ HR duyệt"),         // Tech Lead đã duyệt, chờ HR duyệt chót (Trạm 2)
    REJECTED_BY_TECH("Tech Lead từ chối"), // Tech Lead từ chối
    REJECTED_BY_HR("HR từ chối"),       // HR từ chối
    CANCELED("Đã hủy yêu cầu"),         // HR hủy yêu cầu cập nhật
    APPROVED("Đã duyệt hoàn tất");      // Đã duyệt hoàn tất

    private final String description;

    DraftStatus(String description) {
        this.description = description;
    }
}

