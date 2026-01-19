import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCreateDisciplinaryActionMutation, useGetEmployeesQuery } from '../../store/api';
import toast from 'react-hot-toast';
import { Loader2, AlertTriangle, Calendar, User, FileText, Info } from 'lucide-react';

const CreateDisciplinaryCaseDialog = ({ isOpen, onClose }) => {
    const { data: employees } = useGetEmployeesQuery();
    const [createAction, { isLoading }] = useCreateDisciplinaryActionMutation();

    const [formData, setFormData] = useState({
        employee: '',
        reason: '',
        description: '',
        incident_date: new Date().toISOString().split('T')[0],
        severity: 'minor',
        status: 'active'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createAction(formData).unwrap();
            toast.success('Disciplinary case records created successfully');
            onClose();
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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 overflow-hidden shadow-2xl border-0">
                {/* Header */}
                <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-slate-100">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                        <AlertTriangle className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                            Open Case File
                        </DialogTitle>
                        <p className="text-slate-500 mt-1 font-medium text-sm">
                            Document a disciplinary incident
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Who is involved?</label>
                            <div className="relative">
                                <select
                                    className="w-full h-12 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.employee}
                                    onChange={(e) => handleInputChange('employee', e.target.value)}
                                    required
                                >
                                    <option value="">Select Employee...</option>
                                    {employees?.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                    ))}
                                </select>
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">When did it happen?</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900"
                                    value={formData.incident_date}
                                    onChange={(e) => handleInputChange('incident_date', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">What is the violation?</label>
                        <Input
                            placeholder="e.g. Unexcused Absence, Code of Conduct Violation"
                            value={formData.reason}
                            onChange={(e) => handleInputChange('reason', e.target.value)}
                            required
                            className="h-12 bg-slate-50 border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">The Details</label>
                        <textarea
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 min-h-[140px] resize-none text-sm leading-relaxed focus:bg-white"
                            placeholder="Provide a detailed, objective description of the incident..."
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Severity</label>
                            <select
                                className="w-full h-10 px-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-200 outline-none cursor-pointer"
                                value={formData.severity}
                                onChange={(e) => handleInputChange('severity', e.target.value)}
                            >
                                <option value="minor">Minor</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Initial Status</label>
                            <select
                                className="w-full h-10 px-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-200 outline-none cursor-pointer"
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                            >
                                <option value="draft">Review Draft</option>
                                <option value="active">Active Case</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-6 text-slate-500 hover:text-slate-900 font-bold hover:bg-slate-50 rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
                                </>
                            ) : (
                                'Create Record'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateDisciplinaryCaseDialog;
