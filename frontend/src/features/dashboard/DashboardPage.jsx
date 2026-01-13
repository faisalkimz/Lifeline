import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Calendar, Users, Bell, TrendingUp, DollarSign,
    Briefcase, CheckCircle2, ChevronRight,
    Clock, Activity, ArrowUpRight, Search, PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    useGetEmployeeStatsQuery,
    useGetLeaveRequestsQuery,
} from '../../store/api';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
    const { data: stats, isLoading: statsLoading } = useGetEmployeeStatsQuery();
    const { data: leaveRequests } = useGetLeaveRequestsQuery({ status: 'pending' });

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const greeting = currentDate.getHours() < 12 ? 'Good morning' :
        currentDate.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    const pendingRequests = (leaveRequests?.results || leaveRequests || []).filter(r => r.status === 'pending');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 pb-12"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <motion.div variants={itemVariants} className="text-sm font-medium text-slate-500 mb-1">
                        {formattedDate}
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        {greeting}, <span className="text-primary-600">{user.first_name || 'Admin'}</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-slate-500 mt-2 max-w-lg">
                        Here's what's happening across your organization today.
                    </motion.p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl h-11 border-slate-200 text-slate-600 hover:text-slate-900 font-medium">
                        <Calendar className="mr-2 h-4 w-4" /> Schedule
                    </Button>
                    <Button className="rounded-xl h-11 bg-slate-900 text-white hover:bg-slate-800 font-medium shadow-lg shadow-slate-900/20">
                        <Users className="mr-2 h-4 w-4" /> Add Employee
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Employees"
                    value={stats?.total || 0}
                    change="+12% from last month"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="On Leave Today"
                    value={stats?.on_leave || 0}
                    change="4 Returning tomorrow"
                    icon={Calendar}
                    color="amber"
                />
                <StatCard
                    title="Open Positions"
                    value={stats?.open_positions || 0}
                    change="2 Urgent roles"
                    icon={Briefcase}
                    color="emerald"
                />
                <StatCard
                    title="Pending Requests"
                    value={pendingRequests.length}
                    change="Requires attention"
                    icon={Bell}
                    color="rose"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Main Activity */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Pending Approvals */}
                    <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900">Needs Attention</CardTitle>
                                <p className="text-slate-500 text-sm mt-1">Leave requests awaiting your approval</p>
                            </div>
                            <Link to="/leave">
                                <Button variant="ghost" size="sm" className="text-primary-600 font-medium hover:bg-primary-50">
                                    View All
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pendingRequests.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {pendingRequests.slice(0, 4).map((request) => (
                                        <div key={request.id} className="p-6 hover:bg-slate-50/80 transition-colors group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-white group-hover:text-primary-600 group-hover:shadow-md transition-all">
                                                        {request.employee_name?.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{request.employee_name}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                                            <span className="font-medium text-slate-700">{request.leave_type_name}</span>
                                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                            <span>{request.days_requested} days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {request.notes && (
                                                        <span className="hidden md:inline-block text-xs text-slate-400 max-w-[150px] truncate bg-slate-50 px-2 py-1 rounded-md">
                                                            "{request.notes}"
                                                        </span>
                                                    )}
                                                    <Button size="sm" className="rounded-lg h-9 bg-slate-900 text-white text-xs font-medium hover:bg-slate-800">
                                                        Review
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-slate-200" />
                                    <p className="font-medium text-slate-600">You're all caught up!</p>
                                    <p className="text-sm mt-1">No pending requests at the moment.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Department Overview (Placeholder for Chart) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-900">Department Headcount</h3>
                                <PieChart className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="space-y-4">
                                {stats?.departments ? (
                                    Object.entries(stats.departments).slice(0, 4).map(([dept, count], idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-2.5 w-2.5 rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-orange-500'][idx % 4]}`} />
                                                <span className="text-sm font-medium text-slate-600 capitalize">{dept}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{count}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400">No department data available</p>
                                )}
                            </div>
                        </Card>

                        <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-8 -mr-8 blur-2xl" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="h-5 w-5 text-indigo-200" />
                                        <span className="font-medium text-indigo-100">Payroll Status</span>
                                    </div>
                                    <h3 className="text-2xl font-bold">Upcoming Run</h3>
                                    <p className="text-indigo-100 text-sm mt-1">Scheduled for {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}</p>
                                </div>
                                <Button className="mt-6 w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none font-bold">
                                    View Payroll
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Quick Tools & Summary */}
                <div className="space-y-8">
                    {/* Quick Launch */}
                    <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6">
                        <h3 className="font-bold text-slate-900 mb-6 px-1">Quick Access</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickLink
                                to="/employees"
                                icon={Users}
                                label="Employees"
                                color="bg-blue-50 text-blue-600"
                            />
                            <QuickLink
                                to="/attendance"
                                icon={Clock}
                                label="Attendance"
                                color="bg-emerald-50 text-emerald-600"
                            />
                            <QuickLink
                                to="/recruitment"
                                icon={Briefcase}
                                label="Recruitment"
                                color="bg-purple-50 text-purple-600"
                            />
                            <QuickLink
                                to="/documents"
                                icon={DollarSign}
                                label="Documents"
                                color="bg-amber-50 text-amber-600"
                            />
                        </div>
                    </Card>

                    {/* Announcement / Tip */}
                    <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-rose-50 rounded-2xl">
                                <Bell className="h-6 w-6 text-rose-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">Company Announcement</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    The quarterly review period begins next week. Please ensure all employee evaluations are submitted.
                                </p>
                                <Button variant="link" className="px-0 text-rose-600 h-auto mt-2 font-medium">
                                    Read more <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ title, value, change, icon: Icon, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        rose: "bg-rose-50 text-rose-600",
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/40"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                {change && (
                    <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span className="text-slate-600">{change}</span>
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
            </div>
        </motion.div>
    );
};

const QuickLink = ({ to, icon: Icon, label, color }) => (
    <Link to={to} className="group">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all flex flex-col items-center justify-center gap-3 text-center h-full">
            <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{label}</span>
        </div>
    </Link>
);

export default DashboardPage;
