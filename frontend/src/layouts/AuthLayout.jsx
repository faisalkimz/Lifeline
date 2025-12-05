import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { Building2 } from 'lucide-react';

const AuthLayout = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Redirect to dashboard if already logged in
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Brand & Marketing */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary-900 relative overflow-hidden items-center justify-center">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative z-10 max-w-lg px-12 text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="h-20 w-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <Building2 className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">
                        Manage your workforce with confidence
                    </h1>
                    <p className="text-primary-100 text-lg leading-relaxed">
                        The complete HR solution for modern companies. Streamline payroll,
                        track attendance, and manage employee data in one secure platform.
                    </p>

                    {/* Testimonial or Trust Indicator */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <p className="text-sm text-primary-200 font-medium">
                            TRUSTED BY FORWARD-THINKING COMPANIES IN UGANDA
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Area */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
