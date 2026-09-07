package com.thangbui.cv_management.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

// Data client gửi lên khi tạo yêu cầu nộp CV (POST /api/cv-update-requests)
// requestedBy tự lấy từ token người đang đăng nhập
@Getter
@Setter
public class CreateCvUpdateRequestRequest {

    // Danh sách ID nhân viên cần nộp CV (hỗ trợ chọn nhiều người)
    @NotEmpty(message = "Phải chỉ định ít nhất 1 người cần nộp CV")
    private List<Long> targetUserIds;

    // (Tùy chọn) ID của phòng ban, nếu HR muốn gửi yêu cầu cho toàn bộ nhân viên trong phòng ban
    private Long departmentId;

    @NotNull(message = "Deadline không được để trống")
    @Future(message = "Deadline phải là thời điểm trong tương lai")
    private LocalDateTime deadline;

    @Size(max = 100, message = "Tên đợt tối đa 100 ký tự")
    private String batchName;

}
