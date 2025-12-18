import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Building2, UserCheck, Crown,
    Search, Plus, Edit, Shield, Activity,
    TrendingUp, Map as MapIcon, Layout, Target, Menu
} from 'lucide-react';

import {
    useGetManagersQuery,
    useGetDepartmentsQuery,
    usePromoteToManagerMutation,
    useGetEmployeesQuery
} from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../auth/authSlice';
import PromoteManagerModal from './PromoteManagerModal';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

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
        coverage: Math.round((departments?.filter(d => d.manager).length / (departments?.length || 1)) * 100),
        avgTeam: managers.length ? Math.round(managers.reduce((acc, m) => acc + (m.subordinates?.length || 0), 0) / managers.length) : 0
    }), [managers, departments]);

    const handlePromote = async (data) => {
        try {
            await promoteToManager(data).unwrap();
            toast.success("Leadership status granted successfully");
            refetch();
            setIsPromoteModalOpen(false);
        } catch (err) {
            toast.error(err?.data?.error || "Promotion protocol failed");
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in font-sans">
            {/* Tactical Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-10">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
                        <Crown className="h-10 w-10 text-primary-600" />
                        Command Intelligence
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                        <Shield className="h-3 w-3 text-indigo-500" /> Operational Leadership & Hierarchy Management
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => setIsPromoteModalOpen(true)}
                        className="bg-slate-900 hover:bg-black text-white rounded-2xl h-14 px-10 font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-900/20 transform hover:-translate-y-1 transition-all"
                    >
                        <Plus className="h-5 w-5 mr-3" /> Initialize Rank Promotion
                    </Button>
                </div>
            </div>

            {/* Intelligence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <IntelCard
                    label="Executive Density"
                    value={stats.total}
                    icon={<Crown className="h-6 w-6" />}
                    trend="+2 Active"
                    color="from-primary-50 to-white"
                />
               <IntelCard
                    label="Departmental Reach"
                    value={`${stats.coverage}%`}
                    icon={<MapIcon className="h-6 w-6" />}
                    trend="High Coverage"
                    color="from-indigo-50 to-white"
                />
                <IntelCard
                    label="Subordinate Flow"
                    value={managers.reduce((acc, m) => acc + (m.subordinates?.length || 0), 0)}
                    icon={<Users className="h-6 w-6" />}
                    trend="Active Nodes"
                    color="from-emerald-50 to-white"
                />
                <IntelCard
                    label="Avg Vector Span"
                    value={stats.avgTeam}
                    icon={<Activity className="h-6 w-6" />}
                    trend="Balanced"
                    color="from-amber-50 to-white"
                />
            </div>

            {/* Tactical Search Terminal */}
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="p-8 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                className="w-full h-16 bg-white border-2 border-slate-200/60 rounded-3xl pl-16 pr-6 font-bold text-slate-900 focus:border-primary-500 focus:ring-0 transition-all shadow-inner outline-none placeholder:text-slate-400"
                                placeholder="Search by Node Name, ID, or Tactical Role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="h-16 w-16 rounded-3xl border-2">
                                <Menu className="h-6 w-6" />
                            </Button>
                            <Button variant="outline" className="h-16 px-8 rounded-3xl border-2 font-black uppercase text-[10px] tracking-widest bg-white">
                                <Layout className="h-4 w-4 mr-2" /> View Layout
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto p-4">
                        <table className="w-full border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-left font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">
                                    <th className="px-8 pb-4">Personnel Cluster</th>
                                    <th className="px-8 pb-4">Department Unit</th>
                                    <th className="px-8 pb-4 text-center">Span of Control</th>
                                    <th className="px-8 pb-4">Operational Rank</th>
                                    <th className="px-8 pb-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [1, 2, 3].map(i => <tr key={i} className="h-24 bg-slate-50 animate-pulse rounded-[2rem]"></tr>)
                                ) : filteredManagers.map((manager) => {
                                    const dept = departments?.find(d => d.manager === manager.id);
                                    return (
                                        <tr key={manager.id} className="group bg-white hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-xl rounded-[2rem] border border-slate-100">
                                            <td className="px-8 py-6 rounded-l-[2rem]">
                                                <div className="flex items-center gap-5">
                                                    <div className="relative h-14 w-14 rounded-2xl bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xl italic group-hover:scale-110 transition-transform overflow-hidden">
                                                        {manager.photo ? (
                                                            <img src={manager.photo} className="h-full w-full object-cover" alt="" />
                                                        ) : (
                                                            <span>{manager.full_name[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 uppercase italic tracking-tight">{manager.full_name}</div>
                                                        <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{manager.employee_number || 'ID-0000'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {dept ? (
                                                    <span className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                        <Target className="h-3 w-3 mr-2" /> {dept.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 font-bold italic text-xs">Unassigned Unit</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-2xl font-black italic text-slate-900">{manager.subordinates?.length || 0}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Direct Nodes</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-bold text-slate-700 uppercase tracking-tight max-w-[150px] truncate">
                                                    {manager.job_title}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right rounded-r-[2rem]">
                                                <Button
                                                    onClick={() => navigate(`/employees/${manager.id}/edit`)}
                                                    variant="ghost"
                                                    className="h-12 w-12 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Edit className="h-5 w-5" />
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

const IntelCard = ({ label, value, icon, trend, color }) => (
    <Card className={cn("border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group hover:scale-105 transition-all duration-500")}>
        <CardContent className={cn("p-8 bg-gradient-to-br transition-all", color)}>
            <div className="flex justify-between items-start">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-50 group-hover:rotate-12 transition-transform">
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
                    <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">{value}</h3>
                </div>
            </div>
            <div className="mt-8 flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{trend}</span>
            </div>
        </CardContent>
    </Card>
);

export default ManagerManagementPage;














