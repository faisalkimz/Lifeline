import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import {
    Calendar, Users, Bell, TrendingUp, DollarSign,
    Briefcase, CheckCircle2, ChevronRight,
    Clock, Activity, ArrowUpRight, Search, PieChart,
    Plus, Megaphone, CreditCard, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    useGetEmployeeStatsQuery,
    useGetLeaveRequestsQuery,
    useGetAnnouncementsQuery,
    useCreateAnnouncementMutation
} from '../../store/api';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { Skeleton } from '../../components/ui/Skeleton';
import { ROLES, PERMISSIONS, canAccess } from '../../utils/rbac';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
    const { data: stats, isLoading: statsLoading } = useGetEmployeeStatsQuery();
    const { data: leaveRequests, isLoading: leaveLoading } = useGetLeaveRequestsQuery({ status: 'pending' });
    const { data: announcements, isLoading: announcementsLoading } = useGetAnnouncementsQuery();

    const [createAnnouncement, { isLoading: isCreatingAnnouncement }] = useCreateAnnouncementMutation();

    const isHRAdmin = canAccess(user?.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER]);
    const isManager = canAccess(user?.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER, ROLES.MANAGER]);

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const greeting = currentDate.getHours() < 12 ? 'Good morning' :
        currentDate.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    const pendingRequests = (leaveRequests?.results || leaveRequests || []).filter(r => r.status === 'pending');
    // Get the latest active announcement or show a placeholder if critical
    const latestAnnouncement = announcements?.length > 0 ? announcements[0] : null;

    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);

    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: ''
    });

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await createAnnouncement(newAnnouncement).unwrap();
            toast.success('Announcement posted successfully!');
            setIsCreateAnnouncementOpen(false);
            setNewAnnouncement({ title: '', content: '' });
        } catch (error) {
            toast.error('Failed to post announcement.');
        }
    };

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
                        {isHRAdmin
                            ? "Here's what's happening across your organization today."
                            : "Welcome back! Here's your workplace summary for today."}
                    </motion.p>
                </div>
                <div className="flex gap-3">
                    <Link to="/leave">
                        <Button variant="outline" className="rounded-xl h-11 border-slate-200 text-slate-600 hover:text-slate-900 font-medium">
                            <Calendar className="mr-2 h-4 w-4" /> Request Leave
                        </Button>
                    </Link>
                    {isHRAdmin && (
                        <Link to="/employees/new">
                            <Button className="rounded-xl h-11 bg-slate-900 text-white hover:bg-slate-800 font-medium shadow-lg shadow-slate-900/20">
                                <Users className="mr-2 h-4 w-4" /> Add Employee
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={isHRAdmin ? "Total Employees" : "My Team Size"}
                    value={isHRAdmin ? (stats?.total || 0) : (stats?.subordinates_count || 0)}
                    change={isHRAdmin ? "+12% from last month" : null}
                    icon={Users}
                    color="blue"
                    loading={statsLoading}
                />
                <StatCard
                    title="On Leave Today"
                    value={stats?.on_leave || 0}
                    change={isHRAdmin ? "4 Returning tomorrow" : null}
                    icon={Calendar}
                    color="amber"
                    loading={statsLoading}
                />
                <StatCard
                    title={isHRAdmin ? "Open Positions" : "Training Progress"}
                    value={isHRAdmin ? (stats?.open_positions || 0) : "85%"}
                    change={isHRAdmin ? "2 Urgent roles" : "Keep it up!"}
                    icon={isHRAdmin ? Briefcase : Activity}
                    color="emerald"
                    loading={statsLoading}
                />
                <StatCard
                    title="Pending Tasks"
                    value={(isManager ? pendingRequests.length : 0) + (stats?.pending_tasks || 0)}
                    change="Requires attention"
                    icon={Bell}
                    color="rose"
                    loading={statsLoading || leaveLoading}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Main Activity */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Pending Approvals - Only for Managers */}
                    {isManager && (
                        <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                            <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Needs Attention</CardTitle>
                                    <p className="text-slate-500 text-sm mt-1">Leave requests awaiting your approval</p>
                                </div>
                                <Link to="/leave/approvals">
                                    <Button variant="ghost" size="sm" className="text-primary-600 font-medium hover:bg-primary-50">
                                        View All
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                {leaveLoading ? (
                                    <div className="p-6 space-y-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <Skeleton className="h-12 w-12 rounded-full" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                                <Skeleton className="h-9 w-20 rounded-lg" />
                                            </div>
                                        ))}
                                    </div>
                                ) : pendingRequests.length > 0 ? (
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
                                                        <Link to="/leave/approvals">
                                                            <Button size="sm" className="rounded-lg h-9 bg-slate-900 text-white text-xs font-medium hover:bg-slate-800">
                                                                Review
                                                            </Button>
                                                        </Link>
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
                    )}

                    {/* Content Section 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isHRAdmin && (
                            <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-slate-900">Department Headcount</h3>
                                    <PieChart className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="space-y-4">
                                    {statsLoading ? (
                                        [1, 2, 3, 4].map(i => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                                <Skeleton className="h-4 w-8" />
                                            </div>
                                        ))
                                    ) : stats?.departments ? (
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
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-slate-400">No department data available</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        <Card className={cn(
                            "rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 relative overflow-hidden",
                            isHRAdmin ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white" : "bg-white"
                        )}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-8 -mr-8 blur-2xl" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className={cn("h-5 w-5", isHRAdmin ? "text-indigo-200" : "text-primary-500")} />
                                        <span className={cn("font-medium", isHRAdmin ? "text-indigo-100" : "text-slate-500")}>
                                            {isHRAdmin ? "Payroll Status" : "My Performance"}
                                        </span>
                                    </div>
                                    {statsLoading ? (
                                        <div className="space-y-2">
                                            <Skeleton className={cn("h-8 w-40", isHRAdmin ? "bg-indigo-400/30" : "")} />
                                            <Skeleton className={cn("h-4 w-full max-w-[200px]", isHRAdmin ? "bg-indigo-400/30" : "")} />
                                        </div>
                                    ) : isHRAdmin ? (
                                        <>
                                            <h3 className="text-2xl font-bold">Upcoming Run</h3>
                                            <p className="text-indigo-100 text-sm mt-1">Ready for {new Date(new Date().getFullYear(), new Date().getMonth()).toLocaleString('default', { month: 'long' })}</p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-2xl font-bold text-slate-900">Great Progress</h3>
                                            <p className="text-slate-500 text-sm mt-1">You've completed all weekly targets.</p>
                                        </>
                                    )}
                                </div>
                                <Link to={isHRAdmin ? "/payroll" : "/performance"}>
                                    <Button className={cn(
                                        "mt-6 w-full font-bold border-none",
                                        isHRAdmin ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                                    )}>
                                        {isHRAdmin ? "View Payroll" : "View Feedback"}
                                    </Button>
                                </Link>
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
                            {[
                                { to: "/employees", icon: Users, label: "Employees", color: "bg-blue-50 text-blue-600", roles: [ROLES.MANAGER, ROLES.HR_MANAGER, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN] },
                                { to: "/attendance", icon: Clock, label: "Attendance", color: "bg-emerald-50 text-emerald-600" },
                                { to: "/payroll/my-payslips", icon: CreditCard, label: "My Payslips", color: "bg-indigo-50 text-indigo-600" },
                                { to: "/leave", icon: Calendar, label: "Time Off", color: "bg-rose-50 text-rose-600" },
                                { to: "/recruitment", icon: Briefcase, label: "Hiring", color: "bg-purple-50 text-purple-600", roles: [ROLES.MANAGER, ROLES.HR_MANAGER, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN] },
                                { to: "/documents", icon: FileText, label: "Files", color: "bg-amber-50 text-amber-600" },
                            ].filter(item => !item.roles || item.roles.includes(user.role))
                                .map((link, idx) => (
                                    <QuickLink
                                        key={idx}
                                        to={link.to}
                                        icon={link.icon}
                                        label={link.label}
                                        color={link.color}
                                    />
                                ))}
                        </div>
                    </Card>

                    {/* Announcement Section */}
                    <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 relative overflow-hidden">
                        <div className="flex items-start gap-4 z-10 relative">
                            <div className="p-3 bg-rose-50 rounded-2xl">
                                <Megaphone className="h-6 w-6 text-rose-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 mb-1">Company Announcement</h4>
                                {announcementsLoading ? (
                                    <div className="space-y-2 mt-2">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ) : latestAnnouncement ? (
                                    <>
                                        <h5 className='text-sm font-bold text-slate-700 mb-1 line-clamp-1'>{latestAnnouncement.title}</h5>
                                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                                            {latestAnnouncement.content}
                                        </p>
                                        <Button
                                            variant="link"
                                            onClick={() => setIsAnnouncementOpen(true)}
                                            className="px-0 text-rose-600 hover:text-rose-800 h-auto mt-2 font-bold flex items-center cursor-pointer hover:underline decoration-rose-600 underline-offset-4"
                                        >
                                            Read more <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-500">No active announcements.</p>
                                )}
                            </div>
                        </div>
                        {/* Admin Create Action */}
                        {isHRAdmin && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                                <Button
                                    onClick={() => setIsCreateAnnouncementOpen(true)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-slate-900 font-medium text-xs"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Create Announcement
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Read Announcement Dialog */}
            <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
                {latestAnnouncement && (
                    <DialogContent className="max-w-xl bg-white p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-4 border-b border-slate-50">
                            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Megaphone className="h-6 w-6 text-rose-500" /> Announcement Details
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{latestAnnouncement.title}</h3>
                            <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">
                                {latestAnnouncement.content}
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Posted by {latestAnnouncement.posted_by_name || 'Admin'}</span>
                                <span className="text-sm font-bold text-slate-900">{new Date(latestAnnouncement.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Button onClick={() => setIsAnnouncementOpen(false)} className="bg-slate-900 text-white rounded-xl px-6">
                                    Close Announcement
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>

            {/* Create Announcement Dialog */}
            <Dialog open={isCreateAnnouncementOpen} onOpenChange={setIsCreateAnnouncementOpen}>
                <DialogContent className="max-w-xl bg-white p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4 border-b border-slate-50">
                        <DialogTitle className="text-2xl font-bold text-slate-900">
                            New Announcement
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAnnouncement} className="p-8 space-y-4">
                        <div className="space-y-2">
                            <label className='text-sm font-bold text-slate-700'>Title</label>
                            <Input
                                required
                                placeholder="e.g. Office Holiday Party"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className='text-sm font-bold text-slate-700'>Content</label>
                            <textarea
                                required
                                placeholder="Write your announcement here..."
                                value={newAnnouncement.content}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                className="w-full p-3 min-h-[150px] bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none resize-none text-sm"
                            />
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsCreateAnnouncementOpen(false)} className="text-slate-500 rounded-xl px-6">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-slate-900 text-white rounded-xl px-6 shadow-lg shadow-slate-900/20">
                                {isCreatingAnnouncement ? 'Posting...' : 'Post Announcement'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

        </motion.div>
    );
};

const StatCard = ({ title, value, change, icon: Icon, color, loading }) => {
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
                {loading ? null : change && (
                    <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span className="text-slate-600">{change}</span>
                    </div>
                )}
            </div>
            <div>
                {loading ? (
                    <Skeleton className="h-9 w-24 mb-2" />
                ) : (
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
                )}
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
