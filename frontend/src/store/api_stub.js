import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/',
    prepareHeaders: (headers) => {
        const token = getAuthToken();
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQuery,
    tagTypes: ['Employees', 'Candidates', 'Jobs', 'LeaveRequests', 'Benefits', 'Payroll', 'Attendance', 'Performance', 'Announcements'],
    endpoints: (builder) => ({
        // ... existing endpoints (implicitly defined in other files injecting endpoints) ...
    }),
});

// We can inject endpoints here or in separate files. For now keeping it simple as I don't have the full file content of api.js
// user is injecting from other files usually.
// But wait, the previous `view_file` showed imports like `useGetEmployeeStatsQuery`.
// I need to find where `useGetEmployeeStatsQuery` is defined.
// It is likely in `frontend/src/store/api.js`.
