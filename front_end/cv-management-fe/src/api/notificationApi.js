import axiosClient from './axiosClient';

/**
 * notificationApi — các hàm gọi API thông báo (UC06, UC07)
 * Tương ứng với NotificationController ở Back-End
 */
const notificationApi = {
  // UC06: Lấy danh sách thông báo của user đang đăng nhập
  getMyNotifications: () => axiosClient.get('/notifications/me'),

  // Lấy số lượng thông báo chưa đọc (badge)
  getUnreadCount: () => axiosClient.get('/notifications/me/unread-count'),

  // UC07: Đánh dấu 1 thông báo đã đọc
  markAsRead: (id) => axiosClient.put(`/notifications/${id}/read`),

  // UC07: Đánh dấu tất cả là đã đọc
  markAllAsRead: () => axiosClient.put('/notifications/me/read-all'),
};

export default notificationApi;
