import React, { useState, useMemo } from 'react';
import {
    useGetInterviewsQuery,
    useCreateInterviewMutation,
    useGetCandidatesQuery,
    useGetEmployeesQuery
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import {
    Calendar, Clock, User, MapPin, Plus, Video, Phone,
    Loader2, Users, Monitor, Search, ChevronRight, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const InterviewSchedulingPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showForm, setShowForm] = useState(false);

    const { data: interviews, isLoading } = useGetInterviewsQuery({ date: selectedDate });
    const { data: candidatesData } = useGetCandidatesQuery();
    const { data: employeesData } = useGetEmployeesQuery();

    const [createInterview] = useCreateInterviewMutation();

    const candidates = useMemo(() => Array.isArray(candidatesData) ? candidatesData : candidatesData?.results || [], [candidatesData]);
    const employees = useMemo(() => Array.isArray(employeesData) ? employeesData : employeesData?.results || [], [employeesData]);

    const [formData, setFormData] = useState({
        candidate_id: '',
        interviewer_id: '',
        scheduled_date: selectedDate,
        scheduled_time: '',
        duration_minutes: 60,
        interview_type: 'video_call',
        location: '',
        meeting_link: '',
        notes: ''
    });

    const interviewTypes = [
        { value: 'video_call', label: 'Video Call', icon: Video, desc: 'Online meeting via link' },
        { value: 'phone_call', label: 'Phone Call', icon: Phone, desc: 'Direct phone interview' },
        { value: 'in_person', label: 'In Person', icon: MapPin, desc: 'At office location' },
        { value: 'panel', label: 'Panel', icon: Users, desc: 'Multiple interviewers' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createInterview(formData).unwrap();
            toast.success('Interview scheduled successfully.');
            setShowForm(false);
            setFormData({
                candidate_id: '', interviewer_id: '', scheduled_date: selectedDate,
                scheduled_time: '', duration_minutes: 60, interview_type: 'video_call',
                location: '', meeting_link: '', notes: ''
            });
        } catch (error) {
            toast.error('Failed to schedule interview.');
        }
    };

    const todayInterviews = useMemo(() => Array.isArray(interviews) ? interviews.filter(interview =>
        interview.scheduled_date === selectedDate
    ) : [], [interviews, selectedDate]);

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Interview Schedule</h1>
                    <p className="text-gray-500 mt-2">Manage upcoming interviews and assessments.</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="rounded-xl h-11 bg-gray-900 text-white font-medium shadow-lg shadow-slate-900/20">
                    <Plus className="h-4 w-4 mr-2" /> Schedule Interview
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="space-y-6">
                    {/* Calendar Widget */}
                    <Card className="rounded-3xl border border-gray-200 shadow-sm bg-white overflow-hidden p-6">
                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full mt-2 h-12 px-4 bg-gray-50 border border-slate-100 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-slate-200 outline-none"
                            />
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-slate-100 text-center">
                            <p className="text-3xl font-bold text-gray-900">{todayInterviews.length}</p>
                            <p className="text-sm font-medium text-gray-500">Sessions on {new Date(selectedDate).toLocaleDateString()}</p>
                        </div>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                            <Video className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                            <p className="text-lg font-bold text-gray-900">{todayInterviews.filter(i => i.interview_type === 'video_call').length}</p>
                            <p className="text-xs text-gray-500 font-medium">Video Calls</p>
                        </div>
                        <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                            <MapPin className="h-5 w-5 text-primary-500 mx-auto mb-2" />
                            <p className="text-lg font-bold text-gray-900">{todayInterviews.filter(i => i.interview_type === 'in_person').length}</p>
                            <p className="text-xs text-gray-500 font-medium">In Person</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {/* Interview List */}
                    <Card className="rounded-3xl border border-gray-200 shadow-sm bg-white min-h-[500px]">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="font-bold text-gray-900">Scheduled Sessions</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-slate-300" /></div>
                            ) : todayInterviews.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="font-medium text-gray-600">No interviews scheduled</p>
                                    <p className="text-sm">Select a different date or schedule a new one.</p>
                                </div>
                            ) : (
                                todayInterviews.map((interview) => (
                                    <div key={interview.id} className="group flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all">
                                        <div className="flex flex-col items-center justify-center h-16 w-16 bg-gray-50 rounded-xl text-gray-900 font-bold shrink-0">
                                            <span className="text-lg">{interview.scheduled_time}</span>
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-bold text-gray-900 text-lg">{interview.candidate_name}</h3>
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {interview.job_title}</span>
                                                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {interview.interviewer_name}</span>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-3">
                                            {interview.meeting_link && (
                                                <Button
                                                    size="sm"
                                                    className="rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border-none"
                                                    onClick={() => window.open(interview.meeting_link, '_blank')}
                                                >
                                                    <Video className="h-4 w-4 mr-2" /> Join Call
                                                </Button>
                                            )}
                                            <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 uppercase tracking-wide">
                                                {interview.interview_type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Schedule Modal */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-slate-100">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">Schedule Interview</DialogTitle>
                            <p className="text-gray-500 mt-1 font-medium text-sm">Select a candidate and set a time for assessment.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Candidate</label>
                                <select
                                    name="candidate_id" value={formData.candidate_id} onChange={handleInputChange} required
                                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                                >
                                    <option value="">Select Candidate</option>
                                    {candidates.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Interviewer</label>
                                <select
                                    name="interviewer_id" value={formData.interviewer_id} onChange={handleInputChange} required
                                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                                >
                                    <option value="">Select Interviewer</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Date</label>
                                <Input type="date" name="scheduled_date" value={formData.scheduled_date} onChange={handleInputChange} required className="bg-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Time</label>
                                <Input type="time" name="scheduled_time" value={formData.scheduled_time} onChange={handleInputChange} required className="bg-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Duration (min)</label>
                                <select name="duration_minutes" value={formData.duration_minutes} onChange={handleInputChange} className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm outline-none">
                                    <option value="30">30 min</option>
                                    <option value="45">45 min</option>
                                    <option value="60">1 hour</option>
                                    <option value="90">1.5 hours</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Interview Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                {interviewTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <label key={type.value} className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                            formData.interview_type === type.value ? 'bg-gray-900 border-slate-900 text-white' : 'bg-white border-gray-200 hover:bg-gray-50'
                                        )}>
                                            <input type="radio" name="interview_type" value={type.value} checked={formData.interview_type === type.value} onChange={handleInputChange} className="hidden" />
                                            <Icon className={cn("h-5 w-5", formData.interview_type === type.value ? 'text-white' : 'text-gray-500')} />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{type.label}</span>
                                                <span className={cn("text-xs", formData.interview_type === type.value ? 'text-slate-300' : 'text-gray-400')}>{type.desc}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{formData.interview_type === 'video_call' ? 'Meeting Link' : 'Location'}</label>
                            <Input
                                name={formData.interview_type === 'video_call' ? 'meeting_link' : 'location'}
                                value={formData.interview_type === 'video_call' ? formData.meeting_link : formData.location}
                                onChange={handleInputChange}
                                placeholder={formData.interview_type === 'video_call' ? 'Paste meeting URL' : 'e.g. Conference Room A'}
                                className="bg-white"
                            />
                        </div>

                        <div className="pt-4 flex gap-3 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800">
                                Schedule
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InterviewSchedulingPage;
