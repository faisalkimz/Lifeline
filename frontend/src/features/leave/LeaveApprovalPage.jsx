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
import {
    CheckCircle, XCircle, Clock, Calendar, Search,
    TrendingUp, FileText, Home, ChevronRight, Users, AlertTriangle, Info
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
            toast.success('Request Approved');
            setShowApprovalDialog(false);
            setSelectedRequest(null);
            refetch();
        } catch (error) {
            toast.error('Authorization Failed');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Provide a reason for rejection.');
            return;
        }

        try {
            await rejectRequest({
                id: selectedRequest.id,
                reason: rejectionReason
            }).unwrap();
            toast.success('Request Rejected');
            setShowRejectionDialog(false);
            setSelectedRequest(null);
            setRejectionReason('');
            refetch();
        } catch (error) {
            toast.error('Rejection Failed');
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

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Home className="h-4 w-4" />
                            <ChevronRight className="h-4 w-4" />
                            <span>Leave Approvals</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Leave Approvals
                        </h1>
                        <p className="text-gray-600">
                            Review and approve employee leave requests.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-6 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                <span className="text-2xl font-bold text-gray-900">{pendingCount}</span>
                                <span className="text-sm text-gray-600">Pending</span>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <span className="text-2xl font-bold text-gray-900">2.4</span>
                                <span className="text-sm text-gray-600">Avg Days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200">
                    {['pending', 'approved', 'rejected', 'all'].map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all text-sm font-medium capitalize ${selectedStatus === status
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Request List */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-600">Loading requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-20 bg-white rounded-xl border border-gray-200 text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Found</h3>
                        <p className="text-sm text-gray-600">No pending requests currently await your review.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredRequests.map((request, idx) => (
                            <Card key={request.id} className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <span className="text-xl font-bold text-blue-600">
                                                    {request.employee_name ? request.employee_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                                </span>
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center border-2 border-white ${request.status === 'approved' ? 'bg-green-500' :
                                                    request.status === 'rejected' ? 'bg-red-500' : 'bg-orange-500'
                                                }`}>
                                                {request.status === 'approved' ? <CheckCircle className="h-3 w-3 text-white" /> :
                                                    request.status === 'rejected' ? <XCircle className="h-3 w-3 text-white" /> :
                                                        <Clock className="h-3 w-3 text-white" />}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{request.employee_name}</h3>
                                                <Badge className="bg-gray-100 text-gray-700 text-xs">
                                                    {request.leave_type_name}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4 text-blue-600" />
                                                    <span>
                                                        {new Date(request.start_date).toLocaleDateString()} — {new Date(request.end_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium">{getDaysRequested(request.start_date, request.end_date)} Days</span>
                                                </div>
                                                {request.created_at && (
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Info className="h-3 w-3" />
                                                        <span>Submitted {new Date(request.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full xl:w-auto">
                                        {request.status === 'pending' ? (
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => { setSelectedRequest(request); setShowApprovalDialog(true); }}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => { setSelectedRequest(request); setShowRejectionDialog(true); }}
                                                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <Info className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm text-gray-600">Status: </span>
                                                <span className={`text-sm font-medium capitalize ${request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                                                    }`}>{request.status}</span>
                                            </div>
                                        )}

                                        {request.reason && (
                                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <p className="text-xs text-gray-600 mb-1">Reason:</p>
                                                <p className="text-sm text-gray-900 italic">"{request.reason}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Approval Dialog */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogContent className="max-w-xl bg-white border border-gray-200 rounded-xl p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-gray-900">Approve Leave Request</DialogTitle>
                            <p className="text-sm text-gray-600 mt-1">Confirm approval for this leave request</p>
                        </DialogHeader>
                    </div>
                    <div className="p-6 space-y-6">
                        {selectedRequest && (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{selectedRequest.employee_name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <span>{selectedRequest.leave_type_name}</span>
                                        <span>•</span>
                                        <span>{getDaysRequested(selectedRequest.start_date, selectedRequest.end_date)} Days</span>
                                    </div>
                                </div>
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                        )}
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <p className="text-sm text-orange-900">
                                Approving this request will update the employee's leave balance and company roster.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setShowApprovalDialog(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={() => selectedRequest && handleApprove(selectedRequest.id)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                Confirm Approval
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                <DialogContent className="max-w-xl bg-white border border-gray-200 rounded-xl p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-gray-900">Reject Leave Request</DialogTitle>
                            <p className="text-sm text-gray-600 mt-1">Provide a reason for rejection</p>
                        </DialogHeader>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Reason for Rejection</label>
                            <textarea
                                className="w-full min-h-[120px] p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Provide a reason for rejecting this leave request..."
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => { setShowRejectionDialog(false); setRejectionReason(''); }} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleReject} disabled={!rejectionReason.trim()} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50">
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LeaveApprovalPage;
