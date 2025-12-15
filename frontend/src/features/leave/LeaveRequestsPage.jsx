import React, { useState } from 'react';
import {
    useGetLeaveRequestsQuery,
    useCreateLeaveRequestMutation,
    useGetLeaveBalancesQuery,
    useGetLeaveTypesQuery,
    useApproveLeaveRequestMutation,
    useRejectLeaveRequestMutation,
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Plus, Search, ChevronLeft, ChevronRight, Filter, Download,
    FileText, CheckCircle, XCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';

const LeaveRequestsPage = () => {
    const user = useSelector(selectCurrentUser);
    const [activeTab, setActiveTab] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: myRequests, isLoading: loadingRequests } = useGetLeaveRequestsQuery('/leave/requests/my_requests/');
    const { data: pendingApprovals } = useGetLeaveRequestsQuery('/leave/requests/pending_approvals/');
    const { data: leaveBalances } = useGetLeaveBalancesQuery();
    const { data: leaveTypes } = useGetLeaveTypesQuery();
    const [createRequest] = useCreateLeaveRequestMutation();

    const [formData, setFormData] = useState({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        document: null
    });

    // Combine requests for 'all' view or filter based on tab
    const requestsToDisplay = activeTab === 'submitted' ? (myRequests?.filter(r => r.status === 'pending') || []) :
        activeTab === 'approved' ? (myRequests?.filter(r => r.status === 'approved') || []) :
            activeTab === 'disapproved' ? (myRequests?.filter(r => r.status === 'rejected') || []) :
                (myRequests || []);

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
            toast.success('Leave request submitted successfully!');
            setIsDialogOpen(false);
            setFormData({ leave_type: '', start_date: '', end_date: '', reason: '', document: null });
        } catch (error) {
            toast.error('Failed to submit leave request');
        }
    };

    return (
        <div className="space-y-8 pb-10 font-sans text-slate-900">
            {/* Header Section */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center text-xl font-bold text-slate-700">
                    {user?.company_name ? user.company_name.substring(0, 2).toUpperCase() : 'CP'}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{user?.company_name || 'Company Name'}</h1>
                    <p className="text-slate-500 font-medium">{user.first_name || user.last_name}</p>
                </div>
            </div>

            {/* Leave Requests Header & Tabs */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Leave requests</h2>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-primary-600 hover:bg-primary-700">
                                <Plus className="h-4 w-4" /> New Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Request Leave</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Leave Type</label>
                                        <select
                                            className="w-full border rounded-md p-2 bg-slate-50"
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
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full border rounded-md p-2 bg-slate-50"
                                            value={formData.start_date}
                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full border rounded-md p-2 bg-slate-50"
                                            value={formData.end_date}
                                            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Reason</label>
                                        <textarea
                                            className="w-full border rounded-md p-2 bg-slate-50"
                                            value={formData.reason}
                                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                            rows="3"
                                            placeholder="Reason for leave..."
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full">Submit Request</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-slate-200 overflow-x-auto">
                    {['submitted (0)', 'approved', 'active', 'disapproved', 'attended', 'cancelled', 'all'].map(tab => {
                        // Simple logic to clean tab name for state
                        const tabKey = tab.split(' ')[0];
                        const isActive = activeTab === tabKey;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tabKey)}
                                className={`pb-3 text-sm font-medium whitespace-nowrap capitalize transition-colors ${isActive
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Leave Balance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {leaveBalances?.length > 0 ? (
                    leaveBalances.map((balance, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                            <h3 className="font-bold text-slate-700 relative z-10">{balance.leave_type_name}</h3>
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-2xl font-bold text-slate-900">{Number(balance.remaining_days || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Leave balance</span>
                                    <span>{Number(balance.remaining_days || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                                    <span>Leave taken</span>
                                    <span>{balance.used_days}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Fallback Mock Data to match design if API is empty
                    <>
                        <BalanceCard title="Annual Leave" balance="21.00" taken="0" />
                        <BalanceCard title="Bereavement leave" balance="30.00" taken="0" />
                        <BalanceCard title="Sick Leave" balance="30.00" taken="0" />
                        <BalanceCard title="Paternity Leave" balance="5.00" taken="0" />
                    </>
                )}
            </div>

            {/* Table Section */}
            <Card className="border-none shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Policy</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Time requested</th>
                                <th className="px-6 py-4">Reliever</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {requestsToDisplay.length > 0 ? (
                                requestsToDisplay.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{user.first_name} {user.last_name}</td>
                                        <td className="px-6 py-4">{request.leave_type_name}</td>
                                        <td className="px-6 py-4">
                                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">{request.days_requested} Days</td>
                                        <td className="px-6 py-4 text-slate-400">-</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        There is no available data.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <span>Showing</span>
                        <select className="border border-slate-200 rounded p-1">
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>
                        <span>items per page</span>
                    </div>
                    <div>
                        - of 0 items
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Page</span>
                        <div className="flex items-center gap-1">
                            <button className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled><ChevronLeft className="h-4 w-4" /></button>
                            <span className="px-2 font-medium">1</span>
                            <button className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled><ChevronRight className="h-4 w-4" /></button>
                        </div>
                        <span>of 1</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const BalanceCard = ({ title, balance, taken }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
        <h3 className="font-bold text-slate-700 relative z-10">{title}</h3>
        <div className="relative z-10">
            <div className="flex justify-between items-end mb-1">
                <span className="text-2xl font-bold text-slate-900">{balance}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
                <span>Leave balance</span>
                <span>{balance}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>Leave taken</span>
                <span>{taken}</span>
            </div>
        </div>
    </div>
);

export default LeaveRequestsPage;

