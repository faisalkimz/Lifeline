import React, { useState } from 'react';
import {
    useGetCandidatesQuery,
    useCreateCandidateMutation,
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Plus, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CandidateCard } from './CandidateCard';

const CandidatePage = () => {
    const { data: candidates, isLoading } = useGetCandidatesQuery();
    const [createCandidate, { isLoading: isCreating }] = useCreateCandidateMutation();
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredCandidates = Array.isArray(candidates)
        ? candidates.filter(candidate => {
            const matchesSearch =
                candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSource = filterSource === 'all' || candidate.source === filterSource;
            return matchesSearch && matchesSource;
        })
        : [];

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Candidate Database</h1>
                    <p className="text-gray-500 mt-1">Manage your talent pool and candidate profiles</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm text-white">
                            <Plus className="h-4 w-4" /> Add Candidate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white rounded-xl shadow-xl">
                        <DialogHeader className="border-b border-gray-100 pb-4 mb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900">Add New Candidate</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                    <Input
                                        className="bg-white"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. John"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                    <Input
                                        className="bg-white"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <Input
                                        type="email"
                                        className="bg-white"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <Input
                                        className="bg-white"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+256..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">LinkedIn URL</label>
                                    <Input
                                        type="url"
                                        className="bg-white"
                                        name="linkedin_url"
                                        value={formData.linkedin_url}
                                        onChange={handleInputChange}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Portfolio URL</label>
                                    <Input
                                        type="url"
                                        className="bg-white"
                                        name="portfolio_url"
                                        value={formData.portfolio_url}
                                        onChange={handleInputChange}
                                        placeholder="https://website.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Source</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none text-sm text-gray-900"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleInputChange}
                                    >
                                        <option value="career_page">Career Page</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="indeed">Indeed</option>
                                        <option value="referral">Referral</option>
                                        <option value="agency">Agency</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                                <Input
                                    className="bg-white"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleInputChange}
                                    placeholder="React, Node.js, Python..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Summary</label>
                                <textarea
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Brief professional summary..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 w-full text-white font-semibold">
                                    {isCreating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Add Candidate
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter Bar */}
            <Card className="border border-gray-200 shadow-sm bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search candidates by name or email..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="w-full md:w-48 appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
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
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Candidates List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500">Loading candidates...</p>
                </div>
            ) : !filteredCandidates?.length ? (
                <Card className="border border-dashed border-gray-300 bg-gray-50/50">
                    <CardContent className="py-12 text-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                        <p className="text-gray-500 mt-1">
                            {searchTerm || filterSource !== 'all' ?
                                'Try adjusting your search or filters' :
                                'Get started by adding your first candidate'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCandidates.map(candidate => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidatePage;
