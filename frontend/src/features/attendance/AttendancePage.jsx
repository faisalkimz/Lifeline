import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    Clock, Calendar, CheckCircle2,
    Play, Square, Loader2, History, AlertCircle,
    Coffee, MapPin, QrCode, Settings, MoreHorizontal, User,
    ChevronDown, ArrowUpRight
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
import { cn } from '../../utils/cn';

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
            toast.success('Shift started');
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

            toast.success('Shift ended');
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
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
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
        toast.success("Log exported");
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Time & Attendance</h1>
                    <p className="text-notion-text-light mt-2">Log your work hours and track your daily productivity.</p>
                </div>
                {['admin', 'hr_manager', 'company_admin'].includes(useSelector(state => state.auth.user?.role)) && (
                    <Button
                        onClick={() => window.location.href = '/attendance/admin'}
                        variant="ghost"
                        className="btn-notion-outline h-8"
                    >
                        <Settings className="h-3.5 w-3.5 mr-2" />
                        Admin View
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Clock Interface */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="p-8 rounded-lg border border-notion-border space-y-8">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-notion-text-light uppercase tracking-wider">Current Time</p>
                            <h2 className="text-5xl font-bold tracking-tighter tabular-nums text-notion-text">
                                {formatTime(currentTime)}
                            </h2>
                            <p className="text-sm font-medium text-notion-text-light opacity-60">{formatDate(currentTime)}</p>
                        </div>

                        <div className="pt-4 border-t border-notion-border">
                            {statusLoading ? (
                                <div className="h-12 flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin opacity-20" />
                                </div>
                            ) : !todayStatus?.is_clocked_in && !todayStatus?.clock_out ? (
                                qrMode ? (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Enter QR Token"
                                            className="w-full bg-notion-sidebar border border-notion-border rounded-md h-10 px-4 text-sm font-medium focus:ring-1 focus:ring-notion-text outline-none"
                                            value={qrCode}
                                            onChange={e => setQrCode(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <Button variant="ghost" onClick={() => setQrMode(false)} className="flex-1 h-9 text-xs font-semibold">
                                                Cancel
                                            </Button>
                                            <Button onClick={() => handleClockIn(qrCode)} disabled={!qrCode || isClockingIn} className="flex-1 btn-notion-primary h-9">
                                                Verify
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => handleClockIn()}
                                        disabled={isClockingIn || isPolicyLoading}
                                        className="w-full btn-notion-primary h-12 text-sm font-bold uppercase tracking-wider"
                                    >
                                        {isClockingIn || isPolicyLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : (
                                            policy?.enable_qr_clock_in ? <QrCode className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />
                                        )}
                                        {policy?.enable_qr_clock_in ? "Scan to Clock In" : "Start Shift"}
                                    </Button>
                                )
                            ) : todayStatus?.is_clocked_in ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-notion-sidebar border border-notion-border rounded-md flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Shift</p>
                                            <p className="text-xs font-medium opacity-60">Since {new Date(todayStatus.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <Button
                                        onClick={handleClockOut}
                                        disabled={isClockingOut}
                                        className="w-full h-11 btn-notion-outline border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        <Square className="h-3.5 w-3.5 mr-2" />
                                        Stop Shift
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-6 bg-notion-sidebar border border-notion-border rounded-md text-center space-y-2">
                                    <CheckCircle2 className="h-6 w-6 text-notion-text opacity-20 mx-auto" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest">Shift Complete</p>
                                    <p className="text-xs text-notion-text-light opacity-60">Hours recorded for today.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-lg border border-notion-border space-y-1">
                            <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Hours</p>
                            <p className="text-2xl font-bold">{Math.floor(stats.totalHrs)}h</p>
                        </div>
                        <div className="p-5 rounded-lg border border-notion-border space-y-1">
                            <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Present</p>
                            <p className="text-2xl font-bold">{stats.present}</p>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between border-b border-notion-border pb-2">
                        <h3 className="text-sm font-semibold text-notion-text-light uppercase tracking-wider">Attendance Log</h3>
                        <button onClick={handleExport} className="text-[11px] font-bold text-notion-primary hover:underline uppercase tracking-wider">
                            Export Log
                        </button>
                    </div>

                    {attendanceArray.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-notion-border">
                                        <th className="px-4 py-3 text-[11px] font-bold text-notion-text-light uppercase tracking-widest">Date</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-notion-text-light uppercase tracking-widest">Clocking</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-notion-text-light uppercase tracking-widest">Status</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-notion-text-light uppercase tracking-widest text-right">Hrs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-notion-border">
                                    {attendanceArray.map((record, i) => (
                                        <tr key={i} className="group hover:bg-notion-hover/40 transition-colors">
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-semibold">
                                                    {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs font-medium text-notion-text-light">
                                                {record.clock_in_time || '--:--'} • {record.clock_out_time || '--:--'}
                                            </td>
                                            <td className="px-4 py-4">
                                                {record.is_late ? (
                                                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-100">Late</span>
                                                ) : (
                                                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">On Time</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="text-sm font-bold">{record.hours_worked || 0}h</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-24 text-center border-2 border-dashed border-notion-border rounded-lg opacity-40">
                            <History className="h-8 w-8 mx-auto mb-3 stroke-1" />
                            <p className="text-xs font-medium uppercase tracking-widest">No activity recorded</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
