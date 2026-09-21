import axiosClient from './axiosClient';

const authApi = {
  // Goi API Dang nhap tu AuthController: POST /api/v1/auth/login
  login: (credentials) => {
    // credentials: { username: '...', password: '...' }
    return axiosClient.post('/auth/login', credentials);
  },

  // Goi API Dang ky / tao user neu can
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  }
};

export default authApi;
