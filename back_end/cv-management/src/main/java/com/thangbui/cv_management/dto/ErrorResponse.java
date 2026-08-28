package com.thangbui.cv_management.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

//định nghĩa một cấu trúc dữ liệu chuẩn để trả về thông tin lỗi cho phía client 
// (ví dụ: Frontend, Mobile App, hoặc Postman) mỗi khi API của bạn xảy ra lỗi.
@Getter
@Setter
@AllArgsConstructor
public class ErrorResponse {

    private int status;
    private String message;
    private LocalDateTime timestamp;

}
