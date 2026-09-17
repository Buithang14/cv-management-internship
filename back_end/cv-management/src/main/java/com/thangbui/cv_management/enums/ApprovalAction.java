package com.thangbui.cv_management.enums;

import lombok.Getter;

@Getter
public enum ApprovalAction {
    APPROVED_BY_TECH("Tech Lead đã duyệt"),  // Tech Lead duyệt → chuyển sang Pending_HR
    APPROVED_BY_HR("HR đã duyệt chót"),      // HR duyệt chót  → hoàn tất, CV gốc được nâng version
    REJECTED_BY_TECH("Tech Lead từ chối"),  // Tech Lead từ chối → nhân viên sửa lại từ đầu
    REJECTED_BY_HR("HR từ chối");            // HR từ chối → nhân viên sửa lại, bỏ qua Trạm 1

    private final String description;

    ApprovalAction(String description) {
        this.description = description;
    }
}

