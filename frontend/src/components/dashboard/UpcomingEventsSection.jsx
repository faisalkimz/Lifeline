import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Calendar } from 'lucide-react';

const UpcomingEventsSection = ({ stats }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-5 w-5 text-warning-600" />
                    Coming Up
                </CardTitle>
            </CardHeader>
            <CardContent>
                {stats?.upcoming_events?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.upcoming_events.map((event, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all duration-200"
                            >
                                <div className="h-14 w-14 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 bg-gray-100 text-primary-600">
                                    <Calendar className="h-7 w-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{event.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {event.type} {event.years ? `(${event.years}y)` : ''}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No upcoming birthdays or anniversaries in the next 30 days.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UpcomingEventsSection;
