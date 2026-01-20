import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { useLogoutMutation, useGetEmployeeStatsQuery } from '../store/api';
import NotificationsPopover from '../components/notifications/NotificationsPopover';
import { getMediaUrl } from '../config/api';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard, Users, Building2, Settings, LogOut, Menu, X, Bell,
  TrendingUp, User, Crown, CreditCard, Calendar, Clock, ClipboardCheck,
  Briefcase, BookOpen, Shield, FileText, Search, ChevronDown, HelpCircle,
  Building, LayoutGrid, ChevronRight, Activity, Zap, DollarSign, Moon, Sun, Laptop, Box, FileEdit, Heart, Globe
} from 'lucide-react';
import { cn } from '../utils/cn';
import ChatWidget from '../components/common/ChatWidget';

const DashboardLayout = () => {
  const user = useSelector(selectCurrentUser);
  const refresh = useSelector(state => state?.auth?.refresh);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  // Fetch Stats for Sidebar
  const { data: stats } = useGetEmployeeStatsQuery(undefined, {
    pollingInterval: 30000, // Refresh stats every 30s
  });

  const getImageUrl = (path) => {
    return getMediaUrl(path);
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await logoutApi(refresh).unwrap();
    } catch (err) {
      // Silently fail as we are clearing local state anyway
    } finally {
      dispatch(logout());
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Payroll', href: '/payroll', icon: CreditCard },
    { name: 'GCC Compliance', href: '/gcc', icon: Globe },
    { name: 'Leave', href: '/leave', icon: Calendar },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Performance', href: '/performance', icon: TrendingUp },
    { name: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { name: 'Training', href: '/training', icon: BookOpen },
    { name: 'Expenses', href: '/expenses', icon: DollarSign },
    { name: 'Benefits', href: '/benefits', icon: Shield },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Assets', href: '/assets', icon: Laptop },
    { name: 'Forms', href: '/forms', icon: FileEdit },
    { name: 'Surveys', href: '/surveys', icon: Heart },
    { name: 'Org Chart', href: '/org-chart', icon: LayoutGrid },
  ];

  const adminLinks = [
    { name: 'Company Settings', href: '/settings', icon: Settings },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Managers', href: '/managers', icon: Crown },
    { name: 'Disciplinary', href: '/disciplinary', icon: Shield },
  ];

  const StatItem = ({ label, value, trend, icon: Icon, colorClass }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClass)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold leading-none mb-1">{label}</p>
          <p className="text-sm font-bold text-white leading-none">{value || 0}</p>
        </div>
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-md">
          {trend}
        </span>
      )}
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - Workpay Dark Theme (Stays Dark in both modes) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col shrink-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/20">
              <Building className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Lifeline</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto pt-6 px-3 space-y-8 scrollbar-hide">
          {/* Main Modules */}
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Human Resources</p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
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
          </div>

          {/* Admin Section */}
          {user.role !== 'employee' && (
            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Administration</p>
              <nav className="space-y-1">
                {adminLinks.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
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
            </div>
          )}


        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 p-0.5 overflow-hidden transition-transform hover:scale-105">
              {user.photo ? (
                <img src={getImageUrl(user.photo)} alt="Profile" className="h-full w-full object-cover rounded-lg" />
              ) : (
                <div className="h-full w-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold rounded-lg uppercase">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-none mb-1">{user.first_name} {user.last_name}</p>
              <p className="text-[10px] font-semibold text-slate-500 truncate uppercase tracking-tight">{user.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Top Header - Fixed & Clean */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 shadow-sm z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>

            {/* Context Switcher (Platform mimic) */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 hover:bg-white dark:hover:bg-slate-800 transition-all group">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                L
              </div>
              <div className="pr-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter block leading-none mb-0.5">Company</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block leading-none">{user.company_name || 'Lifeline Tech'}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-48 lg:w-64 transition-all focus:bg-white dark:focus:bg-slate-900 focus:w-80"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              to="/help"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Help & Support"
            >
              <HelpCircle className="h-5 w-5" />
            </Link>
            <NotificationsPopover />
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-6 lg:p-10 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;
