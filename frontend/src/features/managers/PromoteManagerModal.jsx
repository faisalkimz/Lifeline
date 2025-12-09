import React, { useState } from 'react';
import {
    Users, Search, Check, X, Crown,
    AlertCircle
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

    const employeesArray = Array.isArray(employeesData) ? employeesData : [];
    const departmentsArray = Array.isArray(departmentsData) ? departmentsData : [];

    const managerRoles = [
        { value: 'Manager', label: 'Manager' },
        { value: 'Assistant Manager', label: 'Assistant Manager' },
        { value: 'Senior Manager', label: 'Senior Manager' },
        { value: 'Department Head', label: 'Department Head' },
        { value: 'Supervisor', label: 'Supervisor' },
        { value: 'Team Lead', label: 'Team Lead' }
    ];

    const availableEmployees = employeesArray.filter(employee => {
        if (employee.subordinates_count > 0) return false;

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            return (
                employee.full_name?.toLowerCase().includes(searchLower) ||
                employee.job_title?.toLowerCase().includes(searchLower) ||
                employee.employee_number?.toLowerCase().includes(searchLower) ||
                employee.email?.toLowerCase().includes(searchLower) ||
                employee.department_name?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    const handleEmployeeToggle = (employee) => {
        setSelectedEmployees(prev =>
            prev.includes(employee.id)
                ? prev.filter(id => id !== employee.id)
                : [...prev, employee.id]
        );
    };

    const handlePromote = () => {
        if (!selectedEmployees.length) return;

        const promotionData = {
            employee_ids: selectedEmployees,
            managerRole,
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
            <DialogContent className="w-[90vw] max-w-[1400px] max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-xl shadow-lg">
                <DialogHeader className="px-6 pt-6 bg-white">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-black">
                        <Crown className="h-5 w-5 text-primary-600" /> Promote Employees
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-1">
                        Select employees to promote and optionally assign as department heads.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 flex-1 overflow-x-auto bg-white">
                    {/* Left Column: Search + Settings */}
                    <div className="md:w-1/3 flex flex-col gap-3 min-w-[300px]">
                        <Card className="shadow-sm bg-white">
                            <CardContent className="p-3 bg-white">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search employees..."
                                        className="pl-10 text-sm bg-white text-black"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm bg-white">
                            <CardHeader>
                                <CardTitle className="text-md font-semibold text-black">Promotion Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 bg-white">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Manager Role</label>
                                    <select
                                        className="w-full px-2 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 bg-white text-black"
                                        value={managerRole}
                                        onChange={(e) => setManagerRole(e.target.value)}
                                    >
                                        {managerRoles.map(role => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox id="dept-head" checked={assignAsDeptHead} onCheckedChange={setAssignAsDeptHead} />
                                    <label htmlFor="dept-head" className="text-sm font-medium text-black">
                                        Assign as Department Head
                                    </label>
                                </div>

                                {assignAsDeptHead && (
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">Department</label>
                                        {departmentsLoading ? (
                                            <div className="px-2 py-1 border border-gray-200 rounded-md text-sm text-gray-500 bg-white">
                                                Loading departments...
                                            </div>
                                        ) : departmentsError ? (
                                            <div className="px-2 py-1 border border-red-300 rounded-md text-sm text-red-600 bg-white">
                                                Error loading departments
                                            </div>
                                        ) : (
                                            <select
                                                className="w-full px-2 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 bg-white text-black"
                                                value={selectedDepartment}
                                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                            >
                                                <option value="">Choose a department...</option>
                                                {departmentsArray.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Employee Selection */}
                    <div className="flex-1 min-w-[400px]">
                        <Card className="flex-1 overflow-hidden shadow-sm bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-sm font-medium text-black">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary-600" />
                                        Employees ({selectedEmployees.length} selected)
                                    </span>
                                    {availableEmployees.length === 0 && (
                                        <Badge variant="outline" className="text-orange-600 border-orange-200 flex items-center gap-1 text-xs">
                                            <AlertCircle className="h-3 w-3" /> No eligible
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto p-2 flex gap-2 bg-white">
                                {employeesLoading ? (
                                    <div className="flex gap-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="flex flex-col gap-1 p-2 border rounded-md animate-pulse bg-white min-w-[200px]">
                                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                                                <div className="h-2 bg-gray-200 rounded w-16"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : availableEmployees.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 text-sm flex-1">
                                        <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                        No eligible employees
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        {availableEmployees.map(emp => (
                                            <div
                                                key={emp.id}
                                                className={`flex flex-col gap-1 p-2 border rounded-md cursor-pointer transition-shadow min-w-[200px] ${
                                                    selectedEmployees.includes(emp.id) ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 hover:shadow-sm'
                                                } bg-white`}
                                                onClick={() => handleEmployeeToggle(emp)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={selectedEmployees.includes(emp.id)}
                                                        onChange={(e) => { e.stopPropagation(); handleEmployeeToggle(emp); }}
                                                    />
                                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs flex-shrink-0">
                                                        {(emp.first_name?.[0] || '?')}{(emp.last_name?.[0] || '?')}
                                                    </div>
                                                </div>
                                                <div className="truncate text-sm font-medium">{emp.full_name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 truncate">{emp.employee_number} • {emp.job_title || 'No Title'}</div>
                                                <div className="text-[10px] text-gray-400 truncate">📧 {emp.email} • {emp.department_name || 'No department'}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="sticky bottom-0 bg-white z-10 border-t border-white-100 p-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleClose}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" className="bg-primary-600 text-white hover:bg-primary-700" onClick={handlePromote} disabled={!selectedEmployees.length}>
                        <Crown className="h-4 w-4 mr-1" />
                        Promote {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PromoteManagerModal;
