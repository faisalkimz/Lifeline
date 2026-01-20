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
import LeaveApprovalPage from './features/leave/LeaveApprovalPage';
import LeaveCalendar from './features/leave/LeaveCalendar';

import AttendancePage from './features/attendance/AttendancePage';
import PerformancePage from './features/performance/PerformancePage';
import DisciplinaryPage from './features/disciplinary/DisciplinaryPage';
import JobListPage from './features/recruitment/JobListPage';
import JobDetailsPage from './features/recruitment/JobDetailsPage';
import PipelinePage from './features/recruitment/PipelinePage';
import IntegrationsPage from './features/recruitment/IntegrationsPage';
import CandidateManagementPage from './features/recruitment/CandidateManagementPage';
import InterviewSchedulingPage from './features/recruitment/InterviewSchedulingPage';
import PublicCareerPage from './features/recruitment/PublicCareerPage';
import TrainingPage from './features/training/TrainingPage';
import BenefitsPage from './features/benefits/BenefitsPage';
import BenefitsAdminPage from './features/benefits/BenefitsAdminPage';
import DocumentsPage from './features/documents/DocumentsPage';
import SettingsPage from './features/settings/SettingsPage';
import OffboardingPage from './features/offboarding/OffboardingPage';
import EmployeePortalLayout from './layouts/EmployeePortalLayout';
import EmployeeDashboard from './features/employee-portal/EmployeeDashboard';
import ExpensesPage from './features/payroll/ExpensesPage';
import MyPayslipsPage from './features/payroll/MyPayslipsPage';
import SalaryAdvancesPage from './features/payroll/SalaryAdvancesPage';
import LoansPage from './features/payroll/LoansPage';
import MyDocumentsPage from './features/employee-portal/MyDocumentsPage';
import OvertimePage from './features/attendance/OvertimePage';
import AttendanceAdminPage from './features/attendance/AttendanceAdminPage';
import HelpCenterPage from './features/help/HelpCenterPage';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import AssetsPage from './features/assets/AssetsPage';
import FormsPage from './features/forms/FormsPage';
import SurveysPage from './features/surveys/SurveysPage';
import GCCCompliancePage from './features/payroll/GCCCompliancePage';

function App() {
  // Theme removed — app renders without theme side-effects

  return (
    <Routes>
      {/* Public Routes (Auth) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Public Career Page */}
      <Route path="/careers" element={<PublicCareerPage />} />

      {/* Protected Routes (Dashboard) */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
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
        <Route path="/gcc" element={<GCCCompliancePage />} />

        <Route path="/leave" element={<LeaveRequestsPage />} />
        <Route path="/leave/calendar" element={<LeaveCalendar />} />
        <Route path="/leave/approvals" element={<LeaveApprovalPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance/overtime" element={<OvertimePage />} />
        <Route path="/attendance/admin" element={<AttendanceAdminPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/disciplinary" element={<DisciplinaryPage />} />
        <Route path="/recruitment" element={<JobListPage />} />
        <Route path="/recruitment/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/recruitment/candidates" element={<CandidateManagementPage />} />
        <Route path="/recruitment/pipeline" element={<PipelinePage />} />
        <Route path="/recruitment/interviews" element={<InterviewSchedulingPage />} />
        <Route path="/recruitment/integrations" element={<IntegrationsPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/benefits" element={<BenefitsPage />} />
        <Route path="/benefits/admin" element={<BenefitsAdminPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/surveys" element={<SurveysPage />} />
        <Route path="/offboarding" element={<OffboardingPage />} />

        {/* Finance Routes */}
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/finance/loans" element={<LoansPage />} />

        {/* Payroll Routes */}
        <Route path="/payroll/my-payslips" element={<MyPayslipsPage />} />
        <Route path="/payroll/advances" element={<SalaryAdvancesPage />} />

        {/* Organization Routes */}
        <Route path="/organization" element={<Navigate to="/org-chart" replace />} />

        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
      </Route>

      {/* Employee Self-Service Portal */}
      <Route path="/employee" element={<EmployeePortalLayout />}>
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="payslips" element={<MyPayslipsPage />} />
        <Route path="leave" element={<LeaveRequestsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="documents" element={<MyDocumentsPage />} />
        <Route path="profile" element={<MyProfilePage />} />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
