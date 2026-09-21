import axiosClient from './axiosClient';

/**
 * Service API dành cho Tech Lead (Duyệt CV Trạm 1)
 * Tương ứng với TechLeadCvController ở Back-End (/api/v1/tech-lead/drafts)
 */
const techLeadApi = {
  // UC08: Lấy danh sách bản nháp CV chờ Tech Lead duyệt trong phòng ban
  getPendingDrafts: () => {
    return axiosClient.get('/tech-lead/drafts/pending');
  },

  // UC09: Tech Lead duyệt bản nháp Trạm 1 (Chuyển sang PENDING_HR)
  approveDraft: (id, comment = '') => {
    const params = comment ? { comment } : {};
    return axiosClient.post(`/tech-lead/drafts/${id}/approve`, null, { params });
  },

  // UC10: Tech Lead từ chối bản nháp Trạm 1 (Chuyển sang REJECTED_BY_TECH)
  rejectDraft: (id, rejectionNote) => {
    return axiosClient.post(`/tech-lead/drafts/${id}/reject`, { rejectionNote });
  },
};

export default techLeadApi;
