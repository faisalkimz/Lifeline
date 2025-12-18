import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../store/api';

// Try to load token from localStorage
const token = localStorage.getItem('token');
const refresh = localStorage.getItem('refresh');
const user = JSON.parse(localStorage.getItem('user') || 'null');

const initialState = {
    user: user,
    token: token,
    refresh: refresh,
    isAuthenticated: !!token,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token, refresh } = action.payload;
            state.user = user;
            state.token = token;
            state.refresh = refresh;
            state.isAuthenticated = true;

            // Persist to localStorage
            localStorage.setItem('token', token);
            if (refresh) localStorage.setItem('refresh', refresh);
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refresh = null;
            state.isAuthenticated = false;

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
