package com.thangbui.cv_management.enums;

public enum ApprovalAction {
    // Phân biệt rõ NGƯỜI DuyỆT để hỗ trợ Smart Routing (Luồng 6)
    // ─────────────────────────────────────────────────────────────
    // Khi nhân viên bị REJECTED_BY_HR → submit lại → bỏ qua Trạm 1, thẳng lên Trạm 2
    // Khi nhân viên bị REJECTED_BY_TECH → submit lại → phải qua Trạm 1 như thường
    APPROVED_BY_TECH,  // Tech Lead duyệt → chuyển sang Pending_HR
    APPROVED_BY_HR,    // HR duyệt chót  → hoàn tất, CV gốc được nâng version
    REJECTED_BY_TECH,  // Tech Lead từ chối → nhân viên sửa lại từ đầu
    REJECTED_BY_HR     // HR từ chối → nhân viên sửa lại, bỏ qua Trạm 1
}
