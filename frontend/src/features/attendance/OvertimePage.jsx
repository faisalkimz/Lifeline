import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Plus, Eye, CheckCircle, XCircle, Clock, Calendar, DollarSign } from 'lucide-react';

const OvertimePage = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedOvertime, setSelectedOvertime] = useState(null);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        reason: '',
        project: ''
    });

    // Mock overtime data
    const overtimeRecords = [
        {
            id: 1,
            date: '2025-12-15',
            start_time: '18:00',
            end_time: '22:00',
            hours: 4,
            rate: 1.5,
            amount: 180000,
            reason: 'System maintenance',
            project: 'Infrastructure Upgrade',
            status: 'approved',
            submitted_date: '2025-12-16',
            approved_date: '2025-12-16'
        },
        {
            id: 2,
            date: '2025-12-10',
            start_time: '17:30',
            end_time: '20:30',
            hours: 3,
            rate: 1.5,
            amount: 135000,
            reason: 'Client presentation preparation',
            project: 'Q4 Business Review',
            status: 'pending',
            submitted_date: '2025-12-11'
        },
        {
            id: 3,
            date: '2025-11-28',
            start_time: '19:00',
            end_time: '23:00',
            hours: 4,
            rate: 2.0,
            amount: 240000,
            reason: 'Holiday support',
            project: 'Customer Support',
            status: 'approved',
            submitted_date: '2025-11-29',
            approved_date: '2025-11-30'
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateHours = () => {
        if (!formData.start_time || !formData.end_time) return 0;

        const start = new Date(`2000-01-01T${formData.start_time}`);
        const end = new Date(`2000-01-01T${formData.end_time}`);

        let diff = (end - start) / (1000 * 60 * 60); // hours

        // Handle overnight shifts
        if (diff < 0) diff += 24;

        return Math.max(0, diff);
    };

    const calculateAmount = () => {
        const hours = calculateHours();
        const baseRate = 75000; // UGX per hour (assuming 3M monthly / 160 hours / 2.5 for 40hr week)
        const overtimeRate = 1.5; // 1.5x for regular overtime
        return Math.round(hours * baseRate * overtimeRate);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would submit to API
        console.log('Submitting overtime request:', { ...formData, hours: calculateHours(), amount: calculateAmount() });
        setShowForm(false);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            start_time: '',
            end_time: '',
            reason: '',
            project: ''
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

    const OvertimeDetailsModal = ({ overtime, onClose }) => {
        if (!overtime) return null;

        return (
            <Dialog open={!!overtime} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Overtime Details
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Date</label>
                                <p className="font-semibold">{new Date(overtime.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <Badge className={getStatusColor(overtime.status)}>
                                    {overtime.status}
                                </Badge>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Time</label>
                                <p>{overtime.start_time} - {overtime.end_time}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Hours</label>
                                <p className="font-semibold">{overtime.hours}h</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Rate</label>
                                <p>{overtime.rate}x normal rate</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Amount</label>
                                <p className="font-semibold text-green-600">{formatCurrency(overtime.amount)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Project</label>
                                <p>{overtime.project}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Submitted</label>
                                <p>{new Date(overtime.submitted_date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600">Reason</label>
                            <p className="mt-1">{overtime.reason}</p>
                        </div>

                        {overtime.approved_date && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-700">
                                    ✅ Approved on {new Date(overtime.approved_date).toLocaleDateString()}
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
                    <h1 className="text-3xl font-bold text-gray-900">Overtime Management</h1>
                    <p className="text-gray-600 mt-2">Request and track your overtime hours</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Log Overtime
                </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Overtime Policy</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Regular overtime: 1.5x normal rate</li>
                                <li>• Weekend/Holiday: 2.0x normal rate</li>
                                <li>• Maximum 8 hours per day</li>
                                <li>• Pre-approval required for extended overtime</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Hours</p>
                                <p className="text-2xl font-bold">11h</p>
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
                                <p className="text-2xl font-bold text-green-600">2</p>
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
                            <div className="p-3 bg-green-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Earnings</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(555000)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Overtime Table */}
            <Card>
                <CardHeader>
                    <CardTitle>My Overtime Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overtimeRecords.map((record) => (
                                <TableRow key={record.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">
                                        {new Date(record.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{record.start_time} - {record.end_time}</TableCell>
                                    <TableCell className="font-semibold">{record.hours}h</TableCell>
                                    <TableCell>{record.rate}x</TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">
                                        {formatCurrency(record.amount)}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{record.project}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(record.status)}>
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedOvertime(record)}
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

            {/* Log Overtime Modal */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Log Overtime Hours</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Date *</label>
                                <Input
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Project/Task *</label>
                                <Input
                                    name="project"
                                    value={formData.project}
                                    onChange={handleInputChange}
                                    placeholder="e.g., System Maintenance"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Start Time *</label>
                                <Input
                                    name="start_time"
                                    type="time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">End Time *</label>
                                <Input
                                    name="end_time"
                                    type="time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Reason *</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border rounded-md"
                                placeholder="Describe what you worked on..."
                                required
                            />
                        </div>

                        {(formData.start_time && formData.end_time) && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Overtime Summary</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-blue-700">Hours:</span>
                                        <span className="font-semibold ml-2 text-blue-900">
                                            {calculateHours()} hours
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700">Estimated Amount:</span>
                                        <span className="font-semibold ml-2 text-blue-900">
                                            {formatCurrency(calculateAmount())}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Overtime Details Modal */}
            <OvertimeDetailsModal overtime={selectedOvertime} onClose={() => setSelectedOvertime(null)} />
        </div>
    );
};

export default OvertimePage;
