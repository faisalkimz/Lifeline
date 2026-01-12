import React, { useState } from 'react';
import {
    useGetCandidatesQuery,
    useCreateCandidateMutation,
    useParseResumeMutation
} from '../../store/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import {
    Plus, Search, User, Mail, Phone, MapPin, FileText,
    Eye, Edit, Trash2, Upload, X, Download, Calendar,
    Briefcase, Users, Star, ChevronRight, Loader2, ArrowUpRight
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
            toast.success('Candidate added successfully!');
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

    const statusColors = {
        applied: 'bg-primary-100 text-primary-700',
        screening: 'bg-purple-100 text-purple-700',
        interview: 'bg-orange-100 text-orange-700',
        offer: 'bg-yellow-100 text-yellow-700',
        hired: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700'
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
                    <p className="text-gray-600 mt-1">Manage your talent pool and applicants</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Add Candidate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Candidate</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            {/* Resume Upload / Parse */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Resume Upload (Auto-fill)</label>
                                <div className={cn(
                                    "border-2 border-dashed rounded-lg p-6 transition-all group flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50",
                                    formData.resume ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50'
                                )}>
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileUpload}
                                    />
                                    <label htmlFor="resume-upload" className="cursor-pointer space-y-2 w-full">
                                        {isParsing ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                                                <p className="text-sm text-primary-600">Analyzing resume...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className={cn("h-8 w-8 mx-auto", formData.resume ? 'text-primary-600' : 'text-gray-400')} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formData.resume ? formData.resume.name : 'Upload Resume File'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        PDF, DOCX up to 10MB
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        required
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        required
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="john.doe@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Experience (Years)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        value={formData.experience_years}
                                        onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Skills (Comma Separated)</label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    value={formData.skills}
                                    onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                    placeholder="e.g. React, Node.js, Python"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1">Cancel</Button>
                                <Button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700">Add Candidate</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-200">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-sm"
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

            {/* Results */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>)}
                </div>
            ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCandidates.map((candidate) => (
                        <Card key={candidate.id} className="group hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                            {candidate.photo ? (
                                                <img src={getFullPhotoUrl(candidate.photo)} alt={candidate.full_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-gray-500">{candidate.first_name[0]}{candidate.last_name[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 line-clamp-1">{candidate.first_name} {candidate.last_name}</h3>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{candidate.current_position || 'Candidate'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge className={cn("capitalize border-0", statusColors[candidate.status] || 'bg-gray-100 text-gray-700')}>
                                            {candidate.status}
                                        </Badge>
                                        {candidate.experience_years && (
                                            <span className="text-xs text-gray-500 font-medium">{candidate.experience_years}y Exp</span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 h-14 overflow-hidden content-start">
                                        {candidate.skills?.slice(0, 4).map((skill, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-100">
                                                {skill}
                                            </span>
                                        ))}
                                        {candidate.skills?.length > 4 && (
                                            <span className="px-2 py-1 text-xs text-gray-400">+{candidate.skills.length - 4}</span>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="w-full text-xs"
                                            onClick={() => handleViewProfile(candidate)}
                                        >
                                            View Profile
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CandidateProfileDrawer
                candidate={selectedCandidate}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
};

export default CandidateManagementPage;
