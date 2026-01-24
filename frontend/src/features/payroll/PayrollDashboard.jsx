// src/features/payroll/PayrollDashboard.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Calendar, FileText, CircleAlert } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import CreatePayrollRunModal from './CreatePayrollRunModal';
import { useGetPayrollRunsQuery } from '../../store/api';
import toast from 'react-hot-toast';

const PayrollDashboard = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Use RTK Query data directly (no local state needed due to cache invalidation)
  const { data: payrollRuns = [], isLoading } = useGetPayrollRunsQuery();

  const handleCreatePayrollRun = () => setShowCreateModal(true);
  const handlePayrollCreated = () => {
    // RTK Query auto-refetches, so we just close the modal.
    // Optionally we could show a success toast here if not done in the modal.
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
    return {
      total_gross: currentPayroll.total_gross,
      total_net: currentPayroll.total_net,
      total_deductions: currentPayroll.total_deductions,
      employee_count: currentPayroll.employee_count,
      average_salary: Math.round(currentPayroll.total_net / currentPayroll.employee_count)
    };
  }, [currentPayroll]);

  const formatCurrency = (value) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

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

  return (
    <div className="space-y-6 bg-white text-black p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="mt-2 text-gray-700">Process and track salaries</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>Export</Button>
          <Button variant="primary" onClick={handleCreatePayrollRun}>New Payroll Run</Button>
        </div>
      </div>

      <Card className="bg-white border">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))} className="px-3 py-2 border rounded-lg bg-white text-black">
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2025, i).toLocaleString('en-US', { month: 'long' })}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))} className="px-3 py-2 border rounded-lg bg-white text-black">
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Employees" value={stats.employee_count} icon="Users" />
          <StatCard title="Total Gross" value={formatCurrency(stats.total_gross)} icon="DollarSign" />
          <StatCard title="Deductions" value={formatCurrency(stats.total_deductions)} icon="TrendingDown" />
          <StatCard title="Total Net" value={formatCurrency(stats.total_net)} icon="CreditCard" />
          <StatCard title="Avg Salary" value={formatCurrency(stats.average_salary)} icon="Activity" />
        </div>
      )}

      {currentPayroll ? (
        <Card className="bg-white border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary-600" />{new Date(currentPayroll.year, currentPayroll.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })} Payroll Summary</span>
              {getStatusBadge(currentPayroll.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPayroll.employee_count === 0 ? (
              <div className="py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CircleAlert className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <p className="font-bold text-slate-800 text-lg">No Financial Data Processed</p>
                <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">This payroll run was created, but no employees were included. Ensure your active employees have a <b>Salary Structure</b> configured.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(`/payroll/runs/${currentPayroll.id}`)}>
                  Go to Details & Process
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Status</p>
                  <p className="text-lg font-bold text-slate-900">{statusConfig[currentPayroll.status].label}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Processed For</p>
                  <p className="text-lg font-bold text-slate-900">{currentPayroll.employee_count} Employees</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total Gross</p>
                  <p className="text-lg font-bold text-emerald-600 font-mono tracking-tight">{formatCurrency(currentPayroll.total_gross)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total Net Layout</p>
                  <p className="text-lg font-bold text-blue-700 font-mono tracking-tight">{formatCurrency(currentPayroll.total_net)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border text-center shadow-none">
          <CardContent className="pt-16 pb-16">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">No active payroll run found</h2>
            <p className="text-slate-500 mb-8 mt-2 max-w-sm mx-auto text-lg font-medium">There is no payroll data for {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })} yet.</p>
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-10 h-14 text-lg font-bold shadow-xl shadow-slate-900/10" onClick={handleCreatePayrollRun}>
              Start Payroll for {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long' })}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary-600" />Recent Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRuns.map(run => (
                <TableRow
                  key={run.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toast(`Viewing details for ${new Date(run.year, run.month - 1).toLocaleString('en-US', { month: 'long' })}`, { icon: '📄' })}
                >
                  <TableCell>{new Date(run.year, run.month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>{getStatusBadge(run.status)}</TableCell>
                  <TableCell className="text-right">{run.employee_count}</TableCell>
                  <TableCell className="text-right font-semibold text-green-700">{formatCurrency(run.total_gross)}</TableCell>
                  <TableCell className="text-right text-orange-700">{formatCurrency(run.total_deductions)}</TableCell>
                  <TableCell className="text-right font-semibold text-blue-700">{formatCurrency(run.total_net)}</TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => navigate(`/payroll/runs/${run.id}`)}>View</Button></TableCell>
                </TableRow>
              ))}
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
