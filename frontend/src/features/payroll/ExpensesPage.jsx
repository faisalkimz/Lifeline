import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Plus, Eye, CheckCircle, XCircle, DollarSign, Calendar, FileText } from 'lucide-react';

const ExpensesPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        category: 'travel',
        date_incurred: new Date().toISOString().split('T')[0],
        receipts: []
    });

    // Mock expense data
    const expenses = [
        {
            id: 1,
            title: 'Team Building Lunch',
            description: 'Lunch for team building event at local restaurant',
            amount: 250000,
            category: 'meals',
            date_incurred: '2025-12-15',
            status: 'approved',
            submitted_date: '2025-12-16',
            approved_date: '2025-12-16'
        },
        {
            id: 2,
            title: 'Office Supplies',
            description: 'Stationery and office supplies for Q4',
            amount: 150000,
            category: 'supplies',
            date_incurred: '2025-12-10',
            status: 'pending',
            submitted_date: '2025-12-14'
        },
        {
            id: 3,
            title: 'Conference Registration',
            description: 'Tech conference registration and travel',
            amount: 750000,
            category: 'training',
            date_incurred: '2025-11-20',
            status: 'rejected',
            submitted_date: '2025-11-25',
            rejection_reason: 'Budget limit exceeded'
        }
    ];

    const categories = [
        { value: 'travel', label: 'Travel & Transport' },
        { value: 'meals', label: 'Meals & Entertainment' },
        { value: 'supplies', label: 'Office Supplies' },
        { value: 'training', label: 'Training & Development' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'other', label: 'Other' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would submit to API
        console.log('Submitting expense:', formData);
        setShowForm(false);
        setFormData({
            title: '',
            description: '',
            amount: '',
            category: 'travel',
            date_incurred: new Date().toISOString().split('T')[0],
            receipts: []
        });
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
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const ExpenseDetailsModal = ({ expense, onClose }) => {
        if (!expense) return null;

        return (
            <Dialog open={!!expense} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
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
                                <p className="text-lg font-semibold">{expense.title}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Amount</label>
                                <p className="text-lg font-semibold text-green-600">{formatCurrency(expense.amount)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Category</label>
                                <p className="capitalize">{expense.category.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <Badge className={getStatusColor(expense.status)}>
                                    {expense.status}
                                </Badge>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Date Incurred</label>
                                <p>{new Date(expense.date_incurred).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Submitted</label>
                                <p>{new Date(expense.submitted_date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600">Description</label>
                            <p className="mt-1">{expense.description}</p>
                        </div>

                        {expense.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-medium text-red-800 mb-2">Rejection Reason</h4>
                                <p className="text-red-700">{expense.rejection_reason}</p>
                            </div>
                        )}

                        {expense.approved_date && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-700">
                                    ✅ Approved on {new Date(expense.approved_date).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Expenses</p>
                                <p className="text-2xl font-bold">{formatCurrency(1150000)}</p>
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
                                <p className="text-2xl font-bold text-green-600">1</p>
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
                                <p className="text-2xl font-bold text-yellow-600">1</p>
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
                                <p className="text-2xl font-bold text-red-600">1</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses Table */}
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
                            {expenses.map((expense) => (
                                <TableRow key={expense.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{expense.title}</TableCell>
                                    <TableCell className="capitalize">{expense.category.replace('_', ' ')}</TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">
                                        {formatCurrency(expense.amount)}
                                    </TableCell>
                                    <TableCell>{new Date(expense.date_incurred).toLocaleDateString()}</TableCell>
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Submit Expense Modal */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Submit New Expense</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Title *</label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Brief expense title"
                                    required
                                />
                            </div>
                            <div>
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

                        <div>
                            <label className="text-sm font-medium">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Date Incurred *</label>
                            <Input
                                name="date_incurred"
                                type="date"
                                value={formData.date_incurred}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border rounded-md"
                                placeholder="Detailed description of the expense"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Submit Expense
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Expense Details Modal */}
            <ExpenseDetailsModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
        </div>
    );
};

export default ExpensesPage;
