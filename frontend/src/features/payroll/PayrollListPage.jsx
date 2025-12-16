import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import {
  useGetPayrollRunsQuery,
  useProcessPayrollMutation,
  useApprovePayrollMutation,
  useMarkPayrollPaidMutation
} from '../../store/api';
import CreatePayrollRunModal from './CreatePayrollRunModal';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PayrollListPage = () => {
  const navigate = useNavigate();
  const [selectedRun, setSelectedRun] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: payrollRuns = [], isLoading } = useGetPayrollRunsQuery();
  const [processPayroll, { isLoading: isProcessing }] = useProcessPayrollMutation();
  const [approvePayroll, { isLoading: isApproving }] = useApprovePayrollMutation();
  const [markPaid, { isLoading: isPaying }] = useMarkPayrollPaidMutation();

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      processing: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleProcessPayroll = async (payrollRun) => {
    try {
      await processPayroll(payrollRun.id).unwrap();
      toast.success('Payroll processed successfully');
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast.error('Error processing payroll');
    }
  };

  const handleApprovePayroll = async (payrollRun) => {
    try {
      await approvePayroll(payrollRun.id).unwrap();
      toast.success('Payroll approved successfully');
    } catch (error) {
      console.error('Error approving payroll:', error);
      toast.error('Error approving payroll');
    }
  };

  const handleMarkPaid = async (payrollRun) => {
    try {
      await markPaid(payrollRun.id).unwrap();
      toast.success('Payroll marked as paid');
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      toast.error('Error marking payroll as paid');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-600 mt-1">Manage monthly payroll processing and employee payments</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          New Payroll Run
        </Button>
      </div>

      {/* Payroll Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">Total Payroll Runs</p>
            <p className="text-3xl font-bold text-slate-900">{payrollRuns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-600">
              {payrollRuns.filter(run => run.status === 'processing').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">Approved</p>
            <p className="text-3xl font-bold text-blue-600">
              {payrollRuns.filter(run => run.status === 'approved').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">Paid</p>
            <p className="text-3xl font-bold text-green-600">
              {payrollRuns.filter(run => run.status === 'paid').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Employees</TableCell>
                <TableCell>Total Gross</TableCell>
                <TableCell>Total Net</TableCell>
                <TableCell>Processed By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRuns.length > 0 ? (
                payrollRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">
                      {run.month.toString().padStart(2, '0')}/{run.year}
                    </TableCell>
                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                    <TableCell>{run.employee_count || 0}</TableCell>
                    <TableCell>{formatCurrency(run.total_gross || 0)}</TableCell>
                    <TableCell>{formatCurrency(run.total_net || 0)}</TableCell>
                    <TableCell>{run.processed_by_name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {run.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessPayroll(run)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Processing...' : 'Process'}
                          </Button>
                        )}
                        {run.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprovePayroll(run)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isApproving}
                          >
                            Approve
                          </Button>
                        )}
                        {run.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(run)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={isPaying}
                          >
                            Mark Paid
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/payroll/runs/${run.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No payroll runs found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payroll Run Details Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Payroll Details - {selectedRun.month.toString().padStart(2, '0')}/{selectedRun.year}
              </h2>
              <Button
                variant="outline"
                onClick={() => setSelectedRun(null)}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Total Deductions</p>
                <p className="text-xl font-bold">{formatCurrency(selectedRun.total_deductions)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">PAYE Tax</p>
                <p className="text-xl font-bold">{formatCurrency(selectedRun.total_paye)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">NSSF Total</p>
                <p className="text-xl font-bold">{formatCurrency(parseFloat(selectedRun.total_nssf_employee) + parseFloat(selectedRun.total_nssf_employer))}</p>
              </div>
            </div>

            <div className="text-center py-8 border-t border-slate-100">
              <p className="text-slate-500">Payslip details view coming soon...</p>
            </div>
          </div>
        </div>
      )}

      <CreatePayrollRunModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      // No onSuccess needed as RTK Query auto-refetches due to tags
      />
    </div>
  );
};

export default PayrollListPage;








