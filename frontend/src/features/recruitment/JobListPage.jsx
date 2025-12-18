import React, { useState } from 'react';
import {
    useGetJobsQuery,
    useCreateJobMutation,
    useUpdateJobMutation,
    usePublishJobMutation,
    useGetRecruitmentIntegrationsQuery,
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Plus, Briefcase, MapPin, Globe, Clock, CheckCircle,
    User, Search, Target, Zap, ArrowUpRight, ChevronRight,
    BarChart3, Users, LayoutDashboard, Settings2, Trash2,
    Eye, MoreHorizontal, MousePointer2, Send, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const JobListPage = () => {
    const { data: jobs, isLoading } = useGetJobsQuery();
    const [createJob] = useCreateJobMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
            await createJob(formData).unwrap();
            toast.success("Job Requisition Deployed!");
            setIsDialogOpen(false);
            setFormData({
                title: '', description: '', requirements: '',
                location: 'Kampala, Uganda', employment_type: 'full_time', status: 'draft',
                salary_min: '', salary_max: '', is_remote: false
            });
        } catch (error) {
            toast.error("Deployment failed check system logs.");
        }
    };

    const filteredJobs = jobs?.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-in font-sans">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <LayoutDashboard className="h-8 w-8 text-primary-600" />
                        Requisition Terminal
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Monitor and deploy job opportunities across the global ecosystem.</p>
                </div>
                <div className="flex gap-4">
                    <Link to="/recruitment/pipeline">
                        <Button variant="outline" className="rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest px-6 h-14 bg-white hover:bg-slate-50">
                            <Activity className="h-4 w-4 mr-2" /> Live Pipeline
                        </Button>
                    </Link>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/20 font-black uppercase text-[10px] tracking-widest px-8 h-14">
                                <Plus className="h-5 w-5 mr-2" /> Initialise Requisition
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden max-w-2xl">
                            <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Briefcase className="h-32 w-32" />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                        Manual Requisition
                                    </DialogTitle>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">Standardizing talent acquisition across the enterprise.</p>
                                </DialogHeader>
                            </div>
                            <form onSubmit={handleSubmit} className="p-10 space-y-6 bg-white max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Job Title</label>
                                        <input
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            placeholder="e.g. Lead UI Systems Architect"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Employment Matrix</label>
                                        <select
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold outline-none cursor-pointer"
                                            value={formData.employment_type}
                                            onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                                        >
                                            <option value="full_time">Full Time (FT)</option>
                                            <option value="part_time">Part Time (PT)</option>
                                            <option value="contract">Contract (C)</option>
                                            <option value="internship">Internship (I)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Geo Location</label>
                                        <input
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 flex items-center pt-6 px-2">
                                        <input
                                            type="checkbox"
                                            id="is_remote"
                                            className="h-5 w-5 text-primary-600 rounded-md border-slate-200"
                                            checked={formData.is_remote}
                                            onChange={e => setFormData({ ...formData, is_remote: e.target.checked })}
                                        />
                                        <label htmlFor="is_remote" className="ml-3 text-xs font-black uppercase text-slate-500 tracking-widest italic">Remote Protocol</label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Mission Description</label>
                                    <textarea
                                        className="w-full min-h-32 bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="What is the objective of this role?"
                                    />
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <Button type="button" onClick={() => setIsDialogOpen(false)} variant="ghost" className="flex-1 h-16 rounded-[2rem] font-black uppercase text-xs tracking-widest text-slate-400">Abort</Button>
                                    <Button type="submit" className="flex-[2] h-16 rounded-[2rem] bg-slate-900 font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-900/20">Commit Requisition</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tactical Navigation Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50">
                <div className="flex gap-2">
                    <Link to="/recruitment/candidates">
                        <Button variant="ghost" className="rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest italic group hover:bg-slate-50">
                            <Users className="h-4 w-4 mr-2 text-slate-400 group-hover:text-primary-600" /> Registry
                        </Button>
                    </Link>
                    <Link to="/recruitment/integrations">
                        <Button variant="ghost" className="rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest italic group hover:bg-slate-50">
                            <Globe className="h-4 w-4 mr-2 text-slate-400 group-hover:text-primary-600" /> Ecosystem
                        </Button>
                    </Link>
                </div>
                <div className="h-6 w-px bg-slate-100 hidden md:block"></div>
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan requisitions for titles, location, status..."
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Requisition Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-50 rounded-[3rem] animate-pulse"></div>)}
                </div>
            ) : filteredJobs?.length === 0 ? (
                <Card className="border-none shadow-xl shadow-slate-100 bg-white rounded-[4rem] p-24 text-center">
                    <div className="inline-flex p-10 bg-slate-50 rounded-full mb-8">
                        <Briefcase className="h-16 w-16 text-slate-200" />
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 uppercase italic mb-3 tracking-tighter">No Active Requisitions</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-sm mx-auto leading-loose italic">
                        The mission queue is currently empty. Initialise a new requisition to begin talent acquisition.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredJobs?.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
};

const JobCard = ({ job }) => {
    const [publishJob] = usePublishJobMutation();
    const { data: integrations } = useGetRecruitmentIntegrationsQuery();
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    const integrationList = Array.isArray(integrations?.results) ? integrations.results : (Array.isArray(integrations) ? integrations : []);

    const handlePublish = async () => {
        try {
            const res = await publishJob({
                id: job.id,
                platforms: selectedPlatforms
            }).unwrap();
            toast.success("Global Deployment Successful!");
            setIsPublishOpen(false);
        } catch (e) {
            toast.error("Deployment Interrupt Detected.");
        }
    };

    const togglePlatform = (platform) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[3rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white border-b-8 border-b-slate-50">
            <CardContent className="p-0">
                <div className="p-10 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <Badge className={cn(
                            "rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest border-none",
                            job.status === 'published' ? 'bg-emerald-500 text-white' :
                                job.status === 'draft' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                        )}>
                            {job.status}
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="h-3 w-3" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">
                                {job.location} {job.is_remote ? '• REMOTE' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Performance Telemetry */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                <Users className="h-3 w-3" /> Pipeline
                            </p>
                            <p className="text-sm font-black text-slate-900">{job.application_count || 0} Candidates</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                <Activity className="h-3 w-3" /> Outreach
                            </p>
                            <p className="text-sm font-black text-slate-900">{job.external_posts?.length || 0} Channels</p>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3">
                        {job.status === 'draft' ? (
                            <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex-1 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest h-14 group/btn shadow-xl shadow-slate-900/10">
                                        Deploy Now <Send className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden max-w-lg">
                                    <div className="bg-slate-900 p-8 text-white">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-black uppercase tracking-widest italic">Global Distribution</DialogTitle>
                                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Select broadcast channels for this requisition.</p>
                                        </DialogHeader>
                                    </div>
                                    <div className="p-8 space-y-6 bg-white">
                                        <div className="space-y-3">
                                            {/* Native Channel */}
                                            <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-emerald-50/30">
                                                <div className="h-10 w-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Internal Portal</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase italic">Native Career Page</p>
                                                </div>
                                            </div>

                                            {/* Integrated Channels */}
                                            {integrationList.filter(i => i.is_active).map(integration => (
                                                <div
                                                    key={integration.id}
                                                    onClick={() => togglePlatform(integration.platform)}
                                                    className={cn(
                                                        "flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all",
                                                        selectedPlatforms.includes(integration.platform) ? 'border-primary-500 bg-primary-50/20' : 'border-slate-100 hover:bg-slate-50'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-10 w-10 flex items-center justify-center rounded-xl transition-colors",
                                                        selectedPlatforms.includes(integration.platform) ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'
                                                    )}>
                                                        <Globe className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{integration.platform}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase italic tracking-widest">External Provider</p>
                                                    </div>
                                                    {selectedPlatforms.includes(integration.platform) && <CheckCircle className="h-5 w-5 text-primary-600" />}
                                                </div>
                                            ))}

                                            {integrationList.filter(i => i.is_active).length === 0 && (
                                                <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No External Channels Connected</p>
                                                    <Link to="/recruitment/integrations" className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline">Connect Providers <ArrowUpRight className="h-3 w-3 inline ml-1" /></Link>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            onClick={handlePublish}
                                            disabled={selectedPlatforms.length === 0}
                                            className="w-full h-14 rounded-2xl bg-slate-900 font-black uppercase text-xs tracking-widest"
                                        >
                                            Transmit Broadcast
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <Link to={`/recruitment/jobs/${job.id}`} className="flex-1">
                                <Button className="w-full rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest h-14 group/btn">
                                    Analytics <Activity className="h-4 w-4 ml-2 group-hover/btn:scale-125 transition-transform" />
                                </Button>
                            </Link>
                        )}
                        <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-slate-50 hover:bg-slate-100 p-0 text-slate-400">
                            <Settings2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default JobListPage;
