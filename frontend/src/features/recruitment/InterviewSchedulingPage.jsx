import React, { useState } from 'react';
import {
    useGetInterviewsQuery,
    useCreateInterviewMutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Calendar, Clock, User, MapPin, Plus, Video, Phone, MessageSquare, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const InterviewSchedulingPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showForm, setShowForm] = useState(false);

    const { data: interviews, isLoading } = useGetInterviewsQuery({ date: selectedDate });
    const [createInterview] = useCreateInterviewMutation();
    const [updateInterview] = useUpdateInterviewMutation();

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
        { value: 'video_call', label: 'Video Call', icon: Video },
        { value: 'phone_call', label: 'Phone Call', icon: Phone },
        { value: 'in_person', label: 'In Person', icon: MapPin },
        { value: 'panel', label: 'Panel Interview', icon: User }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createInterview(formData).unwrap();
            toast.success('Interview scheduled successfully!');
            setShowForm(false);
            setFormData({
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
        } catch (error) {
            toast.error('Failed to schedule interview');
        }
    };

    const getTypeIcon = (type) => {
        const typeConfig = interviewTypes.find(t => t.value === type);
        return typeConfig ? typeConfig.icon : Clock;
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'video_call': return 'text-blue-600 bg-blue-100';
            case 'phone_call': return 'text-green-600 bg-green-100';
            case 'in_person': return 'text-orange-600 bg-orange-100';
            case 'panel': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const todayInterviews = Array.isArray(interviews) ? interviews.filter(interview =>
        interview.scheduled_date === selectedDate
    ) : [];

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Interview Scheduling</h1>
                    <p className="text-gray-600 mt-2">Schedule and manage candidate interviews</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Interview
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar/Date Picker */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Select Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <div className="mt-4 space-y-2">
                            <p className="text-sm text-gray-600">
                                {todayInterviews.length} interview{todayInterviews.length !== 1 ? 's' : ''} scheduled
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Interviews List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Interviews for {new Date(selectedDate).toLocaleDateString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">Loading interviews...</div>
                        ) : todayInterviews.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No interviews scheduled for this date</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todayInterviews.map((interview) => {
                                    const TypeIcon = getTypeIcon(interview.interview_type);
                                    return (
                                        <Card key={interview.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={`p-2 rounded-lg ${getTypeColor(interview.interview_type)}`}>
                                                                <TypeIcon className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">
                                                                    {interview.candidate_name}
                                                                </h4>
                                                                <p className="text-sm text-gray-600">
                                                                    {interview.job_title}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                {interview.scheduled_time} ({interview.duration_minutes}min)
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4" />
                                                                {interview.interviewer_name}
                                                            </div>
                                                        </div>

                                                        {interview.meeting_link && (
                                                            <div className="mt-3">
                                                                <Button
                                                                    size="sm"
                                                                    className="gap-2"
                                                                    onClick={() => window.open(interview.meeting_link, '_blank')}
                                                                >
                                                                    <Video className="h-4 w-4" />
                                                                    Join Meeting
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Schedule Interview Modal */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Schedule Interview</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Candidate *</label>
                                <select
                                    name="candidate_id"
                                    value={formData.candidate_id}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Candidate</option>
                                    {/* Mock candidates - replace with actual data */}
                                    <option value="1">Sarah Mirembe</option>
                                    <option value="2">John Doe</option>
                                    <option value="3">Jane Smith</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Interviewer *</label>
                                <select
                                    name="interviewer_id"
                                    value={formData.interviewer_id}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Interviewer</option>
                                    {/* Mock interviewers - replace with actual data */}
                                    <option value="1">Alice Johnson (HR Manager)</option>
                                    <option value="2">Bob Wilson (Tech Lead)</option>
                                    <option value="3">Carol Davis (CEO)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date *</label>
                                <input
                                    type="date"
                                    name="scheduled_date"
                                    value={formData.scheduled_date}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Time *</label>
                                <input
                                    type="time"
                                    name="scheduled_time"
                                    value={formData.scheduled_time}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Duration *</label>
                                <select
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="90">1.5 hours</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Interview Type *</label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {interviewTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <label key={type.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="interview_type"
                                                value={type.value}
                                                checked={formData.interview_type === type.value}
                                                onChange={handleInputChange}
                                            />
                                            <Icon className="h-5 w-5 text-gray-600" />
                                            <span className="font-medium">{type.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {formData.interview_type === 'video_call' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Meeting Link</label>
                                <input
                                    type="url"
                                    name="meeting_link"
                                    value={formData.meeting_link}
                                    onChange={handleInputChange}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        )}

                        {formData.interview_type === 'in_person' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Conference Room A, 5th Floor"
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Interview preparation notes, agenda, etc."
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Schedule Interview
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InterviewSchedulingPage;
