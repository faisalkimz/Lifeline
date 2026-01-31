import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import {
  Calendar, FileText, CircleAlert, Users, DollarSign,
  TrendingDown, CreditCard, Activity, Search,
  Download, Mail, Eye, Loader2, ChevronRight,
  Filter, TrendingUp, ShieldCheck
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import CreatePayrollRunModal from './CreatePayrollRunModal';
import {
  useGetPayrollRunsQuery,
  useGetPayslipsQuery,
  useGeneratePayslipPdfMutation,
  useEmailPayslipMutation
} from '../../store/api';
import { getMediaUrl } from '../../config/api';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const PayrollDashboard = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('runs'); // 'runs' or 'payslips'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [payslipSearch, setPayslipSearch] = useState('');

  // 1. Queries
  const { data: payrollRuns = [], isLoading: isLoadingRuns } = useGetPayrollRunsQuery();
  const { data: payslipsData, isLoading: isLoadingPayslips } = useGetPayslipsQuery({
    month: selectedMonth,
    year: selectedYear
  });

  const [generatePdf, { isLoading: isGenerating }] = useGeneratePayslipPdfMutation();
  const [emailPayslip, { isLoading: isEmailing }] = useEmailPayslipMutation();

  // 2. Computed
  const currentPayroll = payrollRuns.find(p => p.month === selectedMonth && p.year === selectedYear);
  const payslips = Array.isArray(payslipsData) ? payslipsData : (payslipsData?.results || []);

  const filteredPayslips = useMemo(() => {
    if (!payslipSearch) return payslips;
    return payslips.filter(p =>
      (p.employee_name || p.employee?.full_name || '').toLowerCase().includes(payslipSearch.toLowerCase()) ||
      (p.employee_number || p.employee?.employee_id || '').toLowerCase().includes(payslipSearch.toLowerCase())
    );
  }, [payslips, payslipSearch]);

  const stats = useMemo(() => {
    if (!currentPayroll) return null;
    const empCount = currentPayroll.employee_count || 0;
    const netTotal = parseFloat(currentPayroll.total_net) || 0;

    return {
      total_gross: currentPayroll.total_gross || 0,
      total_net: netTotal,
      total_deductions: currentPayroll.total_deductions || 0,
      employee_count: empCount,
      average_salary: empCount > 0 ? Math.round(netTotal / empCount) : 0
    };
  }, [currentPayroll]);

  const statusConfig = {
    draft: { color: 'bg-slate-100', text: 'text-slate-600', label: 'DRAFT' },
    processing: { color: 'bg-blue-50', text: 'text-blue-600', label: 'PROCESSING' },
    approved: { color: 'bg-amber-50', text: 'text-amber-600', label: 'APPROVED' },
    paid: { color: 'bg-emerald-50', text: 'text-emerald-600', label: 'PAID' },
    cancelled: { color: 'bg-rose-50', text: 'text-rose-600', label: 'CANCELLED' },
  };

  // 3. Handlers
  const formatCurrency = (value) => new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);

  const getStatusBadge = (status) => {
    const cfg = statusConfig[status] ?? { color: 'bg-slate-100', text: 'text-slate-600', label: status?.toUpperCase() || 'UNKNOWN' };
    return <Badge className={`${cfg.color} ${cfg.text} px-2 py-0.5 rounded text-[10px] font-bold border-none`}>{cfg.label}</Badge>;
  };

  const handleDownloadPdf = async (payslipId) => {
    const loadingToast = toast.loading('Generating secure PDF...');
    try {
      const result = await generatePdf(payslipId).unwrap();
      if (result?.pdf_url) {
        const url = getMediaUrl(result.pdf_url);
        window.open(url, '_blank');
        toast.success('Document ready', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to generate PDF', { id: loadingToast });
    }
  };

  const handleEmailPayslip = async (payslipId) => {
    const loadingToast = toast.loading('Sending payslip email...');
    try {
      await emailPayslip(payslipId).unwrap();
      toast.success('Email sent', { id: loadingToast });
    } catch (error) {
      toast.error('Failed to send email', { id: loadingToast });
    }
  };

  const handleExport = () => {
    if (!currentPayroll) return toast.error('No payroll data to export for this period');
    const headers = ['Period', 'Status', 'Total Employees', 'Total Gross', 'Total Deductions', 'Total Net'];
    const row = [
      `${new Date(currentPayroll.year, currentPayroll.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
      currentPayroll.status,
      currentPayroll.employee_count,
      currentPayroll.total_gross,
      currentPayroll.total_deductions,
      currentPayroll.total_net
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payroll_export_${currentPayroll.year}_${currentPayroll.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payroll report exported');
  };

  if (isLoadingRuns) {
    return <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-slate-300" /></div>;
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      {/* Top Navigation / Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Payroll Period</label>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(2025, i).toLocaleString('en-US', { month: 'long' })}</option>
                ))}
              </select>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleExport} className="h-10 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg">
            <FileText className="h-4 w-4 mr-2" />
            Export Sheet
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="h-10 px-6 bg-[#88B072] text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#7aa265] transition-all">
            Initialize Run
          </Button>
        </div>
      </div>

      {/* Run Summary / Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <StatCard title="Headcount" value={stats.employee_count} icon={Users} />
          <StatCard title="Total Gross" value={formatCurrency(stats.total_gross)} icon={DollarSign} />
          <StatCard title="Net Payable" value={formatCurrency(stats.total_net)} icon={CreditCard} />
          <StatCard title="Retentions" value={formatCurrency(stats.total_deductions)} icon={TrendingDown} />
          <StatCard title="Avg Pay" value={formatCurrency(stats.average_salary)} icon={Activity} />
        </div>
      )}

      {/* Monthly Status Card */}
      {currentPayroll ? (
        <div className="p-8 bg-notion-sidebar border border-notion-border rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <DollarSign className="h-32 w-32" />
          </div>
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-slate-800">
                  {new Date(currentPayroll.year, currentPayroll.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })} Run
                </h3>
                {getStatusBadge(currentPayroll.status)}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Last updated on {new Date(currentPayroll.updated_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Run Total</p>
                <p className="text-lg font-bold text-indigo-600">{formatCurrency(currentPayroll.total_net)}</p>
              </div>
              <Button
                onClick={() => navigate(`/payroll/runs/${currentPayroll.id}`)}
                className="h-11 px-8 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all"
              >
                Manage Run Results
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-slate-200" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 italic">No cycle initiated for this period</h4>
          <p className="text-sm text-slate-500 mt-1 mb-6">Initialize a new payroll run to start processing salaries.</p>
          <Button onClick={() => setShowCreateModal(true)} variant="outline" className="border-slate-200 text-[11px] font-bold uppercase h-10 px-6">
            Open Creation Wizard
          </Button>
        </div>
      )}

      {/* Main Tabs for History/Payslips */}
      <div className="space-y-6">
        <div className="flex items-center gap-8 border-b border-notion-border pb-px">
          <button
            onClick={() => setActiveView('runs')}
            className={cn(
              "pb-3 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeView === 'runs' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Cycle History
            {activeView === 'runs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
          </button>
          <button
            onClick={() => setActiveView('payslips')}
            className={cn(
              "pb-3 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeView === 'payslips' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Individual Payslips
            {activeView === 'payslips' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
          </button>
        </div>

        {activeView === 'runs' ? (
          <div className="bg-white border border-notion-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-notion-sidebar border-b border-notion-border">
                <TableRow>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase h-12">Run Period</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-bold text-slate-500 uppercase">Members</TableHead>
                  <TableHead className="text-right text-[10px] font-bold text-slate-500 uppercase">Gross Pay</TableHead>
                  <TableHead className="text-right text-[10px] font-bold text-slate-500 uppercase">Net Payable</TableHead>
                  <TableHead className="text-center text-[10px] font-bold text-slate-500 uppercase">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400 text-xs italic">No prior records found</TableCell></TableRow>
                ) : (
                  payrollRuns.map((run) => (
                    <TableRow key={run.id} className="group hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/payroll/runs/${run.id}`)}>
                      <TableCell className="font-bold text-xs uppercase text-slate-800">
                        {new Date(run.year, run.month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-slate-600">{run.employee_count}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-slate-700">{formatCurrency(run.total_gross)}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-[#88B072]">{formatCurrency(run.total_net)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search by member name or staff number..."
                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                value={payslipSearch}
                onChange={(e) => setPayslipSearch(e.target.value)}
              />
            </div>

            <div className="bg-white border border-notion-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-notion-sidebar border-b border-notion-border">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase h-12">Staff Member</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500 uppercase">Gross Pay</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500 uppercase">Retentions</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500 uppercase">Net Pay</TableHead>
                    <TableHead className="text-center text-[10px] font-bold text-slate-500 uppercase">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPayslips ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin h-5 w-5 mx-auto text-slate-300" /></TableCell></TableRow>
                  ) : filteredPayslips.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400 text-xs italic">No matched payslips for this period</TableCell></TableRow>
                  ) : (
                    filteredPayslips.map((payslip) => (
                      <TableRow key={payslip.id} className="group hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                              {payslip.employee_name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{payslip.employee_name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">#{payslip.employee_number}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold text-slate-600">{formatCurrency(payslip.gross_salary)}</TableCell>
                        <TableCell className="text-right text-xs font-bold text-orange-500">-{formatCurrency(payslip.total_deductions)}</TableCell>
                        <TableCell className="text-right text-xs font-black text-indigo-600">{formatCurrency(payslip.net_salary)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button onClick={() => handleDownloadPdf(payslip.id)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button onClick={() => handleEmailPayslip(payslip.id)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                              <Mail className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <CreatePayrollRunModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={() => { }} />
    </div>
  );
};

export { PayrollDashboard };
export default PayrollDashboard;
