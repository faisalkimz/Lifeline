import React from 'react';
import { useGetLeaveBalancesQuery } from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const LeaveBalances = () => {
    const { data: balances, isLoading } = useGetLeaveBalancesQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 bg-gray-100 rounded-xl border border-gray-200" />
                ))}
            </div>
        );
    }

    if (!balances || balances.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Balances</h3>
                <p className="text-sm text-gray-600">No active leave entitlements found for your profile.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {balances.map((balance, index) => {
                const percentageUsed = (balance.used_days / balance.total_days) * 100;
                const isCritical = balance.available_days < 3;

                return (
                    <motion.div
                        key={balance.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`border transition-all hover:shadow-md ${isCritical ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                            }`}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">{balance.year} Balance</p>
                                        <h3 className="font-semibold text-lg text-gray-900">{balance.leave_type_name}</h3>
                                    </div>
                                    <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100' : 'bg-primary-100'
                                        }`}>
                                        <TrendingUp className={`h-5 w-5 ${isCritical ? 'text-red-600' : 'text-primary-600'
                                            }`} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-4xl font-bold text-gray-900">{balance.available_days}</p>
                                                <span className="text-sm text-gray-600">Days</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">Available</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-700">{balance.total_days} Total</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (index * 0.1) }}
                                                className={`h-full rounded-full ${isCritical ? 'bg-red-600' : 'bg-primary-600'
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5 text-green-600">
                                                <CheckCircle className="h-3 w-3" />
                                                <span className="font-medium">{balance.used_days} Used</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-orange-600">
                                                <Clock className="h-3 w-3" />
                                                <span className="font-medium">{balance.pending_days} Pending</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default LeaveBalances;
