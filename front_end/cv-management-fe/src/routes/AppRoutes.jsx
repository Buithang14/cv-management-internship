import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import MainLayout from '../components/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

/**
 * Quản lý danh sách các Route và Phân quyền truy cập
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Route: Trang đăng nhập */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 2. Protected Routes: Tất cả trang cần Đăng nhập nằm bên trong MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Trang Dashboard chính (mọi Role đều truy cập được) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Ví dụ Protected Route theo Role trong các Phase tiếp theo: */}
          {/* <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}> */}
          {/*   <Route path="/admin/users" element={<AdminUserPage />} /> */}
          {/* </Route> */}
        </Route>
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
