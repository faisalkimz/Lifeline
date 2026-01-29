import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import hero1 from '../assets/auth_hero_1.png';
import hero2 from '../assets/auth_hero_2.png';
import { motion, AnimatePresence } from 'framer-motion';

const AuthLayout = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const isLogin = location.pathname === '/login';
    const isRegister = location.pathname === '/register';

    // Default to hero1 for login/other, hero2 for register
    const currentImage = isRegister ? hero2 : hero1;

    // Dynamic text content based on route
    const heroContent = isRegister ? {
        title: "Join the future of work.",
        subtitle: "Experience the all-in-one platform that transforms how you manage your team, payroll, and culture."
    } : {
        title: "Welcome back.",
        subtitle: "Your workspace is ready. detailed insights and management tools are just a click away."
    };

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 font-sans selection:bg-primary-500/30">
            {/* Left Side - Immersive Hero */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 z-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
                        <div className="absolute inset-0 bg-primary-900/20 mix-blend-overlay z-10" />
                        <img
                            src={currentImage}
                            alt="Auth Hero"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-0 left-0 w-full p-16 z-20 text-white">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">
                                {heroContent.title}
                            </h1>
                            <p className="text-slate-300 text-lg max-w-md leading-relaxed font-medium">
                                {heroContent.subtitle}
                            </p>

                            <div className="mt-8 flex gap-3">
                                <div className="h-1.5 w-16 bg-primary-500 rounded-full" />
                                <div className="h-1.5 w-4 bg-white/20 rounded-full" />
                                <div className="h-1.5 w-4 bg-white/20 rounded-full" />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative overflow-y-auto">
                <div className="w-full max-w-[420px] mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
