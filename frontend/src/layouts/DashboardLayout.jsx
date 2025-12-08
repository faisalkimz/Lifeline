import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../store/api';
import { LayoutDashboard, Users, Building2, Settings, LogOut, Menu, X, Bell, TrendingUp, User, Crown, CreditCard } from 'lucide-react';
import { cn } from '../utils/cn';

const DashboardLayout = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/my-profile', icon: User },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Managers', href: '/managers', icon: Crown },
    { name: 'Org Chart', href: '/org-chart', icon: TrendingUp },
    { name: 'Payroll', href: '/payroll', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LahHR</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-primary-600' : 'text-gray-400')} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button className="text-gray-400 hover:text-gray-500 relative transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-error-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
