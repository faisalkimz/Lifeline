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

  const { data: payrollRuns = [], isLoading } = useGetPayrollRunsQuery();

  const handleCreatePayrollRun = () => setShowCreateModal(true);
  const handlePayrollCreated = () => { };

  const currentPayroll = payrollRuns.find(p => p.month === selectedMonth && p.year === selectedYear);

  const statusConfig = {
    draft: { color: 'bg-slate-100', text: 'text-slate-600', label: 'DRAFT' },
    processing: { color: 'bg-blue-50', text: 'text-blue-600', label: 'PROCESSING' },
    approved: { color: 'bg-amber-50', text: 'text-amber-600', label: 'APPROVED' },
    paid: { color: 'bg-emerald-50', text: 'text-emerald-600', label: 'PAID' },
    cancelled: { color: 'bg-rose-50', text: 'text-rose-600', label: 'CANCELLED' },
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
    const cfg = statusConfig[status] ?? { color: 'bg-slate-100', text: 'text-slate-600', label: status?.toUpperCase() || 'UNKNOWN' };
    return <Badge className={`${cfg.color} ${cfg.text} px-2 py-0.5 rounded text-[10px] font-bold border-none`}>{cfg.label}</Badge>;
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-1/3 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-500 text-sm mt-1">Process and track organization-wide compensation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-slate-200">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleCreatePayrollRun} className="bg-[#88B072] hover:bg-[#7aa265] text-white font-semibold h-10 px-4 rounded text-xs uppercase tracking-wider">
            New Payroll Run
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="h-10 px-3 rounded border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-[#88B072] outline-none cursor-pointer min-w-[140px]"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2025, i).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="h-10 px-3 rounded border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-[#88B072] outline-none cursor-pointer min-w-[100px]"
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="hidden md:flex flex-1 justify-end items-center gap-2">
              <Activity className="h-4 w-4 text-[#88B072]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time sync active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Staff" value={stats.employee_count} icon={Users} />
          <StatCard title="Gross Total" value={formatCurrency(stats.total_gross)} icon={DollarSign} />
          <StatCard title="Deductions" value={formatCurrency(stats.total_deductions)} icon={TrendingDown} />
          <StatCard title="Net Payable" value={formatCurrency(stats.total_net)} icon={CreditCard} />
          <StatCard title="Avg. Pay" value={formatCurrency(stats.average_salary)} icon={Activity} />
        </div>
      )}

      {currentPayroll ? (
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-[#88B072]" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {new Date(currentPayroll.year, currentPayroll.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })} Run
                </h3>
              </div>
              {getStatusBadge(currentPayroll.status)}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {currentPayroll.employee_count === 0 ? (
              <div className="py-12 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center text-center px-6">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <CircleAlert className="h-6 w-6 text-[#88B072]" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">No Employee Data Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mb-8">
                  This payroll run exists but no staff salary structures were processed.
                  Make sure employees have active salary units configured.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => navigate(`/payroll/runs/${currentPayroll.id}`)} className="bg-slate-900 text-white text-[10px] font-bold uppercase h-9 px-4">
                    View Run Details
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab?.('salaries')} className="text-[10px] font-bold uppercase h-9 px-4 border-slate-200">
                    Setup Salaries
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-lg font-bold text-slate-800 uppercase">{currentPayroll.status}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employees</p>
                  <p className="text-lg font-bold text-slate-800">{currentPayroll.employee_count}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company Cost</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(currentPayroll.total_gross)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Distribution</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(currentPayroll.total_net)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="py-24 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-slate-200" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Records Found</h2>
            <p className="text-sm text-slate-500 mt-2 mb-8 max-w-xs">
              System found no records for {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
            <Button onClick={handleCreatePayrollRun} className="bg-[#88B072] hover:bg-[#7aa265] text-white font-semibold h-12 px-8 rounded text-xs uppercase tracking-wider">
              Initialize {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long' })} Run
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Payroll History</h3>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest h-12">Period</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Units</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Gross</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Net</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.length > 0 ? payrollRuns.map(run => (
                  <TableRow
                    key={run.id}
                    className="border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/payroll/runs/${run.id}`)}
                  >
                    <TableCell className="text-xs font-bold text-slate-700 uppercase h-14">
                      {new Date(run.year, run.month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(run.status)}</TableCell>
                    <TableCell className="text-right text-xs font-semibold text-slate-600">{run.employee_count}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-emerald-600">{formatCurrency(run.total_gross)}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-blue-600 bg-blue-50/20">{formatCurrency(run.total_net)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider text-[#88B072] hover:bg-white hover:text-[#7aa265] border border-transparent hover:border-slate-100"
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
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-xs font-medium uppercase tracking-widest">No history available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreatePayrollRunModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handlePayrollCreated} />
    </div>
  );
};

export { PayrollDashboard };
export default PayrollDashboard;
