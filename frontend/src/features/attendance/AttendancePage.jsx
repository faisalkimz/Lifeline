import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    Clock, Calendar, CheckCircle2,
    Play, Square, Loader2, History, AlertCircle,
    Coffee, MapPin
} from 'lucide-react';
import {
    useClockInMutation,
    useClockOutMutation,
    useGetTodayAttendanceQuery,
    useGetMyAttendanceQuery
} from '../../store/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AttendancePage = () => {
    // 1. Core State & Queries
    const { data: todayStatus, refetch, isLoading: statusLoading } = useGetTodayAttendanceQuery(undefined, {
        pollingInterval: 30000
    });
    const { data: myAttendance } = useGetMyAttendanceQuery({ month: new Date().getMonth() + 1 });
    const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
    const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockIn = async () => {
        try {
            await clockIn({ notes: `Clocked in at ${currentTime.toLocaleTimeString()}` }).unwrap();
            toast.success('Successfully clocked in.');
            refetch();
        } catch (error) {
            const msg = error?.data?.error || error?.data?.detail || 'Failed to clock in.';
            toast.error(msg);
        }
    };

    const handleClockOut = async () => {
        try {
            await clockOut({ notes: `Clocked out at ${currentTime.toLocaleTimeString()}` }).unwrap();
            toast.success('Successfully clocked out.');
            refetch();
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to clock out.');
        }
    };

    const attendanceArray = React.useMemo(() =>
        Array.isArray(myAttendance) ? myAttendance : (myAttendance?.results || []),
        [myAttendance]);

    const stats = React.useMemo(() => {
        const present = attendanceArray.filter(a => a.status === 'present').length;
        const totalHrs = attendanceArray.reduce((sum, a) => sum + (parseFloat(a.hours_worked) || 0), 0);
        const lates = attendanceArray.filter(a => a.is_late).length;
        return { present, totalHrs, lates };
    }, [attendanceArray]);

    const formatTime = (date) => date.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });

    const formatDate = (date) => date.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="space-y-10 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance</h1>
                <p className="text-slate-500 mt-2">Track your work hours, analyze your schedule, and manage your time effectively.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Clock Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white p-8 relative overflow-hidden ring-1 ring-white/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-32 -mr-32 blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center text-center space-y-8 py-4">
                            <div>
                                <h2 className="text-5xl font-bold tabular-nums tracking-tight">{formatTime(currentTime)}</h2>
                                <p className="text-slate-400 font-medium mt-2">{formatDate(currentTime)}</p>
                            </div>

                            <div className="w-full">
                                {statusLoading ? (
                                    <div className="h-16 flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-white/50 animate-spin" />
                                    </div>
                                ) : !todayStatus?.is_clocked_in && !todayStatus?.clock_out ? (
                                    <Button
                                        onClick={handleClockIn}
                                        disabled={isClockingIn}
                                        className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-3"
                                    >
                                        {isClockingIn ? <Loader2 className="animate-spin h-5 w-5" /> : <Play className="fill-current h-5 w-5" />}
                                        Clock In
                                    </Button>
                                ) : todayStatus?.is_clocked_in ? (
                                    <div className="space-y-4">
                                        <div className="bg-white/10 rounded-2xl p-4 border border-white/5">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-emerald-400 font-medium text-sm">Currently Working</span>
                                            </div>
                                            <p className="text-slate-400 text-xs">Started at {new Date(todayStatus.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <Button
                                            onClick={handleClockOut}
                                            disabled={isClockingOut}
                                            className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 text-base font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
                                        >
                                            {isClockingOut ? <Loader2 className="animate-spin h-5 w-5" /> : <Square className="fill-current h-5 w-5" />}
                                            Clock Out
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-white/10 border border-white/5 rounded-2xl text-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                                        <p className="font-medium text-white">Shift Complete</p>
                                        <p className="text-xs text-slate-400 mt-1">See you tomorrow!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-3">
                                <Clock className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{Math.floor(stats.totalHrs)}h</p>
                            <p className="text-xs font-medium text-slate-500">Total Hours</p>
                        </Card>
                        <Card className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mb-3">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{stats.present}</p>
                            <p className="text-xs font-medium text-slate-500">Days Present</p>
                        </Card>
                    </div>
                </div>

                {/* History Table */}
                <Card className="lg:col-span-2 rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="p-8 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <History className="h-5 w-5 text-slate-400" />
                            Work History
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-lg h-9 text-xs font-medium">Export</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {attendanceArray.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase font-bold text-slate-400 tracking-wider">
                                            <th className="px-8 py-4">Date</th>
                                            <th className="px-6 py-4">Check In</th>
                                            <th className="px-6 py-4">Check Out</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {attendanceArray.map((record, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <Calendar className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium text-slate-900 text-sm">
                                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-medium text-slate-600">{record.clock_in_time || '--:--'}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-medium text-slate-600">{record.clock_out_time || '--:--'}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {record.is_late ? (
                                                        <Badge className="bg-amber-50 text-amber-600 border-amber-100">Late</Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">On Time</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className="text-sm font-bold text-slate-900">{record.hours_worked || 0}h</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-20 text-center text-slate-400">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No attendance records found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AttendancePage;
