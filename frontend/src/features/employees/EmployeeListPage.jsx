import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, Search, Filter,
    Mail, Phone, Building2,
    CheckCircle, XCircle, Clock, LogOut, AlertCircle, Upload, MoreHorizontal
} from 'lucide-react';
import { useGetEmployeesQuery, useGetEmployeeStatsQuery } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { getMediaUrl } from '../../config/api';
import BulkEmployeeUpload from './BulkEmployeeUpload';
import { cn } from '../../utils/cn';

const StatusBadge = ({ status }) => {
    const config = {
        active: { color: "text-notion-text bg-notion-sidebar", label: "Active" },
        on_leave: { color: "text-orange-600 bg-orange-50", label: "On Leave" },
        terminated: { color: "text-red-600 bg-red-50", label: "Terminated" },
        resigned: { color: "text-slate-500 bg-slate-50", label: "Resigned" },
        suspended: { color: "text-orange-500 bg-orange-50", label: "Suspended" },
    };

    const style = config[status] || config.active;

    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border border-notion-border", style.color)}>
            {style.label}
        </span>
    );
};

const EmployeeListPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

    const { data: employeesData, isLoading, refetch } = useGetEmployeesQuery({
        search: searchTerm,
        employment_status: statusFilter !== 'all' ? statusFilter : undefined
    });

    const employees = Array.isArray(employeesData?.results)
        ? employeesData.results
        : (Array.isArray(employeesData) ? employeesData : []);

    const { data: stats } = useGetEmployeeStatsQuery();

    return (
        <div className="space-y-12 pb-20">
            {/* Minimal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Team Directory</h1>
                    <p className="text-notion-text-light mt-2">Manage all organization members and their current status.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setIsBulkUploadOpen(true)}
                        className="btn-notion-outline h-8"
                    >
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        Bulk upload
                    </Button>
                    <Button
                        onClick={() => navigate('/employees/new')}
                        className="btn-notion-primary h-8"
                    >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        Add member
                    </Button>
                </div>
            </div>

            {/* Flat Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Total headcount</p>
                    <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Active</p>
                    <p className="text-2xl font-bold">{stats?.active || 0}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">On Leave</p>
                    <p className="text-2xl font-bold text-orange-600">{stats?.on_leave || 0}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Departments</p>
                    <p className="text-2xl font-bold">{stats?.departments_count || 0}</p>
                </div>
            </div>

            {/* Minimal Filters */}
            <div className="flex flex-col md:flex-row gap-4 py-2 border-y border-notion-border items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-notion-text-light" />
                    <input
                        placeholder="Search by name, email or role..."
                        className="w-full pl-8 pr-3 py-1.5 bg-transparent border-none focus:outline-none text-sm placeholder:text-notion-text-light"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto whitespace-nowrap px-1">
                    <select
                        className="bg-transparent border-none text-sm font-medium focus:outline-none text-notion-text-light outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">ALL STATUS</option>
                        <option value="active">ACTIVE STAFF</option>
                        <option value="on_leave">ON LEAVE</option>
                        <option value="suspended">SUSPENDED</option>
                        <option value="terminated">TERMINATED</option>
                    </select>
                    <div className="h-4 w-px bg-notion-border hidden md:block" />
                    <button className="flex items-center gap-2 text-sm font-medium text-notion-text-light hover:text-notion-text">
                        <Filter className="h-3.5 w-3.5" />
                        <span>Filter</span>
                    </button>
                    <div className="h-4 w-px bg-notion-border hidden md:block" />
                    <button className="p-1 hover:bg-notion-hover rounded">
                        <MoreHorizontal className="h-4 w-4 text-notion-text-light" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-notion-text-light">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-notion-border border-t-notion-text mb-4"></div>
                    <p className="text-sm font-medium">Fetching directory...</p>
                </div>
            ) : employees.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center opacity-60">
                    <Users className="h-12 w-12 mb-4 stroke-1" />
                    <h2 className="text-lg font-bold">No results found</h2>
                    <p className="text-sm max-w-xs mt-1">Try adjusting your filters or adding a new member.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-notion-border">
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider w-[320px]">Member</th>
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Position & Team</th>
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Contacts</th>
                                <th className="px-1 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-notion-border">
                            {employees.map((employee) => (
                                <tr
                                    key={employee.id}
                                    className="group hover:bg-notion-hover/50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/employees/${employee.id}/edit`)}
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-notion-sidebar border border-notion-border flex items-center justify-center overflow-hidden shrink-0">
                                                {employee.photo ? (
                                                    <img
                                                        src={getMediaUrl(employee.photo)}
                                                        className="h-full w-full object-cover"
                                                        alt=""
                                                    />
                                                ) : (
                                                    <span className="text-[10px] font-bold text-notion-text-light uppercase">{employee.first_name?.[0]}{employee.last_name?.[0]}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[14px] truncate group-hover:text-notion-primary transition-colors">{employee.full_name}</p>
                                                <p className="text-[11px] text-notion-text-light font-medium uppercase tracking-tighter">{employee.employee_number}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm text-notion-text">{employee.job_title}</p>
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-notion-text-light">
                                            <span>{employee.department_name || 'No Dept'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={employee.employment_status} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-0.5 text-[11px] font-medium text-notion-text-light">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 opacity-40" />
                                                <span className="truncate">{employee.email}</span>
                                            </div>
                                            {employee.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3 opacity-40" />
                                                    <span>{employee.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-1 text-right">
                                        <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all">
                                            <ChevronRight className="h-4 w-4 text-notion-text-light" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <BulkEmployeeUpload
                isOpen={isBulkUploadOpen}
                onClose={() => setIsBulkUploadOpen(false)}
                onSuccess={() => {
                    setIsBulkUploadOpen(false);
                    refetch();
                }}
            />
        </div>
    );
};

export default EmployeeListPage;
