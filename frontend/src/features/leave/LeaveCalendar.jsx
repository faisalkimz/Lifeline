import React, { useState } from 'react';
import { useGetLeaveRequestsQuery, useGetPublicHolidaysQuery } from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    ChevronLeft, ChevronRight, Calendar, User, Clock,
    Filter, Users, MapPin, AlertTriangle
} from 'lucide-react';

const LeaveCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

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

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
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

            // Check if the date falls within the leave period
            return date >= startDate && date <= endDate &&
                   (selectedDepartment === 'all' || request.employee_department === selectedDepartment);
        });
    };

    const getHolidayForDate = (date) => {
        if (!publicHolidays || !Array.isArray(publicHolidays)) return null;

        return publicHolidays.find(holiday =>
            new Date(holiday.date).toDateString() === date.toDateString()
        );
    };

    const getLeaveTypeColor = (leaveType) => {
        const colors = {
            annual: 'bg-green-100 text-green-800',
            sick: 'bg-red-100 text-red-800',
            maternity: 'bg-pink-100 text-pink-800',
            paternity: 'bg-blue-100 text-blue-800',
            emergency: 'bg-orange-100 text-orange-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[leaveType] || colors.other;
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Mock departments for filtering
    const departments = [
        'all', 'Engineering', 'HR', 'Finance', 'Marketing', 'Operations'
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leave Calendar</h1>
                    <p className="text-gray-600 mt-2">View team leave schedules and public holidays</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium mb-1">Department</label>
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="border rounded-md px-3 py-2"
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>
                                            {dept === 'all' ? 'All Departments' : dept}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">View Mode</label>
                                <select
                                    value={viewMode}
                                    onChange={(e) => setViewMode(e.target.value)}
                                    className="border rounded-md px-3 py-2"
                                >
                                    <option value="month">Month</option>
                                    <option value="week">Week</option>
                                    <option value="day">Day</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Calendar Navigation */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentDate(new Date())}
                            >
                                Today
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 border-b bg-gray-50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-4 text-center font-semibold text-gray-700 border-r last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {days.map((date, index) => {
                            const leaveRequestsForDay = date ? getLeaveRequestsForDate(date) : [];
                            const holiday = date ? getHolidayForDate(date) : null;
                            const isToday = date && date.toDateString() === new Date().toDateString();
                            const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();

                            return (
                                <div
                                    key={index}
                                    className={`min-h-[120px] border-r border-b p-2 ${
                                        isToday ? 'bg-blue-50' : ''
                                    } ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
                                >
                                    {date && (
                                        <>
                                            <div className={`text-sm font-medium mb-1 ${
                                                isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
                                            } ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                                                {date.getDate()}
                                            </div>

                                            {/* Public Holiday */}
                                            {holiday && (
                                                <div className="mb-1">
                                                    <Badge className="bg-red-100 text-red-700 text-xs">
                                                        🎄 {holiday.name}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Leave Requests */}
                                            <div className="space-y-1">
                                                {leaveRequestsForDay.slice(0, 2).map((request, reqIndex) => (
                                                    <div
                                                        key={reqIndex}
                                                        className={`text-xs p-1 rounded truncate ${getLeaveTypeColor(request.leave_type)}`}
                                                        title={`${request.employee_name} - ${request.leave_type}`}
                                                    >
                                                        <User className="h-3 w-3 inline mr-1" />
                                                        {request.employee_name.split(' ')[0]}
                                                    </div>
                                                ))}
                                                {leaveRequestsForDay.length > 2 && (
                                                    <div className="text-xs text-gray-500">
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
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Legend</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                            <span className="text-sm">Annual Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                            <span className="text-sm">Sick Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-pink-100 border border-pink-200 rounded"></div>
                            <span className="text-sm">Maternity Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                            <span className="text-sm">Paternity Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
                            <span className="text-sm">Emergency Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center text-xs">
                                🎄
                            </div>
                            <span className="text-sm">Public Holiday</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Leave Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Upcoming Leave (Next 30 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : !leaveRequests || leaveRequests.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            No upcoming leave requests
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaveRequests
                                .filter(request => new Date(request.start_date) >= new Date())
                                .slice(0, 5)
                                .map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{request.employee_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {request.leave_type} • {request.days_count} days
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {new Date(request.start_date).toLocaleDateString()}
                                            </p>
                                            <Badge className={getLeaveTypeColor(request.leave_type)}>
                                                {request.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LeaveCalendar;
