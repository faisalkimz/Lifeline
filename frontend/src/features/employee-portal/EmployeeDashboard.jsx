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
        { name: 'Payslips', href: '/employee/payslips', icon: CreditCard, color: 'text-slate-600 bg-slate-50 border-slate-200' },
        { name: 'Request Leave', href: '/employee/leave', icon: Calendar, color: 'text-slate-600 bg-slate-50 border-slate-200' },
        { name: 'Attendance', href: '/employee/attendance', icon: Clock, color: 'text-slate-600 bg-slate-50 border-slate-200' },
        { name: 'Documents', href: '/employee/documents', icon: FileText, color: 'text-slate-600 bg-slate-50 border-slate-200' },
    ];

    const stats = [
        { label: 'Leave Balance', value: leaveBalances?.[0]?.available_days || '0', unit: 'days', loading: isLeaveLoading },
        { label: 'Attendance', value: todayAttendance?.clock_in ? 'In' : 'Out', unit: '', loading: isAttendanceLoading },
        { label: 'Pending Requests', value: pendingRequestsCount, unit: '', loading: isRequestsLoading },
    ];

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-[#88B072] flex items-center justify-center text-white text-xl font-bold">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Welcome, {user.first_name}</h1>
                        <p className="text-sm text-slate-500 font-medium">
                            {isProfileLoading ? 'Loading profile...' : `${profile?.job_title || 'Employee'} • ${profile?.department_name || 'Staff'}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="/employee/attendance">
                        <Button className="bg-[#88B072] hover:bg-[#7aa265] text-white font-semibold h-10 px-6 rounded text-sm uppercase">
                            Attendance Clock
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        {stat.loading ? (
                            <Skeleton className="h-8 w-24 mt-1" />
                        ) : (
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {stat.value} <span className="text-xs font-semibold text-slate-400 capitalize">{stat.unit}</span>
                            </h3>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Actions Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    <Link key={action.name} to={action.href} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-[#88B072] hover:shadow-md transition-all group">
                        <div className={`h-10 w-10 flex items-center justify-center rounded border ${action.color}`}>
                            <action.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{action.name}</span>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline & Payslips */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Attendance */}
                    <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Today's Timeline</h3>
                            <span className="text-xs font-semibold text-slate-400">{formattedDate}</span>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">In At</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {todayAttendance?.clock_in ? new Date(todayAttendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </p>
                                </div>
                                <div className="space-y-1 border-l border-slate-100 pl-8">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Out At</p>
                                    <p className="text-2xl font-bold text-slate-400">
                                        {todayAttendance?.clock_out ? new Date(todayAttendance.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payslips */}
                    <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Remuneration</h3>
                            <Link to="/employee/payslips">
                                <button className="text-[10px] font-bold text-[#88B072] hover:text-[#7aa265] uppercase tracking-widest">History</button>
                            </Link>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {payslips.length > 0 ? payslips.map((payslip) => (
                                    <div key={payslip.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <DollarSign className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{payslip.payroll_period}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Remitted</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{formatCurrency(payslip.net_salary)}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Net Pay</p>
                                            </div>
                                            <Link to="/employee/payslips">
                                                <button className="h-8 px-4 border border-slate-200 text-slate-600 hover:text-[#88B072] hover:border-[#88B072] font-semibold rounded text-xs transition-all uppercase">
                                                    PDF
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">No payslips found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Annual Leave */}
                    <Card className="bg-slate-900 text-white border-none shadow-sm overflow-hidden rounded-lg">
                        <CardContent className="p-6">
                            <h3 className="text-[10px] font-bold text-white/60 mb-6 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#88B072]" />
                                My Entitlements
                            </h3>
                            <div className="space-y-5">
                                {leaveBalances?.map((balance, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-4 bg-white/5 rounded border border-white/10">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none">{balance.leave_type_name}</span>
                                            <span className="text-xl font-bold font-mono tracking-tighter leading-none">{balance.available_days}D</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                                            <div
                                                className="bg-[#88B072] h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min(100, (Number(balance.available_days) / 21) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/employee/leave">
                                <button className="w-full mt-8 bg-[#88B072] hover:bg-[#7aa265] text-white font-bold uppercase tracking-widest text-xs h-12 rounded transition-all">
                                    Request Time Off
                                </button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Account Status */}
                    <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="h-4 w-4 text-[#88B072]" />
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Status</h3>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xl font-bold text-slate-900">Live</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">Active</span>
                        </div>
                        <Link to="/employee/profile">
                            <button className="w-full h-10 border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold rounded text-xs transition-all uppercase">
                                View Profile
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
