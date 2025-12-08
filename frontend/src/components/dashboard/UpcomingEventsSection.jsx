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
                {(() => {
                    const hasUpcoming = stats?.upcoming_events && stats.upcoming_events.length > 0;
                    const fallback = stats?.next_events && stats.next_events.length > 0;
                    const events = hasUpcoming ? stats.upcoming_events : (fallback ? stats.next_events : []);

                    if (events.length === 0) {
                        return (
                            <div className="text-center text-gray-500 py-10">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No upcoming birthdays or anniversaries found.</p>
                            </div>
                        );
                    }

                    return (
                        <div>
                            {!hasUpcoming && fallback && (
                                <div className="px-4 pb-3">
                                    <p className="text-sm text-gray-500">No events in the next 30 days — showing the next upcoming events.</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-3">
                                {events.map((event, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all duration-200"
                                    >
                                        <div className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 ${event.type && event.type.toLowerCase().includes('birthday') ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'}`}>
                                            {event.type && event.type.toLowerCase().includes('birthday') ? '🎂' : '🎉'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{event.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {event.type} {event.years ? `(${event.years}y)` : ''}
                                                {event.days_until !== undefined ? ` • in ${event.days_until} day${event.days_until === 1 ? '' : 's'}` : ''}
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
                        </div>
                    );
                })()}
            </CardContent>
        </Card>
    );
};

export default UpcomingEventsSection;
