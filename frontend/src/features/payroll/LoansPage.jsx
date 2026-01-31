import React, { useState } from 'react';
import {
    Plus, Search, Filter, PiggyBank, Clock,
    DollarSign, TrendingUp, ChevronRight, Eye,
    MoreHorizontal, Calculator, Hash, User,
    CheckCircle2, AlertCircle, Calendar
} from 'lucide-react';
import {
    useGetSalaryAdvancesQuery,
    useCreateSalaryAdvanceMutation,
    useGetEmployeesQuery
} from '../../store/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    approved: { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', label: 'Approved' },
    active: { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', label: 'Active' },
    pending: { color: 'text-orange-700 bg-orange-50 border-orange-100', label: 'Pending' },
    rejected: { color: 'text-red-700 bg-red-50 border-red-100', label: 'Rejected' },
    completed: { color: 'text-blue-700 bg-blue-50 border-blue-100', label: 'Completed' },
    draft: { color: 'text-slate-500 bg-slate-50 border-slate-100', label: 'Draft' }
};

const LoansPage = () => {
    // 1. Context & State
    const user = useSelector(selectCurrentUser);
    const isAdmin = user?.role !== 'employee';
    const [searchTerm, setSearchTerm] = useState('');
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

    // 2. Queries
    const { data: loansData, isLoading } = useGetSalaryAdvancesQuery({ loan_type: 'loan' });
    const { data: employeesData } = useGetEmployeesQuery();
    const [createLoan, { isLoading: isCreating }] = useCreateSalaryAdvanceMutation();

    // 3. Computed
    const loans = Array.isArray(loansData) ? loansData : (loansData?.results || []);
    const employees = Array.isArray(employeesData?.results) ? employeesData.results : (Array.isArray(employeesData) ? employeesData : []);

    const filteredLoans = loans.filter(l =>
        l.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.employee_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalDisbursed: loans.filter(l => l.status === 'active' || l.status === 'completed')
            .reduce((sum, l) => sum + parseFloat(l.amount || 0), 0),
        activeCount: loans.filter(l => l.status === 'active').length,
        pendingCount: loans.filter(l => l.status === 'pending').length,
        totalOutstanding: loans.filter(l => l.status === 'active')
            .reduce((sum, l) => sum + parseFloat(l.outstanding_balance || l.amount || 0), 0)
    };

    // 4. Handlers
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0
        }).format(Number(val) || 0);
    };

    const calculateMonthlyPayment = (principal, rate, months) => {
        const p = parseFloat(principal) || 0;
        const r = (parseFloat(rate) || 0) / 100 / 12;
        const n = parseInt(months) || 1;
        if (r === 0) return Math.ceil(p / n);
        const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return Math.ceil(monthly);
    };

    const calculateTotalInterest = (principal, rate, months) => {
        const monthly = calculateMonthlyPayment(principal, rate, months);
        return (monthly * months) - (parseFloat(principal) || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createLoan({ ...formData, loan_type: 'loan' }).unwrap();
            toast.success('Loan application submitted');
            setShowForm(false);
            setFormData({ employee: '', amount: '', loan_purpose: '', repayment_period_months: '12', interest_rate: '5' });
        } catch (error) {
            toast.error(error?.data?.error || 'Submission failed');
        }
    };

    // 5. Render
    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Loan Portfolio</h1>
                    <p className="text-notion-text-light mt-2">Oversee staff loans, repayments, and outstanding liabilities.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setShowForm(true)} className="btn-notion-primary h-8">
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        Apply for loan
                    </Button>
                </div>
            </div>

            {/* Flat Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Disbursed', value: formatCurrency(stats.totalDisbursed) },
                    { label: 'Active Loans', value: stats.activeCount },
                    { label: 'Pending Approval', value: stats.pendingCount, color: 'text-orange-600' },
                    { label: 'Outstanding Balance', value: formatCurrency(stats.totalOutstanding), color: 'text-red-600' }
                ].map((s, idx) => (
                    <div key={idx} className="space-y-1">
                        <p className="text-[11px] font-semibold text-notion-text-light uppercase tracking-wider">{s.label}</p>
                        <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Calculator Card - Minimal but Premium */}
            <div className="p-8 bg-notion-sidebar border border-notion-border rounded-xl">
                <div className="flex items-center gap-2 mb-6 text-notion-text-light">
                    <Calculator className="h-4 w-4" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Eligibility Calculator</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-notion-text-light uppercase tracking-widest leading-none">Principal Amount</label>
                        <input
                            type="number"
                            value={loanCalculator.principal}
                            onChange={(e) => setLoanCalculator(prev => ({ ...prev, principal: e.target.value }))}
                            placeholder="5,000,000"
                            className="input-notion py-1 h-9 bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-notion-text-light uppercase tracking-widest leading-none">Rate (%)</label>
                        <input
                            type="number"
                            value={loanCalculator.interestRate}
                            onChange={(e) => setLoanCalculator(prev => ({ ...prev, interestRate: e.target.value }))}
                            className="input-notion py-1 h-9 bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-notion-text-light uppercase tracking-widest leading-none">Term (Months)</label>
                        <select
                            value={loanCalculator.months}
                            onChange={(e) => setLoanCalculator(prev => ({ ...prev, months: e.target.value }))}
                            className="input-notion py-1 h-9 bg-white cursor-pointer"
                        >
                            {[6, 12, 18, 24, 36, 48].map(m => <option key={m} value={m}>{m} Months</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="flex justify-between items-baseline border-b border-notion-border pb-1">
                            <span className="text-[10px] font-bold text-notion-text-light uppercase tracking-widest">Monthly</span>
                            <span className="text-sm font-bold">{formatCurrency(calculateMonthlyPayment(loanCalculator.principal, loanCalculator.interestRate, loanCalculator.months))}</span>
                        </div>
                        <div className="flex justify-between items-baseline mt-1">
                            <span className="text-[10px] font-bold text-notion-text-light uppercase tracking-widest opacity-50">Interest</span>
                            <span className="text-[10px] font-bold text-notion-text-light">{formatCurrency(calculateTotalInterest(loanCalculator.principal, loanCalculator.interestRate, loanCalculator.months))}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Controls */}
            <div className="flex flex-col md:flex-row gap-4 py-2 border-y border-notion-border items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-notion-text-light" />
                    <input
                        placeholder="Filter by employee name or number..."
                        className="w-full pl-8 pr-3 py-1.5 bg-transparent border-none focus:outline-none text-sm placeholder:text-notion-text-light"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto whitespace-nowrap px-1">
                    <Button variant="ghost" className="btn-notion-outline h-7 px-2 text-[10px] uppercase font-bold tracking-widest">
                        <Filter className="h-3 w-3 mr-1.5" /> Filter
                    </Button>
                    <div className="h-4 w-px bg-notion-border mx-2" />
                    <button className="p-1 hover:bg-notion-hover rounded">
                        <MoreHorizontal className="h-4 w-4 text-notion-text-light" />
                    </button>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="py-24 text-center text-notion-text-light italic">Loading portfolio...</div>
            ) : filteredLoans.length === 0 ? (
                <div className="py-24 text-center opacity-60">
                    <PiggyBank className="h-12 w-12 mx-auto mb-4 stroke-1" />
                    <p className="text-sm font-medium">No loans found in records</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-notion-border">
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider w-[320px]">Member</th>
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Loan Principal</th>
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Schedule</th>
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Status</th>
                                <th className="px-1 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-notion-border">
                            {filteredLoans.map((loan) => (
                                <tr key={loan.id} className="group hover:bg-notion-hover/40 transition-colors cursor-pointer" onClick={() => setSelectedLoan(loan)}>
                                    <td className="px-4 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-notion-sidebar border border-notion-border flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-notion-text-light opacity-50" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[14px] truncate">{loan.employee_name}</p>
                                                <p className="text-[11px] text-notion-text-light font-medium uppercase tracking-tighter flex items-center gap-1.5">
                                                    <Hash className="h-3 w-3 opacity-30" /> {loan.employee_number}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <p className="text-sm font-semibold">{formatCurrency(loan.amount)}</p>
                                        <p className="text-[10px] text-notion-text-light uppercase font-bold tracking-tighter">
                                            {loan.interest_rate || 5}% Interest applied
                                        </p>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <span className="text-notion-text-light">{loan.repayment_period_months}M Term</span>
                                            <div className="h-3 w-px bg-notion-border" />
                                            <span className="text-[#88B072]">{formatCurrency(loan.monthly_deduction)}/mo</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <span className={cn(
                                            "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border",
                                            STATUS_CONFIG[loan.status]?.color || 'bg-slate-50'
                                        )}>
                                            {STATUS_CONFIG[loan.status]?.label || loan.status}
                                        </span>
                                    </td>
                                    <td className="px-1 text-right">
                                        <button className="p-1 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-black/5">
                                            <ChevronRight className="h-4 w-4 text-notion-text-light" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Application Modal */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New Loan Application</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            {isAdmin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Applicant</label>
                                    <select
                                        name="employee"
                                        value={formData.employee}
                                        onChange={(e) => setFormData(p => ({ ...p, employee: e.target.value }))}
                                        className="input-notion bg-transparent"
                                        required
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <InputField
                                label="Principal Amount (UGX)"
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                required placeholder="e.g. 1000000"
                            />
                            <InputField
                                label="Repayment Months"
                                type="number"
                                name="repayment_period_months"
                                value={formData.repayment_period_months}
                                onChange={(e) => setFormData(p => ({ ...p, repayment_period_months: e.target.value }))}
                                required
                            />
                            <InputField
                                label="Interest Rate (%)"
                                type="number"
                                name="interest_rate"
                                value={formData.interest_rate}
                                onChange={(e) => setFormData(p => ({ ...p, interest_rate: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Purpose of Loan</label>
                            <textarea
                                name="loan_purpose"
                                value={formData.loan_purpose}
                                onChange={(e) => setFormData(p => ({ ...p, loan_purpose: e.target.value }))}
                                className="input-notion min-h-[100px] py-3 resize-none bg-transparent"
                                placeholder="Briefly describe what this loan is for..."
                                required
                            />
                        </div>

                        {formData.amount && (
                            <div className="p-6 bg-[#88B072]/5 rounded-lg border border-[#88B072]/20 border-dashed">
                                <div className="flex justify-between items-center text-[#88B072]">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Estimated Monthly Deduction</p>
                                        <p className="text-2xl font-bold mt-0.5">
                                            {formatCurrency(calculateMonthlyPayment(formData.amount, formData.interest_rate, formData.repayment_period_months))}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Repayment</p>
                                        <p className="text-sm font-bold mt-1">
                                            {formatCurrency(calculateMonthlyPayment(formData.amount, formData.interest_rate, formData.repayment_period_months) * (parseInt(formData.repayment_period_months) || 1))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6 border-t border-notion-border">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm font-medium hover:bg-notion-hover rounded">Cancel</button>
                            <button type="submit" disabled={isCreating} className="btn-notion-primary h-9 px-6 text-[11px] uppercase tracking-widest font-black">
                                {isCreating ? 'Submitting...' : 'Confirm application'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Details Modal */}
            <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Loan details</DialogTitle>
                    </DialogHeader>
                    {selectedLoan && (
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-notion-sidebar border border-notion-border flex items-center justify-center">
                                    <Calendar className="h-5 w-5 opacity-40" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold">{selectedLoan.employee_name}</p>
                                    <p className="text-xs text-notion-text-light font-medium uppercase tracking-tight">Applied on {new Date(selectedLoan.created_at || Date.now()).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-notion-text-light uppercase tracking-widest mb-1">Principal</p>
                                    <p className="text-base font-bold">{formatCurrency(selectedLoan.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-notion-text-light uppercase tracking-widest mb-1">Status</p>
                                    <span className={cn(
                                        "inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border",
                                        STATUS_CONFIG[selectedLoan.status]?.color || 'bg-slate-50'
                                    )}>
                                        {STATUS_CONFIG[selectedLoan.status]?.label || selectedLoan.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-notion-text-light uppercase tracking-widest mb-1">Repayment</p>
                                    <p className="text-sm font-medium">{formatCurrency(selectedLoan.monthly_deduction)}/mo</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-notion-text-light uppercase tracking-widest mb-1">Remaining</p>
                                    <p className="text-sm font-medium">{formatCurrency(selectedLoan.outstanding_balance)}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-notion-sidebar rounded border border-notion-border italic text-xs text-notion-text-light">
                                "{selectedLoan.loan_purpose || 'No purpose specified'}"
                            </div>

                            <div className="flex justify-end pt-4 border-t border-notion-border">
                                <button onClick={() => setSelectedLoan(null)} className="btn-notion-outline h-9 px-6 text-[11px] uppercase font-black">Close</button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const InputField = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">{label}</label>
        <input {...props} className="input-notion bg-transparent" />
    </div>
);

export default LoansPage;
