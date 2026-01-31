import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    useGetJobQuery,
    useGetApplicationsQuery,
    useUpdateJobMutation,
    useRankJobApplicationsMutation
} from '../../store/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
    ArrowLeft, Calendar, MapPin, DollarSign,
    Users, Clock, Briefcase, FileText, Send, Edit, MoreVertical,
    CheckCircle, XCircle, Share2, TrendingUp, Loader2
} from 'lucide-react';
import JobDescriptionEditor from './JobDescriptionEditor';
import PublishJobDialog from './PublishJobDialog';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isPublishOpen, setIsPublishOpen] = useState(false);

    const { data: job, isLoading } = useGetJobQuery(id);
    const { data: applications, refetch: refetchApps } = useGetApplicationsQuery({ job: id });
    const [rankApplications, { isLoading: isRanking }] = useRankJobApplicationsMutation();

    const statusColors = {
        published: 'bg-[#88B072]/10 text-[#88B072]',
        draft: 'bg-slate-100 text-slate-500',
        closed: 'bg-rose-50 text-rose-600',
        archived: 'bg-slate-200 text-slate-600'
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/recruitment')}>
                    Back to Jobs
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/recruitment')}>
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
                            <span className={`${statusColors[job.status]} px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest`}>
                                {job.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 ">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <Briefcase className="h-3 w-3 text-slate-300" />
                                {job.department_name || 'No Department'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <MapPin className="h-3 w-3 text-slate-300" />
                                {job.location} ({job.is_remote ? 'Remote' : 'On-site'})
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <Clock className="h-3 w-3 text-slate-300" />
                                {job.employment_type?.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsEditorOpen(true)} className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-slate-200">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Position
                    </Button>
                    {job.status === 'draft' && (
                        <Button onClick={() => setIsPublishOpen(true)} className="h-10 px-4 bg-[#88B072] hover:bg-[#7aa265] text-white text-xs font-semibold uppercase tracking-wider">
                            <Send className="h-4 w-4 mr-2" />
                            Publish Job
                        </Button>
                    )}
                    {job.status === 'published' && (
                        <Button variant="outline" className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-slate-200">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">About the Role</h3>
                        </div>
                        <CardContent className="p-6 prose prose-slate max-w-none prose-sm text-slate-600">
                            <div dangerouslySetInnerHTML={{ __html: job.description }} />
                        </CardContent>
                    </Card>

                    <Card className="rounded border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requirements</h3>
                        </div>
                        <CardContent className="p-6 prose prose-slate max-w-none prose-sm text-slate-600">
                            <div className="whitespace-pre-line">{job.requirements}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="rounded border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overview</h3>
                        </div>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Applicants</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">{job.application_count || 0}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Days Open</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">
                                        {Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24))}
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="w-full h-10 bg-[#88B072] hover:bg-[#7aa265] text-white text-[10px] font-bold uppercase tracking-widest gap-2"
                                onClick={async () => {
                                    try {
                                        const res = await rankApplications(id).unwrap();
                                        toast.success(res.message || `Processed ${res.applications_processed} applications!`);
                                        refetchApps();
                                    } catch (err) {
                                        toast.error("Screening analysis failed.");
                                    }
                                }}
                                disabled={isRanking || !job.application_count}
                            >
                                {isRanking ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                                Evaluate Candidates
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Hiring Team */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wide text-gray-500 font-bold">Hiring Team</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{job.hiring_manager_name || 'Not Assigned'}</p>
                                    <p className="text-xs text-gray-500">Hiring Manager</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budgeting</h3>
                        </div>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-slate-400">Range</span>
                                <span className="text-slate-800">
                                    {job.salary_min && job.salary_max
                                        ? `${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()} UGX`
                                        : 'NEGOTIABLE'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-slate-400">Status</span>
                                <span className="text-slate-800">APPROVED</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <JobDescriptionEditor
                job={job}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
            />

            <PublishJobDialog
                job={job}
                isOpen={isPublishOpen}
                onClose={() => setIsPublishOpen(false)}
            />
        </div>
    );
};

export default JobDetailsPage;
