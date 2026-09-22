import axiosClient from './axiosClient';

/**
 * Service API dành cho Admin (Quản lý Người Dùng & Quản lý Phòng Ban)
 */
const adminApi = {
  // Lấy danh sách tất cả người dùng trong hệ thống
  getAllUsers: () => {
    return axiosClient.get('/admin/users');
  },

  // Admin tạo tài khoản người dùng mới
  createUser: (data) => {
    return axiosClient.post('/admin/users', data);
  },

  // UC17: Khóa hoặc mở khóa tài khoản người dùng (isActive = true/false)
  updateUserStatus: (id, isActive) => {
    return axiosClient.put(`/admin/users/${id}/status`, null, {
      params: { isActive },
    });
  },

  // Lấy danh sách phòng ban
  getAllDepartments: () => {
    return axiosClient.get('/admin/departments');
  },

  // Admin tạo phòng ban mới
  createDepartment: (data) => {
    return axiosClient.post('/admin/departments', data);
  },
};

export default adminApi;
