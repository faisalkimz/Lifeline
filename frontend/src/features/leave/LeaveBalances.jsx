import React from 'react';
import { useGetLeaveBalancesQuery } from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const LeaveBalances = () => {
    const { data: balances, isLoading } = useGetLeaveBalancesQuery();

    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="min-w-[240px] h-40 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!balances || balances.length === 0) return null;

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {balances.map((balance) => {
                return (
                    <motion.div
                        key={balance.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="min-w-[220px] bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group"
                    >
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                            {balance.leave_type_name}
                            <div className="h-2 w-2 rounded-full bg-primary-500" />
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <p className="text-2xl font-black text-slate-900 leading-none">
                                    {parseFloat(balance.total_days).toFixed(2)}
                                </p>
                                <div className="flex flex-col mt-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Leave balance</span>
                                    <span className="text-sm font-black text-primary-600">
                                        {parseFloat(balance.available_days).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Leave taken</span>
                                <span className="text-sm font-black text-slate-700">
                                    {parseFloat(balance.used_days).toFixed(0)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default LeaveBalances;
