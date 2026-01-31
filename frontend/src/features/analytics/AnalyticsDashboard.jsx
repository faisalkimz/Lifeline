import React, { useState } from 'react';
import CustomReportBuilder from './CustomReportBuilder';
import ScheduledReports from './ScheduledReports';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { exportToJSON } from '../../utils/exportUtils';
import {
    Users, TrendingUp, TrendingDown, DollarSign, Calendar,
    Briefcase, Award, Clock, Target, BarChart3, PieChart,
    Download, Filter, ChevronRight, ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    useGetEmployeesQuery,
    useGetLeaveRequestsQuery,
    useGetCandidatesQuery,
    useGetReviewsQuery,
    useGetDashboardPredictionsQuery
} from '../../store/api';
import { Shield, Target } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, trend, color = 'emerald' }) => {
    const isPositive = trend === 'up';

    return (
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{value}</h3>
                        {change && (
                            <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isPositive ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3" />
                                )}
                                <span>{change}</span>
                                <span className="text-slate-400 font-normal ml-1">vs last month</span>
                            </div>
                        )}
                    </div>
                    <div className="h-10 w-10 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-[#88B072]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const ChartCard = ({ title, children, actions }) => (
    <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50 py-4 px-6">
            <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</CardTitle>
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
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Data-driven workforce insights and trends.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="h-10 px-3 rounded border border-slate-200 bg-white text-xs font-semibold text-slate-600 focus:border-[#88B072] outline-none cursor-pointer"
                    >
                        <option value="week">7 Days</option>
                        <option value="month">30 Days</option>
                        <option value="quarter">3 Months</option>
                        <option value="year">12 Months</option>
                    </select>
                    <Button onClick={handleExport} className="bg-[#88B072] hover:bg-[#7aa265] text-white font-semibold h-10 px-4 rounded text-xs uppercase tracking-wider">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Employees" value={totalEmployees} change="+1.2%" trend="up" icon={Users} />
                <StatCard title="Active Status" value={activeEmployees} change="+0.5%" trend="up" icon={Briefcase} />
                <StatCard title="New Hires (30d)" value={newHires} change="+8.0%" trend="up" icon={TrendingUp} />
                <StatCard title="Pending Review" value={pendingLeaves} change="-2.1%" trend="down" icon={Calendar} />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Headcount by Department">
                    <div className="space-y-4 pt-2">
                        {Object.entries(departmentCounts).map(([dept, count], index) => {
                            const percentage = ((count / totalEmployees) * 100).toFixed(1);
                            return (
                                <div key={dept} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-slate-600 uppercase tracking-tighter">{dept}</span>
                                        <span className="text-slate-900">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-[#88B072] transition-all duration-1000"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ChartCard>

                <ChartCard title="Employment Type">
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(employmentTypes).map(([type, count]) => {
                            const percentage = ((count / totalEmployees) * 100).toFixed(1);
                            const typeLabels = { 'full_time': 'Full-Time', 'part_time': 'Part-Time', 'contract': 'Contract', 'intern': 'Intern', 'casual': 'Casual' };
                            return (
                                <div key={type} className="p-4 bg-slate-50 rounded border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{typeLabels[type] || type}</p>
                                    <p className="text-xl font-bold text-slate-900">{count}</p>
                                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">{percentage}% share</p>
                                </div>
                            );
                        })}
                    </div>
                </ChartCard>
            </div>

            {/* Strategic Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm bg-slate-900 text-white overflow-hidden rounded-lg">
                    <CardHeader className="border-b border-white/5 py-4 px-6">
                        <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                            <BarChart3 className="h-4 w-4 text-[#88B072]" />
                            Workforce Strategic Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded border border-white/10 group">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Turnover Risk Score</p>
                                    <div className="flex items-end gap-3">
                                        <p className="text-3xl font-bold font-mono text-[#88B072] leading-none">{predictions?.potential_turnover_rate || '0'}%</p>
                                        <div className="h-5 bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/20 uppercase">Action required</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded border border-white/10">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Predicted Time to Hire</p>
                                    <p className="text-3xl font-bold font-mono text-white leading-none">{predictions?.predicted_hiring_timeline || '25'} Days</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between">
                                <div className="p-5 bg-[#88B072]/10 rounded border border-[#88B072]/20">
                                    <h4 className="text-[10px] font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-white/90">
                                        Health Score
                                    </h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-white">{predictions?.retention_score || '95'}</span>
                                        <span className="text-white/40 font-bold uppercase tracking-widest">/ 100</span>
                                    </div>
                                    <div className="mt-6 w-full bg-white/10 rounded-full h-1">
                                        <div className="bg-[#88B072] h-full rounded-full" style={{ width: `${predictions?.retention_score || 95}%` }} />
                                    </div>
                                </div>
                                <p className="text-xs text-white/40 italic leading-relaxed mt-4 border-l border-white/10 pl-4">
                                    Current trends indicate high engagement levels in technical departments.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <ChartCard title="Recommendations">
                    <div className="space-y-3">
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded border border-slate-100 group hover:border-[#88B072]/30 transition-colors">
                            <div className="h-8 w-8 bg-amber-50 rounded flex items-center justify-center shrink-0 border border-amber-100">
                                <Target className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-tight">Hiring Pipeline</h4>
                                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-normal">Backfill for critical roles predicted at {Math.round(predictions?.predicted_hiring_timeline || 25 + 10)} days.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded border border-slate-100 group hover:border-[#88B072]/30 transition-colors">
                            <div className="h-8 w-8 bg-[#88B072]/10 rounded flex items-center justify-center shrink-0 border border-[#88B072]/20">
                                <Shield className="h-4 w-4 text-[#88B072]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-tight">Retention Alert</h4>
                                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-normal">Low risk detected. Continue current employee engagement programs.</p>
                            </div>
                        </div>
                    </div>
                </ChartCard>
            </div>

            <CustomReportBuilder />
            <ScheduledReports />

            {/* Recent Activity */}
            <ChartCard title="Recent Activity">
                <div className="divide-y divide-slate-50">
                    {[
                        { action: 'New employee onboarded', name: 'Sarah Johnson', time: '2 hours ago', icon: Users, color: 'emerald' },
                        { action: 'Leave request approved', name: 'Michael Chen', time: '4 hours ago', icon: Calendar, color: 'blue' },
                        { action: 'Performance review completed', name: 'Emma Davis', time: '6 hours ago', icon: Award, color: 'purple' },
                        { action: 'Candidate moved to interview', name: 'James Wilson', time: '8 hours ago', icon: Briefcase, color: 'amber' },
                    ].map((item, index) => (
                        <div key={index} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 group">
                            <div className="h-9 w-9 bg-slate-50 rounded border border-slate-100 flex items-center justify-center group-hover:border-[#88B072]/20 transition-colors">
                                <item.icon className="h-4 w-4 text-slate-400 group-hover:text-[#88B072] transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-800">{item.action}</p>
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">{item.name}</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</span>
                        </div>
                    ))}
                </div>
            </ChartCard>
        </div>
    );
};

export default AnalyticsDashboard;
