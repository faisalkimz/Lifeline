import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../store/api';
import {
    LayoutDashboard, FileText, Calendar, Clock, User, LogOut, Menu, X,
    Bell, HelpCircle, Building, CreditCard, Activity, BookOpen, Shield
} from 'lucide-react';
import { cn } from '../utils/cn';

const EmployeePortalLayout = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const [logoutApi] = useLogoutMutation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const refresh = useSelector(state => state?.auth?.refresh);

    const handleLogout = async () => {
        try {
            // Only call logout API if we have a refresh token
            if (refresh) {
                await logoutApi(refresh).unwrap();
            }
        } catch (err) {
            // Silently fail as we are clearing local state anyway
            console.warn('Logout API call failed (this is OK):', err);
        } finally {
            // Always clear local state
            dispatch(logout());
        }
    };

    const navigation = [
        { name: 'My Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
        { name: 'My Payslips', href: '/employee/payslips', icon: CreditCard },
        { name: 'My Leave', href: '/employee/leave', icon: Calendar },
        { name: 'My Attendance', href: '/employee/attendance', icon: Clock },
        { name: 'My Performance', href: '/employee/performance', icon: Activity },
        { name: 'My Training', href: '/employee/training', icon: BookOpen },
        { name: 'My Benefits', href: '/employee/benefits', icon: Shield },
        { name: 'My Documents', href: '/employee/documents', icon: FileText },
        { name: 'My Profile', href: '/employee/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar - Premium WorkPay Theme */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col shrink-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-white/5 bg-slate-900">
                    <Link to="/employee/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/20">
                            <Building className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-white tracking-tight">Lifeline</span>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">Portal</p>
                        </div>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto pt-6 px-3 scrollbar-hide">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group',
                                        isActive
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    )}
                                >
                                    <item.icon className={cn('h-4 w-4 transition-colors', isActive ? 'text-white' : 'text-slate-500 group-hover:text-white')} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Fun Widget Placeholder */}
                    <div className="mt-8 px-3">
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
                            <HelpCircle className="h-8 w-8 text-primary-500 mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Need Help?</p>
                            <Link to="/help" className="text-[10px] font-black text-primary-500 hover:underline">VISIT KNOWLEDGE BASE</Link>
                        </div>
                    </div>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/5 bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-primary-900/20 uppercase">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate leading-none mb-1">{user.first_name} {user.last_name}</p>
                            <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tight">{user.role?.replace('_', ' ')}</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Logout">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest border-l-2 border-primary-500 pl-4 h-5 flex items-center">
                            Employee Self-Service
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link to="/help" className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                            <HelpCircle className="h-5 w-5" />
                        </Link>
                        <button className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                    </div>
                </header>

                {/* Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeePortalLayout;
