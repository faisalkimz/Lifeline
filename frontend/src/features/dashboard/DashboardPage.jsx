import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Calendar, Wallet, FileText, ArrowRight,
    CreditCard, Banknote, Clock, Award,
    Users, FileStack, Network, Bell, CheckCircle
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

    const StatCard = ({ icon: Icon, label, link, color, subLabel }) => (
        <Link to={link} className="block group">
            <Card className="hover:shadow-lg transition-all border-none shadow-sm h-full bg-white overflow-hidden relative">
                <CardContent className="p-6">
                    <div className={`mb-4 inline-flex p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{label}</h3>
                        <p className="text-sm text-slate-500">{subLabel}</p>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5 text-slate-300" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-10">
            {/* Main Content Area */}
            <div className="flex-1 space-y-8">

                {/* Greeting Section */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider">
                                {user?.company_name || 'Lifeline'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            {greeting}, {user.first_name || user.last_name}
                        </h1>
                        <p className="text-slate-600 text-lg max-w-2xl">
                            It's a new week, {user.first_name}! Either you run the week, or the week runs you. 😉
                        </p>
                    </div>
                    {/* Decorative background blob */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                </div>

                {/* Pending Tasks Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary-600" />
                            Here are your pending tasks
                        </h2>
                    </div>
                    {/* Mock Pending Tasks */}
                    <Card className="border-none shadow-sm">
                        <div className="divide-y divide-slate-50">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {i === 0 ? <Clock className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                                                {i === 0 ? 'Review Payroll for December' : 'Approve Leave Request for Sarah'}
                                            </p>
                                            <p className="text-xs text-slate-500">Due today at 5:00 PM</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="hidden group-hover:flex">Review</Button>
                                </div>
                            ))}
                        </div>
                        {/* Empty state if needed
                        <CardContent className="py-8 text-center text-slate-500">
                             <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3 opacity-20" />
                             <p>You're all caught up! No pending tasks.</p>
                        </CardContent>
                        */}
                    </Card>
                </div>

                {/* "For You" Grid */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">For you</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={Calendar}
                            label="Leaves"
                            subLabel="View your leaves."
                            link="/leave"
                            color="bg-orange-500"
                        />
                        <StatCard
                            icon={CreditCard}
                            label="Expenses"
                            subLabel="View your expenses."
                            link="/finance/expenses"
                            color="bg-pink-500"
                        />
                        <StatCard
                            icon={Banknote}
                            label="Loans"
                            subLabel="View your loans."
                            link="/finance/loans"
                            color="bg-purple-500"
                        />
                        <StatCard
                            icon={Wallet}
                            label="Payslips"
                            subLabel="View your payslips."
                            link="/payroll/my-payslips"
                            color="bg-teal-500"
                        />
                    </div>
                </div>

                {/* Quick Access Grid */}
                <div className="border-t border-slate-100 pt-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Access</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'Disciplinary', icon: Award, link: '/disciplinary' },
                            { name: 'Salary Advance', icon: FileStack, link: '/payroll/advances' },
                            { name: 'Overtime', icon: Clock, link: '/attendance/overtime' },
                            { name: 'Trainings', icon: Award, link: '/training' },
                            { name: 'Performance', icon: Network, link: '/performance' },
                            { name: 'Documents', icon: FileText, link: '/documents' },
                            { name: 'Org. Structure', icon: Users, link: '/organization' },
                            { name: 'Settings', icon: Users, link: '/settings' },
                        ].map((item) => (
                            <Link key={item.name} to={item.link}>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group h-full">
                                    <div className="p-2 rounded-full bg-slate-50 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{item.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-80 space-y-8 flex-shrink-0">
                {/* Profile Card */}
                <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-500 rounded-full blur-3xl opacity-20"></div>
                    <CardContent className="p-8 text-center relative z-10">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-white/10 overflow-hidden">
                            {user.photo ? (
                                <img src={getImageUrl(user.photo)} alt="Me" className="h-full w-full object-cover" />
                            ) : (
                                <span>{user.first_name?.[0]}{user.last_name?.[0]}</span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold mb-1">{user.first_name} {user.last_name}</h2>
                        <p className="text-primary-200 text-sm mb-6">{user.role || 'Junior Full Stack Engineer'}</p>
                        <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold">
                            View Profile
                        </Button>
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {[
                                { title: 'Team Building', date: 'Dec 20', time: '2:00 PM', type: 'fun' },
                                { title: 'Q4 Review', date: 'Dec 22', time: '10:00 AM', type: 'work' },
                                { title: 'Christmas Party', date: 'Dec 24', time: '6:00 PM', type: 'fun' },
                            ].map((event, i) => (
                                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg border ${event.type === 'fun' ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                                        <span className="text-xs font-bold uppercase">{event.date.split(' ')[0]}</span>
                                        <span className="text-lg font-bold leading-none">{event.date.split(' ')[1]}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{event.title}</p>
                                        <p className="text-xs text-slate-500">{event.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4">
                            <Button variant="ghost" className="w-full text-xs text-slate-500">View Calendar</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
