
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, FileText, CheckSquare, Square } from 'lucide-react';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import {
    useGetEmployeesQuery,
    useGetLeaveRequestsQuery,
    useGetPayrollRunsQuery
} from '../../store/api';

const REPORT_MODULES = [
    { id: 'employees', label: 'Employees', columns: ['first_name', 'last_name', 'email', 'department_name', 'job_title', 'join_date', 'status'] },
    { id: 'leave', label: 'Leave Requests', columns: ['employee_name', 'leave_type', 'start_date', 'end_date', 'status', 'reason'] },
    { id: 'payroll', label: 'Payroll History', columns: ['run_date', 'total_net_pay', 'status', 'employees_count'] },
];

const CustomReportBuilder = () => {
    const [selectedModule, setSelectedModule] = useState('employees');
    const [selectedColumns, setSelectedColumns] = useState(REPORT_MODULES[0].columns);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [format, setFormat] = useState('csv');

    // Fetch all data (optimization: strictly should filter on backend)
    const { data: employeesData } = useGetEmployeesQuery();
    const { data: leaveData } = useGetLeaveRequestsQuery();
    const { data: payrollData } = useGetPayrollRunsQuery();

    const handleModuleChange = (moduleId) => {
        setSelectedModule(moduleId);
        const module = REPORT_MODULES.find(m => m.id === moduleId);
        setSelectedColumns(module.columns);
    };

    const toggleColumn = (col) => {
        if (selectedColumns.includes(col)) {
            setSelectedColumns(selectedColumns.filter(c => c !== col));
        } else {
            setSelectedColumns([...selectedColumns, col]);
        }
    };

    const handleGenerate = () => {
        let rawData = [];
        if (selectedModule === 'employees') rawData = Array.isArray(employeesData?.results) ? employeesData.results : employeesData || [];
        if (selectedModule === 'leave') rawData = Array.isArray(leaveData?.results) ? leaveData.results : leaveData || [];
        if (selectedModule === 'payroll') rawData = Array.isArray(payrollData?.results) ? payrollData.results : payrollData || [];

        // Filter by date if applicable (simplified)
        if (dateRange.start && dateRange.end) {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            rawData = rawData.filter(item => {
                const dateField = selectedModule === 'employees' ? 'join_date' : (selectedModule === 'leave' ? 'start_date' : 'run_date');
                if (!item[dateField]) return true;
                const itemDate = new Date(item[dateField]);
                return itemDate >= start && itemDate <= end;
            });
        }

        // Map to selected columns
        const reportData = rawData.map(item => {
            const row = {};
            selectedColumns.forEach(col => {
                row[col] = item[col] || '';
                // access nested for department_name if needed, but assuming flat or flattened
                if (col === 'department_name' && item.department) row[col] = item.department.name || item.department_name;
                if (col === 'employee_name' && item.employee) row[col] = `${item.employee.first_name} ${item.employee.last_name}`;
            });
            return row;
        });

        const filename = `${selectedModule}_report_${new Date().toISOString().split('T')[0]}`;
        if (format === 'csv') exportToCSV(reportData, filename);
        else exportToJSON(reportData, filename);
    };

    const currentModule = REPORT_MODULES.find(m => m.id === selectedModule);

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                    <FileText className="h-5 w-5 text-primary-600" />
                    Custom Report Builder
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Module Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">1. Select Data Source</label>
                    <div className="flex gap-3">
                        {REPORT_MODULES.map(m => (
                            <button
                                key={m.id}
                                onClick={() => handleModuleChange(m.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedModule === m.id
                                        ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">2. Date Range (Optional)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
                            <input
                                type="date"
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                value={dateRange.start}
                                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">End Date</label>
                            <input
                                type="date"
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                value={dateRange.end}
                                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Column Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">3. Select Columns</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {currentModule.columns.map(col => (
                            <div
                                key={col}
                                onClick={() => toggleColumn(col)}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-colors"
                            >
                                {selectedColumns.includes(col) ? (
                                    <CheckSquare className="h-4 w-4 text-primary-600" />
                                ) : (
                                    <Square className="h-4 w-4 text-slate-300" />
                                )}
                                <span className="text-sm text-slate-600 capitalize">{col.replace(/_/g, ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Format & generate */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="format"
                                value="csv"
                                checked={format === 'csv'}
                                onChange={() => setFormat('csv')}
                                className="text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-slate-700">CSV</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="format"
                                value="json"
                                checked={format === 'json'}
                                onChange={() => setFormat('json')}
                                className="text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-slate-700">JSON</span>
                        </label>
                    </div>

                    <Button onClick={handleGenerate} className="bg-primary-600 hover:bg-primary-700 gap-2 shadow-lg shadow-primary-200">
                        <Download className="h-4 w-4" />
                        Generate Report
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CustomReportBuilder;
