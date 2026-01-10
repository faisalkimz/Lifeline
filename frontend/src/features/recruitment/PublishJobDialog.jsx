import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useUpdateJobMutation, useGetRecruitmentIntegrationsQuery } from '../../store/api';
import { CheckCircle, XCircle, Loader, ExternalLink, Activity, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const PublishJobDialog = ({ job, isOpen, onClose }) => {
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [publishing, setPublishing] = useState(false);
    const [publishResults, setPublishResults] = useState(null);
    const [publishDate, setPublishDate] = useState('');
    const [publishTime, setPublishTime] = useState('');

    const { data: integrations } = useGetRecruitmentIntegrationsQuery();
    const [updateJob] = useUpdateJobMutation();

    const platforms = [
        {
            id: 'linkedin',
            name: 'LinkedIn',
            logo: '🔗',
            color: 'bg-blue-50 border-blue-200',
            description: 'Professional network - Best for corporate roles'
        },
        {
            id: 'indeed',
            name: 'Indeed',
            logo: '💼',
            color: 'bg-purple-50 border-purple-200',
            description: 'World\'s #1 job site - Maximum reach'
        },
        {
            id: 'fuzu',
            name: 'Fuzu',
            logo: '🌍',
            color: 'bg-green-50 border-green-200',
            description: 'East African jobs - Local talent'
        },
        {
            id: 'brightermonday',
            name: 'BrighterMonday',
            logo: '🇺🇬',
            color: 'bg-orange-50 border-orange-200',
            description: 'Uganda\'s #1 job site - Top local reach'
        },
    ];

    const handlePlatformToggle = (platformId) => {
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(p => p !== platformId)
                : [...prev, platformId]
        );
    };

    const handleSelectAll = () => {
        const activePlatforms = platforms
            .filter(p => isIntegrationActive(p.id))
            .map(p => p.id);
        setSelectedPlatforms(activePlatforms);
    };

    const isIntegrationActive = (platformId) => {
        return integrations?.some(
            int => int.platform === platformId && int.is_active
        );
    };

    const handlePublish = async () => {
        if (selectedPlatforms.length === 0 && !publishDate) {
            toast.error('Please select at least one platform or set a schedule');
            return;
        }

        setPublishing(true);
        setPublishResults(null);

        try {
            // If scheduled, update the job with scheduled date
            if (publishDate && publishTime) {
                const scheduledDateTime = new Date(`${publishDate}T${publishTime}`).toISOString();
                await updateJob({
                    id: job.id,
                    scheduled_publish_date: scheduledDateTime
                }).unwrap();
                toast.success('Job scheduled for publishing');
                onClose();
                return;
            }

            // Otherwise, publish immediately
            const response = await fetch(`/api/recruitment/jobs/${job.id}/publish/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ platforms: selectedPlatforms })
            });

            const data = await response.json();
            setPublishResults(data.results);

            if (data.status === 'published') {
                toast.success(data.message);
                await updateJob({ id: job.id, status: 'published' });
            } else {
                toast.warning(data.message);
            }
        } catch (error) {
            toast.error('Failed to publish job');
            console.error('Publish error:', error);
        } finally {
            setPublishing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Publish Job: {job?.title}
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        Select platforms to publish your job posting or schedule for later
                    </p>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Scheduled Publishing */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Schedule Publishing</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Set a specific date and time to automatically publish this job
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

                    {/* Quick Actions */}
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Or Publish Immediately</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={publishing}
                            className="border border-gray-200"
                        >
                            Select All Active
                        </Button>
                    </div>

                    {/* Platform Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {platforms.map(platform => {
                            const isActive = isIntegrationActive(platform.id);
                            const isSelected = selectedPlatforms.includes(platform.id);

                            return (
                                <div
                                    key={platform.id}
                                    onClick={() => isActive && handlePlatformToggle(platform.id)}
                                    className={`
                                        relative p-4 rounded-lg border-2 transition-all cursor-pointer
                                        ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                                        ${!isActive && 'opacity-50 cursor-not-allowed'}
                                    `}
                                >
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-3 right-3">
                                        {isSelected ? (
                                            <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                        ) : (
                                            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                                        )}
                                    </div>

                                    {/* Platform Info */}
                                    <div className="flex items-start gap-3">
                                        <div className="text-3xl">{platform.logo}</div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                                            <p className="text-xs text-gray-600 mt-1">{platform.description}</p>

                                            {/* Status Badge */}
                                            <div className="mt-2">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Configured
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                                        <XCircle className="h-3 w-3" />
                                                        Not Configured
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Publishing Results */}
                    {publishResults && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Publishing Results
                            </h3>
                            {Object.entries(publishResults.platforms).map(([platform, result]) => (
                                <div
                                    key={platform}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        {result.success ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900 capitalize">{platform}</p>
                                            {result.success && result.url && (
                                                <a
                                                    href={result.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    View on {platform}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {!result.success && (
                                                <p className="text-xs text-red-600">{result.error}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={publishing}
                            className="flex-1"
                        >
                            {publishResults ? 'Close' : 'Cancel'}
                        </Button>
                        {!publishResults && (
                            <Button
                                onClick={handlePublish}
                                disabled={publishing || (selectedPlatforms.length === 0 && !publishDate)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {publishing ? (
                                    <>
                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        Publishing...
                                    </>
                                ) : publishDate && publishTime ? (
                                    'Schedule Publishing'
                                ) : (
                                    `Publish to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}`
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Help Text */}
                    {!publishResults && (
                        <p className="text-xs text-gray-500 text-center">
                            💡 Tip: Configure platform integrations in Settings to enable publishing
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PublishJobDialog;
