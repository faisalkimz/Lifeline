import React, { useState } from 'react';
import {
    useGetJobsQuery,
    useCreateJobMutation,
    useUpdateJobMutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Plus, Briefcase, MapPin, Globe, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const JobListPage = () => {
    const { data: jobs, isLoading } = useGetJobsQuery();
    const [createJob] = useCreateJobMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: 'Remote',
        employment_type: 'full_time',
        status: 'draft'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createJob(formData).unwrap();
            toast.success("Job created successfully");
            setIsDialogOpen(false);
            setFormData({ title: '', description: '', requirements: '', location: 'Remote', employment_type: 'full_time', status: 'draft' });
        } catch (error) {
            toast.error("Failed to create job");
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
                    <p className="text-gray-500">Manage job postings and candidates.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/recruitment/pipeline">
                        <Button variant="outline">View Pipeline</Button>
                    </Link>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="h-4 w-4" /> Post Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Job Posting</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Job Title</label>
                                        <input
                                            className="w-full border rounded-md p-2"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            placeholder="e.g. Senior React Developer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Employment Type</label>
                                        <select
                                            className="w-full border rounded-md p-2"
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Location</label>
                                        <input
                                            className="w-full border rounded-md p-2"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Initial Status</label>
                                        <select
                                            className="w-full border rounded-md p-2"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="internal">Internal Only</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        className="w-full border rounded-md p-2"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows="4"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Requirements</label>
                                    <textarea
                                        className="w-full border rounded-md p-2"
                                        value={formData.requirements}
                                        onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                        rows="3"
                                        placeholder="- 3+ years experience..."
                                    />
                                </div>
                                <Button type="submit" className="w-full">Create Job Posting</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading jobs...</div>
            ) : !jobs?.length ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-gray-500">
                        No job postings found. Create one to get started!
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
};

const JobCard = ({ job }) => {
    const [updateJob] = useUpdateJobMutation();

    const handlePublish = async () => {
        try {
            await updateJob({ id: job.id, status: 'published' }).unwrap();
            toast.success("Job published!");
        } catch (e) {
            toast.error("Failed to publish");
        }
    };

    return (
        <Card className="hover:shadow-lg transition-all group">
            <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg ${job.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wide ${job.status === 'published' ? 'bg-green-100 text-green-700' :
                            job.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {job.status}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-500 mb-6 flex-1">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {job.location} {job.is_remote ? '(Remote)' : ''}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> {job.employment_type.replace('_', ' ')}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm font-medium">
                        <span className="text-gray-900">{job.application_count || 0}</span>
                        <span className="text-gray-500 ml-1">applicants</span>
                    </div>
                    {job.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={handlePublish} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            Publish Now
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default JobListPage;
