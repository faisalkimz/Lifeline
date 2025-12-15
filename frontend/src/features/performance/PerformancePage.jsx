import React, { useState } from 'react';
import {
    useGetGoalsQuery,
    useGetReviewsQuery,
    useGetReviewStatsQuery,
    useCreateGoalMutation,
    useUpdateGoalMutation,
    useDeleteGoalMutation,
    useGetCurrentUserQuery
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { BarChart, Target, FileText, Plus, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import toast from 'react-hot-toast';

const PerformancePage = () => {
    const { data: user } = useGetCurrentUserQuery();
    const { data: stats } = useGetReviewStatsQuery();

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Performance Management</h1>
                    <p className="text-slate-500 mt-1">Track goals, reviews, and professional growth.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Average Rating"
                    value={stats?.average_rating || 'N/A'}
                    icon={<BarChart className="h-5 w-5 text-blue-600" />}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Active Goals"
                    value={stats?.active_goals || '3'}
                    icon={<Target className="h-5 w-5 text-purple-600" />}
                    color="bg-purple-50 text-purple-600"
                />
                <StatCard
                    title="Reviews Completed"
                    value={stats?.completed_reviews || '0'}
                    icon={<FileText className="h-5 w-5 text-teal-600" />}
                    color="bg-teal-50 text-teal-600"
                />
                <StatCard
                    title="Pending Reviews"
                    value={stats?.pending_reviews || '0'}
                    icon={<Clock className="h-5 w-5 text-orange-600" />}
                    color="bg-orange-50 text-orange-600"
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="goals" className="space-y-6">
                <TabsList className="bg-slate-100 p-1 w-full max-w-md grid grid-cols-2">
                    <TabsTrigger
                        value="goals"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md py-2 flex items-center justify-center gap-2"
                    >
                        <Target className="h-4 w-4" /> My Goals
                    </TabsTrigger>
                    <TabsTrigger
                        value="reviews"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md py-2 flex items-center justify-center gap-2"
                    >
                        <FileText className="h-4 w-4" /> Performance Reviews
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="mt-0">
                    <GoalsSection user={user} />
                </TabsContent>

                <TabsContent value="reviews" className="mt-0">
                    <ReviewsSection user={user} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <Card>
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
        </CardContent>
    </Card>
);

const GoalsSection = ({ user }) => {
    // Only fetch MY goals by default
    const { data: goals, isLoading } = useGetGoalsQuery({ my_goals: true });
    const [createGoal] = useCreateGoalMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
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
            toast.success("Goal created successfully");
            setIsDialogOpen(false);
            setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
        } catch (error) {
            toast.error("Failed to create goal");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Active Objectives (OKRs)</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4" /> New Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Set New Goal</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Goal Title</label>
                                <input
                                    className="w-full border rounded-md p-2"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Master React Hooks"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded-md p-2"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Priority</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-md p-2"
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Save Goal</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading goals...</div>
            ) : !goals?.length ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-gray-500">
                        No active goals found. Set one to get started!
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
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
        // Optimistic update logic simplified
        await updateGoal({ id: goal.id, progress: val });
        if (val === 100) await updateGoal({ id: goal.id, status: 'completed' });
    };

    const handleDelete = async () => {
        if (confirm('Delete this goal?')) {
            await deleteGoal(goal.id);
            toast.success('Goal deleted');
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold text-lg ${goal.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {goal.title}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                                goal.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                                }`}>
                                {goal.priority}
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm">{goal.description}</p>
                    </div>
                    {goal.status === 'completed' ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Completed
                        </span>
                    ) : (
                        <div className="text-right text-xs text-gray-500">
                            Due {new Date(goal.due_date).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-bold">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${goal.progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                            style={{ width: `${goal.progress}%` }}
                        />
                    </div>
                    {goal.status !== 'completed' && (
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => handleProgress(goal.progress + 10 > 100 ? 100 : goal.progress + 10)}>
                                +10%
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleProgress(100)}>
                                Complete
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 ml-auto" onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const ReviewsSection = ({ user }) => {
    const { data: reviews, isLoading } = useGetReviewsQuery({ my_reviews: true });

    if (isLoading) return <div>Loading reviews...</div>;

    if (!reviews?.length) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-gray-500">
                    No performance reviews found.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {reviews.map(review => (
                <Card key={review.id}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-lg">{review.cycle_name || 'Performance Review'}</h4>
                                <p className="text-gray-500 text-sm">Reviewer: {review.reviewer_name || 'Pending Assignment'}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">{review.overall_rating > 0 ? review.overall_rating : '-'}</div>
                                <div className="text-xs text-gray-500 uppercase">Overall Rating</div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <div className={`px-3 py-1 rounded-full text-sm inline-block capitalize ${review.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                review.status === 'submitted' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100'
                                }`}>
                                {review.status.replace('_', ' ')}
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default PerformancePage;
