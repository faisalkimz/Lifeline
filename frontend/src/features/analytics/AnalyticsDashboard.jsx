import React, { useState } from 'react';
import CustomReportBuilder from './CustomReportBuilder';
import ScheduledReports from './ScheduledReports';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { exportToJSON } from '../../utils/exportUtils';
import {
    Users, TrendingUp, TrendingDown, DollarSign, Calendar,
    Briefcase, Award, Clock, Target, BarChart3, PieChart,
    Download, Filter, ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    useGetEmployeesQuery,
    useGetLeaveRequestsQuery,
    useGetCandidatesQuery,
    useGetReviewsQuery,
    useGetDashboardPredictionsQuery
} from '../../store/api';
import { Sparkles, Shield, Zap } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, trend, color = 'primary' }) => {
    const isPositive = trend === 'up';
    const colorClasses = {
        primary: 'from-primary-500 to-primary-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        rose: 'from-rose-500 to-rose-600',
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`} />
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                            <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
                            {change && (
                                <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {isPositive ? (
                                        <ArrowUpRight className="h-4 w-4" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4" />
                                    )}
                                    <span>{change}</span>
                                    <span className="text-slate-500 font-normal">vs last month</span>
                                </div>
                            )}
                        </div>
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const ChartCard = ({ title, children, actions }) => (
    <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900">{title}</CardTitle>
                {actions}
            </div>
        </CardHeader>
        <CardContent className="p-6">
            {children}
        </CardContent>
    </Card>
);

const AnalyticsDashboard = () => {
    const [timeRange, setTimeRange] = useState('month');

    const { data: employeesData } = useGetEmployeesQuery();
    const { data: leaveData } = useGetLeaveRequestsQuery();
    const { data: candidatesData } = useGetCandidatesQuery();
    const { data: predictions } = useGetDashboardPredictionsQuery();

    const employees = Array.isArray(employeesData?.results) ? employeesData.results : (Array.isArray(employeesData) ? employeesData : []);
    const leaves = Array.isArray(leaveData?.results) ? leaveData.results : (Array.isArray(leaveData) ? leaveData : []);
    const candidates = Array.isArray(candidatesData?.results) ? candidatesData.results : (Array.isArray(candidatesData) ? candidatesData : []);

    // Calculate metrics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.employment_status === 'active').length;
    const newHires = employees.filter(e => {
        const joinDate = new Date(e.join_date);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return joinDate > monthAgo;
    }).length;

    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'approved').length;

    // Department distribution
    const departmentCounts = employees.reduce((acc, emp) => {
        const dept = emp.department_name || 'Unassigned';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});

    // Employment type distribution
    const employmentTypes = employees.reduce((acc, emp) => {
        const type = emp.employment_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    // Recruitment funnel
    const recruitmentStages = {
        'Applied': candidates.length,
        'Screening': candidates.filter(c => c.stage === 'screening').length,
        'Interview': candidates.filter(c => c.stage === 'interview').length,
        'Offer': candidates.filter(c => c.stage === 'offer').length,
        'Hired': candidates.filter(c => c.status === 'hired').length
    };

    const handleExport = () => {
        const reportData = {
            summary: {
                totalEmployees,
                activeEmployees,
                newHires,
                pendingLeaves,
                approvedLeaves
            },
            departmentBreakdown: departmentCounts,
            employmentTypes: employmentTypes,
            recruitmentFunnel: recruitmentStages,
            generatedAt: new Date().toISOString()
        };
        exportToJSON([reportData], `hr-analytics-report-${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
                    <p className="text-slate-600 mt-2">Comprehensive insights into your workforce</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="h-10 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none"
                    >
                        <option value="week">Last 7 days</option>
                        <option value="month">Last 30 days</option>
                        <option value="quarter">Last 3 months</option>
                        <option value="year">Last 12 months</option>
                    </select>
                    <Button onClick={handleExport} className="gap-2 bg-primary-500 hover:bg-primary-600">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Employees"
                    value={totalEmployees}
                    change="+12%"
                    trend="up"
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title="Active Employees"
                    value={activeEmployees}
                    change="+5%"
                    trend="up"
                    icon={Briefcase}
                    color="emerald"
                />
                <StatCard
                    title="New Hires (30d)"
                    value={newHires}
                    change="+8%"
                    trend="up"
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title="Pending Leaves"
                    value={pendingLeaves}
                    change="-3%"
                    trend="down"
                    icon={Calendar}
                    color="amber"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Distribution */}
                <ChartCard
                    title="Headcount by Department"
                    actions={
                        <Button variant="ghost" size="sm" className="gap-1">
                            View Details <ChevronRight className="h-4 w-4" />
                        </Button>
                    }
                >
                    <div className="space-y-4">
                        {Object.entries(departmentCounts).map(([dept, count], index) => {
                            const percentage = ((count / totalEmployees) * 100).toFixed(1);
                            const colors = ['bg-primary-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-blue-500', 'bg-purple-500'];
                            return (
                                <div key={dept} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-700">{dept}</span>
                                        <span className="text-slate-600">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className={`h-full ${colors[index % colors.length]}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ChartCard>

                {/* Employment Type Distribution */}
                <ChartCard
                    title="Employment Type Breakdown"
                    actions={
                        <Button variant="ghost" size="sm" className="gap-1">
                            View Details <ChevronRight className="h-4 w-4" />
                        </Button>
                    }
                >
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(employmentTypes).map(([type, count]) => {
                            const percentage = ((count / totalEmployees) * 100).toFixed(1);
                            const typeLabels = {
                                'full_time': 'Full-Time',
                                'part_time': 'Part-Time',
                                'contract': 'Contract',
                                'intern': 'Intern',
                                'casual': 'Casual'
                            };
                            return (
                                <div key={type} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-medium text-slate-600 mb-1">{typeLabels[type] || type}</p>
                                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                                    <p className="text-xs text-slate-500 mt-1">{percentage}% of total</p>
                                </div>
                            );
                        })}
                    </div>
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recruitment Funnel */}
                <ChartCard title="Recruitment Funnel">
                    <div className="space-y-3">
                        {Object.entries(recruitmentStages).map(([stage, count], index) => {
                            const maxCount = Math.max(...Object.values(recruitmentStages));
                            const percentage = maxCount > 0 ? ((count / maxCount) * 100).toFixed(1) : 0;
                            return (
                                <div key={stage} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-700">{stage}</span>
                                        <span className="text-slate-600 font-bold">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ChartCard>

                {/* Leave Statistics */}
                <ChartCard title="Leave Overview">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <div>
                                <p className="text-sm font-medium text-amber-900">Pending</p>
                                <p className="text-2xl font-bold text-amber-700">{pendingLeaves}</p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-500" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div>
                                <p className="text-sm font-medium text-emerald-900">Approved</p>
                                <p className="text-2xl font-bold text-emerald-700">{approvedLeaves}</p>
                            </div>
                            <Award className="h-8 w-8 text-emerald-500" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <p className="text-sm font-medium text-slate-900">Total Requests</p>
                                <p className="text-2xl font-bold text-slate-700">{leaves.length}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-slate-500" />
                        </div>
                    </div>
                </ChartCard>

                {/* Quick Actions */}
                <ChartCard title="Quick Insights">
                    <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Target className="h-5 w-5 text-primary-600" />
                                <p className="text-sm font-semibold text-primary-900">Turnover Rate</p>
                            </div>
                            <p className="text-2xl font-bold text-primary-700">2.3%</p>
                            <p className="text-xs text-primary-600 mt-1">Below industry average</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                <p className="text-sm font-semibold text-emerald-900">Avg. Tenure</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">3.2 years</p>
                            <p className="text-xs text-emerald-600 mt-1">+0.4 years vs last year</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                <p className="text-sm font-semibold text-blue-900">Time to Hire</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">18 days</p>
                            <p className="text-xs text-blue-600 mt-1">-3 days improvement</p>
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* AI Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <CardHeader className="border-b border-white/10">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Sparkles className="h-5 w-5 text-primary-400" />
                            AI Talent Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-primary-400/50 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingDown className="h-5 w-5 text-rose-400" />
                                        <p className="text-sm font-bold text-white/70">Turnover Risk</p>
                                    </div>
                                    <p className="text-3xl font-bold">{predictions?.potential_turnover_rate || '0'}%</p>
                                    <p className="text-xs text-white/50 mt-1">Predicted exit rate for next quarter</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-emerald-400/50 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="h-5 w-5 text-emerald-400" />
                                        <p className="text-sm font-bold text-white/70">Hiring Velocity</p>
                                    </div>
                                    <p className="text-3xl font-bold">{predictions?.predicted_hiring_timeline || '25'} Days</p>
                                    <p className="text-xs text-white/50 mt-1">Avg. time to fill open roles</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-5 bg-gradient-to-br from-primary-600/20 to-transparent rounded-2xl border border-primary-500/20">
                                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary-400" />
                                        Retention Forecast
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-black text-primary-400">{predictions?.retention_score || '95'}</div>
                                        <div className="text-xs text-white/60">
                                            Health score based on current tenure and engagement trends.
                                        </div>
                                    </div>
                                    <div className="mt-4 w-full bg-white/10 rounded-full h-1.5">
                                        <div
                                            className="bg-primary-500 h-full rounded-full"
                                            style={{ width: `${predictions?.retention_score || 95}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl text-xs text-white/60 italic leading-relaxed">
                                    "Your current hiring speed is {predictions?.predicted_hiring_timeline < 20 ? 'excellent' : 'steady'}. Retention in Engineering shows positive sentiment."
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Strategic Recommendations */}
                <ChartCard title="Strategic Recommendations">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                <Zap className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Critical Role Backfill</h4>
                                <p className="text-xs text-slate-500 mt-1">Senior roles are likely to take {Math.round(predictions?.predicted_hiring_timeline || 25 + 15)} days. Start sourcing early.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Retention Alert</h4>
                                <p className="text-xs text-slate-500 mt-1">Potential {predictions?.potential_turnover_rate || '0'}% churn predicted. Recommend conducting stay interviews.</p>
                            </div>
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* Custom Report Builder */}
            <CustomReportBuilder />

            {/* Scheduled Reports */}
            <ScheduledReports />

            {/* Recent Activity */}
            <ChartCard title="Recent Activity">
                <div className="space-y-3">
                    {[
                        { action: 'New employee onboarded', name: 'Sarah Johnson', time: '2 hours ago', icon: Users, color: 'emerald' },
                        { action: 'Leave request approved', name: 'Michael Chen', time: '4 hours ago', icon: Calendar, color: 'blue' },
                        { action: 'Performance review completed', name: 'Emma Davis', time: '6 hours ago', icon: Award, color: 'purple' },
                        { action: 'Candidate moved to interview', name: 'James Wilson', time: '8 hours ago', icon: Briefcase, color: 'amber' },
                    ].map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className={`h-10 w-10 rounded-lg bg-${item.color}-100 flex items-center justify-center`}>
                                <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{item.action}</p>
                                <p className="text-xs text-slate-500">{item.name}</p>
                            </div>
                            <span className="text-xs text-slate-400">{item.time}</span>
                        </div>
                    ))}
                </div>
            </ChartCard>
        </div>
    );
};

export default AnalyticsDashboard;
