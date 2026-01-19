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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-primary-50 rounded-xl">
                                <BarChart3 className="h-5 w-5 text-primary-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.average_rating || '4.2'}</p>
                            <p className="text-sm font-medium text-gray-500 mt-1">Average Rating</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-green-50 rounded-xl">
                                <Target className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.active_goals ?? 0}</p>
                            <p className="text-sm font-medium text-gray-500 mt-1">Active Goals</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-purple-50 rounded-xl">
                                <CheckCircle className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.completed_reviews ?? 0}</p>
                            <p className="text-sm font-medium text-gray-500 mt-1">Completed Reviews</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-amber-50 rounded-xl">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.pending_reviews ?? 0}</p>
                            <p className="text-sm font-medium text-gray-500 mt-1">Pending Actions</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="goals" className="space-y-6">
                <TabsList className="bg-white p-1 border border-gray-200 rounded-xl shadow-sm inline-flex h-auto w-auto">
                    <TabsTrigger
                        value="goals"
                        className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 px-6 py-2.5 rounded-lg text-gray-600 font-medium transition-all"
                    >
                        <Target className="h-4 w-4 mr-2" /> Goals
                    </TabsTrigger>
                    <TabsTrigger
                        value="reviews"
                        className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 px-6 py-2.5 rounded-lg text-gray-600 font-medium transition-all"
                    >
                        <FileText className="h-4 w-4 mr-2" /> Reviews
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-200">
                            <Plus className="h-4 w-4 mr-2" /> New Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl bg-white rounded-xl shadow-2xl border border-gray-100 p-0 overflow-hidden">
                        <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-slate-100">
                            <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100 shadow-sm">
                                <Target className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Create New Goal</DialogTitle>
                                <p className="text-slate-500 mt-1 font-medium text-sm">Define clear objectives to track your progress.</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Goal Title</label>
                                <Input
                                    className="bg-white"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Master Advanced React Patterns"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow resize-none"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe what you want to achieve..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Priority</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-10 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Flag className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                                    <Input
                                        type="date"
                                        className="bg-white"
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                <Button type="button" onClick={() => setIsDialogOpen(false)} variant="ghost" className="text-gray-600 hover:text-gray-900">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
                                    {isCreating ? 'Creating...' : 'Create Goal'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
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
        low: 'bg-gray-100 text-gray-700 border-gray-200',
        medium: 'bg-blue-50 text-blue-700 border-blue-100',
        high: 'bg-red-50 text-red-700 border-red-100'
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-primary-200 group">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge className={`${priorityColors[goal.priority]} border font-medium px-2 py-0.5 capitalize`}>
                                {goal.priority}
                            </Badge>
                            {goal.due_date && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(goal.due_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <h4 className={`text-lg font-bold text-gray-900 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                            {goal.title}
                        </h4>
                    </div>
                    {isCompleted ? (
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                    ) : (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <p className="text-sm text-gray-600 mb-6 line-clamp-2 min-h-[2.5em]">
                    {goal.description || "No description provided."}
                </p>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-gray-500">Progress</span>
                        <span className={`px-2 py-0.5 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-900'}`}>
                            {goal.progress}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-primary-600'}`}
                            style={{ width: `${goal.progress}%` }}
                        />
                    </div>
                </div>

                {!isCompleted && (
                    <div className="flex justify-between items-center pt-5 mt-5 border-t border-gray-100">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-gray-200 hover:bg-gray-50"
                            onClick={() => handleProgress(Math.min(100, goal.progress + 10))}
                        >
                            +10% Progress
                        </Button>
                        <Button
                            size="sm"
                            className="text-xs bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200"
                            onClick={() => handleProgress(100)}
                        >
                            Mark Complete
                        </Button>
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
                {[1, 2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>)}
            </div>
        );
    }

    if (!reviews?.length) {
        return (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Performance reviews initiated by your manager will appear here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
                <Card key={review.id} className="hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">{review.cycle_name || 'Performance Review'}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {(review.reviewer_name || 'M').charAt(0)}
                                    </div>
                                    <p className="text-sm text-gray-600">Reviewer: <span className="font-medium text-gray-900">{review.reviewer_name || 'Manager'}</span></p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-3xl font-bold text-primary-600 tracking-tighter">
                                    {review.overall_rating > 0 ? review.overall_rating.toFixed(1) : '--'}
                                </div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Badge className={`
                                ${review.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                ${review.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                ${review.status === 'submitted' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                                ${review.status === 'acknowledged' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                border px-2.5 py-0.5
                            `}>
                                {review.status.replace('_', ' ')}
                            </Badge>

                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary-600">
                                View Full Report <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default PerformancePage;
