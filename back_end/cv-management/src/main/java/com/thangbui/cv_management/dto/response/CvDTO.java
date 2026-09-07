package com.thangbui.cv_management.dto.response;

import com.thangbui.cv_management.enums.CvStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// ============================================================
// TẠI SAO KHÔNG DÙNG: private User user; ???
// ============================================================
//
// Giả sử bạn KHÔNG dùng DTO, trả thẳng Entity Cv ra API:
//
//   Cv {
//       User user {               ← Cv biết User
//           List<Cv> cvs {        ← User biết danh sách Cv (nếu có @OneToMany)
//               Cv {
//                   User user {   ← Cv lại biết User
//                       List<Cv> cvs { ← User lại biết Cv
//                           ...   ← VÔ HẠN 💥
//
// Jackson (thư viện chuyển Java → JSON) sẽ cứ thế mà chạy mãi
// → StackOverflowError / JSON vô hạn / App crash
//
// ============================================================
// GIẢI PHÁP: Thay vì nhúng cả object User vào CvDTO
// → Chỉ lấy đúng 2 field cần thiết: userId + userFullName
// → Không có object User trong DTO → không có vòng lặp
// ============================================================

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CvDTO {

    private Long id;

    // ❌ ĐỪNG VIẾT: private User user;
    //    Lý do: Jackson sẽ serialize User → bên trong User có List<Cv>
    //           → serialize từng Cv → mỗi Cv lại có User → vòng lặp vô hạn

    // ✅ THAY BẰNG: chỉ lấy 2 thông tin cần thiết từ User
    //    → userId: để frontend biết CV này của ai (dùng để gọi API khác nếu cần)
    //    → userFullName: để hiển thị tên lên màn hình
    //    → Jackson chỉ thấy Long + String → serialize bình thường, không vòng lặp
    private Long userId;        // ← chỉ là số, không có gì lồng trong đó
    private String userFullName; // ← chỉ là chuỗi, không có gì lồng trong đó

    // Phiên bản CV hiện tại (bắt đầu từ 1, tăng mỗi khi HR duyệt chót một bản nháp - UC19)
    private Integer version;

    // Trạng thái tổng thể của CV gốc (Cv.overallStatus):
    // - UPDATED (🟢 Xanh lá): CV đã cập nhật, đang hoạt động tốt
    // - NOT_UPDATED (🔴 Đỏ/Cam): HR đã phát lệnh yêu cầu cập nhật, đang chờ nhân viên hoàn thành
    // - REQUEST_CANCELED (⚫ Xám): HR đã hủy yêu cầu cập nhật, phiên bản CV cũ vẫn có hiệu lực
    private CvStatus overallStatus;

    // Thông tin cá nhân trong CV
    private String fullName;
    private String avatarUrl;
    private String phone;
    private String summary;
    private String objective;

    // Dữ liệu JSON string — frontend tự parse
    private String experiencesJson;
    private String educationsJson;
    private String skillsJson;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
