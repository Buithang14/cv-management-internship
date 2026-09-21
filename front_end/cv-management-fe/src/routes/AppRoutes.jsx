import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import MyCvPage from '../pages/MyCvPage';
import TechLeadApprovalPage from '../pages/TechLeadApprovalPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import MainLayout from '../components/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'EMPLOYEE';
  const isEmployee = userRole === 'EMPLOYEE' || userRole === 'USER' || userRole === 'INTERN';

  const defaultRedirect = isEmployee ? '/my-cv' : (userRole === 'TECH_LEAD' ? '/techlead/evaluations' : '/dashboard');

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-cv" element={<MyCvPage />} />
          <Route path="/techlead/evaluations" element={<TechLeadApprovalPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={defaultRedirect} replace />} />
      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
  );
};

export default AppRoutes;
