import React, { useState, useMemo } from 'react';
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
    Plus, Briefcase, MapPin, Search, Eye, Edit,
    Globe, Clock, Users, CheckCircle2,
    TrendingUp, Filter, MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PublishJobDialog from './PublishJobDialog';
import JobDescriptionEditor from './JobDescriptionEditor';
import { motion, AnimatePresence } from 'framer-motion';

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
            toast.success("Job position created successfully.");
            setIsDialogOpen(false);
            setFormData({
                title: '', description: '', requirements: '',
                location: 'Kampala, Uganda', employment_type: 'full_time', status: 'draft',
                salary_min: '', salary_max: '', is_remote: false
            });
        } catch (error) {
            toast.error('Failed to create job.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const jobsArray = useMemo(() => Array.isArray(jobs) ? jobs : (jobs?.results || []), [jobs]);
    const filteredJobs = useMemo(() => jobsArray?.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [jobsArray, searchTerm]);

    const stats = useMemo(() => ({
        total: jobsArray.length,
        active: jobsArray.filter(j => j.status === 'published').length,
        drafts: jobsArray.filter(j => j.status === 'draft').length,
        applications: jobsArray.reduce((acc, job) => acc + (job.application_count || 0), 0)
    }), [jobsArray]);

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Job Openings</h1>
                    <p className="text-gray-500 mt-2">Create and manage job postings to attract top talent.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/recruitment/pipeline">
                        <Button variant="outline" className="rounded-xl h-11 border-gray-200">
                            <TrendingUp className="h-4 w-4 mr-2" /> Pipeline
                        </Button>
                    </Link>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl h-11 bg-gray-900 text-white font-medium shadow-lg shadow-slate-900/20">
                                <Plus className="h-4 w-4 mr-2" /> Post New Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
                            <DialogHeader className="p-8 pb-4 border-b border-slate-100">
                                <DialogTitle className="text-2xl font-bold text-gray-900">Create Job Opening</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Job Title</label>
                                        <Input
                                            name="title" value={formData.title} onChange={handleInputChange} required
                                            placeholder="e.g. Senior Software Engineer"
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Employment Type</label>
                                        <select
                                            name="employment_type" value={formData.employment_type} onChange={handleInputChange}
                                            className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                                        >
                                            <option value="full_time">Full Time</option>
                                            <option value="part_time">Part Time</option>
                                            <option value="contract">Contract</option>
                                            <option value="internship">Internship</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Location</label>
                                    <Input
                                        name="location" value={formData.location} onChange={handleInputChange} required
                                        placeholder="e.g. Kampala HQ"
                                        className="bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Description</label>
                                    <textarea
                                        name="description" value={formData.description} onChange={handleInputChange} required
                                        rows="4" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none resize-none"
                                        placeholder="Briefly describe the role..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-slate-100 cursor-pointer">
                                    <input
                                        type="checkbox" id="is_remote" className="h-5 w-5 rounded border-gray-300 text-gray-900 focus:ring-slate-900"
                                        checked={formData.is_remote} onChange={e => setFormData({ ...formData, is_remote: e.target.checked })}
                                    />
                                    <label htmlFor="is_remote" className="text-sm font-bold text-gray-700 cursor-pointer select-none">This is a remote position</label>
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <Button type="button" onClick={() => setIsDialogOpen(false)} variant="ghost">Cancel</Button>
                                    <Button type="submit" disabled={isCreating} className="bg-gray-900 text-white hover:bg-gray-800">
                                        Create Job
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Jobs" value={stats.total} icon={Briefcase} color="bg-blue-50 text-blue-600" />
                <StatCard label="Active" value={stats.active} icon={Globe} color="bg-primary-50 text-primary-600" />
                <StatCard label="Drafts" value={stats.drafts} icon={Edit} color="bg-amber-50 text-amber-600" />
                <StatCard label="Total Applications" value={stats.applications} icon={Users} color="bg-purple-50 text-purple-600" />
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text" placeholder="Search jobs..."
                        className="w-full h-10 pl-10 pr-4 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Job Grid */}
            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-slate-900 rounded-full" />
                </div>
            ) : filteredJobs?.length === 0 ? (
                <div className="py-20 text-center rounded-3xl bg-gray-50 border border-dashed border-gray-200">
                    <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="font-bold text-gray-900">No jobs found</p>
                    <p className="text-sm text-gray-500">Get started by creating a new job opening.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredJobs?.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
        </div>
    </div>
);

const JobCard = ({ job }) => {
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    return (
        <motion.div
            layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="group h-full"
        >
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:border-gray-300 transition-all cursor-pointer h-full flex flex-col overflow-hidden">
                <div className="p-6 pb-4 flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <Badge className={
                            job.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }>
                            {job.status}
                        </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{job.title}</h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-6">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                            <Clock className="h-3 w-3" />
                            {job.employment_type?.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-slate-100">
                        <div className="text-center flex-1 border-r border-gray-200">
                            <p className="text-xs text-gray-500 font-medium">Applicants</p>
                            <p className="text-lg font-bold text-gray-900">{job.application_count || 0}</p>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500 font-medium">Views</p>
                            <p className="text-lg font-bold text-gray-900">{job.views || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-slate-100 flex gap-2">
                    <Link to={`/recruitment/jobs/${job.id}`} className="flex-1">
                        <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm h-9">
                            Manage
                        </Button>
                    </Link>
                    <Button
                        size="icon" variant="ghost"
                        onClick={() => setIsEditorOpen(true)}
                        className="h-9 w-9 bg-white border border-gray-200 text-gray-500 hover:text-gray-900"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    {job.status === 'draft' && (
                        <Button
                            size="icon" variant="ghost"
                            onClick={() => setIsPublishOpen(true)}
                            className="h-9 w-9 bg-primary-50 border border-emerald-100 text-primary-600 hover:bg-emerald-100"
                        >
                            <Globe className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </Card>

            <PublishJobDialog job={job} isOpen={isPublishOpen} onClose={() => setIsPublishOpen(false)} />
            <JobDescriptionEditor job={job} isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
        </motion.div>
    );
};

export default JobListPage;
