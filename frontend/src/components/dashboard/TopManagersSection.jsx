import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Award, Target } from 'lucide-react';

const TopManagersSection = ({ topManagers }) => {
    return (
        <Card className="h-96 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Award className="h-5 w-5 text-primary-600" />
                    Team Leaders
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                {topManagers.length > 0 ? (
                    <div className="space-y-3">
                        {topManagers.map((manager, index) => (
                            <div
                                key={manager.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-transparent"
                            >
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-gray-100 text-gray-700 ${index === 0 ? 'ring-2 ring-primary-100' : ''}`}>
                                    {String(index + 1)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{manager.full_name}</h4>
                                    <p className="text-xs text-gray-500 truncate">{manager.job_title}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-lg font-bold text-gray-900">{manager.subordinates?.length || 0}</div>
                                    <p className="text-xs text-gray-500">team</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>None yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TopManagersSection;
