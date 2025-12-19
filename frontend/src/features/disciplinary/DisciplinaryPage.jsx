import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Search, ChevronLeft, ChevronRight, AlertCircle,
    FileText, Filter, Plus, User, Calendar,
    AlertTriangle, CheckCircle, Clock, Info, MessageSquare, Save, X
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import {
    useGetDisciplinaryActionsQuery,
    useCreateDisciplinaryActionMutation,
    useUpdateDisciplinaryActionMutation,
    useSubmitDisciplinaryStatementMutation,
    useGetEmployeesQuery
} from '../../store/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const DisciplinaryPage = () => {
    const user = useSelector(selectCurrentUser);
    const isAdmin = user?.role !== 'employee';
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [statement, setStatement] = useState('');

    const { data: actionsData, isLoading } = useGetDisciplinaryActionsQuery({
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter
    });
    const { data: employees } = useGetEmployeesQuery();

    const [createAction, { isLoading: isCreating }] = useCreateDisciplinaryActionMutation();
    const [updateAction, { isLoading: isUpdating }] = useUpdateDisciplinaryActionMutation();
    const [submitStatement, { isLoading: isSubmitting }] = useSubmitDisciplinaryStatementMutation();

    const [formData, setFormData] = useState({
        employee: '',
        reason: '',
        description: '',
        incident_date: new Date().toISOString().split('T')[0],
        severity: 'minor',
        status: 'active'
    });

    const [updateFormData, setUpdateFormData] = useState({
        decision: '',
        status: '',
        action_taken: ''
    });

    const cases = Array.isArray(actionsData) ? actionsData : (actionsData?.results || []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createAction(formData).unwrap();
            toast.success('Disciplinary case created successfully');
            setIsCreateDialogOpen(false);
            setFormData({
                employee: '',
                reason: '',
                description: '',
                incident_date: new Date().toISOString().split('T')[0],
                severity: 'minor',
                status: 'active'
            });
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to create case');
        }
    };

    const handleUpdateCase = async (e) => {
        e.preventDefault();
        if (!selectedCase) return;
        try {
            await updateAction({
                id: selectedCase.id,
                ...updateFormData
            }).unwrap();
            toast.success('Case updated successfully');
            setSelectedCase(null);
        } catch (error) {
            toast.error('Failed to update case');
        }
    };

    const handleSubmitStatement = async () => {
        if (!statement) return;
        try {
            await submitStatement({ id: selectedCase.id, statement }).unwrap();
            toast.success('Statement submitted successfully');
            setStatement('');
            setSelectedCase(null);
        } catch (error) {
            toast.error('Failed to submit statement');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'closed': return 'bg-green-100 text-green-700 border-green-200';
            case 'under_appeal': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-600';
            case 'severe': return 'text-orange-600';
            default: return 'text-slate-600';
        }
    };

    const openCaseView = (caseItem) => {
        setSelectedCase(caseItem);
        setUpdateFormData({
            decision: caseItem.decision || '',
            status: caseItem.status || 'active',
            action_taken: caseItem.action_taken || ''
        });
        setStatement(caseItem.employee_statement || '');
    };

    return (
        <div className="space-y-8 pb-10 font-sans text-slate-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg">
                        <AlertTriangle className="h-8 w-8 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Disciplinary Management</h1>
                        <p className="text-slate-500 font-medium">Employee Conduct & Disciplinary Actions</p>
                    </div>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800 shadow-xl rounded-xl px-6">
                        <Plus className="h-4 w-4 mr-2" /> New Disciplinary Case
                    </Button>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Case ID or Name..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                    >
                        <option value="all">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-[0.1em] text-[10px]">
                            <tr>
                                <th className="px-6 py-5">Incident</th>
                                <th className="px-6 py-5">Employee</th>
                                <th className="px-6 py-5">Severity</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : cases.length > 0 ? (
                                cases.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">{item.case_id}</span>
                                                <span className="font-bold text-slate-900 mt-1">{item.reason}</span>
                                                <span className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3" /> {item.incident_date}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 border border-slate-200">
                                                    {item.employee_name[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{item.employee_name}</span>
                                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Employee</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn("font-black capitalize text-[11px] tracking-wide", getSeverityStyle(item.severity))}>
                                                {item.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn("inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border", getStatusStyle(item.status))}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openCaseView(item)}
                                                className="border-slate-200 hover:bg-slate-900 hover:text-white transition-all rounded-xl gap-2 font-bold"
                                            >
                                                <Info className="h-3.5 w-3.5" /> Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                                                <FileText className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="text-xl font-black text-slate-900 tracking-tight">No Cases Found</p>
                                            <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm font-medium">
                                                No disciplinary records found for this selection.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Case Details Dialog */}
            <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden">
                    {selectedCase && (
                        <div className="flex flex-col bg-white">
                            {/* Detailed Header */}
                            <div className="bg-slate-900 p-8 text-white relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <AlertTriangle className="h-32 w-32" />
                                </div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em]">CONFIDENTIAL RECORD</span>
                                        <h2 className="text-3xl font-black tracking-tight">{selectedCase.case_id}</h2>
                                    </div>
                                    <Badge variant={getStatusStyle(selectedCase.status)} className="px-6 py-2 rounded-xl text-xs font-black">
                                        {selectedCase.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left Side: Case Info */}
                                <div className="md:col-span-2 space-y-8">
                                    <section>
                                        <h4 className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest mb-4">
                                            <FileText className="h-4 w-4 text-orange-500" /> Case Description
                                        </h4>
                                        <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                                            <h3 className="text-xl font-bold text-slate-900 mb-3">{selectedCase.reason}</h3>
                                            <p className="text-slate-600 leading-relaxed italic">"{selectedCase.description}"</p>
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest mb-4">
                                            <MessageSquare className="h-4 w-4 text-blue-500" /> Employee Response
                                        </h4>
                                        {selectedCase.employee_statement ? (
                                            <div className="bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-100">
                                                <p className="text-blue-900 font-medium leading-relaxed">
                                                    {selectedCase.employee_statement}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-[1.5rem]">
                                                {user?.employee?.id === selectedCase.employee ? (
                                                    <div className="space-y-4">
                                                        <p className="text-sm text-slate-500 font-medium">Please provide your official statement regarding this case.</p>
                                                        <textarea
                                                            className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/5 transition-all text-sm resize-none"
                                                            placeholder="Type your response here..."
                                                            value={statement}
                                                            onChange={(e) => setStatement(e.target.value)}
                                                        />
                                                        <Button
                                                            onClick={handleSubmitStatement}
                                                            disabled={isSubmitting || !statement}
                                                            className="bg-slate-900 hover:bg-slate-800 rounded-xl w-full"
                                                        >
                                                            {isSubmitting ? 'Submitting...' : 'Submit Official Statement'}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-400 font-bold italic">Awaiting employee statement...</p>
                                                )}
                                            </div>
                                        )}
                                    </section>

                                    {isAdmin && (
                                        <section>
                                            <h4 className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest mb-4">
                                                <Save className="h-4 w-4 text-emerald-500" /> Management Decision
                                            </h4>
                                            <form onSubmit={handleUpdateCase} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Status</label>
                                                        <select
                                                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                            value={updateFormData.status}
                                                            onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="under_appeal">Under Appeal</option>
                                                            <option value="closed">Closed</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Taken</label>
                                                        <select
                                                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                            value={updateFormData.action_taken}
                                                            onChange={(e) => setUpdateFormData({ ...updateFormData, action_taken: e.target.value })}
                                                        >
                                                            <option value="">Select Action</option>
                                                            <option value="warning">Verbal Warning</option>
                                                            <option value="written_warning">Written Warning</option>
                                                            <option value="suspension">Suspension</option>
                                                            <option value="termination">Termination</option>
                                                            <option value="exonerated">Exonerated</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decision Summary</label>
                                                    <textarea
                                                        className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                                                        value={updateFormData.decision}
                                                        onChange={(e) => setUpdateFormData({ ...updateFormData, decision: e.target.value })}
                                                        placeholder="Document the final decision..."
                                                    />
                                                </div>
                                                <Button type="submit" disabled={isUpdating} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl w-full font-black uppercase tracking-widest h-12 shadow-lg shadow-emerald-100">
                                                    {isUpdating ? 'Saving...' : 'Save Decision'}
                                                </Button>
                                            </form>
                                        </section>
                                    )}
                                </div>

                                {/* Right Side: Personnel & Log */}
                                <div className="space-y-6">
                                    <Card className="bg-slate-50 border-none rounded-[1.5rem] p-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Employee</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-lg font-black text-slate-900 shadow-sm border border-slate-100">
                                                {selectedCase.employee_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{selectedCase.employee_name}</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Active</p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="bg-slate-50 border-none rounded-[1.5rem] p-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Case Details</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">Incident Date</span>
                                                <span className="text-xs font-black text-slate-900">{selectedCase.incident_date}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">Severity Level</span>
                                                <span className={cn("text-xs font-black uppercase tracking-widest", getSeverityStyle(selectedCase.severity))}>
                                                    {selectedCase.severity}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">Issued On</span>
                                                <span className="text-xs font-black text-slate-900">{new Date(selectedCase.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </Card>

                                    <Button onClick={() => setSelectedCase(null)} variant="outline" className="w-full rounded-xl h-12 border-slate-200 font-bold hover:bg-slate-50">
                                        <X className="h-4 w-4 mr-2" /> Close View
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Case Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 p-8 text-white relative">
                        <DialogTitle className="text-2xl font-black tracking-tight">New Disciplinary Case</DialogTitle>
                        <p className="text-slate-400 text-sm mt-1">Record a new disciplinary incident.</p>
                    </div>

                    <form onSubmit={handleCreate} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Employee</label>
                                <select
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white focus:outline-none transition-all font-medium text-slate-900"
                                    value={formData.employee}
                                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees?.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Incident Date</label>
                                <input
                                    type="date"
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white focus:outline-none transition-all font-medium text-slate-900"
                                    value={formData.incident_date}
                                    onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Reason for Action</label>
                            <Input
                                placeholder="Nature of the conduct issue..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                required
                                className="h-12 border-2 border-slate-100 rounded-2xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Description</label>
                            <textarea
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white focus:outline-none transition-all font-medium text-slate-900 min-h-[120px] resize-none"
                                placeholder="Describe exactly what occurred..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Severity Level</label>
                                <select
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white focus:outline-none transition-all font-medium text-slate-900"
                                    value={formData.severity}
                                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                >
                                    <option value="minor">Minor</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="severe">Severe</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Initial Status</label>
                                <select
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white focus:outline-none transition-all font-medium text-slate-900"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="draft">Review Draft</option>
                                    <option value="active">Active Case</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl px-8 h-12">Cancel</Button>
                            <Button type="submit" disabled={isCreating} className="bg-slate-900 hover:bg-slate-800 rounded-xl px-12 h-12 shadow-xl shadow-slate-200">
                                {isCreating ? 'Processing...' : 'Create Case'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DisciplinaryPage;
