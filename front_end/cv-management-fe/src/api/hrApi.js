import axiosClient from './axiosClient';

/**
 * Service API dành cho HR (Nghiệp vụ Nhân sự & Duyệt CV Trạm 2)
 * Tương ứng với HrCvController ở Back-End (/api/v1/hr)
 */
const hrApi = {
  // Lấy danh sách bản nháp CV chờ HR duyệt Trạm 2 (PENDING_HR)
  getPendingDrafts: () => {
    return axiosClient.get('/hr/drafts/pending');
  },

  // UC14 & UC19: HR duyệt chót bản nháp CV (APPROVED) và nâng version CV gốc
  approveDraft: (id, comment = '') => {
    const params = comment ? { comment } : {};
    return axiosClient.post(`/hr/drafts/${id}/approve`, null, { params });
  },

  // UC15: HR từ chối bản nháp CV Trạm 2 (REJECTED_BY_HR)
  rejectDraft: (id, rejectionNote) => {
    return axiosClient.post(`/hr/drafts/${id}/reject`, { rejectionNote });
  },

  // UC13: Master Dashboard xem & lọc toàn bộ CV active của công ty
  getAllCvs: (departmentId = null, status = null) => {
    const params = {};
    if (departmentId) params.departmentId = departmentId;
    if (status) params.status = status;
    return axiosClient.get('/hr/cvs', { params });
  },

  // UC11: HR tạo đợt phát lệnh yêu cầu nhân viên cập nhật CV
  createUpdateRequests: (data) => {
    return axiosClient.post('/hr/requests', data);
  },

  // UC12: HR hủy yêu cầu cập nhật CV
  cancelUpdateRequest: (id) => {
    return axiosClient.put(`/hr/requests/${id}/cancel`);
  },
};

export default hrApi;
