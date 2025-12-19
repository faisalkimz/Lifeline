import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Building2, Crown,
    Search, Plus, Edit
} from 'lucide-react';

import {
    useGetManagersQuery,
    useGetDepartmentsQuery,
    usePromoteToManagerMutation,
    useGetEmployeesQuery
} from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../auth/authSlice';
import PromoteManagerModal from './PromoteManagerModal';
import toast from 'react-hot-toast';

const ManagerManagementPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const { data: managersData, isLoading, refetch } = useGetManagersQuery(undefined, {
        skip: !isAuthenticated
    });
    const { data: allEmployeesData } = useGetEmployeesQuery({ employment_status: 'active' }, { skip: !isAuthenticated });
    const { data: departments } = useGetDepartmentsQuery(undefined, {
        skip: !isAuthenticated
    });

    const [promoteToManager] = usePromoteToManagerMutation();

    const managers = useMemo(() => {
        const mgrs = Array.isArray(managersData) ? managersData : [];
        const byId = new Map();

        mgrs.forEach(m => {
            byId.set(m.id, { ...m, full_name: m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() });
        });

        if (Array.isArray(allEmployeesData)) {
            allEmployeesData.forEach(e => {
                if (String(e.job_title || '').toLowerCase().includes('manager') && !byId.has(e.id)) {
                    byId.set(e.id, { ...e, full_name: e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() });
                }
            });
        }
        return Array.from(byId.values());
    }, [managersData, allEmployeesData]);

    const filteredManagers = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return managers.filter(m =>
            m.full_name.toLowerCase().includes(q) ||
            (m.job_title || '').toLowerCase().includes(q) ||
            (m.employee_number || '').toLowerCase().includes(q)
        );
    }, [managers, searchTerm]);

    const stats = useMemo(() => ({
        total: managers.length,
        deptHeads: managers.filter(m => departments?.some(d => d.manager === m.id)).length,
        totalSubordinates: managers.reduce((acc, m) => acc + (m.subordinates?.length || 0), 0),
    }), [managers, departments]);

    const handlePromote = async (data) => {
        try {
            await promoteToManager(data).unwrap();
            toast.success("Manager promoted successfully");
            refetch();
            setIsPromoteModalOpen(false);
        } catch (err) {
            toast.error(err?.data?.error || "Failed to promote");
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Managers</h1>
                    <p className="text-gray-600 mt-1">Manage your team leaders</p>
                </div>
                <Button onClick={() => setIsPromoteModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Promote Manager
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Crown className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-sm text-gray-600">Total Managers</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.deptHeads}</p>
                            <p className="text-sm text-gray-600">Department Heads</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSubordinates}</p>
                            <p className="text-sm text-gray-600">Total Reports</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Table */}
            <Card className="border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search managers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-left">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-600">Manager</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-600">Department</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-600">Reports</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-600">Position</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    [1, 2, 3].map(i => <tr key={i} className="h-16 bg-gray-50 animate-pulse"></tr>)
                                ) : filteredManagers.map((manager) => {
                                    const dept = departments?.find(d => d.manager === manager.id);
                                    return (
                                        <tr key={manager.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                        {manager.full_name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{manager.full_name}</div>
                                                        <div className="text-sm text-gray-600">{manager.employee_number || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {dept ? (
                                                    <span className="text-sm text-gray-900">{dept.name}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">{manager.subordinates?.length || 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{manager.job_title}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    onClick={() => navigate(`/employees/${manager.id}/edit`)}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <PromoteManagerModal
                isOpen={isPromoteModalOpen}
                onClose={() => setIsPromoteModalOpen(false)}
                onPromote={handlePromote}
            />
        </div>
    );
};

export default ManagerManagementPage;
