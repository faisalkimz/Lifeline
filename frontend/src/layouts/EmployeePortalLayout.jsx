import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../store/api';
import {
    LayoutDashboard, FileText, Calendar, Clock, User, LogOut, Menu, X,
    Bell, HelpCircle, Building, CreditCard
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

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap();
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            dispatch(logout());
        }
    };

    const navigation = [
        { name: 'My Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
        { name: 'My Payslips', href: '/employee/payslips', icon: CreditCard },
        { name: 'My Leave', href: '/employee/leave', icon: Calendar },
        { name: 'My Attendance', href: '/employee/attendance', icon: Clock },
        { name: 'My Documents', href: '/employee/documents', icon: FileText },
        { name: 'My Profile', href: '/employee/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-white tracking-tight">Lifeline</span>
                            <p className="text-xs text-slate-400">Employee Portal</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary-600 text-white'
                                            : 'hover:bg-slate-800 hover:text-white'
                                    )}
                                >
                                    <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-slate-400')} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{user.role?.replace('_', ' ')}</p>
                        </div>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-white" title="Logout">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500">
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-900">Employee Self-Service</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-slate-500 hover:text-primary-600">
                            <HelpCircle className="h-5 w-5" />
                        </button>
                        <button className="text-slate-500 hover:text-primary-600 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                    </div>
                </header>

                {/* Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeePortalLayout;
