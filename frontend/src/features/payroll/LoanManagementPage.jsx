import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Card, CardHeader, CardTitle, CardContent
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import {
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter
} from '../../components/ui/Dialog';
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

  const currentUserCompanyId = useSelector(state => state.auth.user?.company?.id);

  const { data: employees = [], isLoading: employeesLoading } = useGetEmployeesQuery();
  const { data: loans = [], isLoading: loansLoading, refetch } = useGetSalaryAdvancesQuery();

  const [createLoan, { isLoading: creating }] = useCreateSalaryAdvanceMutation();
  const [updateLoan] = useUpdateSalaryAdvanceMutation();

  const activeEmployees = employees.filter(emp =>
    emp.employment_status?.toLowerCase() === 'active' &&
    emp.company?.id === currentUserCompanyId
  );

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
      setFormData({
        employee: '', amount: '', loan_type: 'salary_advance',
        loan_purpose: '', repayment_period_months: '1'
      });
      refetch();
    } catch (err) {
      alert(err?.data?.detail || 'Failed to create loan. Please try again.');
    }
  };

  const handleStatusChange = async (loanId, newStatus) => {
    try {
      await updateLoan({ id: loanId, status: newStatus }).unwrap();
      refetch();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = { pending: 'yellow', active: 'blue', completed: 'indigo', cancelled: 'gray', defaulted: 'red' };
    return <Badge variant={colors[status] || 'gray'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getLoanTypeBadge = (type) => {
    const labels = { salary_advance: 'Salary Advance', personal_loan: 'Personal Loan', emergency_loan: 'Emergency Loan', other: 'Other' };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(num);
  };

  const outstandingAmount = loans
    .filter(l => ['active', 'pending'].includes(l.status))
    .reduce((sum, l) => sum + (parseFloat(l.balance) || 0), 0);

  if (employeesLoading || loansLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-xl text-gray-600">Loading loans and employees...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ACTIONS */}
      <div className="flex justify-end items-center mb-6">
        <Button
          onClick={() => setShowForm(true)}
          className="bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
        >
          + Create Loan
        </Button>
      </div>

      {/* SUMMARY CARDS — SMALLER DEFAULT SIZE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Loans", value: loans.length, color: "text-gray-900" },
          { label: "Pending", value: loans.filter(l => l.status === 'pending').length, color: "text-yellow-600" },
          { label: "Active", value: loans.filter(l => l.status === 'active').length, color: "text-blue-600" },
          { label: "Outstanding", value: formatCurrency(outstandingAmount), color: "text-red-600" }
        ].map((stat, i) => (
          <Card
            key={i}
            className="bg-white rounded-xl shadow border p-4"
          >
            <CardContent className="text-center p-4">
              <p className="text-sm text-gray-500 uppercase">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABLE */}
      <Card className="bg-white rounded-xl shadow border">
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-xl font-semibold">All Loan Requests</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableCell className="font-semibold text-gray-700">Employee</TableCell>
                <TableCell className="font-semibold text-gray-700">Type</TableCell>
                <TableCell className="font-semibold text-gray-700">Amount</TableCell>
                <TableCell className="font-semibold text-gray-700">Balance</TableCell>
                <TableCell className="font-semibold text-gray-700">Monthly</TableCell>
                <TableCell className="font-semibold text-gray-700">Status</TableCell>
                <TableCell className="font-semibold text-gray-700">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No loan requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                loans.map(loan => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      {loan.employee_name || loan.employee?.full_name}
                      <br />
                      <span className="text-gray-500 text-sm">
                        {loan.employee_number || loan.employee?.employee_number}
                      </span>
                    </TableCell>

                    <TableCell>{getLoanTypeBadge(loan.loan_type)}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {formatCurrency(loan.balance)}
                    </TableCell>
                    <TableCell className="text-blue-700 font-semibold">
                      {formatCurrency(loan.monthly_deduction)}
                    </TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>

                    <TableCell>
                      {loan.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(loan.id, "active")}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(loan.id, "cancelled")}
                            className="border-red-600 text-red-600 px-4 py-2 rounded-lg"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* WHITE LOAN MODAL — FIXED TITLE + FULL WHITE BACKGROUND */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="max-w-4xl w-full mx-4 rounded-2xl border border-gray-200 shadow-xl 
               p-0 bg-white !bg-white [&>*]:bg-white"
          style={{ maxHeight: "90vh", backgroundColor: "white" }}
        >
          {/* HEADER — pure white */}
          <div
            className="px-10 py-8 border-b border-gray-200"
            style={{ background: "white" }}
          >
            <p className="text-2xl font-semibold text-gray-600">
              Create New Loan Request
            </p>

            <p className="text-gray-600 mt-2 text-base">
              Fill in the details below
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="px-10 py-8 space-y-7 overflow-y-auto bg-white"
            style={{ maxHeight: "calc(90vh - 200px)" }}
          >
            {/* Employee + Loan Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Employee */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Employee
                </label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-xl bg-white text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Employee</option>
                  {activeEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Loan Type
                </label>
                <select
                  name="loan_type"
                  value={formData.loan_type}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-xl bg-white text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="salary_advance">Salary Advance</option>
                  <option value="personal_loan">Personal Loan</option>
                  <option value="emergency_loan">Emergency Loan</option>
                  <option value="other">Other</option>
                </select>
              </div>

            </div>

            {/* Amount + Repayment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Loan Amount (UGX)
                </label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="500000"
                  min="1000"
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Repayment Period (Months)
                </label>
                <Input
                  type="number"
                  name="repayment_period_months"
                  value={formData.repayment_period_months}
                  onChange={handleInputChange}
                  min="1"
                  max="24"
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            {/* Monthly Deduction Box */}
            <div className="bg-white border border-blue-300 rounded-2xl p-8 text-center shadow-sm">
              <p className="text-lg font-medium text-gray-700 mb-2">Monthly Deduction</p>
              <p className="text-4xl font-bold text-blue-700">
                {formatCurrency(calculateMonthlyDeduction())}
              </p>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Purpose (Optional)
              </label>
              <textarea
                name="loan_purpose"
                value={formData.loan_purpose}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-5 py-4 border border-gray-300 rounded-xl bg-white text-gray-900 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Briefly describe the purpose..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="px-8 py-3.5 border-gray-300 text-gray-700 hover:bg-gray-100 
                     rounded-xl font-medium"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={creating || !formData.employee || !formData.amount}
                className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white 
                     font-medium rounded-xl shadow-md disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default LoanManagementPage;
