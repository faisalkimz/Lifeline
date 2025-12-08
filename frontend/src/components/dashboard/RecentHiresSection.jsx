import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Star, Users } from 'lucide-react';

const RecentHiresSection = ({ stats }) => {
    return (
        <Card className="h-96 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Star className="h-5 w-5 text-warning-600" />
                    New Hires
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                {stats?.recent_hires_list?.length > 0 ? (
                    <div className="space-y-3">
                        {stats.recent_hires_list.map((emp) => (
                            <div
                                key={emp.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-transparent"
                            >
                                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm shrink-0">
                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{emp.first_name} {emp.last_name}</h4>
                                    <p className="text-xs text-gray-500 truncate">{emp.job_title}</p>
                                </div>
                                <div className="text-xs font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 shrink-0">
                                    {new Date(emp.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>None yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentHiresSection;
