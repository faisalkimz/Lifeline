import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { useLogoutMutation, useGetEmployeeStatsQuery } from '../store/api';
import {
  LayoutDashboard, Users, Building2, Settings, LogOut, Menu, X, Bell,
  TrendingUp, User, Crown, CreditCard, Calendar, Clock, ClipboardCheck,
  Briefcase, BookOpen, Shield, FileText, Search, ChevronDown, HelpCircle,
  Building, LayoutGrid, ChevronRight, Activity, Zap
} from 'lucide-react';
import { cn } from '../utils/cn';

const DashboardLayout = () => {
  const user = useSelector(selectCurrentUser);
  const refresh = useSelector(state => state?.auth?.refresh);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Fetch Stats for Sidebar
  const { data: stats } = useGetEmployeeStatsQuery(undefined, {
    pollingInterval: 30000, // Refresh stats every 30s
  });

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http')) return path;
    return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
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
    { name: 'People', href: '/employees', icon: Users },
    { name: 'Payroll', href: '/payroll', icon: CreditCard },
    { name: 'Leaves', href: '/leave', icon: Calendar },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Performance', href: '/performance', icon: TrendingUp },
    { name: 'Recruitment', href: '/recruitment', icon: Briefcase },
    { name: 'Training', href: '/training', icon: BookOpen },
    { name: 'Benefits', href: '/benefits', icon: Shield },
    { name: 'Documents', href: '/documents', icon: FileText },
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
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - Workpay Dark Theme */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col shrink-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
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
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Main Modules</p>
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

          {/* Organization Stats - Premium Widget */}
          <div className="px-3 pb-8">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center justify-between">
                Organization
                <Zap className="h-3 w-3 text-warning-500" />
              </p>

              <div className="grid grid-cols-1 gap-2">
                <StatItem
                  label="Active Now"
                  value={stats?.active_now}
                  trend={stats?.growth_percentage ? `+${stats.growth_percentage}%` : '+5%'}
                  icon={Activity}
                  colorClass="bg-primary-500"
                />
                <StatItem
                  label="Working Today"
                  value={stats?.working_today}
                  icon={Clock}
                  colorClass="bg-success-500"
                />
                <StatItem
                  label="On Leave"
                  value={stats?.on_leave}
                  icon={Calendar}
                  colorClass="bg-warning-500"
                />
                <StatItem
                  label="Full Team"
                  value={stats?.total}
                  icon={Users}
                  colorClass="bg-indigo-500"
                />
                <StatItem
                  label="Departments"
                  value={stats?.departments_count}
                  icon={Building2}
                  colorClass="bg-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header - White & Clean */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>

            {/* Context Switcher (Platform mimic) */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-primary-300 hover:bg-white transition-all group">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                L
              </div>
              <div className="pr-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter block leading-none mb-0.5">Company</span>
                <span className="text-sm font-bold text-slate-700 block leading-none">{user.company_name || 'Lifeline Tech'}</span>
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
                className="pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-48 lg:w-64 transition-all focus:bg-white focus:w-80"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <button className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
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

export default DashboardLayout;
