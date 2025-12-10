import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../features/auth/authSlice';

// Enhanced base query with authentication error handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL || '/api'}`,
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
  tagTypes: ['User', 'Company', 'Department', 'Employee', 'PayrollRun', 'SalaryStructure', 'SalaryAdvance', 'LeaveRequest', 'Attendance'],
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
    // --- Employees (existing) ---
    getEmployees: builder.query({
      query: (params) => ({
        url: '/employees/',
        params
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return response || [];
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
        return response || [];
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
    // --- Payroll Runs (NEW) ---
    getPayrollRuns: builder.query({
      query: () => '/payroll-runs/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return response || [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'PayrollRun', id })),
            { type: 'PayrollRun', id: 'LIST' }
          ]
          : [{ type: 'PayrollRun', id: 'LIST' }]
    }),
    createPayrollRun: builder.mutation({
      query: (data) => ({
        url: '/payroll-runs/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'PayrollRun', id: 'LIST' }]
    }),
    // --- Salary Structures (NEW) ---
    getSalaryStructures: builder.query({
      query: () => '/salary-structures/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return response || [];
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
        url: '/salary-structures/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'SalaryStructure', id: 'LIST' }]
    }),
    updateSalaryStructure: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/salary-structures/${id}/`,
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
        url: `/salary-structures/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'SalaryStructure', id: 'LIST' }]
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
    // --- FIXED: Salary Advances ---
    getSalaryAdvances: builder.query({
      query: () => '/salary-advances/',
      // FIXED: Better transform with logging
      transformResponse: (response) => {
        console.log('[API] Raw salary-advances response:', response);
        if (response?.results && Array.isArray(response.results)) {
          console.log('[API] Using paginated results:', response.results.length);
          return response.results;
        }
        if (Array.isArray(response)) {
          console.log('[API] Using direct array:', response.length);
          return response;
        }
        console.warn('[API] Unexpected response format, returning empty:', response);
        return [];
      },
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'SalaryAdvance', id })),
        { type: 'SalaryAdvance', id: 'LIST' }
      ]
    }),
    createSalaryAdvance: builder.mutation({
      query: (data) => ({
        url: '/salary-advances/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'SalaryAdvance', id: 'LIST' }]  // FIXED: Now works with tagTypes
    }),
    updateSalaryAdvance: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/salary-advances/${id}/`,
        method: 'PATCH',
        body: patch
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalaryAdvance', id },
        { type: 'SalaryAdvance', id: 'LIST' }
      ]
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
      query: (url) => url || '/leave/requests/',
      providesTags: ['LeaveRequest']
    }),
    createLeaveRequest: builder.mutation({
      query: ({ url, body }) => ({
        url: url || '/leave/requests/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['LeaveRequest']
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
    })
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
  useCreatePayrollRunMutation,
  useGetSalaryStructuresQuery,
  useCreateSalaryStructureMutation,
  useUpdateSalaryStructureMutation,
  useDeleteSalaryStructureMutation,
  // employee stats and managers hooks
  useGetEmployeeStatsQuery,
  useGetManagersQuery,
  // my profile hook
  useGetMyProfileQuery,
  // promote to manager hook
  usePromoteToManagerMutation,
  useGetSalaryAdvancesQuery,
  useCreateSalaryAdvanceMutation,
  useUpdateSalaryAdvanceMutation,
  // leave hooks
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  // attendance hooks
  useClockInMutation,
  useClockOutMutation,
  useGetTodayAttendanceQuery,
} = api;
export default api;