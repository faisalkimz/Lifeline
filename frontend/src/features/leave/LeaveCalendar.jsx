import React, { useState } from 'react';
import { useGetLeaveRequestsQuery, useGetPublicHolidaysQuery } from '../../store/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    ChevronLeft, ChevronRight, Calendar, Clock, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

const LeaveCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

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
            annual: 'bg-primary-100 text-primary-700 border-primary-200',
            sick: 'bg-red-100 text-red-700 border-red-200',
            emergency: 'bg-orange-100 text-orange-700 border-orange-200',
            other: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return styles[leaveType] || styles.other;
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="space-y-6">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth(-1)}
                        className="h-9 w-9 border border-gray-200"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="px-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth(1)}
                        className="h-9 w-9 border border-gray-200"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Button
                    onClick={() => setCurrentDate(new Date())}
                    size="sm"
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    Today
                </Button>
            </div>

            {/* Calendar Grid */}
            <Card className="border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
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
                                className={`min-h-[120px] border-r border-b border-gray-200 p-2 transition-all hover:bg-gray-50 ${isToday ? 'bg-primary-50' : ''
                                    } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                            >
                                {date && (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-sm font-medium ${isToday ? 'text-primary-600 font-bold' : 'text-gray-700'
                                                }`}>
                                                {date.getDate()}
                                            </span>
                                            {isToday && (
                                                <div className="h-2 w-2 rounded-full bg-primary-600" />
                                            )}
                                        </div>

                                        {holiday && (
                                            <div className="mb-2 px-2 py-1 bg-red-100 border border-red-200 rounded text-center">
                                                <p className="text-[10px] font-medium text-red-700 truncate">{holiday.name}</p>
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            {leaveRequestsForDay.slice(0, 2).map((request, reqIndex) => (
                                                <div
                                                    key={reqIndex}
                                                    className={`px-2 py-1 rounded border text-[10px] font-medium truncate ${getLeaveTypeStyle(request.leave_type)}`}
                                                >
                                                    {request.employee_name.split(' ')[0]}
                                                </div>
                                            ))}
                                            {leaveRequestsForDay.length > 2 && (
                                                <div className="text-[9px] text-gray-600 text-center">
                                                    +{leaveRequestsForDay.length - 2} more
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

            {/* Legend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Info className="h-5 w-5 text-primary-600" />
                        <h3 className="font-semibold text-gray-900">Calendar Legend</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 border border-primary-200 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                            <span className="text-xs font-medium text-primary-700">Annual Leave</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 border border-red-200 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            <span className="text-xs font-medium text-red-700">Sick Leave</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 border border-orange-200 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                            <span className="text-xs font-medium text-orange-700">Emergency</span>
                        </div>
                    </div>
                </Card>

                <Card className="border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="h-5 w-5 text-primary-600" />
                        <h3 className="font-semibold text-gray-900">Upcoming Absences</h3>
                    </div>
                    <div className="space-y-2">
                        {leaveRequests?.filter(r => new Date(r.start_date) >= new Date()).slice(0, 3).map((req, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-primary-50 transition-all">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{req.employee_name}</p>
                                    <p className="text-xs text-gray-600">{new Date(req.start_date).toLocaleDateString()}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                        ))}
                        {(!leaveRequests || leaveRequests.filter(r => new Date(r.start_date) >= new Date()).length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">No upcoming absences</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LeaveCalendar;
