package com.thangbui.cv_management.enums;

import lombok.Getter;

/**
 * Ngôn ngữ của CV (Localization)
 */
@Getter
public enum CvLanguage {

    /**
     * Tiếng Việt (Bản gốc / Master CV)
     */
    VI("Tiếng Việt", "🇻🇳"),

    /**
     * Tiếng Anh
     */
    EN("Tiếng Anh", "🇬🇧"),

    /**
     * Tiếng Nhật
     */
    JA("Tiếng Nhật", "🇯🇵");

    private final String label;
    private final String flag;

    CvLanguage(String label, String flag) {
        this.label = label;
        this.flag = flag;
    }
}
