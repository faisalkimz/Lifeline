import React, { useState } from 'react';
import {
    useGetResignationsQuery,
    useCreateResignationMutation,
    useUpdateResignationMutation,
    useGetCurrentUserQuery
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import {
    LogOut, AlertTriangle, CheckCircle, XCircle, Clock,
    Users, Briefcase, Calendar, MessageSquare,
    Shield, Key, CreditCard, ChevronRight, Edit, Star, Laptop, Hand
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const OffboardingPage = () => {
    const { data: user } = useGetCurrentUserQuery();
    // Managers/Admin see all resignations, Employees see their own
    const { data: resignationsData = [], isLoading } = useGetResignationsQuery({
        my_resignations: user?.role === 'employee'
    });
    const resignations = Array.isArray(resignationsData) ? resignationsData : (resignationsData.results || []);

    const [submitResignation] = useCreateResignationMutation();
    const [updateResignation] = useUpdateResignationMutation();

    const [isResignationDialogOpen, setIsResignationDialogOpen] = useState(false);
    const [isExitInterviewDialogOpen, setIsExitInterviewDialogOpen] = useState(false);

    const [resignationForm, setResignationForm] = useState({
        last_working_day: '',
        reason: '',
        notice_period_days: 30,
        handover_notes: '',
        contact_after_leaving: false
    });

    const [exitInterviewForm, setExitInterviewForm] = useState({
        work_satisfaction: 5,
        management_feedback: '',
        company_culture: '',
        work_life_balance: 5,
        compensation_satisfaction: 5,
        suggestions: '',
        would_recommend: true,
        reason_for_leaving: '',
        what_improved: '',
        final_comments: ''
    });

    const resignation = resignations.find(r => r.employee === user?.employee?.id) || resignations[0];
    const isResigned = !!resignation;

    const handleSubmitResignation = async (e) => {
        e.preventDefault();
        try {
            await submitResignation(resignationForm).unwrap();
            toast.success("Resignation submitted successfully. Your manager will be notified.");
            setIsResignationDialogOpen(false);
            setResignationForm({
                last_working_day: '',
                reason: '',
                notice_period_days: 30,
                handover_notes: '',
                contact_after_leaving: false
            });
        } catch (error) {
            console.error('Failed to submit resignation:', error);
            toast.error("Failed to submit resignation. Please try again.");
        }
    };

    const handleToggleStep = async (stepId, currentState) => {
        if (!resignation) return;

        const fieldMap = {
            'handover': 'handover_completed',
            'exit_interview': 'exit_interview_completed',
            'final_settlement': 'settlement_completed',
            'laptop_return': 'laptop_returned',
            'id_badge_return': 'id_badge_returned',
            'keys_return': 'keys_returned',
            'email_disabled': 'email_disabled'
        };

        const field = fieldMap[stepId];
        if (!field) return;

        try {
            await updateResignation({
                id: resignation.id,
                [field]: !currentState
            }).unwrap();
            toast.success("Operation successful");
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleSubmitExitInterview = async (e) => {
        e.preventDefault();
        try {
            // This would normally be a separate model create but for here we update the resignation flag too
            await updateResignation({ id: resignation.id, exit_interview_completed: true }).unwrap();
            toast.success("Exit interview submitted. Thank you!");
            setIsExitInterviewDialogOpen(false);
        } catch (error) {
            toast.error("Failed to submit interview");
        }
    };

    const getResignationStatus = (status) => {
        const variants = {
            pending: 'warning',
            approved: 'success',
            rejected: 'error',
            completed: 'success'
        };
        return variants[status] || 'default';
    };

    const getDaysUntilLastWorkingDay = (lastWorkingDay) => {
        if (!lastWorkingDay) return 0;
        const today = new Date();
        const lastDay = new Date(lastWorkingDay);
        const diffTime = lastDay - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const offboardingSteps = [
        {
            id: 'resignation',
            title: 'Resignation Status',
            description: 'Approval of formal departure',
            status: resignation?.status === 'approved' ? 'completed' : resignation?.status === 'rejected' ? 'error' : 'pending',
            icon: LogOut,
            canToggle: user?.role !== 'employee'
        },
        {
            id: 'handover',
            title: 'Knowledge Transfer',
            description: 'Handover of duties & notes',
            status: resignation?.handover_completed ? 'completed' : 'pending',
            icon: Users,
            canToggle: true
        },
        {
            id: 'exit_interview',
            title: 'Exit Interview',
            description: 'Feedback on work experience',
            status: resignation?.exit_interview_completed ? 'completed' : 'pending',
            icon: MessageSquare,
            canToggle: true
        },
        {
            id: 'laptop_return',
            title: 'Equipment Return',
            description: 'Workstation & peripherals return',
            status: resignation?.laptop_returned ? 'completed' : 'pending',
            icon: Laptop,
            canToggle: user?.role !== 'employee'
        },
        {
            id: 'id_badge_return',
            title: 'ID Return',
            description: 'Return of ID badge & credentials',
            status: resignation?.id_badge_returned ? 'completed' : 'pending',
            icon: Users,
            canToggle: user?.role !== 'employee'
        },
        {
            id: 'keys_return',
            title: 'Keys & Access Return',
            description: 'Physical keys & parking permits',
            status: resignation?.keys_returned ? 'completed' : 'pending',
            icon: Key,
            canToggle: user?.role !== 'employee'
        },
        {
            id: 'email_disabled',
            title: 'IT Clearance',
            description: 'Email & System access disable',
            status: resignation?.email_disabled ? 'completed' : 'pending',
            icon: Shield,
            canToggle: user?.role !== 'employee'
        },
        {
            id: 'final_settlement',
            title: 'Final Settlement',
            description: 'Dues & terminal benefits',
            status: resignation?.settlement_completed ? 'completed' : 'pending',
            icon: CreditCard,
            canToggle: user?.role !== 'employee'
        }
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Employee Offboarding</h1>
                    <p className="text-text-secondary mt-1">
                        {isResigned
                            ? `Departure process for ${resignation.employee_name || 'Employee'}`
                            : "Manage resignation and employee transition process"}
                    </p>
                </div>
                {!isResigned && user?.role === 'employee' && (
                    <Button
                        variant="destructive"
                        onClick={() => setIsResignationDialogOpen(true)}
                        className="w-full sm:w-auto shadow-lg shadow-error-200"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Submit Resignation
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center h-64 text-primary-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-current border-t-transparent mb-4"></div>
                </div>
            ) : isResigned ? (
                <div className="space-y-8">
                    {/* Departure Status Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 overflow-hidden border-none shadow-xl ring-1 ring-slate-100">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Departure Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Last Working Day</p>
                                        <p className="text-3xl font-black text-slate-900 mt-1">
                                            {resignation.last_working_day ? new Date(resignation.last_working_day).toLocaleDateString('en-US', {
                                                month: 'long', day: 'numeric', year: 'numeric'
                                            }) : 'TBD'}
                                        </p>
                                    </div>
                                    <div className="h-20 w-[2px] bg-slate-100 hidden md:block"></div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                                        <div className="mt-2">
                                            <Badge variant={getResignationStatus(resignation.status)} size="lg" className="rounded-xl px-6 py-2 text-sm font-black shadow-sm">
                                                {resignation.status?.toUpperCase() || 'UNKNOWN'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="h-20 w-[2px] bg-slate-100 hidden md:block"></div>
                                    <div className="text-center md:text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Days Left</p>
                                        <p className="text-5xl font-black text-indigo-600 mt-1">
                                            {getDaysUntilLastWorkingDay(resignation.last_working_day)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                        <span>Notice Progress</span>
                                        <span>{Math.round(((30 - getDaysUntilLastWorkingDay(resignation.last_working_day)) / 30) * 100)}% Elapsed</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min(100, Math.max(0, ((30 - getDaysUntilLastWorkingDay(resignation.last_working_day)) / 30) * 100))}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="bg-slate-900 border-none shadow-2xl text-white relative overflow-hidden">
                                <div className="absolute -right-8 -bottom-8 opacity-10">
                                    <Shield className="h-40 w-40" />
                                </div>
                                <CardContent className="p-6 relative z-10">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">System Access</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center group cursor-pointer" onClick={() => user?.role !== 'employee' && handleToggleStep('email_disabled', resignation.email_disabled)}>
                                            <span className="text-sm font-medium text-slate-300">Email Account</span>
                                            <Badge variant={resignation.email_disabled ? 'error' : 'success'} className="font-black">
                                                {resignation.email_disabled ? 'DEACTIVATED' : 'ACTIVE'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center group cursor-pointer" onClick={() => user?.role !== 'employee' && handleToggleStep('access_revoked', resignation.access_revoked)}>
                                            <span className="text-sm font-medium text-slate-300">Internal System Access</span>
                                            <Badge variant={resignation.access_revoked ? 'error' : 'success'} className="font-black">
                                                {resignation.access_revoked ? 'REVOKED' : 'ACTIVE'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-emerald-600 border-none shadow-xl text-white">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-emerald-100 uppercase">Handover Status</p>
                                        <p className="text-xl font-black mt-1">
                                            {resignation.handover_completed ? 'Dcoumented & Signed' : 'In Progress'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <Edit className="h-6 w-6" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Interactive Checklist Flow */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">Offboarding Workflow</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Departure steps</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {offboardingSteps.map((step, idx) => {
                                const Icon = step.icon;
                                const isDone = step.status === 'completed';

                                return (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            "relative group p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden",
                                            isDone
                                                ? "bg-emerald-50 border-emerald-100"
                                                : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                                        )}
                                        onClick={() => step.canToggle && handleToggleStep(step.id, isDone)}
                                    >
                                        <div className="flex items-start gap-4 h-full">
                                            <div className={cn(
                                                "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                isDone ? "bg-emerald-500 text-white rotate-12" : "bg-slate-100 text-slate-400"
                                            )}>
                                                {isDone ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className={cn("font-bold text-base", isDone ? "text-emerald-900" : "text-slate-900")}>
                                                        {step.title}
                                                    </h4>
                                                    {step.canToggle && (
                                                        <div className={cn(
                                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                            isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                                                        )}>
                                                            {isDone && <CheckCircle className="h-3 w-3 text-white" />}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className={cn("text-xs mt-2 leading-relaxed", isDone ? "text-emerald-600" : "text-slate-500")}>
                                                    {step.description}
                                                </p>

                                                {step.id === 'exit_interview' && !isDone && (
                                                    <Button
                                                        variant="ghost"
                                                        className="mt-4 w-full h-8 text-[10px] uppercase font-black tracking-widest bg-slate-100 hover:bg-slate-200"
                                                        onClick={(e) => { e.stopPropagation(); setIsExitInterviewDialogOpen(true); }}
                                                    >
                                                        Respond to Interview
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                /* Pre-Departure Setup */
                <Card className="border-dashed border-4 border-slate-100 bg-slate-50/30">
                    <CardContent className="py-24 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8">
                            <Hand className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Standard Offboarding Procedure</h3>
                        <p className="text-slate-500 mt-4 leading-relaxed">
                            A structured offboarding ensures your professional separation is smooth, secure, and compliant.
                            Submit your resignation notice to trigger the checklist and begin the knowledge transfer phase.
                        </p>
                        <Button
                            variant="destructive"
                            onClick={() => setIsResignationDialogOpen(true)}
                            className="mt-8 px-12 h-12 rounded-full font-bold shadow-xl shadow-error-100 transition-transform hover:scale-105"
                        >
                            Submit Resignation
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Modal Dialogs (Preserved from existing code) */}
            <Dialog open={isResignationDialogOpen} onOpenChange={setIsResignationDialogOpen}>
                <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-rose-600 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <LogOut className="h-20 w-20" />
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight">Resignation Notice</DialogTitle>
                        <p className="mt-2 text-rose-100 text-sm font-medium">This is a formal procedure. Ensure you've briefed your manager.</p>
                    </div>

                    <form onSubmit={handleSubmitResignation} className="p-8 space-y-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Last Working Day"
                                type="date"
                                value={resignationForm.last_working_day}
                                onChange={(e) => setResignationForm({ ...resignationForm, last_working_day: e.target.value })}
                                required
                                className="rounded-2xl border-slate-200 h-12"
                            />

                            <Input
                                label="Notice Period (Days)"
                                type="number"
                                value={resignationForm.notice_period_days}
                                onChange={(e) => setResignationForm({ ...resignationForm, notice_period_days: e.target.value })}
                                required
                                className="rounded-2xl border-slate-200 h-12"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Reason for Leaving</label>
                            <select
                                value={resignationForm.reason}
                                onChange={(e) => setResignationForm({ ...resignationForm, reason: e.target.value })}
                                className="w-full h-12 px-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium focus:ring-0 focus:border-rose-500 transition-all"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="career_growth">Career Growth</option>
                                <option value="relocation">Relocation</option>
                                <option value="education">Further Studies</option>
                                <option value="personal">Personal Circumstances</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Transition & Handover Notes</label>
                            <textarea
                                className="w-full min-h-[120px] p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium focus:ring-0 focus:border-rose-500 transition-all resize-none"
                                value={resignationForm.handover_notes}
                                onChange={(e) => setResignationForm({ ...resignationForm, handover_notes: e.target.value })}
                                placeholder="Describe the current state of your projects..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsResignationDialogOpen(false)} className="rounded-2xl px-8">Cancel</Button>
                            <Button type="submit" variant="destructive" className="rounded-2xl px-12 bg-rose-600 hover:bg-rose-700">Submit Resignation</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Exit Interview Flow Dialog */}
            <Dialog open={isExitInterviewDialogOpen} onOpenChange={setIsExitInterviewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-indigo-600 p-8 text-white">
                        <DialogTitle className="text-2xl font-black">Exit Interview</DialogTitle>
                        <p className="text-indigo-100 text-sm mt-1">Your feedback helps us improve our employee experience.</p>
                    </div>
                    <form onSubmit={handleSubmitExitInterview} className="p-8 space-y-8 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Work-Life Balance Satisfaction</label>
                                <input
                                    type="range" min="1" max="10"
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    value={exitInterviewForm.work_life_balance}
                                    onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, work_life_balance: e.target.value })}
                                />
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                                    <span>Poor</span>
                                    <span>Scale: {exitInterviewForm.work_life_balance} / 10</span>
                                    <span>Excellent</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Compensation Fairness</label>
                                <input
                                    type="range" min="1" max="10"
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    value={exitInterviewForm.compensation_satisfaction}
                                    onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, compensation_satisfaction: e.target.value })}
                                />
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                                    <span>Poor</span>
                                    <span>Scale: {exitInterviewForm.compensation_satisfaction} / 10</span>
                                    <span>Excellent</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Input
                                label="What originally brought you to Lifeline?"
                                value={exitInterviewForm.what_improved}
                                onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, what_improved: e.target.value })}
                                placeholder="What attracted you to the company?"
                                className="rounded-xl"
                            />
                            <Input
                                label="Areas for Improvement"
                                value={exitInterviewForm.suggestions}
                                onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, suggestions: e.target.value })}
                                placeholder="Please share your honest feedback..."
                                className="rounded-xl"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                            <input
                                type="checkbox" id="recommend_ref"
                                checked={exitInterviewForm.would_recommend}
                                onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, would_recommend: e.target.checked })}
                                className="w-5 h-5 text-indigo-600 rounded-md border-slate-300"
                            />
                            <label htmlFor="recommend_ref" className="text-sm font-medium text-slate-700">
                                I would recommend Lifeline as a professional environment to peers.
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsExitInterviewDialogOpen(false)}>Save Progress</Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-12 rounded-xl">Finalize Interview</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OffboardingPage;
