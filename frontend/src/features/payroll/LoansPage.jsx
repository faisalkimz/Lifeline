import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import {
    Plus, Eye, CheckCircle, XCircle, DollarSign, Calendar,
    Clock, Loader2, TrendingUp, PiggyBank, Calculator, Percent
} from 'lucide-react';
import { useGetSalaryAdvancesQuery, useCreateSalaryAdvanceMutation, useGetEmployeesQuery } from '../../store/api';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';

const LoansPage = () => {
    const user = useSelector(selectCurrentUser);
    const isAdmin = user?.role !== 'employee';

    const { data: loansData, isLoading } = useGetSalaryAdvancesQuery({ loan_type: 'loan' });
    const { data: employees } = useGetEmployeesQuery();
    const [createLoan, { isLoading: isCreating }] = useCreateSalaryAdvanceMutation();

    const loans = Array.isArray(loansData) ? loansData : (loansData?.results || []);

    const [showForm, setShowForm] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loanCalculator, setLoanCalculator] = useState({
        principal: '',
        interestRate: 5,
        months: 12
    });

    const [formData, setFormData] = useState({
        employee: '',
        amount: '',
        loan_purpose: '',
        repayment_period_months: '12',
        interest_rate: '5'
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const calculateMonthlyPayment = (principal, rate, months) => {
        const p = parseFloat(principal) || 0;
        const r = (parseFloat(rate) || 0) / 100 / 12;
        const n = parseInt(months) || 1;

        if (r === 0) return p / n;

        const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return Math.ceil(monthly);
    };

    const calculateTotalInterest = (principal, rate, months) => {
        const monthly = calculateMonthlyPayment(principal, rate, months);
        const total = monthly * months;
        return total - parseFloat(principal) || 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createLoan({
                ...formData,
                loan_type: 'loan'
            }).unwrap();
            toast.success('Loan application submitted successfully!');
            setShowForm(false);
            setFormData({
                employee: '',
                amount: '',
                loan_purpose: '',
                repayment_period_months: '12',
                interest_rate: '5'
            });
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to submit loan application');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // Calculate stats
    const stats = {
        totalDisbursed: loans.filter(l => l.status === 'active' || l.status === 'completed')
            .reduce((sum, l) => sum + parseFloat(l.amount || 0), 0),
        activeLoans: loans.filter(l => l.status === 'active').length,
        pendingLoans: loans.filter(l => l.status === 'pending').length,
        completedLoans: loans.filter(l => l.status === 'completed').length,
        totalOutstanding: loans.filter(l => l.status === 'active')
            .reduce((sum, l) => sum + parseFloat(l.outstanding_balance || l.amount || 0), 0)
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff Loans</h1>
                    <p className="text-gray-600 mt-2">Manage employee loan applications and repayments</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Apply for Loan
                </Button>
            </div>

            {/* Loan Calculator Card */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none shadow-2xl rounded-3xl overflow-hidden text-white">
                <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Calculator className="h-6 w-6 text-primary-400" />
                        <h3 className="text-lg font-black uppercase tracking-wider">Quick Loan Calculator</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Principal Amount</label>
                            <input
                                type="number"
                                value={loanCalculator.principal}
                                onChange={(e) => setLoanCalculator(prev => ({ ...prev, principal: e.target.value }))}
                                placeholder="5,000,000"
                                className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-primary-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interest Rate (%)</label>
                            <input
                                type="number"
                                value={loanCalculator.interestRate}
                                onChange={(e) => setLoanCalculator(prev => ({ ...prev, interestRate: e.target.value }))}
                                placeholder="5"
                                className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-primary-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Term (Months)</label>
                            <select
                                value={loanCalculator.months}
                                onChange={(e) => setLoanCalculator(prev => ({ ...prev, months: e.target.value }))}
                                className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-primary-400"
                            >
                                <option value="6" className="text-slate-900">6 Months</option>
                                <option value="12" className="text-slate-900">12 Months</option>
                                <option value="18" className="text-slate-900">18 Months</option>
                                <option value="24" className="text-slate-900">24 Months</option>
                                <option value="36" className="text-slate-900">36 Months</option>
                            </select>
                        </div>
                        <div className="bg-primary-600 rounded-2xl p-4 text-center">
                            <p className="text-xs font-bold text-primary-200 uppercase tracking-wider mb-1">Monthly Payment</p>
                            <p className="text-2xl font-black">
                                {formatCurrency(calculateMonthlyPayment(loanCalculator.principal, loanCalculator.interestRate, loanCalculator.months))}
                            </p>
                            <p className="text-xs text-primary-200 mt-1">
                                Total Interest: {formatCurrency(calculateTotalInterest(loanCalculator.principal, loanCalculator.interestRate, loanCalculator.months))}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-900 rounded-xl text-white">
                                <PiggyBank className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Disbursed</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                    {formatCurrency(stats.totalDisbursed)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <TrendingUp className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Loans</p>
                                <p className="text-2xl font-black text-emerald-600 tracking-tighter">{stats.activeLoans}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Approval</p>
                                <p className="text-2xl font-black text-orange-600 tracking-tighter">{stats.pendingLoans}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                <DollarSign className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding</p>
                                <p className="text-2xl font-black text-red-600 tracking-tighter">
                                    {formatCurrency(stats.totalOutstanding)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Loans Table */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Loan Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loans.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</TableHead>
                                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Principal</TableHead>
                                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Interest</TableHead>
                                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Term</TableHead>
                                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monthly</TableHead>
                                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</TableHead>
                                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loans.map((loan) => (
                                    <TableRow key={loan.id} className="hover:bg-slate-50/50 transition-all">
                                        <TableCell className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{loan.employee_name}</span>
                                                <span className="text-xs text-slate-400">{loan.employee_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 font-bold text-slate-900">
                                            {formatCurrency(loan.amount)}
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <span className="font-bold text-slate-700">{loan.interest_rate || 5}%</span>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <span className="font-bold text-slate-700">{loan.repayment_period_months} months</span>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 font-bold text-primary-600">
                                            {formatCurrency(loan.monthly_deduction)}
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <Badge className={cn("rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border", getStatusColor(loan.status))}>
                                                {loan.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedLoan(loan)}
                                                className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-20 text-center">
                            <PiggyBank className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No loans found</p>
                            <p className="text-sm text-slate-400 mt-2">Apply for a staff loan to get started</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Apply for Loan Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl p-0 border-none shadow-2xl rounded-[2rem] overflow-hidden">
                    <DialogHeader className="bg-slate-900 p-8 text-white">
                        <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <PiggyBank className="h-6 w-6 text-primary-400" />
                            Loan Application
                        </DialogTitle>
                        <p className="text-slate-400 text-sm mt-1">Submit a new staff loan request</p>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {isAdmin && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Employee</label>
                                <select
                                    name="employee"
                                    value={formData.employee}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-primary-500 outline-none"
                                    required
                                >
                                    <option value="">Choose employee...</option>
                                    {employees?.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loan Amount (UGX)</label>
                                <Input
                                    name="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="5,000,000"
                                    required
                                    className="h-12 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interest Rate (%)</label>
                                <Input
                                    name="interest_rate"
                                    type="number"
                                    value={formData.interest_rate}
                                    onChange={handleInputChange}
                                    placeholder="5"
                                    className="h-12 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repayment Period</label>
                            <select
                                name="repayment_period_months"
                                value={formData.repayment_period_months}
                                onChange={handleInputChange}
                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-primary-500 outline-none"
                            >
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                                <option value="18">18 Months</option>
                                <option value="24">24 Months</option>
                                <option value="36">36 Months</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose of Loan</label>
                            <textarea
                                name="loan_purpose"
                                value={formData.loan_purpose}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-primary-500 outline-none resize-none"
                                placeholder="Please describe the purpose of this loan..."
                                required
                            />
                        </div>

                        {formData.amount && (
                            <div className="bg-slate-900 rounded-2xl p-6 text-white">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary-400">Loan Summary</h4>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400">Monthly Payment</p>
                                        <p className="text-xl font-black">
                                            {formatCurrency(calculateMonthlyPayment(formData.amount, formData.interest_rate, formData.repayment_period_months))}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Total Interest</p>
                                        <p className="text-xl font-black text-yellow-400">
                                            {formatCurrency(calculateTotalInterest(formData.amount, formData.interest_rate, formData.repayment_period_months))}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Total Repayment</p>
                                        <p className="text-xl font-black text-primary-400">
                                            {formatCurrency(calculateMonthlyPayment(formData.amount, formData.interest_rate, formData.repayment_period_months) * parseInt(formData.repayment_period_months))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating} className="rounded-xl gap-2">
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                {isCreating ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Loan Details Dialog */}
            <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
                <DialogContent className="max-w-lg p-0 border-none shadow-2xl rounded-[2rem] overflow-hidden">
                    {selectedLoan && (
                        <>
                            <DialogHeader className="bg-slate-900 p-8 text-white">
                                <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                                    <DollarSign className="h-6 w-6 text-primary-400" />
                                    Loan Details
                                </DialogTitle>
                                <p className="text-slate-400 text-sm">{selectedLoan.employee_name}</p>
                            </DialogHeader>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-400">Principal</p>
                                        <p className="text-lg font-black text-slate-900">{formatCurrency(selectedLoan.amount)}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-400">Interest Rate</p>
                                        <p className="text-lg font-black text-slate-900">{selectedLoan.interest_rate || 5}%</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-400">Term</p>
                                        <p className="text-lg font-black text-slate-900">{selectedLoan.repayment_period_months} months</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-400">Monthly Payment</p>
                                        <p className="text-lg font-black text-primary-600">{formatCurrency(selectedLoan.monthly_deduction)}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-100 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-2">Purpose</p>
                                    <p className="text-slate-700">{selectedLoan.loan_purpose}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status</span>
                                    <Badge className={cn("rounded-xl px-4 py-1.5", getStatusColor(selectedLoan.status))}>
                                        {selectedLoan.status}
                                    </Badge>
                                </div>
                            </div>

                            <DialogFooter className="p-8 pt-0">
                                <Button variant="outline" onClick={() => setSelectedLoan(null)} className="rounded-xl">
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LoansPage;
