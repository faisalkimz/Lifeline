import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    useGetJobQuery,
    useGetApplicationsQuery,
    useUpdateJobMutation
} from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
    ArrowLeft, Calendar, MapPin, DollarSign,
    Users, Clock, Briefcase, FileText, Send, Edit, MoreVertical,
    CheckCircle, XCircle, Share2
} from 'lucide-react';
import JobDescriptionEditor from './JobDescriptionEditor';
import PublishJobDialog from './PublishJobDialog';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isPublishOpen, setIsPublishOpen] = useState(false);

    const { data: job, isLoading } = useGetJobQuery(id);
    const { data: applications } = useGetApplicationsQuery({ job: id });

    const statusColors = {
        published: 'bg-green-100 text-green-700',
        draft: 'bg-yellow-100 text-yellow-700',
        closed: 'bg-gray-100 text-gray-700',
        archived: 'bg-red-100 text-red-700'
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
                            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                            <Badge className={`${statusColors[job.status]} capitalize border-0`}>
                                {job.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {job.department_name || 'No Department'}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location} ({job.is_remote ? 'Remote' : 'On-site'})
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.employment_type?.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsEditorOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Job
                    </Button>
                    {job.status === 'draft' && (
                        <Button onClick={() => setIsPublishOpen(true)}>
                            <Send className="h-4 w-4 mr-2" />
                            Publish
                        </Button>
                    )}
                    {job.status === 'published' && (
                        <Button variant="outline">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">About the Role</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-blue max-w-none prose-sm sm:prose-base text-gray-600">
                            <div dangerouslySetInnerHTML={{ __html: job.description }} />
                        </CardContent>
                    </Card>

                    {/* Requirements Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-blue max-w-none prose-sm sm:prose-base text-gray-600">
                            <div className="whitespace-pre-line">{job.requirements}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wide text-gray-500 font-bold">Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                                <p className="text-xs text-primary-600 font-semibold uppercase">Applicants</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{job.application_count || 0}</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <p className="text-xs text-purple-600 font-semibold uppercase">Days Open</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24))}
                                </p>
                            </div>
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

                    {/* Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wide text-gray-500 font-bold">Budget</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Salary Range</span>
                                <span className="font-medium text-gray-900">
                                    {job.salary_min && job.salary_max
                                        ? `${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()}`
                                        : 'Not specified'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Currency</span>
                                <span className="font-medium text-gray-900">UGX</span>
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
