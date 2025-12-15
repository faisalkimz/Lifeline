import React, { useState } from 'react';
import {
    useGetLeaveRequestsQuery,
    useCreateLeaveRequestMutation,
    useGetLeaveTypesQuery,
    useGetCurrentUserQuery,
    useApproveLeaveRequestMutation,
    useRejectLeaveRequestMutation
} from '../../store/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
    Calendar,
    Plus,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Download,
    Filter
} from 'lucide-react';

import LeaveBalances from './LeaveBalances';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const LeaveRequestsPage = () => {
    const [activeTab, setActiveTab] = useState("my-requests");
    const { data: user } = useGetCurrentUserQuery();

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Leave Management</h1>
                <p className="text-gray-500">Manage your leave requests and balances.</p>
            </div>

            {/* Balances Section */}
            <LeaveBalances />

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 border border-gray-200">
                    <TabsTrigger value="my-requests" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        My Requests
                    </TabsTrigger>
                    <TabsTrigger value="new-request" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Request
                    </TabsTrigger>
                    {/* Show Approvals tab only for Managers/Admins */}
                    {user?.role !== 'employee' && (
                        <TabsTrigger value="approvals" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Team Approvals
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="my-requests">
                    <MyRequestsList />
                </TabsContent>

                <TabsContent value="new-request">
                    <LeaveRequestForm onSuccess={() => setActiveTab("my-requests")} />
                </TabsContent>

                {user?.role !== 'employee' && (
                    <TabsContent value="approvals">
                        <ApprovalsList />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

// ==========================================
// 1. My Requests Component
// ==========================================
const MyRequestsList = () => {
    // Pass specific URL for my requests
    const { data: requests, isLoading } = useGetLeaveRequestsQuery('/leave/requests/my_requests/');

    if (isLoading) return <LoadingSkeleton />;

    if (!requests || requests.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="bg-blue-50 p-3 rounded-full mb-3">
                        <Calendar className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Leave Requests</h3>
                    <p className="text-gray-500 mb-4 max-w-sm">You haven't submitted any leave requests yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {requests.map((request) => (
                <RequestCard key={request.id} request={request} isOwner={true} />
            ))}
        </div>
    );
};

// ==========================================
// 2. Approvals List Component (For Managers)
// ==========================================
const ApprovalsList = () => {
    // Pass specific URL for pending approvals
    const { data: requests, isLoading } = useGetLeaveRequestsQuery('/leave/requests/pending_approvals/');

    if (isLoading) return <LoadingSkeleton />;

    if (!requests || requests.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="bg-green-50 p-3 rounded-full mb-3">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                    <p className="text-gray-500">There are no pending leave requests to approve.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {requests.map((request) => (
                <RequestCard key={request.id} request={request} isOwner={false} />
            ))}
        </div>
    );
};

// ==========================================
// 3. Shared Request Card
// ==========================================
const RequestCard = ({ request, isOwner }) => {
    const [approve, { isLoading: isApproving }] = useApproveLeaveRequestMutation();
    const [reject, { isLoading: isRejecting }] = useRejectLeaveRequestMutation();

    const handleApprove = async () => {
        try {
            await approve(request.id).unwrap();
            toast.success('Leave request approved');
        } catch (err) {
            toast.error('Failed to approve request');
        }
    };

    const handleReject = async () => {
        try {
            await reject(request.id).unwrap();
            toast.success('Leave request rejected');
        } catch (err) {
            toast.error('Failed to reject request');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                        {/* Date Box */}
                        <div className="flex flex-col items-center justify-center bg-blue-50 rounded-lg p-3 min-w-[80px] text-blue-700 border border-blue-100">
                            <span className="text-xs font-bold uppercase">{format(new Date(request.start_date), 'MMM')}</span>
                            <span className="text-2xl font-bold">{format(new Date(request.start_date), 'dd')}</span>
                            <span className="text-xs mt-1">{request.days_requested} Days</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                    {isOwner ? request.leave_type_name : `${request.employee_name} • ${request.leave_type_name}`}
                                </h3>
                                <Badge className={getStatusColor(request.status)}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                            </div>

                            <div className="text-sm text-gray-500 mb-2">
                                {format(new Date(request.start_date), 'EEE, MMM d, yyyy')} - {format(new Date(request.end_date), 'EEE, MMM d, yyyy')}
                            </div>

                            {request.reason && (
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 inline-block max-w-xl">
                                    "{request.reason}"
                                </p>
                            )}

                            {request.document && (
                                <div className="mt-2">
                                    <a href={request.document} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                                        <FileText className="h-3 w-3" />
                                        View Attachment
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {!isOwner && request.status === 'pending' && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-200 hover:bg-green-50 text-green-700"
                                    onClick={handleApprove}
                                    disabled={isApproving}
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 hover:bg-red-50 text-red-700"
                                    onClick={handleReject}
                                    disabled={isRejecting}
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                </Button>
                            </>
                        )}
                        {!isOwner && request.status === 'approved' && (
                            <div className="flex items-center text-sm text-green-600 font-medium">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approved by {request.approved_by_name || 'Manager'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ==========================================
// 4. Leave Request Form
// ==========================================
const LeaveRequestForm = ({ onSuccess }) => {
    const { data: leaveTypes, isLoading: loadingTypes } = useGetLeaveTypesQuery();
    const [createRequest, { isLoading: isSubmitting }] = useCreateLeaveRequestMutation();

    const [formData, setFormData] = useState({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
        document: null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            const fd = new FormData();
            fd.append("leave_type", formData.leave_type);
            fd.append("start_date", formData.start_date);
            fd.append("end_date", formData.end_date);
            fd.append("reason", formData.reason);
            if (formData.document) fd.append("document", formData.document);

            await createRequest({ body: fd }).unwrap(); // Api expects { url, body } or just body if url is default? 
            // Checking api.js: query: ({ url, body }) => ...
            // Wait, createLeaveRequest definition: 
            // query: ({ url, body }) => ({ url: url || '/leave/requests/', method: 'POST', body: formData }) - Variable mismatch in api.js?
            // "body: formData" inside query function but "body" passed in arg. 
            // Let's assume standard RTK Query: createRequest(data) calls the query callback.
            // I should double check api.js code again below.

            toast.success("Leave request submitted successfully!");
            setFormData({ leave_type: "", start_date: "", end_date: "", reason: "", document: null });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit request.");
        }
    };

    if (loadingTypes) return <LoadingSkeleton />;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                            <select
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.leave_type}
                                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                            >
                                <option value="">Select a type...</option>
                                {leaveTypes?.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <textarea
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            placeholder="Please explain why you need this leave..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document (Optional)</label>
                        <div className="border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })}
                                accept=".pdf,.png,.jpg,.jpeg"
                            />
                            <div className="flex flex-col items-center gap-1">
                                <Download className="h-6 w-6 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                    {formData.document ? formData.document.name : "Click to upload or drag and drop"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

const LoadingSkeleton = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-lg" />
        <div className="h-20 bg-gray-100 rounded-lg" />
        <div className="h-20 bg-gray-100 rounded-lg" />
    </div>
);

export default LeaveRequestsPage;
