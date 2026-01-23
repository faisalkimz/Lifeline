import React, { useState } from 'react';
import {
    Users, Search, Check, X, Crown,
    CircleAlert
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
            <DialogContent className="w-[90vw] max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl border-0 p-0">
                {/* Header */}
                <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-slate-100">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                        <Crown className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                            Promote Talent
                        </DialogTitle>
                        <p className="text-slate-500 mt-1 font-medium text-sm">
                            Empower your team members with new responsibilities
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden bg-slate-50">
                    {/* Left Panel: Settings */}
                    <div className="w-full md:w-1/3 bg-white p-6 border-r border-slate-200 overflow-y-auto space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Configuration</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">What's their new role?</label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-all font-medium text-slate-700 outline-none"
                                        value={managerRole}
                                        onChange={(e) => setManagerRole(e.target.value)}
                                    >
                                        {managerRoles.map(role => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Checkbox id="dept-head" checked={assignAsDeptHead} onCheckedChange={setAssignAsDeptHead} className="text-emerald-600 border-slate-300 focus:ring-emerald-500" />
                                        <label htmlFor="dept-head" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                                            Make them a Department Head?
                                        </label>
                                    </div>

                                    {assignAsDeptHead && (
                                        <div className="animate-in slide-in-from-top-2">
                                            <label className="text-xs font-semibold text-slate-500 mb-2 block">Leading which department?</label>
                                            {departmentsLoading ? (
                                                <div className="p-3 text-xs text-slate-400">Loading...</div>
                                            ) : (
                                                <select
                                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                    value={selectedDepartment}
                                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                                >
                                                    <option value="">Select Department...</option>
                                                    {departmentsArray.map(dept => (
                                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Selection */}
                    <div className="w-full md:w-2/3 p-6 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Who is being promoted?</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Find employee..."
                                    className="pl-10 h-10 border-slate-200 bg-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 content-start">
                            {employeesLoading ? (
                                <p className="text-slate-500 col-span-3 text-center py-10">Loading candidates...</p>
                            ) : availableEmployees.length === 0 ? (
                                <div className="col-span-3 flex flex-col items-center justify-center py-20 text-slate-400 opacity-60">
                                    <Users className="h-16 w-16 mb-4 text-slate-200" />
                                    <p>No eligible employees found</p>
                                </div>
                            ) : (
                                availableEmployees.map(emp => (
                                    <div
                                        key={emp.id}
                                        onClick={() => handleEmployeeToggle(emp)}
                                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${selectedEmployees.includes(emp.id)
                                            ? 'bg-emerald-50 border-emerald-500 shadow-md transform scale-[1.02]'
                                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${selectedEmployees.includes(emp.id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                                                    }`}>
                                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-sm ${selectedEmployees.includes(emp.id) ? 'text-emerald-900' : 'text-slate-700'}`}>
                                                        {emp.full_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{emp.job_title}</p>
                                                </div>
                                            </div>
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedEmployees.includes(emp.id) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'
                                                }`}>
                                                {selectedEmployees.includes(emp.id) && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-white border-t border-slate-100 p-4 flex justify-between items-center">
                    <div className="text-sm font-medium text-slate-500 px-4">
                        {selectedEmployees.length === 0 ? 'Select at least one employee' : <span><span className="text-emerald-600 font-bold">{selectedEmployees.length}</span> employee(s) selected</span>}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={handleClose} className="h-12 px-6 text-slate-500 hover:text-slate-900 font-semibold rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:-translate-y-0.5"
                            onClick={handlePromote}
                            disabled={!selectedEmployees.length}
                        >
                            Promote Selected
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PromoteManagerModal;
