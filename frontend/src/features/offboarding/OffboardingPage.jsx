import React, { useState } from 'react';
import { useGetResignationsQuery, useCreateResignationMutation, useGetCurrentUserQuery } from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
    LogOut, AlertTriangle, CheckCircle, XCircle, Clock,
    FileText, Users, Briefcase, Calendar, MessageSquare,
    Shield, Key, Laptop, CreditCard, Star, User,
    ChevronRight, Plus, Edit, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const OffboardingPage = () => {
    const { data: user } = useGetCurrentUserQuery();
    const { data: resignations = [], isLoading } = useGetResignationsQuery({ my_resignations: true });
    const [submitResignation] = useCreateResignationMutation();

    const [isResignationDialogOpen, setIsResignationDialogOpen] = useState(false);
    const [isExitInterviewDialogOpen, setIsExitInterviewDialogOpen] = useState(false);
    const [selectedResignation, setSelectedResignation] = useState(null);

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

    const resignation = resignations.find(r => r.employee_id === user?.employee?.id);
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

    const handleSubmitExitInterview = async (e) => {
        e.preventDefault();
        try {
            // In a real app, this would call an API endpoint
            toast.success("Exit interview submitted successfully. Thank you for your feedback!");
            setIsExitInterviewDialogOpen(false);
            setExitInterviewForm({
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
        } catch (error) {
            toast.error("Failed to submit exit interview. Please try again.");
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
        return diffDays;
    };

    const offboardingSteps = [
        {
            id: 'resignation',
            title: 'Submit Resignation',
            description: 'Formally resign from your position',
            status: isResigned ? 'completed' : 'pending',
            icon: LogOut
        },
        {
            id: 'approval',
            title: 'Manager Approval',
            description: 'Wait for manager approval of resignation',
            status: resignation?.status === 'approved' ? 'completed' : resignation?.status === 'rejected' ? 'error' : 'pending',
            icon: CheckCircle
        },
        {
            id: 'handover',
            title: 'Knowledge Transfer',
            description: 'Complete handover of responsibilities',
            status: resignation?.handover_completed ? 'completed' : 'pending',
            icon: Users
        },
        {
            id: 'exit_interview',
            title: 'Exit Interview',
            description: 'Provide feedback about your experience',
            status: resignation?.exit_interview_completed ? 'completed' : 'pending',
            icon: MessageSquare
        },
        {
            id: 'final_settlement',
            title: 'Final Settlement',
            description: 'Receive final paycheck and benefits',
            status: resignation?.settlement_completed ? 'completed' : 'pending',
            icon: CreditCard
        },
        {
            id: 'asset_return',
            title: 'Asset Return',
            description: 'Return company property and access',
            status: resignation?.assets_returned ? 'completed' : 'pending',
            icon: Key
        }
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Employee Offboarding</h1>
                    <p className="text-text-secondary mt-1">
                        {isResigned
                            ? "Track your offboarding progress and complete exit procedures"
                            : "Manage your resignation and transition process"
                        }
                    </p>
                </div>
                {!isResigned && (
                    <Button
                        variant="destructive"
                        onClick={() => setIsResignationDialogOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Submit Resignation
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center h-64 text-primary-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-current border-t-transparent mb-4"></div>
                    <p className="font-medium animate-pulse">Loading offboarding details...</p>
                </div>
            ) : isResigned ? (
                /* Active Offboarding Process */
                <div className="space-y-8">
                    {/* Current Status Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary-600" />
                                Offboarding Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-text-primary">Last Working Day</p>
                                        <p className="text-sm text-text-secondary">
                                            {resignation.last_working_day ? new Date(resignation.last_working_day).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Not set'}
                                        </p>
                                    </div>
                                    <Badge variant={getResignationStatus(resignation.status)} size="sm">
                                        {resignation.status?.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </div>

                                {resignation.last_working_day && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-text-primary">Days Remaining</p>
                                            <p className="text-sm text-text-secondary">
                                                {Math.max(0, getDaysUntilLastWorkingDay(resignation.last_working_day))} days until departure
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDaysUntilLastWorkingDay(resignation.last_working_day) <= 7
                                                ? 'bg-warning-100 text-warning-700'
                                                : 'bg-primary-100 text-primary-700'
                                            }`}>
                                            {getDaysUntilLastWorkingDay(resignation.last_working_day)} days
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Offboarding Steps Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ChevronRight className="h-5 w-5 text-primary-600" />
                                Offboarding Checklist
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {offboardingSteps.map((step, index) => {
                                    const StepIcon = step.icon;
                                    const isCompleted = step.status === 'completed';
                                    const isError = step.status === 'error';

                                    return (
                                        <div key={step.id} className="flex items-start gap-4">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-success-100 text-success-600' :
                                                    isError ? 'bg-error-100 text-error-600' :
                                                        'bg-neutral-100 text-neutral-400'
                                                }`}>
                                                {isCompleted ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : isError ? (
                                                    <XCircle className="h-4 w-4" />
                                                ) : (
                                                    <StepIcon className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className={`font-medium ${isCompleted ? 'text-text-primary' :
                                                                isError ? 'text-error-600' :
                                                                    'text-text-primary'
                                                            }`}>
                                                            {step.title}
                                                        </h4>
                                                        <p className="text-sm text-text-secondary mt-1">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        {step.id === 'exit_interview' && !resignation?.exit_interview_completed && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setIsExitInterviewDialogOpen(true)}
                                                            >
                                                                Start Interview
                                                            </Button>
                                                        )}
                                                        {step.id === 'handover' && !resignation?.handover_completed && (
                                                            <Button size="sm" variant="outline">
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Update Handover
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Important Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-warning-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    Important Reminders
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-text-secondary">
                                    <li>• Complete knowledge transfer with your replacement</li>
                                    <li>• Return all company property (laptop, access cards, keys)</li>
                                    <li>• Update contact information for future reference</li>
                                    <li>• Final paycheck will be processed after last working day</li>
                                    <li>• Benefits continuation information will be provided</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary-600">
                                    <Shield className="h-5 w-5" />
                                    Security & Access
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-secondary">Email Access</span>
                                        <Badge variant={resignation?.email_disabled ? 'error' : 'warning'} size="sm">
                                            {resignation?.email_disabled ? 'Disabled' : 'Active'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-secondary">System Access</span>
                                        <Badge variant={resignation?.access_revoked ? 'error' : 'warning'} size="sm">
                                            {resignation?.access_revoked ? 'Revoked' : 'Active'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-secondary">Company Assets</span>
                                        <Badge variant={resignation?.assets_returned ? 'success' : 'warning'} size="sm">
                                            {resignation?.assets_returned ? 'Returned' : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                /* Pre-resignation State */
                <div className="space-y-8">
                    <Card className="border-dashed border-2">
                        <CardContent className="py-12">
                            <div className="text-center space-y-4">
                                <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                                    <User className="h-8 w-8 text-neutral-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-text-primary">No Active Resignation</h3>
                                    <p className="text-text-secondary mt-2">
                                        You haven't submitted a resignation yet. If you're planning to leave the company,
                                        please submit your resignation notice below.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsResignationDialogOpen(true)}
                                    className="mt-4"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Submit Resignation Notice
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Offboarding Process Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>What to Expect During Offboarding</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {offboardingSteps.slice(0, 4).map((step, index) => {
                                    const StepIcon = step.icon;
                                    return (
                                        <div key={step.id} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                                <StepIcon className="h-4 w-4 text-primary-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-text-primary">{step.title}</h4>
                                                <p className="text-sm text-text-secondary">{step.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Resignation Submission Dialog */}
            <Dialog open={isResignationDialogOpen} onOpenChange={setIsResignationDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-error-600">
                            <AlertTriangle className="h-5 w-5" />
                            Submit Resignation Notice
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitResignation} className="space-y-6">
                        <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                            <p className="text-sm text-error-700">
                                <strong>Important:</strong> Submitting this resignation notice will start the official offboarding process.
                                Please ensure you've discussed your decision with your manager before proceeding.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Last Working Day"
                                type="date"
                                value={resignationForm.last_working_day}
                                onChange={(e) => setResignationForm({ ...resignationForm, last_working_day: e.target.value })}
                                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                required
                            />

                            <Input
                                label="Notice Period (Days)"
                                type="number"
                                min="1"
                                max="90"
                                value={resignationForm.notice_period_days}
                                onChange={(e) => setResignationForm({ ...resignationForm, notice_period_days: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Reason for Resignation <span className="text-error-500">*</span>
                            </label>
                            <select
                                value={resignationForm.reason}
                                onChange={(e) => setResignationForm({ ...resignationForm, reason: e.target.value })}
                                className="w-full h-11 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                required
                            >
                                <option value="">Select a reason</option>
                                <option value="career_change">Career Change</option>
                                <option value="better_opportunity">Better Opportunity Elsewhere</option>
                                <option value="personal_reasons">Personal Reasons</option>
                                <option value="relocation">Relocation</option>
                                <option value="education">Further Education</option>
                                <option value="retirement">Retirement</option>
                                <option value="health">Health Reasons</option>
                                <option value="work_environment">Work Environment</option>
                                <option value="compensation">Compensation</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Handover Notes (Optional)
                            </label>
                            <textarea
                                className="w-full min-h-20 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                                value={resignationForm.handover_notes}
                                onChange={(e) => setResignationForm({ ...resignationForm, handover_notes: e.target.value })}
                                placeholder="Any important information for knowledge transfer..."
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="contact_after_leaving"
                                checked={resignationForm.contact_after_leaving}
                                onChange={(e) => setResignationForm({ ...resignationForm, contact_after_leaving: e.target.checked })}
                                className="h-4 w-4 text-primary-600 border-border-medium rounded focus:ring-primary-500"
                            />
                            <label htmlFor="contact_after_leaving" className="text-sm text-text-secondary">
                                I agree to be contacted for reference purposes after leaving
                            </label>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-light">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsResignationDialogOpen(false)}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                className="w-full sm:w-auto"
                                disabled={!resignationForm.last_working_day || !resignationForm.reason}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Submit Resignation
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Exit Interview Dialog */}
            <Dialog open={isExitInterviewDialogOpen} onOpenChange={setIsExitInterviewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary-600" />
                            Exit Interview
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitExitInterview} className="space-y-6">
                        <p className="text-sm text-text-secondary">
                            Your feedback is valuable to us. This information will help improve the company and support future employees.
                        </p>

                        {/* Work Satisfaction */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-3">
                                Overall Work Satisfaction (1-10)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={exitInterviewForm.work_satisfaction}
                                    onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, work_satisfaction: e.target.value })}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium text-text-primary min-w-6">
                                    {exitInterviewForm.work_satisfaction}
                                </span>
                            </div>
                        </div>

                        {/* Work-Life Balance */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-3">
                                Work-Life Balance (1-10)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={exitInterviewForm.work_life_balance}
                                    onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, work_life_balance: e.target.value })}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium text-text-primary min-w-6">
                                    {exitInterviewForm.work_life_balance}
                                </span>
                            </div>
                        </div>

                        {/* Compensation Satisfaction */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-3">
                                Compensation & Benefits Satisfaction (1-10)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={exitInterviewForm.compensation_satisfaction}
                                    onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, compensation_satisfaction: e.target.value })}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium text-text-primary min-w-6">
                                    {exitInterviewForm.compensation_satisfaction}
                                </span>
                            </div>
                        </div>

                        {/* Open-ended Questions */}
                        <div className="space-y-4">
                            <Input
                                label="What did you like most about working here?"
                                value={exitInterviewForm.what_improved}
                                onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, what_improved: e.target.value })}
                                placeholder="Share your positive experiences..."
                            />

                            <Input
                                label="What could be improved?"
                                value={exitInterviewForm.suggestions}
                                onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, suggestions: e.target.value })}
                                placeholder="Areas for improvement..."
                            />

                            <Input
                                label="Primary reason for leaving"
                                value={exitInterviewForm.reason_for_leaving}
                                onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, reason_for_leaving: e.target.value })}
                                placeholder="Main reason for your decision..."
                            />

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Management Feedback
                                </label>
                                <textarea
                                    className="w-full min-h-20 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                                    value={exitInterviewForm.management_feedback}
                                    onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, management_feedback: e.target.value })}
                                    placeholder="Feedback about your manager and leadership..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Company Culture & Environment
                                </label>
                                <textarea
                                    className="w-full min-h-20 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                                    value={exitInterviewForm.company_culture}
                                    onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, company_culture: e.target.value })}
                                    placeholder="Thoughts on company culture, values, and work environment..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Final Comments
                                </label>
                                <textarea
                                    className="w-full min-h-20 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                                    value={exitInterviewForm.final_comments}
                                    onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, final_comments: e.target.value })}
                                    placeholder="Any final thoughts or advice for the company..."
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="would_recommend"
                                    checked={exitInterviewForm.would_recommend}
                                    onChange={(e) => setExitInterviewForm({ ...exitInterviewForm, would_recommend: e.target.checked })}
                                    className="h-4 w-4 text-primary-600 border-border-medium rounded focus:ring-primary-500"
                                />
                                <label htmlFor="would_recommend" className="text-sm text-text-secondary">
                                    I would recommend this company as a great place to work
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-light">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsExitInterviewDialogOpen(false)}
                                className="w-full sm:w-auto"
                            >
                                Skip for Now
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Submit Exit Interview
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default OffboardingPage;
