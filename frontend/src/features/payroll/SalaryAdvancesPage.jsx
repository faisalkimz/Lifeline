import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Plus, Eye, CheckCircle, XCircle, DollarSign, Calendar, Clock } from 'lucide-react';

const SalaryAdvancesPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedAdvance, setSelectedAdvance] = useState(null);

    const [formData, setFormData] = useState({
        amount: '',
        purpose: '',
        repayment_period_months: '1'
    });

    // Mock salary advances data
    const advances = [
        {
            id: 1,
            amount: 500000,
            purpose: 'Medical emergency',
            repayment_period_months: 2,
            monthly_deduction: 250000,
            status: 'approved',
            requested_date: '2025-12-10',
            approved_date: '2025-12-12',
            start_deduction_date: '2026-01-25'
        },
        {
            id: 2,
            amount: 300000,
            purpose: 'Home repairs',
            repayment_period_months: 1,
            monthly_deduction: 300000,
            status: 'pending',
            requested_date: '2025-12-15'
        },
        {
            id: 3,
            amount: 750000,
            purpose: 'Education fees',
            repayment_period_months: 3,
            monthly_deduction: 250000,
            status: 'rejected',
            requested_date: '2025-11-20',
            rejected_date: '2025-11-22',
            rejection_reason: 'Exceeds maximum advance limit'
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would submit to API
        console.log('Submitting advance request:', formData);
        setShowForm(false);
        setFormData({
            amount: '',
            purpose: '',
            repayment_period_months: '1'
        });
    };

    const calculateMonthlyDeduction = () => {
        const amount = parseFloat(formData.amount) || 0;
        const months = parseInt(formData.repayment_period_months) || 1;
        return Math.ceil(amount / months);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const AdvanceDetailsModal = ({ advance, onClose }) => {
        if (!advance) return null;

        return (
            <Dialog open={!!advance} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Salary Advance Details
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Amount Requested</label>
                                <p className="text-lg font-semibold text-blue-600">{formatCurrency(advance.amount)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <Badge className={getStatusColor(advance.status)}>
                                    {advance.status}
                                </Badge>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Repayment Period</label>
                                <p>{advance.repayment_period_months} month{advance.repayment_period_months > 1 ? 's' : ''}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Monthly Deduction</label>
                                <p className="text-orange-600 font-semibold">{formatCurrency(advance.monthly_deduction)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Requested Date</label>
                                <p>{new Date(advance.requested_date).toLocaleDateString()}</p>
                            </div>
                            {advance.approved_date && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Approved Date</label>
                                    <p>{new Date(advance.approved_date).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600">Purpose</label>
                            <p className="mt-1">{advance.purpose}</p>
                        </div>

                        {advance.start_deduction_date && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-700">
                                    💰 Deductions will start from your {new Date(advance.start_deduction_date).toLocaleDateString()} payslip
                                </p>
                            </div>
                        )}

                        {advance.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-medium text-red-800 mb-2">Rejection Reason</h4>
                                <p className="text-red-700">{advance.rejection_reason}</p>
                            </div>
                        )}

                        {advance.status === 'approved' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-700">
                                    ✅ Your advance has been approved and will be disbursed soon
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Salary Advances</h1>
                    <p className="text-gray-600 mt-2">Request and track your salary advance applications</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Request Advance
                </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Salary Advance Policy</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Maximum advance: 80% of monthly basic salary</li>
                                <li>• Repayment period: 1-3 months</li>
                                <li>• Interest rate: 0% (deducted from future salaries)</li>
                                <li>• Processing time: 2-3 business days</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Requested</p>
                                <p className="text-2xl font-bold">{formatCurrency(1550000)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">1</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">1</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">1</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advances Table */}
            <Card>
                <CardHeader>
                    <CardTitle>My Salary Advances</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Amount</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Repayment</TableHead>
                                <TableHead>Monthly Deduction</TableHead>
                                <TableHead>Requested</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {advances.map((advance) => (
                                <TableRow key={advance.id} className="hover:bg-gray-50">
                                    <TableCell className="font-semibold text-blue-600">
                                        {formatCurrency(advance.amount)}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{advance.purpose}</TableCell>
                                    <TableCell>{advance.repayment_period_months} month{advance.repayment_period_months > 1 ? 's' : ''}</TableCell>
                                    <TableCell className="text-orange-600 font-semibold">
                                        {formatCurrency(advance.monthly_deduction)}
                                    </TableCell>
                                    <TableCell>{new Date(advance.requested_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(advance.status)}>
                                            {advance.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedAdvance(advance)}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Request Advance Modal */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request Salary Advance</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Amount (UGX) *</label>
                                <Input
                                    name="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="500000"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Repayment Period *</label>
                                <select
                                    name="repayment_period_months"
                                    value={formData.repayment_period_months}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                >
                                    <option value="1">1 Month</option>
                                    <option value="2">2 Months</option>
                                    <option value="3">3 Months</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Purpose *</label>
                            <textarea
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border rounded-md"
                                placeholder="Please explain why you need this advance..."
                                required
                            />
                        </div>

                        {formData.amount && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Repayment Summary</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-blue-700">Monthly Deduction:</span>
                                        <span className="font-semibold ml-2 text-blue-900">
                                            {formatCurrency(calculateMonthlyDeduction())}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700">Total Repayment:</span>
                                        <span className="font-semibold ml-2 text-blue-900">
                                            {formatCurrency(parseFloat(formData.amount) || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Advance Details Modal */}
            <AdvanceDetailsModal advance={selectedAdvance} onClose={() => setSelectedAdvance(null)} />
        </div>
    );
};

export default SalaryAdvancesPage;
