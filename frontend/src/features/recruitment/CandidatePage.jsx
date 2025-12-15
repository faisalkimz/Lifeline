import React, { useState } from 'react';
import {
    useGetCandidatesQuery,
    useCreateCandidateMutation,
    useUpdateCandidateMutation,
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Plus, User, Mail, Phone, Linkedin, Globe, FileText, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CandidatePage = () => {
    const { data: candidates, isLoading } = useGetCandidatesQuery();
    const [createCandidate] = useCreateCandidateMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSource, setFilterSource] = useState('all');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        portfolio_url: '',
        summary: '',
        skills: '',
        source: 'career_page'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCandidate(formData).unwrap();
            toast.success("Candidate added successfully!");
            setIsDialogOpen(false);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                linkedin_url: '',
                portfolio_url: '',
                summary: '',
                skills: '',
                source: 'career_page'
            });
        } catch (error) {
            toast.error("Failed to add candidate");
        }
    };

    const filteredCandidates = candidates?.filter(candidate => {
        const matchesSearch = candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSource = filterSource === 'all' || candidate.source === filterSource;
        return matchesSearch && matchesSource;
    });

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Database</h1>
                    <p className="text-slate-500 mt-1">Manage your talent pool and candidate profiles</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary-600 hover:bg-primary-700 shadow-sm">
                            <Plus className="h-4 w-4" /> Add Candidate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Candidate</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <input
                                        className="w-full border rounded-md p-2"
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <input
                                        className="w-full border rounded-md p-2"
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full border rounded-md p-2"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        className="w-full border rounded-md p-2"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        className="w-full border rounded-md p-2"
                                        value={formData.linkedin_url}
                                        onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Portfolio URL</label>
                                    <input
                                        type="url"
                                        className="w-full border rounded-md p-2"
                                        value={formData.portfolio_url}
                                        onChange={e => setFormData({ ...formData, portfolio_url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Source</label>
                                <select
                                    className="w-full border rounded-md p-2"
                                    value={formData.source}
                                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                                >
                                    <option value="career_page">Career Page</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="indeed">Indeed</option>
                                    <option value="referral">Referral</option>
                                    <option value="agency">Agency</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                                <input
                                    className="w-full border rounded-md p-2"
                                    value={formData.skills}
                                    onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                    placeholder="React, Node.js, Python..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Summary</label>
                                <textarea
                                    className="w-full border rounded-md p-2"
                                    value={formData.summary}
                                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                    rows="4"
                                    placeholder="Brief professional summary..."
                                />
                            </div>

                            <Button type="submit" className="w-full">Add Candidate</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter Bar */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search candidates by name or email..."
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            value={filterSource}
                            onChange={(e) => setFilterSource(e.target.value)}
                        >
                            <option value="all">All Sources</option>
                            <option value="career_page">Career Page</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="indeed">Indeed</option>
                            <option value="referral">Referral</option>
                            <option value="agency">Agency</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Candidates List */}
            {isLoading ? (
                <div className="text-center py-10">Loading candidates...</div>
            ) : !filteredCandidates?.length ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-gray-500">
                        {searchTerm || filterSource !== 'all' ?
                            'No candidates match your filters' :
                            'No candidates yet. Add one to get started!'}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCandidates.map(candidate => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CandidateCard = ({ candidate }) => {
    const sourceColors = {
        career_page: 'bg-blue-100 text-blue-700',
        linkedin: 'bg-indigo-100 text-indigo-700',
        indeed: 'bg-green-100 text-green-700',
        referral: 'bg-purple-100 text-purple-700',
        agency: 'bg-orange-100 text-orange-700',
        other: 'bg-gray-100 text-gray-700',
    };

    const applicationCount = candidate.applications?.length || 0;

    return (
        <Card className="hover:shadow-lg transition-all group border-none shadow-sm">
            <CardContent className="p-6 flex flex-col h-full">
                {/* Header with avatar */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                        {candidate.first_name[0]}{candidate.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                            {candidate.first_name} {candidate.last_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{candidate.email}</span>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
                    {candidate.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {candidate.phone}
                        </div>
                    )}
                    {candidate.linkedin_url && (
                        <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary-600 hover:underline">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn Profile
                        </a>
                    )}
                    {candidate.portfolio_url && (
                        <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary-600 hover:underline">
                            <Globe className="h-4 w-4" />
                            Portfolio
                        </a>
                    )}
                </div>

                {/* Skills Pills */}
                {candidate.skills && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {candidate.skills.split(', ').slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
                                {skill}
                            </span>
                        ))}
                        {candidate.skills.split(', ').length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                                +{candidate.skills.split(', ').length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${sourceColors[candidate.source] || sourceColors.other}`}>
                        {candidate.source.replace('_', ' ')}
                    </span>
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{applicationCount}</span> {applicationCount === 1 ? 'Application' : 'Applications'}
                    </div>
                </div>

                {/* View Details Button */}
                <Link to={`/recruitment/candidates/${candidate.id}`}>
                    <Button variant="ghost" size="sm" className="w-full mt-3 text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                        View Profile
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};

export default CandidatePage;
