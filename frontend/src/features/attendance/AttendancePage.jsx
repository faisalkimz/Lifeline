import React, { useState, useEffect } from 'react';
import {
    useClockInMutation,
    useClockOutMutation,
    useGetTodayAttendanceQuery,
    useGetMyAttendanceQuery,
    useGetTeamAttendanceQuery,
    useGetCurrentUserQuery
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Clock, LogIn, LogOut, Calendar, MapPin, History, Users } from 'lucide-react';
import { extractErrorMessage } from '../../utils/errorHandling'; // Assuming utility exists or I'll handle inline
import toast from 'react-hot-toast';

const AttendancePage = () => {
    const { data: user } = useGetCurrentUserQuery();
    const { data: todayStatus, isLoading, refetch } = useGetTodayAttendanceQuery();
    const [clockIn] = useClockInMutation();
    const [clockOut] = useClockOutMutation();
    const [notes, setNotes] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockIn = async () => {
        try {
            await clockIn({ notes }).unwrap();
            toast.success('Clocked in successfully!');
            setNotes('');
            refetch();
        } catch (error) {
            toast.error('Failed to clock in');
        }
    };

    const handleClockOut = async () => {
        try {
            await clockOut({ notes }).unwrap();
            toast.success('Clocked out successfully!');
            setNotes('');
            refetch();
        } catch (error) {
            toast.error('Failed to clock out');
        }
    };

    const isClockedIn = todayStatus?.is_clocked_in;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-xl text-white">
                <div className="absolute inset-0 bg-white/5 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                            <Clock className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Attendance Hub</h1>
                            <p className="text-indigo-100">Track and manage your work hours</p>
                        </div>
                    </div>
                    <div className="text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="text-3xl font-mono font-bold tracking-wider">
                            {currentTime.toLocaleTimeString()}
                        </div>
                        <div className="text-sm text-indigo-100 uppercase tracking-widest font-semibold">
                            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="today" className="space-y-6">
                <TabsList className="bg-white p-1 shadow-sm border border-gray-100 rounded-xl">
                    <TabsTrigger value="today" className="gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                        <Clock className="h-4 w-4" /> Today's Action
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                        <History className="h-4 w-4" /> History
                    </TabsTrigger>
                    {user?.role !== 'employee' && (
                        <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                            <Users className="h-4 w-4" /> Team Status
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="today" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Action Card */}
                        <Card className="h-full border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Shift Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        placeholder="Leaving early for appointment..."
                                    />
                                </div>

                                {!isClockedIn ? (
                                    <Button
                                        onClick={handleClockIn}
                                        className="w-full h-16 text-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-green-500/20"
                                    >
                                        <LogIn className="h-6 w-6 mr-2" /> Clock In
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleClockOut}
                                        variant="destructive"
                                        className="w-full h-16 text-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20"
                                    >
                                        <LogOut className="h-6 w-6 mr-2" /> Clock Out
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status Card */}
                        <Card className="h-full border-none shadow-lg">
                            <CardHeader>
                                <CardTitle>Session Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500">Status</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${isClockedIn ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                            {isClockedIn ? 'ACTIVE' : 'OFF DUTY'}
                                        </span>
                                    </div>

                                    {todayStatus?.clock_in && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-indigo-50 rounded-lg">
                                                    <div className="text-xs text-indigo-600 uppercase font-bold mb-1">Clock In</div>
                                                    <div className="text-lg font-mono font-semibold text-gray-900">
                                                        {new Date(todayStatus.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-pink-50 rounded-lg">
                                                    <div className="text-xs text-pink-600 uppercase font-bold mb-1">Clock Out</div>
                                                    <div className="text-lg font-mono font-semibold text-gray-900">
                                                        {todayStatus.clock_out ? new Date(todayStatus.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border border-dashed border-gray-200 rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-500 text-sm">Total Duration</span>
                                                    <span className="text-2xl font-bold text-gray-900">{todayStatus.hours_worked || 0}h</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                                                        style={{ width: `${Math.min(((todayStatus.hours_worked || 0) / 8) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1 text-right">Target: 8h</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <MyAttendanceHistory />
                </TabsContent>

                <TabsContent value="team">
                    <TeamAttendanceStatus />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const MyAttendanceHistory = () => {
    const { data: history, isLoading } = useGetMyAttendanceQuery();

    if (isLoading) return <LoadingSkeleton />;

    if (!history || history.length === 0) {
        return <div className="text-center py-10 text-gray-500">No attendance records found.</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Attendance Log</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Date</th>
                                <th className="px-4 py-3">Clock In</th>
                                <th className="px-4 py-3">Clock Out</th>
                                <th className="px-4 py-3">Hours</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 rounded-r-lg">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {new Date(record.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-indigo-600">
                                        {record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-pink-600">
                                        {record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold">
                                        {record.hours_worked}h
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {record.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={record.notes}>
                                        {record.notes || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

const TeamAttendanceStatus = () => {
    const { data: team, isLoading } = useGetTeamAttendanceQuery();

    if (isLoading) return <LoadingSkeleton />;

    if (!team || team.length === 0) {
        return <div className="text-center py-10 text-gray-500">No team data for today.</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Status (Today)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {team.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow">
                            <div>
                                <h4 className="font-bold text-gray-900">{member.employee_name || 'Unknown Employee'}</h4>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    {member.clock_in ? (
                                        <span className="text-green-600 flex items-center gap-1">
                                            <LogIn className="h-3 w-3" /> {new Date(member.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Not clocked in</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${member.is_clocked_in ? 'bg-green-100 text-green-700 border border-green-200' :
                                        'bg-gray-100 text-gray-500 border border-gray-200'
                                    }`}>
                                    {member.is_clocked_in ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-xl"></div>
        <div className="h-32 bg-gray-100 rounded-xl"></div>
    </div>
);

export default AttendancePage;
