import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useUpdateJobMutation, useGetRecruitmentIntegrationsQuery } from '../../store/api';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ExternalLink, Activity, Calendar, Clock, Linkedin, Search, Globe, Sun, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

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
            icon: Linkedin,
            color: 'bg-[#0077b5]/10 border-[#0077b5]/20 text-[#0077b5]',
            activeColor: 'bg-[#0077b5] border-[#0077b5] text-white',
            description: 'Professional network - Best for corporate roles'
        },
        {
            id: 'indeed',
            name: 'Indeed',
            icon: Search,
            color: 'bg-[#2164f3]/10 border-[#2164f3]/20 text-[#2164f3]',
            activeColor: 'bg-[#2164f3] border-[#2164f3] text-white',
            description: 'World\'s #1 job site - Maximum reach'
        },
        {
            id: 'fuzu',
            name: 'Fuzu',
            icon: Globe,
            color: 'bg-emerald-50 border-emerald-200 text-emerald-600',
            activeColor: 'bg-emerald-600 border-emerald-600 text-white',
            description: 'East African jobs - Local talent'
        },
        {
            id: 'brightermonday',
            name: 'BrighterMonday',
            icon: Sun,
            color: 'bg-orange-50 border-orange-200 text-orange-600',
            activeColor: 'bg-orange-500 border-orange-500 text-white',
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
        const integrationsArray = Array.isArray(integrations) ? integrations : (integrations?.results || []);
        return integrationsArray.some(
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
                updateJob({ id: job.id, status: 'published' });
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-3xl">
                <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                            <Globe className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                                Publish Job
                            </DialogTitle>
                            <p className="text-sm text-slate-500 mt-1 font-medium">
                                Choose platforms to publish <strong>{job?.title}</strong>
                            </p>
                        </div>
                    </div>
                    <Link to={`/recruitment/jobs/${job.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 hover:text-slate-900 font-bold rounded-xl shadow-sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Scheduled Publishing */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <Calendar className="h-5 w-5 text-slate-900" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Schedule Publishing</h3>
                                <p className="text-xs text-slate-500">Automatically publish at a later date.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={publishDate}
                                    onChange={(e) => setPublishDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-200 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Time
                                </label>
                                <input
                                    type="time"
                                    value={publishTime}
                                    onChange={(e) => setPublishTime(e.target.value)}
                                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-200 outline-none"
                                />
                            </div>
                        </div>
                        {publishDate && publishTime && (
                            <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
                                <Clock className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-bold text-slate-700">
                                    Scheduled for {new Date(`${publishDate}T${publishTime}`).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Platforms */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Publish Immediately</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                disabled={publishing}
                                className="text-slate-500 hover:text-slate-900"
                            >
                                Select All Active
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {platforms.map(platform => {
                                const isActive = isIntegrationActive(platform.id);
                                const isSelected = selectedPlatforms.includes(platform.id);

                                return (
                                    <div
                                        key={platform.id}
                                        onClick={() => isActive && handlePlatformToggle(platform.id)}
                                        className={cn(
                                            "relative p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 active:scale-95",
                                            isSelected ? "border-slate-900 bg-slate-50 shadow-md" : "border-slate-200 bg-white hover:border-slate-300",
                                            !isActive && "opacity-50 cursor-not-allowed grayscale"
                                        )}
                                    >
                                        <div className="flex-1 flex gap-4">
                                            <div className={cn("p-3 rounded-xl border", platform.color)}>
                                                <platform.icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{platform.name}</h3>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{platform.description}</p>
                                                <div className="mt-2">
                                                    {isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Ready
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                                            <XCircle className="h-3 w-3" />
                                                            Not Connected
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-4 right-4">
                                                <div className="h-6 w-6 bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                                                    <CheckCircle className="h-3.5 w-3.5 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Results */}
                    {publishResults && (
                        <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                Publishing Results
                            </h3>
                            {Object.entries(publishResults.platforms).map(([platform, result]) => (
                                <div key={platform} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        {result.success ? (
                                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm capitalize">{platform}</p>
                                            {result.success && result.url && (
                                                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium">
                                                    View Listing <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {!result.success && <p className="text-xs text-red-500">{result.error}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={publishing} className="flex-1 h-12 rounded-xl text-slate-500 hover:text-slate-900 font-bold">
                        {publishResults ? 'Close' : 'Cancel'}
                    </Button>
                    {!publishResults && (
                        <Button
                            onClick={handlePublish}
                            disabled={publishing || (selectedPlatforms.length === 0 && !publishDate)}
                            className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 rounded-xl font-bold"
                        >
                            {publishing ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Publishing...
                                </>
                            ) : publishDate && publishTime ? (
                                'Schedule Publish'
                            ) : (
                                `Publish Now (${selectedPlatforms.length})`
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PublishJobDialog;
