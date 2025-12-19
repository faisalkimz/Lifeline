import React, { useState } from 'react';
import {
    useGetCandidatesQuery,
    useCreateCandidateMutation,
    useUpdateCandidateMutation,
    useParseResumeMutation
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import {
    Plus, Search, User, Mail, Phone, MapPin, FileText,
    Eye, Edit, Trash2, Upload, X, Download, Calendar,
    Award, Briefcase, GraduationCap, Users, Zap, Target,
    ArrowUpRight, ChevronRight, Loader2, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { getMediaUrl } from '../../config/api';
import CandidateProfileDrawer from './CandidateProfileDrawer';

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
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        skills: '',
        experience_years: '',
        current_position: '',
        education_level: '',
        resume: null,
        notes: ''
    });

    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = (candidate.first_name + ' ' + candidate.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFormData(prev => ({ ...prev, resume: file }));

        // Auto-parsing logic
        setIsParsing(true);
        const parseFormData = new FormData();
        parseFormData.append('resume', file);

        try {
            const result = await parseResume(parseFormData).unwrap();
            toast.success('Resume parsed successfully! Autofilling fields.');
            setFormData(prev => ({
                ...prev,
                first_name: result.first_name || prev.first_name,
                last_name: result.last_name || prev.last_name,
                email: result.email || prev.email,
                phone: result.phone || prev.phone,
                skills: Array.isArray(result.skills) ? result.skills.join(', ') : prev.skills
            }));
        } catch (error) {
            toast.error('Automated parsing failed, but file is attached.');
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
            toast.success('Candidate deployed to registry!');
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

    const handleViewProfile = (candidate) => {
        setSelectedCandidate(candidate);
        setIsDrawerOpen(true);
    };

    const getFullPhotoUrl = (photoPath) => {
        return getMediaUrl(photoPath);
    };
    return (
        <div className="space-y-8 pb-20 animate-fade-in font-sans">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary-600" />
                        Candidate Registry
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Advanced talent acquisition and data extraction terminal.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex-1 md:flex-none rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/20 font-black uppercase text-[10px] tracking-widest px-8 h-14">
                                <Plus className="h-5 w-5 mr-2" /> Recruit Talent
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden max-w-2xl font-sans">
                            <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Target className="h-32 w-32 text-white" />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                        Candidate Onboarding
                                    </DialogTitle>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">Automated parsing enabled for PDF/DOCX assets.</p>
                                </DialogHeader>
                            </div>
                            <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white max-h-[70vh] overflow-y-auto">
                                {/* Resume Upload / Parse */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Digital Asset Sync (Smart Parse)</p>
                                    <div className={cn(
                                        "border-2 border-dashed rounded-[2rem] p-10 transition-all group flex flex-col items-center justify-center text-center cursor-pointer",
                                        formData.resume ? 'border-primary-500 bg-primary-50/20' : 'border-slate-100 bg-slate-50 hover:border-primary-400'
                                    )}>
                                        <input
                                            type="file"
                                            id="resume-upload"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileUpload}
                                        />
                                        <label htmlFor="resume-upload" className="cursor-pointer space-y-4">
                                            {isParsing ? (
                                                <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto" />
                                            ) : (
                                                <Upload className={cn("h-12 w-12 mx-auto transition-transform group-hover:-translate-y-2", formData.resume ? 'text-primary-600' : 'text-slate-300')} />
                                            )}
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase italic">
                                                    {formData.resume ? formData.resume.name : 'Inject Resume File'}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
                                                    PDF, DOCX • MAX 10MB
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">First Name</label>
                                        <input
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Last Name</label>
                                        <input
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Email Identity</label>
                                    <input
                                        type="email"
                                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Comm Channel (Phone)</label>
                                        <input
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Exp years</label>
                                        <input
                                            type="number"
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                            value={formData.experience_years}
                                            onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Skill Matrix (Comma Separated)</label>
                                    <input
                                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                        value={formData.skills}
                                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                        placeholder="e.g. Django, React, Kubernetes"
                                    />
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <Button type="button" onClick={() => setIsAddDialogOpen(false)} variant="ghost" className="flex-1 h-16 rounded-[2rem] font-black uppercase text-xs tracking-widest text-slate-400">Abort</Button>
                                    <Button type="submit" className="flex-[2] h-16 rounded-[2rem] bg-slate-900 font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-900/20">Commit Candidate</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tactical Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan registry for names, email, skills..."
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl font-black uppercase text-[10px] tracking-widest outline-none focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer"
                    >
                        <option value="all">Global Status</option>
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Registry Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-50 rounded-[3rem] animate-pulse"></div>)}
                </div>
            ) : filteredCandidates.length === 0 ? (
                <Card className="border-none shadow-xl shadow-slate-100 bg-white rounded-[4rem] p-24 text-center">
                    <div className="inline-flex p-10 bg-slate-50 rounded-full mb-8">
                        <Users className="h-16 w-16 text-slate-200" />
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 uppercase italic mb-3 tracking-tighter">Null Result</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-sm mx-auto leading-loose italic">
                        No candidate signatures match your current search parameters.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCandidates.map((candidate) => (
                        <Card key={candidate.id} className="border-none shadow-2xl shadow-slate-200/40 rounded-[3rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white">
                            <CardContent className="p-0">
                                <div className="p-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="h-20 w-20 rounded-[1.8rem] bg-slate-900 p-0.5 shadow-xl shadow-slate-900/10">
                                            <div className="h-full w-full rounded-[1.7rem] bg-slate-800 overflow-hidden flex items-center justify-center">
                                                {candidate.photo ? (
                                                    <img src={getFullPhotoUrl(candidate.photo)} alt={candidate.full_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-black italic text-xl">{candidate.first_name[0]}{candidate.last_name[0]}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                                            candidate.status === 'hired' ? 'bg-emerald-500 text-white' :
                                                candidate.status === 'rejected' ? 'bg-rose-500 text-white' :
                                                    candidate.status === 'applied' ? 'bg-slate-100 text-slate-500' : 'bg-amber-500 text-white'
                                        )}>
                                            {candidate.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                            {candidate.first_name} {candidate.last_name}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {candidate.current_position || 'Senior Professional'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {candidate.skills?.slice(0, 3).map((skill, idx) => (
                                            <span key={idx} className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                                <Zap className="h-3 w-3" /> Experience
                                            </p>
                                            <p className="text-xs font-black text-slate-900 italic">{candidate.experience_years} years</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                                <Star className="h-3 w-3" /> Match Score
                                            </p>
                                            <p className="text-xs font-black text-primary-600 italic">88% (AI)</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex gap-3">
                                        <Button
                                            onClick={() => handleViewProfile(candidate)}
                                            className="flex-1 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest h-14 group/btn"
                                        >
                                            Telemetry <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                        <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-slate-50 hover:bg-slate-100 p-0 text-slate-400">
                                            <Edit className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Candidate Details Drawer */}
            <CandidateProfileDrawer
                candidate={selectedCandidate}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
};

export default CandidateManagementPage;
