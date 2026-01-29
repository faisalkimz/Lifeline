import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Briefcase, CheckSquare, Settings, ChevronRight,
    UserPlus, Mail, Calendar, FileText, Gift, Shield,
    MoreHorizontal, Clock, CheckCircle2, AlertCircle, ArrowRight, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';

const OnboardingPage = () => {
    return (
        <div className="space-y-8 pb-12 animate-fade-in bg-[#F9FAFB] min-h-screen p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Onboarding Hub</h1>
                    <p className="text-slate-500 mt-2 text-lg">Streamline the new hire experience with automated workflows.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-slate-200">
                        <Settings className="h-4 w-4 mr-2" /> Settings
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                        <UserPlus className="h-4 w-4 mr-2" /> Onboard New Hire
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="h-6 w-6 text-indigo-600" />}
                    label="Onboarding Active"
                    value="12"
                    trend="+2 this week"
                    color="bg-indigo-50"
                />
                <StatCard
                    icon={<CheckSquare className="h-6 w-6 text-emerald-600" />}
                    label="Tasks Completed"
                    value="85%"
                    trend="High completion rate"
                    color="bg-emerald-50"
                />
                <StatCard
                    icon={<Clock className="h-6 w-6 text-amber-600" />}
                    label="Avg. Time to Onboard"
                    value="14 Days"
                    trend="-2 days vs last mo"
                    color="bg-amber-50"
                />
                <StatCard
                    icon={<Gift className="h-6 w-6 text-pink-600" />}
                    label="Welcome Kits Sent"
                    value="8"
                    trend="100% delivered"
                    color="bg-pink-50"
                />
            </div>

            {/* Workflow / Pipeline */}
            <Tabs defaultValue="pipeline" className="space-y-6">
                <TabsList className="bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm inline-flex h-auto w-auto">
                    <TabsTrigger value="pipeline" className="px-6 py-2.5 rounded-lg text-slate-600 font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 transition-all">
                        <Briefcase className="h-4 w-4 mr-2" /> Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="px-6 py-2.5 rounded-lg text-slate-600 font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 transition-all">
                        <CheckSquare className="h-4 w-4 mr-2" /> Tasks
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="px-6 py-2.5 rounded-lg text-slate-600 font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 transition-all">
                        <FileText className="h-4 w-4 mr-2" /> Templates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pipeline" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <KanbanColumn
                            title="Pre-boarding"
                            count={3}
                            color="bg-blue-500"
                            items={[
                                { id: 1, name: 'Sarah Connor', role: 'Software Engineer', start: 'In 2 days', avatar: 'S' },
                                { id: 2, name: 'John Smith', role: 'Product Manager', start: 'In 5 days', avatar: 'J' },
                                { id: 3, name: 'Emily Chen', role: 'Designer', start: 'Next week', avatar: 'E' },
                            ]}
                        />
                        <KanbanColumn
                            title="Day 1 - Orientation"
                            count={2}
                            color="bg-indigo-500"
                            items={[
                                { id: 4, name: 'Michael Scott', role: 'Sales Lead', start: 'Today', avatar: 'M' },
                                { id: 5, name: 'Dwight Schrute', role: 'Sales Associate', start: 'Today', avatar: 'D' },
                            ]}
                        />
                        <KanbanColumn
                            title="Week 1 - Integration"
                            count={4}
                            color="bg-purple-500"
                            items={[
                                { id: 6, name: 'Jim Halpert', role: 'Sales', start: 'Joined 3 days ago', avatar: 'J' },
                                { id: 7, name: 'Pam Beesly', role: 'Admin', start: 'Joined 4 days ago', avatar: 'P' },
                                { id: 8, name: 'Ryan Howard', role: 'Temp', start: 'Joined 2 days ago', avatar: 'R' },
                                { id: 9, name: 'Kelly Kapoor', role: 'Support', start: 'Joined 5 days ago', avatar: 'K' },
                            ]}
                        />
                        <KanbanColumn
                            title="Month 1 - Probation"
                            count={3}
                            color="bg-emerald-500"
                            items={[
                                { id: 10, name: 'Angela Martin', role: 'Accounting', start: 'Joined 2 weeks ago', avatar: 'A' },
                                { id: 11, name: 'Oscar Martinez', role: 'Accounting', start: 'Joined 3 weeks ago', avatar: 'O' },
                                { id: 12, name: 'Kevin Malone', role: 'Accounting', start: 'Joined 3 weeks ago', avatar: 'K' },
                            ]}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="tasks">
                    <Card className="border border-slate-200">
                        <CardHeader>
                            <CardTitle>Global Task Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <TaskItem title="Provision Laptop for Sarah Connor" assignedTo="IT Dept" type="High" />
                                <TaskItem title="Sign Contract - John Smith" assignedTo="HR Dept" type="Critical" />
                                <TaskItem title="Welcome Lunch - Michael Scott" assignedTo="Manager" type="Normal" />
                                <TaskItem title="System Access - Emily Chen" assignedTo="IT Dept" type="High" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, color }) => (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    {icon}
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
            </div>
        </CardContent>
    </Card>
);

const KanbanColumn = ({ title, count, color, items }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
            <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${color}`} />
                <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
            </div>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">
                {count}
            </Badge>
        </div>

        <div className="space-y-3">
            {items.map(item => (
                <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex -space-x-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                                {item.avatar}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-indigo-600">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.role}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">{item.start}</span>
                    </div>
                </motion.div>
            ))}
            <Button variant="ghost" className="w-full h-10 border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                <Plus className="h-4 w-4 mr-2" /> Add Candidate
            </Button>
        </div>
    </div>
);

const TaskItem = ({ title, assignedTo, type }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-300 transition-colors">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                <p className="text-xs text-slate-500">Assigned to: {assignedTo}</p>
            </div>
        </div>
        <Badge className={
            type === 'Critical' ? 'bg-red-50 text-red-600' :
                type === 'High' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-50 text-slate-600'
        }>{type}</Badge>
    </div>
);


export default OnboardingPage;
