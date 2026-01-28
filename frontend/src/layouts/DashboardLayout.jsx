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
import { ROLES, PERMISSIONS } from '../utils/rbac';

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
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Employees', href: '/employees', icon: Users, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER, ROLES.MANAGER] },
    { name: 'Payroll', href: '/payroll', icon: CreditCard, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'GCC Compliance', href: '/gcc', icon: Globe, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Leave', href: '/leave', icon: Calendar },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Performance', href: '/performance', icon: Activity },
    { name: 'Recruitment', href: '/recruitment', icon: Briefcase, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER, ROLES.MANAGER] },
    { name: 'Training', href: '/training', icon: BookOpen },
    { name: 'Expenses', href: '/expenses', icon: DollarSign },
    { name: 'Benefits', href: '/benefits', icon: Shield },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Assets', href: '/assets', icon: Laptop, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Forms', href: '/forms', icon: FileEdit, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Surveys', href: '/surveys', icon: Heart },
    { name: 'Org Chart', href: '/org-chart', icon: LayoutGrid },
  ].filter(item => !item.roles || item.roles.includes(user.role));

  const adminLinks = [
    { name: 'Company Settings', href: '/settings', icon: Settings, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN] },
    { name: 'Departments', href: '/departments', icon: Building2, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Managers', href: '/managers', icon: Crown, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Disciplinary', href: '/disciplinary', icon: Shield, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
  ].filter(item => !item.roles || item.roles.includes(user.role));

  const StatItem = ({ label, value, trend, icon: Icon, colorClass }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClass)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold leading-none mb-1">{label}</p>
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
    <div className="h-screen overflow-hidden bg-gray-50 flex font-sans text-gray-900 transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in-up" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - Premium OmniHR Theme */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200/80 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col shrink-0 shadow-sm',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo Area - with gradient */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200/80 shrink-0 bg-gradient-to-r from-white to-gray-50/30">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-105">
              <Building className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">Lifeline</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto pt-6 px-3 space-y-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Main Modules */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Main</p>
            <nav className="space-y-0.5">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                      isActive
                        ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full" />
                    )}
                    <item.icon className={cn('h-5 w-5 transition-all duration-200', isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500')} />
                    <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin Section */}
          {user.role !== 'employee' && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Administration</p>
              <nav className="space-y-0.5">
                {adminLinks.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                        isActive
                          ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full" />
                      )}
                      <item.icon className={cn('h-5 w-5 transition-all duration-200', isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500')} />
                      <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200">
              {user.photo ? (
                <img src={getImageUrl(user.photo)} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold uppercase">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Top Header - Clean OmniHR Style */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="h-6 w-6" />
            </button>

            {/* Company Context */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-primary-300 hover:bg-white transition-all group">
              <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm group-hover:scale-105 transition-transform">
                L
              </div>
              <div className="pr-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-tight block leading-none mb-0.5">Company</span>
                <span className="text-sm font-semibold text-gray-900 block leading-none">{user.company_name || 'Lifeline Tech'}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 w-48 lg:w-64 transition-all focus:bg-white focus:w-80"
              />
            </div>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <Link
              to="/help"
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title="Help & Support"
            >
              <HelpCircle className="h-5 w-5" />
            </Link>
            <NotificationsPopover />
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
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
