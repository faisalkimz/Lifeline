import React from 'react';
import { useGetLeaveBalancesQuery } from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { PieChart, Clock, CheckCircle, Calendar, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const LeaveBalances = () => {
    const { data: balances, isLoading } = useGetLeaveBalancesQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 bg-white/5 rounded-[2.5rem] border border-white/5" />
                ))}
            </div>
        );
    }

    if (!balances || balances.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-16 text-center shadow-2xl overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px]" />
                <Calendar className="h-20 w-20 mx-auto mb-6 text-slate-700 opacity-50" />
                <h3 className="text-2xl font-black text-white tracking-tight uppercase italic pb-4">Protocol Imbalance Detected</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active leave entitlements synchronized with your profile.</p>
            </motion.div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
            {balances.map((balance, index) => {
                const percentageUsed = (balance.used_days / balance.total_days) * 100;
                const isCritical = balance.available_days < 3;

                return (
                    <motion.div key={balance.id} variants={item}>
                        <Card className="group relative overflow-hidden h-full border border-white/5 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] hover:border-white/10">
                            {/* Accent Glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 ${isCritical ? 'bg-rose-500' : 'bg-primary-500'
                                }`} />

                            <CardContent className="p-10 flex flex-col h-full relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]' : 'bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,1)]'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{balance.year} Registry</span>
                                        </div>
                                        <h3 className="font-black text-2xl text-white tracking-[-0.03em] uppercase italic group-hover:text-primary-400 transition-colors">{balance.leave_type_name}</h3>
                                    </div>
                                    <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 group-hover:bg-primary-600 group-hover:text-white group-hover:border-none transition-all duration-500 shadow-xl`}>
                                        <Zap className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="mt-auto space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-5xl font-black text-white tracking-tighter italic">{balance.available_days}</p>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pb-1 font-mono">Days</span>
                                            </div>
                                            <p className="text-[10px] font-black text-primary-500/60 uppercase tracking-[0.3em] mt-2">Available Credits</p>
                                        </div>
                                        <div className="text-right pb-1">
                                            <p className="text-xs font-black text-white group-hover:text-primary-400 transition-colors uppercase italic">{balance.total_days} Core</p>
                                        </div>
                                    </div>

                                    {/* Next-Gen Progress Bar */}
                                    <div className="space-y-3">
                                        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + (index * 0.1) }}
                                                className={`h-full rounded-full relative ${isCritical ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-gradient-to-r from-primary-600 to-indigo-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                                    }`}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                            </motion.div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <CheckCircle className="h-3 w-3" />
                                                <span>{balance.used_days} DEPLOYED</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-amber-500 animate-pulse">
                                                <Clock className="h-3 w-3" />
                                                <span>{balance.pending_days} QUEUED</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default LeaveBalances;
