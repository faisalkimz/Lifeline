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
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Clean Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Home className="h-4 w-4" />
                            <ChevronRight className="h-4 w-4" />
                            <span>Leave Management</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Leave Requests
                        </h1>
                        <p className="text-gray-600">
                            Apply for time off and view your leave history.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6 shadow-md shadow-primary-200">
                                <Plus className="h-4 w-4 mr-2" />
                                Request Leave
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl bg-white border border-gray-100 rounded-xl p-0 overflow-hidden shadow-2xl">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-gray-900">New Leave Request</DialogTitle>
                                    <p className="text-gray-500 text-sm mt-1">Submit your application for review.</p>
                                </DialogHeader>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Leave Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-10 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none cursor-pointer hover:border-gray-300 transition-all"
                                            value={formData.leave_type}
                                            onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                                            required
                                        >
                                            <option value="">Select leave type...</option>
                                            {leaveTypes?.map(type => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                                        <Input
                                            type="date"
                                            className="bg-white"
                                            value={formData.start_date}
                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">End Date</label>
                                        <Input
                                            type="date"
                                            className="bg-white"
                                            value={formData.end_date}
                                            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {daysRequested > 0 && (
                                    <div className="p-3 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary-600" />
                                            <span className="text-sm font-medium text-primary-900">Duration</span>
                                        </div>
                                        <span className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm font-bold shadow-sm">
                                            {daysRequested} {daysRequested === 1 ? 'Day' : 'Days'}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Reason</label>
                                    <textarea
                                        className="w-full min-h-[100px] p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none hover:border-gray-300"
                                        placeholder="Please provide a reason for your leave request..."
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="pt-4 flex gap-3 border-t border-gray-100 mt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="flex-1 text-gray-600 hover:text-gray-900 font-medium"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md shadow-primary-200"
                                    >
                                        Submit Request
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-1 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                        { id: 'requests', label: 'History', icon: Clock },
                        { id: 'calendar', label: 'Calendar', icon: Calendar }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${activeTab === tab.id
                                ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'requests' && (
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search records..."
                            className="bg-white h-10 pl-10 border-gray-200 focus:border-primary-500 focus:ring-primary-500/20"
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <LeaveBalances />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Card className="border border-gray-200 shadow-sm h-full">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Leave Trend</h3>
                                            <p className="text-sm text-gray-500 mt-1">Monthly usage analytics</p>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="h-[260px] flex items-end justify-between gap-3">
                                            {[35, 60, 45, 95, 70, 85, 50, 40, 90, 65, 55, 75].map((val, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                    <div className="w-full relative h-[220px] flex items-end bg-gray-50 rounded-lg overflow-hidden">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${val}%` }}
                                                            transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
                                                            className={`w-full rounded-t-sm transition-all duration-300 relative ${val > 80 ? 'bg-primary-500' : 'bg-primary-300 group-hover:bg-primary-400'
                                                                }`}
                                                        >
                                                        </motion.div>
                                                    </div>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="lg:col-span-1">
                                <Card className="border border-gray-200 shadow-sm h-full">
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary-50 rounded-lg">
                                                <Clock className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">Upcoming Leave</h3>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        {myRequests?.filter(r => new Date(r.start_date) >= new Date()).slice(0, 4).map((req, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-white border border-gray-100 rounded-xl hover:border-primary-200 hover:shadow-sm transition-all flex items-center justify-between group cursor-default"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-gray-900 font-bold border border-gray-100 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-100 transition-colors">
                                                        <span className="text-xs uppercase text-gray-500 group-hover:text-primary-500">{new Date(req.start_date).toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-lg leading-none">{new Date(req.start_date).getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{req.leave_type_name}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{req.days_requested} Days</p>
                                                    </div>
                                                </div>
                                                <div className={`h-2.5 w-2.5 rounded-full ${req.status === 'approved' ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-amber-400 shadow-sm shadow-amber-200'
                                                    }`} />
                                            </div>
                                        ))}
                                        {(!myRequests || myRequests.filter(r => new Date(r.start_date) >= new Date()).length === 0) && (
                                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                    <FileText className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">No upcoming leave scheduled.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'requests' && (
                    <motion.div
                        key="requests"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border border-gray-200 shadow-sm">
                            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100">
                                    {['all', 'pending', 'approved', 'rejected'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setRequestTab(tab)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-all ${requestTab === tab ? 'bg-white text-primary-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 text-gray-700">
                                    <FileText className="h-3.5 w-3.5 mr-2" />
                                    Export
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-left uppercase tracking-wider">Type / Dates</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-left uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-left uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-right uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {requestsToDisplay.length > 0 ? (
                                            requestsToDisplay.map((req, idx) => (
                                                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                                                <Calendar className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">{req.leave_type_name}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {new Date(req.start_date).toLocaleDateString()} — {new Date(req.end_date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-semibold text-gray-700">{req.days_requested} Days</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${req.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                            req.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                                'bg-amber-50 text-amber-700 border border-amber-100'
                                                            }`}>
                                                            {req.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 text-gray-500">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-24 text-center">
                                                    <div className="max-w-xs mx-auto flex flex-col items-center">
                                                        <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                            <Search className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-900 font-medium">No results found</p>
                                                        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border border-gray-200 p-6 shadow-sm">
                            <LeaveCalendar />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeaveRequestsPage;
