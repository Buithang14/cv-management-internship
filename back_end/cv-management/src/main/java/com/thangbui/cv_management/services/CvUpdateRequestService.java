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

   /**
    * UC11: HR tạo đợt yêu cầu cập nhật CV cho danh sách nhân viên
    */

   @Transactional
   public List<CvUpdateRequestDTO> creatUpdateRequest(Long hrUserId, CreateCvUpdateRequestRequest request) {
      // 1.ai làm: tìm thông tin tài khoản HR
      User hr = userRepository.findById(hrUserId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "không tìm thấy thông tin HR"));
      List<CvUpdateRequestDTO> resultList = new ArrayList<>();
      // 4. lặp qua từng ID nhân viên được chỉ định
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
         // b. Đổi trạng thái CV gốc của nhân viên thành NOT_UPDATED (nếu nhân viên đã có
         // CV gốc)
         cvRepository.findByUserIdAndIsActiveTrue(targetUserId).ifPresent(cv -> {
            cv.setOverallStatus(CvStatus.NOT_UPDATED);
            cvRepository.save(cv);
         });
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

   @Transactional
   public CvUpdateRequestDTO cancelUpdateRequest(Long hrUserId, Long requestId) {
      // 1. Kiểm tra tài khoản HR
      userRepository.findById(hrUserId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin HR"));
      // 2. tìm phiếu yêu cầu theo mã requestId
      CvUpdateRequest req = cvUpdateRequestRepository.findById(requestId).orElseThrow(
            () -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phiếu yêu cầu có ID: " + requestId));

      // 3. kiểm tra tờ phiếu - chỉ được hủy khi phiếu đang PENDING( đang chờ)
      if (req.getStatus() != RequestStatus.PENDING) {
         throw new AppException(HttpStatus.BAD_REQUEST, "yêu cầu không ở trạng thái chờ, không thể hủy");

      }
      // 4. thay đổi trạng thái sang CANCELED và lưu vào db
      req.setStatus(RequestStatus.CANCELED);
      CvUpdateRequest savedRequest = cvUpdateRequestRepository.save(req);

      // phần này chưa hiểu lắm

      // 4b. Xóa nợ cho cho nhân viên ( NOT_UPDATED ->> REQUESt_CANCELED)
      cvRepository.findByUserIdAndIsActiveTrue(req.getTargetUser().getId()).ifPresent(cv -> {
         cv.setOverallStatus(CvStatus.REQUEST_CANCELED);
         cvRepository.save(cv);
      });

      return mapToDTO(savedRequest);

   }

}
