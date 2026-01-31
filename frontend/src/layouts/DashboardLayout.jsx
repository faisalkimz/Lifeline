import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../store/api';
import NotificationsPopover from '../components/notifications/NotificationsPopover';
import { getMediaUrl } from '../config/api';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard, Users, Building2, Settings, LogOut, Menu, X, Bell,
  TrendingUp, User, Crown, CreditCard, Calendar, Clock, Activity, Briefcase,
  BookOpen, Shield, FileText, Search, ChevronDown, HelpCircle,
  Building, LayoutGrid, ChevronRight, DollarSign, Moon, Sun, Laptop,
  Box, FileEdit, Heart, Globe, UserPlus, MoreHorizontal
} from 'lucide-react';
import { cn } from '../utils/cn';
import ChatWidget from '../components/common/ChatWidget';
import { ROLES } from '../utils/rbac';

const DashboardLayout = () => {
  const user = useSelector(selectCurrentUser);
  const refresh = useSelector(state => state?.auth?.refresh);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const getImageUrl = (path) => getMediaUrl(path);

  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    try {
      if (refresh) await logoutApi(refresh).unwrap();
    } catch (err) {
      console.warn('Logout failed:', err);
    } finally {
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
    { name: 'Onboarding', href: '/onboarding', icon: UserPlus, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Assets', href: '/assets', icon: Laptop, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Forms', href: '/forms', icon: FileEdit, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Surveys', href: '/surveys', icon: Heart },
    { name: 'Org Chart', href: '/org-chart', icon: LayoutGrid },
  ].filter(item => !item.roles || item.roles.includes(user.role));

  const adminLinks = [
    { name: 'Settings', href: '/settings', icon: Settings, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN] },
    { name: 'Departments', href: '/departments', icon: Building2, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Managers', href: '/managers', icon: Crown, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
    { name: 'Disciplinary', href: '/disciplinary', icon: Shield, roles: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER] },
  ].filter(item => !item.roles || item.roles.includes(user.role));

  return (
    <div className="h-screen flex bg-white dark:bg-[#191919]">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Notion Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-[#F7F7F5] dark:bg-[#202020] border-r border-notion-border lg:static lg:block transition-all duration-200',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Workspaces Switcher Style Header */}
          <div className="h-14 flex items-center px-4 mb-2">
            <Link to="/dashboard" className="flex items-center gap-2 w-full hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-md transition-colors">
              <div className="h-5 w-5 bg-notion-text dark:bg-white rounded flex items-center justify-center">
                <Building className="h-3 w-3 text-white dark:text-black" />
              </div>
              <span className="text-sm font-semibold truncate">Lifeline</span>
              <ChevronDown className="h-3 w-3 ml-auto text-notion-text-light" />
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-2 space-y-6 pt-2 scrollbar-hide">
            <div>
              <nav className="space-y-px">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'sidebar-link',
                        isActive && 'sidebar-link-active'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {user.role !== 'employee' && (
              <div>
                <p className="px-3 text-[11px] font-semibold text-notion-text-light uppercase tracking-wider mb-1 opacity-60">Admin</p>
                <nav className="space-y-px">
                  {adminLinks.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          'sidebar-link',
                          isActive && 'sidebar-link-active'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>

          {/* User Section at Bottom */}
          <div className="p-3 border-t border-notion-border">
            <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <div className="h-6 w-6 rounded bg-notion-text/10 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                {user.photo ? (
                  <img src={getImageUrl(user.photo)} className="h-full w-full object-cover" alt="" />
                ) : (
                  <span className="text-[10px] font-bold text-notion-text dark:text-white uppercase">{user.first_name?.[0]}{user.last_name?.[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.first_name} {user.last_name}</p>
              </div>
              <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                <LogOut className="h-3 w-3 text-notion-text-light" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 flex items-center justify-between px-4 sticky top-0 bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-notion-hover rounded">
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb-ish Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-notion-text-light">
              <span className="hover:bg-notion-hover px-1.5 py-0.5 rounded cursor-pointer">{user.company_name || 'Lifeline'}</span>
              <span>/</span>
              <span className="text-notion-text font-medium px-1.5 py-0.5 rounded">{navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-1.5 hover:bg-notion-hover rounded text-notion-text-light">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <NotificationsPopover />
            <div className="h-4 w-px bg-notion-border mx-1" />
            <button className="p-1.5 hover:bg-notion-hover rounded text-notion-text-light">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-12 py-12">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;
