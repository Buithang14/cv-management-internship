package com.thangbui.cv_management.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thangbui.cv_management.dto.request.CreateCvUpdateRequestRequest;
import com.thangbui.cv_management.dto.response.CvUpdateRequestDTO;
import com.thangbui.cv_management.entity.CvUpdateRequest;
import com.thangbui.cv_management.entity.User;
import com.thangbui.cv_management.enums.CvStatus;
import com.thangbui.cv_management.enums.RequestStatus;
import com.thangbui.cv_management.exception.AppException;
import com.thangbui.cv_management.repositorys.CvRepository;
import com.thangbui.cv_management.repositorys.CvUpdateRequestRepository;
import com.thangbui.cv_management.repositorys.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CvUpdateRequestService {
   private final CvUpdateRequestRepository cvUpdateRequestRepository;
   private final UserRepository userRepository;
   private final CvRepository cvRepository;
   private final NotificationService notificationService;

   /**
    * UC11: HR tạo đợt yêu cầu cập nhật CV cho danh sách nhân viên
    */
   @Transactional
   public List<CvUpdateRequestDTO> creatUpdateRequest(Long hrUserId, CreateCvUpdateRequestRequest request) {
      // 1. Ai làm: Tìm thông tin tài khoản HR
      User hr = userRepository.findById(hrUserId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin HR"));
      List<CvUpdateRequestDTO> resultList = new ArrayList<>();
      // 4. Lặp qua từng ID nhân viên được chỉ định
      for (Long targetUserId : request.getTargetUserIds()) {
         User employee = userRepository.findById(targetUserId)
               .orElseThrow(
                     () -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy nhân viên có ID: " + targetUserId));
         // a. Tạo bản ghi yêu cầu mới
         CvUpdateRequest updateRequest = new CvUpdateRequest();
         updateRequest.setRequestedBy(hr);
         updateRequest.setTargetUser(employee);
         updateRequest.setDeadline(request.getDeadline());
         updateRequest.setBatchName(request.getBatchName());
         updateRequest.setStatus(RequestStatus.PENDING);
         CvUpdateRequest savedRequest = cvUpdateRequestRepository.save(updateRequest);
         // b. Đổi trạng thái CV gốc của nhân viên thành NOT_UPDATED (nếu nhân viên đã có CV gốc)
         cvRepository.findAllByUserIdAndIsActiveTrue(targetUserId).forEach(cv -> {
            cv.setOverallStatus(CvStatus.NOT_UPDATED);
            cvRepository.save(cv);
         });

         // UC21: Gửi thông báo tới nhân viên về đợt yêu cầu cập nhật CV
         String deadlineText = request.getDeadline() != null
                 ? ". Hạn nộp: " + request.getDeadline().toString()
                 : "";
         notificationService.createNotification(
                 employee,
                 "📌 Yêu Cầu Cập Nhật CV: " + request.getBatchName(),
                 "HR (" + hr.getFullName() + ") đã phát lệnh yêu cầu bạn cập nhật hồ sơ CV" + deadlineText + ". Vui lòng vào trang CV cá nhân để soạn thảo và nộp."
         );

         // c. Chuyển sang DTO và thêm vào danh sách kết quả
         resultList.add(mapToDTO(savedRequest));
      }
      // 5. TRẢ VỀ: Danh sách DTO
      return resultList;
   }

   private CvUpdateRequestDTO mapToDTO(CvUpdateRequest req) {
      return new CvUpdateRequestDTO(
            req.getId(),
            req.getRequestedBy().getId(),
            req.getRequestedBy().getFullName(),
            req.getTargetUser().getId(),
            req.getTargetUser().getFullName(),
            req.getDeadline(),
            req.getBatchName(),
            req.getStatus(),
            req.getCreatedAt());
   }

   /**
    * UC12: HR hủy yêu cầu cập nhật CV
    */
   @Transactional(readOnly = true)
   public List<CvUpdateRequestDTO> getMyUpdateRequests(Long userId) {
      return cvUpdateRequestRepository.findAllByTargetUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::mapToDTO).toList();
   }

   @Transactional(readOnly = true)
   public List<CvUpdateRequestDTO> getAllUpdateRequests() {
      return cvUpdateRequestRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(this::mapToDTO).toList();
   }

   @Transactional
   public CvUpdateRequestDTO cancelUpdateRequest(Long hrUserId, Long requestId) {
      // 1. Kiểm tra tài khoản HR
      userRepository.findById(hrUserId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin HR"));
      // 2. Tìm phiếu yêu cầu theo mã requestId
      CvUpdateRequest req = cvUpdateRequestRepository.findById(requestId).orElseThrow(
            () -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phiếu yêu cầu có ID: " + requestId));

      // 3. Kiểm tra tờ phiếu - chỉ được hủy khi phiếu đang PENDING (đang chờ)
      if (req.getStatus() != RequestStatus.PENDING) {
         throw new AppException(HttpStatus.BAD_REQUEST, "Yêu cầu không ở trạng thái chờ, không thể hủy");
      }
      // 4. Thay đổi trạng thái sang CANCELED và lưu vào DB
      req.setStatus(RequestStatus.CANCELED);
      CvUpdateRequest savedRequest = cvUpdateRequestRepository.save(req);

      // 4b. Xóa trạng thái yêu cầu cho nhân viên (NOT_UPDATED -> REQUEST_CANCELED)
      cvRepository.findAllByUserIdAndIsActiveTrue(req.getTargetUser().getId()).forEach(cv -> {
         cv.setOverallStatus(CvStatus.REQUEST_CANCELED);
         cvRepository.save(cv);
      });

      return mapToDTO(savedRequest);
   }
}
