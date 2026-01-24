import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectCurrentUser } from '../features/auth/authSlice';

/**
 * Protected Route Component
 * Restricts access to routes based on user role.
 * 
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
    const user = useSelector(selectCurrentUser);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // If user doesn't have required role, redirect to dashboard or unauthorized page
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
