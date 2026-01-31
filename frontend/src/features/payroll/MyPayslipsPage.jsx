import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Download, Eye, Calendar, DollarSign, FileText, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react';
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
                toast.success('Downloaded', { id: loadingToast });
            } else {
                toast.error('URL error', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Failed to generate', { id: loadingToast });
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
                <Loader2 className="h-6 w-6 animate-spin opacity-20" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Minimal Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Finance</h1>
                <p className="text-notion-text-light">Overview of your salary history and tax documents.</p>
            </div>

            {/* Flat Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg border border-notion-border space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-notion-text-light uppercase tracking-wider">Latest Net Salary</span>
                        <DollarSign className="h-4 w-4 text-notion-text-light opacity-60" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">
                        {latestPayslip ? formatCurrency(latestPayslip.net_salary) : '0'}
                    </h3>
                </div>

                <div className="p-6 rounded-lg border border-notion-border space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-notion-text-light uppercase tracking-wider">Pay Period</span>
                        <Calendar className="h-4 w-4 text-notion-text-light opacity-60" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">
                        {latestPayslip
                            ? new Date(latestPayslip.year, latestPayslip.month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
                            : 'N/A'
                        }
                    </h3>
                </div>

                <div className="p-6 rounded-lg border border-notion-border space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-notion-text-light uppercase tracking-wider">Statements</span>
                        <FileText className="h-4 w-4 text-notion-text-light opacity-60" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">{payslips.length}</h3>
                </div>
            </div>

            {/* Payslips Table Section */}
            <div className="space-y-6">
                <h3 className="text-sm font-semibold text-notion-text-light uppercase tracking-wider border-b border-notion-border pb-2">Payslip history</h3>

                {payslips.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-notion-border">
                                    <th className="px-4 py-3 text-[11px] font-bold text-notion-text-light uppercase tracking-widest">Pay Period</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-notion-text-light uppercase tracking-widest text-right">Gross</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-notion-text-light uppercase tracking-widest text-right">Deductions</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-notion-text-light uppercase tracking-widest text-right">Net Take Home</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-notion-text-light uppercase tracking-widest">Status</th>
                                    <th className="px-1 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-notion-border">
                                {payslips.map((payslip) => (
                                    <tr key={payslip.id} className="group hover:bg-notion-hover/40 transition-colors">
                                        <td className="px-4 py-5 font-semibold text-sm">
                                            {new Date(payslip.year, payslip.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-5 text-right text-xs font-medium text-notion-text-light">
                                            {formatCurrency(payslip.gross_salary)}
                                        </td>
                                        <td className="px-4 py-5 text-right text-xs font-medium text-orange-600/80">
                                            -{formatCurrency(payslip.total_deductions)}
                                        </td>
                                        <td className="px-4 py-5 text-right font-bold text-sm">
                                            {formatCurrency(payslip.net_salary)}
                                        </td>
                                        <td className="px-4 py-5">
                                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                {payslip.is_paid ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-1 py-5 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => setSelectedPayslip(payslip)}
                                                    className="p-1.5 hover:bg-notion-hover rounded text-xs font-bold text-notion-text"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPdf(payslip.id)}
                                                    disabled={isGenerating}
                                                    className="p-1.5 hover:bg-notion-hover rounded text-xs font-bold text-notion-primary"
                                                >
                                                    PDF
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24 text-center border-2 border-dashed border-notion-border rounded-lg opacity-40">
                        <FileText className="h-8 w-8 mx-auto mb-3 stroke-1" />
                        <p className="text-xs font-medium uppercase tracking-widest">No statements available</p>
                    </div>
                )}
            </div>

            {/* Payslip Details Modal */}
            <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
                <DialogContent className="max-w-2xl">
                    {selectedPayslip && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Payslip Breakdown</DialogTitle>
                            </DialogHeader>

                            <div className="p-8 space-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-notion-text-light uppercase tracking-widest">Earnings</h3>
                                    <div className="space-y-3 border-l border-notion-border pl-6">
                                        <DetailRow label="Basic Salary" value={formatCurrency(selectedPayslip.basic_salary)} />
                                        <DetailRow label="Housing Allowance" value={formatCurrency(selectedPayslip.housing_allowance)} />
                                        <DetailRow label="Transport" value={formatCurrency(selectedPayslip.transport_allowance)} />
                                        <div className="pt-3 border-t border-notion-border flex justify-between font-bold text-sm">
                                            <span>GROSS PAY</span>
                                            <span>{formatCurrency(selectedPayslip.gross_salary)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-notion-text-light uppercase tracking-widest">Deductions</h3>
                                    <div className="space-y-3 border-l border-notion-border pl-6">
                                        <DetailRow label="PAYE Tax" value={formatCurrency(selectedPayslip.paye_tax)} />
                                        <DetailRow label="NSSF (10%)" value={formatCurrency(selectedPayslip.nssf_employee)} />
                                        <DetailRow label="Local Service Tax" value={formatCurrency(selectedPayslip.local_service_tax)} />
                                        <div className="pt-3 border-t border-notion-border flex justify-between font-bold text-sm text-orange-600">
                                            <span>TOTAL DEDUCT</span>
                                            <span>-{formatCurrency(selectedPayslip.total_deductions)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-notion-sidebar rounded-lg text-center border border-notion-border">
                                    <p className="text-[11px] font-bold text-notion-text-light uppercase tracking-widest mb-1">Net Take Home</p>
                                    <p className="text-4xl font-black">{formatCurrency(selectedPayslip.net_salary)}</p>
                                </div>
                            </div>

                            <DialogFooter className="p-8 pt-0 border-t border-notion-border">
                                <Button
                                    onClick={() => handleDownloadPdf(selectedPayslip.id)}
                                    disabled={isGenerating}
                                    className="btn-notion-primary h-10 w-full"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF statement
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-notion-text-light">{label}</span>
        <span className="font-medium">{value}</span>
    </div>
);

export default MyPayslipsPage;
