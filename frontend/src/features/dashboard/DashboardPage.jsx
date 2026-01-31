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
    Plus, Megaphone, CreditCard, FileText, Layout, File
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    useGetEmployeeStatsQuery,
    useGetLeaveRequestsQuery,
    useGetAnnouncementsQuery,
    useCreateAnnouncementMutation
} from '../../store/api';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { Skeleton } from '../../components/ui/Skeleton';
import { ROLES, canAccess } from '../../utils/rbac';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
    const { data: stats, isLoading: statsLoading } = useGetEmployeeStatsQuery();
    const { data: leaveRequests, isLoading: leaveLoading } = useGetLeaveRequestsQuery({ status: 'pending' });
    const { data: announcements, isLoading: announcementsLoading } = useGetAnnouncementsQuery();

    const [createAnnouncement, { isLoading: isCreatingAnnouncement }] = useCreateAnnouncementMutation();

    const isHRAdmin = canAccess(user?.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER]);
    const isManager = canAccess(user?.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER, ROLES.MANAGER]);

    const pendingRequests = (leaveRequests?.results || leaveRequests || []).filter(r => r.status === 'pending');
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
            toast.success('Announcement posted');
            setIsCreateAnnouncementOpen(false);
            setNewAnnouncement({ title: '', content: '' });
        } catch (error) {
            toast.error('Failed to post');
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Minimal Header */}
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-notion-text">
                    Welcome back, {user.first_name || 'Admin'}
                </h1>
                <p className="text-lg text-notion-text-light max-w-2xl">
                    {isHRAdmin
                        ? "Overview of your organization's operations and team activities."
                        : "Your daily workplace summary and quick actions."}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                    <Link to="/leave">
                        <Button variant="outline" className="btn-notion-outline h-8">
                            <Calendar className="mr-2 h-3.5 w-3.5" /> Request leave
                        </Button>
                    </Link>
                    {isHRAdmin && (
                        <Link to="/employees/new">
                            <Button className="btn-notion-primary h-8">
                                <Plus className="mr-2 h-3.5 w-3.5" /> Add employee
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Flat Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MinimalStatCard
                    title={isHRAdmin ? "Total employees" : "My team"}
                    value={isHRAdmin ? (stats?.total || 0) : (stats?.subordinates_count || 0)}
                    icon={Users}
                    loading={statsLoading}
                />
                <MinimalStatCard
                    title="On leave today"
                    value={stats?.on_leave || 0}
                    icon={Calendar}
                    loading={statsLoading}
                />
                <MinimalStatCard
                    title={isHRAdmin ? "Open positions" : "Tasks done"}
                    value={isHRAdmin ? (stats?.open_positions || 0) : "85%"}
                    icon={CheckCircle2}
                    loading={statsLoading}
                />
                <MinimalStatCard
                    title="Required attention"
                    value={(isManager ? pendingRequests.length : 0) + (stats?.pending_tasks || 0)}
                    icon={Bell}
                    loading={statsLoading || leaveLoading}
                />
            </div>

            {/* Simple Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Activity Section */}
                    <section className="space-y-6">
                        <h3 className="text-xl font-semibold border-b border-notion-border pb-2">Recent activity</h3>
                        {isManager && pendingRequests.length > 0 ? (
                            <div className="space-y-px">
                                {pendingRequests.slice(0, 3).map((request) => (
                                    <div key={request.id} className="flex items-center justify-between py-3 px-2 hover:bg-notion-hover rounded-md group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-notion-sidebar flex items-center justify-center text-xs font-bold uppercase">
                                                {request.employee_name?.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{request.employee_name}</p>
                                                <p className="text-xs text-notion-text-light">{request.leave_type_name} • {request.days_requested} days</p>
                                            </div>
                                        </div>
                                        <Link to="/leave/approvals">
                                            <button className="text-xs font-medium text-notion-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                Review
                                            </button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-notion-text-light px-2 italic">No new pending requests.</p>
                        )}
                    </section>

                    {/* Department Headcount */}
                    {isHRAdmin && stats?.departments && (
                        <section className="space-y-6">
                            <h3 className="text-xl font-semibold border-b border-notion-border pb-2">Teams</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(stats.departments).map(([dept, count], idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-notion-border hover:bg-notion-sidebar transition-colors">
                                        <span className="text-sm font-medium capitalize">{dept}</span>
                                        <span className="text-xs font-bold text-notion-text-light bg-notion-border px-1.5 py-0.5 rounded">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-12">
                    {/* Quick Links */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-notion-text-light uppercase tracking-wider">Shortcuts</h3>
                        <div className="space-y-1">
                            {[
                                { to: "/employees", icon: Users, label: "All employees", roles: [ROLES.MANAGER, ROLES.HR_MANAGER, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN] },
                                { to: "/attendance", icon: Clock, label: "Attendance log" },
                                { to: "/payroll/my-payslips", icon: CreditCard, label: "My payslips" },
                                { to: "/leave", icon: Calendar, label: "Leave portal" },
                                { to: "/documents", icon: FileText, label: "Shared files" },
                            ].filter(item => !item.roles || item.roles.includes(user.role))
                                .map((link, idx) => (
                                    <Link key={idx} to={link.to} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-notion-hover text-sm text-notion-text-light hover:text-notion-text transition-colors">
                                        <link.icon className="h-4 w-4" />
                                        <span>{link.label}</span>
                                    </Link>
                                ))}
                        </div>
                    </section>

                    {/* Announcements */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-notion-text-light uppercase tracking-wider">Updates</h3>
                        <div className="p-4 rounded-lg bg-notion-sidebar border border-notion-border">
                            {latestAnnouncement ? (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold truncate">{latestAnnouncement.title}</h4>
                                    <p className="text-xs text-notion-text-light line-clamp-3 leading-relaxed">
                                        {latestAnnouncement.content}
                                    </p>
                                    <button
                                        onClick={() => setIsAnnouncementOpen(true)}
                                        className="text-[11px] font-bold text-notion-primary hover:underline pt-1"
                                    >
                                        View details
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-notion-text-light italic">No current updates.</p>
                            )}
                            {isHRAdmin && (
                                <button
                                    onClick={() => setIsCreateAnnouncementOpen(true)}
                                    className="mt-4 w-full py-1.5 border border-dashed border-notion-border rounded text-[11px] font-medium text-notion-text-light hover:bg-notion-hover transition-colors"
                                >
                                    + Post update
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Read Announcement Dialog */}
            <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
                {latestAnnouncement && (
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Announcement</DialogTitle>
                        </DialogHeader>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold">{latestAnnouncement.title}</h3>
                                <p className="text-notion-text leading-relaxed whitespace-pre-wrap">
                                    {latestAnnouncement.content}
                                </p>
                            </div>
                            <div className="flex border-t border-notion-border pt-4 text-xs text-notion-text-light">
                                <span>Posted by {latestAnnouncement.posted_by_name || 'Admin'}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(latestAnnouncement.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>

            {/* Create Announcement Dialog */}
            <Dialog open={isCreateAnnouncementOpen} onOpenChange={setIsCreateAnnouncementOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Post Update</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-notion-text-light">Subject</label>
                            <Input
                                required
                                placeholder="Update title"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                className="input-notion focus:ring-notion-text"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-notion-text-light">Message</label>
                            <textarea
                                required
                                placeholder="Message content..."
                                value={newAnnouncement.content}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                className="w-full p-2 border border-notion-border rounded-md min-h-[120px] bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-notion-text"
                            />
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsCreateAnnouncementOpen(false)} className="h-8">
                                Cancel
                            </Button>
                            <Button type="submit" className="btn-notion-primary h-8" disabled={isCreatingAnnouncement}>
                                {isCreatingAnnouncement ? 'Posting...' : 'Post'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const MinimalStatCard = ({ title, value, icon: Icon, loading }) => (
    <div className="p-6 rounded-lg border border-notion-border hover:bg-notion-sidebar transition-colors">
        <div className="flex items-start justify-between mb-4">
            <span className="text-sm font-medium text-notion-text-light">{title}</span>
            <Icon className="h-4 w-4 text-notion-text-light opacity-60" />
        </div>
        {loading ? (
            <Skeleton className="h-8 w-16" />
        ) : (
            <h3 className="text-3xl font-bold tracking-tight text-notion-text">{value}</h3>
        )}
    </div>
);

export default DashboardPage;
