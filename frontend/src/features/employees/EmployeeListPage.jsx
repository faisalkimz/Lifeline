import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, Search, Filter, MoreVertical,
    Mail, Phone, MapPin, Calendar, Building2, Sparkles
} from 'lucide-react';
import { useGetEmployeesQuery, useGetEmployeeStatsQuery } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '../../components/ui/Table';

const StatusBadge = ({ status }) => {
    const styles = {
        active: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-2 ring-emerald-100",
        on_leave: "bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-100",
        terminated: "bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-100",
        resigned: "bg-slate-100 text-slate-700 border-slate-200 ring-2 ring-slate-100",
    };

    const labels = {
        active: "● Active",
        on_leave: "○ On Leave",
        terminated: "■ Terminated",
        resigned: "□ Resigned",
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.active}`}>
            {labels[status] || status}
        </span>
    );
};

const EmployeeListPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const getImageUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http') || photoPath.startsWith('data:') || photoPath.startsWith('blob:')) return photoPath;
        const baseUrl = 'http://localhost:8000';
        return `${baseUrl}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
    };

    const { data: employeesData, isLoading } = useGetEmployeesQuery({
        search: searchTerm,
        employment_status: statusFilter !== 'all' ? statusFilter : undefined
    });

    const mockEmployees = [
        {
            id: 1,
            employee_number: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            full_name: 'John Doe',
            email: 'john.doe@example.com',
            department_name: 'Engineering',
            job_title: 'Software Engineer',
            employment_status: 'active',
            join_date: '2024-01-15',
            phone: '+256 700 000 001',
            photo: null
        },
        {
            id: 2,
            employee_number: 'EMP002',
            first_name: 'Jane',
            last_name: 'Smith',
            full_name: 'Jane Smith',
            email: 'jane.smith@example.com',
            department_name: 'HR',
            job_title: 'HR Manager',
            employment_status: 'active',
            join_date: '2024-02-01',
            phone: '+256 700 000 002',
            photo: null
        }
    ];

    let employees = mockEmployees;
    if (Array.isArray(employeesData) && employeesData.length > 0) {
        employees = employeesData;
    } else if (employeesData && typeof employeesData === 'object' && Array.isArray(employeesData.results)) {
        employees = employeesData.results;
    }
    if (!Array.isArray(employees)) {
        employees = mockEmployees;
    }

    const { data: stats } = useGetEmployeeStatsQuery();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with gradient */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
                    <p className="text-slate-500 mt-1">Manage and view all your amazing team members</p>
                </div>
                <Button
                    onClick={() => navigate('/employees/new')}
                    className="bg-primary-600 hover:bg-primary-700 shadow-sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            {/* Stats Overview with enhanced design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Team"
                    value={stats?.total || 0}
                    icon={Users}
                    color="primary"
                    trend="+12% from last month"
                />
                <StatCard
                    title="Active Now"
                    value={stats?.active || 0}
                    icon={Sparkles}
                    color="success"
                    trend="Working today"
                />
                <StatCard
                    title="On Leave"
                    value={stats?.on_leave || 0}
                    icon={Calendar}
                    color="warning"
                    trend={stats?.on_leave > 0 ? "Away" : "All here!"}
                />
                <StatCard
                    title="Departments"
                    value={stats?.departments_count || 8}
                    icon={Building2}
                    color="primary"
                    trend="Across company"
                />
            </div>

            {/* Enhanced Search & Filters */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search by name, email, or department..."
                                className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                className="h-12 px-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">● Active</option>
                                <option value="on_leave">○ On Leave</option>
                                <option value="terminated">■ Terminated</option>
                            </select>
                            <Button
                                variant="outline"
                                className="h-12 border-gray-200 hover:bg-gray-50"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Employees Table */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="border-b border-gray-100">
                                <TableHead className="font-semibold text-slate-600">Employee</TableHead>
                                <TableHead className="font-semibold text-slate-600">Role & Department</TableHead>
                                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                                <TableHead className="font-semibold text-slate-600">Contact</TableHead>
                                <TableHead className="font-semibold text-slate-600">Joined</TableHead>
                                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                                            <p className="text-gray-500 font-medium">Loading your team...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : employees?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Users className="h-10 w-10 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-semibold text-lg">No team members yet</p>
                                                <p className="text-gray-500">Add your first employee to get started!</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((employee) => (
                                    <TableRow
                                        key={employee.id}
                                        className="cursor-pointer hover:bg-blue-50/50 transition-colors border-b border-gray-100"
                                        onClick={() => navigate(`/employees/${employee.id}/edit`)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden ring-4 ring-blue-50 shrink-0">
                                                    {employee.photo ? (
                                                        <img
                                                            src={getImageUrl(employee.photo)}
                                                            alt={employee.full_name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <span>{employee.first_name[0]}{employee.last_name[0]}</span>
                                                    )}
                                                    {employee.employment_status === 'active' && (
                                                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-base">{employee.full_name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{employee.employee_number}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">{employee.job_title}</div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                                <Building2 className="h-3 w-3" />
                                                {employee.department_name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={employee.employment_status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="truncate max-w-[180px]">{employee.email}</span>
                                                </div>
                                                {employee.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                        {employee.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {new Date(employee.join_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                            >
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default EmployeeListPage;
