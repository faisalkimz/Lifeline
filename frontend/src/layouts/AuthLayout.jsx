import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Redirect to dashboard if already logged in
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
            {/* Left Side - Brand & Marketing */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary-900 dark:bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-lg text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-10 flex justify-center"
                    >
                        <div className="h-24 w-24 bg-white/10 dark:bg-primary-500/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/20 dark:border-primary-500/20 shadow-2xl">
                            <Building2 className="h-12 w-12 text-white" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl font-black text-white mb-8 tracking-tighter leading-[1.1]"
                    >
                        The Future of <br />
                        <span className="text-primary-400">Workforce Management</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-primary-100/80 text-xl leading-relaxed font-medium"
                    >
                        Empower your team with Africa's most intuitive HR & Payroll system.
                        Simplified, secure, and built for scale.
                    </motion.p>

                    {/* Trust Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-16 pt-10 border-t border-white/10"
                    >
                        <p className="text-[11px] text-primary-300 font-bold uppercase tracking-[0.3em]">
                            Powering Enterprises Across Uganda
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form Area */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
