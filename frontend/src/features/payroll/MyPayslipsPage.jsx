import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Download, Eye, Calendar, DollarSign, FileText, Loader2 } from 'lucide-react';
import { useGetPayslipsQuery, useGeneratePayslipPdfMutation } from '../../store/api';
import { getMediaUrl } from '../../config/api';
import toast from 'react-hot-toast';

const MyPayslipsPage = () => {
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const { data: payslipsData, isLoading } = useGetPayslipsQuery({ my_payslips: true });
    const [generatePdf, { isLoading: isGenerating }] = useGeneratePayslipPdfMutation();

    const payslips = Array.isArray(payslipsData) ? payslipsData : (payslipsData?.results || []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const handleDownloadPdf = async (payslipId) => {
        const loadingToast = toast.loading('Generating PDF...');
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
                toast.success('Payslip PDF generated!', { id: loadingToast });
            } else {
                toast.error('PDF URL not found', { id: loadingToast });
            }
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF', { id: loadingToast });
        }
    };

    const getLatestPayslip = () => {
        if (payslips.length === 0) return null;
        return payslips.reduce((latest, current) => {
            const latestDate = new Date(latest.year, latest.month);
            const currentDate = new Date(current.year, current.month);
            return currentDate > latestDate ? current : latest;
        });
    };

    const latestPayslip = getLatestPayslip();

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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Payslips</h1>
                <p className="text-gray-600 mt-2">View and download your salary payslips</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <DollarSign className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Net Salary</p>
                                <p className="text-2xl font-black text-emerald-600 tracking-tight">
                                    {latestPayslip ? formatCurrency(latestPayslip.net_salary) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Pay Period</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {latestPayslip
                                        ? new Date(latestPayslip.year, latestPayslip.month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Payslips</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{payslips.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payslips Table */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Payslip History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {payslips.length > 0 ? (
                        <>
                            {/* Table for Desktop */}
                            <div className="hidden lg:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pay Period</TableHead>
                                            <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Gross Salary</TableHead>
                                            <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Deductions</TableHead>
                                            <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Net Salary</TableHead>
                                            <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</TableHead>
                                            <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payslips.map((payslip) => (
                                            <TableRow key={payslip.id} className="hover:bg-slate-50/50 transition-all">
                                                <TableCell className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-900">
                                                            {new Date(payslip.year, payslip.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-8 py-6 text-right font-bold text-slate-700">
                                                    {formatCurrency(payslip.gross_salary)}
                                                </TableCell>
                                                <TableCell className="px-8 py-6 text-right font-bold text-orange-600">
                                                    -{formatCurrency(payslip.total_deductions)}
                                                </TableCell>
                                                <TableCell className="px-8 py-6 text-right font-black text-emerald-600 text-lg">
                                                    {formatCurrency(payslip.net_salary)}
                                                </TableCell>
                                                <TableCell className="px-8 py-6">
                                                    <Badge className="bg-emerald-100 text-emerald-700 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                                                        {payslip.is_paid ? 'Paid' : 'Pending'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-8 py-6">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedPayslip(payslip)}
                                                            className="h-10 px-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDownloadPdf(payslip.id)}
                                                            disabled={isGenerating}
                                                            className="h-10 px-4 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-xl gap-2"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            PDF
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Cards for Mobile */}
                            <div className="lg:hidden divide-y divide-slate-100">
                                {payslips.map((payslip) => (
                                    <div key={payslip.id} className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-black text-slate-900">
                                                    {new Date(payslip.year, payslip.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                                </p>
                                                <Badge className="mt-1 bg-emerald-50 text-emerald-700 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-none">
                                                    {payslip.is_paid ? 'Paid' : 'Pending'}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-emerald-600">
                                                    {formatCurrency(payslip.net_salary)}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Net Salary</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedPayslip(payslip)}
                                                className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl"
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadPdf(payslip.id)}
                                                disabled={isGenerating}
                                                className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl border-primary-100 text-primary-600"
                                            >
                                                Download PDF
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="p-20 text-center">
                            <FileText className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No payslips available yet</p>
                            <p className="text-sm text-slate-400 mt-2">Your payslips will appear here after payroll processing</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payslip Details Modal */}
            <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
                <DialogContent className="bg-white max-w-3xl p-0 border-none shadow-2xl rounded-[2rem] overflow-hidden">
                    {selectedPayslip && (
                        <>
                            <DialogHeader className="bg-slate-50 p-8 border-b border-slate-100">
                                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                                    <FileText className="h-6 w-6 text-primary-600" />
                                    Payslip Details
                                </DialogTitle>
                                <p className="text-slate-500 text-sm mt-1">
                                    {new Date(selectedPayslip.year, selectedPayslip.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </DialogHeader>

                            <div className="p-8 space-y-8">
                                {/* Earnings Section */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Earnings</h3>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Basic Salary</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(selectedPayslip.basic_salary)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Housing Allowance</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(selectedPayslip.housing_allowance)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Transport Allowance</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(selectedPayslip.transport_allowance)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Other Allowances</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(selectedPayslip.other_allowances)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t-2 border-emerald-200">
                                            <span className="font-black text-emerald-700">Gross Salary</span>
                                            <span className="text-xl font-black text-emerald-600">{formatCurrency(selectedPayslip.gross_salary)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Deductions Section */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Deductions</h3>
                                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">PAYE Tax</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(selectedPayslip.paye_tax)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">NSSF Employee (10%)</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(selectedPayslip.nssf_employee)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Local Service Tax</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(selectedPayslip.local_service_tax)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Loan Deduction</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(selectedPayslip.loan_deduction)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t-2 border-orange-200">
                                            <span className="font-black text-orange-700">Total Deductions</span>
                                            <span className="text-xl font-black text-orange-600">{formatCurrency(selectedPayslip.total_deductions)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Net Salary */}
                                <div className="bg-primary-50 border border-primary-100 rounded-3xl p-8 text-center">
                                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Net Salary (Take Home)</p>
                                    <p className="text-4xl font-black text-primary-700 tracking-tight">{formatCurrency(selectedPayslip.net_salary)}</p>
                                </div>
                            </div>

                            <DialogFooter className="p-8 pt-0 gap-3">
                                <Button variant="outline" onClick={() => setSelectedPayslip(null)} className="rounded-xl">
                                    Close
                                </Button>
                                <Button
                                    onClick={() => handleDownloadPdf(selectedPayslip.id)}
                                    disabled={isGenerating}
                                    className="rounded-xl gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyPayslipsPage;
