import React, { useState } from 'react';
import {
    useGetGoalsQuery,
    useGetReviewsQuery,
    useGetReviewStatsQuery,
    useCreateGoalMutation,
    useUpdateGoalMutation,
    useDeleteGoalMutation,
    useGetCurrentUserQuery,
    useUpdateReviewMutation,
    useGetPerformanceCyclesQuery,
    useCreatePerformanceCycleMutation,
    useUpdatePerformanceCycleMutation,
    useDeletePerformanceCycleMutation,
    useGetTeamGoalsQuery,
    useGetEmployeesQuery,
    useCreateReviewMutation,
    useRequest360Mutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import {
    Target, FileText, Plus, CheckCircle, Clock,
    TrendingUp, BarChart3, Star, User, ChevronRight,
    ArrowUpRight, AlertCircle, Calendar, Trophy, Zap,
    Settings, Users, ShieldCheck, Map, Layout, Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const PerformancePage = () => {
    const { data: user } = useGetCurrentUserQuery();
    const { data: stats } = useGetReviewStatsQuery();

    return (
        <div className="space-y-8 pb-20 animate-fade-in font-sans">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-primary-600" />
                        Performance Hub
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">
                        Precision tracking for enterprise objectives and talent evolution.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest px-6">
                        Export Report
                    </Button>
                    <Button className="rounded-xl bg-slate-900 shadow-xl shadow-slate-900/20 font-bold uppercase text-[10px] tracking-widest px-6">
                        Growth Plan
                    </Button>
                </div>
            </div>

            {/* Tactical Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Avg Rating"
                    value={stats?.average_rating || '4.2'}
                    subtitle="Last 12 Months"
                    icon={<BarChart3 className="h-6 w-6 text-indigo-600" />}
                    trend="+0.3"
                    color="from-indigo-50 to-white"
                    borderColor="border-indigo-100"
                />
                <StatCard
                    title="Active OKRs"
                    value={stats?.active_goals ?? 8}
                    subtitle="In Progress"
                    icon={<Target className="h-6 w-6 text-emerald-600" />}
                    trend="2 New"
                    color="from-emerald-50 to-white"
                    borderColor="border-emerald-100"
                />
                <StatCard
                    title="Review Velocity"
                    value={stats?.completed_reviews ?? 14}
                    subtitle="Cycle Integrity"
                    icon={<Zap className="h-6 w-6 text-amber-600" />}
                    trend="98%"
                    color="from-amber-50 to-white"
                    borderColor="border-amber-100"
                />
                <StatCard
                    title="Pending Ops"
                    value={stats?.pending_reviews ?? 3}
                    subtitle="Action Required"
                    icon={<Clock className="h-6 w-6 text-rose-600" />}
                    trend="High"
                    color="from-rose-50 to-white"
                    borderColor="border-rose-100"
                />
            </div>

            {/* Performance Control Center */}
            <Tabs defaultValue="goals" className="space-y-8">
                <TabsList className="bg-slate-50 p-1.5 w-fit rounded-2xl border border-slate-100 shadow-inner overflow-x-auto flex">
                    <TabsTrigger
                        value="goals"
                        className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest text-slate-500 whitespace-nowrap"
                    >
                        <Target className="h-4 w-4 mr-2" /> Strategic Goals
                    </TabsTrigger>
                    <TabsTrigger
                        value="reviews"
                        className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest text-slate-500 whitespace-nowrap"
                    >
                        <FileText className="h-4 w-4 mr-2" /> Review Cycles
                    </TabsTrigger>

                    {(user?.role === 'hr_manager' || user?.role === 'company_admin' || user?.role === 'manager') && (
                        <TabsTrigger
                            value="team"
                            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest text-slate-500 whitespace-nowrap"
                        >
                            <Users className="h-4 w-4 mr-2" /> Team Intelligence
                        </TabsTrigger>
                    )}

                    {(user?.role === 'hr_manager' || user?.role === 'company_admin') && (
                        <TabsTrigger
                            value="governance"
                            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest text-slate-500 whitespace-nowrap"
                        >
                            <ShieldCheck className="h-4 w-4 mr-2" /> Governance Matrix
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="goals" className="mt-0 space-y-8">
                    <GoalsSection user={user} />
                </TabsContent>

                <TabsContent value="reviews" className="mt-0 space-y-8">
                    <ReviewsSection user={user} />
                </TabsContent>

                <TabsContent value="team" className="mt-0 space-y-8">
                    <TeamSection user={user} />
                </TabsContent>

                <TabsContent value="governance" className="mt-0 space-y-8">
                    <GovernanceSection user={user} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon, trend, color, borderColor }) => (
    <Card className={cn("border-2 shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-500", borderColor)}>
        <CardContent className={cn("p-8 bg-gradient-to-br", color)}>
            <div className="flex items-start justify-between">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</span>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">{value}</h3>
                    <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{trend}</span>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
            </div>
        </CardContent>
    </Card>
);

const GoalsSection = ({ user }) => {
    const { data: goalsData, isLoading } = useGetGoalsQuery({ my_goals: true });
    const goals = goalsData?.results || goalsData || [];
    const [createGoal] = useCreateGoalMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createGoal(formData).unwrap();
            toast.success("OKR deployed successfully!");
            setIsDialogOpen(false);
            setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
        } catch (error) {
            toast.error("Deployment failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[2rem] text-white">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-widest italic">Personal OKR Matrix</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase mt-1">High-impact objectives for the current cycle</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-2xl">
                            <Plus className="h-5 w-5 mr-2" /> Initiate Objective
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-xl">
                        <div className="bg-slate-900 p-8 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                    <Target className="h-6 w-6 text-primary-400" /> Goal Configuration
                                </DialogTitle>
                            </DialogHeader>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Tactical Objective Title</label>
                                <input
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Optimize CI/CD Pipeline Efficiency"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Description & Key Results</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all outline-none min-h-[120px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detail the metrics for success..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Criticality</label>
                                    <select
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold focus:bg-white outline-none"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">Mission Critical</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Hard Deadline</label>
                                    <input
                                        type="date"
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold focus:bg-white outline-none"
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={() => setIsDialogOpen(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest">Abort</Button>
                                <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-slate-900 font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/20">Commit Objective</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[2rem] animate-pulse"></div>)}
                </div>
            ) : !goals?.length ? (
                <Card className="border-none shadow-xl shadow-slate-100 bg-white rounded-[3rem] p-20 text-center">
                    <div className="inline-flex p-8 bg-slate-50 rounded-full mb-8">
                        <Target className="h-12 w-12 text-slate-300" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tighter">No Active Objectives</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-sm mx-auto leading-loose">
                        Your performance matrix is currently empty. Initialize a new mission-critical objective to track progress.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {goals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} />
                    ))}
                </div>
            )}
        </div>
    );
};

const GoalCard = ({ goal }) => {
    const [updateGoal] = useUpdateGoalMutation();
    const [deleteGoal] = useDeleteGoalMutation();

    const handleProgress = async (val) => {
        try {
            await updateGoal({ id: goal.id, progress: val }).unwrap();
            if (val === 100) await updateGoal({ id: goal.id, status: 'completed' }).unwrap();
            toast.success("Progress synchronized");
        } catch (e) {
            toast.error("Sync failed");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Terminate this objective permanentely?')) {
            await deleteGoal(goal.id);
            toast.success('Objective purged');
        }
    };

    const isHigh = goal.priority === 'high';
    const isCompleted = goal.status === 'completed';

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500">
            <CardContent className="p-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h4 className={cn(
                                "text-xl font-black uppercase tracking-tighter italic transition-colors",
                                isCompleted ? 'text-slate-300 line-through' : 'text-slate-900 group-hover:text-primary-600'
                            )}>
                                {goal.title}
                            </h4>
                            <Badge className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-none shadow-sm",
                                isHigh ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'
                            )}>
                                {goal.priority}
                            </Badge>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase leading-relaxed max-w-md italic tracking-wider">
                            {goal.description}
                        </p>
                    </div>
                    {isCompleted ? (
                        <div className="p-3 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/30">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                    ) : (
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Target Date</p>
                            <p className="text-xs font-black text-slate-900 italic">{new Date(goal.due_date).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Efficiency Index</span>
                            <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-4 rounded-full p-1 overflow-hidden shadow-inner">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000 shadow-sm",
                                    isCompleted ? 'bg-emerald-500' : 'bg-slate-900'
                                )}
                                style={{ width: `${goal.progress}%` }}
                            />
                        </div>
                    </div>

                    {!isCompleted && (
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-8">
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="rounded-xl border-2 font-black text-[10px] uppercase tracking-widest h-10 px-4" onClick={() => handleProgress(Math.min(100, goal.progress + 10))}>
                                    +10%
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-xl border-2 font-black text-[10px] uppercase tracking-widest h-10 px-4 bg-slate-900 text-white border-slate-900 hover:bg-slate-800" onClick={() => handleProgress(100)}>
                                    Finalize
                                </Button>
                            </div>
                            <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest h-10 rounded-xl" onClick={handleDelete}>
                                Terminate
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const ReviewsSection = ({ user }) => {
    const { data: reviewsData, isLoading } = useGetReviewsQuery({ my_reviews: true });
    const reviews = reviewsData?.results || reviewsData || [];
    const [selectedReview, setSelectedReview] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

    if (isLoading) return <div className="grid gap-6">{[1, 2].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[2rem] animate-pulse"></div>)}</div>;

    if (!reviews?.length) {
        return (
            <Card className="border-none shadow-xl shadow-slate-100 bg-white rounded-[3rem] p-20 text-center">
                <div className="inline-flex p-8 bg-slate-50 rounded-full mb-8">
                    <FileText className="h-12 w-12 text-slate-300" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tighter">Archive Empty</h4>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-sm mx-auto leading-loose">
                    No performance review cycles found in the system registry.
                </p>
            </Card>
        );
    }

    const openReview = (review) => {
        setSelectedReview(review);
        setIsReviewOpen(true);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map(review => (
                <Card key={review.id} className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-0">
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-black uppercase tracking-tighter italic">{review.cycle_name || 'Standard Cycle'}</h4>
                                    <Badge className="bg-primary-500 text-white border-none rounded-lg font-black text-[9px] p-1.5 uppercase">v1.2</Badge>
                                </div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">Authority: {review.reviewer_name || 'Hiring Board'}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black italic tracking-tighter text-primary-400">
                                    {review.overall_rating > 0 ? review.overall_rating : '--'}
                                </div>
                                <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1">Efficiency Score</div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center justify-between">
                                <Badge className={cn(
                                    "px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest",
                                    review.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                                        review.status === 'submitted' ? 'bg-indigo-50 text-indigo-700' :
                                            review.status === 'acknowledged' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'
                                )}>
                                    Status: {review.status.replace('_', ' ')}
                                </Badge>
                                <Button variant="ghost" onClick={() => openReview(review)} className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-900 hover:bg-slate-50 group">
                                    Full Telemetry <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Review Details Dialog */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-[3rem] shadow-2xl font-sans">
                    {selectedReview && (
                        <div className="flex flex-col">
                            <div className="bg-slate-900 p-12 text-white">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-20 w-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-600/30">
                                                {selectedReview.employee_name?.[0] || 'E'}
                                            </div>
                                            <div>
                                                <h1 className="text-3xl font-black italic tracking-tighter uppercase">{selectedReview.employee_name || 'System User'}</h1>
                                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2 mt-2">
                                                    <Calendar className="h-3 w-3" /> Cycle: {selectedReview.cycle_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 italic">Aggregate Quotient</div>
                                        <div className="text-7xl font-black italic tracking-tightest text-primary-400 tabular-nums leading-none">
                                            {selectedReview.overall_rating || '--'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-12 space-y-12 bg-white">
                                {/* Rating Matrix */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
                                            <BarChart3 className="h-5 w-5 text-indigo-500" /> Competency Matrix
                                        </h3>
                                        <div className="space-y-6">
                                            <RatingRow label="Technical Prowess" value={selectedReview.technical_skills} />
                                            <RatingRow label="Network Comms" value={selectedReview.communication} />
                                            <RatingRow label="Synergy / Teamwork" value={selectedReview.teamwork} />
                                            <RatingRow label="Output Velocity" value={selectedReview.productivity} />
                                            <RatingRow label="Strategic Initiative" value={selectedReview.initiative} />
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-indigo-500" /> Performance Context
                                        </h3>
                                        <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-inner space-y-8">
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Managerial Feedback</h4>
                                                <p className="text-xs font-bold text-slate-700 leading-loose italic">
                                                    {selectedReview.manager_feedback || "No feedback recorded in this terminal."}
                                                </p>
                                            </div>
                                            <div className="space-y-3 pt-6 border-t border-slate-200/50">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Growth Trajectory</h4>
                                                <p className="text-xs font-bold text-slate-700 leading-loose italic">
                                                    {selectedReview.opportunities_for_improvement || "Critical growth optimizations not specified."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Employee Response */}
                                <div className="space-y-8">
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
                                        <User className="h-5 w-5 text-indigo-500" /> Self-Reflection Log
                                    </h3>
                                    <div className="bg-primary-50 rounded-[2rem] p-10 border border-primary-100 italic">
                                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                                            {selectedReview.employee_self_review || "Self-review pending synchronization."}
                                        </p>
                                    </div>
                                </div>

                                {/* Control Bar */}
                                <div className="pt-12 border-t border-slate-100 flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <Button variant="outline" className="rounded-2xl h-14 px-10 border-2 font-black uppercase text-xs tracking-widest">Generate PDF</Button>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button onClick={() => setIsReviewOpen(false)} variant="ghost" className="rounded-2xl h-14 px-10 font-black uppercase text-xs tracking-widest">Close Terminal</Button>
                                        {selectedReview.status === 'submitted' && (
                                            <Button className="bg-slate-900 text-white rounded-2xl h-14 px-12 font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-900/20">Acknowledge Results</Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const RatingRow = ({ label, value }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <Trophy key={i} className={cn(
                        "h-4 w-4",
                        i <= value ? "text-amber-500 fill-amber-500" : "text-slate-100"
                    )} />
                ))}
            </div>
        </div>
        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
        </div>
    </div>
);

const TeamSection = ({ user }) => {
    const { data: teamGoalsData, isLoading } = useGetTeamGoalsQuery();
    const teamGoals = teamGoalsData || [];
    const { data: employeesData } = useGetEmployeesQuery();
    const employees = employeesData?.results || employeesData || [];

    const [createReview] = useCreateReviewMutation();
    const [request360] = useRequest360Mutation();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [is360ModalOpen, setIs360ModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const { data: cycles } = useGetPerformanceCyclesQuery();

    const [threeSixtyForm, setThreeSixtyForm] = useState({
        cycle: '',
        employee: '',
        reviewers: []
    });

    const [reviewForm, setReviewForm] = useState({
        cycle: '',
        employee: '',
        reviewer: user?.employee,
        technical_skills: 3,
        communication: 3,
        teamwork: 3,
        productivity: 3,
        initiative: 3,
        manager_feedback: '',
        status: 'draft'
    });

    const handleInitiateReview = (empId) => {
        setReviewForm({ ...reviewForm, employee: empId });
        setIsReviewModalOpen(true);
    };

    const handleInitiate360 = (empId) => {
        setThreeSixtyForm({ ...threeSixtyForm, employee: empId });
        setIs360ModalOpen(true);
    };

    const handleSubmit360 = async (e) => {
        e.preventDefault();
        try {
            await request360(threeSixtyForm).unwrap();
            toast.success("360 Feedback Loop Initiated");
            setIs360ModalOpen(false);
        } catch (error) {
            toast.error("Failed to initiate feedback loop");
        }
    };


    return (
        <div className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-widest italic">Team Objective Overlook</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase mt-1">Cross-departmental performance monitoring</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {isLoading ? (
                    [1, 2].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[2rem] animate-pulse"></div>)
                ) : teamGoals.length === 0 ? (
                    <Card className="col-span-full border-none shadow-xl shadow-slate-100 bg-white rounded-[3rem] p-20 text-center">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-6" />
                        <h4 className="text-xl font-black text-slate-900 uppercase italic">No Team Directives Found</h4>
                    </Card>
                ) : (
                    teamGoals.map(goal => (
                        <Card key={goal.id} className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-8 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge className="bg-indigo-100 text-indigo-700 border-none rounded-lg text-[8px] font-black uppercase tracking-[0.2em] mb-2">
                                            {goal.employee_name}
                                        </Badge>
                                        <h4 className="text-lg font-black text-slate-900 uppercase italic leading-none">{goal.title}</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleInitiate360(goal.employee)}
                                            variant="outline"
                                            className="rounded-xl h-10 border-2 text-[9px] font-black uppercase tracking-widest"
                                        >
                                            Request 360
                                        </Button>
                                        <Button
                                            onClick={() => handleInitiateReview(goal.employee)}
                                            className="bg-slate-900 rounded-xl h-10 text-[9px] font-black uppercase tracking-widest shadow-lg"
                                        >
                                            Audit Talent
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase text-slate-400">Momentum</span>
                                        <span className="text-sm font-black italic">{goal.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${goal.progress}%` }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Review Initiation Modal */}
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                <DialogContent className="max-w-2xl p-0 border-none rounded-[3rem] overflow-hidden shadow-2xl font-sans">
                    <div className="bg-slate-900 p-8 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                <Zap className="h-6 w-6 text-primary-400" /> Talent Audit Terminal
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <form onSubmit={handleSubmitReview} className="p-10 space-y-8 bg-white">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Evaluation Cycle</label>
                                <select
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold outline-none focus:bg-white"
                                    value={reviewForm.cycle}
                                    onChange={e => setReviewForm({ ...reviewForm, cycle: e.target.value })}
                                    required
                                >
                                    <option value="">Select Target Cycle</option>
                                    {cycles?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Initial Status</label>
                                <select
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold outline-none focus:bg-white"
                                    value={reviewForm.status}
                                    onChange={e => setReviewForm({ ...reviewForm, status: e.target.value })}
                                >
                                    <option value="draft">Save as Draft</option>
                                    <option value="submitted">Deploy to Persona</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 border-b border-slate-100 pb-2">Competency Scoring (1-5)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <RatingInput label="Technical Prowess" value={reviewForm.technical_skills} onChange={v => setReviewForm({ ...reviewForm, technical_skills: v })} />
                                <RatingInput label="Architecture Comms" value={reviewForm.communication} onChange={v => setReviewForm({ ...reviewForm, communication: v })} />
                                <RatingInput label="Corporate Synergy" value={reviewForm.teamwork} onChange={v => setReviewForm({ ...reviewForm, teamwork: v })} />
                                <RatingInput label="Output Velocity" value={reviewForm.productivity} onChange={v => setReviewForm({ ...reviewForm, productivity: v })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Qualitative Feedback</label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-bold focus:bg-white outline-none min-h-[120px]"
                                placeholder="Detail performance observations and objective deviations..."
                                value={reviewForm.manager_feedback}
                                onChange={e => setReviewForm({ ...reviewForm, manager_feedback: e.target.value })}
                            />
                        </div>

                    </form>
                </DialogContent>
            </Dialog>

            {/* 360 Feedback Modal */}
            <Dialog open={is360ModalOpen} onOpenChange={setIs360ModalOpen}>
                <DialogContent className="max-w-2xl p-0 border-none rounded-[3rem] overflow-hidden shadow-2xl font-sans bg-white">
                    <div className="bg-slate-900 p-10 text-white">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                            <Users className="h-6 w-6 text-primary-400" /> 360 Pulse Initiation
                        </DialogTitle>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Select stakeholders for multi-vector evaluation.</p>
                    </div>
                    <form onSubmit={handleSubmit360} className="p-10 space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Active Cycle</label>
                            <select
                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold outline-none focus:bg-white transition-all text-slate-900"
                                value={threeSixtyForm.cycle}
                                onChange={e => setThreeSixtyForm({ ...threeSixtyForm, cycle: e.target.value })}
                                required
                            >
                                <option value="">Select Evaluation Cycle</option>
                                {cycles?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Engagement Matrix (Reviewers)</label>
                            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner">
                                {employees?.filter(e => e.id !== threeSixtyForm.employee).map(emp => (
                                    <div
                                        key={emp.id}
                                        onClick={() => {
                                            const current = threeSixtyForm.reviewers;
                                            const updated = current.includes(emp.id)
                                                ? current.filter(id => id !== emp.id)
                                                : [...current, emp.id];
                                            setThreeSixtyForm({ ...threeSixtyForm, reviewers: updated });
                                        }}
                                        className={cn(
                                            "p-4 rounded-xl cursor-pointer transition-all border-2 flex items-center gap-3",
                                            threeSixtyForm.reviewers.includes(emp.id)
                                                ? "bg-primary-900 border-primary-900 text-white shadow-lg"
                                                : "bg-white border-white hover:border-slate-200 text-slate-600"
                                        )}
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black group-hover:bg-white text-slate-900">
                                            {emp.first_name[0]}{emp.last_name[0]}
                                        </div>
                                        <span className="text-[10px] font-black uppercase truncate">{emp.full_name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" onClick={() => setIs360ModalOpen(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                            <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl">Broadcast Requests</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const GovernanceSection = ({ user }) => {
    const { data: cycles, isLoading } = useGetPerformanceCyclesQuery();
    const [createCycle] = useCreatePerformanceCycleMutation();
    const [updateCycle] = useUpdatePerformanceCycleMutation();
    const [deleteCycle] = useDeletePerformanceCycleMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        status: 'draft',
        description: ''
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createCycle(formData).unwrap();
            toast.success("Governance cycle registered");
            setIsModalOpen(false);
        } catch (e) {
            toast.error("Registration failed");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Terminate this governance period permanently?')) {
            await deleteCycle(id);
            toast.success("Cycle purged from registry");
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex justify-between items-center shadow-2xl shadow-slate-900/20">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                        <Map className="h-6 w-6 text-primary-400" /> Cycle Orchestration
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase mt-1">Institutional review period configuration</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-2xl">
                    <Plus className="h-5 w-5 mr-2" /> Initialize Cycle
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isLoading ? (
                    [1, 2].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[2rem] animate-pulse"></div>)
                ) : cycles?.map(cycle => (
                    <Card key={cycle.id} className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group">
                        <CardContent className="p-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-slate-900 uppercase italic group-hover:text-primary-600 transition-colors">{cycle.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <Badge className={cn(
                                            "rounded-xl border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5",
                                            cycle.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                                        )}>
                                            {cycle.status}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cycle.start_date} → {cycle.end_date}</span>
                                    </div>
                                </div>
                                <Button onClick={() => handleDelete(cycle.id)} variant="ghost" className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-10 w-10 p-0">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">{cycle.description || "No strategic objectives defined for this period."}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-xl p-0 border-none rounded-[3rem] overflow-hidden shadow-2xl font-sans">
                    <div className="bg-slate-900 p-8 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                            <Layout className="h-6 w-6 text-primary-400" /> Cycle Configuration
                        </DialogTitle>
                    </div>
                    <form onSubmit={handleCreate} className="p-10 space-y-6 bg-white">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Canonical Period Name</label>
                            <Input
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all"
                                placeholder="e.g. 2026 STRATEGIC Q1"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Launch Date</label>
                                <Input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Termination Date</label>
                                <Input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} required className="h-12 rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Strategic Description</label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-bold focus:bg-white outline-none min-h-[100px]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Strategic focus for this evaluation window..."
                            />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button type="button" onClick={() => setIsModalOpen(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest">Abort</Button>
                            <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-xl">Deploy Cycle</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const RatingInput = ({ label, value, onChange }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
            <span className="text-xl font-black italic text-primary-600">{value}/5</span>
        </div>
        <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map(i => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onChange(i)}
                    className={cn(
                        "flex-1 h-12 rounded-xl border-2 transition-all font-black text-sm",
                        i <= value
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                            : "border-slate-50 bg-slate-50/50 text-slate-300 hover:border-slate-200"
                    )}
                >
                    {i}
                </button>
            ))}
        </div>
    </div>
);

export default PerformancePage;
