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
import {
    Target, FileText, Plus, CheckCircle, Clock,
    TrendingUp, BarChart3, Star, Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import toast from 'react-hot-toast';

const PerformancePage = () => {
    const { data: user } = useGetCurrentUserQuery();
    const { data: stats } = useGetReviewStatsQuery();

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
                <p className="text-gray-600 mt-1">Track your goals and reviews</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats?.average_rating || '4.2'}</p>
                            <p className="text-sm text-gray-600">Avg Rating</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Target className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats?.active_goals ?? 0}</p>
                            <p className="text-sm text-gray-600">Active Goals</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats?.completed_reviews ?? 0}</p>
                            <p className="text-sm text-gray-600">Completed Reviews</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats?.pending_reviews ?? 0}</p>
                            <p className="text-sm text-gray-600">Pending</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="goals" className="space-y-6">
                <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="goals" className="data-[state=active]:bg-white">
                        <Target className="h-4 w-4 mr-2" /> Goals
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="data-[state=active]:bg-white">
                        <FileText className="h-4 w-4 mr-2" /> Reviews
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="goals">
                    <GoalsSection user={user} />
                </TabsContent>

                <TabsContent value="reviews">
                    <ReviewsSection user={user} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

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
            toast.success("Goal created successfully!");
            setIsDialogOpen(false);
            setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
        } catch (error) {
            toast.error("Failed to create goal");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">My Goals</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> New Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Goal</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Complete project milestone"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your goal..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button type="button" onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">Create Goal</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>)}
                </div>
            ) : !goals?.length ? (
                <Card className="p-12 text-center border-dashed">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
                    <p className="text-gray-600 mb-4">Create your first goal to start tracking progress</p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Create Goal
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        low: 'bg-gray-100 text-gray-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-red-100 text-red-700'
    };

    return (
        <Card className="hover:shadow-md transition-shadow border border-gray-200">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className={`font-semibold text-gray-900 mb-2 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                            {goal.title}
                        </h4>
                        <Badge className={`${priorityColors[goal.priority]} border-0 text-xs`}>
                            {goal.priority}
                        </Badge>
                    </div>
                    {isCompleted && (
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{goal.description}</p>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{ width: `${goal.progress}%` }}
                        />
                    </div>
                </div>

                {!isCompleted && (
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleProgress(Math.min(100, goal.progress + 10))}>
                                +10%
                            </Button>
                            <Button size="sm" onClick={() => handleProgress(100)}>
                                Complete
                            </Button>
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
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
            <div className="grid gap-4">
                {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>)}
            </div>
        );
    }

    if (!reviews?.length) {
        return (
            <Card className="p-12 text-center border-dashed">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">Your performance reviews will appear here</p>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(review => (
                <Card key={review.id} className="hover:shadow-md transition-shadow border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-semibold text-gray-900">{review.cycle_name || 'Review'}</h4>
                                <p className="text-sm text-gray-600 mt-1">By: {review.reviewer_name || 'Manager'}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                    {review.overall_rating > 0 ? review.overall_rating : '--'}
                                </div>
                                <div className="text-xs text-gray-600">Rating</div>
                            </div>
                        </div>
                        <Badge className={`
                            ${review.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : ''}
                            ${review.status === 'submitted' ? 'bg-purple-100 text-purple-700' : ''}
                            ${review.status === 'acknowledged' ? 'bg-green-100 text-green-700' : ''}
                            border-0
                        `}>
                            {review.status}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default PerformancePage;
