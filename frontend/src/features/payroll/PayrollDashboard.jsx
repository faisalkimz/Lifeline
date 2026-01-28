// src/features/payroll/PayrollDashboard.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Calendar, FileText, CircleAlert, Users, DollarSign, TrendingDown, CreditCard, Activity } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import CreatePayrollRunModal from './CreatePayrollRunModal';
import { useGetPayrollRunsQuery } from '../../store/api';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const PayrollDashboard = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Use RTK Query data directly (no local state needed due to cache invalidation)
  const { data: payrollRuns = [], isLoading } = useGetPayrollRunsQuery();

  const handleCreatePayrollRun = () => setShowCreateModal(true);
  const handlePayrollCreated = () => {
    // RTK Query auto-refetches, so we just close the modal.
  };

  const currentPayroll = payrollRuns.find(p => p.month === selectedMonth && p.year === selectedYear);

  const statusConfig = {
    draft: { color: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
    processing: { color: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
    approved: { color: 'bg-purple-100', text: 'text-purple-800', label: 'Approved' },
    paid: { color: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
    cancelled: { color: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
  };

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

  const formatCurrency = (value) => new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);

  const getStatusBadge = (status) => {
    const cfg = statusConfig[status] ?? { color: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
    return <Badge className={`${cfg.color} ${cfg.text}`}>{cfg.label}</Badge>;
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
    toast.success('Payroll report exported successfully');
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading Payroll Data...</div>;
  }

  return (
    <div className="space-y-6 bg-white text-black p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="mt-2 text-gray-700 font-medium">Process and track salaries for your entire organization</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="font-bold">
            Export Report
          </Button>
          <Button onClick={handleCreatePayrollRun} className="bg-slate-900 text-white font-bold px-6">
            New Payroll Run
          </Button>
        </div>
      </div>

      <Card className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-full md:w-48">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary-500/20"
              >
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2025, i).toLocaleString('en-US', { month: 'long' })}</option>)}
              </select>
            </div>

            <div className="w-full md:w-32">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary-500/20"
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="flex-1 flex justify-end">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600">Live Financial Matrix Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Employees" value={stats.employee_count} icon={Users} />
          <StatCard title="Total Gross" value={formatCurrency(stats.total_gross)} icon={DollarSign} />
          <StatCard title="Deductions" value={formatCurrency(stats.total_deductions)} icon={TrendingDown} />
          <StatCard title="Total Net" value={formatCurrency(stats.total_net)} icon={CreditCard} />
          <StatCard title="Avg Salary" value={formatCurrency(stats.average_salary)} icon={Activity} />
        </div>
      )}

      {currentPayroll ? (
        <Card className="bg-white border rounded-2xl shadow-md border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <CardTitle className="flex items-center justify-between text-xl font-black">
              <span className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                {new Date(currentPayroll.year, currentPayroll.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })} Operating Period
              </span>
              {getStatusBadge(currentPayroll.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {currentPayroll.employee_count === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 px-6">
                <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CircleAlert className="h-10 w-10 text-amber-500" />
                </div>
                <p className="font-black text-slate-900 text-2xl tracking-tight">No Financial Data Processed</p>
                <p className="text-slate-500 text-lg max-w-md mx-auto mt-4 font-medium leading-relaxed">
                  This payroll run exists, but it hasn't found any employees with a **Salary Structure**.
                  Please ensure active employees have their pay details configured in the **Salary Units** tab.
                </p>
                <div className="flex gap-4 justify-center mt-10">
                  <Button className="bg-slate-900 text-white font-bold h-12 px-8" onClick={() => navigate(`/payroll/runs/${currentPayroll.id}`)}>
                    Open Run Details
                  </Button>
                  <Button
                    variant="outline"
                    className="font-bold h-12 px-8 border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    onClick={() => setActiveTab && setActiveTab('salaries')}
                  >
                    Configure Salaries
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="p-4 rounded-xl bg-slate-50/50">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Processing Status</p>
                  <p className="text-2xl font-black text-slate-900">{statusConfig[currentPayroll.status].label}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50/50">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Participants</p>
                  <p className="text-2xl font-black text-slate-900">{currentPayroll.employee_count} Personnel</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <p className="text-xs font-black text-emerald-600/50 uppercase tracking-widest mb-2">Company Obligation</p>
                  <p className="text-2xl font-black text-emerald-700 font-mono tracking-tighter">{formatCurrency(currentPayroll.total_gross)}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <p className="text-xs font-black text-blue-600/50 uppercase tracking-widest mb-2">Net Distribution</p>
                  <p className="text-2xl font-black text-blue-700 font-mono tracking-tighter">{formatCurrency(currentPayroll.total_net)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border text-center shadow-none rounded-2xl border-slate-100">
          <CardContent className="pt-24 pb-24">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Calendar className="h-12 w-12 text-slate-300" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">No Active Payroll Matrix</h2>
            <p className="text-slate-500 mb-10 mt-4 max-w-sm mx-auto text-xl font-medium leading-relaxed">System found no financial records for {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}.</p>
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-12 h-16 text-xl font-black shadow-2xl shadow-primary-900/40 transform transition-transform hover:scale-105 active:scale-95" onClick={handleCreatePayrollRun}>
              Initialize {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long' })} Protocol
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border rounded-2xl border-slate-100 overflow-hidden shadow-sm">
        <CardHeader className="p-6 border-b border-slate-50">
          <CardTitle className="flex items-center gap-3 text-lg font-black">
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            Historical Registry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-black text-slate-900 h-14">Period</TableHead>
                <TableHead className="font-black text-slate-900">Status</TableHead>
                <TableHead className="text-right font-black text-slate-900">Units</TableHead>
                <TableHead className="text-right font-black text-slate-900">Gross Vol.</TableHead>
                <TableHead className="text-right font-black text-slate-900">Deductions</TableHead>
                <TableHead className="text-right font-black text-slate-900">Net Value</TableHead>
                <TableHead className="text-center font-black text-slate-900">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRuns.length > 0 ? payrollRuns.map(run => (
                <TableRow
                  key={run.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/payroll/runs/${run.id}`)}
                >
                  <TableCell className="font-bold text-slate-700 h-16">{new Date(run.year, run.month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>{getStatusBadge(run.status)}</TableCell>
                  <TableCell className="text-right font-bold text-slate-600">{run.employee_count}</TableCell>
                  <TableCell className="text-right font-black text-emerald-600">{formatCurrency(run.total_gross)}</TableCell>
                  <TableCell className="text-right text-rose-500 font-bold">{formatCurrency(run.total_deductions)}</TableCell>
                  <TableCell className="text-right font-black text-blue-700 bg-blue-50/20">{formatCurrency(run.total_net)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-black text-primary-600 group-hover:bg-white border border-transparent group-hover:border-slate-200 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/payroll/runs/${run.id}`);
                      }}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">No historical records available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreatePayrollRunModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handlePayrollCreated} />
    </div>
  );
};

export { PayrollDashboard };
export default PayrollDashboard;
