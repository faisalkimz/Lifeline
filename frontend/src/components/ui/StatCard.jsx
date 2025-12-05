import React from 'react';
import { Card, CardContent } from './Card';

export const StatCard = ({ title, value, icon: Icon, trend, trendUp, color = "primary" }) => {
    const colorClasses = {
        primary: "bg-primary-50 text-primary-600",
        success: "bg-success-50 text-success-600",
        warning: "bg-warning-50 text-warning-600",
        error: "bg-error-50 text-error-600",
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                    </div>
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color] || colorClasses.primary}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center text-sm">
                        <span className={trendUp ? "text-success-600" : "text-error-600"}>
                            {trend}
                        </span>
                        <span className="text-gray-500 ml-2">vs last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
