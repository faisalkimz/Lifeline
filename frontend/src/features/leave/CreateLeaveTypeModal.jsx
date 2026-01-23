import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useCreateLeaveTypeMutation, useUpdateLeaveTypeMutation } from '../../store/api';
import { Check, Settings2, ShieldCheck, Clock, FileText, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateLeaveTypeModal = ({ isOpen, onClose, leaveType = null }) => {
    const isEditing = !!leaveType;
    const [createLeaveType, { isLoading: isCreating }] = useCreateLeaveTypeMutation();
    const [updateLeaveType, { isLoading: isUpdating }] = useUpdateLeaveTypeMutation();

    const [formData, setFormData] = useState({
        name: leaveType?.name || '',
        code: leaveType?.code || '',
        days_per_year: leaveType?.days_per_year || 21,
        requires_document: leaveType?.requires_document || false,
        max_consecutive_days: leaveType?.max_consecutive_days || '',
        is_paid: leaveType?.is_paid !== false,
        description: leaveType?.description || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateLeaveType({ id: leaveType.id, ...formData }).unwrap();
                toast.success('Leave type updated successfully');
            } else {
                await createLeaveType(formData).unwrap();
                toast.success('New leave type created');
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.detail || 'Operation failed');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white border-0 rounded-3xl p-0 overflow-hidden shadow-2xl">
                <div className="bg-slate-900 px-8 py-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                        <Settings2 className="h-32 w-32" />
                    </div>
                    <div className="relative flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <ShieldCheck className="h-7 w-7 text-emerald-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">
                                {isEditing ? 'Configure Leave Type' : 'New Leave Classification'}
                            </DialogTitle>
                            <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">
                                Company Policy Management
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-slate-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Leave Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="h-14 px-5 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-900 transition-all outline-none"
                                    placeholder="e.g. Annual Leave"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Short Code</Label>
                                <Input
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="h-14 px-5 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-slate-900 transition-all outline-none"
                                    placeholder="e.g. AL"
                                    maxLength={5}
                                    required
                                />
                            </div>
                        </div>

                        {/* Allocation */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Annual Allocation</Label>
                                <div className="relative group">
                                    <Input
                                        type="number"
                                        value={formData.days_per_year}
                                        onChange={e => setFormData({ ...formData, days_per_year: e.target.value })}
                                        className="h-14 pl-5 pr-14 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-slate-900 text-xl transition-all outline-none"
                                        required
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm uppercase">Days</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Max Consecutive (Optional)</Label>
                                <div className="relative group">
                                    <Input
                                        type="number"
                                        value={formData.max_consecutive_days}
                                        onChange={e => setFormData({ ...formData, max_consecutive_days: e.target.value })}
                                        className="h-14 pl-5 pr-14 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-slate-900 transition-all outline-none"
                                        placeholder="No limit"
                                    />
                                    <Clock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Policy Description</Label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full min-h-[100px] p-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none font-bold"
                            placeholder="Detail the conditions for this leave type..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div
                            onClick={() => setFormData({ ...formData, requires_document: !formData.requires_document })}
                            className={`p-5 rounded-3xl border cursor-pointer transition-all flex items-center justify-between group ${formData.requires_document ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/5' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${formData.requires_document ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm italic">Proof Mandatory</p>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">Requires Documentation</p>
                                </div>
                            </div>
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.requires_document ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
                                {formData.requires_document && <Check className="h-3 w-3 text-white" />}
                            </div>
                        </div>

                        <div
                            onClick={() => setFormData({ ...formData, is_paid: !formData.is_paid })}
                            className={`p-5 rounded-3xl border cursor-pointer transition-all flex items-center justify-between group ${formData.is_paid ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/5' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${formData.is_paid ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Check className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm italic">Paid Leave</p>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">Affects Payroll</p>
                                </div>
                            </div>
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.is_paid ? 'bg-blue-500 border-blue-500' : 'border-slate-200'}`}>
                                {formData.is_paid && <Check className="h-3 w-3 text-white" />}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                        <Info className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
                        <p className="text-xs text-amber-900 font-bold leading-relaxed">
                            Changes to leave allocation will only affect new balance cycles. Existing employee balances for the current year remain unchanged unless manually adjusted.
                        </p>
                    </div>

                    <DialogFooter className="bg-white border-t border-slate-100 p-8 rounded-b-3xl mt-4">
                        <div className="flex gap-4 w-full">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="flex-1 h-14 rounded-2xl font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating || isUpdating}
                                className="flex-[2] h-14 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                            >
                                {isCreating || isUpdating ? 'Processing...' : isEditing ? 'Update Configuration' : 'Establish Leave Type'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateLeaveTypeModal;
