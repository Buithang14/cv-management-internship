import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

/**
 * Quản lý danh sách các Route (Đường dẫn trang) trong ứng dụng
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Tự động chuyển trang chủ / về /login nếu chưa đăng nhập */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Đường dẫn tới trang Login */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Đường dẫn tới trang Dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />
      
      {/* Catch all: Chuyển các đường dẫn không tồn tại về trang Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
