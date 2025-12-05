import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, Search, Filter, MoreVertical,
    Mail, Phone, MapPin, Calendar, Building2
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
        active: "bg-success-50 text-success-700 border-success-200",
        on_leave: "bg-warning-50 text-warning-700 border-warning-200",
        terminated: "bg-error-50 text-error-700 border-error-200",
        resigned: "bg-gray-100 text-gray-700 border-gray-200",
    };

    const labels = {
        active: "Active",
        on_leave: "On Leave",
        terminated: "Terminated",
        resigned: "Resigned",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.active}`}>
            {labels[status] || status}
        </span>
    );
};

const EmployeeListPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch data
    const { data: employees, isLoading } = useGetEmployeesQuery({
        search: searchTerm,
        employment_status: statusFilter !== 'all' ? statusFilter : undefined
    });

    const { data: stats } = useGetEmployeeStatsQuery();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                    <p className="text-gray-500 mt-1">Manage your team members and their roles.</p>
                </div>
                <Button onClick={() => navigate('/employees/new')} className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Employees"
                    value={stats?.total || 0}
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title="Active Now"
                    value={stats?.active || 0}
                    icon={Users}
                    color="success"
                />
                <StatCard
                    title="On Leave"
                    value={stats?.on_leave || 0}
                    icon={Calendar}
                    color="warning"
                />
                <StatCard
                    title="Departments"
                    value={stats?.departments_count || 8} // Placeholder if not in stats
                    icon={Building2}
                    color="primary"
                />
            </div>

            {/* Filters & Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search employees..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                className="input-field w-40"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="on_leave">On Leave</option>
                                <option value="terminated">Terminated</option>
                            </select>
                            <Button variant="outline" className="btn-secondary">
                                <Filter className="h-4 w-4 mr-2" />
                                More Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Employees Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Loading employees...
                                    </TableCell>
                                </TableRow>
                            ) : employees?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No employees found. Add one to get started!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees?.map((employee) => (
                                    <TableRow
                                        key={employee.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/employees/${employee.id}/edit`)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                    {employee.photo ? (
                                                        <img src={employee.photo} alt="" className="h-full w-full rounded-full object-cover" />
                                                    ) : (
                                                        employee.first_name[0] + employee.last_name[0]
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{employee.full_name}</div>
                                                    <div className="text-xs text-gray-500">{employee.employee_number}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-900">{employee.job_title}</div>
                                            <div className="text-xs text-gray-500">{employee.department_name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={employee.employment_status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {employee.email}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Phone className="h-3 w-3 mr-1" />
                                                    {employee.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-500">
                                                {new Date(employee.join_date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button className="btn-ghost p-2 h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
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
