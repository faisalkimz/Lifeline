import React, { useState } from 'react';
import {
    useGetJobsQuery,
    useCreateJobMutation,
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Plus, Briefcase, MapPin, Search, Send, FileText, CheckCircle, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PublishJobDialog from './PublishJobDialog';
import JobDescriptionEditor from './JobDescriptionEditor';

const JobListPage = () => {
    const { data: jobs, isLoading } = useGetJobsQuery();
    const [createJob] = useCreateJobMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: 'Kampala, Uganda',
        employment_type: 'full_time',
        status: 'draft',
        salary_min: '',
        salary_max: '',
        is_remote: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setFieldErrors({});
            await createJob(formData).unwrap();
            toast.success("Job created successfully!");
            setIsDialogOpen(false);
            setFormData({
                title: '', description: '', requirements: '',
                location: 'Kampala, Uganda', employment_type: 'full_time', status: 'draft',
                salary_min: '', salary_max: '', is_remote: false
            });
            setFieldErrors({});
        } catch (error) {
            const err = error?.data || error?.error || error?.message;
            if (err && typeof err === 'object' && !Array.isArray(err)) {
                const normalized = Object.fromEntries(Object.entries(err).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)]));
                setFieldErrors(normalized);
                toast.error('Failed to create job');
            } else {
                toast.error(err || 'Failed to create job');
            }
        }
    };

    const jobsArray = Array.isArray(jobs) ? jobs : (jobs?.results ? jobs.results : []);
    const filteredJobs = jobsArray?.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Clean Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
                    <p className="text-gray-600 mt-1">Manage your job openings</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/recruitment/pipeline">
                        <Button variant="outline">View Pipeline</Button>
                    </Link>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" /> Create Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Job</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                        <input
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.title}
                                            onChange={e => { setFormData({ ...formData, title: e.target.value }); setFieldErrors(prev => ({ ...prev, title: undefined })); }}
                                            required
                                            placeholder="e.g. Senior Software Engineer"
                                        />
                                        {fieldErrors.title && <p className="mt-1 text-sm text-red-500">{fieldErrors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={formData.employment_type}
                                            onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                                        >
                                            <option value="full_time">Full Time</option>
                                            <option value="part_time">Part Time</option>
                                            <option value="contract">Contract</option>
                                            <option value="internship">Internship</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={formData.location}
                                        onChange={e => { setFormData({ ...formData, location: e.target.value }); setFieldErrors(prev => ({ ...prev, location: undefined })); }}
                                        required
                                    />
                                    {fieldErrors.location && <p className="mt-1 text-sm text-red-500">{fieldErrors.location}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows="4"
                                        value={formData.description}
                                        onChange={e => { setFormData({ ...formData, description: e.target.value }); setFieldErrors(prev => ({ ...prev, description: undefined })); }}
                                        required
                                        placeholder="Describe the role..."
                                    />
                                    {fieldErrors.description && <p className="mt-1 text-sm text-red-500">{fieldErrors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows="3"
                                        value={formData.requirements}
                                        onChange={e => { setFormData({ ...formData, requirements: e.target.value }); setFieldErrors(prev => ({ ...prev, requirements: undefined })); }}
                                        required
                                        placeholder="List key requirements, skills, or experience needed"
                                    />
                                    {fieldErrors.requirements && <p className="mt-1 text-sm text-red-500">{fieldErrors.requirements}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_remote"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={formData.is_remote}
                                        onChange={e => setFormData({ ...formData, is_remote: e.target.checked })}
                                    />
                                    <label htmlFor="is_remote" className="text-sm text-gray-700">Remote Position</label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">Create Job</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search jobs by title or location..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Jobs Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>)}
                </div>
            ) : filteredJobs?.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600 mb-4">Create your first job to start recruiting</p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Create Job
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJobs?.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
};

const JobCard = ({ job }) => {
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const statusColors = {
        published: 'bg-green-100 text-green-700',
        draft: 'bg-yellow-100 text-yellow-700',
        closed: 'bg-gray-100 text-gray-700'
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow border border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <Badge className={`${statusColors[job.status]} border-0 capitalize`}>
                            {job.status}
                        </Badge>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{job.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                        {job.is_remote && <span className="text-blue-600">• Remote</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-600">Applications</p>
                            <p className="text-sm font-semibold text-gray-900">{job.application_count || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Published On</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {job.status === 'draft' && job.scheduled_publish_date ? (
                                    <span className="flex items-center gap-1 text-blue-600">
                                        <Clock className="h-3 w-3" /> Scheduled
                                    </span>
                                ) : (
                                    `${job.external_posts?.length || 0} platforms`
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Link to={`/recruitment/jobs/${job.id}`} className="w-full">
                            <Button className="w-full" size="sm" variant={job.status === 'draft' ? 'outline' : 'default'}>
                                View Details
                            </Button>
                        </Link>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 text-xs text-gray-500"
                                onClick={() => setIsEditorOpen(true)}
                            >
                                <FileText className="h-3 w-3 mr-1" /> Quick Edit
                            </Button>
                            {job.status === 'draft' && (
                                <Button
                                    className="flex-1"
                                    size="sm"
                                    onClick={() => setIsPublishOpen(true)}
                                >
                                    <Send className="h-3 w-3 mr-1" /> Publish
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <PublishJobDialog
                job={job}
                isOpen={isPublishOpen}
                onClose={() => setIsPublishOpen(false)}
            />

            <JobDescriptionEditor
                job={job}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
            />
        </>
    );
};

export default JobListPage;
