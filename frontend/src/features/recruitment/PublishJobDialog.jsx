import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useUpdateJobMutation, useGetRecruitmentIntegrationsQuery } from '../../store/api';
import { CheckCircle, XCircle, Loader, ExternalLink, TrendingUp, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const PublishJobDialog = ({ job, isOpen, onClose }) => {
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [publishing, setPublishing] = useState(false);
    const [publishResults, setPublishResults] = useState(null);

    const { data: integrations } = useGetRecruitmentIntegrationsQuery();
    const [updateJob] = useUpdateJobMutation();

    const platforms = [
        {
            id: 'linkedin',
            name: 'LinkedIn',
            logo: '🔗',
            color: 'bg-blue-600',
            description: 'Professional network - Best for corporate roles'
        },
        {
            id: 'indeed',
            name: 'Indeed',
            logo: '💼',
            color: 'bg-indigo-600',
            description: 'World\'s #1 job site - Maximum reach'
        },
        {
            id: 'fuzu',
            name: 'Fuzu',
            logo: '🌍',
            color: 'bg-green-600',
            description: 'East African jobs - Local talent'
        },
        {
            id: 'brightermonday',
            name: 'BrighterMonday',
            logo: '🇺🇬',
            color: 'bg-purple-600',
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
        if (selectedPlatforms.length === 0) {
            toast.error('Please select at least one platform');
            return;
        }

        setPublishing(true);
        setPublishResults(null);

        try {
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
                // Update job status locally
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
                    <DialogTitle className="text-xl">Publish Job: {job?.title}</DialogTitle>
                    <p className="text-sm text-slate-500 mt-1">
                        Select platforms to publish your job posting
                    </p>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Quick Actions */}
                    <div className="flex justify-between items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={publishing}
                        >
                            Select All Active
                        </Button>
                        <span className="text-sm text-slate-500">
                            {selectedPlatforms.length} platform(s) selected
                        </span>
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
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }
                    ${!isActive && 'opacity-50 cursor-not-allowed'}
                  `}
                                >
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-3 right-3">
                                        {isSelected ? (
                                            <div className="h-5 w-5 bg-primary-600 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                        ) : (
                                            <div className="h-5 w-5 border-2 border-slate-300 rounded-full" />
                                        )}
                                    </div>

                                    {/* Platform Info */}
                                    <div className="flex items-start gap-3">
                                        <div className={`text-3xl`}>{platform.logo}</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900">{platform.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{platform.description}</p>

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
                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Publishing Results
                            </h3>
                            {Object.entries(publishResults.platforms).map(([platform, result]) => (
                                <div
                                    key={platform}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        {result.success ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        <div>
                                            <p className="font-medium capitalize">{platform}</p>
                                            {result.success && result.url && (
                                                <a
                                                    href={result.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary-600 hover:underline flex items-center gap-1"
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
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={publishing}
                            className="flex-1"
                        >
                            {publishResults ? 'Close' : 'Cancel'}
                        </Button>
                        {!publishResults && (
                            <Button
                                onClick={handlePublish}
                                disabled={publishing || selectedPlatforms.length === 0}
                                className="flex-1 bg-primary-600 hover:bg-primary-700"
                            >
                                {publishing ? (
                                    <>
                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    `Publish to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}`
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Help Text */}
                    {!publishResults && (
                        <p className="text-xs text-slate-500 text-center">
                            💡 Tip: Configure platform integrations in Settings to enable publishing
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PublishJobDialog;
