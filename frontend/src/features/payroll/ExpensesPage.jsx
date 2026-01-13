import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Plus, Eye, CheckCircle, XCircle, DollarSign, Calendar, FileText, Loader2, Clock } from 'lucide-react';
import { useGetExpenseClaimsQuery, useGetExpenseCategoriesQuery, useCreateExpenseClaimMutation } from '../../store/api';
import toast from 'react-hot-toast';

const ExpensesPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const { data: claims, isLoading: claimsLoading } = useGetExpenseClaimsQuery();
    const { data: categoriesData } = useGetExpenseCategoriesQuery();
    const [createClaim, { isLoading: isCreating }] = useCreateExpenseClaimMutation();

    const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.results || []);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        category: '',
        expense_date: new Date().toISOString().split('T')[0],
    });

    const expenses = claims?.results || claims || [];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createClaim(formData).unwrap();
            toast.success('Expense claim submitted!');
            setShowForm(false);
            setFormData({
                title: '',
                description: '',
                amount: '',
                category: '',
                expense_date: new Date().toISOString().split('T')[0],
            });
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to submit expense');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'submitted':
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const stats = {
        total: expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        approved: expenses.filter(e => e.status === 'approved').length,
        pending: expenses.filter(e => e.status === 'submitted' || e.status === 'pending').length,
        rejected: expenses.filter(e => e.status === 'rejected').length
    };

    if (claimsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
                    <p className="text-gray-600 mt-2">Submit and track your expense claims</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Submit Expense
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Expenses</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.total)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.length > 0 ? expenses.map((expense) => (
                                <TableRow key={expense.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{expense.title}</TableCell>
                                    <TableCell className="capitalize">{expense.category_name || 'N/A'}</TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">
                                        {formatCurrency(expense.amount)}
                                    </TableCell>
                                    <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(expense.status)}>
                                            {expense.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedExpense(expense)}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                        No expense claims found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                        <DialogTitle>Submit New Expense</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Title *</label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Brief expense title"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Amount (UGX) *</label>
                                <Input
                                    name="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-slate-200 rounded-md bg-white outline-none focus:ring-2 focus:ring-primary-500/20"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Date Incurred *</label>
                            <Input
                                name="expense_date"
                                type="date"
                                value={formData.expense_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border border-slate-200 rounded-md bg-white outline-none focus:ring-2 focus:ring-primary-500/20"
                                placeholder="Detailed description of the expense"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? 'Submitting...' : 'Submit Expense'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {selectedExpense && (
                <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
                    <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Expense Details
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Title</label>
                                    <p className="text-lg font-semibold">{selectedExpense.title}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Amount</label>
                                    <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedExpense.amount)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Category</label>
                                    <p>{selectedExpense.category_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <Badge className={getStatusColor(selectedExpense.status)}>
                                        {selectedExpense.status}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Date Incurred</label>
                                    <p>{new Date(selectedExpense.expense_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Submitted At</label>
                                    <p>{new Date(selectedExpense.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Description</label>
                                <p className="mt-1">{selectedExpense.description || 'No description provided.'}</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedExpense(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default ExpensesPage;
