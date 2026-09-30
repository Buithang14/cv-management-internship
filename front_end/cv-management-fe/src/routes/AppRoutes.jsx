import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import MyCvPage from '../pages/MyCvPage';
import TechLeadApprovalPage from '../pages/TechLeadApprovalPage';
import HrReviewPage from '../pages/hr/HrReviewPage';
import HrCvListPage from '../pages/hr/HrCvListPage';
import HrRequestManagementPage from '../pages/hr/HrRequestManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import DepartmentManagementPage from '../pages/admin/DepartmentManagementPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import MainLayout from '../components/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'EMPLOYEE';
  const isEmployee = userRole === 'EMPLOYEE';

  const defaultRedirect = isEmployee
    ? '/my-cv'
    : (userRole === 'TECH_LEAD'
      ? '/techlead/evaluations'
      : (userRole === 'HR'
        ? '/hr/cv-review'
        : (userRole === 'ADMIN' ? '/admin/users' : '/dashboard')));

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Tuyến đường yêu cầu xác thực người dùng */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard tổng quan: Dành cho ADMIN, HR, TECH_LEAD */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'TECH_LEAD']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Hồ sơ cá nhân: Dành riêng cho EMPLOYEE */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
            <Route path="/my-cv" element={<MyCvPage />} />
          </Route>

          {/* Đánh giá kỹ thuật Trạm 1: Dành riêng cho TECH_LEAD */}
          <Route element={<ProtectedRoute allowedRoles={['TECH_LEAD']} />}>
            <Route path="/techlead/evaluations" element={<TechLeadApprovalPage />} />
          </Route>

          {/* Nghiệp vụ HR & Quản Trị Hồ Sơ: Dành cho HR và ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']} />}>
            <Route path="/hr/cv-review" element={<HrReviewPage />} />
            <Route path="/hr/cv-list" element={<HrCvListPage />} />
            <Route path="/hr/requests" element={<HrRequestManagementPage />} />
          </Route>

          {/* Quản trị hệ thống: Dành riêng cho ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/departments" element={<DepartmentManagementPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={defaultRedirect} replace />} />
      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
  );
};

export default AppRoutes;
