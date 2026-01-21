import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import {
    Download, Eye, Mail, DollarSign, User, Calendar,
    Loader2, TrendingUp, ShieldCheck, FileText,
    Search, Filter, ChevronRight, MoreHorizontal
} from 'lucide-react';
import { useGetPayslipsQuery, useGeneratePayslipPdfMutation, useEmailPayslipMutation } from '../../store/api';
import { getMediaUrl } from '../../config/api';
import toast from 'react-hot-toast';

const PayslipPage = () => {
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [searchQuery, setSearchQuery] = useState('');

    const { data: payslipsData, isLoading } = useGetPayslipsQuery({
        month: filterMonth,
        year: filterYear
    });

    const [generatePdf, { isLoading: isGenerating }] = useGeneratePayslipPdfMutation();
    const [emailPayslip, { isLoading: isEmailing }] = useEmailPayslipMutation();

    const payslips = Array.isArray(payslipsData) ? payslipsData : (payslipsData?.results || []);

    const filteredPayslips = useMemo(() => {
        if (!searchQuery) return payslips;
        return payslips.filter(p =>
            (p.employee_name || p.employee?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.employee_number || p.employee?.employee_id || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [payslips, searchQuery]);

    const stats = useMemo(() => {
        if (!payslips.length) return { totalGross: 0, totalNet: 0, avgNet: 0 };
        const totalGross = payslips.reduce((acc, p) => acc + Number(p.gross_salary || 0), 0);
        const totalNet = payslips.reduce((acc, p) => acc + Number(p.net_salary || 0), 0);
        return {
            totalGross,
            totalNet,
            avgNet: totalNet / payslips.length
        };
    }, [payslips]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const handleDownloadPdf = async (payslipId) => {
        const loadingToast = toast.loading('Generating secure PDF document...');
        try {
            const result = await generatePdf(payslipId).unwrap();
            if (result?.pdf_url) {
                const url = getMediaUrl(result.pdf_url);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Payslip-${payslipId}.pdf`);
                link.setAttribute('target', '_blank');
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Document ready for download', { id: loadingToast });
            } else {
                toast.error('Failed to locate PDF asset', { id: loadingToast });
            }
        } catch (error) {
            toast.error('PDF generation interrupted', { id: loadingToast });
        }
    };

    const handleEmailPayslip = async (payslipId) => {
        const loadingToast = toast.loading('Dispatching encrypted payslip...');
        try {
            await emailPayslip(payslipId).unwrap();
            toast.success('Email dispatched successfully!', { id: loadingToast });
        } catch (error) {
            const errorMsg = error?.data?.error || 'Email dispatch failed';
            toast.error(errorMsg, { id: loadingToast });
        }
    };

    const PayslipModal = ({ payslip, onClose }) => {
        if (!payslip) return null;

        return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in zoom-in duration-300">
                <Card className="w-full max-w-4xl max-h-[92vh] overflow-hidden bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[2.5rem] border-none flex flex-col">
                    {/* Premium Modal Header */}
                    <CardHeader className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 p-8 sm:p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner">
                                    <FileText className="h-8 w-8 text-primary-300" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight leading-none">Employee Payslip</h2>
                                    <p className="text-primary-200/70 font-medium text-sm mt-2 flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(payslip.year, payslip.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
                            >
                                <span className="text-3xl">&times;</span>
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-8 sm:p-10 space-y-10">
                            {/* Employee Identity Card */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-6 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                    <div className="h-20 w-20 rounded-full border-4 border-white overflow-hidden shadow-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-black">
                                        {(payslip.employee_name || payslip.employee?.full_name || '??').split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated Employee</p>
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                                            {payslip.employee_name || payslip.employee?.full_name}
                                        </h3>
                                        <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                            ID: {payslip.employee_number || payslip.employee?.employee_id || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-8 bg-primary-50/50 rounded-[2rem] border border-primary-100/50 flex flex-col justify-center">
                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-2">Verified Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${payslip.payment_status === 'paid' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}></div>
                                        <span className={`text-xl font-black ${payslip.payment_status === 'paid' ? 'text-emerald-700' : 'text-orange-700'} capitalize`}>
                                            {payslip.payment_status || (payslip.is_paid ? 'Paid' : 'Pending')}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 mt-2 italic">Ref: LIF-{payslip.id}</p>
                                </div>
                            </div>

                            {/* Financial Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Earnings Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-100 rounded-lg"><DollarSign className="h-3 w-3" /></div>
                                            Earnings & Benefits
                                        </h4>
                                    </div>
                                    <div className="p-8 bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50 space-y-4 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <TrendingUp className="h-16 w-16 text-emerald-600" />
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Standard Basic Salary</span>
                                            <span className="text-slate-900 font-bold">{formatCurrency(payslip.basic_salary)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Housing & Utility Allow.</span>
                                            <span className="text-slate-900 font-bold">{formatCurrency((payslip.housing_allowance || 0) + (payslip.lunch_allowance || 0))}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Mobility & Transport</span>
                                            <span className="text-slate-900 font-bold">{formatCurrency(payslip.transport_allowance || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Other Tactical Allowances</span>
                                            <span className="text-slate-900 font-bold">{formatCurrency((payslip.medical_allowance || 0) + (payslip.other_allowances || 0))}</span>
                                        </div>
                                        <div className="pt-5 border-t-2 border-dashed border-emerald-200 mt-2 flex justify-between items-center">
                                            <span className="text-sm font-black text-emerald-700">Gross Remuneration</span>
                                            <span className="text-2xl font-black text-emerald-600">{formatCurrency(payslip.gross_salary)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Deductions Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                            <div className="p-1.5 bg-orange-100 rounded-lg">< ShieldCheck className="h-3 w-3" /></div>
                                            Compliance & Deductions
                                        </h4>
                                    </div>
                                    <div className="p-8 bg-orange-50/30 rounded-[2rem] border border-orange-100/50 space-y-4 relative overflow-hidden group">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">PAYE Statutory Tax</span>
                                            <span className="text-slate-900 font-bold">{formatCurrency(payslip.paye_tax)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">NSSF Pension (Employee 5%)</span>
                                            <span className="text-slate-900 font-bold">{formatCurrency(payslip.nssf_employee)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Financial Obligations / Loans</span>
                                            <span className="text-slate-900 font-bold">{formatCurrency((payslip.loan_deduction || 0) + (payslip.advance_deduction || 0))}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Internal Surcharges / Misc</span>
                                            <span className="text-slate-900 font-bold">{formatCurrency(payslip.other_deductions || 0)}</span>
                                        </div>
                                        <div className="pt-5 border-t-2 border-dashed border-orange-200 mt-2 flex justify-between items-center">
                                            <span className="text-sm font-black text-orange-700">Total Retentions</span>
                                            <span className="text-2xl font-black text-orange-600">{formatCurrency(payslip.total_deductions)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Signature Area (Visual) */}
                            <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <div className="h-24 w-24 bg-white p-2 rounded-2xl shadow-inner border border-slate-100 flex items-center justify-center shrink-0">
                                    {/* Placeholder for Verifier QR */}
                                    <div className="w-full h-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1">
                                        <div className="w-8 h-8 opacity-10"><DollarSign /></div>
                                        <span className="text-[6px] font-bold text-slate-300">SCANNABLE QR</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Digital Signature Hash</p>
                                    <p className="text-[8px] font-mono text-slate-400 break-all leading-tight">
                                        LIF-SEC-PAY-{payslip.id}-882XJ-7721-AA92-1102-LL-KIMZ-PLATINUM
                                    </p>
                                    <p className="text-xs font-medium text-slate-600 mt-3">
                                        This document is electronically verified and does not require a physical signature for validity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    {/* Premium Modal Footer */}
                    <div className="p-8 sm:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex flex-col">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Net Disbursement</p>
                            <p className="text-4xl font-black text-primary-600 tracking-tight leading-none">{formatCurrency(payslip.net_salary)}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => handleDownloadPdf(payslip.id)}
                                disabled={isGenerating}
                                className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 gap-3 font-bold text-base shadow-xl shadow-slate-200 transition-all active:scale-95 group"
                            >
                                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />}
                                Export PDF
                            </Button>
                            <Button
                                onClick={() => handleEmailPayslip(payslip.id)}
                                disabled={isEmailing}
                                variant="outline"
                                className="h-14 px-8 rounded-2xl border-2 border-slate-200 hover:border-primary-500 hover:bg-white text-slate-700 hover:text-primary-700 gap-3 font-bold text-base transition-all active:scale-95 group"
                            >
                                {isEmailing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5 group-hover:rotate-12 transition-transform" />}
                                Send Email
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Payslip Audit</h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">Centralized monitoring and dispatch of organizational pay records.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 pr-5">
                        <div className="flex items-center gap-2 pl-3 border-r border-slate-100 pr-5">
                            <Calendar className="h-5 w-5 text-primary-500" />
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                                className="text-sm font-black text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer appearance-none pr-6"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(2025, i).toLocaleString('en-US', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 pl-3">
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                                className="text-sm font-black text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer appearance-none pr-6"
                            >
                                {[2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group hover:border-emerald-200 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Monthly Gross Liability</p>
                        <h4 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{formatCurrency(stats.totalGross)}</h4>
                    </div>
                </div>

                <div className="p-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group hover:border-primary-200 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Net Disbursement</p>
                        <h4 className="text-2xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{formatCurrency(stats.totalNet)}</h4>
                    </div>
                </div>

                <div className="p-8 bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-300 relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-white/5 rounded-full"></div>
                    <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 text-primary-300 flex items-center justify-center mb-5">
                            <Users className="h-6 w-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">Average Employee Net</p>
                        <h4 className="text-2xl font-black text-white">{formatCurrency(stats.avgNet)}</h4>
                    </div>
                </div>
            </div>

            {/* Table Control Bar */}
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search employee by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/30 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-200 transition-all text-sm font-medium"
                    />
                </div>
                <div className="hidden lg:flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Quick Filter:</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none rounded-xl px-4 py-2 cursor-pointer hover:bg-emerald-200 transition-colors">Paid</Badge>
                    <Badge className="bg-slate-100 text-slate-500 border-none rounded-xl px-4 py-2 cursor-pointer hover:bg-slate-200 transition-colors">Pending</Badge>
                </div>
            </div>

            {/* Main Data Table */}
            <Card className="border-none shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                            Transactional History Logs
                        </CardTitle>
                        <div className="text-[10px] font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100">
                            Showing {filteredPayslips.length} Records
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto overflow-y-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30">
                                    <TableHead className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Personnel Identity</TableHead>
                                    <TableHead className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] text-right">Gross</TableHead>
                                    <TableHead className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] text-right">Deductions</TableHead>
                                    <TableHead className="px-10 py-6 text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] text-right">Net Salary</TableHead>
                                    <TableHead className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] text-center">Status</TableHead>
                                    <TableHead className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-96 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative">
                                                    <Loader2 className="h-16 w-16 animate-spin text-primary-500/20" />
                                                    <Loader2 className="h-16 w-16 animate-spin text-primary-500 absolute top-0 left-0 [animation-delay:0.2s]" />
                                                </div>
                                                <div className="mt-4">
                                                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing Database Assets</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1">Please keep this window active...</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPayslips.length > 0 ? (
                                    filteredPayslips.map((payslip) => (
                                        <TableRow key={payslip.id} className="group hover:bg-primary-50/30 transition-all duration-300 border-b border-slate-50 last:border-none">
                                            <TableCell className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-14 w-14 rounded-[1.25rem] bg-slate-900 text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl group-hover:shadow-slate-900/30">
                                                        <User className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-base text-slate-900 font-black group-hover:text-primary-600 transition-colors">{payslip.employee_name || payslip.employee?.full_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-100 group-hover:border-primary-100 transition-colors">
                                                                {payslip.employee_number || payslip.employee?.employee_id || 'N/A'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{payslip.department || payslip.employee?.department_name || 'Corporate'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-10 py-8 text-right font-bold text-slate-600">
                                                {formatCurrency(payslip.gross_salary)}
                                            </TableCell>
                                            <TableCell className="px-10 py-8 text-right font-bold text-orange-500">
                                                -{formatCurrency(payslip.total_deductions)}
                                            </TableCell>
                                            <TableCell className="px-10 py-8 text-right font-black text-emerald-600 text-xl group-hover:scale-105 transition-transform duration-300">
                                                {formatCurrency(payslip.net_salary)}
                                            </TableCell>
                                            <TableCell className="px-10 py-8 text-center">
                                                <Badge className={`${payslip.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-orange-50 text-orange-600 ring-1 ring-orange-100'} border-none rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                                                    {payslip.payment_status || (payslip.is_paid ? 'Paid' : 'Pending')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-10 py-8">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedPayslip(payslip)}
                                                        className="h-12 w-12 rounded-2xl text-slate-400 hover:text-primary-600 hover:bg-white shadow-none hover:shadow-xl transition-all"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadPdf(payslip.id)}
                                                        disabled={isGenerating}
                                                        className="h-12 w-12 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-white shadow-none hover:shadow-xl transition-all"
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEmailPayslip(payslip.id)}
                                                        disabled={isEmailing}
                                                        className="h-12 w-12 rounded-2xl text-slate-400 hover:text-primary-600 hover:bg-white shadow-none hover:shadow-xl transition-all"
                                                    >
                                                        <Mail className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                                <div className="group-hover:hidden flex justify-end">
                                                    <MoreHorizontal className="h-5 w-5 text-slate-300" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-96 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center group shadow-inner">
                                                    <FileText className="h-10 w-10 text-slate-200 group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="max-w-[280px]">
                                                    <p className="text-lg font-black text-slate-900 uppercase tracking-widest">Archive Vault Empty</p>
                                                    <p className="text-sm text-slate-400 mt-2 font-medium">No transactional payslip records found for the selected criteria. Try adjusting your temporal filters.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Payslip Modal Overlay */}
            <PayslipModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />

            {/* Custom Scrollbar Styles */}
            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export { PayslipPage };
export default PayslipPage;
