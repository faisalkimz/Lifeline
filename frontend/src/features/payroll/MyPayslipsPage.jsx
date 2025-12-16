import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Download, Eye, Calendar, DollarSign } from 'lucide-react';

const MyPayslipsPage = () => {
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    // Mock employee's payslips data
    const payslips = [
        {
            id: 1,
            month: 12,
            year: 2025,
            basic_salary: 3000000,
            allowances: 1000000,
            gross_salary: 4000000,
            paye_tax: 600000,
            nssf_employee: 280000,
            other_deductions: 120000,
            total_deductions: 1000000,
            net_salary: 3000000,
            generated_date: '2025-12-25',
            status: 'available'
        },
        {
            id: 2,
            month: 11,
            year: 2025,
            basic_salary: 3000000,
            allowances: 1000000,
            gross_salary: 4000000,
            paye_tax: 600000,
            nssf_employee: 280000,
            other_deductions: 120000,
            total_deductions: 1000000,
            net_salary: 3000000,
            generated_date: '2025-11-25',
            status: 'available'
        },
        {
            id: 3,
            month: 10,
            year: 2025,
            basic_salary: 3000000,
            allowances: 1000000,
            gross_salary: 4000000,
            paye_tax: 600000,
            nssf_employee: 280000,
            other_deductions: 120000,
            total_deductions: 1000000,
            net_salary: 3000000,
            generated_date: '2025-10-25',
            status: 'available'
        }
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const PayslipModal = ({ payslip, onClose }) => {
        if (!payslip) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl">My Payslip</CardTitle>
                            <button onClick={onClose} className="text-2xl leading-none">&times;</button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {/* Employee Info */}
                        <div className="mb-8 pb-8 border-b border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">Pay Period</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600">Period</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(payslip.year, payslip.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Generated</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(payslip.generated_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Earnings */}
                        <div className="mb-8 pb-8 border-b border-gray-200">
                            <h3 className="text-lg font-semibold mb-4 text-green-700">Earnings</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Basic Salary</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(payslip.basic_salary)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Allowances</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(payslip.allowances)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t-2 border-green-200">
                                    <span className="text-lg font-semibold text-green-700">Gross Salary</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(payslip.gross_salary)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="mb-8 pb-8 border-b border-gray-200">
                            <h3 className="text-lg font-semibold mb-4 text-red-700">Deductions</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">PAYE Tax</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(payslip.paye_tax)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">NSSF Contribution (10%)</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(payslip.nssf_employee)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Other Deductions</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(payslip.other_deductions)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t-2 border-red-200">
                                    <span className="text-lg font-semibold text-red-700">Total Deductions</span>
                                    <span className="text-lg font-bold text-red-600">{formatCurrency(payslip.total_deductions)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Salary */}
                        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-lg border-2 border-primary-200 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-900">Net Salary (Take Home)</span>
                                <span className="text-3xl font-bold text-primary-600">{formatCurrency(payslip.net_salary)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-6 border-t border-gray-200">
                            <Button variant="primary" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Download PDF
                            </Button>
                            <Button variant="outline" onClick={onClose}>Close</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Payslips</h1>
                <p className="text-gray-600 mt-2">View and download your salary payslips</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Latest Salary</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(3000000)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pay Period</p>
                                <p className="text-2xl font-bold">December 2025</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Download className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Available</p>
                                <p className="text-2xl font-bold">{payslips.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payslips Table */}
            <Card>
                <CardHeader>
                    <CardTitle>My Payslips</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pay Period</TableHead>
                                <TableHead className="text-right">Gross Salary</TableHead>
                                <TableHead className="text-right">Deductions</TableHead>
                                <TableHead className="text-right">Net Salary</TableHead>
                                <TableHead>Generated</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payslips.map((payslip) => (
                                <TableRow key={payslip.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">
                                        {new Date(payslip.year, payslip.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600 font-semibold">
                                        {formatCurrency(payslip.gross_salary)}
                                    </TableCell>
                                    <TableCell className="text-right text-orange-600">
                                        {formatCurrency(payslip.total_deductions)}
                                    </TableCell>
                                    <TableCell className="text-right text-primary-600 font-bold">
                                        {formatCurrency(payslip.net_salary)}
                                    </TableCell>
                                    <TableCell>{new Date(payslip.generated_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedPayslip(payslip)}
                                                className="flex items-center gap-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                                <Download className="h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Payslip Modal */}
            <PayslipModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
        </div>
    );
};

export default MyPayslipsPage;
