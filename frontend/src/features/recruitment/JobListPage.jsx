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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Openings</h1>
                    <p className="text-slate-500 mt-2">Create and manage job postings to attract top talent.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/recruitment/pipeline">
                        <Button variant="outline" className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-slate-200">
                            <TrendingUp className="h-4 w-4 mr-2" /> Pipeline
                        </Button>
                    </Link>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-10 px-4 bg-[#88B072] hover:bg-[#7aa265] text-white text-xs font-semibold uppercase tracking-wider">
                                <Plus className="h-4 w-4 mr-2" /> New Job Pos
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
                            <DialogHeader className="p-8 pb-4 border-b border-slate-100">
                                <DialogTitle className="text-2xl font-bold text-slate-900">Create Job Opening</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Job Title</label>
                                        <Input
                                            name="title" value={formData.title} onChange={handleInputChange} required
                                            placeholder="e.g. Senior Software Engineer"
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Employment Type</label>
                                        <select
                                            name="employment_type" value={formData.employment_type} onChange={handleInputChange}
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                                        >
                                            <option value="full_time">Full Time</option>
                                            <option value="part_time">Part Time</option>
                                            <option value="contract">Contract</option>
                                            <option value="internship">Internship</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Location</label>
                                    <Input
                                        name="location" value={formData.location} onChange={handleInputChange} required
                                        placeholder="e.g. Kampala HQ"
                                        className="bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Description</label>
                                    <textarea
                                        name="description" value={formData.description} onChange={handleInputChange} required
                                        rows="4" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none resize-none"
                                        placeholder="Briefly describe the role..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                                    <input
                                        type="checkbox" id="is_remote" className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                        checked={formData.is_remote} onChange={e => setFormData({ ...formData, is_remote: e.target.checked })}
                                    />
                                    <label htmlFor="is_remote" className="text-sm font-bold text-slate-700 cursor-pointer select-none">This is a remote position</label>
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <Button type="button" onClick={() => setIsDialogOpen(false)} variant="ghost">Cancel</Button>
                                    <Button type="submit" disabled={isCreating} className="bg-slate-900 text-white hover:bg-slate-800">
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
                <StatCard label="Total Positions" value={stats.total} icon={Briefcase} />
                <StatCard label="Active" value={stats.active} icon={Globe} trend="up" />
                <StatCard label="Drafts" value={stats.drafts} icon={Edit} />
                <StatCard label="Applications" value={stats.applications} icon={Users} />
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                        type="text" placeholder="Search positions..."
                        className="w-full h-10 pl-10 pr-4 bg-slate-50/50 border border-slate-100 rounded text-sm focus:ring-0 focus:border-[#88B072] outline-none"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Job Grid */}
            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-slate-300 border-t-slate-900 rounded-full" />
                </div>
            ) : filteredJobs?.length === 0 ? (
                <div className="py-20 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                    <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="font-bold text-slate-900">No jobs found</p>
                    <p className="text-sm text-slate-500">Get started by creating a new job opening.</p>
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

const StatCard = ({ label, value, icon: Icon }) => (
    <div className="bg-white p-5 rounded border border-slate-200 shadow-sm flex items-center justify-between group hover:border-[#88B072]/30 transition-colors">
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="h-10 w-10 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#88B072] group-hover:bg-[#88B072]/5 transition-colors">
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
            <Card className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all h-full flex flex-col overflow-hidden">
                <div className="p-6 pb-4 flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-10 w-10 rounded border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${job.status === 'published' ? 'bg-[#88B072]/10 text-[#88B072]' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {job.status}
                        </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mb-1 truncate">{job.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {job.employment_type?.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded border border-slate-100">
                        <div className="text-center flex-1 border-r border-slate-200">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Applicants</p>
                            <p className="text-base font-bold text-slate-800">{job.application_count || 0}</p>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Views</p>
                            <p className="text-base font-bold text-slate-800">{job.views || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <Link to={`/recruitment/jobs/${job.id}`} className="flex-1">
                        <Button className="w-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm h-8 text-[10px] font-bold uppercase tracking-wider">
                            Manage
                        </Button>
                    </Link>
                    <Button
                        size="icon" variant="ghost"
                        onClick={() => setIsEditorOpen(true)}
                        className="h-8 w-8 bg-white border border-slate-200 text-slate-400 hover:text-slate-900"
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {job.status === 'draft' && (
                        <Button
                            size="icon" variant="ghost"
                            onClick={() => setIsPublishOpen(true)}
                            className="h-8 w-8 bg-[#88B072]/5 border border-[#88B072]/20 text-[#88B072] hover:bg-[#88B072]/10"
                        >
                            <Globe className="h-3.5 w-3.5" />
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
