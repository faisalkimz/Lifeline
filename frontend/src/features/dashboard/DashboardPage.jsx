import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Users, CreditCard, Calendar, Clock, Briefcase,
    ArrowRight, Activity, PlusCircle, CheckCircle, Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);

    const stats = [
        { label: 'Total Employees', value: '24', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Leaves', value: '3', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Next Payroll', value: 'Dec 25', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Open Jobs', value: '5', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const quickActions = [
        { name: 'Run Payroll', href: '/payroll', icon: CreditCard, color: 'bg-teal-600' },
        { name: 'Add Employee', href: '/employees/new', icon: Users, color: 'bg-blue-600' },
        { name: 'Post Job', href: '/recruitment', icon: Briefcase, color: 'bg-purple-600' },
        { name: 'Approve Leaves', href: '/leave', icon: CheckCircle, color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Good Morning, {user.first_name}! 👋
                    </h1>
                    <p className="text-slate-500 mt-1">Here's what's happening at Lifeline Tech today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">View Reports</Button>
                    <Button>Invite User</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Section: Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <Link key={action.name} to={action.href}>
                                <Card className="hover:shadow-md hover:border-primary-200 transition-all cursor-pointer h-full border-none shadow-sm">
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                        <div className={`p-3 rounded-full ${action.color} text-white shadow-lg shadow-primary-500/20`}>
                                            <action.icon className="h-6 w-6" />
                                        </div>
                                        <span className="font-semibold text-slate-700">{action.name}</span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Recent Activity Mockup */}
                    <Card className="border-none shadow-sm mt-8">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
                            <h3 className="font-bold text-slate-800">Recent Activity</h3>
                            <Link to="#" className="text-sm text-primary-600 font-medium hover:underline">View All</Link>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Activity className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900">New application for Senior Developer</p>
                                            <p className="text-xs text-slate-500">2 hours ago</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar: Reminders */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-800">Reminders</h2>
                    <Card className="bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
                        {/* Decorative background circle */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-500 rounded-full opacity-20 blur-xl"></div>

                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <Clock className="h-6 w-6 text-primary-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Payroll Cutoff</h3>
                                    <p className="text-slate-400 text-sm">Approvals due in 2 days</p>
                                </div>
                            </div>
                            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 border-none font-bold">
                                Review Now
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-slate-800 mb-4">New Joiners</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">JD</div>
                                    <div>
                                        <p className="text-sm font-semibold">Jane Doe</p>
                                        <p className="text-xs text-slate-500">Product Designer</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">MS</div>
                                    <div>
                                        <p className="text-sm font-semibold">Mark Smith</p>
                                        <p className="text-xs text-slate-500">Sales Lead</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
