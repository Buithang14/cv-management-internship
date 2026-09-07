package com.thangbui.cv_management.enums;

public enum DraftStatus {
    // Vòng đời của một Bản Nháp (cv_drafts)
    // ────────────────────────────────────────────────────────────────────
    //
    //  [Nhân viên tạo nháp]
    //        │
    //        ▼
    //    DRAFTING ──── (Gửi duyệt) ────► PENDING_TECH
    //                                          │
    //                               ┌──────────┴──────────┐
    //                        (Từ chối)               (Duyệt)
    //                               │                     │
    //                               ▼                     ▼
    //                      REJECTED_BY_TECH          PENDING_HR
    //                               │               ┌──────┴──────┐
    //                    (Sửa & gửi lại)      (Từ chối)        (Duyệt chót)
    //                               │               │                │
    //                               └──► PENDING_TECH   REJECTED_BY_HR  ──► [HOÀN TẤT]
    //                                                       │               CV gốc lên version mới
    //                                            (Sửa & gửi lại)
    //                                                       │
    //                                                       └──► PENDING_HR (Smart Routing)
    //
    //  HR hủy yêu cầu (bất kỳ lúc nào) ──► CANCELED

    DRAFTING,          // Nhân viên đang soạn thảo, chưa gửi duyệt
    PENDING_TECH,      // Đã gửi, chờ Tech Lead duyệt (Trạm 1)
    PENDING_HR,        // Tech Lead đã duyệt, chờ HR duyệt chót (Trạm 2)
    REJECTED_BY_TECH,  // Tech Lead từ chối → nhân viên sửa lại → quay về PENDING_TECH
    REJECTED_BY_HR,    // HR từ chối → nhân viên sửa lại → Smart Routing thẳng lên PENDING_HR
    CANCELED           // HR hủy yêu cầu cập nhật (Luồng 4b) — xóa mềm, nhân viên vẫn copy lại được
}
