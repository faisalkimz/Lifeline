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
        <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-200 font-sans">
            <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-12 space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm"
                >
                    <div className="relative z-10 px-8 py-10">
                        <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-gray-200">
                                <Home className="h-4 w-4 text-emerald-600" />
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-700">Employee Hub</span>
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Leave Management</span>
                            </div>
                        </div>

                        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-600" />
                                        <div className="h-2 w-2 rounded-full bg-emerald-600/30 animate-ping" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Integrated Attendance System</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
                                    Manage <span className="text-emerald-600">Absence</span>
                                </h1>
                                <p className="text-gray-700 font-medium text-lg max-w-2xl leading-relaxed">
                                    Manage and track your leave requests, balances, and upcoming absences.
                                </p>
                            </div>

                            <div className="flex items-center gap-6 p-1 rounded-lg">
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 h-14 rounded-xl shadow-md transition-all flex items-center gap-3 border-none text-base">
                                                <Plus className="h-5 w-5" />
                                                <span>Request Leave</span>
                                            </Button>
                                        </motion.div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-xl bg-white border border-gray-200 rounded-2xl p-0 overflow-hidden shadow-lg">
                                        <div className="p-6 border-b border-gray-200">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black text-gray-900">New Leave Request</DialogTitle>
                                                <p className="text-gray-700 text-sm mt-2">Submit your application for review.</p>
                                            </DialogHeader>
                                        </div>
                                        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Leave Category</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer appearance-none"
                                                        value={formData.leave_type}
                                                        onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                                                        required
                                                    >
                                                        <option value="">Select leave type...</option>
                                                        {leaveTypes?.map(type => (
                                                            <option key={type.id} value={type.id}>{type.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 ml-1">Start Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all"
                                                        value={formData.start_date}
                                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 ml-1">End Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all"
                                                        value={formData.end_date}
                                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {daysRequested > 0 && (
                                                <motion.div
                                                    initial={{ scale: 0.98, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-emerald-50 rounded-lg">
                                                            <Calendar className="h-5 w-5 text-emerald-600" />
                                                        </div>
                                                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Duration Identified</span>
                                                    </div>
                                                    <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-black">
                                                        {daysRequested} {daysRequested === 1 ? 'DAY' : 'DAYS'}
                                                    </span>
                                                </motion.div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 ml-1">Reason for Absence</label>
                                                <textarea
                                                    className="w-full min-h-[120px] p-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                                                    placeholder="Provide details for your request..."
                                                    value={formData.reason}
                                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setIsDialogOpen(false)}
                                                    className="h-12 flex-1 rounded-xl text-gray-700 font-black uppercase tracking-widest text-[11px] hover:bg-emerald-50"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="h-12 flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md border-none"
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

                {/* Navigation Tabs */}
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="flex gap-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: PieChart },
                            { id: 'requests', label: 'History', icon: Clock },
                            { id: 'calendar', label: 'Calendar', icon: Calendar }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-bold uppercase tracking-wider ${activeTab === tab.id
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'animate-pulse text-white' : 'text-gray-600'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'requests' && (
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all"
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
                                    <Card className="rounded-2xl border border-gray-200 bg-white overflow-hidden min-h-[420px] shadow-sm">
                                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Usage Trend</h3>
                                                <p className="text-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] mt-2 font-mono">Monthly Leave Analytics</p>
                                            </div>
                                            <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                                                <Button variant="ghost" size="sm" className="rounded-md font-black text-[11px] uppercase tracking-widest px-4 h-9 hover:bg-emerald-50">Trend</Button>
                                                <Button variant="ghost" size="sm" className="rounded-md font-black text-[11px] uppercase tracking-widest px-4 h-9 bg-emerald-600 text-white border-none">Active</Button>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="h-[260px] flex items-end justify-between gap-4">
                                                {[35, 60, 45, 95, 70, 85, 50, 40, 90, 65, 55, 75].map((val, i) => (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                                        <div className="w-full relative h-[220px] flex items-end">
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${val}%` }}
                                                                transition={{ delay: i * 0.04, duration: 0.9, ease: "easeOut" }}
                                                                    className={`w-full rounded-lg transition-all duration-500 relative ${val > 80 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-emerald-100 group-hover:bg-emerald-200'
                                                                    }`}
                                                            >
                                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 bg-white border border-gray-200 text-gray-900 text-[10px] font-black px-3 py-1 rounded-md shadow">
                                                                    {val}%
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-4">
                                    <Card className="rounded-2xl border border-gray-200 bg-white overflow-hidden h-full shadow-sm">
                                        <div className="p-6">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                                    <Clock className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Upcoming Leave</h3>
                                            </div>

                                            <div className="space-y-4">
                                                {myRequests?.filter(r => new Date(r.start_date) >= new Date()).slice(0, 4).map((req, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ x: 12, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: idx * 0.06 }}
                                                        className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 transition-all flex items-center justify-between group cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                                <div className="h-12 w-12 rounded-lg bg-emerald-50 border border-gray-200 flex items-center justify-center text-emerald-600 font-black text-lg italic group-hover:scale-105 transition-transform">
                                                                {new Date(req.start_date).getDate()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black uppercase italic tracking-tight text-gray-900">{req.leave_type_name}</p>
                                                                <p className="text-[10px] font-medium text-gray-700 uppercase tracking-[0.2em] mt-1">{new Date(req.start_date).toLocaleString('default', { month: 'short' })} • {req.days_requested} Days</p>
                                                            </div>
                                                        </div>
                                                        <div className={`h-3 w-3 rounded-full ${req.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse'}`} />
                                                    </motion.div>
                                                ))}
                                                {(!myRequests || myRequests.filter(r => new Date(r.start_date) >= new Date()).length === 0) && (
                                                    <div className="py-12 flex flex-col items-center justify-center opacity-60">
                                                        <Sparkles className="h-12 w-12 mb-4 text-emerald-600" />
                                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-center leading-relaxed">System Synchronized<br />No Pending Absence</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full p-4 border-t border-gray-200 bg-white">
                                            <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:bg-emerald-50 transition-all cursor-pointer">
                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Detailed Report</span>
                                                <ArrowUpRight className="h-4 w-4 text-emerald-600 transition-transform" />
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <Card className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200">
                                        {['all', 'pending', 'approved', 'rejected'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setRequestTab(tab)}
                                                className={`px-3 py-2 rounded-md text-[11px] font-black uppercase tracking-wide transition-all ${requestTab === tab ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    <Button variant="ghost" className="rounded-md h-10 px-4 border border-gray-200 text-gray-700 font-black uppercase tracking-widest text-[11px] gap-2">
                                        <Sparkles className="h-4 w-4 text-emerald-600" />
                                        Export List
                                    </Button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-white">
                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.1em] text-gray-700 text-left">Type / Dates</th>
                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.1em] text-gray-700 text-left">Duration</th>
                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.1em] text-gray-700 text-left">Status</th>
                                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.1em] text-gray-700 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {requestsToDisplay.length > 0 ? (
                                                requestsToDisplay.map((req, idx) => (
                                                    <motion.tr
                                                        key={req.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: idx * 0.03 }}
                                                        className="hover:bg-emerald-50 transition-colors group cursor-pointer"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-gray-200 flex items-center justify-center text-emerald-600">
                                                                    <PlaneLanding className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-gray-900 uppercase italic tracking-tight text-base">{req.leave_type_name}</p>
                                                                    <p className="text-[11px] font-medium text-gray-700 uppercase tracking-[0.1em] mt-1">
                                                                        {new Date(req.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })} — {new Date(req.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg font-black text-gray-900">{req.days_requested}</span>
                                                                <span className="text-gray-700 uppercase text-[10px] font-black tracking-widest">Days</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-2.5 w-2.5 rounded-full ${req.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)]' :
                                                                    req.status === 'rejected' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.15)]' :
                                                                        'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                                                                    }`} />
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'text-emerald-600' :
                                                                    req.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'
                                                                    }`}>{req.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Button variant="ghost" size="sm" className="h-9 w-9 rounded-md border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 transition-all text-gray-700">
                                                                <Info className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-20 text-center">
                                                        <div className="max-w-xs mx-auto opacity-50">
                                                            <Search className="h-12 w-12 mx-auto mb-6 text-emerald-600" />
                                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed">Records Updated<br />No matches found</p>
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
                            <Card className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm p-6">
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
