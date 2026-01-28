import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../features/auth/authSlice';

// Enhanced base query with authentication error handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')}`,
  prepareHeaders: (headers, { getState }) => {
    const state = getState();
    const token = state?.auth?.token;
    const isAuthenticated = state?.auth?.isAuthenticated;
    if (isAuthenticated && token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

// Enhanced base query with automatic logout on 401
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);
  if (result?.error && result.error.status === 401) {
    api.dispatch(logout());
    if (typeof window !== 'undefined') window.location.href = '/login';
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // FIXED: Add 'SalaryAdvance' tag
  tagTypes: ['User', 'Company', 'Department', 'Employee', 'PayrollRun', 'SalaryStructure', 'SalaryAdvance', 'LeaveType', 'LeaveRequest', 'Attendance', 'PerformanceCycle', 'Goal', 'PerformanceReview', 'Job', 'JobPost', 'Candidate', 'Application', 'Interview', 'RecruitmentIntegration', 'Course', 'TrainingSession', 'Enrollment', 'BenefitType', 'EmployeeBenefit', 'Document', 'EmployeeDocument', 'Resignation', 'ExitInterview', 'OfferLetter', 'Payslip', 'Announcement', 'Asset', 'AssetCategory', 'AssetAssignment', 'Integration', 'FormTemplate', 'FormSubmission', 'Survey', 'SurveyResponse', 'ChatSession', 'GCCSettings', 'Gratuity', 'DocumentSignature', 'TaxSettings'],
  endpoints: (builder) => ({
    // --- Auth / user endpoints (existing) ---
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials
      })
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register/',
        method: 'POST',
        body: data
      })
    }),
    logout: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/logout/',
        method: 'POST',
        body: { refresh: refreshToken }
      })
    }),
    getCurrentUser: builder.query({
      query: () => '/auth/me/',
      providesTags: ['User']
    }),
    // --- Security Endpoints ---
    setup2FA: builder.query({
      query: () => '/security/setup_2fa/'
    }),
    enable2FA: builder.mutation({
      query: (data) => ({
        url: '/security/enable_2fa/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['User']
    }),
    disable2FA: builder.mutation({
      query: (data) => ({
        url: '/security/disable_2fa/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['User']
    }),
    getSecurityLogs: builder.query({
      query: () => '/security/logs/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      }
    }),
    exportData: builder.query({
      query: () => '/security/export_data/'
    }),
    // --- Password Reset Endpoints ---
    requestPasswordReset: builder.mutation({
      query: (data) => ({
        url: '/auth/request-password-reset/',
        method: 'POST',
        body: data
      })
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password/',
        method: 'POST',
        body: data
      })
    }),
    verifyResetToken: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-reset-token/',
        method: 'POST',
        body: data
      })
    }),
    registerPushSubscription: builder.mutation({
      query: (subscription) => ({
        url: '/notifications/subscriptions/',
        method: 'POST',
        body: subscription
      })
    }),
    // --- Employees (existing) ---
    getEmployees: builder.query({
      query: (params) => ({
        url: '/employees/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'Employee', id })),
            { type: 'Employee', id: 'LIST' }
          ]
          : [{ type: 'Employee', id: 'LIST' }]
    }),
    getEmployee: builder.query({
      query: (id) => `/employees/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }]
    }),
    createEmployee: builder.mutation({
      query: (data) => ({
        url: '/employees/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }]
    }),
    updateEmployee: builder.mutation({
      query: ({ id, formData, ...data }) => ({
        url: `/employees/${id}/`,
        method: (typeof FormData !== 'undefined' && formData instanceof FormData) ? 'PATCH' : 'PUT',
        body: formData || data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' }
      ]
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }]
    }),
    // --- Departments (existing) ---
    getDepartments: builder.query({
      query: () => '/departments/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'Department', id })),
            { type: 'Department', id: 'LIST' }
          ]
          : [{ type: 'Department', id: 'LIST' }]
    }),
    getDepartment: builder.query({
      query: (id) => `/departments/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Department', id }]
    }),
    createDepartment: builder.mutation({
      query: (data) => ({
        url: '/departments/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'Department', id: 'LIST' }]
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/departments/${id}/`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Department', id },
        { type: 'Department', id: 'LIST' }
      ]
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Department', id: 'LIST' }]
    }),
    // --- Salary Structures (NEW) ---
    getSalaryStructures: builder.query({
      query: () => '/payroll/salary-structures/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'SalaryStructure', id })),
            { type: 'SalaryStructure', id: 'LIST' }
          ]
          : [{ type: 'SalaryStructure', id: 'LIST' }]
    }),
    createSalaryStructure: builder.mutation({
      query: (data) => ({
        url: '/payroll/salary-structures/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'SalaryStructure', id: 'LIST' }]
    }),
    updateSalaryStructure: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/payroll/salary-structures/${id}/`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalaryStructure', id },
        { type: 'SalaryStructure', id: 'LIST' }
      ]
    }),
    deleteSalaryStructure: builder.mutation({
      query: (id) => ({
        url: `/payroll/salary-structures/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'SalaryStructure', id: 'LIST' }]
    }),

    // ========== PAYROLL RUNS ==========
    getPayrollRuns: builder.query({
      query: (params) => ({
        url: '/payroll/payroll-runs/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['PayrollRun']
    }),
    getPayrollRun: builder.query({
      query: (id) => `/payroll/payroll-runs/${id}/`,
      providesTags: (result, error, id) => [{ type: 'PayrollRun', id }]
    }),
    createPayrollRun: builder.mutation({
      query: (body) => ({
        url: '/payroll/payroll-runs/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['PayrollRun']
    }),
    processPayroll: builder.mutation({
      query: (id) => ({
        url: `/payroll/payroll-runs/${id}/process_payroll/`,
        method: 'POST'
      }),
      invalidatesTags: ['PayrollRun']
    }),
    approvePayroll: builder.mutation({
      query: (id) => ({
        url: `/payroll/payroll-runs/${id}/approve_payroll/`,
        method: 'POST'
      }),
      invalidatesTags: ['PayrollRun']
    }),
    markPayrollPaid: builder.mutation({
      query: (id) => ({
        url: `/payroll/payroll-runs/${id}/mark_paid/`,
        method: 'POST'
      }),
      invalidatesTags: ['PayrollRun']
    }),
    downloadTaxSheet: builder.query({
      query: (id) => ({
        url: `/payroll/payroll-runs/${id}/download_tax_sheet/`,
        responseHandler: (response) => response.text(),
      }),
    }),

    // ========== PAYSLIPS ==========
    getPayslips: builder.query({
      query: (params) => ({
        url: '/payroll/payslips/',
        params
      }),
      providesTags: ['Payslip']
    }),
    updatePayslip: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/payroll/payslips/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Payslip', 'PayrollRun']
    }),
    generatePayslipPdf: builder.mutation({
      query: (id) => ({
        url: `/payroll/payslips/${id}/generate_pdf/`,
        method: 'POST'
      }),
      invalidatesTags: ['Payslip']
    }),
    emailPayslip: builder.mutation({
      query: (id) => ({
        url: `/payroll/payslips/${id}/email_payslip/`,
        method: 'POST'
      })
    }),

    getTaxSettings: builder.query({
      query: () => '/payroll/tax-settings/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response[0] || {};
        if (response?.results && Array.isArray(response.results)) return response.results[0] || {};
        return response || {};
      },
      providesTags: ['TaxSettings']
    }),
    updateTaxSettings: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/payroll/tax-settings/${id}/`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['TaxSettings', 'PayrollRun']
    }),
    // --- Employee Stats and Managers ---
    getEmployeeStats: builder.query({
      query: () => '/employees/stats/',
      providesTags: ['Employee']
    }),
    getManagers: builder.query({
      query: () => '/employees/managers/',
      providesTags: ['Employee']
    }),
    // ========== SALARY ADVANCES ==========
    getSalaryAdvances: builder.query({
      query: (params) => ({
        url: '/payroll/salary-advances/',
        params
      }),
      transformResponse: (response) => {
        if (response?.results) return response.results
        if (Array.isArray(response)) return response
        return []
      },
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'SalaryAdvance', id })),
        { type: 'SalaryAdvance', id: 'LIST' }
      ]
    }),

    createSalaryAdvance: builder.mutation({
      query: (body) => ({
        url: '/payroll/salary-advances/',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'SalaryAdvance', id: 'LIST' }]
    }),

    updateSalaryAdvance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/payroll/salary-advances/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: [{ type: 'SalaryAdvance', id: 'LIST' }]
    }),

    approveSalaryAdvance: builder.mutation({
      query: (id) => ({
        url: `/payroll/salary-advances/${id}/approve/`,
        method: 'PATCH'
      }),
      invalidatesTags: ['SalaryAdvance']
    }),

    rejectSalaryAdvance: builder.mutation({
      query: (id) => ({
        url: `/payroll/salary-advances/${id}/reject/`,
        method: 'PATCH'
      }),
      invalidatesTags: ['SalaryAdvance']
    }),

    // --- My Profile ---
    getMyProfile: builder.query({
      query: () => '/employees/me/',
      providesTags: ['Employee']
    }),
    // --- Promote to Manager ---
    promoteToManager: builder.mutation({
      query: (data) => ({
        url: '/employees/promote_to_manager/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Employee']
    }),

    // ========== LEAVE MANAGEMENT ==========
    getLeaveRequests: builder.query({
      query: (params) => {
        if (typeof params === 'string') return params;
        return {
          url: '/leave/requests/',
          params
        };
      },
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['LeaveRequest']
    }),
    createLeaveRequest: builder.mutation({
      query: ({ url, body }) => ({
        url: url || '/leave/requests/',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['LeaveRequest']
    }),
    getMyLeaveRequests: builder.query({
      query: () => '/leave/requests/my_requests/',
      providesTags: ['LeaveRequest']
    }),
    getLeaveBalances: builder.query({
      query: () => '/leave/balances/my_balances/',
      providesTags: ['LeaveRequest'] // Re-fetch on request changes
    }),
    getLeaveTypes: builder.query({
      query: (params) => ({
        url: '/leave/types/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'LeaveType', id })),
            { type: 'LeaveType', id: 'LIST' }
          ]
          : [{ type: 'LeaveType', id: 'LIST' }]
    }),
    createLeaveType: builder.mutation({
      query: (data) => ({
        url: '/leave/types/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'LeaveType', id: 'LIST' }]
    }),
    updateLeaveType: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/leave/types/${id}/`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'LeaveType', id },
        { type: 'LeaveType', id: 'LIST' }
      ]
    }),
    deleteLeaveType: builder.mutation({
      query: (id) => ({
        url: `/leave/types/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'LeaveType', id: 'LIST' }]
    }),
    approveLeaveRequest: builder.mutation({
      query: (id) => ({
        url: `/leave/requests/${id}/approve/`,
        method: 'POST'
      }),
      invalidatesTags: ['LeaveRequest']
    }),
    rejectLeaveRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/leave/requests/${id}/reject/`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['LeaveRequest']
    }),
    getPublicHolidays: builder.query({
      query: (params) => ({
        url: '/leave/holidays/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['PublicHoliday']
    }),

    // ========== ATTENDANCE ==========
    clockIn: builder.mutation({
      query: (data) => ({
        url: '/attendance/records/clock_in/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Attendance']
    }),
    clockOut: builder.mutation({
      query: (data) => ({
        url: '/attendance/records/clock_out/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Attendance']
    }),
    getTodayAttendance: builder.query({
      query: () => '/attendance/records/today_status/',
      providesTags: ['Attendance']
    }),
    getMyAttendance: builder.query({
      query: (params) => ({
        url: '/attendance/records/my_attendance/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Attendance']
    }),
    getTeamAttendance: builder.query({
      query: () => '/attendance/records/team_attendance/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Attendance']
    }),

    // ========== PERFORMANCE MANAGEMENT ==========
    getPerformanceCycles: builder.query({
      query: (params) => ({
        url: '/performance/cycles/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['PerformanceCycle']
    }),
    createPerformanceCycle: builder.mutation({
      query: (body) => ({
        url: '/performance/cycles/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['PerformanceCycle']
    }),
    updatePerformanceCycle: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/performance/cycles/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['PerformanceCycle']
    }),
    deletePerformanceCycle: builder.mutation({
      query: (id) => ({
        url: `/performance/cycles/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['PerformanceCycle']
    }),

    request360: builder.mutation({
      query: (data) => ({
        url: '/performance/reviews/request_360/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['PerformanceCycle']
    }),

    // Goals
    getGoals: builder.query({
      query: (params) => ({
        url: '/performance/goals/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Goal', id })), { type: 'Goal', id: 'LIST' }] : [{ type: 'Goal', id: 'LIST' }]
    }),
    getTeamGoals: builder.query({
      query: () => '/performance/goals/team_goals/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Goal', id })), { type: 'Goal', id: 'LIST' }]
          : [{ type: 'Goal', id: 'LIST' }]
    }),
    createGoal: builder.mutation({
      query: (body) => ({
        url: '/performance/goals/',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Goal', id: 'LIST' }]
    }),
    updateGoal: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/performance/goals/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Goal', id }, { type: 'Goal', id: 'LIST' }]
    }),
    deleteGoal: builder.mutation({
      query: (id) => ({
        url: `/performance/goals/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Goal', id: 'LIST' }]
    }),

    // Reviews
    getReviews: builder.query({
      query: (params) => ({
        url: '/performance/reviews/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['PerformanceReview']
    }),
    getReviewStats: builder.query({
      query: () => '/performance/reviews/stats/',
      providesTags: ['PerformanceReview']
    }),
    createReview: builder.mutation({
      query: (body) => ({
        url: '/performance/reviews/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['PerformanceReview']
    }),
    updateReview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/performance/reviews/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['PerformanceReview']
    }),

    // ========== RECRUITMENT (ATS) ==========
    getJobs: builder.query({
      query: (params) => ({
        url: '/recruitment/jobs/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Job']
    }),
    getJob: builder.query({
      query: (id) => `/recruitment/jobs/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Job', id }]
    }),
    createJob: builder.mutation({
      query: (body) => ({
        url: '/recruitment/jobs/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Job']
    }),
    updateJob: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/recruitment/jobs/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Job']
    }),
    getCandidates: builder.query({
      query: (params) => ({
        url: '/recruitment/candidates/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Candidate']
    }),
    createCandidate: builder.mutation({
      query: (body) => ({
        url: '/recruitment/candidates/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Candidate']
    }),
    updateCandidate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/recruitment/candidates/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Candidate']
    }),
    parseResume: builder.mutation({
      query: (formData) => ({
        url: '/recruitment/candidates/parse_resume/',
        method: 'POST',
        body: formData,
      }),
    }),
    getApplications: builder.query({
      query: (params) => ({
        url: '/recruitment/applications/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Application']
    }),
    createApplication: builder.mutation({
      query: (body) => ({
        url: '/recruitment/applications/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Application']
    }),
    moveApplicationStage: builder.mutation({
      query: ({ id, stage }) => ({
        url: `/recruitment/applications/${id}/move_stage/`,
        method: 'PATCH',
        body: { stage }
      }),
      invalidatesTags: ['Application']
    }),
    screenWithAi: builder.mutation({
      query: (id) => ({
        url: `/recruitment/applications/${id}/screen_with_ai/`,
        method: 'POST'
      }),
      invalidatesTags: ['Application']
    }),
    rankJobApplications: builder.mutation({
      query: (job_id) => ({
        url: `/recruitment/applications/rank_job_applications/`,
        method: 'POST',
        body: { job_id }
      }),
      invalidatesTags: ['Application']
    }),
    getInterviews: builder.query({
      query: (params) => ({
        url: '/recruitment/interviews/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Interview']
    }),
    createInterview: builder.mutation({
      query: (body) => ({
        url: '/recruitment/interviews/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Interview']
    }),
    updateInterview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/recruitment/interviews/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Interview']
    }),
    deleteInterview: builder.mutation({
      query: (id) => ({
        url: `/recruitment/interviews/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Interview']
    }),
    getRecruitmentIntegrations: builder.query({
      query: () => '/recruitment/integrations/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['RecruitmentIntegration']
    }),
    updateRecruitmentIntegration: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/recruitment/integrations/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['RecruitmentIntegration']
    }),
    createRecruitmentIntegration: builder.mutation({
      query: (body) => ({
        url: '/recruitment/integrations/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['RecruitmentIntegration']
    }),
    testRecruitmentIntegration: builder.mutation({
      query: (id) => ({
        url: `/recruitment/integrations/${id}/test_connection/`,
        method: 'POST'
      })
    }),
    getPublicJobs: builder.query({
      query: (params) => ({
        url: '/recruitment/public/jobs/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['PublicJob']
    }),
    submitJobApplication: builder.mutation({
      query: (body) => ({
        url: '/recruitment/applications/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Application']
    }),
    publishJob: builder.mutation({
      query: ({ id, platforms }) => ({
        url: `/recruitment/jobs/${id}/publish/`,
        method: 'POST',
        body: { platforms }
      }),
      invalidatesTags: ['Job', 'JobPost']
    }),
    getOffers: builder.query({
      query: (params) => ({
        url: '/recruitment/offers/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['OfferLetter']
    }),
    createOffer: builder.mutation({
      query: (body) => ({
        url: '/recruitment/offers/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['OfferLetter']
    }),
    generateOfferPdf: builder.mutation({
      query: (id) => ({
        url: `/recruitment/offers/${id}/generate_pdf/`,
        method: 'POST'
      }),
      invalidatesTags: ['OfferLetter']
    }),

    // ========== TRAINING & DEVELOPMENT ==========
    getTrainingPrograms: builder.query({
      query: () => '/training/programs/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['TrainingProgram']
    }),
    createTrainingProgram: builder.mutation({
      query: (body) => ({
        url: '/training/programs/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['TrainingProgram']
    }),
    getTrainingSessions: builder.query({
      query: (params) => ({
        url: '/training/sessions/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['TrainingSession']
    }),
    createTrainingSession: builder.mutation({
      query: (body) => ({
        url: '/training/sessions/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['TrainingSession']
    }),
    getEnrollments: builder.query({
      query: (params) => ({
        url: '/training/enrollments/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Enrollment']
    }),
    enrollInTraining: builder.mutation({
      query: (body) => ({
        url: '/training/enrollments/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Enrollment']
    }),
    updateProgress: builder.mutation({
      query: ({ id, progress_percentage }) => ({
        url: `/training/enrollments/${id}/progress/`,
        method: 'POST',
        body: { progress_percentage }
      }),
      invalidatesTags: ['Enrollment']
    }),
    completeEnrollment: builder.mutation({
      query: (id) => ({
        url: `/training/enrollments/${id}/complete/`,
        method: 'POST'
      }),
      invalidatesTags: ['Enrollment']
    }),
    submitFeedback: builder.mutation({
      query: ({ id, feedback_text, feedback_rating }) => ({
        url: `/training/enrollments/${id}/feedback/`,
        method: 'POST',
        body: { feedback_text, feedback_rating }
      }),
      invalidatesTags: ['Enrollment']
    }),
    withdrawEnrollment: builder.mutation({
      query: (id) => ({
        url: `/training/enrollments/${id}/withdraw/`,
        method: 'POST'
      }),
      invalidatesTags: ['Enrollment']
    }),
    getMyStats: builder.query({
      query: () => '/training/dashboard/my_stats/',
      providesTags: ['TrainingStats']
    }),
    getMyCompliance: builder.query({
      query: () => '/training/dashboard/my_compliance/',
      providesTags: ['Compliance']
    }),

    // ========== BENEFITS ADMINISTRATION ==========
    getBenefitTypes: builder.query({
      query: () => '/benefits/types/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['BenefitType']
    }),
    createBenefitType: builder.mutation({
      query: (body) => ({
        url: '/benefits/types/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['BenefitType']
    }),
    updateBenefitType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/benefits/types/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['BenefitType']
    }),
    deleteBenefitType: builder.mutation({
      query: (id) => ({
        url: `/benefits/types/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['BenefitType']
    }),
    getEmployeeBenefits: builder.query({
      query: (params) => ({
        url: '/benefits/enrollments/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['EmployeeBenefit']
    }),
    createEmployeeBenefit: builder.mutation({
      query: (body) => ({
        url: '/benefits/enrollments/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['EmployeeBenefit']
    }),
    updateEmployeeBenefit: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/benefits/enrollments/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['EmployeeBenefit']
    }),
    deleteEmployeeBenefit: builder.mutation({
      query: (id) => ({
        url: `/benefits/enrollments/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['EmployeeBenefit']
    }),

    // ========== DOCUMENT MANAGEMENT ==========
    getFolders: builder.query({
      query: (params) => ({
        url: '/documents/folders/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Document']
    }),
    createFolder: builder.mutation({
      query: (body) => ({
        url: '/documents/folders/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Document']
    }),
    updateFolder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/documents/folders/${id}/`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Document']
    }),
    deleteFolder: builder.mutation({
      query: (id) => ({
        url: `/documents/folders/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Document']
    }),
    getDocuments: builder.query({
      query: (params) => ({
        url: '/documents/company/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Document']
    }),
    getStorageStats: builder.query({
      query: () => '/documents/company/storage_stats/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Document', 'EmployeeDocument']
    }),
    createDocument: builder.mutation({
      query: (body) => ({
        url: '/documents/company/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Document']
    }),
    updateDocument: builder.mutation({
      query: ({ id, data }) => ({
        url: `/documents/company/${id}/`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Document']
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/documents/company/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Document']
    }),
    getEmployeeDocuments: builder.query({
      query: (params) => ({
        url: '/documents/employee/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['EmployeeDocument']
    }),
    createEmployeeDocument: builder.mutation({
      query: (body) => ({
        url: '/documents/employee/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['EmployeeDocument']
    }),
    updateEmployeeDocument: builder.mutation({
      query: ({ id, data }) => ({
        url: `/documents/employee/${id}/`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['EmployeeDocument']
    }),
    deleteEmployeeDocument: builder.mutation({
      query: (id) => ({
        url: `/documents/employee/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['EmployeeDocument']
    }),

    // ========== OFFBOARDING & EXIT ==========
    getResignations: builder.query({
      query: (params) => ({
        url: '/offboarding/resignations/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Resignation']
    }),
    createResignation: builder.mutation({
      query: (body) => ({
        url: '/offboarding/resignations/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Resignation']
    }),
    updateResignation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/offboarding/resignations/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Resignation']
    }),
    getExitInterviews: builder.query({
      query: () => '/offboarding/interviews/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['ExitInterview']
    }),

    // ========== DISCIPLINARY ==========
    getDisciplinaryActions: builder.query({
      query: (params) => ({
        url: '/disciplinary/actions/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['DisciplinaryAction']
    }),
    createDisciplinaryAction: builder.mutation({
      query: (body) => ({
        url: '/disciplinary/actions/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['DisciplinaryAction']
    }),
    updateDisciplinaryAction: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/disciplinary/actions/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['DisciplinaryAction']
    }),
    submitDisciplinaryStatement: builder.mutation({
      query: ({ id, statement }) => ({
        url: `/disciplinary/actions/${id}/submit_statement/`,
        method: 'POST',
        body: { statement }
      }),
      invalidatesTags: ['DisciplinaryAction']
    }),

    // ========== EXPENSE MANAGEMENT ==========
    getExpenseCategories: builder.query({
      query: (params) => ({
        url: '/expense/categories/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['ExpenseCategory']
    }),
    getExpenseClaims: builder.query({
      query: (params) => ({
        url: '/expense/claims/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['ExpenseClaim']
    }),
    createExpenseClaim: builder.mutation({
      query: (body) => ({
        url: '/expense/claims/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['ExpenseClaim']
    }),
    updateExpenseClaim: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/expense/claims/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['ExpenseClaim']
    }),
    deleteExpenseClaim: builder.mutation({
      query: (id) => ({
        url: `/expense/claims/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['ExpenseClaim']
    }),

    // --- Accounts / Settings ---
    getUsers: builder.query({
      query: () => '/users/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['User'],
    }),
    getCompany: builder.query({
      query: (id) => `/companies/${id}/`,
      providesTags: ['Company'],
    }),
    updateCompany: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/companies/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Company'],
    }),
    // Notifications
    getNotifications: builder.query({
      query: () => '/notifications/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/mark_read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark_all_read/',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    // Announcement Endpoints
    getAnnouncements: builder.query({
      query: () => '/notifications/announcements/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Announcement']
    }),
    createAnnouncement: builder.mutation({
      query: (body) => ({
        url: '/notifications/announcements/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Announcement']
    }),
    updateAnnouncement: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/notifications/announcements/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Announcement']
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/notifications/announcements/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Announcement']
    }),

    // ========== ANALYTICS (Scheduled Reports) ==========
    getReportSchedules: builder.query({
      query: () => '/analytics/schedules/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['ReportSchedule']
    }),
    createReportSchedule: builder.mutation({
      query: (body) => ({
        url: '/analytics/schedules/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['ReportSchedule']
    }),
    deleteReportSchedule: builder.mutation({
      query: (id) => ({
        url: `/analytics/schedules/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['ReportSchedule']
    }),
    getDashboardPredictions: builder.query({
      query: () => '/analytics/schedules/dashboard_predictions/',
    }),

    // ========== ATTENDANCE ADVANCED ==========
    getAttendancePolicy: builder.query({
      query: () => '/attendance/policies/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['AttendancePolicy']
    }),
    updateAttendancePolicy: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/attendance/policies/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['AttendancePolicy']
    }),
    getWorkLocations: builder.query({
      query: () => '/attendance/locations/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['WorkLocation']
    }),
    createWorkLocation: builder.mutation({
      query: (body) => ({
        url: '/attendance/locations/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['WorkLocation']
    }),
    refreshWorkLocationQr: builder.mutation({
      query: (id) => ({
        url: `/attendance/locations/${id}/refresh_qr/`,
        method: 'POST'
      }),
      invalidatesTags: ['WorkLocation']
    }),

    // ========== GLOBAL INTEGRATIONS ==========
    getIntegrations: builder.query({
      query: () => '/integrations/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Integration']
    }),
    getIntegrationStatus: builder.query({
      query: () => '/integrations/status/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Integration']
    }),
    createIntegration: builder.mutation({
      query: (body) => ({
        url: '/integrations/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Integration']
    }),
    updateIntegration: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/integrations/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Integration']
    }),
    testIntegration: builder.mutation({
      query: (id) => ({
        url: `/integrations/${id}/test_connection/`,
        method: 'POST'
      })
    }),
    deleteIntegration: builder.mutation({
      query: (id) => ({
        url: `/integrations/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Integration']
    }),
    // --- Assets ---
    getAssetCategories: builder.query({
      query: (params) => ({ url: '/assets/categories/', params }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['AssetCategory']
    }),
    createAssetCategory: builder.mutation({
      query: (data) => ({ url: '/assets/categories/', method: 'POST', body: data }),
      invalidatesTags: ['AssetCategory']
    }),
    getAssets: builder.query({
      query: (params) => ({ url: '/assets/items/', params }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Asset']
    }),
    getAsset: builder.query({
      query: (id) => `/assets/items/${id}/`,
      providesTags: ['Asset']
    }),
    createAsset: builder.mutation({
      query: (data) => ({ url: '/assets/items/', method: 'POST', body: data }),
      invalidatesTags: ['Asset']
    }),
    updateAsset: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/assets/items/${id}/`, method: 'PATCH', body: data }),
      invalidatesTags: ['Asset']
    }),
    deleteAsset: builder.mutation({
      query: (id) => ({ url: `/assets/items/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Asset']
    }),
    assignAsset: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/assets/items/${id}/assign/`, method: 'POST', body: data }),
      invalidatesTags: ['Asset', 'AssetAssignment']
    }),
    returnAsset: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/assets/items/${id}/return_asset/`, method: 'POST', body: data }),
      invalidatesTags: ['Asset', 'AssetAssignment']
    }),
    getAssetAssignments: builder.query({
      query: (params) => ({ url: '/assets/assignments/', params }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['AssetAssignment']
    }),
    // --- Digital Forms ---
    getFormTemplates: builder.query({
      query: (params) => ({ url: '/forms/templates/', params }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['FormTemplate']
    }),
    createFormTemplate: builder.mutation({
      query: (data) => ({ url: '/forms/templates/', method: 'POST', body: data }),
      invalidatesTags: ['FormTemplate']
    }),
    getFormSubmissions: builder.query({
      query: (params) => ({ url: '/forms/submissions/', params }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['FormSubmission']
    }),
    createFormSubmission: builder.mutation({
      query: (data) => ({ url: '/forms/submissions/', method: 'POST', body: data }),
      invalidatesTags: ['FormSubmission']
    }),
    reviewFormSubmission: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/forms/submissions/${id}/review/`, method: 'POST', body: data }),
      invalidatesTags: ['FormSubmission']
    }),
    updateFormTemplate: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/forms/templates/${id}/`, method: 'PATCH', body: data }),
      invalidatesTags: ['FormTemplate']
    }),
    deleteFormTemplate: builder.mutation({
      query: (id) => ({ url: `/forms/templates/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['FormTemplate']
    }),
    // --- Surveys & Pulse ---
    getSurveys: builder.query({
      query: (params) => ({ url: '/surveys/surveys/', params }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Survey']
    }),
    createSurvey: builder.mutation({
      query: (data) => ({ url: '/surveys/surveys/', method: 'POST', body: data }),
      invalidatesTags: ['Survey']
    }),
    getSurveyAnalytics: builder.query({
      query: (id) => `/surveys/surveys/${id}/analytics/`,
      providesTags: (result, error, id) => [{ type: 'Survey', id }]
    }),
    createSurveyResponse: builder.mutation({
      query: (data) => ({ url: '/surveys/responses/', method: 'POST', body: data }),
      invalidatesTags: ['Survey', 'SurveyResponse']
    }),
    updateSurvey: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/surveys/surveys/${id}/`, method: 'PATCH', body: data }),
      invalidatesTags: ['Survey']
    }),
    deleteSurvey: builder.mutation({
      query: (id) => ({ url: `/surveys/surveys/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Survey']
    }),
    // --- GCC Compliance ---
    getGCCSettings: builder.query({
      query: () => '/gcc/settings/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return response || {};
      },
      providesTags: ['GCCSettings']
    }),
    updateGCCSettings: builder.mutation({
      query: (data) => ({ url: '/gcc/settings/', method: 'POST', body: data }),
      invalidatesTags: ['GCCSettings']
    }),
    getGratuityRecords: builder.query({
      query: () => '/gcc/gratuity/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Gratuity']
    }),
    // --- Digital Signatures ---
    getDocumentSignatures: builder.query({
      query: () => '/documents/signatures/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['DocumentSignature']
    }),
    signDocument: builder.mutation({
      query: (data) => ({ url: '/documents/signatures/', method: 'POST', body: data }),
      invalidatesTags: ['DocumentSignature', 'EmployeeDocument', 'Document']
    }),
    // --- AI Assistant ---
    getChatSessions: builder.query({
      query: () => '/bot/chats/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['ChatSession']
    }),
    createChatSession: builder.mutation({
      query: (data) => ({ url: '/bot/chats/', method: 'POST', body: data }),
      invalidatesTags: ['ChatSession']
    }),
    sendChatMessage: builder.mutation({
      query: ({ id, content }) => ({ url: `/bot/chats/${id}/send_message/`, method: 'POST', body: { content } }),
      invalidatesTags: ['ChatSession']
    }),

    // ========== OVERTIME ==========
    getOvertimeRequests: builder.query({
      query: (params) => ({
        url: '/attendance/overtime/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Overtime']
    }),
    getMyOvertimeRequests: builder.query({
      query: () => '/attendance/overtime/my_requests/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: ['Overtime']
    }),
    createOvertimeRequest: builder.mutation({
      query: (body) => ({
        url: '/attendance/overtime/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Overtime']
    }),
    approveOvertimeRequest: builder.mutation({
      query: (id) => ({
        url: `/attendance/overtime/${id}/approve/`,
        method: 'POST'
      }),
      invalidatesTags: ['Overtime']
    }),
    rejectOvertimeRequest: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/attendance/overtime/${id}/reject/`,
        method: 'POST',
        body: { reason }
      }),
      invalidatesTags: ['Overtime']
    }),
  })
});

// Export hooks (unchanged)
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  // payroll & salary hooks
  useGetPayrollRunsQuery,
  useGetPayrollRunQuery, // Added
  useCreatePayrollRunMutation,
  useProcessPayrollMutation, // Added
  useApprovePayrollMutation, // Added
  useMarkPayrollPaidMutation, // Added
  useLazyDownloadTaxSheetQuery, // Added
  useGetPayslipsQuery, // Added
  useUpdatePayslipMutation, // Added
  useGeneratePayslipPdfMutation,
  useEmailPayslipMutation,
  useGetSalaryStructuresQuery,
  useCreateSalaryStructureMutation,
  useUpdateSalaryStructureMutation,
  useDeleteSalaryStructureMutation,
  // employee stats and managers hooks
  useGetEmployeeStatsQuery,
  useGetTaxSettingsQuery,
  useUpdateTaxSettingsMutation,

  useGetMyProfileQuery,
  // promote to manager hook
  usePromoteToManagerMutation,
  useGetSalaryAdvancesQuery,
  useUpdateSalaryAdvanceMutation,
  // leave hooks
  useGetLeaveRequestsQuery,
  useGetMyLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useGetLeaveBalancesQuery,
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
  useGetPublicHolidaysQuery,
  // attendance hooks
  useClockInMutation,
  useClockOutMutation,
  useGetTodayAttendanceQuery,
  useGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  // Performance
  useGetPerformanceCyclesQuery,
  useCreatePerformanceCycleMutation,
  useUpdatePerformanceCycleMutation,
  useDeletePerformanceCycleMutation,
  useRequest360Mutation,
  useGetGoalsQuery,
  useDeleteGoalMutation,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useGetTeamGoalsQuery,
  useGetReviewsQuery,
  useGetReviewStatsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  // Recruitment
  useGetJobsQuery,
  useGetJobQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useGetCandidatesQuery,
  useCreateCandidateMutation,
  useUpdateCandidateMutation,
  useParseResumeMutation,
  useGetApplicationsQuery,
  useCreateApplicationMutation,
  useMoveApplicationStageMutation,
  useScreenWithAiMutation,
  useRankJobApplicationsMutation,
  useGetInterviewsQuery,
  useCreateInterviewMutation,
  useUpdateInterviewMutation,
  useDeleteInterviewMutation,
  useGetRecruitmentIntegrationsQuery,
  useCreateRecruitmentIntegrationMutation,
  useUpdateRecruitmentIntegrationMutation,
  useTestRecruitmentIntegrationMutation,
  usePublishJobMutation,
  useGetPublicJobsQuery,
  useSubmitJobApplicationMutation,
  useGetOffersQuery,
  useCreateOfferMutation,
  useGenerateOfferPdfMutation,
  // Training
  useGetTrainingProgramsQuery,
  useCreateTrainingProgramMutation,
  useGetTrainingSessionsQuery,
  useCreateTrainingSessionMutation,
  useGetEnrollmentsQuery,
  useEnrollInTrainingMutation,
  useUpdateProgressMutation,
  useCompleteEnrollmentMutation,
  useSubmitFeedbackMutation,
  useWithdrawEnrollmentMutation,
  useGetMyStatsQuery,
  useGetMyComplianceQuery,
  // Benefits
  useGetBenefitTypesQuery,
  useCreateBenefitTypeMutation,
  useUpdateBenefitTypeMutation,
  useDeleteBenefitTypeMutation,
  useGetEmployeeBenefitsQuery,
  useCreateEmployeeBenefitMutation,
  useUpdateEmployeeBenefitMutation,
  useDeleteEmployeeBenefitMutation,
  // Documents
  useGetFoldersQuery,
  useGetStorageStatsQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useGetEmployeeDocumentsQuery,
  useCreateEmployeeDocumentMutation,
  useUpdateEmployeeDocumentMutation,
  useDeleteEmployeeDocumentMutation,
  // Offboarding
  useGetResignationsQuery,
  useCreateResignationMutation,
  useUpdateResignationMutation,
  useGetExitInterviewsQuery,
  // Disciplinary
  useGetDisciplinaryActionsQuery,
  useCreateDisciplinaryActionMutation,
  useUpdateDisciplinaryActionMutation,
  useSubmitDisciplinaryStatementMutation,
  useGetUsersQuery,
  useGetCompanyQuery,
  useUpdateCompanyMutation,
  // Expense Hooks
  useGetExpenseCategoriesQuery,
  useGetExpenseClaimsQuery,
  useCreateExpenseClaimMutation,
  useUpdateExpenseClaimMutation,
  useDeleteExpenseClaimMutation,
  // Salary Advances
  useCreateSalaryAdvanceMutation,
  useApproveSalaryAdvanceMutation,
  useRejectSalaryAdvanceMutation,
  // Org Structure
  useGetManagersQuery,
  // Notifications
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  // Announcements
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  // Analytics
  useGetReportSchedulesQuery,
  useCreateReportScheduleMutation,
  useDeleteReportScheduleMutation,
  useGetDashboardPredictionsQuery,
  // Attendance Advanced
  useGetAttendancePolicyQuery,
  useUpdateAttendancePolicyMutation,
  useGetWorkLocationsQuery,
  useCreateWorkLocationMutation,
  useRefreshWorkLocationQrMutation,
  // Global Integrations
  useGetIntegrationsQuery,
  useGetIntegrationStatusQuery,
  useCreateIntegrationMutation,
  useUpdateIntegrationMutation,
  useTestIntegrationMutation,
  useDeleteIntegrationMutation,
  // Security
  useSetup2FAQuery,
  useEnable2FAMutation,
  useDisable2FAMutation,
  useGetSecurityLogsQuery,
  useExportDataQuery,
  useRegisterPushSubscriptionMutation,
  // Password Reset
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useVerifyResetTokenMutation,
  // Assets
  useGetAssetCategoriesQuery,
  useCreateAssetCategoryMutation,
  useGetAssetsQuery,
  useGetAssetQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useAssignAssetMutation,
  useReturnAssetMutation,
  useGetAssetAssignmentsQuery,
  // Digital Forms
  useGetFormTemplatesQuery,
  useCreateFormTemplateMutation,
  useGetFormSubmissionsQuery,
  useCreateFormSubmissionMutation,
  useReviewFormSubmissionMutation,
  useUpdateFormTemplateMutation,
  useDeleteFormTemplateMutation,
  // Surveys
  useGetSurveysQuery,
  useCreateSurveyMutation,
  useGetSurveyAnalyticsQuery,
  useCreateSurveyResponseMutation,
  useUpdateSurveyMutation,
  useDeleteSurveyMutation,
  // GCC
  useGetGCCSettingsQuery,
  useUpdateGCCSettingsMutation,
  useGetGratuityRecordsQuery,
  // Signatures
  useGetDocumentSignaturesQuery,
  useSignDocumentMutation,
  // AI Bot
  useGetChatSessionsQuery,
  useCreateChatSessionMutation,
  useSendChatMessageMutation,
  // Overtime
  useGetOvertimeRequestsQuery,
  useGetMyOvertimeRequestsQuery,
  useCreateOvertimeRequestMutation,
  useApproveOvertimeRequestMutation,
  useRejectOvertimeRequestMutation,
} = api;

export default api;
