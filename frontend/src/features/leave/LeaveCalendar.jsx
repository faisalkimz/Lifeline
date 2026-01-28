import React, { useState } from 'react';
import { useGetLeaveRequestsQuery, useGetPublicHolidaysQuery } from '../../store/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    ChevronLeft, ChevronRight, Calendar, Clock, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

const LeaveCalendar = ({ mini = false }) => {
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
            // Reset hours for comparison
            const compareDate = new Date(date);
            compareDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            return compareDate >= startDate && compareDate <= endDate;
        });
    };

    const days = getDaysInMonth(currentDate);

    if (mini) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1">
                    {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                        <div key={day} className="text-[10px] font-black text-gray-400 text-center uppercase py-2">
                            {day}
                        </div>
                    ))}
                    {days.map((date, index) => {
                        const leaveRequestsForDay = date ? getLeaveRequestsForDate(date) : [];
                        const isToday = date && date.toDateString() === new Date().toDateString();
                        const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={index}
                                className={`h-10 rounded-lg flex flex-col items-center justify-center relative border transition-all ${!date ? 'border-transparent' :
                                        isToday ? 'border-primary-500 bg-primary-50' :
                                            'border-slate-50 hover:bg-gray-50'
                                    }`}
                            >
                                {date && (
                                    <>
                                        <span className={`text-[11px] font-black ${isToday ? 'text-primary-600' : 'text-gray-700'}`}>
                                            {date.getDate().toString().padStart(2, '0')}
                                        </span>
                                        {leaveRequestsForDay.length > 0 && (
                                            <div className="absolute -bottom-1 flex flex-col items-center">
                                                <div className="text-[8px] font-black text-primary-500 bg-white px-1 leading-none">
                                                    +{leaveRequestsForDay.length} more
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Standard full calendar remains mostly same or styled for Workpay */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="font-bold">Today</Button>
                </div>
            </div>

            <div className="grid grid-cols-7 border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <div key={day} className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-50">
                        {day}
                    </div>
                ))}
                {days.map((date, index) => {
                    const leaveRequestsForDay = date ? getLeaveRequestsForDate(date) : [];
                    const isToday = date && date.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={index}
                            className={`min-h-[140px] border-r border-b border-slate-50 p-3 transition-all hover:bg-gray-50/50 ${isToday ? 'bg-primary-50/30' : ''
                                }`}
                        >
                            {date && (
                                <>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-sm font-black ${isToday ? 'text-primary-600' : 'text-gray-400'}`}>
                                            {date.getDate()}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 focus:outline-none">
                                        {leaveRequestsForDay.slice(0, 3).map((req, ridx) => (
                                            <div key={ridx} className="px-2 py-1 rounded-lg bg-primary-100/50 border border-primary-100 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                <span className="text-[10px] font-black text-primary-700 truncate">{req.employee_name}</span>
                                            </div>
                                        ))}
                                        {leaveRequestsForDay.length > 3 && (
                                            <div className="text-[10px] font-black text-gray-400 text-center py-1">
                                                + {leaveRequestsForDay.length - 3} others
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeaveCalendar;
