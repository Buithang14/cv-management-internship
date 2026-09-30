import axiosClient from './axiosClient';

/**
 * Service chứa các hàm gọi API liên quan tới CV và Bản nháp CV (CvDraft)
 * Tương ứng với CvController và CvDraftController ở Back-End Spring Boot
 */
const cvApi = {
  // UC02: Xem CV cá nhân đang hoạt động (GET /api/v1/cvs/me?language=VI)
  getMyCv: (language = 'VI') => {
    return axiosClient.get(`/cvs/me?language=${language}`);
  },

  // Lấy các ngôn ngữ đã có CV active (GET /api/v1/cvs/languages/me)
  getMyActiveLanguages: () => {
    return axiosClient.get('/cvs/languages/me');
  },

  // UC03: Khởi tạo hoặc lấy bản nháp CV dở dang theo ngôn ngữ (POST /api/v1/cv-drafts/init?language=VI)
  initDraft: (language = 'VI') => {
    return axiosClient.post(`/cv-drafts/init?language=${language}`);
  },

  // Đồng bộ cấu trúc khung từ CV Tiếng Việt sang bản dịch (POST /api/v1/cv-drafts/{id}/sync-skeleton)
  syncSkeleton: (id) => {
    return axiosClient.post(`/cv-drafts/${id}/sync-skeleton`);
  },

  // UC04: Chỉnh sửa nội dung bản nháp (PUT /api/v1/cv-drafts/{id})
  updateDraft: (id, data) => {
    return axiosClient.put(`/cv-drafts/${id}`, data);
  },

  // UC05: Nộp bản nháp để gửi duyệt (POST /api/v1/cv-drafts/{id}/submit)
  submitDraft: (id) => {
    return axiosClient.post(`/cv-drafts/${id}/submit`);
  },

  // UC16: Xem lịch sử phê duyệt của bản nháp (GET /api/v1/cv-drafts/{id}/logs)
  getDraftLogs: (id) => {
    return axiosClient.get(`/cv-drafts/${id}/logs`);
  },

  // Xem lịch sử phê duyệt bản nháp cá nhân hiện tại (GET /api/v1/cv-drafts/my-logs)
  getMyDraftLogs: (language) => {
    const query = language ? `?language=${language}` : '';
    return axiosClient.get(`/cv-drafts/my-logs${query}`);
  },

    // Upload ảnh đại diện Avatar lên server (POST /api/v1/files/upload)
  uploadAvatar: (formData) => {
    return axiosClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Lấy danh sách yêu cầu cập nhật CV
  getMyUpdateRequests: () => {
    return axiosClient.get('/cvs/requests/me');
  },
};

export default cvApi;
