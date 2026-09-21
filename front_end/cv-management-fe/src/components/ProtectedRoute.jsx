import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Component Bảo Vệ Phân Quyền Trang (ProtectedRoute)
 * Tương đương @PreAuthorize trong Spring Security
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

  // 1. Chưa Đăng nhập -> Chuyển về /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Đã Đăng nhập nhưng Role không nằm trong danh sách cho phép -> Chuyển sang /unauthorized (403)
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Hợp lệ -> Render nội dung bên trong
  return <Outlet />;
};

export default ProtectedRoute;
