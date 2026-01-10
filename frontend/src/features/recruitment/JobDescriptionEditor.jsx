import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useUpdateJobMutation } from '../../store/api';
import {
    Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter,
    AlignRight, Heading1, Heading2, Link as LinkIcon, Calendar, Clock, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const JobDescriptionEditor = ({ job, isOpen, onClose, onSave }) => {
    const [description, setDescription] = useState('');
    const [publishDate, setPublishDate] = useState('');
    const [publishTime, setPublishTime] = useState('');
    const [updateJob, { isLoading }] = useUpdateJobMutation();

    useEffect(() => {
        if (job) {
            setDescription(job.description || '');
            if (job.scheduled_publish_date) {
                const date = new Date(job.scheduled_publish_date);
                setPublishDate(date.toISOString().split('T')[0]);
                setPublishTime(date.toTimeString().slice(0, 5));
            }
        }
    }, [job]);

    const handleFormat = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const handleSave = async () => {
        try {
            const scheduledDateTime = publishDate && publishTime
                ? new Date(`${publishDate}T${publishTime}`).toISOString()
                : null;

            await updateJob({
                id: job.id,
                description,
                scheduled_publish_date: scheduledDateTime
            }).unwrap();

            toast.success('Job description updated successfully');
            onSave?.();
            onClose();
        } catch (error) {
            toast.error('Failed to update job description');
            console.error(error);
        }
    };

    const toolbarButtons = [
        { icon: Bold, command: 'bold', label: 'Bold' },
        { icon: Italic, command: 'italic', label: 'Italic' },
        { icon: Heading1, command: 'formatBlock', value: '<h1>', label: 'Heading 1' },
        { icon: Heading2, command: 'formatBlock', value: '<h2>', label: 'Heading 2' },
        { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
        { icon: AlignLeft, command: 'justifyLeft', label: 'Align Left' },
        { icon: AlignCenter, command: 'justifyCenter', label: 'Align Center' },
        { icon: AlignRight, command: 'justifyRight', label: 'Align Right' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Edit Job Description: {job?.title}
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        Create a compelling job description with rich formatting
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 pt-4">
                    {/* Toolbar */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex flex-wrap gap-2">
                            {toolbarButtons.map((btn, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleFormat(btn.command, btn.value)}
                                    className="p-2 hover:bg-white rounded border border-transparent hover:border-gray-300 transition-all"
                                    title={btn.label}
                                >
                                    <btn.icon className="h-4 w-4 text-gray-700" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                            dangerouslySetInnerHTML={{ __html: description }}
                            className="min-h-[400px] p-6 bg-white focus:outline-none prose prose-sm max-w-none"
                            style={{
                                lineHeight: '1.6',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {/* Scheduled Publishing */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Scheduled Publishing</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Set a specific date and time to automatically publish this job posting
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Publish Date
                                </label>
                                <input
                                    type="date"
                                    value={publishDate}
                                    onChange={(e) => setPublishDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Publish Time
                                </label>
                                <input
                                    type="time"
                                    value={publishTime}
                                    onChange={(e) => setPublishTime(e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        {publishDate && publishTime && (
                            <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-blue-700">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        Will publish on {new Date(`${publishDate}T${publishTime}`).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                        <div
                            className="prose prose-sm max-w-none bg-white p-6 rounded-lg border border-gray-200"
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default JobDescriptionEditor;
