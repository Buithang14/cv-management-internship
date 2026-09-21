import axiosClient from './axiosClient';

/**
 * Service chứa các hàm gọi API liên quan tới CV và Bản nháp CV (CvDraft)
 * Tương ứng với CvController và CvDraftController ở Back-End Spring Boot
 */
const cvApi = {
  // UC02: Xem CV cá nhân đang hoạt động (GET /api/v1/cvs/me)
  getMyCv: () => {
    return axiosClient.get('/cvs/me');
  },

  // UC03: Khởi tạo hoặc lấy bản nháp CV dở dang (POST /api/v1/cv-drafts/init)
  initDraft: () => {
    return axiosClient.post('/cv-drafts/init');
  },

  // UC04: Chỉnh sửa nội dung bản nháp (PUT /api/v1/cv-drafts/{id})
  updateDraft: (id, data) => {
    return axiosClient.put(`/cv-drafts/${id}`, data);
  },

  // UC05: Nộp bản nháp để gửi duyệt (POST /api/v1/cv-drafts/${id}/submit)
  submitDraft: (id) => {
    return axiosClient.post(`/cv-drafts/${id}/submit`);
  },

  // UC16: Xem lịch sử phê duyệt của bản nháp (GET /api/v1/cv-drafts/${id}/logs)
  getDraftLogs: (id) => {
    return axiosClient.get(`/cv-drafts/${id}/logs`);
  },
};

export default cvApi;
