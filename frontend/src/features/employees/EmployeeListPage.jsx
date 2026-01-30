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
        active: { color: "text-[#88B072] bg-[#88B072]/10 border-[#88B072]/20", icon: CheckCircle, label: "Active" },
        on_leave: { color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock, label: "On Leave" },
        terminated: { color: "text-rose-600 bg-rose-50 border-rose-100", icon: XCircle, label: "Terminated" },
        resigned: { color: "text-slate-500 bg-slate-50 border-slate-200", icon: LogOut, label: "Resigned" },
        suspended: { color: "text-orange-600 bg-orange-50 border-orange-100", icon: AlertCircle, label: "Suspended" },
    };

    const style = config[status] || config.active;
    const Icon = style.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${style.color}`}>
            <Icon className="h-3 w-3" />
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
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Directory</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and view all team members and their status.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsBulkUploadOpen(true)}
                        className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-slate-200"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Upload
                    </Button>
                    <Button
                        onClick={() => navigate('/employees/new')}
                        className="h-10 px-4 bg-[#88B072] hover:bg-[#7aa265] text-white text-xs font-semibold uppercase tracking-wider"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Team" value={stats?.total || 0} icon={Users} />
                <StatCard title="Active" value={stats?.active || 0} icon={Sparkles} trend="up" />
                <StatCard title="On Leave" value={stats?.on_leave || 0} icon={Clock} />
                <StatCard title="Dept Count" value={stats?.departments_count || 0} icon={Building2} />
            </div>

            {/* Enhanced Search & Filters */}
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm sticky top-4 z-20">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input
                            placeholder="Search by name, email, or department..."
                            className="pl-10 h-10 border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-0 focus:border-[#88B072] text-xs font-semibold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="h-10 px-3 border border-slate-100 rounded bg-slate-50/50 focus:border-[#88B072] outline-none text-[11px] font-bold uppercase tracking-widest text-slate-500 min-w-[140px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">ALL STATUS</option>
                            <option value="active">ACTIVE STAFF</option>
                            <option value="on_leave">ON LEAVE</option>
                            <option value="suspended">SUSPENDED</option>
                            <option value="terminated">TERMINATED</option>
                            <option value="resigned">RESIGNED</option>
                        </select>
                        <Button
                            variant="outline"
                            className="h-10 border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest px-4"
                        >
                            <Filter className="h-3.5 w-3.5 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent mb-4"></div>
                    <p className="font-medium text-gray-500">Loading your team...</p>
                </div>
            ) : employees.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">No team members found</h2>
                    <p className="text-gray-500 max-w-sm mb-6 text-sm">
                        {searchTerm || statusFilter !== 'all'
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Get started by adding your first employee to the system."}
                    </p>
                    {(searchTerm || statusFilter !== 'all') ? (
                        <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                            Clear Filters
                        </Button>
                    ) : (
                        <Button onClick={() => navigate('/employees/new')} className="bg-primary-600 text-white shadow-sm hover:bg-primary-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Employee
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    {/* Mobile Card View - Enhanced with Icons */}
                    <div className="md:hidden space-y-4">
                        {employees.map((employee) => (
                            <Card
                                key={employee.id}
                                className="border border-gray-100 shadow-sm transition-shadow cursor-pointer active:scale-[0.98] group"
                                onClick={() => navigate(`/employees/${employee.id}/edit`)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="relative h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                            {employee.photo ? (
                                                <img
                                                    src={getImageUrl(employee.photo)}
                                                    alt={employee.full_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-gray-400">{employee.first_name?.[0]}{employee.last_name?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate pr-2 text-sm group-hover:text-primary-600 transition-colors">{employee.full_name}</h3>
                                                <StatusBadge status={employee.employment_status} />
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mb-3 font-medium">{employee.job_title}</p>

                                            <div className="space-y-1.5 border-t border-gray-50 pt-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="truncate">{employee.department_name || 'No Dept'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="truncate">{employee.email}</span>
                                                </div>
                                                {employee.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="truncate">{employee.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="hidden md:block bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-[10px] text-slate-400 uppercase tracking-widest pl-6 h-12 w-[300px]">Employee</TableHead>
                                    <TableHead className="font-bold text-[10px] text-slate-400 uppercase tracking-widest h-12">Role & Dept</TableHead>
                                    <TableHead className="font-bold text-[10px] text-slate-400 uppercase tracking-widest h-12">Status</TableHead>
                                    <TableHead className="font-bold text-[10px] text-slate-400 uppercase tracking-widest h-12 w-[250px]">Contact</TableHead>
                                    <TableHead className="font-bold text-[10px] text-slate-400 uppercase tracking-widest h-12">Joined</TableHead>
                                    <TableHead className="font-bold text-[10px] text-slate-400 uppercase tracking-widest text-right pr-6 h-12">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow
                                        key={employee.id}
                                        className="cursor-pointer hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0"
                                        onClick={() => navigate(`/employees/${employee.id}/edit`)}
                                    >
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-9 w-9 rounded bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                                    {employee.photo ? (
                                                        <img
                                                            src={getImageUrl(employee.photo)}
                                                            alt={employee.full_name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-400">{employee.first_name?.[0]}{employee.last_name?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm group-hover:text-[#88B072] transition-colors">{employee.full_name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{employee.employee_number}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="text-xs font-bold text-slate-700 mb-0.5">{employee.job_title}</div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <Building2 className="h-3 w-3" />
                                                {employee.department_name || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <StatusBadge status={employee.employment_status} />
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                                                    <Mail className="h-3.5 w-3.5 text-slate-300" />
                                                    <span className="truncate max-w-[160px]">{employee.email}</span>
                                                </div>
                                                {employee.phone && (
                                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                                                        <Phone className="h-3.5 w-3.5 text-slate-300" />
                                                        {employee.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="text-xs font-semibold text-slate-500">
                                                {new Date(employee.join_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#88B072] hover:bg-[#88B072]/5"
                                            >
                                                Manage
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
