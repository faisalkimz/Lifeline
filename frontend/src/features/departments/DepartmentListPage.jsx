import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Plus, Search, Users,
    MoreVertical, Edit, Trash2
} from 'lucide-react';
import { useGetDepartmentsQuery, useDeleteDepartmentMutation } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '../../components/ui/Table';

const DepartmentListPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch data
    const { data: departments, isLoading } = useGetDepartmentsQuery();
    const [deleteDepartment] = useDeleteDepartmentMutation();

    // Filter departments
    const filteredDepartments = departments?.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await deleteDepartment(id).unwrap();
            } catch (error) {
                console.error('Failed to delete department:', error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-gray-500 mt-1">Manage your company's organizational structure.</p>
                </div>
                <Button onClick={() => navigate('/departments/new')} className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Departments"
                    value={departments?.length || 0}
                    icon={Building2}
                    color="primary"
                />
                <StatCard
                    title="Total Employees"
                    value={departments?.reduce((acc, dept) => acc + (dept.employee_count || 0), 0) || 0}
                    icon={Users}
                    color="success"
                />
                <StatCard
                    title="Avg. Team Size"
                    value={departments?.length ? Math.round(departments.reduce((acc, dept) => acc + (dept.employee_count || 0), 0) / departments.length) : 0}
                    icon={Users}
                    color="warning"
                />
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search departments..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Departments Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Manager</TableHead>
                                <TableHead className="text-center">Employees</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Loading departments...
                                    </TableCell>
                                </TableRow>
                            ) : filteredDepartments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No departments found. Add one to get started!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDepartments?.map((dept) => (
                                    <TableRow
                                        key={dept.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/departments/${dept.id}/edit`)}
                                    >
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900">{dept.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{dept.description}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600 font-mono">
                                                {dept.code}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {dept.manager_name ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs text-primary-700 font-bold">
                                                        {dept.manager_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <span className="text-sm text-gray-700">{dept.manager_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                                                {dept.employee_count || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dept.is_active
                                                    ? "bg-success-50 text-success-700 border border-success-200"
                                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                                }`}>
                                                {dept.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-primary-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/departments/${dept.id}/edit`);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-error-600"
                                                    onClick={(e) => handleDelete(dept.id, e)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

export default DepartmentListPage;
