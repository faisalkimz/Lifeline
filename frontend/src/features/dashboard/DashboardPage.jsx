import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Calendar, Wallet, FileText, ArrowRight,
    CreditCard, Banknote, Clock, Award,
    Users, FileStack, Network, Bell, CheckCircle, Heart,
    Sparkles, ChevronRight, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
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

    const HeroStatCard = ({ icon: Icon, label, subLabel, link, gradient }) => (
        <Link to={link} className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            <div className="p-6 relative z-10 h-full flex flex-col justify-between border border-border-light bg-white/50 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm text-white`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{label}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subLabel}</p>
                </div>
            </div>
        </Link>
    );

    const QuickAction = ({ icon: Icon, label, link, colorClass }) => (
        <Link
            to={link}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary-200 hover:shadow-lg transition-all duration-200 group gap-3"
        >
            <div className={`p-3 rounded-full bg-opacity-10 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 text-center">
                {label}
            </span>
        </Link>
    );

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Premium Welcome Header */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden">
                    <div className="absolute -top-[50%] -right-[10%] w-[80%] h-[150%] rounded-full bg-gradient-to-br from-primary-600/30 to-purple-600/30 blur-3xl opacity-60"></div>
                    <div className="absolute -bottom-[50%] -left-[10%] w-[80%] h-[150%] rounded-full bg-gradient-to-tr from-blue-600/20 to-teal-600/20 blur-3xl opacity-60"></div>
                </div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                                {user?.company_name || 'Lifeline HRMS'}
                            </span>
                            <span className="flex items-center gap-1 text-primary-200 text-xs font-medium bg-primary-900/40 px-2 py-0.5 rounded-full border border-primary-700/50">
                                <Sparkles className="h-3 w-3" />
                                Premium Edition
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-white">{user.first_name || 'Admin'}</span>
                        </h1>
                        <p className="text-slate-300 text-lg mt-3 max-w-xl leading-relaxed font-light">
                            Ready to make an impact today? Your dashboard gives you a panoramic view of your workforce and tasks.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Main Content */}
                <div className="flex-1 space-y-8">

                    {/* Hero Stats Layout */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary-500" />
                                Performance Overview
                            </h2>
                            <Link to="/reports" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:gap-2 transition-all">
                                View all metrics <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                            <HeroStatCard
                                icon={Calendar}
                                label="Leave Management"
                                subLabel="Apply & track requests"
                                link="/leave"
                                gradient="from-orange-400 to-pink-500"
                            />
                            <HeroStatCard
                                icon={Wallet}
                                label="My Payslips"
                                subLabel="View payment history"
                                link="/payroll/my-payslips"
                                gradient="from-blue-400 to-indigo-500"
                            />
                            <HeroStatCard
                                icon={CreditCard}
                                label="Expense Claims"
                                subLabel="Manage reimbursements"
                                link="/finance/expenses"
                                gradient="from-teal-400 to-emerald-500"
                            />
                            <HeroStatCard
                                icon={Banknote}
                                label="Loan Services"
                                subLabel="Apply for assistance"
                                link="/finance/loans"
                                gradient="from-violet-400 to-purple-500"
                            />
                        </div>
                    </div>

                    {/* Pending Tasks & Quick Actions Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
                        {/* Tasks Section */}
                        <Card className="border-border-light shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-border-light pb-4">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-primary-500" />
                                        Pending Tasks
                                    </div>
                                    <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-bold">2 New</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {[1, 2].map((_, i) => (
                                        <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${i === 0 ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {i === 0 ? <Clock className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 transition-colors text-base">
                                                        {i === 0 ? 'Review Payroll for December' : 'Approve Leave Request for Sarah'}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Today</span>
                                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 5:00 PM</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="sm" variant={i === 0 ? "default" : "outline"} className={i === 0 ? "bg-slate-900" : ""}>Review</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Enhanced Quick Access */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                            <Network className="h-5 w-5 text-primary-500" />
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[
                                { name: 'Staff Profile', icon: Users, link: '/organization', color: 'bg-blue-500' },
                                { name: 'Disciplinary', icon: Award, link: '/disciplinary', color: 'bg-red-500' },
                                { name: 'Salary Advance', icon: FileStack, link: '/payroll/advances', color: 'bg-green-500' },
                                { name: 'Recruitment', icon: Briefcase, link: '/recruitment/interviews', color: 'bg-purple-500' },
                                { name: 'Documents', icon: FileText, link: '/documents', color: 'bg-yellow-500' },
                                { name: 'Training', icon: Award, link: '/training', color: 'bg-indigo-500' },
                                { name: 'Reviews', icon: Network, link: '/performance', color: 'bg-pink-500' },
                                { name: 'Benefits', icon: Heart, link: '/benefits/admin', color: 'bg-rose-500' },
                                { name: 'Overtime', icon: Clock, link: '/attendance/overtime', color: 'bg-orange-500' },
                                { name: 'Settings', icon: Users, link: '/settings', color: 'bg-slate-500' },
                            ].map((item) => (
                                <QuickAction
                                    key={item.name}
                                    icon={item.icon}
                                    label={item.name}
                                    link={item.link}
                                    colorClass={item.color}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-96 space-y-8 flex-shrink-0">

                    {/* Profile Summary Card */}
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-800 overflow-hidden relative group">
                        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 absolute top-0 w-full z-0"></div>
                        <CardContent className="p-8 pt-20 relative z-10 text-center">
                            <div className="absolute top-4 right-4 z-20">
                                <span className="inline-flex h-3 w-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-slate-800"></span>
                            </div>

                            <div className="mx-auto h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-white relative z-10 mb-4 transition-transform group-hover:scale-105 duration-300">
                                {user.photo ? (
                                    <img src={getImageUrl(user.photo)} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400">
                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{user.first_name} {user.last_name}</h3>
                            <p className="text-primary-600 font-medium mb-6 text-sm bg-primary-50 inline-block px-3 py-1 rounded-full">{user.role || 'System Administrator'}</p>

                            <div className="flex justify-center gap-3">
                                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                                    View Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events Widget */}
                    <Card className="border-border-light shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-lg">
                                <span>Upcoming Events</span>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full"><ChevronRight className="h-4 w-4" /></Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-2 space-y-1">
                                {[
                                    { title: 'Team Building', date: 'Dec 20', time: '2:00 PM', type: 'fun', color: 'purple' },
                                    { title: 'Q4 Review', date: 'Dec 22', time: '10:00 AM', type: 'work', color: 'blue' },
                                    { title: 'Holiday Party', date: 'Dec 24', time: '6:00 PM', type: 'fun', color: 'red' },
                                ].map((event, i) => (
                                    <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border bg-${event.color}-50 border-${event.color}-100 text-${event.color}-600`}>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{event.date.split(' ')[0]}</span>
                                            <span className="text-lg font-bold leading-none">{event.date.split(' ')[1]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate group-hover:text-primary-600 transition-colors">{event.title}</p>
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {event.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 pt-2 border-t border-slate-50">
                                <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wide">View Full Calendar</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Status Widget (Optional) */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <div className="mb-4 inline-flex p-3 rounded-full bg-white/20 backdrop-blur-md shadow-inner">
                                <Award className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Employee of the Month</h3>
                            <p className="text-indigo-100 text-sm mb-4">Nominations are now open for December 2024.</p>
                            <Button size="sm" className="bg-white text-indigo-600 hover:bg-white/90 font-bold border-none shadow-md w-full">Vote Now</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
