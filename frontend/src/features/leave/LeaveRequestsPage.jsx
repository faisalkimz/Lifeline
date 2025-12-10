import React, { useState } from 'react';
import { useGetLeaveRequestsQuery, useCreateLeaveRequestMutation } from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LeaveRequestsPage = () => {
    const { data: requests, isLoading } = useGetLeaveRequestsQuery('/leave/requests/my_requests/');
    const [createRequest] = useCreateLeaveRequestMutation();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRequest({ url: '/leave/requests/', body: formData }).unwrap();
            toast.success('Leave request submitted successfully!');
            setShowForm(false);
            setFormData({ leave_type: '', start_date: '', end_date: '', reason: '' });
        } catch (error) {
            toast.error('Failed to submit leave request');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
                    <p className="text-gray-600 mt-1">View and manage your leave applications</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Leave Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Leave Type
                                    </label>
                                    <select
                                        required
                                        value={formData.leave_type}
                                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select type...</option>
                                        <option value="1">Annual Leave</option>
                                        <option value="2">Sick Leave</option>
                                        <option value="3">Maternity Leave</option>
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
                            <div className="flex gap-2">
                                <Button type="submit">Submit Request</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Requests List */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {requests?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No leave requests yet</p>
                            </div>
                        ) : (
                            requests?.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{request.leave_type_name}</h3>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {request.start_date} to {request.end_date} ({request.days_requested} days)
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">{request.reason}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            Applied {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                        {request.approved_by_name && (
                                            <p className="text-xs text-gray-500">
                                                By: {request.approved_by_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LeaveRequestsPage;
