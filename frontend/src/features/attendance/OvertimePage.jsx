import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import {
    Plus, Eye, CheckCircle, XCircle, Clock, Calendar, DollarSign,
    Activity, ShieldCheck, TrendingUp, Filter, Loader2,
    ArrowUpRight, Target, Clock as ClockIcon, Timer, Coins, HardHat,
    Briefcase, MessageSquare, MoreVertical, Search
} from 'lucide-react';
import {
    useGetMyOvertimeRequestsQuery,
    useGetOvertimeRequestsQuery,
    useCreateOvertimeRequestMutation,
    useApproveOvertimeRequestMutation,
    useRejectOvertimeRequestMutation,
    useGetCurrentUserQuery
} from '../../store/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const OvertimePage = () => {
    const { data: user } = useGetCurrentUserQuery();
    const isManager = ['super_admin', 'company_admin', 'hr_manager', 'manager'].includes(user?.role);

    const [showForm, setShowForm] = useState(false);
    const [selectedOvertime, setSelectedOvertime] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const { data: myRecords = [], isLoading: loadingMy } = useGetMyOvertimeRequestsQuery(undefined, {
        skip: isManager && !user?.employee // If they are absolute admin with no employee, skip my_requests? No, backend handles it.
    });
    const { data: teamRecords = [], isLoading: loadingTeam } = useGetOvertimeRequestsQuery(undefined, {
        skip: !isManager
    });

    const [createRequest, { isLoading: isCreating }] = useCreateOvertimeRequestMutation();
    const [approveRecord, { isLoading: isApproving }] = useApproveOvertimeRequestMutation();
    const [rejectRecord, { isLoading: isRejecting }] = useRejectOvertimeRequestMutation();

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        reason: '',
        project: ''
    });

    const records = isManager ? teamRecords : myRecords;
    const isLoading = loadingMy || loadingTeam;

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
        return Math.max(0, diff).toFixed(1);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createRequest({
                ...formData,
                hours_requested: calculateHours()
            }).unwrap();
            toast.success("Overtime request submitted.");
            setShowForm(false);
            setFormData({ date: new Date().toISOString().split('T')[0], start_time: '', end_time: '', reason: '', project: '' });
        } catch (e) {
            toast.error(e?.data?.error || "Submission failed.");
        }
    };

    const handleApprove = async () => {
        try {
            await approveRecord(selectedOvertime.id).unwrap();
            toast.success("Request approved.");
            setSelectedOvertime(null);
        } catch (e) {
            toast.error("Approval failed.");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) {
            toast.error("Reason required for rejection.");
            return;
        }
        try {
            await rejectRecord({ id: selectedOvertime.id, reason: rejectionReason }).unwrap();
            toast.success("Request rejected.");
            setSelectedOvertime(null);
            setRejectionReason('');
        } catch (e) {
            toast.error("Process failed.");
        }
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
                                Personnel Overtime Management
                            </Badge>
                            <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                                Workplace <br />
                                <span className="text-emerald-500">Overtime</span>
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center xl:justify-start gap-8">
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
                                <Clock className="h-4 w-4 text-emerald-500 animate-pulse" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Status: Active Tracking</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full xl:w-auto">
                        <Button
                            onClick={() => setShowForm(true)}
                            className="h-24 px-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-[0.3em] text-sm rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-4"
                        >
                            <Plus className="h-6 w-6" /> REQUEST OVERTIME
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tactical Policies Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <MetricCard icon={Timer} label="Total Hours" val="11h" sub="Hours Accumulated" color="emerald" />
                        <MetricCard icon={ShieldCheck} label="Approved" val="2" sub="Verified Requests" color="blue" />
                        <MetricCard icon={Coins} label="Estimated Pay" val={formatCurrency(555000)} sub="Total Earnings" color="indigo" />
                    </div>

                    {/* Records Surface */}
                    <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-900 px-12 py-10">
                            <CardTitle className="text-xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-4">
                                <Activity className="h-6 w-6 text-emerald-500" /> Recent <span className="text-emerald-500">Overtime Logs</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="border-none">
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Date</TableHead>
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Duration</TableHead>
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Rate</TableHead>
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic text-right">Pay Estimate</TableHead>
                                            <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" /></TableCell></TableRow>
                                        ) : records.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-20 font-bold text-slate-400 italic">No cycles detected in this sector.</TableCell></TableRow>
                                        ) : records.map((record) => (
                                            <TableRow key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedOvertime(record)}>
                                                <TableCell className="px-12 py-8 font-black text-slate-900 italic">{new Date(record.date).toLocaleDateString()}</TableCell>
                                                <TableCell className="px-12 py-8 font-bold text-slate-500 text-xs italic">{record.start_time} - {record.end_time} ({record.hours_requested}H)</TableCell>
                                                <TableCell className="px-12 py-8">
                                                    <Badge className="bg-slate-900 text-white border-none text-[8px] font-black italic px-3 py-1 rounded-full">{record.overtime_rate || '1.1'}x</Badge>
                                                </TableCell>
                                                <TableCell className="px-12 py-8 text-right font-black text-emerald-500 italic">{formatCurrency(record.estimated_amount || 0)}</TableCell>
                                                <TableCell className="px-12 py-8 text-right">
                                                    <Badge className={cn(
                                                        "border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full italic",
                                                        record.status === 'approved' ? 'bg-emerald-500 text-white' :
                                                            record.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
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
                            <ShieldCheck className="h-6 w-6 text-emerald-400" /> Overtime <span className="text-emerald-500">Policies</span>
                        </h4>
                        <div className="space-y-6 relative z-10">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Standard Overtime</p>
                                <p className="text-lg font-black text-white italic">1.5x Pay</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Holiday / Weekend</p>
                                <p className="text-lg font-black text-emerald-400 italic">2.0x Pay</p>
                            </div>
                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <p className="text-[9px] font-bold text-slate-400 leading-relaxed italic">Max daily overtime limit: 8 hours. Extended hours require manager approval.</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[3.5rem] border-none shadow-xl bg-emerald-500 p-12 text-white overflow-hidden relative group">
                        <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                        <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4">Target Projections</h4>
                        <div className="space-y-2">
                            <p className="text-4xl font-black italic tracking-tighter">₵1.2M</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Next Period Estimate</p>
                        </div>
                    </Card>
                </aside>
            </section>

            {/* Overtime Request Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-3xl bg-white rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden">
                    <DialogHeader className="bg-slate-900 p-12">
                        <DialogTitle className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                            Request <span className="text-emerald-500">Overtime</span>
                        </DialogTitle>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic font-bold">Standard Performance Tracking</p>
                    </DialogHeader>

                    <form className="p-12 space-y-8" onSubmit={handleCreate}>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Date</label>
                                <Input type="date" className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900 px-6" value={formData.date} onChange={handleInputChange} name="date" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Project / Task</label>
                                <Input className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900 px-6" placeholder="Project Name" value={formData.project} onChange={handleInputChange} name="project" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Start Time</label>
                                <Input type="time" className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900 px-6" value={formData.start_time} onChange={handleInputChange} name="start_time" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">End Time</label>
                                <Input type="time" className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900 px-6" value={formData.end_time} onChange={handleInputChange} name="end_time" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Reason for Overtime</label>
                            <textarea className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-medium min-h-[120px] focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 shadow-inner resize-none" placeholder="Detail the operational necessity..." value={formData.reason} onChange={handleInputChange} name="reason" />
                        </div>

                        {(formData.start_time && formData.end_time) && (
                            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic leading-none mb-2">Estimated Earnings</p>
                                    <p className="text-2xl font-black text-emerald-900 italic tracking-tighter">{formatCurrency(calculateAmount())}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic leading-none mb-2">Total Hours</p>
                                    <p className="text-2xl font-black text-emerald-900 italic tracking-tighter">{calculateHours()} Hours</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 flex gap-4">
                            <Button type="button" onClick={() => setShowForm(false)} variant="ghost" className="flex-1 h-16 rounded-2xl font-black text-slate-400 uppercase text-[10px]">CANCEL</Button>
                            <Button type="submit" className="flex-1 h-16 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl">
                                SUBMIT REQUEST
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
                            Request <span className="text-emerald-500">Details</span>
                        </DialogTitle>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic font-bold">Historical Performance Record</p>
                    </DialogHeader>
                    {selectedOvertime && (
                        <div className="p-12 space-y-10">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Date</p>
                                    <p className="text-xl font-black text-slate-900 italic">{new Date(selectedOvertime.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Status</p>
                                    <Badge className="bg-emerald-500 text-white border-none uppercase italic text-[8px] font-black px-4 py-1.5 rounded-full">{selectedOvertime.status}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-8 p-8 bg-slate-50 rounded-[2.5rem]">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Hours</p>
                                    <p className="text-lg font-black text-slate-900 italic">{selectedOvertime.hours}H</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Earnings</p>
                                    <p className="text-lg font-black text-emerald-500 italic">{formatCurrency(selectedOvertime.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Rate</p>
                                    <p className="text-lg font-black text-slate-900 italic">{selectedOvertime.rate}x</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Project / Task</p>
                                <p className="text-sm font-bold text-slate-900 uppercase italic bg-slate-50 p-6 rounded-2xl">{selectedOvertime.project}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Justification</p>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-emerald-500 pl-6 py-2">{selectedOvertime.reason}</p>
                            </div>

                            {isManager && selectedOvertime.status === 'pending' && (
                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Rejection Reason</label>
                                        <textarea
                                            className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-medium min-h-[100px] focus:ring-2 focus:ring-rose-500 outline-none text-slate-600 shadow-inner resize-none"
                                            placeholder="Reason for rejection..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={handleReject}
                                            disabled={isRejecting}
                                            className="flex-1 h-16 bg-rose-500 hover:bg-rose-400 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl"
                                        >
                                            REJECT REQUEST
                                        </Button>
                                        <Button
                                            onClick={handleApprove}
                                            disabled={isApproving}
                                            className="flex-1 h-16 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl"
                                        >
                                            APPROVE REQUEST
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button onClick={() => setSelectedOvertime(null)} variant="ghost" className="w-full h-16 text-slate-400 font-black uppercase tracking-widest rounded-2xl italic text-[10px]">CLOSE MANIFEST</Button>
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
