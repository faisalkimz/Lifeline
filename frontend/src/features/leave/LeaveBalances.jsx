import React from 'react';
import { useGetLeaveBalancesQuery } from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { PieChart, Clock, CheckCircle, Calendar } from 'lucide-react';

const LeaveBalances = () => {
    const { data: balances, isLoading } = useGetLeaveBalancesQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl" />
                ))}
            </div>
        );
    }

    if (!balances || balances.length === 0) {
        return (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center text-blue-800">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No leave balances assigned yet.</p>
            </div>
        );
    }

    // Gradient map for different leave types
    const gradients = [
        'from-blue-500 to-blue-600',
        'from-purple-500 to-purple-600',
        'from-emerald-500 to-emerald-600',
        'from-orange-500 to-orange-600',
        'from-pink-500 to-pink-600',
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {balances.map((balance, index) => {
                const gradient = gradients[index % gradients.length];
                const percentageUsed = (balance.used_days / balance.total_days) * 100;

                return (
                    <Card key={balance.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{balance.leave_type_name}</h3>
                                    <p className="text-sm text-gray-500">{balance.year} Entitlement</p>
                                </div>
                                <div className={`p-2 rounded-lg bg-gray-50 text-gray-600`}>
                                    <PieChart className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{balance.available_days}</p>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Days Available</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{balance.total_days} Total</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                                    />
                                </div>

                                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span>{balance.used_days} Used</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-orange-500" />
                                        <span>{balance.pending_days} Pending</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default LeaveBalances;
