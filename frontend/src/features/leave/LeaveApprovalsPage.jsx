import React from 'react';
import { useGetLeaveRequestsQuery, useApproveLeaveRequestMutation, useRejectLeaveRequestMutation } from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, Clock, Calendar, User, Building, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LeaveApprovalsPage = () => {
    const { data: requests, isLoading } = useGetLeaveRequestsQuery('/leave/requests/pending_approvals/');
    const [approveRequest, { isLoading: isApproving }] = useApproveLeaveRequestMutation();
    const [rejectRequest, { isLoading: isRejecting }] = useRejectLeaveRequestMutation();

    const handleApprove = async (id) => {
        try {
            await approveRequest(id).unwrap();
            toast.success('Leave request approved');
        } catch (error) {
            toast.error('Failed to approve request');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;
        try {
            await rejectRequest(id).unwrap();
            toast.success('Leave request rejected');
        } catch (error) {
            toast.error('Failed to reject request');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leave Approvals</h1>
                    <p className="text-gray-600 mt-1">Review and action pending leave requests from your team</p>
                </div>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {requests?.length || 0} Pending
                </div>
            </div>

            {requests?.length === 0 ? (
                <Card className="text-center py-16 bg-gray-50 border-dashed">
                    <CardContent>
                        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
                        <h2 className="text-xl font-semibold text-gray-900">All Caught Up!</h2>
                        <p className="text-gray-500 mt-1">You have no pending leave requests to review.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {requests?.map((request) => (
                        <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6 justify-between">
                                    {/* Employee Info */}
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                            {request.employee_name?.charAt(0) || <User />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{request.employee_name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Building className="h-3 w-3" />
                                                <span>{request.department_name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Leave Details */}
                                    <div className="flex-1 border-l pl-6 border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded uppercase tracking-wide">
                                                {request.leave_type_name}
                                            </span>
                                            <span className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(request.start_date).toLocaleDateString()} — {new Date(request.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <span className="font-bold text-gray-900">{request.days_requested} Days</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border border-gray-100">
                                            "{request.reason}"
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                                        <Button
                                            onClick={() => handleApprove(request.id)}
                                            disabled={isApproving || isRejecting}
                                            className="bg-green-600 hover:bg-green-700 text-white w-full justify-center"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(request.id)}
                                            disabled={isApproving || isRejecting}
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full justify-center"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeaveApprovalsPage;
