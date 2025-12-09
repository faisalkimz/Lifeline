// src/features/loans/LoanManagementPage.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import {
  useGetEmployeesQuery,
  useGetSalaryAdvancesQuery,
  useCreateSalaryAdvanceMutation,
  useUpdateSalaryAdvanceMutation
} from '../../store/api';

const LoanManagementPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    amount: '',
    loan_type: 'salary_advance',
    loan_purpose: '',
    repayment_period_months: '1'
  });

  // Fetch employees and loans
  const { data: employees = [], isLoading: employeesLoading } = useGetEmployeesQuery();
  const { data: loans = [], isLoading: loansLoading, refetch } = useGetSalaryAdvancesQuery();

  // Mutations
  const [createLoan, { isLoading: creating }] = useCreateSalaryAdvanceMutation();
  const [updateLoan] = useUpdateSalaryAdvanceMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateMonthlyDeduction = () => {
    const amount = parseFloat(formData.amount) || 0;
    const months = parseInt(formData.repayment_period_months) || 1;
    return amount / months;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLoan({
        employee: parseInt(formData.employee, 10),
        amount: parseFloat(formData.amount),
        loan_type: formData.loan_type,
        loan_purpose: formData.loan_purpose || null,
        repayment_period_months: parseInt(formData.repayment_period_months)
      }).unwrap();

      setShowForm(false);
      resetForm();
      refetch(); // Refresh list
    } catch (err) {
      console.error('Failed to create loan:', err);
      alert('Failed to create loan request. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      amount: '',
      loan_type: 'salary_advance',
      loan_purpose: '',
      repayment_period_months: '1'
    });
  };

  const handleStatusChange = async (loanId, newStatus) => {
    try {
      await updateLoan({ id: loanId, status: newStatus }).unwrap();
      refetch();
    } catch (err) {
      alert('Failed to update loan status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'yellow',
      approved: 'blue',
      active: 'green',
      completed: 'indigo',
      cancelled: 'gray',
      defaulted: 'red'
    };
    return <Badge variant={colors[status] || 'gray'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getLoanTypeBadge = (type) => {
    const labels = {
      salary_advance: 'Salary Advance',
      personal_loan: 'Personal Loan',
      emergency_loan: 'Emergency Loan',
      other: 'Other'
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Filter only active employees
  const activeEmployees = employees.filter(emp => 
    emp.employment_status?.toLowerCase() === 'active'
  );

  if (employeesLoading || loansLoading) {
    return <div className="flex justify-center items-center h-64">Loading loans and employees...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600 mt-1">Manage employee loans and salary advances</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
          New Loan Request
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Loans</p>
            <p className="text-3xl font-bold text-gray-900">{loans.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-600">
              {loans.filter(l => l.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Active Loans</p>
            <p className="text-3xl font-bold text-green-600">
              {loans.filter(l => l.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(loans.filter(l => ['active', 'pending'].includes(l.status))
                .reduce((sum, l) => sum + (parseFloat(l.balance) || 0), 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Monthly Deduction</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">
                    {loan.employee_name || loan.employee?.full_name}
                    <br />
                    <span className="text-sm text-gray-500">
                      {loan.employee_number || loan.employee?.employee_number}
                    </span>
                  </TableCell>
                  <TableCell>{getLoanTypeBadge(loan.loan_type)}</TableCell>
                  <TableCell>{formatCurrency(loan.amount)}</TableCell>
                  <TableCell>{formatCurrency(loan.balance)}</TableCell>
                  <TableCell>{formatCurrency(loan.monthly_deduction)}</TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {loan.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(loan.id, 'active')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(loan.id, 'cancelled')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {['active', 'completed'].includes(loan.status) && (
                        <Badge variant="outline">No Action</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {loans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No loan requests yet. Create the first one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Loan Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl bg-white text-gray-900 !rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Loan Request</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Employee</label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="">Select Employee</option>
                  {activeEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Loan Type</label>
                <select
                  name="loan_type"
                  value={formData.loan_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="salary_advance">Salary Advance</option>
                  <option value="personal_loan">Personal Loan</option>
                  <option value="emergency_loan">Emergency Loan</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Loan Amount (UGX)</label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Repayment Period (Months)</label>
                <Input
                  type="number"
                  name="repayment_period_months"
                  value={formData.repayment_period_months}
                  onChange={handleInputChange}
                  min="1"
                  max="24"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Monthly Deduction:</span>
                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(calculateMonthlyDeduction())}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Purpose (Optional)</label>
              <textarea
                name="loan_purpose"
                value={formData.loan_purpose}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="Briefly describe the purpose..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700">
                {creating ? 'Creating...' : 'Create Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanManagementPage;