import React, { useState } from 'react';
import {
    useGetGoalsQuery,
    useGetReviewsQuery,
    useGetReviewStatsQuery,
    useCreateGoalMutation,
    useUpdateGoalMutation,
    useDeleteGoalMutation,
    useGetCurrentUserQuery,
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
    Target, FileText, Plus, CheckCircle, Clock,
    TrendingUp, BarChart3, Star, Trash2, Calendar, ChevronRight, Flag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { exportToCSV } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const PerformancePage = () => {
    const { data: user } = useGetCurrentUserQuery();
    const { data: stats } = useGetReviewStatsQuery();

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
                    <p className="text-gray-600 mt-1">Track your goals, achievements, and reviews.</p>
                </div>
                <div className="flex gap-3">
                    {/* Actions if needed */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Rating</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.average_rating || '4.2'}</p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Goals</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.active_goals ?? 0}</p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Reviews</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.completed_reviews ?? 0}</p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Actions</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.pending_reviews ?? 0}</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="goals" className="space-y-6">
                <TabsList className="bg-white p-1 border border-slate-200 rounded lg shadow-sm inline-flex h-auto w-auto">
                    <TabsTrigger
                        value="goals"
                        className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 px-6 py-2.5 rounded text-slate-600 font-medium transition-all"
                    >
                        Goals
                    </TabsTrigger>
                    <TabsTrigger
                        value="reviews"
                        className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 px-6 py-2.5 rounded text-slate-600 font-medium transition-all"
                    >
                        Reviews
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <GoalsSection user={user} />
                </TabsContent>

                <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ReviewsSection user={user} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const GoalsSection = ({ user }) => {
    const { data: goalsData, isLoading } = useGetGoalsQuery({ my_goals: true });
    const goals = goalsData?.results || goalsData || [];
    const [createGoal, { isLoading: isCreating }] = useCreateGoalMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
    });

    const handleExport = () => {
        if (!goals || goals.length === 0) {
            toast.error("No goals to export");
            return;
        }

        const exportData = goals.map(g => ({
            Title: g.title,
            Description: g.description,
            Status: g.status,
            Priority: g.priority,
            Progress: `${g.progress}%`,
            'Due Date': g.due_date || 'N/A'
        }));

        exportToCSV(exportData, `my_goals_${new Date().toISOString().split('T')[0]}`);
        toast.success("Goals exported successfully");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createGoal(formData).unwrap();
            toast.success("Goal created successfully!");
            setIsDialogOpen(false);
            setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
        } catch (error) {
            toast.error("Failed to create goal");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">My Goals</h3>
                    <p className="text-sm text-gray-500">Set and track your professional objectives</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="border-gray-200 text-gray-600 hover:bg-gray-100 h-10 px-4"
                    >
                        Export
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-200 h-10 px-4">
                                <Plus className="h-4 w-4 mr-2" /> New Goal
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl bg-white p-0 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                                <DialogTitle className="text-xl font-semibold text-slate-800 uppercase tracking-tight">Create New Goal</DialogTitle>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Goal Title</label>
                                    <input
                                        className="w-full h-10 px-3 rounded border border-slate-300 bg-white text-sm text-slate-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-all"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="Goal Title"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        className="w-full p-3 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-all resize-none"
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Description"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Priority</label>
                                        <select
                                            className="w-full h-10 px-3 rounded border border-slate-300 bg-white text-sm text-slate-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-all appearance-none cursor-pointer"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Due Date</label>
                                        <input
                                            type="date"
                                            className="w-full h-10 px-3 rounded border border-slate-300 bg-white text-sm text-slate-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-all"
                                            value={formData.due_date}
                                            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="w-48 h-10 border border-green-600 text-green-600 hover:bg-green-50 font-medium rounded text-sm transition-colors uppercase"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="w-48 h-10 bg-[#88B072] hover:bg-[#7aa265] text-white font-medium rounded text-sm transition-colors uppercase disabled:opacity-50"
                                    >
                                        {isCreating ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>)}
                </div>
            ) : !goals?.length ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No goals set</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Goals help you stay focused and track your professional growth.</p>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white">
                        <Plus className="h-4 w-4 mr-2" /> Create First Goal
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            toast.success("Progress updated");
        } catch (e) {
            toast.error("Failed to update");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this goal?')) {
            await deleteGoal(goal.id);
            toast.success('Goal deleted');
        }
    };

    const isCompleted = goal.status === 'completed';

    const priorityColors = {
        low: 'bg-slate-100 text-slate-700 border-slate-200',
        medium: 'bg-green-50 text-green-700 border-green-100',
        high: 'bg-rose-50 text-rose-700 border-rose-100'
    };

    return (
        <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityColors[goal.priority]}`}>
                                {goal.priority}
                            </span>
                            {goal.due_date && (
                                <span className="text-xs text-slate-500">
                                    Due: {new Date(goal.due_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <h4 className={`text-lg font-semibold text-slate-900 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                            {goal.title}
                        </h4>
                    </div>
                    {isCompleted ? (
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                    ) : (
                        <button className="h-8 w-8 text-slate-400 hover:text-rose-600 transition-colors" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <p className="text-sm text-slate-600 mb-6 line-clamp-2 min-h-[2.5em]">
                    {goal.description || "No description provided."}
                </p>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-500 uppercase tracking-wider">Progress</span>
                        <span className={`px-2 py-0.5 rounded ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-900'}`}>
                            {goal.progress}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-600' : 'bg-[#88B072]'}`}
                            style={{ width: `${goal.progress}%` }}
                        />
                    </div>
                </div>

                {!isCompleted && (
                    <div className="flex justify-between items-center pt-5 mt-5 border-t border-slate-100">
                        <button
                            onClick={() => handleProgress(Math.min(100, goal.progress + 10))}
                            className="text-xs font-semibold text-green-600 hover:text-green-700 uppercase tracking-wider"
                        >
                            +10% Progress
                        </button>
                        <button
                            onClick={() => handleProgress(100)}
                            className="text-xs font-semibold text-slate-800 hover:text-green-600 uppercase tracking-wider"
                        >
                            Mark Complete
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ReviewsSection = ({ user }) => {
    const { data: reviewsData, isLoading } = useGetReviewsQuery({ my_reviews: true });
    const reviews = reviewsData?.results || reviewsData || [];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <div key={i} className="h-40 bg-slate-100 rounded animate-pulse"></div>)}
            </div>
        );
    }

    if (!reviews?.length) {
        return (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">No reviews yet</h3>
                <p className="text-xs text-slate-500">Performance reviews will appear here when scheduled.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
                <Card key={review.id} className="border border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="font-semibold text-slate-900 text-lg">{review.cycle_name || 'Performance Review'}</h4>
                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Reviewer: {review.reviewer_name || 'Manager'}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-3xl font-bold text-green-700 tracking-tighter">
                                    {review.overall_rating > 0 ? review.overall_rating.toFixed(1) : '--'}
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rating</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border 
                                ${review.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                ${review.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                ${review.status === 'submitted' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                                ${review.status === 'acknowledged' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                            `}>
                                {review.status.replace('_', ' ')}
                            </span>

                            <button className="text-xs font-semibold text-slate-800 hover:text-green-600 uppercase tracking-wider">
                                View Report
                            </button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default PerformancePage;
