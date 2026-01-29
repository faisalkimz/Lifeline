import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import {
    useGetMyProfileQuery,
    useGetTodayAttendanceQuery,
    useGetLeaveBalancesQuery,
    useGetMyLeaveRequestsQuery,
    useGetPayslipsQuery
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Calendar, Clock, CreditCard, FileText, ArrowRight,
    CheckCircle, AlertCircle, Activity, MapPin, ChevronRight, DollarSign, User
} from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
    const user = useSelector(selectCurrentUser);
    const { data: profile, isLoading: isProfileLoading } = useGetMyProfileQuery();
    const { data: todayAttendance, isLoading: isAttendanceLoading } = useGetTodayAttendanceQuery();
    const { data: leaveBalances, isLoading: isLeaveLoading } = useGetLeaveBalancesQuery();
    const { data: leaveRequests, isLoading: isRequestsLoading } = useGetMyLeaveRequestsQuery();
    const { data: payslipsData, isLoading: isPayslipsLoading } = useGetPayslipsQuery();

    const payslips = (payslipsData?.results || payslipsData || []).slice(0, 3);
    const pendingRequestsCount = leaveRequests?.filter(r => r.status === 'pending').length || 0;

    const formatCurrency = (val) => new Intl.NumberFormat('en-UG', {
        style: 'currency', currency: 'UGX', minimumFractionDigits: 0
    }).format(Number(val) || 0);

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

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
            bg: 'bg-primary-50',
            loading: isLeaveLoading
        },
        {
            label: 'Attendance Status',
            value: todayAttendance?.clock_in ? 'On Duty' : 'Pending',
            unit: '',
            icon: Activity,
            color: todayAttendance?.clock_in ? 'text-emerald-600' : 'text-slate-400',
            bg: todayAttendance?.clock_in ? 'bg-emerald-50' : 'bg-slate-50',
            loading: isAttendanceLoading
        },
        {
            label: 'Pending Requests',
            value: pendingRequestsCount,
            unit: '',
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            loading: isRequestsLoading
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mt-20 -mr-20 opacity-50"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-slate-200">
                        {user.first_name?.[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-tight">
                            Welcome, {user.first_name}!
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold">
                                <MapPin className="h-4 w-4 text-primary-500" />
                                {isProfileLoading ? <Skeleton className="h-4 w-24" /> : (profile?.job_title || 'Employee')}
                            </div>
                            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                            <div className="text-primary-600 text-sm font-bold uppercase tracking-wider">
                                {isProfileLoading ? <Skeleton className="h-4 w-32" /> : (profile?.department_name || 'Staff Portal')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 flex gap-3">
                    <Link to="/employee/attendance">
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-4 h-auto rounded-xl">
                            <Clock className="h-5 w-5 mr-2" />
                            Attendance Clock
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white">
                        <CardContent className="p-6 flex items-center gap-6 relative">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                {stat.loading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <h3 className="text-2xl font-black text-gray-900">
                                        {stat.value} <span className="text-sm font-bold text-gray-400 uppercase">{stat.unit}</span>
                                    </h3>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-1">My Dashboard Access</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {quickActions.map((action) => (
                        <Link key={action.name} to={action.href} className="group">
                            <Card className="hover:shadow-xl hover:-translate-y-1 hover:border-primary-500 transition-all duration-300 border border-gray-200 shadow-sm bg-white overflow-hidden rounded-2xl">
                                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                                    <div className={`h-14 w-14 rounded-2xl ${action.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <action.icon className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-800 block text-lg">{action.name}</span>
                                        <p className="text-xs text-gray-400 mt-1 font-medium group-hover:text-primary-500 transition-colors">Workspace <ArrowRight className="inline h-3 w-3 ml-1" /></p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Attendance Card */}
                    <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white rounded-2xl">
                        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                <h3 className="font-bold text-gray-900 font-black uppercase tracking-tight">Today's Timeline</h3>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {formattedDate}
                            </span>
                        </div>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 items-center">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clock In</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-3 w-3 rounded-full ${todayAttendance?.clock_in ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`}></div>
                                        {isAttendanceLoading ? (
                                            <Skeleton className="h-8 w-32" />
                                        ) : (
                                            <p className="text-2xl font-black text-gray-900">
                                                {todayAttendance?.clock_in ? new Date(todayAttendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 border-l border-gray-100 pl-12 lg:pl-12">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clock Out</p>
                                    {isAttendanceLoading ? (
                                        <Skeleton className="h-8 w-32" />
                                    ) : (
                                        <p className="text-2xl font-black text-gray-300">
                                            {todayAttendance?.clock_out ? new Date(todayAttendance.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </p>
                                    )}
                                </div>
                                <div className="hidden lg:block space-y-2 border-l border-gray-100 pl-12">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duty Status</p>
                                    {isAttendanceLoading ? (
                                        <Skeleton className="h-5 w-40 mt-2" />
                                    ) : (
                                        <p className="text-sm font-bold text-slate-500 mt-2">
                                            {todayAttendance?.clock_in
                                                ? todayAttendance?.clock_out ? "Shift Completed" : "Currently On Duty"
                                                : "Awaiting Clock-in"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Payslips */}
                    <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white rounded-2xl">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-bold text-gray-900 font-black uppercase tracking-tight">Recent Remuneration</h3>
                            </div>
                            <Link to="/employee/payslips">
                                <Button variant="ghost" className="text-xs font-black text-primary-600 p-0 h-auto uppercase tracking-widest hover:bg-transparent">
                                    Explore history <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-50">
                                {isPayslipsLoading ? (
                                    <div className="p-8 space-y-6">
                                        {[1, 2].map(i => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="space-y-2 text-right">
                                                        <Skeleton className="h-4 w-24" />
                                                        <Skeleton className="h-2 w-12 ml-auto" />
                                                    </div>
                                                    <Skeleton className="h-9 w-24 rounded-lg" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : payslips.length > 0 ? payslips.map((payslip, i) => (
                                    <div key={payslip.id} className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                                                <DollarSign className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                                                    {payslip.payroll_period || 'Payslip'}
                                                </p>
                                                <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-tight flex items-center gap-2">
                                                    <CheckCircle className="h-3 w-3 text-emerald-500" /> Remitted
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{formatCurrency(payslip.net_salary)}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Net Pay</p>
                                            </div>
                                            <Link to="/employee/payslips">
                                                <Button size="sm" className="bg-white border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-600 font-bold px-4 rounded-lg">
                                                    Get PDF
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-slate-400">
                                        <p className="text-sm font-bold uppercase tracking-widest">No payslips found yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Annual Leave Progress */}
                    <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group rounded-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-8 -mr-8 blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                        <CardContent className="p-8 relative z-10">
                            <h3 className="font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest text-white/90">
                                <Calendar className="h-5 w-5 text-primary-400" />
                                My Entitlements
                            </h3>
                            <div className="space-y-5">
                                {isLeaveLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="flex flex-col gap-2 p-4 bg-white/10 rounded-2xl border border-white/10">
                                            <div className="flex justify-between items-center">
                                                <Skeleton className="h-3 w-24 bg-white/20" />
                                                <Skeleton className="h-6 w-12 bg-white/20" />
                                            </div>
                                            <Skeleton className="h-1.5 w-full bg-white/10 rounded-full" />
                                        </div>
                                    ))
                                ) : leaveBalances?.map((balance, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-4 bg-white/10 rounded-2xl border border-white/10 group/item">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-white/80 uppercase tracking-tighter">{balance.leave_type_name || 'Annual Leave'}</span>
                                            <span className="font-black text-2xl group-hover/item:scale-110 transition-transform">{balance.available_days || 0}d</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-primary-500 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min(100, (Number(balance.available_days) / 21) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )) || (
                                    <div className="text-center text-white/40 py-8 border border-dashed border-white/20 rounded-2xl">
                                        <p className="text-xs font-bold uppercase tracking-widest">No balances found</p>
                                    </div>
                                )}
                            </div>
                            <Link to="/employee/leave">
                                <Button className="w-full mt-8 bg-white text-slate-900 hover:bg-gray-100 border-none font-black uppercase tracking-widest py-6 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                                    Request Time Off
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Profile Status */}
                    <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white rounded-2xl">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <User className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Profile Status</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="relative">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-lg font-black text-gray-900">Live</span>
                                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Active Account</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                <Link to="/employee/profile">
                                    <Button variant="outline" className="w-full border-gray-200 text-gray-600 font-bold h-11 hover:text-primary-600 hover:border-primary-600 rounded-xl transition-all">
                                        View Full Profile
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
