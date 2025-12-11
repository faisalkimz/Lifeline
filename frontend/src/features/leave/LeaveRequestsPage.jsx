import React, { useState } from 'react';
import {
    useGetLeaveRequestsQuery,
    useCreateLeaveRequestMutation,
    useGetLeaveTypesQuery,
    useApproveLeaveRequestMutation,
    useRejectLeaveRequestMutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Loader2, User, Building, LayoutDashboard, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import LeaveBalances from './LeaveBalances';

const LeaveRequestsPage = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'approvals'
    const [showForm, setShowForm] = useState(false);

    // --- My Requests Data ---
    const { data: myRequests, isLoading: isMyRequestsLoading } = useGetLeaveRequestsQuery('/leave/requests/my_requests/');
    const { data: leaveTypes, isLoading: isTypesLoading } = useGetLeaveTypesQuery();
    const [createRequest, { isLoading: isCreating }] = useCreateLeaveRequestMutation();

    // --- Approvals Data ---
    // only fetch if tab is active or prefetch? 
    // We fetch always so we can show badge count? Or separate query for count?
    // We'll fetch it to show the count badge on the tab.
    const { data: pendingApprovals, isLoading: isApprovalsLoading } = useGetLeaveRequestsQuery('/leave/requests/pending_approvals/');
    const [approveRequest, { isLoading: isApproving }] = useApproveLeaveRequestMutation();
    const [rejectRequest, { isLoading: isRejecting }] = useRejectLeaveRequestMutation();

    const [formData, setFormData] = useState({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const isPageLoading = isMyRequestsLoading || isTypesLoading || isApprovalsLoading;

    // --- Handlers ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRequest({ url: '/leave/requests/', body: formData }).unwrap();
            toast.success('Leave request submitted successfully!');
            setShowForm(false);
            setFormData({ leave_type: '', start_date: '', end_date: '', reason: '' });
        } catch (error) {
            console.error("Submit Error:", error);
            const details = error?.data?.detail
                ? (typeof error.data.detail === 'object' ? JSON.stringify(error.data.detail) : error.data.detail)
                : (error?.data ? JSON.stringify(error.data) : 'Failed to submit leave request');

            toast.error(details || 'Failed to submit request');
        }
    };

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

    // --- UI Helpers ---

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
            cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (isPageLoading && !myRequests && !pendingApprovals) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                <p className="text-gray-600 mt-1">Manage your leave and review team requests</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    My Overview
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'approvals'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <FileCheck className="h-4 w-4" />
                    Team Approvals
                    {pendingApprovals?.length > 0 && (
                        <span className="ml-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs">
                            {pendingApprovals.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content: Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Actions */}
                    <div className="flex justify-end">
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            {showForm ? 'Cancel Request' : 'New Request'}
                        </Button>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <Card className="border-l-4 border-l-primary-500 shadow-lg animate-fade-in">
                            <CardHeader>
                                <CardTitle>New Leave Request</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Leave Type
                                            </label>
                                            <select
                                                required
                                                value={formData.leave_type}
                                                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                            >
                                                <option value="">Select type...</option>
                                                {leaveTypes?.map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name} ({type.days_per_year} days/yr)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Reason
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            placeholder="Explain the reason for your leave..."
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isCreating}>
                                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Request'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Balances */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Balances</h2>
                        <LeaveBalances />
                    </section>

                    {/* My Requests List */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Request History</h2>
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {myRequests?.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 bg-gray-50">
                                            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            <p>No leave requests found</p>
                                        </div>
                                    ) : (
                                        myRequests?.map((request) => (
                                            <div
                                                key={request.id}
                                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-semibold text-gray-900">{request.leave_type_name}</h3>
                                                        {getStatusBadge(request.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(request.start_date).toLocaleDateString()} — {new Date(request.end_date).toLocaleDateString()}
                                                        <span className="font-medium text-gray-900">({request.days_requested} days)</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1 italic">"{request.reason}"</p>
                                                </div>
                                                <div className="text-right pl-4">
                                                    <p className="text-xs text-gray-400 mb-1">Applied {new Date(request.created_at).toLocaleDateString()}</p>
                                                    {request.approved_by_name && (
                                                        <div className="flex items-center justify-end gap-1 text-xs text-green-600">
                                                            <CheckCircle className="h-3 w-3" />
                                                            <span>By {request.approved_by_name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            )}

            {/* Content: Approvals */}
            {activeTab === 'approvals' && (
                <div className="animate-fade-in space-y-6">
                    {pendingApprovals?.length === 0 ? (
                        <Card className="text-center py-16 bg-gray-50 border-dashed">
                            <CardContent>
                                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
                                <h2 className="text-xl font-semibold text-gray-900">All Caught Up!</h2>
                                <p className="text-gray-500 mt-1">You have no pending leave requests to review.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {pendingApprovals?.map((request) => (
                                <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6 justify-between">
                                            {/* Employee Info */}
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                                    {request.employee_name ? request.employee_name.charAt(0) : <User />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{request.employee_name}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Building className="h-3 w-3" />
                                                        <span>{request.employee_number}</span>
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
            )}
        </div>
    );
};

export default LeaveRequestsPage;
