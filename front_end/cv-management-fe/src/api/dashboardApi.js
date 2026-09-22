import axiosClient from './axiosClient';

/**
 * Gọi API lấy số liệu thống kê Dashboard.
 * Response: ApiResponse<DashboardStatsDTO>
 *   → axiosClient interceptor đã unwrap → trả về ApiResponse object
 *   → Ta dùng response.data để lấy DashboardStatsDTO
 */
export const getDashboardStats = () => {
  return axiosClient.get('/dashboard/stats');
};
