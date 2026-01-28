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
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Candidate Database</h1>
                    <p className="text-gray-500 mt-2">Manage your talent pool and candidate profiles.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl h-11 bg-gray-900 text-white font-medium shadow-lg shadow-slate-900/20">
                            <Plus className="h-4 w-4 mr-2" /> Add Candidate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
                        <DialogHeader className="p-8 pb-4 border-b border-slate-100">
                            <DialogTitle className="text-2xl font-bold text-gray-900">Add New Candidate</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">First Name</label>
                                    <Input
                                        className="bg-white"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Last Name</label>
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

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Email Address</label>
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
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                    <Input
                                        className="bg-white"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+256..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">LinkedIn URL</label>
                                    <Input
                                        type="url"
                                        className="bg-white"
                                        name="linkedin_url"
                                        value={formData.linkedin_url}
                                        onChange={handleInputChange}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Portfolio URL</label>
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

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Source</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-slate-200 outline-none"
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
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Skills (comma-separated)</label>
                                <Input
                                    className="bg-white"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleInputChange}
                                    placeholder="React, Node.js, Python..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Summary</label>
                                <textarea
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none resize-none"
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Brief professional summary..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isCreating} className="bg-gray-900 text-white hover:bg-gray-800">
                                    {isCreating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Add Candidate
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full h-10 pl-10 pr-4 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        className="w-full md:w-48 h-10 px-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none cursor-pointer"
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
            </div>

            {/* Candidates List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-slate-900 rounded-full" />
                </div>
            ) : !filteredCandidates?.length ? (
                <div className="py-20 text-center rounded-3xl bg-gray-50 border border-dashed border-gray-200">
                    <Search className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="font-bold text-gray-900">No candidates found</p>
                    <p className="text-sm text-gray-500">
                        {searchTerm || filterSource !== 'all' ?
                            'Try adjusting your search or filters' :
                            'Get started by adding your first candidate'}
                    </p>
                </div>
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
