import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../features/auth/authSlice';

const baseQueryWithAuth = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL || '/api'}`,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;
        const isAuthenticated = getState().auth.isAuthenticated;

        if (isAuthenticated && token) {
            headers.set('authorization', `Bearer ${token}`);
        }

        return headers;
    }
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQueryWithAuth(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        api.dispatch(logout());
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    return result;
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Company', 'Department', 'Employee'],
    endpoints: (builder) => ({
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
        getEmployees: builder.query({
            query: (params) => ({
                url: '/employees/',
                params
            }),
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
                method: 'PUT',
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
        getEmployeeStats: builder.query({
            query: () => '/employees/stats/',
            providesTags: [{ type: 'Employee', id: 'STATS' }]
        }),
        getMyProfile: builder.query({
            query: () => '/employees/me/',
            providesTags: [{ type: 'Employee', id: 'PROFILE' }]
        }),
        getManagers: builder.query({
            query: () => '/employees/managers/',
            providesTags: [{ type: 'Employee', id: 'MANAGERS' }]
        }),
        getDepartments: builder.query({
            query: () => '/departments/',
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
        })
    })
});

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
    useGetEmployeeStatsQuery,
    useGetMyProfileQuery,
    useGetManagersQuery,
    useGetDepartmentsQuery,
    useGetDepartmentQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation
} = api;
