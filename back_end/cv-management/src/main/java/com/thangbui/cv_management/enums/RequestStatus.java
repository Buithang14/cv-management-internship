package com.thangbui.cv_management.enums;

import lombok.Getter;

@Getter
public enum RequestStatus {
    PENDING("Đang chờ nộp"),
    COMPLETED("Đã hoàn thành"),
    CANCELED("Đã hủy");

    private final String description;

    RequestStatus(String description) {
        this.description = description;
    }
}

