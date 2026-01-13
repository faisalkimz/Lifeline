import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import {
    useGetMyProfileQuery,
    useGetTodayAttendanceQuery,
    useGetLeaveBalancesQuery,
    useGetMyLeaveRequestsQuery
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Calendar, Clock, CreditCard, FileText, ArrowRight,
    CheckCircle, AlertCircle, TrendingUp, User, Activity, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
    const user = useSelector(selectCurrentUser);
    const { data: profile } = useGetMyProfileQuery();
    const { data: todayAttendance } = useGetTodayAttendanceQuery();
    const { data: leaveBalances } = useGetLeaveBalancesQuery();
    const { data: leaveRequests } = useGetMyLeaveRequestsQuery();

    const pendingRequestsCount = leaveRequests?.filter(r => r.status === 'pending').length || 0;

    const quickActions = [
        { name: 'My Payslips', href: '/employee/payslips', icon: CreditCard, color: 'bg-emerald-600' },
        { name: 'Request Leave', href: '/employee/leave', icon: Calendar, color: 'bg-primary-600' },
        { name: 'Clock In/Out', href: '/employee/attendance', icon: Clock, color: 'bg-indigo-600' },
        { name: 'My Documents', href: '/employee/documents', icon: FileText, color: 'bg-amber-600' },
    ];

    const stats = [
        {
            label: 'Leave Balance',
            value: leaveBalances?.[0]?.available_days || '0',
            unit: 'days',
            icon: Calendar,
            color: 'text-primary-600',
            bg: 'bg-primary-50'
        },
        {
            label: 'Attendance (Month)',
            value: '22', // This should ideally come from API
            unit: 'days',
            icon: Activity,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Pending Requests',
            value: pendingRequestsCount,
            unit: '',
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section - Premium Design */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mt-20 -mr-20 opacity-50"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary-200">
                        {user.first_name?.[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-tight">
                            Welcome back, {user.first_name}! <span className="inline-block animate-bounce">👋</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold">
                                <MapPin className="h-4 w-4 text-primary-500" />
                                {profile?.job_title || 'Employee'}
                            </div>
                            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                            <div className="text-primary-600 text-sm font-bold uppercase tracking-wider">
                                {profile?.department_name || 'Lifeline Staff'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 flex gap-3">
                    <Link to="/employee/attendance">
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-6 h-auto rounded-xl shadow-lg shadow-primary-200">
                            <Clock className="h-5 w-5 mr-2" />
                            Attendance WebClock
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-6 relative">
                            <div className={`absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform ${stat.color}`}>
                                <stat.icon className="h-24 w-24" />
                            </div>
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-black text-gray-900">
                                    {stat.value} <span className="text-sm font-bold text-gray-400">{stat.unit}</span>
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions - Premium Circular Style */}
            <div>
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-1">My Dashboard Access</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {quickActions.map((action) => (
                        <Link key={action.name} to={action.href} className="group">
                            <Card className="hover:shadow-xl hover:-translate-y-1 hover:border-primary-500 transition-all duration-300 border border-gray-200 shadow-sm bg-white overflow-hidden">
                                <CardContent className="p-8 flex flex-col items-center text-center gap-5">
                                    <div className={`h-16 w-16 rounded-2xl ${action.color} text-white flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                        <action.icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-800 block text-lg">{action.name}</span>
                                        <p className="text-xs text-gray-400 mt-1 font-medium group-hover:text-primary-500 transition-colors">Go to workspace <ArrowRight className="inline h-3 w-3 ml-1" /></p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Section: Recent Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Attendance Card */}
                    <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
                        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                <h3 className="font-bold text-gray-900">Today's Timeline</h3>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                January 13, 2026
                            </span>
                        </div>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 items-center">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clock In</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <p className="text-2xl font-black text-gray-900">
                                            {todayAttendance?.clock_in ? new Date(todayAttendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 border-l border-gray-100 pl-12 lg:pl-12">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clock Out</p>
                                    <p className="text-2xl font-black text-gray-300">
                                        {todayAttendance?.clock_out ? new Date(todayAttendance.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </p>
                                </div>
                                <div className="hidden lg:block space-y-2 border-l border-gray-100 pl-12">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shift Progress</p>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: todayAttendance?.clock_in ? '65%' : '0%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Payslips with Icons */}
                    <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-bold text-gray-900">Recent Remuneration</h3>
                            </div>
                            <Link to="/employee/payslips">
                                <Button variant="ghost" className="text-xs font-black text-primary-600 p-0 h-auto uppercase tracking-widest hover:bg-transparent">
                                    Explore All <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-50">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                                                <DollarSign className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                    {new Date(2025, new Date().getMonth() - i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Payslip
                                                </p>
                                                <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-tight flex items-center gap-2">
                                                    <CheckCircle className="h-3 w-3 text-emerald-500" /> Remitted successfully
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className="text-sm font-black text-gray-900">UGX 3,500,000</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Net Pay</p>
                                            </div>
                                            <Link to="/employee/payslips">
                                                <Button size="sm" className="bg-white border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-600 font-bold px-4 rounded-lg">
                                                    Get PDF
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Annual Leave Progress Circle / Summary */}
                    <Card className="bg-primary-600 text-white border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-8 -mr-8 blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -mb-8 -ml-8 blur-xl"></div>
                        <CardContent className="p-8 relative z-10">
                            <h3 className="font-black text-lg mb-6 flex items-center gap-2 uppercase tracking-widest text-white/90">
                                <Calendar className="h-5 w-5" />
                                My Leave Status
                            </h3>
                            <div className="space-y-5">
                                {leaveBalances?.map((balance, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-default group/item">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-white/80 uppercase tracking-tighter">{balance.leave_type_name || 'Annual Leave'}</span>
                                            <span className="font-black text-2xl group-hover/item:scale-110 transition-transform">{balance.available_days || 0}d</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-white h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${(balance.available_days / 21) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )) || (
                                        <div className="text-center text-white/60 py-8 py-8 border border-dashed border-white/20 rounded-2xl">
                                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs font-bold uppercase tracking-widest">No Entitlements Found</p>
                                        </div>
                                    )}
                            </div>
                            <Link to="/employee/leave">
                                <Button className="w-full mt-8 bg-white text-primary-600 hover:bg-gray-100 border-none font-black uppercase tracking-widest py-6 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                                    Request New Leave
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Profile Completion - Styled */}
                    <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <User className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-bold text-gray-900">Profile Efficiency</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="relative">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-lg font-black text-gray-900">85%</span>
                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Near Mastery</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
                                        <div className="bg-gradient-to-r from-indigo-500 to-primary-500 h-full rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                                <Link to="/employee/profile">
                                    <Button variant="outline" className="w-full border-gray-200 text-gray-600 font-bold h-11 hover:text-primary-600 hover:border-primary-600 rounded-xl transition-all">
                                        Finalize My Profile
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
