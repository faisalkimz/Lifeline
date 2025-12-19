import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Calendar, FileText, ArrowRight, CreditCard, Clock,
    Users, Bell, ChevronRight, TrendingUp, DollarSign,
    Briefcase, Target, Award, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    useGetEmployeeStatsQuery,
    useGetLeaveRequestsQuery,
} from '../../store/api';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
    const { data: stats } = useGetEmployeeStatsQuery();
    const { data: leaveRequests } = useGetLeaveRequestsQuery({ status: 'pending' });

    const currentDate = new Date();
    const greeting = currentDate.getHours() < 12 ? 'Good morning' :
        currentDate.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    const pendingRequests = (leaveRequests?.results || leaveRequests || []).filter(r => r.status === 'pending');

    // Clean stat cards - WorkPay style
    const StatCard = ({ title, value, subtitle, icon: Icon, color, link }) => (
        <Link to={link} className="block group">
            <Card className="border border-gray-200 hover:border-blue-500 transition-all hover:shadow-md">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );

    // Quick action button - WorkPay style
    const QuickAction = ({ icon: Icon, label, link }) => (
        <Link
            to={link}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
            <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100">
                <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{label}</span>
        </Link>
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Clean Header - WorkPay Style */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {greeting}, {user.first_name || 'Admin'}
                        </h1>
                        <p className="text-gray-600">Welcome to your dashboard</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total Employees</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Present Today</p>
                            <p className="text-2xl font-bold text-blue-600">{stats?.working_today || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Clean Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Leave Requests"
                    value={pendingRequests.length}
                    subtitle="Pending approval"
                    icon={Calendar}
                    color="bg-orange-500"
                    link="/leave"
                />
                <StatCard
                    title="Payroll"
                    value="On Track"
                    subtitle="Next run in 12 days"
                    icon={DollarSign}
                    color="bg-green-500"
                    link="/payroll"
                />
                <StatCard
                    title="Recruitment"
                    value={stats?.open_positions || 0}
                    subtitle="Open positions"
                    icon={Briefcase}
                    color="bg-purple-500"
                    link="/recruitment"
                />
                <StatCard
                    title="Performance"
                    value={stats?.pending_reviews || 0}
                    subtitle="Reviews pending"
                    icon={Target}
                    color="bg-blue-500"
                    link="/performance"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pending Actions */}
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Pending Actions</CardTitle>
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                    {pendingRequests.length} items
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pendingRequests.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {pendingRequests.slice(0, 5).map((request) => (
                                        <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-100 rounded-lg">
                                                        <Calendar className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {request.employee_name} - Leave Request
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {request.start_date} to {request.end_date}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link to="/leave">
                                                    <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                                                        Review
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                    <p className="text-gray-500">All caught up!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <QuickAction icon={Users} label="Employees" link="/employees" />
                            <QuickAction icon={Calendar} label="Leave" link="/leave" />
                            <QuickAction icon={DollarSign} label="Payroll" link="/payroll" />
                            <QuickAction icon={Briefcase} label="Jobs" link="/recruitment" />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card className="border border-gray-200">
                        <CardContent className="p-6 text-center">
                            <div className="mx-auto h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-blue-600">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                                {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">{user.role?.replace('_', ' ')}</p>
                            <Link to="/profile">
                                <Button className="w-full">View Profile</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-100">
                            <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {(stats?.upcoming_events || []).slice(0, 3).map((event, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex flex-col items-center justify-center">
                                            <span className="text-xs text-blue-600 font-medium">
                                                {new Date(event.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-lg font-bold text-blue-600">
                                                {new Date(event.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{event.type}</p>
                                            <p className="text-xs text-gray-600">{event.employee}</p>
                                        </div>
                                    </div>
                                ))}
                                {(stats?.upcoming_events || []).length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-8">No upcoming events</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
