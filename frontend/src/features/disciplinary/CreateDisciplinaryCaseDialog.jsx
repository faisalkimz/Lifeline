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
            <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl border border-slate-100">
                <DialogHeader className="p-8 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">New Case Record</DialogTitle>
                            <p className="text-slate-500 text-sm mt-1 font-medium">Document a new disciplinary incident.</p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" /> Employee Involved
                            </label>
                            <select
                                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 outline-none transition-all"
                                value={formData.employee}
                                onChange={(e) => handleInputChange('employee', e.target.value)}
                                required
                            >
                                <option value="">Select Employee...</option>
                                {employees?.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" /> Incident Date
                            </label>
                            <input
                                type="date"
                                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 outline-none transition-all text-slate-900"
                                value={formData.incident_date}
                                onChange={(e) => handleInputChange('incident_date', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5" /> Reason / Violation title
                        </label>
                        <Input
                            placeholder="e.g. Unexcused Absence, Code of Conduct Violation"
                            value={formData.reason}
                            onChange={(e) => handleInputChange('reason', e.target.value)}
                            required
                            className="h-11 bg-white border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" /> Incident Details
                        </label>
                        <textarea
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 outline-none transition-all font-medium text-slate-900 min-h-[120px] resize-none text-sm leading-relaxed"
                            placeholder="Provide a detailed description of the incident, effectively documenting what occurred..."
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Level</label>
                            <select
                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900/10 outline-none"
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
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Status</label>
                            <select
                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900/10 outline-none"
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                            >
                                <option value="draft">Review Draft</option>
                                <option value="active">Active Case</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-slate-500 hover:text-slate-900 font-medium">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-11 font-bold shadow-lg shadow-slate-900/20">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
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
