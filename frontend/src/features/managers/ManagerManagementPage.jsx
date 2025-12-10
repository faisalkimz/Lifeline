import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Building2, UserCheck, Crown,
    Search, Plus, Edit
} from 'lucide-react';
import { useGetManagersQuery, useGetDepartmentsQuery, usePromoteToManagerMutation, useGetEmployeesQuery } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '../../components/ui/Table';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../auth/authSlice';
import PromoteManagerModal from './PromoteManagerModal';
import toast from 'react-hot-toast';

const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;

    // If path is absolute on the same host (starts with '/'), use window origin
    if (photoPath.startsWith('/')) {
        return `${window.location.origin}${photoPath}`;
    }

    // If a VITE_API_BASE_URL is configured and looks like a URL, use it
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (baseUrl && baseUrl.startsWith('http')) {
        return `${baseUrl.replace(/\/$/, '')}/${photoPath.replace(/^\//, '')}`;
    }

    // Fallback: return the raw path so the browser can resolve relatively
    return photoPath;
};

const ManagerManagementPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

    const isAuthenticated = useSelector(selectIsAuthenticated);

    const { data: managersData, isLoading, refetch } = useGetManagersQuery(undefined, {
        skip: !isAuthenticated
    });
    // Also fetch all active employees as a fallback source for manager-like roles
    const { data: allEmployeesData } = useGetEmployeesQuery({ employment_status: 'active' }, { skip: !isAuthenticated });
    const { data: departments } = useGetDepartmentsQuery(undefined, {
        skip: !isAuthenticated
    });

    // Debugging: log managers/departments responses to help troubleshoot missing data
    React.useEffect(() => {
        if (!isLoading) {
            // eslint-disable-next-line no-console
            console.debug('Managers data:', managersData);
            // eslint-disable-next-line no-console
            console.debug('Departments data:', departments);
        }
    }, [managersData, departments, isLoading]);

    const [promoteToManager, { isLoading: isPromoting }] = usePromoteToManagerMutation();

    // Handle managers data properly. If the managers endpoint returns unexpectedly few
    // results, also include employees whose job_title contains "manager" as a fallback.
    const managers = useMemo(() => {
        const mgrs = Array.isArray(managersData) ? managersData.slice() : [];

        // Normalize existing managers into a map by id
        const byId = new Map();
        mgrs.forEach(m => {
            const full_name = m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim();
            byId.set(m.id, { ...m, full_name });
        });

        // If we have employee data, look for titles that include "manager" (case-insensitive)
        if (Array.isArray(allEmployeesData) && allEmployeesData.length > 0) {
            allEmployeesData.forEach(e => {
                const title = String(e.job_title || '').toLowerCase();
                if (title.includes('manager') && !byId.has(e.id)) {
                    const full_name = e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim();
                    byId.set(e.id, { ...e, full_name });
                }
            });
        }

        // Return as array
        return Array.from(byId.values());
    }, [managersData, allEmployeesData]);

    const filteredManagers = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return managers;

        return managers.filter(manager => {
            const name = (manager.full_name || '').toLowerCase();
            const title = (manager.job_title || '').toLowerCase();
            const number = (manager.employee_number || '').toLowerCase();
            return name.includes(q) || title.includes(q) || number.includes(q);
        });
    }, [managers, searchTerm]);

    const stats = useMemo(() => ({
        total: managers.length,
        departmentHeads: managers.filter(m => departments?.find(d => d.manager === m.id)).length,
        totalReports: managers.reduce((acc, m) => acc + (m.subordinates?.length || 0), 0),
        avgTeamSize: managers.length > 0
            ? Math.round(managers.reduce((acc, m) => acc + (m.subordinates?.length || 0), 0) / managers.length)
            : 0
    }), [managers, departments]);

    const handlePromoteEmployees = async (promotionData) => {
        try {
            const result = await promoteToManager(promotionData).unwrap();
            toast.success(result.message || 'Employees promoted successfully');
            refetch();
            setIsPromoteModalOpen(false);
        } catch (error) {
            console.error('Promotion failed:', error);
            toast.error(error?.data?.error || 'Failed to promote employees');
        }
    };

    return (
        <div className="space-y-10 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                    <h1 className="text-2xl font-bold text-black">Team Leaders</h1>
                    <p className="text-sm text-gray-600 mt-1 max-w-xl">Manage who leads teams and departments — view leaders, their team sizes, and quickly edit leader profiles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                        className="h-9 px-3"
                    >
                        {viewMode === 'grid' ? 'Table' : 'Cards'}
                    </Button>
                    <Button onClick={() => setIsPromoteModalOpen(true)} className="h-9 px-3 btn-primary">
                        <Crown className="h-4 w-4 mr-2" />
                        Promote
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Leaders"
                    value={stats.total}
                    icon="Crown"
                    color="primary"
                />
                <StatCard
                    title="Dept Heads"
                    value={stats.departmentHeads}
                    icon="Building2"
                    color="success"
                />
                <StatCard
                    title="Reports"
                    value={stats.totalReports}
                    icon="Users"
                    color="warning"
                />
                <StatCard
                    title="Avg Team"
                    value={stats.avgTeamSize}
                    icon="UserCheck"
                    color="info"
                />
            </div>

            <Card className="bg-white border border-primary-50">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name, title, or ID..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden bg-white border border-primary-50">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-primary-50">
                                <TableHead className="text-black">Leader</TableHead>
                                <TableHead className="text-black">Department</TableHead>
                                <TableHead className="text-center text-black">Reports</TableHead>
                                <TableHead className="text-black">Role</TableHead>
                                <TableHead className="text-right text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i} className="">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 animate-pulse"></div>
                                                <div className="space-y-1">
                                                    <div className="h-4 bg-primary-50 rounded w-32 animate-pulse"></div>
                                                    <div className="h-3 bg-primary-50 rounded w-24 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><div className="h-4 bg-primary-50 rounded w-20 animate-pulse"></div></TableCell>
                                        <TableCell className="text-center"><div className="h-4 bg-primary-50 rounded w-8 animate-pulse mx-auto"></div></TableCell>
                                        <TableCell><div className="h-4 bg-primary-50 rounded w-24 animate-pulse"></div></TableCell>
                                        <TableCell className="text-right"><div className="h-8 w-16 bg-primary-50 rounded animate-pulse"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredManagers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <div className="text-primary-600">
                                            <Crown className="h-12 w-12 mx-auto mb-3 opacity-40" />
                                            <p className="font-medium">No team leaders yet</p>
                                            <p className="text-sm mt-1">Promote an employee to get started</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredManagers.map((manager) => {
                                    const dept = departments?.find(d => d.manager === manager.id);
                                    const photo = getImageUrl(manager.photo);

                                    return (
                                        <TableRow key={manager.id} className="hover:bg-primary-50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {photo ? (
                                                            <img 
                                                                src={photo}
                                                                alt={manager.full_name}
                                                                className="h-10 w-10 rounded-full object-cover bg-primary-50"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold bg-primary-100 text-primary-700">
                                                                {manager.first_name?.[0]}{manager.last_name?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-black">{manager.full_name}</div>
                                                        <div className="text-xs text-gray-500">{manager.employee_number}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {dept ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium">
                                                        {dept.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 text-xs">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700">
                                                    {manager.subordinates?.length || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-black max-w-xs truncate">{manager.job_title}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-primary-600 hover:text-primary-700"
                                                        onClick={() => navigate(`/employees/${manager.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <PromoteManagerModal
                isOpen={isPromoteModalOpen}
                onClose={() => setIsPromoteModalOpen(false)}
                onPromote={handlePromoteEmployees}
            />
        </div>
    );
};

export default ManagerManagementPage;






