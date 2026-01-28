import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import {
    useCreateInterviewMutation,
    useGetEmployeesQuery,
    useGetIntegrationStatusQuery,
    useMoveApplicationStageMutation
} from '../../store/api';
import { Calendar, Video, Clock, User, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const InterviewSchedulerModal = ({ isOpen, onClose, application }) => {
    const [createInterview, { isLoading }] = useCreateInterviewMutation();
    const [moveStage] = useMoveApplicationStageMutation();
    const { data: employees = [] } = useGetEmployeesQuery();
    const { data: integrationStatus } = useGetIntegrationStatusQuery();

    const [formData, setFormData] = useState({
        date_time: '',
        duration_minutes: '30',
        interviewer_id: '',
        interview_type: 'video',
        location: ''
    });

    const employeesArray = Array.isArray(employees) ? employees : (employees?.results || []);

    const hasMeetingIntegration = integrationStatus?.zoom?.connected || integrationStatus?.teams?.connected;
    const hasCalendarIntegration = integrationStatus?.google_calendar?.connected || integrationStatus?.microsoft_outlook?.connected;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createInterview({
                application: application.id,
                interviewer: formData.interviewer_id,
                date_time: formData.date_time,
                duration_minutes: parseInt(formData.duration_minutes),
                interview_type: formData.interview_type,
                location: formData.location
            }).unwrap();

            // Move the application stage formally
            await moveStage({ id: application.id, stage: 'interview' }).unwrap();

            toast.success("Interview scheduled and synced!");
            onClose();
        } catch (error) {
            toast.error(error?.data?.error || "Failed to schedule interview.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white rounded-3xl p-0 overflow-hidden shadow-2xl border-none">
                <DialogHeader className="p-8 bg-gray-900 text-white">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-blue-400" />
                        Schedule Interview
                    </DialogTitle>
                    <p className="text-gray-400 text-sm mt-1">
                        Schedule for {application?.candidate?.first_name} {application?.candidate?.last_name}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {(!hasMeetingIntegration || !hasCalendarIntegration) && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 font-medium">
                                Some integrations aren't active. Real-time calendar sync and meeting links might be limited.
                                <span className="underline ml-1 cursor-pointer" onClick={() => window.location.href = '/recruitment/integrations'}>Fix in Hub</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-500 font-bold uppercase text-[10px] tracking-widest px-1">Interviewer</Label>
                            <Select
                                value={formData.interviewer_id}
                                onValueChange={(val) => setFormData({ ...formData, interviewer_id: val })}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Select an interviewer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employeesArray.map(emp => (
                                        <SelectItem key={emp.id} value={String(emp.id)}>
                                            {emp.full_name} ({emp.department_name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-500 font-bold uppercase text-[10px] tracking-widest px-1">Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200"
                                    value={formData.date_time}
                                    onChange={e => setFormData({ ...formData, date_time: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-500 font-bold uppercase text-[10px] tracking-widest px-1">Duration (min)</Label>
                                <Input
                                    type="number"
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200"
                                    value={formData.duration_minutes}
                                    onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-500 font-bold uppercase text-[10px] tracking-widest px-1">Interview Type</Label>
                            <Select
                                value={formData.interview_type}
                                onValueChange={(val) => setFormData({ ...formData, interview_type: val })}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">Video Call (Zoom/Teams)</SelectItem>
                                    <SelectItem value="phone">Phone Screen</SelectItem>
                                    <SelectItem value="onsite">On-site Interview</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.interview_type !== 'video' && (
                            <div className="space-y-2">
                                <Label className="text-gray-500 font-bold uppercase text-[10px] tracking-widest px-1">Location / Extra Info</Label>
                                <Input
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200"
                                    placeholder="Enter physical address or reference"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 font-bold rounded-xl h-14">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="flex-1 font-bold rounded-xl h-14 bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-slate-200">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule & Notify"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InterviewSchedulerModal;
