import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Calendar, Wallet, FileText, ArrowRight,
    CreditCard, Banknote, Clock, Award,
    Users, FileStack, Network, Bell, CheckCircle, Heart,
    Sparkles, ChevronRight, Briefcase, Activity, Target, Shield, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    useGetEmployeeStatsQuery,
    useGetLeaveRequestsQuery,
    useGetMyProfileQuery
} from '../../store/api';
import { cn } from '../../utils/cn';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
    const { data: stats } = useGetEmployeeStatsQuery();
    const { data: leaveRequests } = useGetLeaveRequestsQuery({ status: 'pending' });

    const currentDate = new Date();
    const isAfternoon = currentDate.getHours() >= 12 && currentDate.getHours() < 17;
    const isEvening = currentDate.getHours() >= 17;
    const isMorning = currentDate.getHours() < 12;

    let greeting = "Good day";
    if (isMorning) greeting = "Good morning";
    if (isAfternoon) greeting = "Good afternoon";
    if (isEvening) greeting = "Good evening";

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http')) return path;
        return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const pendingRequests = (leaveRequests?.results || leaveRequests || []).filter(r => r.status === 'pending');

    const HeroStatCard = ({ icon: Icon, label, subLabel, link, colorClass }) => (
        <Link to={link} className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg border border-slate-200 bg-white p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                <div className={cn("p-2.5 rounded-xl text-white shadow-md", colorClass)}>
                    <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary-500 transition-all transform group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
                <h3 className="text-xs font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-[0.1em]">{label}</h3>
                <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-tight">{subLabel}</p>
            </div>
        </Link>
    );

    const QuickAction = ({ icon: Icon, label, link, iconColor, bgColor }) => (
        <Link
            to={link}
            className="flex flex-col items-start p-4 rounded-xl bg-white border border-slate-100 hover:border-primary-200 hover:bg-slate-50/50 transition-all group gap-3"
        >
            <div className={cn("p-2 rounded-lg", bgColor)}>
                <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-primary-600">
                {label}
            </span>
        </Link>
    );

    const quickActions = [
        { name: 'Directory', icon: Users, link: '/employees', iconColor: 'text-blue-600', bgColor: 'bg-blue-50' },
        { name: 'Conduct', icon: Shield, link: '/disciplinary', iconColor: 'text-red-600', bgColor: 'bg-red-50' },
        { name: 'Advances', icon: Wallet, link: '/payroll/advances', iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50' },
        { name: 'Timeline', icon: Calendar, link: '/leave', iconColor: 'text-orange-600', bgColor: 'bg-orange-50' },
        { name: 'Payslips', icon: CreditCard, link: '/payroll', iconColor: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    ];

    const upcomingEvents = stats?.upcoming_events || [];

    return (
        <div className="space-y-8 pb-12 animate-fade-in font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* Workpay Style Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50 z-0"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-lg bg-slate-900 flex items-center justify-center">
                            <Zap className="h-3 w-3 text-primary-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user?.company_name || 'LIFELINE'}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                        {greeting}, {user.first_name || 'Admin'}
                    </h1>
                    <p className="text-slate-500 text-sm max-w-xl font-bold uppercase tracking-tight opacity-70">
                        Operational Overview & Personnel Logistics Dashboard
                    </p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-start min-w-[120px] shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Team</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{stats?.total || 0}</span>
                            <span className="text-[10px] font-bold text-emerald-500">Live</span>
                        </div>
                    </div>
                    <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col items-start min-w-[120px] shadow-sm">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">In Office</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-indigo-700 tracking-tighter">{stats?.working_today || 0}</span>
                            <span className="text-[10px] font-bold text-indigo-400">Headcount</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Primary Modules</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            <HeroStatCard icon={Calendar} label="Leave Portal" subLabel="Log & track absence" link="/leave" colorClass="bg-orange-500" />
                            <HeroStatCard icon={CreditCard} label="Finance Hub" subLabel="Payslips & advances" link="/payroll" colorClass="bg-indigo-500" />
                            <HeroStatCard icon={Heart} label="Wellness" subLabel="Employee perks" link="/benefits" colorClass="bg-rose-500" />
                            <HeroStatCard icon={Target} label="Performance" subLabel="Growth & Reviews" link="/performance" colorClass="bg-emerald-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-8">
                                <CardTitle className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-primary-500" /> Action Registry
                                    </div>
                                    <span className="bg-primary-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-black shadow-lg shadow-primary-600/20">
                                        {pendingRequests.length} ALERT
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {pendingRequests.length > 0 ? (
                                        pendingRequests.map((request) => (
                                            <div key={request.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-11 w-11 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200 shadow-sm group-hover:bg-white group-hover:border-primary-200 transition-all">
                                                        <Clock className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 text-sm uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                                            {request.employee_name} - {request.leave_type_name} Request
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                            Period: {request.start_date} → {request.end_date}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link to={`/leave`}>
                                                    <Button variant="ghost" className="text-primary-600 font-black text-[10px] uppercase tracking-widest hover:bg-primary-50 rounded-xl px-4">Validate</Button>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Operational Status Clear</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Tactical Tools</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {quickActions.map((item) => (
                                <QuickAction key={item.name} icon={item.icon || Shield} label={item.name} link={item.link} iconColor={item.iconColor} bgColor={item.bgColor} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-80 space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white group hover:shadow-xl transition-all">
                        <div className="h-28 bg-slate-900 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent opacity-50"></div>
                            <div className="absolute top-4 right-4 z-20">
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-900 shadow-lg shadow-emerald-500/20"></span>
                            </div>
                        </div>
                        <CardContent className="px-8 pb-8 -mt-12 relative z-10 text-center">
                            <div className="mx-auto h-24 w-24 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white mb-4 group-hover:scale-105 transition-transform duration-500">
                                {user.photo ? (
                                    <img src={getImageUrl(user.photo)} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400 uppercase">
                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{user.first_name} {user.last_name}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{user.role?.replace('_', ' ')}</p>
                            <Link to="/employees" className="block">
                                <Button className="w-full h-11 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800">
                                    View Full Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardHeader className="pb-4 border-b border-slate-50 px-6 pt-6">
                            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-between">
                                <span>Upcoming Metrics</span>
                                <Activity className="h-3 w-3" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map((event, i) => (
                                        <div key={i} className="flex gap-5 p-5 hover:bg-slate-50/50 transition-all group">
                                            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-700 shadow-sm group-hover:border-primary-200 transition-colors">
                                                <span className="text-[8px] font-black uppercase tracking-tighter opacity-50">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-lg font-black leading-none tracking-tighter">{new Date(event.date).getDate()}</span>
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="font-black text-slate-800 text-[11px] uppercase tracking-wide group-hover:text-primary-600 transition-colors">{event.type}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1 truncate">{event.employee}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No Events Recorded</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-indigo-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <div className="relative z-10">
                            <div className="mb-5 inline-flex p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                                <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] mb-1">Payroll Cycle</h3>
                            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-6">Processing in 12 Days</p>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                                <div className="h-full w-[60%] bg-white rounded-full transition-all duration-1000"></div>
                            </div>
                            <Button className="w-full bg-white text-indigo-700 rounded-2xl font-black uppercase text-[10px] tracking-widest h-10 hover:bg-indigo-50 shadow-lg shadow-indigo-900/20">View Ledger</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
