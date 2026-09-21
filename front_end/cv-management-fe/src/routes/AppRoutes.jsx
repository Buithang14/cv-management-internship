import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import MyCvPage from '../pages/MyCvPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import MainLayout from '../components/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

/**
 * Quản lý danh sách các Route và Phân quyền truy cập
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 2. Protected Routes trong MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Route CV Cá Nhân dành cho USER / INTERN */}
          <Route path="/my-cv" element={<MyCvPage />} />
        </Route>
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
