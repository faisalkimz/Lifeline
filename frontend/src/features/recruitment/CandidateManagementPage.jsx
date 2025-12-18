import React, { useState } from 'react';
import {
    useGetCandidatesQuery,
    useCreateCandidateMutation,
    useUpdateCandidateMutation,
} from '../../store/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
    Plus, Search, User, Mail, Phone, MapPin, FileText,
    Eye, Edit, Trash2, Upload, X, Download, Calendar,
    Award, Briefcase, GraduationCap, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const CandidateManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const { data: candidates = [], isLoading, refetch } = useGetCandidatesQuery();
    const [createCandidate] = useCreateCandidateMutation();

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
        const matchesSearch = candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             candidate.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            // Convert skills string to array if needed
            if (formData.skills) {
                submitData.append('skills', JSON.stringify(formData.skills.split(',').map(s => s.trim())));
            }

            await createCandidate(submitData).unwrap();
            toast.success('Candidate added successfully!');
            setIsAddDialogOpen(false);
            resetForm();
            refetch();
        } catch (error) {
            console.error('Failed to create candidate:', error);
            toast.error('Failed to add candidate. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
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
    };

    const getStatusBadge = (status) => {
        const variants = {
            applied: 'default',
            screening: 'warning',
            interview: 'primary',
            offer: 'success',
            hired: 'success',
            rejected: 'error'
        };
        return variants[status] || 'default';
    };

    const handleViewProfile = (candidate) => {
        setSelectedCandidate(candidate);
        setIsProfileDialogOpen(true);
    };

    const getImageUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http') || photoPath.startsWith('data:') || photoPath.startsWith('blob:')) return photoPath;
        return `http://localhost:8000${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Candidates</h1>
                    <p className="text-text-secondary mt-1">Manage and track job applicants</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Total Candidates</p>
                                <p className="text-2xl font-bold text-text-primary">{candidates.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">In Progress</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {candidates.filter(c => ['screening', 'interview'].includes(c.status)).length}
                                </p>
                            </div>
                            <Briefcase className="h-8 w-8 text-warning-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Offers Extended</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {candidates.filter(c => c.status === 'offer').length}
                                </p>
                            </div>
                            <Award className="h-8 w-8 text-success-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Hired</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {candidates.filter(c => c.status === 'hired').length}
                                </p>
                            </div>
                            <GraduationCap className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full h-11 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                            >
                                <option value="all">All Status</option>
                                <option value="applied">Applied</option>
                                <option value="screening">Screening</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Candidates List */}
            {isLoading ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
                            <p className="text-text-secondary font-medium">Loading candidates...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : filteredCandidates.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-3">
                            <Users className="h-16 w-16 text-neutral-400" />
                            <div className="text-center">
                                <p className="text-text-primary font-semibold text-lg">No candidates found</p>
                                <p className="text-text-secondary">Add your first candidate to get started!</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-neutral-50 border-b border-neutral-200">
                                            <tr>
                                                <th className="text-left p-4 font-semibold text-neutral-600">Candidate</th>
                                                <th className="text-left p-4 font-semibold text-neutral-600">Contact</th>
                                                <th className="text-left p-4 font-semibold text-neutral-600">Skills</th>
                                                <th className="text-left p-4 font-semibold text-neutral-600">Status</th>
                                                <th className="text-left p-4 font-semibold text-neutral-600">Applied</th>
                                                <th className="text-right p-4 font-semibold text-neutral-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCandidates.map((candidate) => (
                                                <tr key={candidate.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                                                {candidate.photo ? (
                                                                    <img
                                                                        src={getImageUrl(candidate.photo)}
                                                                        alt={candidate.full_name}
                                                                        className="h-full w-full object-cover"
                                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                                    />
                                                                ) : (
                                                                    <span>{candidate.first_name[0]}{candidate.last_name[0]}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-text-primary">
                                                                    {candidate.first_name} {candidate.last_name}
                                                                </div>
                                                                <div className="text-sm text-text-secondary">
                                                                    {candidate.current_position || 'No position specified'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1 text-sm text-text-secondary">
                                                                <Mail className="h-3 w-3" />
                                                                <span className="truncate max-w-32">{candidate.email}</span>
                                                            </div>
                                                            {candidate.phone && (
                                                                <div className="flex items-center gap-1 text-sm text-text-secondary">
                                                                    <Phone className="h-3 w-3" />
                                                                    <span>{candidate.phone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {candidate.skills?.slice(0, 2).map((skill, index) => (
                                                                <Badge key={index} variant="secondary" size="sm">
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                            {candidate.skills?.length > 2 && (
                                                                <Badge variant="outline" size="sm">
                                                                    +{candidate.skills.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant={getStatusBadge(candidate.status)} size="sm">
                                                            {candidate.status?.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm text-text-primary">
                                                            {candidate.applied_date ? new Date(candidate.applied_date).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewProfile(candidate)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filteredCandidates.map((candidate) => (
                            <Card key={candidate.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewProfile(candidate)}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                                            {candidate.photo ? (
                                                <img
                                                    src={getImageUrl(candidate.photo)}
                                                    alt={candidate.full_name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <span>{candidate.first_name[0]}{candidate.last_name[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-text-primary text-lg">
                                                        {candidate.first_name} {candidate.last_name}
                                                    </h3>
                                                    <p className="text-sm text-text-secondary">
                                                        {candidate.current_position || 'No position specified'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant={getStatusBadge(candidate.status)} size="sm">
                                                            {candidate.status?.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                        {candidate.applied_date && (
                                                            <span className="text-xs text-text-tertiary">
                                                                Applied {new Date(candidate.applied_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="truncate">{candidate.email}</span>
                                                </div>
                                                {candidate.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{candidate.phone}</span>
                                                    </div>
                                                )}
                                                {candidate.skills && candidate.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {candidate.skills.slice(0, 3).map((skill, index) => (
                                                            <Badge key={index} variant="outline" size="sm">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Add Candidate Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Candidate</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                required
                            />
                            <Input
                                label="Last Name"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Phone Number"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <Input
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Current Position"
                                value={formData.current_position}
                                onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                            />
                            <Input
                                label="Experience (Years)"
                                type="number"
                                min="0"
                                value={formData.experience_years}
                                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Education Level
                                </label>
                                <select
                                    value={formData.education_level}
                                    onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                                    className="w-full h-11 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                >
                                    <option value="">Select education level</option>
                                    <option value="high_school">High School</option>
                                    <option value="associate">Associate Degree</option>
                                    <option value="bachelor">Bachelor's Degree</option>
                                    <option value="master">Master's Degree</option>
                                    <option value="phd">PhD</option>
                                </select>
                            </div>
                        </div>

                        <Input
                            label="Skills (comma-separated)"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            placeholder="e.g. JavaScript, React, Node.js"
                        />

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Resume (Optional)
                            </label>
                            <div className="border-2 border-dashed border-border-light rounded-lg p-4 hover:border-primary-400 transition-colors">
                                <input
                                    type="file"
                                    id="resume-upload"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setFormData({ ...formData, resume: e.target.files[0] })}
                                />
                                <label
                                    htmlFor="resume-upload"
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                >
                                    <Upload className="h-8 w-8 text-text-tertiary mb-2" />
                                    <p className="text-sm text-text-secondary text-center">
                                        {formData.resume ? formData.resume.name : 'Click to upload resume'}
                                    </p>
                                    <p className="text-xs text-text-tertiary mt-1">
                                        PDF, DOC, DOCX up to 10MB
                                    </p>
                                </label>
                                {formData.resume && (
                                    <div className="flex items-center justify-between mt-3 p-2 bg-neutral-50 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary-600" />
                                            <span className="text-sm text-text-primary">{formData.resume.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, resume: null })}
                                            className="text-neutral-400 hover:text-error-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                className="w-full min-h-20 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional notes about the candidate..."
                            />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-light">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                                disabled={!formData.first_name || !formData.last_name || !formData.email}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Candidate
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Candidate Profile Dialog */}
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedCandidate && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Candidate Profile</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                                {/* Profile Header */}
                                <div className="flex items-start gap-6">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                                        {selectedCandidate.photo ? (
                                            <img
                                                src={getImageUrl(selectedCandidate.photo)}
                                                alt={selectedCandidate.full_name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <span>{selectedCandidate.first_name[0]}{selectedCandidate.last_name[0]}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-text-primary">
                                            {selectedCandidate.first_name} {selectedCandidate.last_name}
                                        </h2>
                                        <p className="text-text-secondary">{selectedCandidate.current_position || 'Position not specified'}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant={getStatusBadge(selectedCandidate.status)} size="sm">
                                                {selectedCandidate.status?.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                            {selectedCandidate.applied_date && (
                                                <span className="text-sm text-text-tertiary">
                                                    Applied {new Date(selectedCandidate.applied_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Contact Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-primary-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">Email</p>
                                                    <p className="text-sm text-text-secondary">{selectedCandidate.email}</p>
                                                </div>
                                            </div>
                                            {selectedCandidate.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-5 w-5 text-primary-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary">Phone</p>
                                                        <p className="text-sm text-text-secondary">{selectedCandidate.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedCandidate.address && (
                                                <div className="flex items-center gap-3 md:col-span-2">
                                                    <MapPin className="h-5 w-5 text-primary-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary">Address</p>
                                                        <p className="text-sm text-text-secondary">{selectedCandidate.address}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Skills and Experience */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Skills</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedCandidate.skills.map((skill, index) => (
                                                        <Badge key={index} variant="secondary">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-text-secondary">No skills specified</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Experience & Education</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {selectedCandidate.experience_years && (
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-primary-600" />
                                                        <span className="text-sm">{selectedCandidate.experience_years} years of experience</span>
                                                    </div>
                                                )}
                                                {selectedCandidate.education_level && (
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap className="h-4 w-4 text-primary-600" />
                                                        <span className="text-sm">{selectedCandidate.education_level.replace('_', ' ').toUpperCase()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Resume Section */}
                                {selectedCandidate.resume && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Resume</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between p-4 border border-border-light rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-8 w-8 text-primary-600" />
                                                    <div>
                                                        <p className="font-medium text-text-primary">Resume Document</p>
                                                        <p className="text-sm text-text-secondary">Click to view or download</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                            </div>
                                            {/* Resume Viewer would go here - for now just showing download link */}
                                            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                                                <p className="text-sm text-text-secondary text-center">
                                                    Resume viewer functionality would be implemented here
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Notes */}
                                {selectedCandidate.notes && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Additional Notes</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-text-secondary whitespace-pre-wrap">{selectedCandidate.notes}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
                                    <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                                        Close
                                    </Button>
                                    <Button>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Candidate
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CandidateManagementPage;
