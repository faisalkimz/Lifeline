import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, Search, Filter,
    Mail, Phone, Building2, Sparkles,
    CheckCircle, XCircle, Clock, LogOut, AlertCircle, Upload
} from 'lucide-react';
import { useGetEmployeesQuery, useGetEmployeeStatsQuery } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '../../components/ui/Table';
import { getMediaUrl } from '../../config/api';
import BulkEmployeeUpload from './BulkEmployeeUpload';

const StatusBadge = ({ status }) => {
    const config = {
        active: { color: "text-primary-700 bg-primary-50 border-primary-200", icon: CheckCircle, label: "Active" },
        on_leave: { color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock, label: "On Leave" },
        terminated: { color: "text-rose-700 bg-rose-50 border-rose-200", icon: XCircle, label: "Terminated" },
        resigned: { color: "text-gray-700 bg-gray-100 border-gray-200", icon: LogOut, label: "Resigned" },
        suspended: { color: "text-orange-700 bg-orange-50 border-orange-200", icon: AlertCircle, label: "Suspended" },
    };

    const style = config[status] || config.active;
    const Icon = style.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {style.label}
        </span>
    );
};

const EmployeeListPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

    const getImageUrl = (photoPath) => {
        return getMediaUrl(photoPath);
    };

    // Safely structure params (RTK Query handles undefined params by excluding them usually)
    const { data: employeesData, isLoading, refetch } = useGetEmployeesQuery({
        search: searchTerm,
        employment_status: statusFilter !== 'all' ? statusFilter : undefined
    });

    const employees = Array.isArray(employeesData?.results)
        ? employeesData.results
        : (Array.isArray(employeesData) ? employeesData : []);

    const { data: stats } = useGetEmployeeStatsQuery();

    return (
        <div className="space-y-8 animate-fade-in-up pb-20">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">Team Members</span>
                        <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-bold border border-primary-100 shadow-sm">
                            {employees?.length || 0}
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium max-w-lg leading-relaxed">
                        Manage your workforce, track real-time status, and oversee organizational growth.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => setIsBulkUploadOpen(true)}
                        className="btn-premium-secondary"
                    >
                        <Upload className="h-4 w-4 mr-2 text-gray-500" />
                        Bulk Upload
                    </Button>
                    <Button
                        onClick={() => navigate('/employees/new')}
                        className="btn-premium-primary"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Member
                    </Button>
                </div>
            </div>

            {/* Premium Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Workforce</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</h3>
                        </div>
                        <div className="h-10 w-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform duration-300">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
                        <span className="bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">+12% growth</span>
                        <span className="ml-2 text-gray-400">vs last month</span>
                    </div>
                </div>

                <div className="stat-card group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Active Now</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.active || 0}</h3>
                        </div>
                        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                        Working today
                    </div>
                </div>

                <div className="stat-card group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">On Leave</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.on_leave || 0}</h3>
                        </div>
                        <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-amber-600">
                        <span className="bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                            {stats?.on_leave > 0 ? `${stats?.on_leave} Away` : "Full Team"}
                        </span>
                    </div>
                </div>

                <div className="stat-card group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Departments</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.departments_count || 0}</h3>
                        </div>
                        <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-purple-600">
                        <span className="bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                            Organization
                        </span>
                    </div>
                </div>
            </div>

            {/* Premium Search & Filters */}
            <div className="glass rounded-2xl p-4 sticky top-4 z-20 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <Input
                            placeholder="Search by name, email, or department..."
                            className="pl-12 h-12 border-gray-200 bg-white/50 focus:bg-white text-base input-premium shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <select
                                className="h-12 pl-4 pr-10 border border-gray-200 rounded-xl bg-white/50 focus:bg-white outline-none cursor-pointer hover:border-primary-300 transition-all text-sm font-semibold text-gray-700 appearance-none shadow-sm hover:shadow-md min-w-[160px]"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="on_leave">On Leave</option>
                                <option value="suspended">Suspended</option>
                                <option value="terminated">Terminated</option>
                                <option value="resigned">Resigned</option>
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center text-gray-400 animate-pulse">
                    <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4" />
                    <p className="font-semibold text-gray-500">Loading your team...</p>
                </div>
            ) : employees.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                    <div className="h-24 w-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No team members found</h2>
                    <p className="text-gray-500 max-w-sm mb-8 font-medium">
                        {searchTerm || statusFilter !== 'all'
                            ? "We couldn't find anyone matching your current filters."
                            : "Your organization is empty. Start by adding your first team member."}
                    </p>
                    {(searchTerm || statusFilter !== 'all') ? (
                        <Button
                            variant="outline"
                            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                            className="rounded-xl h-11 border-gray-300 shadow-sm hover:border-gray-400"
                        >
                            Clear Filters
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate('/employees/new')}
                            className="bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-base px-6 h-12 rounded-xl"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add First Employee
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {employees.map((employee) => (
                            <div
                                key={employee.id}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
                                onClick={() => navigate(`/employees/${employee.id}/edit`)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="relative h-14 w-14 rounded-2xl bg-gray-50 shrink-0 shadow-inner overflow-hidden border border-gray-100">
                                        {employee.photo ? (
                                            <img
                                                src={getImageUrl(employee.photo)}
                                                alt={employee.full_name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white text-indigo-600 font-bold text-lg">
                                                {employee.first_name?.[0]}{employee.last_name?.[0]}
                                            </div>
                                        )}
                                        <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${employee.employment_status === 'active' ? 'bg-emerald-500' :
                                                employee.employment_status === 'on_leave' ? 'bg-amber-500' : 'bg-gray-400'
                                            }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900 truncate">{employee.full_name}</h3>
                                                <p className="text-sm font-medium text-emerald-600 mb-1">{employee.job_title}</p>
                                            </div>
                                            <StatusBadge status={employee.employment_status} />
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                            {employee.department_name || 'Unassigned'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-premium border border-gray-200/60 overflow-hidden">
                        <Table className="table-premium">
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                    <TableHead className="pl-8 h-12 font-bold text-xs uppercase tracking-wider text-gray-500">Employee Profile</TableHead>
                                    <TableHead className="h-12 font-bold text-xs uppercase tracking-wider text-gray-500">Role & Department</TableHead>
                                    <TableHead className="h-12 font-bold text-xs uppercase tracking-wider text-gray-500">Status</TableHead>
                                    <TableHead className="h-12 font-bold text-xs uppercase tracking-wider text-gray-500">Contact</TableHead>
                                    <TableHead className="h-12 font-bold text-xs uppercase tracking-wider text-gray-500">Joined Date</TableHead>
                                    <TableHead className="pr-8 text-right h-12 font-bold text-xs uppercase tracking-wider text-gray-500">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow
                                        key={employee.id}
                                        className="cursor-pointer hover:bg-gray-50/80 transition-all group"
                                        onClick={() => navigate(`/employees/${employee.id}/edit`)}
                                    >
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-11 w-11 rounded-full bg-gray-50 shadow-sm border border-gray-100 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                                    {employee.photo ? (
                                                        <img
                                                            src={getImageUrl(employee.photo)}
                                                            alt={employee.full_name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white text-indigo-600 font-bold text-sm">
                                                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-sm">{employee.full_name}</div>
                                                    <div className="text-xs font-semibold text-gray-400 font-mono mt-0.5">{employee.employee_number}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="font-semibold text-gray-800 text-sm">{employee.job_title}</div>
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-1">
                                                <Building2 className="h-3 w-3 text-gray-400" />
                                                {employee.department_name || 'Unassigned'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <StatusBadge status={employee.employment_status} />
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-primary-600 transition-colors">
                                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="truncate max-w-[180px]">{employee.email}</span>
                                                </div>
                                                {employee.phone && (
                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                        {employee.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="text-sm font-medium text-gray-600">
                                                {new Date(employee.join_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="btn-premium-ghost opacity-0 group-hover:opacity-100 transition-all font-semibold"
                                            >
                                                Edit Profile
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
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
