import React, { useState } from 'react';
import {
    useGetLeaveRequestsQuery,
    useApproveLeaveRequestMutation,
    useRejectLeaveRequestMutation,
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
    CheckCircle, XCircle, Clock, Calendar, Search,
    TrendingUp, FileText, Home, ChevronRight, Users, Sparkles,
    Shield, ArrowUpRight, Info, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const LeaveApprovalPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [showRejectionDialog, setShowRejectionDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const { data: leaveRequests = [], isLoading, refetch } = useGetLeaveRequestsQuery({
        status: selectedStatus,
        pending_approvals: true
    });

    const [approveRequest] = useApproveLeaveRequestMutation();
    const [rejectRequest] = useRejectLeaveRequestMutation();

    const filteredRequests = leaveRequests.filter(request => {
        const matchesSearch = request.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleApprove = async (requestId) => {
        try {
            await approveRequest(requestId).unwrap();
            toast.success('Protocol Authorization Successful');
            setShowApprovalDialog(false);
            setSelectedRequest(null);
            refetch();
        } catch (error) {
            toast.error('Authorization Failed');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Provide rejection protocol justification.');
            return;
        }

        try {
            await rejectRequest({
                id: selectedRequest.id,
                reason: rejectionReason
            }).unwrap();
            toast.success('Protocol Denial Executed');
            setShowRejectionDialog(false);
            setSelectedRequest(null);
            setRejectionReason('');
            refetch();
        } catch (error) {
            toast.error('Denial Failed');
        }
    };

    const getDaysRequested = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
    const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-primary-500/30">
            {/* Animated Cosmic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-12 space-y-12">
                {/* Tactical Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[3rem] bg-slate-900/40 border border-white/5 overflow-hidden backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

                    <div className="relative z-10 px-12 py-14 flex flex-col xl:flex-row items-start xl:items-end justify-between gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                                    <Home className="h-3.5 w-3.5 text-primary-400" />
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Control</span>
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-400">Leave Validation</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-primary-500" />
                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Authorization Protocol Engine</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-white tracking-[-0.04em] leading-[0.9]">
                                Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400">Approvals</span>
                            </h1>
                            <p className="text-slate-400 font-bold text-xl max-w-2xl leading-relaxed opacity-80">
                                Global command center for verifying, authorizing, and synchronizing organizational absence requests.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 p-4 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl">
                            <div className="px-8 py-4 bg-slate-950/50 rounded-2xl border border-white/5 flex items-center gap-4">
                                <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)] animate-pulse" />
                                <span className="text-2xl font-black text-white italic">{pendingCount}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending Protocols</span>
                            </div>
                            <div className="px-8 py-4 bg-slate-950/50 rounded-2xl border border-white/5 flex items-center gap-4">
                                <TrendingUp className="h-5 w-5 text-primary-400" />
                                <span className="text-2xl font-black text-white italic">2.4</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Response (Days)</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="flex gap-2 p-2 bg-slate-900/60 rounded-[2rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
                        {['pending', 'approved', 'rejected', 'all'].map(status => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`px-10 py-4 rounded-[1.5rem] flex items-center gap-3 transition-all text-xs font-black uppercase tracking-widest ${selectedStatus === status
                                        ? 'bg-primary-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]'
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {status === 'pending' && <Clock className="h-4 w-4" />}
                                {status === 'approved' && <CheckCircle className="h-4 w-4" />}
                                {status === 'rejected' && <XCircle className="h-4 w-4" />}
                                {status === 'all' && <Users className="h-4 w-4" />}
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify personnel lookup..."
                            className="w-full h-16 pl-14 pr-6 bg-slate-900/40 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500 transition-all backdrop-blur-xl"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Request List */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 flex flex-col items-center gap-6">
                            <div className="h-16 w-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-500">Synchronizing Data Matrix...</p>
                        </motion.div>
                    ) : filteredRequests.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-24 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 text-center shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px]" />
                            <FileText className="h-20 w-20 mx-auto mb-8 text-slate-700 opacity-40" />
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-4">Registry Optimized</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No tactical requests currently await validation.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {filteredRequests.map((request, idx) => (
                                <motion.div
                                    key={request.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="rounded-[3rem] border border-white/5 bg-slate-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl hover:border-white/10 transition-all group">
                                        <div className="p-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10">
                                            <div className="flex items-center gap-8 flex-1">
                                                <div className="relative">
                                                    <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-primary-600 to-indigo-600 p-[2px] shadow-2xl group-hover:rotate-6 transition-transform">
                                                        <div className="h-full w-full rounded-[1.9rem] bg-slate-950 flex items-center justify-center overflow-hidden">
                                                            <span className="text-3xl font-black text-white italic tracking-tighter">
                                                                {request.employee_name ? request.employee_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-xl flex items-center justify-center border-4 border-slate-900 ${request.status === 'approved' ? 'bg-emerald-500' : request.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                                                        }`}>
                                                        {request.status === 'approved' ? <CheckCircle className="h-4 w-4 text-white" /> : request.status === 'rejected' ? <XCircle className="h-4 w-4 text-white" /> : <Clock className="h-4 w-4 text-white" />}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-primary-400 transition-colors">
                                                            {request.employee_name}
                                                        </h3>
                                                        <Badge className="bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl">
                                                            {request.leave_type_name}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-6">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Calendar className="h-4 w-4 text-primary-400" />
                                                            <span className="text-xs font-bold font-mono tracking-tight text-slate-400">
                                                                {new Date(request.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })} — {new Date(request.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Clock className="h-4 w-4 text-primary-400" />
                                                            <span className="text-xs font-black uppercase tracking-widest italic text-white">{getDaysRequested(request.start_date, request.end_date)} Days Requested</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Sparkles className="h-4 w-4 text-primary-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Protocol Registry: {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'INITIALIZED'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-6 w-full xl:w-auto">
                                                {request.status === 'pending' ? (
                                                    <div className="flex gap-4">
                                                        <Button
                                                            onClick={() => { setSelectedRequest(request); setShowApprovalDialog(true); }}
                                                            className="h-16 flex-1 xl:px-10 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary-600/20 border-none transition-all"
                                                        >
                                                            Authorize Request
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => { setSelectedRequest(request); setShowRejectionDialog(true); }}
                                                            className="h-16 flex-1 xl:px-10 rounded-2xl border border-white/5 bg-white/5 text-rose-400 font-black uppercase tracking-widest text-[11px] hover:bg-rose-500/10 hover:border-rose-500/50 transition-all"
                                                        >
                                                            Deny Protocol
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                        <Info className="h-5 w-5 text-slate-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Validation Status: </span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${request.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'
                                                            }`}>{request.status}</span>
                                                    </div>
                                                )}

                                                {request.reason && (
                                                    <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <MessageSquare className="h-3 w-3 text-primary-500" />
                                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Employee Justification</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-medium italic">"{request.reason}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Authorization Dialog */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogContent className="max-w-xl bg-slate-900 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] rounded-[3rem] p-0 overflow-hidden backdrop-blur-3xl">
                    <div className="p-12 bg-slate-950/80 border-b border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/20 rounded-full blur-[80px]" />
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-3xl font-black text-white tracking-tight italic">Authorize Protocol</DialogTitle>
                            <p className="text-emerald-500/60 text-xs font-black uppercase tracking-[0.3em] mt-3 font-mono">Permission Level: EXECUTIVE</p>
                        </DialogHeader>
                    </div>
                    <div className="p-12 space-y-10 bg-slate-900/50">
                        {selectedRequest && (
                            <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-between">
                                <div className="space-y-4">
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{selectedRequest.employee_name}</h4>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 font-mono">
                                        <span>{selectedRequest.leave_type_name}</span>
                                        <div className="h-1 w-1 rounded-full bg-slate-700" />
                                        <span>{getDaysRequested(selectedRequest.start_date, selectedRequest.end_date)} DAYS</span>
                                    </div>
                                </div>
                                <div className="p-5 bg-primary-600/20 rounded-2xl border border-primary-500/20">
                                    <Shield className="h-6 w-6 text-primary-400" />
                                </div>
                            </div>
                        )}
                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-1" />
                            <p className="text-xs font-medium text-amber-200/70 leading-relaxed uppercase tracking-widest">
                                Confirming this protocol will immediately synchronize personnel availability across the corporate scheduler. This action is terminal and cannot be reversed from this interface.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={() => setShowApprovalDialog(false)} className="h-16 flex-1 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[11px] hover:bg-white/5">Abort Action</Button>
                            <Button onClick={() => selectedRequest && handleApprove(selectedRequest.id)} className="h-16 flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 border-none transition-all">Authorize Presence Removal</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Denial Dialog */}
            <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                <DialogContent className="max-w-xl bg-slate-900 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] rounded-[3rem] p-0 overflow-hidden backdrop-blur-3xl">
                    <div className="p-12 bg-slate-950/80 border-b border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/20 rounded-full blur-[80px]" />
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-3xl font-black text-white tracking-tight italic">Protocol Denial</DialogTitle>
                            <p className="text-rose-500/60 text-xs font-black uppercase tracking-[0.3em] mt-3 font-mono">Required: Tactical Justification</p>
                        </DialogHeader>
                    </div>
                    <div className="p-12 space-y-10 bg-slate-900/50">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Official Justification</label>
                            <textarea
                                className="w-full min-h-[160px] p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-sm font-bold text-white placeholder:text-slate-700 focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Identify structural reasons for protocol denial..."
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={() => { setShowRejectionDialog(false); setRejectionReason(''); }} className="h-16 flex-1 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[11px] hover:bg-white/5">Abort</Button>
                            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()} className="h-16 flex-[2] bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-500/20 border-none transition-all disabled:opacity-50">Execute Denial Protocol</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LeaveApprovalPage;
