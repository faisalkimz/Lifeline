import React, { useState } from 'react';
import { useClockInMutation, useClockOutMutation, useGetTodayAttendanceQuery } from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock, LogIn, LogOut, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const AttendancePage = () => {
    const { data: todayStatus, isLoading, refetch } = useGetTodayAttendanceQuery();
    const [clockIn] = useClockInMutation();
    const [clockOut] = useClockOutMutation();
    const [notes, setNotes] = useState('');

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

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const [currentTime, setCurrentTime] = useState(getCurrentTime());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const isClockedIn = todayStatus?.is_clocked_in;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Clock className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Attendance</h1>
                    </div>
                    <p className="text-blue-100 text-lg">Track your work hours</p>
                </div>
            </div>

            {/* Current Time & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clock Display */}
                <Card className="border-2 border-primary-200">
                    <CardContent className="p-8 text-center">
                        <Clock className="h-16 w-16 mx-auto mb-4 text-primary-600" />
                        <div className="text-5xl font-bold text-gray-900 mb-2 font-mono">
                            {currentTime}
                        </div>
                        <p className="text-gray-600">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </CardContent>
                </Card>

                {/* Status Card */}
                <Card className={`border-2 ${isClockedIn ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            {isClockedIn ? (
                                <>
                                    <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-lg font-semibold text-green-700">Currently Clocked In</span>
                                </>
                            ) : (
                                <>
                                    <div className="h-4 w-4 rounded-full bg-gray-400" />
                                    <span className="text-lg font-semibold text-gray-700">Not Clocked In</span>
                                </>
                            )}
                        </div>

                        {todayStatus?.clock_in && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <LogIn className="h-4 w-4" />
                                    <span>Clock In: {new Date(todayStatus.clock_in).toLocaleTimeString()}</span>
                                </div>
                                {todayStatus.clock_out && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <LogOut className="h-4 w-4" />
                                        <span>Clock Out: {new Date(todayStatus.clock_out).toLocaleTimeString()}</span>
                                    </div>
                                )}
                                {todayStatus.hours_worked > 0 && (
                                    <div className="mt-4 p-3 bg-white rounded-lg">
                                        <p className="text-sm text-gray-600">Hours Worked</p>
                                        <p className="text-2xl font-bold text-gray-900">{todayStatus.hours_worked}h</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Clock In/Out Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Clock In / Out</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Add any notes about your shift..."
                            />
                        </div>

                        <div className="flex gap-3">
                            {!isClockedIn ? (
                                <Button
                                    onClick={handleClockIn}
                                    className="flex-1 h-14 text-lg"
                                    size="lg"
                                >
                                    <LogIn className="h-5 w-5 mr-2" />
                                    Clock In
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleClockOut}
                                    variant="destructive"
                                    className="flex-1 h-14 text-lg"
                                    size="lg"
                                >
                                    <LogOut className="h-5 w-5 mr-2" />
                                    Clock Out
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Today's Summary */}
            {todayStatus && todayStatus.clock_in && (
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                <p className="text-lg font-semibold capitalize">{todayStatus.status}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Hours Worked</p>
                                <p className="text-lg font-semibold">{todayStatus.hours_worked || 0}h</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Overtime</p>
                                <p className="text-lg font-semibold">{todayStatus.overtime_hours || 0}h</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Late By</p>
                                <p className="text-lg font-semibold text-red-600">
                                    {todayStatus.is_late ? `${todayStatus.late_by_minutes} min` : 'On Time'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AttendancePage;
