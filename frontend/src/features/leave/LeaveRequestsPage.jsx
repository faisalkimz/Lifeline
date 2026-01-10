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
    FileText, Home, ArrowRight, PlaneLanding, BarChart3, Info
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
        <div className="space-y-6 pb-12">
            {/* Clean Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                            Manage and track your leave requests, balances, and upcoming absences.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                                <Plus className="h-4 w-4 mr-2" />
                                Request Leave
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl bg-white border border-gray-200 rounded-xl p-0 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-gray-900">New Leave Request</DialogTitle>
                                    <p className="text-gray-600 text-sm mt-1">Submit your application for review.</p>
                                </DialogHeader>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Leave Type</label>
                                    <select
                                        className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={formData.start_date}
                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={formData.end_date}
                                            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {daysRequested > 0 && (
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">Duration</span>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-semibold">
                                            {daysRequested} {daysRequested === 1 ? 'Day' : 'Days'}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Reason</label>
                                    <textarea
                                        className="w-full min-h-[100px] p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
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
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                        { id: 'requests', label: 'History', icon: Clock },
                        { id: 'calendar', label: 'Calendar', icon: Calendar }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all text-sm font-medium ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'requests' && (
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        <LeaveBalances />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Card className="border border-gray-200">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Usage Trend</h3>
                                            <p className="text-sm text-gray-600 mt-1">Monthly leave analytics</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="text-xs">Trend</Button>
                                            <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700">Active</Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="h-[260px] flex items-end justify-between gap-2">
                                            {[35, 60, 45, 95, 70, 85, 50, 40, 90, 65, 55, 75].map((val, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                    <div className="w-full relative h-[220px] flex items-end">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${val}%` }}
                                                            transition={{ delay: i * 0.04, duration: 0.9, ease: "easeOut" }}
                                                            className={`w-full rounded-t-md transition-all duration-300 relative ${val > 80 ? 'bg-blue-600' : 'bg-blue-200 group-hover:bg-blue-300'
                                                                }`}
                                                        >
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                                {val}%
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                    <span className="text-xs text-gray-600">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="lg:col-span-1">
                                <Card className="border border-gray-200 h-full">
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Clock className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">Upcoming Leave</h3>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        {myRequests?.filter(r => new Date(r.start_date) >= new Date()).slice(0, 4).map((req, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                        {new Date(req.start_date).getDate()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{req.leave_type_name}</p>
                                                        <p className="text-xs text-gray-600">{new Date(req.start_date).toLocaleString('default', { month: 'short' })} • {req.days_requested} Days</p>
                                                    </div>
                                                </div>
                                                <div className={`h-2 w-2 rounded-full ${req.status === 'approved' ? 'bg-green-500' : 'bg-orange-500'
                                                    }`} />
                                            </div>
                                        ))}
                                        {(!myRequests || myRequests.filter(r => new Date(r.start_date) >= new Date()).length === 0) && (
                                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                                <FileText className="h-12 w-12 mb-3 text-gray-400" />
                                                <p className="text-sm text-gray-500">No upcoming leave</p>
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border border-gray-200">
                            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex gap-2 p-1 bg-gray-50 rounded-lg">
                                    {['all', 'pending', 'approved', 'rejected'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setRequestTab(tab)}
                                            className={`px-3 py-2 rounded-md text-xs font-medium uppercase transition-all ${requestTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <Button variant="ghost" size="sm" className="border border-gray-200">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Export List
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-700 text-left">Type / Dates</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-700 text-left">Duration</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-700 text-left">Status</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {requestsToDisplay.length > 0 ? (
                                            requestsToDisplay.map((req, idx) => (
                                                <tr
                                                    key={req.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                                <Calendar className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{req.leave_type_name}</p>
                                                                <p className="text-xs text-gray-600">
                                                                    {new Date(req.start_date).toLocaleDateString()} — {new Date(req.end_date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-gray-900">{req.days_requested}</span>
                                                            <span className="text-gray-600 text-xs">Days</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                    'bg-orange-100 text-orange-800'
                                                            }`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="sm" className="border border-gray-200">
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-20 text-center">
                                                    <div className="max-w-xs mx-auto">
                                                        <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                        <p className="text-sm text-gray-500">No matches found</p>
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border border-gray-200 p-6">
                            <LeaveCalendar />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeaveRequestsPage;
