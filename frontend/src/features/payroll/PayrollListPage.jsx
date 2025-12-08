import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { api } from '../../store/api';

const PayrollListPage = () => {
  const dispatch = useDispatch();
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState(null);

  useEffect(() => {
    fetchPayrollRuns();
  }, []);

  const fetchPayrollRuns = async () => {
    try {
      const response = await api.get('/payroll-runs/');
      setPayrollRuns(response.data);
    } catch (error) {
      console.error('Error fetching payroll runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'gray',
      processing: 'yellow',
      approved: 'blue',
      paid: 'green',
      cancelled: 'red'
    };

    return (
      <Badge variant={statusColors[status] || 'gray'}>
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
      await api.post(`/payroll-runs/${payrollRun.id}/process_payroll/`);
      fetchPayrollRuns(); // Refresh the list
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Error processing payroll');
    }
  };

  const handleApprovePayroll = async (payrollRun) => {
    try {
      await api.post(`/payroll-runs/${payrollRun.id}/approve_payroll/`);
      fetchPayrollRuns(); // Refresh the list
    } catch (error) {
      console.error('Error approving payroll:', error);
      alert('Error approving payroll');
    }
  };

  const handleMarkPaid = async (payrollRun) => {
    try {
      await api.post(`/payroll-runs/${payrollRun.id}/mark_paid/`);
      fetchPayrollRuns(); // Refresh the list
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      alert('Error marking payroll as paid');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">Manage monthly payroll processing and employee payments</p>
        </div>
        <Button
          onClick={() => {
            // TODO: Open create payroll run modal
            alert('Create new payroll run functionality coming soon!');
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          New Payroll Run
        </Button>
      </div>

      {/* Payroll Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payroll Runs</p>
                <p className="text-3xl font-bold text-gray-900">{payrollRuns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {payrollRuns.filter(run => run.status === 'processing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-blue-600">
                  {payrollRuns.filter(run => run.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-3xl font-bold text-green-600">
                  {payrollRuns.filter(run => run.status === 'paid').length}
                </p>
              </div>
            </div>
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
              {payrollRuns.map((run) => (
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
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Process
                        </Button>
                      )}
                      {run.status === 'processing' && (
                        <Button
                          size="sm"
                          onClick={() => handleApprovePayroll(run)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                      )}
                      {run.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(run)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRun(run)}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payroll Run Details Modal would go here */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
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
            {/* Details content would go here */}
            <div className="text-center py-8">
              <p className="text-gray-600">Detailed payroll information coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollListPage;
