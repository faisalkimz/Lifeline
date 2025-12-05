import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { useGetEmployeeStatsQuery } from '../../store/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Users, Building2, TrendingUp, Clock } from 'lucide-react';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
    const { data: stats, isLoading } = useGetEmployeeStatsQuery();

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.first_name}!
                </h1>
                <p className="text-gray-500 mt-1">
                    Here's what's happening at {user?.company_name || 'your company'} today.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Employees"
                    value={isLoading ? "..." : stats?.total || 0}
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title="Departments"
                    value={isLoading ? "..." : stats?.departments_count || 0}
                    icon={Building2}
                    color="primary"
                />
                <StatCard
                    title="On Leave"
                    value={isLoading ? "..." : stats?.on_leave || 0}
                    icon={Clock}
                    color="warning"
                />
                <StatCard
                    title="New Hires (30d)"
                    value={isLoading ? "..." : stats?.new_hires || 0}
                    icon={TrendingUp}
                    color="success"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-96 flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Hires</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        {stats?.recent_hires_list?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recent_hires_list.map((emp) => (
                                    <div key={emp.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                                            {emp.first_name[0]}{emp.last_name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</h4>
                                            <p className="text-sm text-gray-500">{emp.job_title} • {emp.department_name}</p>
                                        </div>
                                        <div className="ml-auto text-xs text-gray-400">
                                            {new Date(emp.join_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                <p>No recent hires found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="h-96 flex flex-col">
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        {stats?.upcoming_events?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.upcoming_events.map((event, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${event.type === 'Birthday' ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'
                                            }`}>
                                            {event.type === 'Birthday' ? '🎂' : '🎉'}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{event.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                {event.type} {event.years ? `(${event.years} years)` : ''}
                                            </p>
                                        </div>
                                        <div className="ml-auto text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                            {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                <p>No upcoming birthdays or anniversaries.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
