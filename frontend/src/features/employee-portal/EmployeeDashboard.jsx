import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import {
    useGetMyProfileQuery,
    useGetTodayAttendanceQuery,
    useGetLeaveBalancesQuery
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Users, Calendar, Clock, CreditCard, FileText, ArrowRight,
    CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
    const user = useSelector(selectCurrentUser);
    const { data: profile } = useGetMyProfileQuery();
    const { data: todayAttendance } = useGetTodayAttendanceQuery();
    const { data: leaveBalances } = useGetLeaveBalancesQuery();

    const quickActions = [
        { name: 'View Payslips', href: '/employee/payslips', icon: CreditCard, color: 'bg-green-600' },
        { name: 'Request Leave', href: '/employee/leave', icon: Calendar, color: 'bg-blue-600' },
        { name: 'Clock In/Out', href: '/employee/attendance', icon: Clock, color: 'bg-purple-600' },
        { name: 'My Documents', href: '/employee/documents', icon: FileText, color: 'bg-orange-600' },
    ];

    const stats = [
        {
            label: 'Leave Balance',
            value: leaveBalances?.[0]?.remaining_days || '0',
            unit: 'days',
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'This Month Attendance',
            value: '22',
            unit: 'days',
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            label: 'Pending Requests',
            value: '1',
            unit: '',
            icon: AlertCircle,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Welcome back, {user.first_name}! 👋
                </h1>
                <p className="text-slate-500 mt-1">Here's your employee dashboard</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {stat.value} {stat.unit && <span className="text-sm font-normal text-slate-500">{stat.unit}</span>}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.name} to={action.href}>
                            <Card className="hover:shadow-md hover:border-primary-200 transition-all cursor-pointer h-full border-none shadow-sm">
                                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                    <div className={`p-3 rounded-full ${action.color} text-white shadow-lg shadow-primary-500/20`}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <span className="font-semibold text-slate-700">{action.name}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Section: Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Today's Attendance Status */}
                    {todayAttendance && (
                        <Card className="border-none shadow-sm">
                            <div className="p-6 border-b border-slate-100 bg-white rounded-t-xl">
                                <h3 className="font-bold text-slate-800">Today's Attendance</h3>
                            </div>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Clock In</p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {todayAttendance.clock_in || 'Not clocked in'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Clock Out</p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {todayAttendance.clock_out || 'Not clocked out'}
                                        </p>
                                    </div>
                                    <Link to="/employee/attendance">
                                        <Button size="sm">Clock In/Out</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Payslips */}
                    <Card className="border-none shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
                            <h3 className="font-bold text-slate-800">Recent Payslips</h3>
                            <Link to="/employee/payslips" className="text-sm text-primary-600 font-medium hover:underline">
                                View All
                            </Link>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <CreditCard className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {new Date(2025, new Date().getMonth() - i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-slate-500">UGX 3,500,000</p>
                                            </div>
                                        </div>
                                        <Link to="/employee/payslips">
                                            <Button variant="ghost" size="sm">
                                                View
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar: Leave Info */}
                <div className="space-y-6">
                    {/* Leave Balances */}
                    <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <CardContent className="p-6 relative z-10">
                            <h3 className="font-bold text-lg mb-4">Leave Balance</h3>
                            <div className="space-y-3">
                                {leaveBalances?.map((balance, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-sm text-white/80">{balance.leave_type_name || 'Annual Leave'}</span>
                                        <span className="font-bold text-xl">{balance.remaining_days || 0} days</span>
                                    </div>
                                )) || (
                                        <div className="text-center text-white/80 py-4">
                                            <p className="text-sm">No leave data available</p>
                                        </div>
                                    )}
                            </div>
                            <Link to="/employee/leave">
                                <Button className="w-full mt-4 bg-white text-primary-700 hover:bg-slate-100 border-none font-bold">
                                    Request Leave
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Profile Completion */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUp className="h-5 w-5 text-primary-600" />
                                <h3 className="font-bold text-slate-800">Profile Completion</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">85%</span>
                                        <span className="text-slate-400">Complete</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                                <Link to="/employee/profile">
                                    <Button variant="outline" size="sm" className="w-full">
                                        Complete Profile
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
