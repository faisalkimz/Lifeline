import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DollarSign, Users, TrendingUp, Calendar, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';


const PayrollDashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Sample payroll data - in real app would come from API
    const payrollRuns = [
        {
            id: 1,
            month: 12,
            year: 2025,
            status: 'paid',
            total_gross: 125000000,
            total_net: 98500000,
            total_deductions: 26500000,
            employee_count: 45,
            processed_at: '2025-12-01'
        },
        {
            id: 2,
            month: 11,
            year: 2025,
            status: 'approved',
            total_gross: 120000000,
            total_net: 95000000,
            total_deductions: 25000000,
            employee_count: 44,
            processed_at: '2025-11-15'
        }
    ];

    const currentPayroll = payrollRuns.find(p => p.month === selectedMonth && p.year === selectedYear);

    const statusConfig = {
        draft: { color: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
        processing: { color: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
        approved: { color: 'bg-purple-100', text: 'text-purple-700', label: 'Approved' },
        paid: { color: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
        cancelled: { color: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    };

    const stats = useMemo(() => {
        if (!currentPayroll) return null;
        return {
            total_gross: currentPayroll.total_gross,
            total_net: currentPayroll.total_net,
            total_deductions: currentPayroll.total_deductions,
            employee_count: currentPayroll.employee_count,
            average_salary: Math.round(currentPayroll.total_net / currentPayroll.employee_count),
        };
    }, [currentPayroll]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status];
        return (
            <Badge className={`${config.color} ${config.text}`}>
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
                    <p className="text-gray-600 mt-2">Process, manage, and track employee salaries</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Export</Button>
                    <Button variant="primary">New Payroll Run</Button>
                </div>
            </div>

            {/* Month/Year Selector */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(2025, i).toLocaleString('en-US', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {[2024, 2025, 2026].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        icon={<Users className="h-5 w-5" />}
                        label="Employees"
                        value={stats.employee_count}
                        trend="+2 this month"
                        color="blue"
                    />
                    <StatCard
                        icon={<DollarSign className="h-5 w-5" />}
                        label="Total Gross"
                        value={formatCurrency(stats.total_gross)}
                        color="green"
                    />
                    <StatCard
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Total Deductions"
                        value={formatCurrency(stats.total_deductions)}
                        trend={`${((stats.total_deductions / stats.total_gross) * 100).toFixed(1)}% of gross`}
                        color="orange"
                    />
                    <StatCard
                        icon={<CheckCircle className="h-5 w-5" />}
                        label="Total Net"
                        value={formatCurrency(stats.total_net)}
                        color="primary"
                    />
                    <StatCard
                        icon={<DollarSign className="h-5 w-5" />}
                        label="Avg Salary"
                        value={formatCurrency(stats.average_salary)}
                        color="purple"
                    />
                </div>
            )}

            {/* Current Payroll Status */}
            {currentPayroll ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary-600" />
                                {new Date(currentPayroll.year, currentPayroll.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })} Payroll
                            </span>
                            {getStatusBadge(currentPayroll.status)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                <p className="text-lg font-semibold text-gray-900">{statusConfig[currentPayroll.status].label}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Employees</p>
                                <p className="text-lg font-semibold text-gray-900">{currentPayroll.employee_count}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Gross</p>
                                <p className="text-lg font-semibold text-green-600">{formatCurrency(currentPayroll.total_gross)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Net</p>
                                <p className="text-lg font-semibold text-primary-600">{formatCurrency(currentPayroll.total_net)}</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                            {currentPayroll.status === 'draft' && (
                                <>
                                    <Button variant="primary">Process Payroll</Button>
                                    <Button variant="outline">Edit</Button>
                                </>
                            )}
                            {currentPayroll.status === 'processing' && (
                                <>
                                    <Button variant="primary">Approve Payroll</Button>
                                    <Button variant="outline">Review</Button>
                                </>
                            )}
                            {currentPayroll.status === 'approved' && (
                                <>
                                    <Button variant="primary">Process Payment</Button>
                                    <Button variant="outline">View Details</Button>
                                </>
                            )}
                            {['approved', 'paid'].includes(currentPayroll.status) && (
                                <>
                                    <Button variant="outline">Download Payslips</Button>
                                    <Button variant="outline">Bank File</Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 mb-4">No payroll run for {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
                        <Button variant="primary">Create Payroll Run</Button>
                    </CardContent>
                </Card>
            )}

            {/* Recent Payroll Runs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary-600" />
                        Recent Payroll Runs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Employees</TableHead>
                                <TableHead className="text-right">Total Gross</TableHead>
                                <TableHead className="text-right">Total Deductions</TableHead>
                                <TableHead className="text-right">Total Net</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payrollRuns.map((run) => (
                                <TableRow key={run.id}>
                                    <TableCell className="font-medium">
                                        {new Date(run.year, run.month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(run.status)}
                                    </TableCell>
                                    <TableCell className="text-right">{run.employee_count}</TableCell>
                                    <TableCell className="text-right text-green-600 font-semibold">
                                        {formatCurrency(run.total_gross)}
                                    </TableCell>
                                    <TableCell className="text-right text-orange-600">
                                        {formatCurrency(run.total_deductions)}
                                    </TableCell>
                                    <TableCell className="text-right text-primary-600 font-semibold">
                                        {formatCurrency(run.total_net)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export { PayrollDashboard };
export default PayrollDashboard;
