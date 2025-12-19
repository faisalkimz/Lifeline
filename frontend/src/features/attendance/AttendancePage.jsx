import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    Clock, Calendar, TrendingUp, Users, CheckCircle, XCircle, LogIn, LogOut
} from 'lucide-react';
import {
    useClockInMutation,
    useClockOutMutation,
    useGetTodayAttendanceQuery,
    useGetMyAttendanceQuery
} from '../../store/api';
import toast from 'react-hot-toast';

const AttendancePage = () => {
    const { data: todayStatus, refetch } = useGetTodayAttendanceQuery();
    const { data: myAttendance } = useGetMyAttendanceQuery({ month: new Date().getMonth() + 1 });
    const [clockIn] = useClockInMutation();
    const [clockOut] = useClockOutMutation();

    const handleClockIn = async () => {
        try {
            await clockIn({}).unwrap();
            toast.success('Clocked in successfully!');
            refetch();
        } catch (error) {
            toast.error('Failed to clock in');
        }
    };

    const handleClockOut = async () => {
        try {
            await clockOut({}).unwrap();
            toast.success('Clocked out successfully!');
            refetch();
        } catch (error) {
            toast.error('Failed to clock out');
        }
    };

    const attendanceArray = Array.isArray(myAttendance) ? myAttendance : (myAttendance?.results || []);
    const presentDays = attendanceArray.filter(a => a.status === 'present').length;
    const lateDays = attendanceArray.filter(a => a.is_late).length;
    const totalHours = attendanceArray.reduce((sum, a) => sum + (a.hours_worked || 0), 0);

    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const currentDate = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
                <p className="text-gray-600 mt-1">Track your work hours</p>
            </div>

            {/* Clock In/Out Card */}
            <Card className="border border-gray-200">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center">
                            <div className="mb-4">
                                <p className="text-4xl font-bold text-gray-900 mb-2">{currentTime}</p>
                                <p className="text-gray-600">{currentDate}</p>
                            </div>

                            {!todayStatus?.clocked_in ? (
                                <Button onClick={handleClockIn} size="lg" className="w-full md:w-auto">
                                    <LogIn className="h-5 w-5 mr-2" /> Clock In
                                </Button>
                            ) : !todayStatus?.clocked_out ? (
                                <div className="space-y-4">
                                    <Badge className="bg-green-100 text-green-700 border-0 text-sm px-4 py-2">
                                        <CheckCircle className="h-4 w-4 mr-2 inline" />
                                        Clocked in at {todayStatus.clock_in_time}
                                    </Badge>
                                    <Button onClick={handleClockOut} size="lg" className="w-full md:w-auto">
                                        <LogOut className="h-5 w-5 mr-2" /> Clock Out
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Badge className="bg-blue-100 text-blue-700 border-0 text-sm px-4 py-2 block">
                                        <CheckCircle className="h-4 w-4 mr-2 inline" />
                                        Completed for today
                                    </Badge>
                                    <div className="text-sm text-gray-600">
                                        <p>In: {todayStatus.clock_in_time}</p>
                                        <p>Out: {todayStatus.clock_out_time}</p>
                                        <p className="font-semibold mt-2">Hours: {todayStatus.hours_worked || 0}h</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-l border-gray-200 pl-8">
                            <h3 className="font-semibold text-gray-900 mb-4">Today's Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <Badge className={`${todayStatus?.clocked_in ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} border-0`}>
                                        {todayStatus?.clocked_in ? 'Present' : 'Not Yet'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Clock In</span>
                                    <span className="text-sm font-medium text-gray-900">{todayStatus?.clock_in_time || '--:--'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Clock Out</span>
                                    <span className="text-sm font-medium text-gray-900">{todayStatus?.clock_out_time || '--:--'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{presentDays}</p>
                            <p className="text-sm text-gray-600">Days Present</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{lateDays}</p>
                            <p className="text-sm text-gray-600">Late Arrivals</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{Math.round(totalHours)}</p>
                            <p className="text-sm text-gray-600">Total Hours</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{attendanceArray.length}</p>
                            <p className="text-sm text-gray-600">This Month</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance History */}
            <Card className="border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold">Attendance History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {attendanceArray.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {attendanceArray.slice(0, 10).map((record, i) => (
                                <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {new Date(record.date).toLocaleDateString('en-GB', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                In: {record.clock_in_time || '--'} | Out: {record.clock_out_time || '--'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-600">{record.hours_worked || 0}h</span>
                                            <Badge className={`
                                                ${record.status === 'present' ? 'bg-green-100 text-green-700' : ''}
                                                ${record.status === 'absent' ? 'bg-red-100 text-red-700' : ''}
                                                ${record.status === 'leave' ? 'bg-blue-100 text-blue-700' : ''}
                                                border-0
                                            `}>
                                                {record.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No attendance records yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendancePage;
