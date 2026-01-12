import React, { useState } from 'react';
import {
    useGetJobsQuery,
    useCreateJobMutation,
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Plus, Briefcase, MapPin, Search, Send, FileText, Clock, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PublishJobDialog from './PublishJobDialog';
import JobDescriptionEditor from './JobDescriptionEditor';

const JobListPage = () => {
    const { data: jobs, isLoading } = useGetJobsQuery();
    const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const jobsArray = Array.isArray(jobs) ? jobs : (jobs?.results ? jobs.results : []);
    const filteredJobs = jobsArray?.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
                    <p className="text-gray-600 mt-1">Manage your open positions and talent pipeline</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/recruitment/pipeline">
                        <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">View Pipeline</Button>
                    </Link>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
                                <Plus className="h-4 w-4 mr-2" /> Create Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white rounded-xl shadow-xl border border-gray-100 p-0 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <DialogTitle className="text-xl font-bold text-gray-900">Create New Job</DialogTitle>
                                <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new job posting.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Job Title</label>
                                        <Input
                                            className="bg-white"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g. Senior Product Designer"
                                        />
                                        {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Employment Type</label>
                                        <div className="relative">
                                            <select
                                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none text-sm text-gray-900"
                                                name="employment_type"
                                                value={formData.employment_type}
                                                onChange={handleInputChange}
                                            >
                                                <option value="full_time">Full Time</option>
                                                <option value="part_time">Part Time</option>
                                                <option value="contract">Contract</option>
                                                <option value="internship">Internship</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Location</label>
                                    <Input
                                        className="bg-white"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Kampala, Uganda"
                                    />
                                    {fieldErrors.location && <p className="text-xs text-red-500">{fieldErrors.location}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow resize-none"
                                        rows="4"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Briefly describe the role..."
                                    />
                                    {fieldErrors.description && <p className="text-xs text-red-500">{fieldErrors.description}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Key Requirements</label>
                                    <textarea
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow resize-none"
                                        rows="3"
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="List the essential skills and experience..."
                                    />
                                    {fieldErrors.requirements && <p className="text-xs text-red-500">{fieldErrors.requirements}</p>}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            id="is_remote"
                                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            checked={formData.is_remote}
                                            onChange={e => setFormData({ ...formData, is_remote: e.target.checked })}
                                        />
                                    </div>
                                    <label htmlFor="is_remote" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                                        This is a remote position
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                    <Button type="button" onClick={() => setIsDialogOpen(false)} variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isCreating} className="bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md shadow-blue-200">
                                        {isCreating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                        Create Job
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search */}
            <Card className="border border-gray-200 shadow-sm bg-white">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search jobs by title, location, or department..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Jobs Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-4" />
                    <p className="text-gray-500">Loading jobs...</p>
                </div>
            ) : filteredJobs?.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-gray-300 bg-gray-50/50">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <Briefcase className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first job posting to start attracting top talent to your organization.</p>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-primary-600 hover:bg-primary-700">
                        <Plus className="h-4 w-4 mr-2" /> Create Job
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        published: 'bg-green-50 text-green-700 border-green-200',
        draft: 'bg-gray-100 text-gray-700 border-gray-200',
        closed: 'bg-red-50 text-red-700 border-red-200'
    };

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col h-full group">
                <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <Badge className={`${statusColors[job.status]} border font-medium capitalize px-2.5 py-0.5`}>
                            {job.status}
                        </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-5">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[100px]">{job.location}</span>
                        </div>
                        {job.is_remote && (
                            <span className="flex items-center gap-1 text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                Remote
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Applicants</p>
                            <p className="text-lg font-bold text-gray-900 mt-0.5">{job.application_count || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                                {job.status === 'draft' && job.scheduled_publish_date ? (
                                    <span className="flex items-center gap-1 text-primary-600">
                                        <Clock className="h-3.5 w-3.5" /> Scheduled
                                    </span>
                                ) : (
                                    job.status === 'published' ? 'Active' : 'Draft'
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex gap-2">
                    <Link to={`/recruitment/jobs/${job.id}`} className="flex-1">
                        <Button className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm" size="sm">
                            Details
                        </Button>
                    </Link>

                    {job.status === 'draft' ? (
                        <Button
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-blue-200"
                            size="sm"
                            onClick={() => setIsPublishOpen(true)}
                        >
                            <Send className="h-3 w-3 mr-1.5" /> Publish
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-gray-500 hover:text-gray-900"
                            onClick={() => setIsEditorOpen(true)}
                        >
                            <FileText className="h-3 w-3 mr-1.5" /> Edit
                        </Button>
                    )}
                </div>
            </div>

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
