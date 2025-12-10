import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import EmployeeListPage from './features/employees/EmployeeListPage';
import EmployeeFormPage from './features/employees/EmployeeFormPage';
import DepartmentListPage from './features/departments/DepartmentListPage';
import DepartmentFormPage from './features/departments/DepartmentFormPage';
import OrgChartPage from './features/departments/OrgChartPage';
import MyProfilePage from './features/employees/MyProfilePage';
import ManagerManagementPage from './features/managers/ManagerManagementPage';
import PayrollIndex from './features/payroll/PayrollIndex';
import LeaveRequestsPage from './features/leave/LeaveRequestsPage';
import AttendancePage from './features/attendance/AttendancePage';

function App() {
  // Theme removed — app renders without theme side-effects

  return (
    <Routes>
      {/* Public Routes (Auth) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes (Dashboard) */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-profile" element={<MyProfilePage />} />
        {/* Add more routes here later */}
        <Route path="/employees" element={<EmployeeListPage />} />
        <Route path="/employees/new" element={<EmployeeFormPage />} />
        <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />

        <Route path="/departments" element={<DepartmentListPage />} />
        <Route path="/departments/new" element={<DepartmentFormPage />} />
        <Route path="/departments/:id/edit" element={<DepartmentFormPage />} />
        <Route path="/org-chart" element={<OrgChartPage />} />

        <Route path="/managers" element={<ManagerManagementPage />} />

        <Route path="/payroll/*" element={<PayrollIndex />} />

        <Route path="/leave" element={<LeaveRequestsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />

        <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
