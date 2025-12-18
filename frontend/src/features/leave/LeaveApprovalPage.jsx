import React, { useState } from 'react';
import {
    useGetLeaveRequestsQuery,
    useApproveLeaveRequestMutation,
    useRejectLeaveRequestMutation,
} from '../../store/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
    CheckCircle, XCircle, Clock, Calendar, User, Search,
    Filter, AlertTriangle, MessageSquare, Eye, ChevronDown,
    Users, TrendingUp, BarChart3, FileText
} from 'lucide-react';
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
            toast.success('Leave request approved successfully!');
            setShowApprovalDialog(false);
            setSelectedRequest(null);
            refetch();
        } catch (error) {
            console.error('Failed to approve request:', error);
            toast.error('Failed to approve leave request. Please try again.');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection.');
            return;
        }

        try {
            await rejectRequest({
                id: selectedRequest.id,
                reason: rejectionReason
            }).unwrap();
            toast.success('Leave request rejected.');
            setShowRejectionDialog(false);
            setSelectedRequest(null);
            setRejectionReason('');
            refetch();
        } catch (error) {
            console.error('Failed to reject request:', error);
            toast.error('Failed to reject leave request. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            approved: 'success',
            rejected: 'error',
            cancelled: 'secondary'
        };
        return variants[status] || 'default';
    };

    const getDaysRequested = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Calculate approval stats
    const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
    const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;
    const rejectedCount = leaveRequests.filter(r => r.status === 'rejected').length;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Leave Approvals</h1>
                    <p className="text-text-secondary mt-1">Review and manage team leave requests</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="warning" size="sm" className="px-3 py-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {pendingCount} Pending
                    </Badge>
                </div>
            </div>

            {/* Approval Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Pending Approvals</p>
                                <p className="text-2xl font-bold text-text-primary">{pendingCount}</p>
                            </div>
                            <Clock className="h-8 w-8 text-warning-600" />
                        </div>
                        <p className="text-sm text-text-secondary mt-2">
                            Require your attention
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Approved This Month</p>
                                <p className="text-2xl font-bold text-text-primary">{approvedCount}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-success-600" />
                        </div>
                        <p className="text-sm text-text-secondary mt-2">
                            Successfully approved
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Average Response Time</p>
                                <p className="text-2xl font-bold text-text-primary">2.3</p>
                                <p className="text-xs text-text-secondary">days</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-primary-600" />
                        </div>
                        <p className="text-sm text-text-secondary mt-2">
                            From request to decision
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search by employee name or leave type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full sm:w-auto">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                                <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
                                <TabsTrigger value="all">All ({leaveRequests.length})</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>

            {/* Leave Requests List */}
            {isLoading ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
                            <p className="text-text-secondary font-medium">Loading leave requests...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : filteredRequests.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-3">
                            <FileText className="h-16 w-16 text-neutral-400" />
                            <div className="text-center">
                                <p className="text-text-primary font-semibold text-lg">
                                    {selectedStatus === 'pending' ? 'No pending approvals' : 'No leave requests found'}
                                </p>
                                <p className="text-text-secondary">
                                    {selectedStatus === 'pending'
                                        ? 'All requests have been reviewed.'
                                        : 'Try adjusting your filters.'
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <Card key={request.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                                {request.employee_name ? request.employee_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-text-primary text-lg">
                                                            {request.employee_name || 'Unknown Employee'}
                                                        </h3>
                                                        <p className="text-sm text-text-secondary">
                                                            {request.leave_type_name || 'Leave Type'}
                                                        </p>
                                                    </div>
                                                    <Badge variant={getStatusBadge(request.status)} size="sm">
                                                        {request.status?.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </div>

                                                {/* Request Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {request.start_date ? new Date(request.start_date).toLocaleDateString() : 'N/A'} -
                                                            {request.end_date ? new Date(request.end_date).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{getDaysRequested(request.start_date, request.end_date)} days requested</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                        <User className="h-4 w-4" />
                                                        <span>Applied {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                </div>

                                                {/* Reason */}
                                                {request.reason && (
                                                    <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                                                        <p className="text-sm text-text-primary">
                                                            <strong>Reason:</strong> {request.reason}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Rejection Reason */}
                                                {request.status === 'rejected' && request.rejection_reason && (
                                                    <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded-lg">
                                                        <p className="text-sm text-error-700">
                                                            <strong>Rejection Reason:</strong> {request.rejection_reason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {request.status === 'pending' && (
                                        <div className="flex flex-col sm:flex-row gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowApprovalDialog(true);
                                                }}
                                                className="w-full sm:w-auto"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowRejectionDialog(true);
                                                }}
                                                className="w-full sm:w-auto"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Approval Confirmation Dialog */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-success-600" />
                            Approve Leave Request
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedRequest && (
                            <div className="p-4 bg-neutral-50 rounded-lg">
                                <h4 className="font-medium text-text-primary mb-2">
                                    {selectedRequest.employee_name}
                                </h4>
                                <p className="text-sm text-text-secondary mb-2">
                                    {selectedRequest.leave_type_name} • {getDaysRequested(selectedRequest.start_date, selectedRequest.end_date)} days
                                </p>
                                <p className="text-sm text-text-secondary">
                                    {selectedRequest.start_date ? new Date(selectedRequest.start_date).toLocaleDateString() : 'N/A'} -
                                    {selectedRequest.end_date ? new Date(selectedRequest.end_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-text-secondary">
                            Are you sure you want to approve this leave request? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowApprovalDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => selectedRequest && handleApprove(selectedRequest.id)}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Request
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-error-600" />
                            Reject Leave Request
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedRequest && (
                            <div className="p-4 bg-neutral-50 rounded-lg">
                                <h4 className="font-medium text-text-primary mb-2">
                                    {selectedRequest.employee_name}
                                </h4>
                                <p className="text-sm text-text-secondary mb-2">
                                    {selectedRequest.leave_type_name} • {getDaysRequested(selectedRequest.start_date, selectedRequest.end_date)} days
                                </p>
                                <p className="text-sm text-text-secondary">
                                    {selectedRequest.start_date ? new Date(selectedRequest.start_date).toLocaleDateString() : 'N/A'} -
                                    {selectedRequest.end_date ? new Date(selectedRequest.end_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Reason for Rejection <span className="text-error-500">*</span>
                            </label>
                            <textarea
                                className="w-full min-h-20 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-error-500 transition-all duration-200 resize-none"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a reason for rejecting this leave request..."
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRejectionDialog(false);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Request
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LeaveApprovalPage;
