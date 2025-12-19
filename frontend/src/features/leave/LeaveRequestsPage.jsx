import React, { useState } from 'react';
import {
    useGetLeaveRequestsQuery,
    useCreateLeaveRequestMutation,
    useGetLeaveBalancesQuery,
    useGetLeaveTypesQuery,
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Plus, Search, ChevronRight, Clock, Calendar,
    Sparkles, Home, ArrowUpRight, PlaneLanding, PieChart, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import LeaveBalances from './LeaveBalances';
import LeaveCalendar from './LeaveCalendar';

const LeaveRequestsPage = () => {
    const user = useSelector(selectCurrentUser);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [requestTab, setRequestTab] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: myRequests } = useGetLeaveRequestsQuery('/leave/requests/my_requests/');
    const { data: leaveTypes } = useGetLeaveTypesQuery();
    const [createRequest] = useCreateLeaveRequestMutation();

    const [formData, setFormData] = useState({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        document: null
    });

    const requestsToDisplay = (myRequests || []).filter(req => {
        const matchesSearch = req.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.status?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = requestTab === 'all' || req.status === requestTab;
        return matchesSearch && matchesTab;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = new FormData();
            body.append('leave_type', formData.leave_type);
            body.append('start_date', formData.start_date);
            body.append('end_date', formData.end_date);
            body.append('reason', formData.reason);
            if (formData.document) {
                body.append('document', formData.document);
            }

            await createRequest({ url: '/leave/requests/', body }).unwrap();
            toast.success('Leave request submitted!');
            setIsDialogOpen(false);
            setFormData({ leave_type: '', start_date: '', end_date: '', reason: '', document: null });
        } catch (error) {
            toast.error('Submission failed');
        }
    };

    const calculateDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const daysRequested = calculateDays(formData.start_date, formData.end_date);

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-primary-500/30 font-sans">
            {/* Animated Cosmic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-12 space-y-12">
                {/* Premium Header - NEXT-GEN STYLE */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[3rem] bg-slate-900/40 border border-white/5 overflow-hidden backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
                >
                    {/* Interior Glows */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

                    <div className="relative z-10 px-12 py-14">
                        <div className="flex items-center gap-4 mb-10 overflow-hidden">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl"
                            >
                                <Home className="h-3.5 w-3.5 text-primary-400" />
                                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Employee Hub</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-400">Leave Management</span>
                            </motion.div>
                        </div>

                        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,1)]" />
                                        <div className="h-2 w-2 rounded-full bg-primary-500/30 animate-ping" />
                                    </div>
                                    <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Integrated Attendance System</span>
                                </div>
                                <h1 className="text-6xl md:text-8xl font-black text-white tracking-[-0.04em] leading-[0.9] flex flex-col">
                                    <span>Manage</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 drop-shadow-sm">Absence</span>
                                </h1>
                                <p className="text-slate-400 font-bold text-xl max-w-2xl leading-relaxed opacity-80">
                                    Manage and track your leave requests, balances, and upcoming absences.
                                </p>
                            </div>

                            <div className="flex items-center gap-6 p-3 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                                            <Button className="bg-primary-600 hover:bg-primary-500 text-white font-black px-12 h-16 rounded-[1.5rem] shadow-[0_20px_40px_-5px_rgba(37,99,235,0.4)] transition-all flex items-center gap-4 border-none text-lg tracking-tight">
                                                <Plus className="h-6 w-6" />
                                                <span>Request Leave</span>
                                            </Button>
                                        </motion.div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-xl bg-slate-900 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] rounded-[3rem] p-0 overflow-hidden backdrop-blur-3xl">
                                        <div className="p-10 bg-slate-950/80 border-b border-white/5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/20 rounded-full blur-[80px]" />
                                            <DialogHeader className="relative z-10">
                                                <DialogTitle className="text-3xl font-black text-white tracking-tight">New Leave Request</DialogTitle>
                                                <p className="text-slate-500 text-sm font-bold mt-2 font-mono uppercase tracking-widest">Submit your application for review.</p>
                                            </DialogHeader>
                                        </div>
                                        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-slate-900/50">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Leave Category</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer appearance-none"
                                                        value={formData.leave_type}
                                                        onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                                                        required
                                                    >
                                                        <option value="" className="bg-slate-950">Select leave type...</option>
                                                        {leaveTypes?.map(type => (
                                                            <option key={type.id} value={type.id} className="bg-slate-950">{type.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Start Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-primary-500 transition-all [color-scheme:dark]"
                                                        value={formData.start_date}
                                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">End Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-primary-500 transition-all [color-scheme:dark]"
                                                        value={formData.end_date}
                                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {daysRequested > 0 && (
                                                <motion.div
                                                    initial={{ scale: 0.95, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="p-6 bg-primary-500/10 border border-primary-500/20 rounded-[2rem] flex items-center justify-between backdrop-blur-xl"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-primary-500/20 rounded-xl">
                                                            <Calendar className="h-5 w-5 text-primary-400" />
                                                        </div>
                                                        <span className="text-xs font-black text-primary-400 uppercase tracking-widest">Duration Identified</span>
                                                    </div>
                                                    <span className="px-6 py-2 bg-primary-600 text-white rounded-xl font-black shadow-lg">
                                                        {daysRequested} {daysRequested === 1 ? 'DAY' : 'DAYS'}
                                                    </span>
                                                </motion.div>
                                            )}

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Reason for Absence</label>
                                                <textarea
                                                    className="w-full min-h-[140px] p-6 bg-white/5 border border-white/10 rounded-[2rem] text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                                    placeholder="Provide details for your request..."
                                                    value={formData.reason}
                                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setIsDialogOpen(false)}
                                                    className="h-16 flex-1 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[11px] hover:bg-white/5"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="h-16 flex-[2] bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-600/40 border-none"
                                                >
                                                    Submit Request
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs - REDESIGNED */}
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="flex gap-2 p-2 bg-slate-900/60 rounded-[2rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: PieChart },
                            { id: 'requests', label: 'History', icon: Clock },
                            { id: 'calendar', label: 'Calendar', icon: Calendar }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-10 py-4 rounded-[1.5rem] flex items-center gap-3 transition-all text-xs font-black uppercase tracking-widest ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'requests' && (
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="w-full h-16 pl-14 pr-6 bg-slate-900/40 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500 transition-all backdrop-blur-xl"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-12"
                        >
                            <LeaveBalances />

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-8">
                                    <Card className="rounded-[3rem] border border-white/5 bg-slate-900/40 backdrop-blur-3xl overflow-hidden min-h-[500px] shadow-2xl">
                                        <div className="p-10 border-b border-white/5 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-black text-white tracking-tight">Usage Trend</h3>
                                                <p className="text-primary-500/80 text-[10px] font-black uppercase tracking-[0.3em] mt-2 font-mono">Monthly Leave Analytics</p>
                                            </div>
                                            <div className="flex gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                                                <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 h-10 hover:bg-white/5">Trend</Button>
                                                <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 h-10 bg-primary-600 text-white hover:bg-primary-500 border-none">Active</Button>
                                            </div>
                                        </div>
                                        <CardContent className="p-12">
                                            <div className="h-[300px] flex items-end justify-between gap-6">
                                                {[35, 60, 45, 95, 70, 85, 50, 40, 90, 65, 55, 75].map((val, i) => (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                                        <div className="w-full relative h-[250px] flex items-end">
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${val}%` }}
                                                                transition={{ delay: i * 0.05, duration: 1.2, ease: "easeOut" }}
                                                                className={`w-full rounded-2xl transition-all duration-500 relative ${val > 80 ? 'bg-gradient-to-t from-indigo-600 to-indigo-400' : 'bg-white/10 group-hover:bg-primary-500/40'
                                                                    }`}
                                                            >
                                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 bg-slate-900 border border-white/10 text-white text-[10px] font-black px-3 py-1.5 rounded-xl backdrop-blur-xl">
                                                                    {val}%
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-4">
                                    <Card className="rounded-[3rem] border border-white/5 bg-slate-950/80 backdrop-blur-3xl overflow-hidden h-full shadow-2xl relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px]" />

                                        <div className="p-10 relative z-10">
                                            <div className="flex items-center gap-4 mb-10">
                                                <div className="p-4 bg-primary-600/20 rounded-2xl border border-primary-500/20">
                                                    <Clock className="h-6 w-6 text-primary-400" />
                                                </div>
                                                <h3 className="text-2xl font-black text-white tracking-tight">Upcoming Leave</h3>
                                            </div>

                                            <div className="space-y-6">
                                                {myRequests?.filter(r => new Date(r.start_date) >= new Date()).slice(0, 4).map((req, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ x: 30, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/10 transition-all flex items-center justify-between group cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className="h-14 w-14 rounded-[1.2rem] bg-slate-900 border border-white/10 flex items-center justify-center text-primary-400 font-black text-xl italic group-hover:scale-110 transition-transform">
                                                                {new Date(req.start_date).getDate()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black uppercase italic tracking-tight text-white">{req.leave_type_name}</p>
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{new Date(req.start_date).toLocaleString('default', { month: 'short' })} • {req.days_requested} Days</p>
                                                            </div>
                                                        </div>
                                                        <div className={`h-3 w-3 rounded-full ${req.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'}`} />
                                                    </motion.div>
                                                ))}
                                                {(!myRequests || myRequests.filter(r => new Date(r.start_date) >= new Date()).length === 0) && (
                                                    <div className="py-24 flex flex-col items-center justify-center opacity-30">
                                                        <Sparkles className="h-16 w-16 mb-6 text-primary-400" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center leading-relaxed">System Synchronized<br />No Pending Absence</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-slate-950 to-transparent pt-20">
                                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Detailed Report</span>
                                                <ArrowUpRight className="h-5 w-5 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <Card className="rounded-[3rem] border border-white/5 bg-slate-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex gap-2 p-2 bg-slate-950/50 rounded-2xl border border-white/5">
                                        {['all', 'pending', 'approved', 'rejected'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setRequestTab(tab)}
                                                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${requestTab === tab ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    <Button variant="ghost" className="rounded-2xl h-14 px-8 border border-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] gap-3">
                                        <Sparkles className="h-4 w-4" />
                                        Export List
                                    </Button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-white/5">
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-left">Type / Dates</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-left">Duration</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-left">Status</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {requestsToDisplay.length > 0 ? (
                                                requestsToDisplay.map((req, idx) => (
                                                    <motion.tr
                                                        key={req.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                                                    >
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-5">
                                                                <div className="h-12 w-12 rounded-2xl bg-primary-600/20 border border-primary-500/20 flex items-center justify-center text-primary-400">
                                                                    <PlaneLanding className="h-6 w-6" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-white uppercase italic tracking-tight text-base">{req.leave_type_name}</p>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                                                                        {new Date(req.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })} — {new Date(req.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl font-black text-white italic">{req.days_requested}</span>
                                                                <span className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Days</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-2.5 w-2.5 rounded-full ${req.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                                                    req.status === 'rejected' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
                                                                        'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                                                    }`} />
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'text-emerald-400' :
                                                                    req.status === 'rejected' ? 'text-rose-400' : 'text-amber-400'
                                                                    }`}>{req.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <Button variant="ghost" size="sm" className="h-12 w-12 rounded-2xl border border-white/5 hover:bg-primary-600 hover:text-white transition-all text-slate-500">
                                                                <Info className="h-5 w-5" />
                                                            </Button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-10 py-32 text-center">
                                                        <div className="max-w-xs mx-auto opacity-30">
                                                            <Search className="h-16 w-16 mx-auto mb-6 text-primary-400" />
                                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">Records Updated<br />No matches found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'calendar' && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Card className="rounded-[3rem] border border-white/5 bg-slate-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl p-10">
                                <LeaveCalendar />
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LeaveRequestsPage;
