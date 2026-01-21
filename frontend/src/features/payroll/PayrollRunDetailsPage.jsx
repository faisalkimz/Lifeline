import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetPayrollRunQuery,
    useGetPayslipsQuery,
    useUpdatePayslipMutation,
    useProcessPayrollMutation,
    useApprovePayrollMutation,
    useMarkPayrollPaidMutation,
    useGeneratePayslipPdfMutation
} from '../../store/api';
import { getMediaUrl } from '../../config/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Save, X, Edit2, Loader2, CheckCircle, Upload, DownloadCloud, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

const PayrollRunDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});

    // Fetch Run Details
    const { data: run, isLoading: isLoadingRun } = useGetPayrollRunQuery(id);

    // Fetch Payslips (Handle Pagination)
    const { data: payslipsData, isLoading: isLoadingPayslips } = useGetPayslipsQuery({ payroll_run: id });
    const payslips = payslipsData?.results || [];

    const [updatePayslip, { isLoading: isUpdating }] = useUpdatePayslipMutation();
    const [processPayroll, { isLoading: isProcessing }] = useProcessPayrollMutation();
    const [approvePayroll, { isLoading: isApproving }] = useApprovePayrollMutation();
    const [markPaid, { isLoading: isPaying }] = useMarkPayrollPaidMutation();
    const [generatePayslipPdf, { isLoading: isGeneratingPdf }] = useGeneratePayslipPdfMutation();

    // Helper functions
    const formatCurrency = (val) => new Intl.NumberFormat('en-UG', {
        style: 'currency', currency: 'UGX', minimumFractionDigits: 0
    }).format(Number(val) || 0);

    const getStatusBadge = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            processing: 'bg-blue-100 text-blue-800',
            approved: 'bg-purple-100 text-purple-800',
            paid: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return <Badge className={colors[status] || 'bg-gray-100'}>{status}</Badge>;
    };

    // Actions
    const handleEdit = (payslip) => {
        setEditingId(payslip.id);
        setEditValues({
            bonus: payslip.bonus,
            other_deductions: payslip.other_deductions,
            loan_deduction: payslip.loan_deduction,
            advance_deduction: payslip.advance_deduction
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleSave = async (id) => {
        try {
            await updatePayslip({
                id,
                bonus: parseFloat(editValues.bonus) || 0,
                other_deductions: parseFloat(editValues.other_deductions) || 0,
                loan_deduction: parseFloat(editValues.loan_deduction) || 0,
                advance_deduction: parseFloat(editValues.advance_deduction) || 0
            }).unwrap();

            toast.success('Payslip updated');
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update payslip', error);
            toast.error('Failed to update payslip');
        }
    };

    const handleProcess = async () => {
        try {
            await processPayroll(id).unwrap();
            toast.success('Payroll processed successfully');
        } catch (error) {
            toast.error('Processing failed');
        }
    };

    const handleApprove = async () => {
        try {
            await approvePayroll(id).unwrap();
            toast.success('Payroll approved');
        } catch (error) {
            toast.error('Approve failed');
        }
    };
    const handleMarkPaid = async () => {
        try {
            await markPaid(id).unwrap();
            toast.success('Payroll marked as paid');
        } catch (error) {
            toast.error('Mark paid failed');
        }
    };

    const handleDownloadPayslip = async (payslipId) => {
        const loadingToast = toast.loading('Generating PDF...');
        try {
            const result = await generatePayslipPdf(payslipId).unwrap();
            if (result?.pdf_url) {
                const url = getMediaUrl(result.pdf_url);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Payslip-${payslipId}.pdf`);
                link.setAttribute('target', '_blank');
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Payslip generated', { id: loadingToast });
            } else {
                toast.error('PDF URL not found', { id: loadingToast });
            }
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate payslip', { id: loadingToast });
        }
    };

    const handleDownloadAll = async () => {
        toast.loading('Generating all payslips... This may take a moment', { duration: 3000 });
        for (const p of payslips) {
            try {
                const result = await generatePayslipPdf(p.id).unwrap();
                // To avoid browser blocking popups, we might want to do this differently for bulk, 
                // but for now, we open them or provide a zip if backend supported it.
                // Since backend doesn't support zip yet, we do them one by one (limited)
                if (payslips.length <= 5) {
                    window.open(getMediaUrl(result.pdf_url), '_blank');
                }
            } catch (e) {
                console.error(e);
            }
        }
        if (payslips.length > 5) {
            toast.success('Payslips generated on server. You can download them individually.');
        } else {
            toast.success('Processing complete');
        }
    };

    const handleExportTaxReport = () => {
        if (!payslips || payslips.length === 0) {
            toast.error("No transactional data available for export");
            return;
        }

        // Generate CSV for Uganda Statutory Returns (PAYE & NSSF)
        const headers = ["Employee Name", "TIN", "Gross Salary", "PAYE Tax", "NSSF Employee (5%)", "NSSF Employer (10%)", "Total NSSF (15%)", "Net Pay"];
        const rows = payslips.map(p => [
            p.employee_name,
            p.tin || "N/A",
            p.gross_salary,
            p.paye_tax,
            p.nssf_employee || (p.gross_salary * 0.05),
            p.nssf_employer || (p.gross_salary * 0.10),
            (Number(p.nssf_employee) || (p.gross_salary * 0.05)) + (Number(p.nssf_employer) || (p.gross_salary * 0.10)),
            p.net_salary
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Lifeline_Tax_Report_${run.year}_${run.month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Statutory Compliance Matrix generated");
    };

    if (isLoadingRun || isLoadingPayslips) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!run) return <div>Payroll Run not found.</div>;

    const isEditable = run.status === 'draft' || run.status === 'processing';

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Payroll Run: {new Date(run.year, run.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(run.status)}
                            <span className="text-slate-500 text-sm">{payslips.length} Employees</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {run.status === 'draft' && (
                        <Button onClick={handleProcess} disabled={isProcessing} className="bg-blue-600 text-white hover:bg-blue-700">
                            {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            Process Payroll
                        </Button>
                    )}
                    {run.status === 'processing' && (
                        <Button onClick={handleApprove} disabled={isApproving} className="bg-purple-600 text-white hover:bg-purple-700">
                            {isApproving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Approve
                        </Button>
                    )}
                    {run.status === 'approved' && (
                        <Button onClick={handleMarkPaid} disabled={isPaying} className="bg-green-600 text-white hover:bg-green-700">
                            {isPaying ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Mark Paid
                        </Button>
                    )}
                    <Button
                        onClick={handleDownloadAll}
                        variant="outline"
                        className="border-slate-200 text-blue-600 hover:bg-blue-50 font-bold"
                        disabled={payslips.length === 0 || isGeneratingPdf}
                    >
                        {isGeneratingPdf ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <DownloadCloud className="h-4 w-4 mr-2" />}
                        Download All
                    </Button>
                    <Button
                        onClick={handleExportTaxReport}
                        variant="outline"
                        className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                        disabled={payslips.length === 0}
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export Tax Matrix
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-slate-500">Total Gross</p>
                        <p className="text-2xl font-bold">{formatCurrency(run.total_gross)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-slate-500">Total Deductions</p>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(run.total_deductions)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-slate-500">Total Net Pay</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(run.total_net)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Payslips</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead className="text-right">Basic</TableHead>
                                <TableHead className="text-right">Allowances</TableHead>
                                <TableHead className="text-right w-32">Bonus</TableHead>
                                <TableHead className="text-right w-32">Other Ded.</TableHead>
                                <TableHead className="text-right">Gross</TableHead>
                                <TableHead className="text-right">PAYE</TableHead>
                                <TableHead className="text-right">NSSF</TableHead>
                                <TableHead className="text-right font-bold">Net Pay</TableHead>
                                <TableHead className="text-center">PDF</TableHead>
                                {isEditable && <TableHead className="text-center">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payslips.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                                        No payslips found. Payroll might be in Draft state without saved items.
                                        Click 'Process Payroll' to generate payslips.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payslips.map((payslip) => (
                                    <TableRow key={payslip.id}>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{payslip.employee_name}</div>
                                            <div className="text-xs text-slate-500">{payslip.department}</div>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-600">{formatCurrency(payslip.basic_salary)}</TableCell>
                                        <TableCell className="text-right text-slate-600">{formatCurrency(payslip.total_allowances)}</TableCell>

                                        {/* Editable Columns */}
                                        <TableCell className="text-right">
                                            {editingId === payslip.id ? (
                                                <Input
                                                    type="number"
                                                    value={editValues.bonus}
                                                    onChange={(e) => setEditValues({ ...editValues, bonus: e.target.value })}
                                                    className="w-24 h-8 text-right p-1"
                                                />
                                            ) : (
                                                <span className={payslip.bonus > 0 ? "text-green-600 font-medium" : "text-slate-400"}>
                                                    {formatCurrency(payslip.bonus)}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {editingId === payslip.id ? (
                                                <Input
                                                    type="number"
                                                    value={editValues.other_deductions}
                                                    onChange={(e) => setEditValues({ ...editValues, other_deductions: e.target.value })}
                                                    className="w-24 h-8 text-right p-1"
                                                />
                                            ) : (
                                                <span className={payslip.other_deductions > 0 ? "text-red-600 font-medium" : "text-slate-400"}>
                                                    {formatCurrency(payslip.other_deductions)}
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right font-medium">{formatCurrency(payslip.gross_salary)}</TableCell>
                                        <TableCell className="text-right text-slate-500">{formatCurrency(payslip.paye_tax)}</TableCell>
                                        <TableCell className="text-right text-slate-500">{formatCurrency(Number(payslip.nssf_employee) + Number(payslip.nssf_employer))}</TableCell>
                                        <TableCell className="text-right font-bold text-blue-700 text-lg">{formatCurrency(payslip.net_salary)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-primary-600 hover:bg-primary-50"
                                                onClick={() => handleDownloadPayslip(payslip.id)}
                                            >
                                                <DownloadCloud className="h-4 w-4" />
                                            </Button>
                                        </TableCell>

                                        {isEditable && (
                                            <TableCell className="text-center">
                                                {editingId === payslip.id ? (
                                                    <div className="flex justify-center gap-1">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleSave(payslip.id)}>
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={handleCancel}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(payslip)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default PayrollRunDetailsPage;
