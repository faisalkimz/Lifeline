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
import PayrollRunDetailsPage from './features/payroll/PayrollRunDetailsPage';
import LeaveRequestsPage from './features/leave/LeaveRequestsPage';

import AttendancePage from './features/attendance/AttendancePage';
import PerformancePage from './features/performance/PerformancePage';
import DisciplinaryPage from './features/disciplinary/DisciplinaryPage';
import JobListPage from './features/recruitment/JobListPage';
import PipelinePage from './features/recruitment/PipelinePage';
import IntegrationsPage from './features/recruitment/IntegrationsPage';
import CandidatePage from './features/recruitment/CandidatePage';
import TrainingPage from './features/training/TrainingPage';
import BenefitsPage from './features/benefits/BenefitsPage';
import DocumentsPage from './features/documents/DocumentsPage';
import OffboardingPage from './features/offboarding/OffboardingPage';
import EmployeePortalLayout from './layouts/EmployeePortalLayout';
import EmployeeDashboard from './features/employee-portal/EmployeeDashboard';

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

        <Route path="/payroll/runs/:id" element={<PayrollRunDetailsPage />} />
        <Route path="/payroll/*" element={<PayrollIndex />} />

        <Route path="/leave" element={<LeaveRequestsPage />} />
        <Route path="/leave/approvals" element={<Navigate to="/leave" replace />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/disciplinary" element={<DisciplinaryPage />} />
        <Route path="/recruitment" element={<JobListPage />} />
        <Route path="/recruitment/candidates" element={<CandidatePage />} />
        <Route path="/recruitment/pipeline" element={<PipelinePage />} />
        <Route path="/recruitment/integrations" element={<IntegrationsPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/benefits" element={<BenefitsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/offboarding" element={<OffboardingPage />} />

        <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />

        {/* Employee Self-Service Portal */}
        <Route path="/employee" element={<EmployeePortalLayout />}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="payslips" element={<div className="p-8 text-center">Payslips - Coming Soon</div>} />
          <Route path="leave" element={<LeaveRequestsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="documents" element={<div className="p-8 text-center">My Documents - Coming Soon</div>} />
          <Route path="profile" element={<MyProfilePage />} />
        </Route>
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
