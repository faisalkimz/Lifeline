import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, Briefcase, Users } from 'lucide-react';
import EmployeeDistributionChart from './EmployeeDistributionChart';
import EmploymentTypeChart from './EmploymentTypeChart';
import GenderChart from './GenderChart';

const ChartsSection = ({ stats, isLoading }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Employee Status Distribution */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <TrendingUp className="h-5 w-5 text-primary-600" />
                        Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <EmployeeDistributionChart stats={stats} />
                    )}
                </CardContent>
            </Card>

            {/* Employment Type Distribution */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                        Types
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <EmploymentTypeChart stats={stats} />
                    )}
                </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Users className="h-5 w-5 text-pink-600" />
                        Diversity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <GenderChart stats={stats} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ChartsSection;
