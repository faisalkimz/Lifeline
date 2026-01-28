import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useUpdateJobMutation } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Save, X, Loader2, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { Input } from '../../components/ui/Input';

const JobDescriptionEditor = ({ job, isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        employment_type: 'full_time',
        description: '',
        requirements: '',
    });
    const [publishDate, setPublishDate] = useState('');
    const [publishTime, setPublishTime] = useState('09:00');
    const [isSaving, setIsSaving] = useState(false);

    const [updateJob] = useUpdateJobMutation();

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || '',
                location: job.location || '',
                employment_type: job.employment_type || 'full_time',
                description: job.description || '',
                requirements: job.requirements || '',
            });

            if (job.scheduled_publish_date) {
                const dateObj = new Date(job.scheduled_publish_date);
                setPublishDate(dateObj.toISOString().split('T')[0]);
                setPublishTime(dateObj.toTimeString().slice(0, 5));
            }
        }
    }, [job]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatePayload = {
                id: job.id,
                ...formData,
            };

            if (publishDate && publishTime) {
                updatePayload.scheduled_publish_date = new Date(`${publishDate}T${publishTime}`).toISOString();
            }

            await updateJob(updatePayload).unwrap();
            toast.success('Job updated successfully');
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to update job:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'link'
    ];

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[90vh] w-full max-w-6xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Job Details</h2>
                        <p className="text-sm text-gray-500 mt-1">Update job information and description for {job?.title}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-200 rounded-full h-10 w-10">
                        <X className="h-5 w-5 text-gray-500" />
                    </Button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-white">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Job Title</label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    className="bg-gray-50"
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Employment Type</label>
                                <select
                                    name="employment_type"
                                    value={formData.employment_type}
                                    onChange={handleFormChange}
                                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                                >
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Location</label>
                                <Input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleFormChange}
                                    className="bg-gray-50"
                                    placeholder="e.g. Remote / Kampala HQ"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Description</label>
                            <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[350px] flex flex-col bg-white">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.description}
                                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                    modules={modules}
                                    formats={formats}
                                    className="flex-1"
                                    placeholder="Describe the role responsibilities and requirements..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Requirements</label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleFormChange}
                                rows="6"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-slate-200 outline-none resize-none"
                                placeholder="List the key requirements for this position..."
                            />
                        </div>
                    </div>

                    {/* Sidebar Configuration */}
                    <div className="w-80 border-l border-slate-100 bg-gray-50/50 p-8 flex flex-col shrink-0 gap-6 overflow-y-auto">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>Publishing Schedule</span>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Publish Date</label>
                                    <Input
                                        type="date"
                                        value={publishDate}
                                        onChange={(e) => setPublishDate(e.target.value)}
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Time</label>
                                    <Input
                                        type="time"
                                        value={publishTime}
                                        onChange={(e) => setPublishTime(e.target.value)}
                                        className="bg-gray-50"
                                    />
                                </div>

                                {publishDate && publishTime && (
                                    <div className="flex gap-2 p-3 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100 items-start">
                                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>
                                            Scheduled for {new Date(`${publishDate}T${publishTime}`).toLocaleDateString()} at {publishTime}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="mt-auto pt-6 border-t border-gray-200">
                            <div className="grid gap-3">
                                <Button
                                    className="w-full bg-gray-900 text-white hover:bg-gray-800 shadow-md font-medium"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-gray-500 hover:text-gray-900"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDescriptionEditor;
