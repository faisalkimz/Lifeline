import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    Clock, Calendar, CheckCircle2,
    Play, Square, Loader2, History, AlertCircle,
    Coffee, MapPin, QrCode, Settings
} from 'lucide-react';
import {
    useClockInMutation,
    useClockOutMutation,
    useGetTodayAttendanceQuery,
    useGetMyAttendanceQuery,
    useGetAttendancePolicyQuery
} from '../../store/api';
import { exportToCSV } from '../../utils/exportUtils';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AttendancePage = () => {
    // 1. Core State & Queries
    const { data: todayStatus, refetch, isLoading: statusLoading } = useGetTodayAttendanceQuery(undefined, {
        pollingInterval: 30000
    });
    const { data: attendancePolicy, isLoading: isPolicyLoading } = useGetAttendancePolicyQuery();
    const { data: myAttendance } = useGetMyAttendanceQuery({ month: new Date().getMonth() + 1 });
    const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
    const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [qrMode, setQrMode] = useState(false);
    const [qrCode, setQrCode] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const policy = attendancePolicy?.[0] || attendancePolicy;

    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
            } else {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    (err) => reject(err),
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            }
        });
    };

    const handleClockIn = async (qrTokenReq = null) => {
        try {
            let coords = null;
            if (policy?.enable_geofencing) {
                toast.loading('Verifying location...', { id: 'geo' });
                coords = await getLocation();
                toast.success('Location verified', { id: 'geo' });
            }

            if (policy?.enable_qr_clock_in && !qrTokenReq) {
                setQrMode(true);
                return;
            }

            const payload = {
                notes: `Clocked in via portal`,
                ...(coords && { latitude: coords.lat, longitude: coords.lng }),
                ...(qrTokenReq && { qr_token: qrTokenReq })
            };

            await clockIn(payload).unwrap();
            toast.success('Clocked in successfully');
            setQrMode(false);
            setQrCode('');
            refetch();
        } catch (error) {
            console.error(error);
            const msg = error?.data?.error || error?.message || 'Failed to clock in';
            toast.error(msg, { id: 'geo' });
        }
    };

    const handleClockOut = async () => {
        try {
            let coords = null;
            if (policy?.enable_geofencing) {
                coords = await getLocation();
            }

            await clockOut({
                notes: `Clocked out via portal`,
                latitude: coords?.lat,
                longitude: coords?.lng
            }).unwrap();

            toast.success('Clocked out successfully');
            refetch();
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to clock out');
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

    const handleExport = () => {
        if (!attendanceArray || attendanceArray.length === 0) {
            toast.error("No records to export");
            return;
        }

        const exportData = attendanceArray.map(record => ({
            Date: record.date,
            'Clock In': record.clock_in_time || '--:--',
            'Clock Out': record.clock_out_time || '--:--',
            Status: record.is_late ? 'Late' : 'On Time',
            'Worked Hours': record.hours_worked || 0
        }));

        exportToCSV(exportData, `attendance_${new Date().toISOString().split('T')[0]}`);
        toast.success("History exported");
    };

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your daily work hours and check-in status.</p>
                </div>
                {['admin', 'hr_manager', 'company_admin'].includes(useSelector(state => state.auth.user?.role)) && (
                    <Button
                        onClick={() => window.location.href = '/attendance/admin'}
                        variant="outline"
                        className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-slate-200"
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin View
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Clocking Interface */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="p-4 bg-slate-50 rounded-full">
                                    <Clock className="h-8 w-8 text-[#88B072]" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold text-slate-900 tabular-nums">{formatTime(currentTime)}</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">{formatDate(currentTime)}</p>
                                </div>

                                <div className="w-full pt-4">
                                    {statusLoading ? (
                                        <div className="h-14 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
                                        </div>
                                    ) : !todayStatus?.is_clocked_in && !todayStatus?.clock_out ? (
                                        qrMode ? (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder="Enter QR Token"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded h-12 px-4 text-center text-sm font-semibold focus:border-[#88B072] outline-none"
                                                    value={qrCode}
                                                    onChange={e => setQrCode(e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" onClick={() => setQrMode(false)} className="flex-1 text-[10px] font-bold uppercase h-10 border-none">
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={() => handleClockIn(qrCode)} disabled={!qrCode || isClockingIn} className="flex-1 bg-[#88B072] hover:bg-[#7aa265] text-white text-[10px] font-bold uppercase h-10">
                                                        {isClockingIn ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handleClockIn()}
                                                disabled={isClockingIn || isPolicyLoading}
                                                className="w-full h-14 bg-[#88B072] hover:bg-[#7aa265] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
                                            >
                                                {isClockingIn || isPolicyLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                                    policy?.enable_qr_clock_in ? <QrCode className="h-5 w-5 mr-3" /> : <Play className="h-5 w-5 mr-3" />
                                                )}
                                                {policy?.enable_qr_clock_in ? "Scan to Clock In" : "Start Working"}
                                            </Button>
                                        )
                                    ) : todayStatus?.is_clocked_in ? (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-emerald-50 rounded border border-emerald-100">
                                                <div className="flex items-center justify-center gap-2 mb-1 text-emerald-600">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Shift</span>
                                                </div>
                                                <p className="text-[11px] text-emerald-500 font-medium">Started at {new Date(todayStatus.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <Button
                                                onClick={handleClockOut}
                                                disabled={isClockingOut}
                                                className="w-full h-12 bg-slate-900 text-white hover:bg-black text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2"
                                            >
                                                {isClockingOut ? <Loader2 className="animate-spin h-4 w-4" /> : <Square className="h-4 w-4" />}
                                                Clock Out
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg text-center">
                                            <CheckCircle2 className="h-6 w-6 text-[#88B072] mx-auto mb-3" />
                                            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Shift Complete</h4>
                                            <p className="text-[10px] text-slate-500 mt-1 uppercase">Today's hours recorded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <p className="text-2xl font-bold text-slate-900">{Math.floor(stats.totalHrs)}h</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Work Hours</p>
                        </div>
                        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <p className="text-2xl font-bold text-slate-900">{stats.present}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Days Present</p>
                        </div>
                    </div>
                </div>

                {/* History */}
                <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
                    <CardHeader className="border-b border-slate-50 py-4 px-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <History className="h-4 w-4 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Attendance Log</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleExport} className="text-[10px] font-bold uppercase text-[#88B072]">
                            Export CSV
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {attendanceArray.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clock In</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clock Out</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {attendanceArray.map((record, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-slate-700 uppercase">
                                                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-500">{record.clock_in_time || '--:--'}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-500">{record.clock_out_time || '--:--'}</td>
                                                <td className="px-6 py-4">
                                                    {record.is_late ? (
                                                        <Badge className="bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded px-2 py-0.5 border-none">Late</Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded px-2 py-0.5 border-none">On Time</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-bold text-slate-900">{record.hours_worked || 0}h</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-24 text-center">
                                <Calendar className="h-10 w-10 text-slate-100 mx-auto mb-4" />
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No activity recorded yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AttendancePage;
