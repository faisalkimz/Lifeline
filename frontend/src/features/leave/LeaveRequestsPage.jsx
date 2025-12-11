import React, { useState } from 'react';
import { useGetLeaveRequestsQuery, useCreateLeaveRequestMutation, useGetLeaveTypesQuery } from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LeaveBalances from './LeaveBalances';

const LeaveRequestsPage = () => {
    const { data: requests, isLoading: isRequestsLoading } = useGetLeaveRequestsQuery('/leave/requests/my_requests/');
    const { data: leaveTypes, isLoading: isTypesLoading } = useGetLeaveTypesQuery();
    const [createRequest, { isLoading: isCreating }] = useCreateLeaveRequestMutation();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const isPageLoading = isRequestsLoading || isTypesLoading;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRequest({ url: '/leave/requests/', body: formData }).unwrap();
            toast.success('Leave request submitted successfully!');
            setShowForm(false);
            setFormData({ leave_type: '', start_date: '', end_date: '', reason: '' });
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to submit leave request');
        }
    };

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

    if (isPageLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                    <p className="text-gray-600 mt-1">Check balances and manage requests</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                </Button>
            </div>

            {/* Balances Dashboard */}
            <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Balances</h2>
                <LeaveBalances />
            </section>

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

            {/* Requests List */}
            <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Request History</h2>
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {requests?.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-gray-50">
                                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No leave requests found</p>
                                </div>
                            ) : (
                                requests?.map((request) => (
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
    );
};

export default LeaveRequestsPage;
