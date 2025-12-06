import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Building2, UserCheck, Crown,
    Search, Plus, Edit
} from 'lucide-react';
import { useGetManagersQuery, useGetDepartmentsQuery } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '../../components/ui/Table';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../auth/authSlice';

const ManagerManagementPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    const isAuthenticated = useSelector(selectIsAuthenticated);

    const { data: managersData, isLoading } = useGetManagersQuery(undefined, {
        skip: !isAuthenticated
    });
    const { data: departments } = useGetDepartmentsQuery(undefined, {
        skip: !isAuthenticated
    });

    const processedManagers = Array.isArray(managersData) ? managersData : [];

    const filteredManagers = processedManagers.filter(manager =>
        manager.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 font-medium">⚠️ Not authenticated</p>
                    <p className="text-yellow-700 text-sm">Please log in to view managers.</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manager Management</h1>
                    <p className="text-gray-500 mt-1">
                        Manage organizational hierarchy and reporting relationships.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                        className="btn-secondary"
                    >
                        {viewMode === 'grid' ? 'Table View' : 'Card View'}
                    </Button>
                    <Button onClick={() => navigate('/employees/new')} className="btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Manager
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Managers"
                    value={processedManagers.length}
                    icon={Crown}
                    color="primary"
                />
                <StatCard
                    title="Department Heads"
                    value={processedManagers.filter(m => m.department).length}
                    icon={Building2}
                    color="success"
                />
                <StatCard
                    title="Direct Reports"
                    value={processedManagers.reduce((acc, m) => acc + (m.subordinates?.length || 0), 0)}
                    icon={Users}
                    color="warning"
                />
                <StatCard
                    title="Avg Team Size"
                    value={processedManagers.length > 0 ?
                        Math.round(processedManagers.reduce((acc, m) => acc + (m.subordinates?.length || 0), 0) / processedManagers.length) :
                        0
                    }
                    icon={UserCheck}
                    color="info"
                />
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search managers by name, title, or department..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Manager</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead className="text-center">Direct Reports</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                                                <div className="space-y-1">
                                                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                                        <TableCell className="text-center"><div className="h-4 bg-gray-200 rounded w-8 animate-pulse mx-auto"></div></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
                                        <TableCell className="text-right"><div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredManagers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No managers found. Add one to get started!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredManagers.map((manager) => (
                                    <TableRow key={manager.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                                    {manager.first_name[0]}{manager.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{manager.full_name}</div>
                                                    <div className="text-sm text-gray-500">{manager.employee_number}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {departments?.find(dept => dept.manager === manager.id) ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                                                    {departments.find(dept => dept.manager === manager.id)?.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">No department</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700">
                                                {manager.subordinates?.length || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-900">{manager.job_title}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-primary-600"
                                                    onClick={() => navigate(`/employees/${manager.id}/edit`)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
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

export default ManagerManagementPage;
