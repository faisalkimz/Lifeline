import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import {
    Plus, Eye, CheckCircle, XCircle, Clock, Calendar, DollarSign,
    Zap, Activity, ShieldCheck, TrendingUp, Filter, Loader2,
    ArrowUpRight, Target, Flame, Timer, Coins, HardHat,
    Briefcase, MessageSquare, MoreVertical, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const OvertimePage = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedOvertime, setSelectedOvertime] = useState(null);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        reason: '',
        project: ''
    });

    const overtimeRecords = [
        {
            id: 1, date: '2025-12-15', start_time: '18:00', end_time: '22:00',
            hours: 4, rate: 1.5, amount: 180000, reason: 'Neural link maintenance',
            project: 'Infrastructure Alpha', status: 'approved',
            submitted_date: '2025-12-16', approved_date: '2025-12-16'
        },
        {
            id: 2, date: '2025-12-10', start_time: '17:30', end_time: '20:30',
            hours: 3, rate: 1.5, amount: 135000, reason: 'Operational readiness prep',
            project: 'Mission Q4', status: 'pending', submitted_date: '2025-12-11'
        },
        {
            id: 3, date: '2025-11-28', start_time: '19:00', end_time: '23:00',
            hours: 4, rate: 2.0, amount: 240000, reason: 'Holiday node support',
            project: 'Grid Guard', status: 'approved',
            submitted_date: '2025-11-29', approved_date: '2025-11-30'
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateHours = () => {
        if (!formData.start_time || !formData.end_time) return 0;
        const start = new Date(`2000-01-01T${formData.start_time}`);
        const end = new Date(`2000-01-01T${formData.end_time}`);
        let diff = (end - start) / (1000 * 60 * 60);
        if (diff < 0) diff += 24;
        return Math.max(0, diff);
    };

    const calculateAmount = () => {
        const hours = calculateHours();
        const baseRate = 75000;
        return Math.round(hours * baseRate * 1.5);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency', currency: 'UGX', minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-12 pb-24"
        >
            {/* Dark Overtime Hero */}
            <div className="relative rounded-[4rem] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-none p-12 lg:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full -mt-96 -mr-96 blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full -mb-96 -ml-96 blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
                    <div className="flex-1 space-y-10 text-center xl:text-left">
                        <div className="space-y-4">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.5em] px-6 py-2 rounded-full">
                                Personnel Flux & Overclocking
                            </Badge>
                            <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                                Tactical <br />
                                <span className="text-emerald-500">Overtime</span>
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center xl:justify-start gap-8">
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
                                <Flame className="h-4 w-4 text-emerald-500 animate-pulse" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Core Status: Overclocked</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full xl:w-auto">
                        <Button
                            onClick={() => setShowForm(true)}
                            className="h-24 px-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-[0.3em] text-sm rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-4"
                        >
                            <Plus className="h-6 w-6" /> INITIALIZE LOG
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tactical Policies Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <MetricCard icon={Timer} label="Total Overclock" val="11h" sub="Hours Accumulated" color="emerald" />
                        <MetricCard icon={ShieldCheck} label="Authorized" val="2" sub="Verified Sprints" color="blue" />
                        <MetricCard icon={Coins} label="Flux Credit" val={formatCurrency(555000)} sub="Total Earnings" color="indigo" />
                    </div>

                    {/* Records Surface */}
                    <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-900 px-12 py-10">
                            <CardTitle className="text-xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-4">
                                <Activity className="h-6 w-6 text-emerald-500" /> Personal <span className="text-emerald-500">Flux Logs</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="border-none">
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Temporal Coord</TableHead>
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Burst Duration</TableHead>
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Multiplier</TableHead>
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic text-right">Credit Yield</TableHead>
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {overtimeRecords.map((record) => (
                                            <TableRow key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedOvertime(record)}>
                                                <TableCell className="px-12 py-8 font-black text-slate-900 italic">{new Date(record.date).toLocaleDateString()}</TableCell>
                                                <TableCell className="px-12 py-8 font-bold text-slate-500 text-xs italic">{record.start_time} - {record.end_time} ({record.hours}H)</TableCell>
                                                <TableCell className="px-12 py-8">
                                                    <Badge className="bg-slate-900 text-white border-none text-[8px] font-black italic px-3 py-1 rounded-full">{record.rate}x</Badge>
                                                </TableCell>
                                                <TableCell className="px-12 py-8 text-right font-black text-emerald-500 italic">{formatCurrency(record.amount)}</TableCell>
                                                <TableCell className="px-12 py-8 text-right">
                                                    <Badge className={cn(
                                                        "border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full italic",
                                                        record.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                                    )}>
                                                        {record.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <aside className="space-y-8">
                    <Card className="rounded-[3.5rem] border-none shadow-xl bg-slate-900 text-white p-12 space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mt-32 -mr-32 group-hover:scale-150 transition-transform duration-1000"></div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter relative z-10 flex items-center gap-4">
                            <ShieldCheck className="h-6 w-6 text-emerald-400" /> Flux <span className="text-emerald-500">Protocols</span>
                        </h4>
                        <div className="space-y-6 relative z-10">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Standard Overclock</p>
                                <p className="text-lg font-black text-white italic">1.5x Multiplier</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Critical / Holiday</p>
                                <p className="text-lg font-black text-emerald-400 italic">2.0x Hyper-Yield</p>
                            </div>
                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <p className="text-[9px] font-bold text-slate-400 leading-relaxed italic">Max daily flux limit: 8.0 units. Extended bursts require Senior Command authorization.</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[3.5rem] border-none shadow-xl bg-emerald-500 p-12 text-white overflow-hidden relative group">
                        <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                        <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4">Target Projections</h4>
                        <div className="space-y-2">
                            <p className="text-4xl font-black italic tracking-tighter">₵1.2M</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Next Cycle Yield</p>
                        </div>
                    </Card>
                </aside>
            </section>

            {/* Overtime Request Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-3xl bg-white rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden">
                    <DialogHeader className="bg-slate-900 p-12">
                        <DialogTitle className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                            Log <span className="text-emerald-500">Burst</span>
                        </DialogTitle>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic font-bold">Operational Performance Overclock</p>
                    </DialogHeader>

                    <form className="p-12 space-y-8" onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Temporal Coord (Date)</label>
                                <Input type="date" className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900 px-6" value={formData.date} onChange={handleInputChange} name="date" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Target Operation (Project)</label>
                                <Input className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900 px-6" placeholder="BATTLE-STATION DELTA" value={formData.project} onChange={handleInputChange} name="project" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Start Mark (Time)</label>
                                <Input type="time" className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900 px-6" value={formData.start_time} onChange={handleInputChange} name="start_time" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">End Mark (Time)</label>
                                <Input type="time" className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900 px-6" value={formData.end_time} onChange={handleInputChange} name="end_time" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Strategic Justification (Reason)</label>
                            <textarea className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-medium min-h-[120px] focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 shadow-inner resize-none" placeholder="Detail the operational necessity..." value={formData.reason} onChange={handleInputChange} name="reason" />
                        </div>

                        {(formData.start_time && formData.end_time) && (
                            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic leading-none mb-2">Yield Projection</p>
                                    <p className="text-2xl font-black text-emerald-900 italic tracking-tighter">{formatCurrency(calculateAmount())}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic leading-none mb-2">Burst Delta</p>
                                    <p className="text-2xl font-black text-emerald-900 italic tracking-tighter">{calculateHours()}H Units</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 flex gap-4">
                            <Button type="button" onClick={() => setShowForm(false)} variant="ghost" className="flex-1 h-16 rounded-2xl font-black text-slate-400 uppercase text-[10px]">ABORT</Button>
                            <Button type="submit" className="flex-1 h-16 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl">
                                COMMIT LOG
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Record Dialog */}
            <Dialog open={!!selectedOvertime} onOpenChange={() => setSelectedOvertime(null)}>
                <DialogContent className="max-w-2xl bg-white rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden">
                    <DialogHeader className="bg-slate-900 p-12">
                        <DialogTitle className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
                            Burst <span className="text-emerald-500">Manifest</span>
                        </DialogTitle>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic font-bold">Historical Performance Telemetry</p>
                    </DialogHeader>
                    {selectedOvertime && (
                        <div className="p-12 space-y-10">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Temporal ID</p>
                                    <p className="text-xl font-black text-slate-900 italic">{new Date(selectedOvertime.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Operational Status</p>
                                    <Badge className="bg-emerald-500 text-white border-none uppercase italic text-[8px] font-black px-4 py-1.5 rounded-full">{selectedOvertime.status}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-8 p-8 bg-slate-50 rounded-[2.5rem]">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Delta</p>
                                    <p className="text-lg font-black text-slate-900 italic">{selectedOvertime.hours}H</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Yield</p>
                                    <p className="text-lg font-black text-emerald-500 italic">{formatCurrency(selectedOvertime.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Mark</p>
                                    <p className="text-lg font-black text-slate-900 italic">{selectedOvertime.rate}x</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Mission Parameter (Project)</p>
                                <p className="text-sm font-bold text-slate-900 uppercase italic bg-slate-50 p-6 rounded-2xl">{selectedOvertime.project}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Operational Justification</p>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-emerald-500 pl-6 py-2">{selectedOvertime.reason}</p>
                            </div>
                            <Button onClick={() => setSelectedOvertime(null)} className="w-full h-16 bg-slate-900 font-black uppercase tracking-widest rounded-2xl italic text-[10px]">CLOSE MANIFEST</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

const MetricCard = ({ icon: Icon, label, val, sub, color }) => (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-10 group hover:-translate-y-2 transition-all duration-500">
        <div className="flex flex-col items-center text-center space-y-6">
            <div className={`h-20 w-20 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12
                ${color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : ''}
                ${color === 'blue' ? 'bg-blue-50 text-blue-500' : ''}
                ${color === 'indigo' ? 'bg-indigo-50 text-indigo-500' : ''}`}>
                <Icon className="h-10 w-10" />
            </div>
            <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className={`text-3xl font-black tracking-tighter ${color === 'emerald' ? 'text-emerald-500' : 'text-slate-900'}`}>{val}</p>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-tight">{sub}</p>
            </div>
        </div>
    </Card>
);

export default OvertimePage;
