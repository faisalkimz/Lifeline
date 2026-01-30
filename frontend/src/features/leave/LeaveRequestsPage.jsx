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

    const isCompanyAdmin = ['super_admin', 'company_admin', 'hr_manager'].includes(user?.role);

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
    const { data: balances } = useGetLeaveBalancesQuery();
    const [createRequest, { isLoading: isSubmitting }] = useCreateLeaveRequestMutation();

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

        if (isSubmitting) return;

        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Date logic checks
        if (end < start) {
            toast.error('End date cannot be before start date');
            return;
        }

        if (start < today) {
            // Optional: Allow backdating? If not, uncomment line below
            // toast.error('Cannot apply for leave in the past'); return;
        }

        // Check for overlapping requests
        const hasOverlap = myRequests.some(req => {
            if (['rejected', 'cancelled'].includes(req.status)) return false;
            const reqStart = new Date(req.start_date);
            const reqEnd = new Date(req.end_date);
            return (start <= reqEnd && end >= reqStart);
        });

        if (hasOverlap) {
            toast.error('You already have a leave request for this period');
            return;
        }

        // Check for sufficient balance
        if (balances) {
            const balance = balances.find(b => b.leave_type === parseInt(formData.leave_type));
            if (balance && parseFloat(balance.available_days) <= 0) {
                toast.error(`Insufficient leave balance. Available: ${parseFloat(balance.available_days).toFixed(1)} days.`);
                return;
            }
        }

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
            toast.error(error.data?.error || 'Submission failed');
        }
    };

    const displayedRequests = allRequests.filter(req =>
        req.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leave Requests</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and track organization-wide time off.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#88B072] hover:bg-[#7aa265] text-white font-semibold h-10 px-4 rounded text-xs uppercase tracking-wider">
                                <Plus className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden rounded-lg">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                                <DialogTitle className="text-xl font-semibold text-slate-800">Request Leave</DialogTitle>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Form Fields Column */}
                                    <div className="md:col-span-2 space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">
                                                Leave Policy <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                value={formData.leave_type}
                                                onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                                                required
                                            >
                                                <option value="">Search Policy</option>
                                                {leaveTypes?.map(type => (
                                                    <option key={type.id} value={type.id}>{type.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-3 py-1">
                                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 cursor-pointer">
                                                <span className="translate-x-1 inline-block h-4 w-4 rounded-full bg-white transition" />
                                            </div>
                                            <span className="text-sm text-slate-600 font-medium">Apply For A Half Day</span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">
                                                Start Date <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    className="h-11 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 font-normal pr-10"
                                                    value={formData.start_date}
                                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">
                                                Return Date <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    className="h-11 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 font-normal pr-10"
                                                    value={formData.end_date}
                                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Reliever</label>
                                            <select
                                                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                value={formData.reliever}
                                                onChange={e => setFormData({ ...formData, reliever: e.target.value })}
                                            >
                                                <option value="">Search Employees</option>
                                                {/* This would normally be populated with employees */}
                                            </select>
                                            <p className="text-xs text-slate-500">Choose who will relieve you when you are away</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Reason</label>
                                            <textarea
                                                className="w-full min-h-[100px] p-3 bg-white border border-slate-300 rounded-md text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                                                placeholder="Reason..."
                                                value={formData.reason}
                                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Sidebar Column (Balances) */}
                                    <div className="border-l border-slate-200 pl-6 hidden md:block space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500">Original Leave days</span>
                                            <p className="text-sm font-medium text-slate-700">0</p>
                                        </div>
                                        <div className="space-y-1 pb-4 border-b border-slate-100">
                                            <span className="text-xs text-slate-500">Leave days used</span>
                                            <p className="text-sm font-medium text-slate-700">0</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500">Remaining balance</span>
                                            <p className="text-sm font-medium text-slate-700">0</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="mt-8 flex justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="w-48 h-10 border border-green-600 text-green-600 hover:bg-green-50 font-medium rounded text-sm transition-colors uppercase"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-48 h-10 bg-[#88B072] hover:bg-[#7aa265] text-white font-medium rounded text-sm transition-colors uppercase disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                    {isCompanyAdmin && (
                        <Button
                            variant="outline"
                            onClick={() => { setSelectedType(null); setShowTypeModal(true); }}
                            className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-slate-200"
                        >
                            <Settings2 className="h-4 w-4 mr-2" />
                            Policy Setup
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 p-1 bg-white rounded border border-slate-200 w-fit overflow-x-auto">
                {['submitted', 'approved', 'active', 'disapproved', 'attended', 'cancelled', 'all'].map(status => (
                    <button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === status
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        {status} {status === 'submitted' && <span className="ml-1 opacity-50">({allRequests.filter(r => r.status === 'pending').length})</span>}
                    </button>
                ))}
            </div>

            {/* Leave Balances Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#88B072]" />
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time-off Entitlements</h2>
                </div>
                <LeaveBalances />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Requests Log */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Leave History</h2>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <Input
                                    placeholder="Search request log..."
                                    className="bg-slate-50/50 h-10 pl-11 border-slate-100 rounded text-xs focus:ring-0 focus:border-[#88B072]"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                .
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
                                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                                                            {req.employee_name?.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{req.employee_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{req.leave_type_name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-slate-600">{new Date(req.start_date).toLocaleDateString()}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">until {new Date(req.end_date).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3.5 w-3.5 text-[#88B072]" />
                                                        <span className="text-xs font-bold text-slate-700">{parseFloat(req.days_requested).toFixed(0)} d</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-slate-500 italic">{req.reliever_name || '--'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                        req.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-amber-50 text-amber-600'
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

                    {/* Sidebar: Requests Summary */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">My Recent Requests</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myRequests.slice(0, 3).map(req => (
                                <div key={req.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-8 w-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            <Calendar className="h-4 w-4 text-[#88B072]" />
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>{req.status}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1">{req.leave_type_name}</h4>
                                    <p className="text-[10px] text-slate-400 mb-4">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</p>
                                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 italic max-w-[120px] truncate">"{req.reason}"</span>
                                        <div className="flex items-center gap-1 text-[#88B072] font-bold">
                                            <span className="text-sm">{parseFloat(req.days_requested).toFixed(0)}</span>
                                            <span className="text-[9px] uppercase">Days</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Calendar & Holidays */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Absence Calendar</h3>
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-slate-800">January 2026</h4>
                                        <div className="flex gap-1">
                                            <button className="h-6 w-6 rounded border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all text-xs">←</button>
                                            <button className="h-6 w-6 rounded border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all text-xs">→</button>
                                        </div>
                                    </div>
                                    <LeaveCalendar mini={true} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl group">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-[#88B072]" />
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Public Holidays</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group-hover:border-[#88B072]/30 transition-colors">
                                    <div className="h-8 w-8 bg-[#88B072] text-white rounded flex flex-col items-center justify-center font-bold leading-none">
                                        <span className="text-[7px] uppercase">Jan</span>
                                        <span className="text-xs">26</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-slate-800">NRM Liberation Day</p>
                                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">National Holiday</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-100 opacity-60">
                                    <div className="h-8 w-8 bg-slate-300 text-white rounded flex flex-col items-center justify-center font-bold leading-none">
                                        <span className="text-[7px] uppercase">Feb</span>
                                        <span className="text-xs">16</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-slate-800">Janani Luwum Day</p>
                                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">National Holiday</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
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
