import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetEmployeesQuery, useUpdateEmployeeMutation } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '../../components/ui/Table';
import { UserPlus, Users, Building2, Search, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerManagementPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [assigningManager, setAssigningManager] = useState(null);

    // Fetch all employees
    const { data: employees, isLoading, refetch } = useGetEmployeesQuery();
    const [updateEmployee] = useUpdateEmployeeMutation();

    // Get departments from employees (handle empty state)
    const departments = employees ? [...new Set(employees.map(emp => emp.department_name).filter(Boolean))] : [];

    // Filter employees
    const filteredEmployees = employees?.filter(emp => {
        const matchesSearch = 
            emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = !selectedDepartment || emp.department_name === selectedDepartment;
        
        return matchesSearch && matchesDepartment && emp.employment_status === 'active';
    });

    // Group employees by department (handle empty states)
    const employeesByDepartment = filteredEmployees?.reduce((acc, emp) => {
        const dept = emp.department_name || 'Unassigned';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(emp);
        return acc;
    }, {}) || {};

    // Get managers (employees who have subordinates)
    const managers = employees?.filter(emp => {
        return employees.some(sub => sub.manager === emp.id);
    }) || [];

    // Get employees without managers (from filtered results)
    const employeesWithoutManagers = filteredEmployees?.filter(emp => !emp.manager) || [];

    const handleAssignManager = async (employeeId, managerId) => {
        try {
            setAssigningManager(employeeId);
            await updateEmployee({
                id: employeeId,
                manager: managerId || null
            }).unwrap();
            
            toast.success(managerId 
                ? 'Manager assigned successfully!' 
                : 'Manager removed successfully!'
            );
            refetch();
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to assign manager');
            console.error('Failed to assign manager:', error);
        } finally {
            setAssigningManager(null);
        }
    };

    const handleAssignDepartmentManager = async (departmentName, managerId) => {
        try {
            // Find all employees in this department
            const deptEmployees = employees?.filter(emp => emp.department_name === departmentName) || [];
            
            // Update each employee's manager
            const promises = deptEmployees.map(emp => 
                updateEmployee({
                    id: emp.id,
                    manager: managerId || null
                }).unwrap()
            );

            await Promise.all(promises);
            
            toast.success(`Manager assigned to all employees in ${departmentName}`);
            refetch();
        } catch (error) {
            toast.error('Failed to assign department manager');
            console.error('Failed to assign department manager:', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manager Management</h1>
                    <p className="text-gray-500 mt-1">Assign and manage reporting relationships.</p>
                </div>
                <Button 
                    onClick={() => navigate('/employees/new')} 
                    className="btn-primary"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Employees"
                    value={filteredEmployees?.length || 0}
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title="Managers"
                    value={managers.length}
                    icon={UserCheck}
                    color="success"
                />
                <StatCard
                    title="Without Manager"
                    value={employeesWithoutManagers.length}
                    icon={UserX}
                    color="warning"
                />
                <StatCard
                    title="Departments"
                    value={departments.length}
                    icon={Building2}
                    color="info"
                />
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search employees..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="input-field"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Employees by Department */}
            {isLoading ? (
                <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                        Loading employees...
                    </CardContent>
                </Card>
            ) : !filteredEmployees || filteredEmployees.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                        No employees found. Add employees to get started!
                    </CardContent>
                </Card>
            ) : (
                Object.entries(employeesByDepartment).map(([department, deptEmployees]) => (
                    <Card key={department} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{department}</h3>
                                        <p className="text-sm text-gray-500">{deptEmployees.length} employee(s)</p>
                                    </div>
                                    <select
                                        className="input-field w-64"
                                        onChange={(e) => handleAssignDepartmentManager(department, e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="">Assign Manager to All</option>
                                        {deptEmployees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.full_name} ({emp.job_title})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Job Title</TableHead>
                                            <TableHead>Current Manager</TableHead>
                                            <TableHead>Assign Manager</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deptEmployees.map((employee) => {
                                            const currentManager = employees?.find(emp => emp.id === employee.manager);
                                            return (
                                                <TableRow key={employee.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {employee.photo ? (
                                                                <img 
                                                                    src={employee.photo} 
                                                                    alt={employee.full_name}
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                                                                    {employee.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-medium text-gray-900">{employee.full_name}</div>
                                                                <div className="text-xs text-gray-500">{employee.employee_number}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-gray-700">{employee.job_title}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {currentManager ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-full bg-success-100 flex items-center justify-center text-xs text-success-700 font-bold">
                                                                    {currentManager.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                                </div>
                                                                <span className="text-sm text-gray-700">{currentManager.full_name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic">No manager</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <select
                                                            className="input-field text-sm"
                                                            value={employee.manager || ''}
                                                            onChange={(e) => handleAssignManager(employee.id, e.target.value)}
                                                            disabled={assigningManager === employee.id}
                                                        >
                                                            <option value="">Select Manager</option>
                                                            {filteredEmployees
                                                                ?.filter(emp => emp.id !== employee.id)
                                                                .map(emp => (
                                                                    <option key={emp.id} value={emp.id}>
                                                                        {emp.full_name} ({emp.job_title})
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {employee.manager && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleAssignManager(employee.id, null)}
                                                                    disabled={assigningManager === employee.id}
                                                                    className="text-error-600 hover:text-error-700 hover:bg-error-50"
                                                                >
                                                                    <UserX className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => navigate(`/employees/${employee.id}/edit`)}
                                                                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                                                            >
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
};

export default ManagerManagementPage;

