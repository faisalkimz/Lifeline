import React, { useState, useMemo } from 'react';
import {
    useGetCandidatesQuery,
    useCreateCandidateMutation,
    useParseResumeMutation
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import {
    Plus, Search, User, Mail, Phone, Upload,
    Eye, Loader2, Users, Briefcase, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { getMediaUrl } from '../../config/api';
import CandidateProfileDrawer from './CandidateProfileDrawer';
import { motion, AnimatePresence } from 'framer-motion';

const CandidateManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const { data: candidates = [], isLoading, refetch } = useGetCandidatesQuery();
    const [createCandidate] = useCreateCandidateMutation();
    const [parseResume] = useParseResumeMutation();

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        address: '', skills: '', experience_years: '',
        current_position: '', education_level: '',
        resume: null, notes: ''
    });

    const filteredCandidates = useMemo(() => {
        const candidatesArray = Array.isArray(candidates) ? candidates : (candidates?.results || []);
        return candidatesArray.filter(candidate => {
            const matchesSearch = (candidate.first_name + ' ' + candidate.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [candidates, searchTerm, selectedStatus]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormData(prev => ({ ...prev, resume: file }));

        setIsParsing(true);
        const parseFormData = new FormData();
        parseFormData.append('resume', file);

        try {
            const result = await parseResume(parseFormData).unwrap();
            toast.success('Resume parsed successfully.');
            setFormData(prev => ({
                ...prev,
                first_name: result.first_name || prev.first_name,
                last_name: result.last_name || prev.last_name,
                email: result.email || prev.email,
                phone: result.phone || prev.phone,
                skills: Array.isArray(result.skills) ? result.skills.join(', ') : prev.skills
            }));
        } catch (error) {
            toast.error('Could not auto-fill form. Please enter details manually.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            if (formData.skills) {
                const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
                submitData.delete('skills');
                skillsArray.forEach(s => submitData.append('skills', s));
            }

            await createCandidate(submitData).unwrap();
            toast.success('Candidate added to pool.');
            setIsAddDialogOpen(false);
            resetForm();
            refetch();
        } catch (error) {
            toast.error('Failed to add candidate.');
        }
    };

    const resetForm = () => {
        setFormData({
            first_name: '', last_name: '', email: '', phone: '',
            address: '', skills: '', experience_years: '',
            current_position: '', education_level: '',
            resume: null, notes: ''
        });
    };

    const stats = useMemo(() => {
        const pool = Array.isArray(candidates) ? candidates : (candidates?.results || []);
        return {
            total: pool.length,
            screening: pool.filter(c => c.status === 'screening').length,
            interview: pool.filter(c => c.status === 'interview').length,
            offer: pool.filter(c => c.status === 'offer').length
        };
    }, [candidates]);

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recruitment</h1>
                    <p className="text-slate-500 mt-2">Manage your talent pipeline and candidate relationships.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl h-11 bg-slate-900 text-white font-medium shadow-lg shadow-slate-900/20">
                            <Plus className="h-4 w-4 mr-2" /> Add Candidate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-4 border-b border-slate-100">
                            <DialogTitle className="text-2xl font-bold text-slate-900">Add New Candidate</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Resume Upload</label>
                                <div className={cn(
                                    "border-2 border-dashed rounded-2xl p-8 transition-all group flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30",
                                    formData.resume ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-slate-50'
                                )}>
                                    <input type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                                    <label htmlFor="resume-upload" className="cursor-pointer space-y-3 w-full">
                                        {isParsing ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                                                <p className="text-sm font-medium text-emerald-600">Parsing resume details...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto text-slate-400 group-hover:text-emerald-500 transition-colors border border-slate-100">
                                                    <Upload className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {formData.resume ? formData.resume.name : 'Click to upload resume'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">PDF or DOCX up to 10MB</p>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">First Name</label>
                                    <Input
                                        value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        className="bg-white" required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Last Name</label>
                                    <Input
                                        value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        className="bg-white" required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Email</label>
                                    <Input
                                        type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-white" required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Phone</label>
                                    <Input
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Info</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <Input placeholder="Years of Experience" value={formData.experience_years} onChange={e => setFormData({ ...formData, experience_years: e.target.value })} className="bg-white" />
                                    <Input placeholder="Current Position" value={formData.current_position} onChange={e => setFormData({ ...formData, current_position: e.target.value })} className="bg-white" />
                                </div>
                            </div>


                            <div className="pt-4 flex gap-3 justify-end">
                                <Button type="button" onClick={() => setIsAddDialogOpen(false)} variant="ghost">Cancel</Button>
                                <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                                    Add Candidate
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatBox label="Total Candidates" value={stats.total} icon={Users} color="bg-blue-50 text-blue-600" />
                <StatBox label="Screening" value={stats.screening} icon={Filter} color="bg-amber-50 text-amber-600" />
                <StatBox label="Interviewing" value={stats.interview} icon={Phone} color="bg-purple-50 text-purple-600" />
                <StatBox label="Offer Sent" value={stats.offer} icon={Mail} color="bg-emerald-50 text-emerald-600" />
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text" placeholder="Search candidates..."
                        className="w-full h-10 pl-10 pr-4 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Candidate Grid */}
            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                </div>
            ) : filteredCandidates.length === 0 ? (
                <div className="py-20 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                    <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="font-bold text-slate-900">No candidates found</p>
                    <p className="text-sm text-slate-500">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredCandidates.map((candidate) => (
                            <CandidateCard key={candidate.id} candidate={candidate} onClick={() => { setSelectedCandidate(candidate); setIsDrawerOpen(true); }} />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <CandidateProfileDrawer candidate={selectedCandidate} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </div>
    );
};

const StatBox = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
        </div>
    </div>
);

const CandidateCard = ({ candidate, onClick }) => (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group">
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer h-full flex flex-col" onClick={onClick}>
            <div className="p-6 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
                        {candidate.photo ? (
                            <img src={getMediaUrl(candidate.photo)} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-lg font-bold text-slate-400">
                                {candidate.first_name[0]}{candidate.last_name[0]}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{candidate.first_name} {candidate.last_name}</h3>
                        <p className="text-sm text-slate-500">{candidate.current_position || 'Candidate'}</p>
                    </div>
                </div>
                <Badge className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-bold border-none capitalize",
                    candidate.status === 'hired' ? 'bg-emerald-100 text-emerald-700' :
                        candidate.status === 'rejected' ? 'bg-red-50 text-red-600' :
                            'bg-slate-100 text-slate-600'
                )}>
                    {candidate.status}
                </Badge>
            </div>

            <div className="px-6 py-2 flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                    <Mail className="h-3 w-3" /> {candidate.email}
                </div>
            </div>

            <div className="px-6 py-4 mt-auto">
                <div className="flex flex-wrap gap-2 mb-4 h-6 overflow-hidden">
                    {candidate.skills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-600 text-xs font-medium rounded-md border border-slate-100">
                            {skill}
                        </span>
                    ))}
                </div>
                <Button variant="outline" className="w-full rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 h-10 text-sm font-medium">
                    View Profile
                </Button>
            </div>
        </Card>
    </motion.div>
);

export default CandidateManagementPage;
