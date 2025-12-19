import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, Search, Filter, MoreVertical,
    Mail, Phone, MapPin, Calendar, Building2, Sparkles,
    CheckCircle, XCircle, Clock, LogOut, AlertCircle
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

const StatusBadge = ({ status }) => {
    const config = {
        active: { color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle, label: "Active" },
        on_leave: { color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock, label: "On Leave" },
        terminated: { color: "text-rose-700 bg-rose-50 border-rose-200", icon: XCircle, label: "Terminated" },
        resigned: { color: "text-slate-700 bg-slate-100 border-slate-200", icon: LogOut, label: "Resigned" },
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

    const getImageUrl = (photoPath) => {
        return getMediaUrl(photoPath);
    };

    const { data: employeesData, isLoading } = useGetEmployeesQuery({
        search: searchTerm,
        employment_status: statusFilter !== 'all' ? statusFilter : undefined
    });

    // Handle API response structure safely
    const employees = Array.isArray(employeesData?.results)
        ? employeesData.results
        : (Array.isArray(employeesData) ? employeesData : []);

    const { data: stats } = useGetEmployeeStatsQuery();

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header with gradient */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Members</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your workforce, track status, and view profiles.</p>
                </div>
                <Button
                    onClick={() => navigate('/employees/new')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Employee
                </Button>
            </div>

            {/* Stats Overview with enhanced design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Team"
                    value={stats?.total || 0}
                    icon={Users}
                    color="bg-blue-500"
                    trend="+12% growth"
                />
                <StatCard
                    title="Active Now"
                    value={stats?.active || 0}
                    icon={Sparkles}
                    color="bg-emerald-500"
                    trend="Working today"
                />
                <StatCard
                    title="On Leave"
                    value={stats?.on_leave || 0}
                    icon={Calendar}
                    color="bg-amber-500"
                    trend={stats?.on_leave > 0 ? "Away" : "Full team"}
                />
                <StatCard
                    title="Departments"
                    value={stats?.departments_count || 0}
                    icon={Building2}
                    color="bg-purple-500"
                    trend="Organization"
                />
            </div>

            {/* Enhanced Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-4 z-20">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, or department..."
                            className="pl-12 h-11 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            className="h-11 px-4 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm font-medium text-slate-700 cursor-pointer hover:border-slate-300"
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
                        <Button
                            variant="outline"
                            className="h-11 border-slate-200 hover:bg-slate-50 text-slate-700"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            More Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
                    <p className="font-medium">Loading your team...</p>
                </div>
            ) : employees.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No team members found</h2>
                    <p className="text-slate-500 max-w-sm mb-6">
                        {searchTerm || statusFilter !== 'all'
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Get started by adding your first employee to the system."}
                    </p>
                    {(searchTerm || statusFilter !== 'all') ? (
                        <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                            Clear Filters
                        </Button>
                    ) : (
                        <Button onClick={() => navigate('/employees/new')} className="bg-primary-600 text-white shadow-lg">
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
                            <Card
                                key={employee.id}
                                className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
                                onClick={() => navigate(`/employees/${employee.id}/edit`)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="relative h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                            {employee.photo ? (
                                                <img
                                                    src={getImageUrl(employee.photo)}
                                                    alt={employee.full_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg font-bold text-slate-400">{employee.first_name?.[0]}{employee.last_name?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="font-bold text-slate-900 truncate pr-2">{employee.full_name}</h3>
                                                <StatusBadge status={employee.employment_status} />
                                            </div>
                                            <p className="text-sm text-slate-500 truncate mb-2">{employee.job_title}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Building2 className="h-3 w-3" /> {employee.department_name || 'No Dept'}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-bold text-slate-600 pl-6 h-12">Employee</TableHead>
                                        <TableHead className="font-bold text-slate-600 h-12">Role & Dept</TableHead>
                                        <TableHead className="font-bold text-slate-600 h-12">Status</TableHead>
                                        <TableHead className="font-bold text-slate-600 h-12">Contact</TableHead>
                                        <TableHead className="font-bold text-slate-600 h-12">Joined</TableHead>
                                        <TableHead className="font-bold text-slate-600 text-right pr-6 h-12">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((employee) => (
                                        <TableRow
                                            key={employee.id}
                                            className="cursor-pointer hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-0"
                                            onClick={() => navigate(`/employees/${employee.id}/edit`)}
                                        >
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                                                        {employee.photo ? (
                                                            <img
                                                                src={getImageUrl(employee.photo)}
                                                                alt={employee.full_name}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-400">{employee.first_name?.[0]}{employee.last_name?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{employee.full_name}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{employee.employee_number}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="font-medium text-slate-700">{employee.job_title}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                                    <Building2 className="h-3 w-3" />
                                                    {employee.department_name || 'No Dept'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <StatusBadge status={employee.employment_status} />
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="truncate max-w-[150px]">{employee.email}</span>
                                                    </div>
                                                    {employee.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                            {employee.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="h-4 w-4 text-slate-400" />
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
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EmployeeListPage;
