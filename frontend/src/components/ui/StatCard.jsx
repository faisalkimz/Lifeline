import React from 'react';
import { Card, CardContent } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export const StatCard = ({ title, value, icon, trend, trendUp, color = "primary", info }) => {
    const IconComponent = LucideIcons[icon];
    // Simplified: keep card white with subtle border and shadow on hover.
    return (
        <Card className={`transition-all duration-300 border border-gray-200 hover:shadow-lg`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
                        {(trend || info) && (
                            <div className="mt-3 flex items-center gap-2">
                                {trend && (
                                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                        trendUp ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
                                    }`}>
                                        {trendUp ? (
                                            <TrendingUp className="h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3" />
                                        )}
                                        {trend}
                                    </div>
                                )}
                                {info && !trend && (
                                    <span className="text-xs text-gray-500">{info}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 bg-white border border-gray-100`}>
                        {IconComponent && <IconComponent className="h-7 w-7 text-primary-600" />}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
