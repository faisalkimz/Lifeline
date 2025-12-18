import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Plus, Search, Users,
    Edit, Trash2, UserCheck, Layers
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
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../auth/authSlice';
import toast from 'react-hot-toast';

const StatusBadge = ({ isActive, activeText = "Active", inactiveText = "Inactive" }) => (
    <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border-2 ${isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 ring-2 ring-emerald-100"
            : "bg-gray-100 text-gray-600 border-gray-200 ring-2 ring-gray-100"
            }`}
    >
        {isActive ? `● ${activeText}` : `○ ${inactiveText}`}
    </span>
);

const CountBadge = ({ count }) => {
    const getColor = (count) => {
        if (count === 0) return 'bg-gray-100 text-gray-600 ring-gray-200';
        if (count < 5) return 'bg-blue-100 text-blue-700 ring-blue-200';
        if (count < 10) return 'bg-indigo-100 text-indigo-700 ring-indigo-200';
        return 'bg-purple-100 text-purple-700 ring-purple-200';
    };

    return (
        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-bold ring-2 ${getColor(count)}`}>
            {count} {count === 1 ? 'member' : 'members'}
        </span>
    );
};

const CodeBadge = ({ code }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-md bg-slate-100 text-sm font-bold text-slate-700 font-mono border border-slate-200">
        {code}
    </span>
);

const DepartmentListPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const { data: departments, isLoading, refetch, error } = useGetDepartmentsQuery(undefined, {
        skip: !isAuthenticated
    });
    const [deleteDepartment] = useDeleteDepartmentMutation();



    let departmentsArray = [];
    if (Array.isArray(departments)) {
        departmentsArray = departments;
    } else if (departments && typeof departments === 'object' && Array.isArray(departments.results)) {
        departmentsArray = departments.results;
    }

    const filteredDepartments = departmentsArray.filter(dept =>
        dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await deleteDepartment(id).unwrap();
                toast.success('Department deleted successfully!');
                refetch();
            } catch (error) {
                toast.error(error?.data?.error || 'Failed to delete department');
                console.error('Failed to delete department:', error);
            }
        }
    };

    const totalEmployees = departmentsArray.reduce((acc, dept) => acc + (dept.employee_count || 0), 0);
    const avgTeamSize = departmentsArray.length > 0 ? Math.round(totalEmployees / departmentsArray.length) : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Enhanced Header with gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Building2 className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Departments</h1>
                        </div>
                        <p className="text-blue-100 text-lg">
                            Your organizational structure at a glance
                        </p>
                        {isAuthenticated && user && (
                            <p className="text-xs text-blue-200 mt-2">
                                {user.company?.name} — {user.first_name} {user.last_name}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={() => navigate('/departments/new')}
                        className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Department
                    </Button>
                </div>
            </div>

            {!isAuthenticated && (
                <Card className="border-2 border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                        <p className="text-amber-800 font-medium flex items-center gap-2">
                            ⚠️ Not authenticated — Please log in to view departments
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Departments"
                    value={departmentsArray.length}
                    icon={Layers}
                    color="primary"
                    trend="Organizational units"
                />
                <StatCard
                    title="Total Team Members"
                    value={totalEmployees}
                    icon={Users}
                    color="success"
                    trend="Across all departments"
                />
                <StatCard
                    title="Avg. Team Size"
                    value={avgTeamSize}
                    icon={UserCheck}
                    color="warning"
                    trend={avgTeamSize > 7 ? "Large teams" : "Balanced teams"}
                />
            </div>

            {/* Enhanced Search */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search departments by name or code..."
                            className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Departments Table */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <TableRow className="border-b-2 border-gray-200">
                                <TableHead className="font-bold text-gray-700">Department</TableHead>
                                <TableHead className="font-bold text-gray-700">Code</TableHead>
                                <TableHead className="font-bold text-gray-700">Manager</TableHead>
                                <TableHead className="text-center font-bold text-gray-700">Team Size</TableHead>
                                <TableHead className="font-bold text-gray-700">Status</TableHead>
                                <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                                            <p className="text-gray-500 font-medium">Loading departments...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                                <span className="text-2xl">⚠️</span>
                                            </div>
                                            <div>
                                                <p className="text-red-700 font-semibold">Error loading departments</p>
                                                <button
                                                    onClick={() => refetch()}
                                                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    Try Again
                                                </button>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredDepartments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Building2 className="h-10 w-10 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-semibold text-lg">No departments found</p>
                                                <p className="text-gray-500">Create your first department to organize your team</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDepartments?.map((dept) => (
                                    <TableRow
                                        key={dept.id}
                                        className="cursor-pointer hover:bg-indigo-50/50 transition-colors border-b border-gray-100"
                                        onClick={() => navigate(`/departments/${dept.id}/edit`)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-4 ring-indigo-50">
                                                    <Building2 className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-base">{dept.name}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[250px]">
                                                        {dept.description || 'No description'}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <CodeBadge code={dept.code} />
                                        </TableCell>
                                        <TableCell>
                                            {dept.manager_name ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-blue-100">
                                                        {dept.manager_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{dept.manager_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic flex items-center gap-2">
                                                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <UserCheck className="h-5 w-5 text-gray-300" />
                                                    </div>
                                                    No manager assigned
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <CountBadge count={dept.employee_count || 0} />
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge isActive={dept.is_active} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    className="h-9 w-9 p-0 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/departments/${dept.id}/edit`);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="h-9 w-9 p-0 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
