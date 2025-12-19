import React, { useState } from 'react';
import { useGetLeaveRequestsQuery, useGetPublicHolidaysQuery } from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    ChevronLeft, ChevronRight, Calendar, User, Clock,
    Sparkles, Shield, UserCheck, PlaneLanding, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeaveCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month');

    const { data: leaveRequests, isLoading } = useGetLeaveRequestsQuery({
        start_date: getMonthStart(currentDate),
        end_date: getMonthEnd(currentDate)
    });

    const { data: publicHolidays } = useGetPublicHolidaysQuery({
        year: currentDate.getFullYear()
    });

    function getMonthStart(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    }

    function getMonthEnd(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };

    const getLeaveRequestsForDate = (date) => {
        if (!leaveRequests || !Array.isArray(leaveRequests)) return [];
        return leaveRequests.filter(request => {
            const startDate = new Date(request.start_date);
            const endDate = new Date(request.end_date);
            return date >= startDate && date <= endDate;
        });
    };

    const getHolidayForDate = (date) => {
        if (!publicHolidays || !Array.isArray(publicHolidays)) return null;
        return publicHolidays.find(holiday =>
            new Date(holiday.date).toDateString() === date.toDateString()
        );
    };

    const getLeaveTypeStyle = (leaveType) => {
        const styles = {
            annual: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
            sick: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
            emergency: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
            other: 'bg-primary-500/20 text-primary-400 border-primary-500/20'
        };
        return styles[leaveType] || styles.other;
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="space-y-10">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6 p-2 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth(-1)}
                        className="h-12 w-12 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="px-6 py-2 text-center">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                            {monthNames[currentDate.getMonth()]} <span className="text-primary-500">{currentDate.getFullYear()}</span>
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth(1)}
                        className="h-12 w-12 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setCurrentDate(new Date())}
                        className="h-14 px-8 rounded-2xl bg-white/5 border border-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 hover:text-white transition-all shadow-xl"
                    >
                        <Home className="h-4 w-4 mr-3" />
                        Today
                    </Button>
                </div>
            </div>

            {/* Calendar Matrix */}
            <Card className="rounded-[3rem] border border-white/5 bg-slate-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-7 border-b border-white/5 bg-slate-950/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-6 text-center font-black text-[10px] uppercase tracking-[0.4em] text-slate-500 border-r border-white/5 last:border-r-0 italic">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {days.map((date, index) => {
                        const leaveRequestsForDay = date ? getLeaveRequestsForDate(date) : [];
                        const holiday = date ? getHolidayForDate(date) : null;
                        const isToday = date && date.toDateString() === new Date().toDateString();
                        const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={index}
                                className={`min-h-[160px] border-r border-b border-white/5 p-4 transition-all hover:bg-white/5 group ${isToday ? 'bg-primary-500/5' : ''
                                    } ${!isCurrentMonth ? 'opacity-20 pointer-events-none' : ''}`}
                            >
                                {date && (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`text-sm font-black italic tracking-tighter transition-all ${isToday ? 'text-primary-400 scale-125' : 'text-slate-500 group-hover:text-white'
                                                }`}>
                                                {date.getDate()}
                                            </span>
                                            {isToday && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,1)]" />
                                            )}
                                        </div>

                                        {holiday && (
                                            <div className="mb-3 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                                <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest truncate">🎄 {holiday.name}</p>
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            {leaveRequestsForDay.slice(0, 3).map((request, reqIndex) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    key={reqIndex}
                                                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 group/request ${getLeaveTypeStyle(request.leave_type)}`}
                                                >
                                                    <div className="h-1 w-1 rounded-full bg-current" />
                                                    <span className="text-[9px] font-black uppercase tracking-tight truncate flex-1">
                                                        {request.employee_name.split(' ')[0]}
                                                    </span>
                                                </motion.div>
                                            ))}
                                            {leaveRequestsForDay.length > 3 && (
                                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center pt-1 group-hover:text-primary-500 transition-colors">
                                                    + {leaveRequestsForDay.length - 3} MORE
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Matrix Data Footer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="rounded-[3rem] border border-white/5 bg-slate-900/40 backdrop-blur-3xl overflow-hidden p-10 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <Shield className="h-6 w-6 text-primary-400" />
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Calendar Legend</h3>
                    </div>
                    <div className="flex flex-wrap gap-5">
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Annual Leave</span>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Sick Leave</span>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Emergency Leave</span>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-[3rem] border border-white/5 bg-slate-950/80 backdrop-blur-3xl overflow-hidden p-10 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-[60px]" />
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                        <Clock className="h-6 w-6 text-primary-400" />
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Upcoming Absences</h3>
                    </div>
                    <div className="space-y-4">
                        {leaveRequests?.filter(r => new Date(r.start_date) >= new Date()).slice(0, 3).map((req, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                                        <PlaneLanding className="h-5 w-5 text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase italic tracking-tight">{req.employee_name}</p>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{new Date(req.start_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="p-2.5 bg-primary-600/20 text-primary-400 rounded-xl">
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LeaveCalendar;
