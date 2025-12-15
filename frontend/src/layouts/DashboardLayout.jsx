import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../store/api';
import {
  LayoutDashboard, Users, Building2, Settings, LogOut, Menu, X, Bell,
  TrendingUp, User, Crown, CreditCard, Calendar, Clock, ClipboardCheck,
  Briefcase, BookOpen, Shield, FileText, Search, ChevronDown, HelpCircle,
  Building
} from 'lucide-react';
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
    { name: 'People', href: '/employees', icon: Users },
    { name: 'Payroll', href: '/payroll', icon: CreditCard },
    { name: 'Leaves', href: '/leave', icon: Calendar },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Performance', href: '/performance', icon: TrendingUp },
    { name: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { name: 'Training', href: '/training', icon: BookOpen },
    { name: 'Benefits', href: '/benefits', icon: Shield },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Org Chart', href: '/org-chart', icon: TrendingUp },
  ];

  const adminLinks = [
    { name: 'Company Settings', href: '/settings', icon: Settings },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Managers', href: '/managers', icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - Workpay Dark Theme */}
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
            <span className="text-xl font-bold text-white tracking-tight">Lifeline</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
          {/* Main Modules */}
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Modules</p>
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

          {/* Admin Section */}
          {user.role !== 'employee' && (
            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Administration</p>
              <nav className="space-y-1">
                {adminLinks.map((item) => {
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
          )}
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

        {/* Top Header - White & Clean */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500">
              <Menu className="h-6 w-6" />
            </button>

            {/* Context Switcher (Platform mimic) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-primary-300 transition-colors">
              <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                L
              </div>
              <span className="text-sm font-medium text-slate-700">Lifeline Tech</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-64"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

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

export default DashboardLayout;
