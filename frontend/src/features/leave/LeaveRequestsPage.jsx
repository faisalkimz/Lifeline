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
import { Input } from '../../components/ui/Input';
import {
    Plus, Search, ChevronRight, Clock, Calendar,
    FileText, Home, ArrowRight, PlaneLanding, BarChart3, Info, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import LeaveBalances from './LeaveBalances';
import LeaveCalendar from './LeaveCalendar';
import CreateLeaveTypeModal from './CreateLeaveTypeModal';
import { useDeleteLeaveTypeMutation } from '../../store/api';
import { Settings2, Trash2, Edit2 } from 'lucide-react';

const LeaveRequestsPage = () => {
    const user = useSelector(selectCurrentUser);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [selectedType, setSelectedType] = useState(null);

    const isCompanyAdmin = user?.role === 'company_admin' || user?.role === 'admin' || user?.role === 'hr_manager';

    // Map Workpay statuses to system statuses
    const statusMap = {
        'submitted': 'pending',
        'approved': 'approved',
        'disapproved': 'rejected',
        'cancelled': 'cancelled',
        'all': 'all'
    };

    const { data: myRequests = [] } = useGetLeaveRequestsQuery('/leave/requests/my_requests/');
    const { data: allRequests = [] } = useGetLeaveRequestsQuery({
        status: statusMap[activeTab] === 'all' ? undefined : statusMap[activeTab]
    });

    const { data: leaveTypes } = useGetLeaveTypesQuery();
    const [createRequest] = useCreateLeaveRequestMutation();

    const [formData, setFormData] = useState({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        reliever: '',
        document: null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = new FormData();
            body.append('leave_type', formData.leave_type);
            body.append('start_date', formData.start_date);
            body.append('end_date', formData.end_date);
            body.append('reason', formData.reason);
            if (formData.reliever) body.append('reliever', formData.reliever);
            if (formData.document) body.append('document', formData.document);

            await createRequest({ url: '/leave/requests/', body }).unwrap();
            toast.success('Leave request submitted!');
            setIsDialogOpen(false);
            setFormData({ leave_type: '', start_date: '', end_date: '', reason: '', reliever: '', document: null });
        } catch (error) {
            toast.error('Submission failed');
        }
    };

    const displayedRequests = allRequests.filter(req =>
        req.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-in bg-[#F9FAFB] min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leave requests</h1>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Time & Absence Management</p>
                </div>
                <div className="flex gap-3">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 rounded-xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                                <Plus className="h-4 w-4 mr-2" />
                                Apply For Leave
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl bg-white border-0 rounded-3xl p-0 overflow-hidden shadow-2xl">
                            <div className="bg-slate-900 px-8 py-6 flex items-center gap-4 border-b border-slate-800">
                                <div className="h-12 w-12 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 shadow-sm">
                                    <PlaneLanding className="h-6 w-6 text-primary-500" />
                                </div>
                                <div className="text-white">
                                    <DialogTitle className="text-2xl font-black tracking-tight tracking-tight">Plan your Time Off</DialogTitle>
                                    <p className="text-slate-400 mt-1 font-bold text-sm uppercase tracking-widest">Absence submission</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type of Leave</label>
                                    <select
                                        className="w-full h-14 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none appearance-none cursor-pointer transition-all"
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

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">From</label>
                                        <Input
                                            type="date"
                                            className="h-14 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold"
                                            value={formData.start_date}
                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">To</label>
                                        <Input
                                            type="date"
                                            className="h-14 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold"
                                            value={formData.end_date}
                                            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reliever (Optional)</label>
                                    <Input
                                        placeholder="Who will cover your duties?"
                                        className="h-14 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold"
                                        value={formData.reliever}
                                        onChange={e => setFormData({ ...formData, reliever: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                                    <textarea
                                        className="w-full min-h-[120px] p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all resize-none"
                                        placeholder="Why are you taking leave?"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="pt-4 flex gap-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="h-14 px-8 text-slate-400 hover:text-slate-900 font-black rounded-2xl uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black h-14 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                                    >
                                        Submit Request
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                    {isCompanyAdmin && (
                        <Button
                            variant="outline"
                            onClick={() => { setSelectedType(null); setShowTypeModal(true); }}
                            className="bg-white border-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-50 shadow-sm transition-all"
                        >
                            <Settings2 className="h-4 w-4 mr-2 text-slate-400" />
                            Policy Setup
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit overflow-x-auto scrollbar-hide">
                {['submitted', 'approved', 'active', 'disapproved', 'attended', 'cancelled', 'all'].map(status => (
                    <button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === status
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        {status} {status === 'submitted' && <span className="ml-1 opacity-50">({allRequests.filter(r => r.status === 'pending').length})</span>}
                    </button>
                ))}
            </div>

            {/* Leave Balances Horizontal Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Personal Entitlements</h2>
                </div>
                <LeaveBalances />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Requests Table */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Request Log</h2>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search entries..."
                                    className="bg-slate-50/50 h-11 pl-12 border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70">
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Employee</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Policy</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Dates</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Time requested</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Reliever</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedRequests.length > 0 ? (
                                        displayedRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-6 py-5 border-b border-slate-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-900 text-xs uppercase border border-slate-200">
                                                            {req.employee_name?.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <span className="font-bold text-slate-900 text-sm whitespace-nowrap">{req.employee_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 border-b border-slate-50">
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-tight">{req.leave_type_name}</span>
                                                </td>
                                                <td className="px-6 py-5 border-b border-slate-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-700">{new Date(req.start_date).toLocaleDateString()}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">to {new Date(req.end_date).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 border-b border-slate-50">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3.5 w-3.5 text-primary-500" />
                                                        <span className="text-sm font-black text-slate-900">{parseFloat(req.days_requested).toFixed(0)} Days</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 border-b border-slate-50">
                                                    <span className="text-sm font-bold text-slate-500 italic">{req.reliever_name || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-5 border-b border-slate-50">
                                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-500/5' :
                                                        req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm shadow-rose-500/5' :
                                                            'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-500/5'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-32 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-40">
                                                    <Search className="h-12 w-12 text-slate-300" />
                                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">There is no available data.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Styled Footer */}
                        <div className="p-6 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Items per page:</span>
                                <select className="bg-white border-slate-200 rounded-lg text-xs font-black p-1 outline-none focus:border-primary-500">
                                    <option>10</option>
                                    <option>20</option>
                                    <option>50</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Page 1 of 1</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled className="h-9 w-9 p-0 rounded-xl bg-white border-slate-200 text-slate-400">
                                        <ChevronRight className="h-4 w-4 rotate-180" />
                                    </Button>
                                    <Button variant="outline" size="sm" disabled className="h-9 w-9 p-0 rounded-xl bg-white border-slate-200 text-slate-400">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* My Leave Requests Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">My Leave Requests</h3>
                            <div className="h-px flex-1 bg-slate-100 mx-6" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myRequests.slice(0, 3).map(req => (
                                <motion.div key={req.id} whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-primary-50 rounded-2xl">
                                            <Calendar className="h-5 w-5 text-primary-600" />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${req.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'
                                            }`}>{req.status}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-lg mb-1">{req.leave_type_name}</h4>
                                    <p className="text-xs font-black text-slate-400 mb-4">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</p>
                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-sm font-black text-slate-900 italic">"{req.reason.substring(0, 20)}..."</span>
                                        <div className="flex items-center gap-1 text-primary-600 font-black">
                                            <span className="text-lg">{parseFloat(req.days_requested).toFixed(0)}</span>
                                            <span className="text-[10px] uppercase">Days</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Calendar & Employees on Leave */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl p-6 bg-white overflow-hidden relative">
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Other Employees on Leave</h3>
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">January 2026</h4>
                                    <div className="flex gap-2">
                                        <button className="h-8 w-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all font-black text-lg">&lt;</button>
                                        <button className="h-8 w-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all font-black text-lg">&gt;</button>
                                    </div>
                                </div>
                                <LeaveCalendar mini={true} />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl p-8 bg-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-all">
                            <Info className="h-40 w-40" />
                        </div>
                        <div className="relative space-y-6">
                            <h4 className="text-xl font-black tracking-tight leading-tight italic">Upcoming Public Holidays</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="h-10 w-10 bg-primary-500 text-white rounded-xl flex flex-col items-center justify-center font-black leading-none">
                                        <span className="text-[10px] uppercase">Jan</span>
                                        <span className="text-lg">26</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">NRM Liberation Day</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National Holiday</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 opacity-50">
                                    <div className="h-10 w-10 bg-slate-700 text-white rounded-xl flex flex-col items-center justify-center font-black leading-none">
                                        <span className="text-[10px] uppercase">Feb</span>
                                        <span className="text-lg">16</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Archbishop Janani Luwum Day</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National Holiday</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <CreateLeaveTypeModal
                isOpen={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                leaveType={selectedType}
            />
        </div>
    );
};

export default LeaveRequestsPage;
