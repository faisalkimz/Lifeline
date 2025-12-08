import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { api } from '../../store/api';

const LoanManagementPage = () => {
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    loan_amount: '',
    loan_type: 'salary_advance',
    loan_purpose: '',
    repayment_period_months: '1'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansResponse, employeesResponse] = await Promise.all([
        api.get('/loans/'),
        api.get('/employees/')
      ]);
      setLoans(loansResponse.data);
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateMonthlyDeduction = () => {
    const amount = parseFloat(formData.loan_amount) || 0;
    const months = parseInt(formData.repayment_period_months) || 1;
    return amount / months;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        loan_amount: parseFloat(formData.loan_amount),
        repayment_period_months: parseInt(formData.repayment_period_months),
      };

      await api.post('/loans/', data);
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating loan:', error);
      alert('Error creating loan');
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      loan_amount: '',
      loan_type: 'salary_advance',
      loan_purpose: '',
      repayment_period_months: '1'
    });
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await api.post(`/loans/${loanId}/approve_loan/`);
      fetchData();
    } catch (error) {
      console.error('Error approving loan:', error);
      alert('Error approving loan');
    }
  };

  const handleRejectLoan = async (loanId) => {
    try {
      await api.post(`/loans/${loanId}/reject_loan/`);
      fetchData();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      alert('Error rejecting loan');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'yellow',
      active: 'green',
      completed: 'blue',
      defaulted: 'red',
      cancelled: 'gray'
    };

    return (
      <Badge variant={statusColors[status] || 'gray'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getLoanTypeBadge = (loanType) => {
    const typeLabels = {
      salary_advance: 'Salary Advance',
      personal_loan: 'Personal Loan',
      emergency_loan: 'Emergency Loan',
      other: 'Other'
    };

    return (
      <Badge variant="outline">
        {typeLabels[loanType] || loanType}
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

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.full_name : 'Unknown';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600 mt-1">Manage employee loans and salary advances</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          New Loan Request
        </Button>
      </div>

      {/* Loan Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Loans</p>
                <p className="text-3xl font-bold text-gray-900">{loans.length}</p>
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
                  {loans.filter(loan => loan.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-3xl font-bold text-green-600">
                  {loans.filter(loan => loan.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(
                    loans
                      .filter(loan => loan.status === 'active')
                      .reduce((sum, loan) => sum + loan.balance, 0)
                  )}
                </p>
              </div>
            </div>
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
                <TableCell>Loan Type</TableCell>
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
                    {loan.employee_name}
                    <br />
                    <span className="text-sm text-gray-500">{loan.employee_number}</span>
                  </TableCell>
                  <TableCell>{getLoanTypeBadge(loan.loan_type)}</TableCell>
                  <TableCell>{formatCurrency(loan.loan_amount)}</TableCell>
                  <TableCell>{formatCurrency(loan.balance)}</TableCell>
                  <TableCell>{formatCurrency(loan.monthly_deduction)}</TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {loan.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveLoan(loan.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRejectLoan(loan.id)}
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {loan.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // TODO: View loan details
                            alert('Loan details view coming soon!');
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Loan Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Loan</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees
                    .filter(emp => emp.employment_status === 'active')
                    .map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.employee_number} - {employee.full_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Type
                </label>
                <select
                  name="loan_type"
                  value={formData.loan_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="salary_advance">Salary Advance</option>
                  <option value="personal_loan">Personal Loan</option>
                  <option value="emergency_loan">Emergency Loan</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount (UGX)
                </label>
                <Input
                  type="number"
                  name="loan_amount"
                  value={formData.loan_amount}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repayment Period (Months)
                </label>
                <Input
                  type="number"
                  name="repayment_period_months"
                  value={formData.repayment_period_months}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                  max="24"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Monthly Deduction:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(calculateMonthlyDeduction())}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Purpose
              </label>
              <textarea
                name="loan_purpose"
                value={formData.loan_purpose}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the purpose of this loan..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Loan Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanManagementPage;
