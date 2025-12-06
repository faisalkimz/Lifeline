import React, { useState } from 'react';
import {
    Users, Search, Check, X, Crown, Building2,
    UserCheck, AlertCircle
} from 'lucide-react';
import { useGetEmployeesQuery, useGetDepartmentsQuery } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter, DialogDescription
} from '../../components/ui/Dialog';
import { Checkbox } from '../../components/ui/Checkbox';
import { Badge } from '../../components/ui/Badge';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../auth/authSlice';

const PromoteManagerModal = ({ isOpen, onClose, onPromote }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [managerRole, setManagerRole] = useState('Manager');
    const [assignAsDeptHead, setAssignAsDeptHead] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const isAuthenticated = useSelector(selectIsAuthenticated);

    const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useGetEmployeesQuery(
        { employment_status: 'active' },
        { skip: !isAuthenticated }
    );
    const { data: departmentsData, isLoading: departmentsLoading, error: departmentsError } = useGetDepartmentsQuery(
        undefined,
        { skip: !isAuthenticated }
    );

    // Ensure data is in array format
    const employeesArray = Array.isArray(employeesData) ? employeesData : [];
    const departmentsArray = Array.isArray(departmentsData) ? departmentsData : [];

    // Filter employees who are not already managers and match search
    const availableEmployees = employeesArray.filter(employee => {
        // Don't show employees who are already managers (have subordinates)
        // Temporarily disabled to debug
        // if (employee.subordinates_count > 0) return false;

        // Apply search filter only if there's a search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                employee.full_name?.toLowerCase().includes(searchLower) ||
                employee.job_title?.toLowerCase().includes(searchLower) ||
                employee.employee_number?.toLowerCase().includes(searchLower) ||
                employee.email?.toLowerCase().includes(searchLower) ||
                employee.department_name?.toLowerCase().includes(searchLower);

            return matchesSearch;
        }

        // If no search term, include all eligible employees
        return true;
    });

    // Debug: Log what's happening (after availableEmployees exists)
    console.log('Modal Debug:', {
        searchTerm,
        employeesLoading,
        employeesError,
        totalEmployees: employeesArray.length,
        employeesWithSubordinates: employeesArray.filter(e => e.subordinates_count > 0).length,
        availableEmployeesCount: availableEmployees.length,
        sampleEmployee: employeesArray[0]
    });

    // Manager role options
    const managerRoles = [
        { value: 'Manager', label: 'Manager' },
        { value: 'Assistant Manager', label: 'Assistant Manager' },
        { value: 'Senior Manager', label: 'Senior Manager' },
        { value: 'Department Head', label: 'Department Head' },
        { value: 'Supervisor', label: 'Supervisor' },
        { value: 'Team Lead', label: 'Team Lead' }
    ];

    

    const handleEmployeeToggle = (employee) => {
        setSelectedEmployees(prev =>
            prev.includes(employee.id)
                ? prev.filter(id => id !== employee.id)
                : [...prev, employee.id]
        );
    };

    const handlePromote = () => {
        if (selectedEmployees.length === 0) return;

        // Build payload to match backend expected keys:
        // - employee_ids (array)
        // - managerRole (string)
        // - assign_as_dept_head (boolean)
        // - department_id (id or null)
        const promotionData = {
            employee_ids: selectedEmployees,
            managerRole: managerRole,
            assign_as_dept_head: assignAsDeptHead,
            department_id: assignAsDeptHead ? selectedDepartment : null
        };

        onPromote(promotionData);
        handleClose();
    };

    const handleClose = () => {
        setSelectedEmployees([]);
        setManagerRole('Manager');
        setAssignAsDeptHead(false);
        setSelectedDepartment('');
        setSearchTerm('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary-600" />
                        Promote Employees to Managers
                    </DialogTitle>
                    <DialogDescription>
                        Select employees to promote to managerial positions. You can update their job titles and optionally assign them as department heads.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 overflow-y-auto flex-1">
                    {/* Search */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search employees by name, title, or employee number..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        console.log('Search input changed:', e.target.value);
                                        setSearchTerm(e.target.value);
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Promotion Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Promotion Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Manager Role
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={managerRole}
                                    onChange={(e) => setManagerRole(e.target.value)}
                                >
                                    {managerRoles.map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Select the type of managerial role to assign
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="dept-head"
                                    checked={assignAsDeptHead}
                                    onCheckedChange={setAssignAsDeptHead}
                                />
                                <label htmlFor="dept-head" className="text-sm font-medium">
                                    Assign as Department Head
                                </label>
                            </div>

                            {assignAsDeptHead && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Department
                                    </label>
                                    {departmentsLoading ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                            <div className="text-sm text-gray-500">Loading departments...</div>
                                        </div>
                                    ) : departmentsError ? (
                                        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
                                            <div className="text-sm text-red-600">Error loading departments</div>
                                        </div>
                                    ) : departmentsArray.length === 0 ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                            <div className="text-sm text-gray-500">No departments available</div>
                                        </div>
                                    ) : (
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                        >
                                            <option value="">Choose a department...</option>
                                            {departmentsArray.map(dept => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Employee Selection */}
                    <Card className="flex-1 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Select Employees ({selectedEmployees.length} selected)
                                </span>
                                {availableEmployees.length === 0 && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        No eligible employees
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-y-auto max-h-96">
                            {employeesLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="flex-1 space-y-1">
                                                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : employeesError ? (
                                <div className="text-center py-8 text-red-500">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-300" />
                                    <p className="font-medium">Error loading employees</p>
                                    <p className="text-sm">{employeesError?.message || 'Failed to load employee data'}</p>
                                </div>
                            ) : availableEmployees.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No eligible employees</p>
                                    <p className="text-sm">
                                        {searchTerm.trim()
                                            ? `No employees match "${searchTerm}". Try a different search term.`
                                            : "All current employees are already managers."
                                        }
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Total employees: {employeesArray.length}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableEmployees.map((employee) => (
                                        <div
                                            key={employee.id}
                                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedEmployees.includes(employee.id)
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => handleEmployeeToggle(employee)}
                                        >
                                            <Checkbox
                                                checked={selectedEmployees.includes(employee.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleEmployeeToggle(employee);
                                                }}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                                                        {(employee.first_name?.[0] || '?')}{(employee.last_name?.[0] || '?')}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 truncate">
                                                            {employee.full_name || 'Unknown Employee'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate">
                                                            {employee.employee_number} • {employee.job_title || 'No Title'}
                                                        </div>
                                                        <div className="text-xs text-gray-400 truncate">
                                                            📧 {employee.email} • {employee.department_name || 'No department'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedEmployees.includes(employee.id) && (
                                                <Check className="h-5 w-5 text-primary-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePromote}
                        disabled={selectedEmployees.length === 0}
                        className="btn-primary"
                    >
                        <Crown className="h-4 w-4 mr-2" />
                        Promote {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PromoteManagerModal;
