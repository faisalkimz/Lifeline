import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useUpdateJobMutation } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Save, X, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const JobDescriptionEditor = ({ job, isOpen, onClose }) => {
    const [description, setDescription] = useState(job?.description || '');
    const [publishDate, setPublishDate] = useState('');
    const [publishTime, setPublishTime] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [updateJob] = useUpdateJobMutation();

    useEffect(() => {
        if (job?.description) {
            setDescription(job.description);
        }
        if (job?.scheduled_publish_date) {
            const dateObj = new Date(job.scheduled_publish_date);
            setPublishDate(dateObj.toISOString().split('T')[0]);
            setPublishTime(dateObj.toTimeString().slice(0, 5));
        }
    }, [job]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatePayload = {
                id: job.id,
                description,
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col h-[85vh] w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Job Description</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{job?.title}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{job?.department_name || 'No Department'}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-200 rounded-full">
                        <X className="h-5 w-5 text-gray-500" />
                    </Button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Editor */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                        <ReactQuill
                            theme="snow"
                            value={description}
                            onChange={setDescription}
                            modules={modules}
                            formats={formats}
                            className="flex-1 flex flex-col overflow-hidden [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-white [&_.ql-toolbar]:px-4 [&_.ql-toolbar]:py-3 [&_.ql-container]:border-0 [&_.ql-editor]:p-8 [&_.ql-editor]:text-base [&_.ql-editor]:text-gray-700 [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:font-sans [&_.ql-editor.ql-blank::before]:text-gray-400 [&_.ql-editor.ql-blank::before]:font-normal"
                            placeholder="Write a compelling job description..."
                        />
                    </div>

                    {/* Sidebar Settings */}
                    <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
                        {/* Scheduled Publishing Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                Publishing Schedule
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Set a specific date and time to automatically publish this job posting.
                                </p>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Publish Date</label>
                                        <input
                                            type="date"
                                            value={publishDate}
                                            onChange={(e) => setPublishDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Publish Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="time"
                                                value={publishTime}
                                                onChange={(e) => setPublishTime(e.target.value)}
                                                className="w-full h-10 pl-10 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {publishDate && publishTime && (
                                    <div className="flex gap-2 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 items-start">
                                        <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>
                                            Scheduled for <strong>{new Date(`${publishDate}T${publishTime}`).toLocaleDateString()}</strong> at <strong>{new Date(`${publishDate}T${publishTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-200">
                            <div className="grid gap-3">
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-11"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader className="h-4 w-4 mr-2 animate-spin" />
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
                                    variant="outline"
                                    className="w-full h-11"
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
