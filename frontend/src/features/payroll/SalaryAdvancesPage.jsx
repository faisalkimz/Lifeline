import React, { useState } from 'react';
import {
    useGetSalaryAdvancesQuery,
    useCreateSalaryAdvanceMutation,
    useApproveSalaryAdvanceMutation,
    useRejectSalaryAdvanceMutation,
    useGetEmployeesQuery
} from '../../store/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Plus, Eye, CheckCircle, XCircle, DollarSign, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';

const SalaryAdvancesPage = () => {
    const user = useSelector(selectCurrentUser);
    const isAdmin = user?.role !== 'employee';
    const { data: advancesData, isLoading } = useGetSalaryAdvancesQuery();
    const { data: employees } = useGetEmployeesQuery();
    const [createAdvance, { isLoading: isCreating }] = useCreateSalaryAdvanceMutation();
    const [approveAdvance] = useApproveSalaryAdvanceMutation();
    const [rejectAdvance] = useRejectSalaryAdvanceMutation();

    const advances = Array.isArray(advancesData) ? advancesData : (advancesData?.results || []);

    const [showForm, setShowForm] = useState(false);
    const [selectedAdvance, setSelectedAdvance] = useState(null);

    const [formData, setFormData] = useState({
        employee: user?.employee || '',
        amount: '',
        loan_purpose: '',
        repayment_period_months: '1'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createAdvance(formData).unwrap();
            toast.success('Salary advance request submitted.');
            setShowForm(false);
            setFormData({
                employee: user?.employee || '',
                amount: '',
                loan_purpose: '',
                repayment_period_months: '1'
            });
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to submit request');
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveAdvance(id).unwrap();
            toast.success('Salary advance approved.');
        } catch (error) {
            toast.error('Approval failed.');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectAdvance(id).unwrap();
            toast.success('Salary advance request rejected.');
        } catch (error) {
            toast.error('Rejection failed.');
        }
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
                    <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-slate-100 -mx-6 -mt-6 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                            <DollarSign className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Advance Details</DialogTitle>
                            <p className="text-slate-500 mt-1 font-medium text-sm">Review your salary advance request.</p>
                        </div>
                    </div>
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
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-900 rounded-xl text-white">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Disbursed</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                    {formatCurrency(advances.filter(a => a.status === 'active' || a.status === 'completed').reduce((acc, curr) => acc + parseFloat(curr.amount), 0))}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Advances</p>
                                <p className="text-2xl font-black text-emerald-600 tracking-tighter">
                                    {advances.filter(a => a.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 rounded-xl text-orange-600 border border-orange-100">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Approvals</p>
                                <p className="text-2xl font-black text-orange-600 tracking-tighter">
                                    {advances.filter(a => a.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settled / Cancelled</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                    {advances.filter(a => a.status === 'cancelled' || a.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advances Table */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Advance Ledger</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5">Employee</th>
                                    <th className="px-8 py-5">Amount</th>
                                    <th className="px-8 py-5">Purpose</th>
                                    <th className="px-8 py-5">Repayment Plan</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    [1, 2, 3].map(i => <tr key={i} className="animate-pulse h-20 bg-white"></tr>)
                                ) : advances.length > 0 ? (
                                    advances.map((advance) => (
                                        <tr key={advance.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 text-sm">{advance.employee_name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{advance.employee_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900">{formatCurrency(advance.amount)}</span>
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight mt-0.5">Approved Amount</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-medium text-slate-600 truncate max-w-[150px] inline-block">{advance.loan_purpose}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-700">{advance.repayment_period_months} Months</span>
                                                    <span className="text-[10px] font-bold text-orange-500 uppercase mt-0.5">-{formatCurrency(advance.monthly_deduction)} / mo</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge className={cn("rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border", getStatusColor(advance.status))}>
                                                    {advance.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedAdvance(advance)} className="h-10 w-10 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                    {isAdmin && advance.status === 'pending' && (
                                                        <>
                                                            <Button variant="ghost" size="sm" onClick={() => handleApprove(advance.id)} className="h-10 w-10 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl">
                                                                <CheckCircle className="h-5 w-5" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleReject(advance.id)} className="h-10 w-10 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl">
                                                                <XCircle className="h-5 w-5" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No advances found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Request Advance Modal */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl p-0 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                    <div className="bg-white px-10 pt-10 pb-6">
                        <DialogTitle className="text-3xl font-semibold text-slate-900 tracking-tight">Request an advance</DialogTitle>
                        <p className="text-slate-500 mt-2 text-sm max-w-md leading-relaxed">
                            Specify the amount and repayment period. The requested amount will be deducted from your upcoming payslips.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        {isAdmin && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Employee</label>
                                <select
                                    name="employee"
                                    value={formData.employee}
                                    onChange={handleInputChange}
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:bg-white outline-none"
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees?.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount (UGX)</label>
                                <Input
                                    name="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="500000"
                                    required
                                    className="h-14 border-2 border-slate-100 rounded-2xl bg-slate-50 font-black text-slate-900 px-6"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Repayment Period (Months)</label>
                                <select
                                    name="repayment_period_months"
                                    value={formData.repayment_period_months}
                                    onChange={handleInputChange}
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:bg-white outline-none"
                                    required
                                >
                                    <option value="1">1 Month (Next Payroll)</option>
                                    <option value="2">2 Months</option>
                                    <option value="3">3 Months</option>
                                    <option value="6">6 Months</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reason for Advance</label>
                            <textarea
                                name="loan_purpose"
                                value={formData.loan_purpose}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-medium text-slate-700 focus:bg-white outline-none resize-none"
                                placeholder="Please state the reason for this advance request..."
                                required
                            />
                        </div>

                        {formData.amount && (
                            <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-400 italic">Net Payment Summary</h4>
                                    <Badge className="bg-primary-600 text-[9px] font-black">0% INTEREST</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Monthly Deduction</p>
                                        <p className="text-xl font-black tracking-tighter text-white">{formatCurrency(calculateMonthlyDeduction())}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Total Amount</p>
                                        <p className="text-xl font-black tracking-tighter text-white">{formatCurrency(parseFloat(formData.amount) || 0)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-3 pt-6 border-t border-slate-50">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowForm(false)}
                                className="h-11 px-6 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
                            >
                                {isCreating ? 'Processing...' : 'Submit request'}
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
