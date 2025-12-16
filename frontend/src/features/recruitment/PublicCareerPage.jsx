import React, { useState } from 'react';
import { useGetPublicJobsQuery, useSubmitJobApplicationMutation } from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import {
    MapPin, Clock, DollarSign, Briefcase, Send, Upload,
    Building, Users, Award, CheckCircle, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const PublicCareerPage = () => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');

    const { data: jobs, isLoading } = useGetPublicJobsQuery();
    const [submitApplication] = useSubmitJobApplicationMutation();

    const [applicationData, setApplicationData] = useState({
        job_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        cover_letter: '',
        resume: null,
        linkedin_url: '',
        portfolio_url: ''
    });

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setApplicationData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setApplicationData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleApply = (job) => {
        setSelectedJob(job);
        setApplicationData(prev => ({ ...prev, job_id: job.id }));
        setShowApplicationForm(true);
    };

    const handleSubmitApplication = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(applicationData).forEach(([key, value]) => {
                if (value !== null && value !== '') {
                    formData.append(key, value);
                }
            });

            await submitApplication(formData).unwrap();
            toast.success('Application submitted successfully!');
            setShowApplicationForm(false);
            setApplicationData({
                job_id: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                cover_letter: '',
                resume: null,
                linkedin_url: '',
                portfolio_url: ''
            });
        } catch (error) {
            toast.error('Failed to submit application');
        }
    };

    // Mock data for demonstration
    const mockJobs = [
        {
            id: 1,
            title: 'Senior Full Stack Developer',
            department: 'Engineering',
            location: 'Kampala, Uganda',
            employment_type: 'Full-time',
            salary_range: 'UGX 8M - 12M',
            description: 'We are looking for an experienced Full Stack Developer to join our growing team. You will be working on cutting-edge web applications using React, Node.js, and modern development practices.',
            requirements: ['5+ years of experience', 'React & Node.js expertise', 'Database design skills', 'Team leadership experience'],
            benefits: ['Competitive salary', 'Health insurance', 'Professional development budget', 'Flexible working hours'],
            posted_date: '2025-12-10',
            application_deadline: '2025-12-31'
        },
        {
            id: 2,
            title: 'HR Business Partner',
            department: 'Human Resources',
            location: 'Remote',
            employment_type: 'Full-time',
            salary_range: 'UGX 6M - 9M',
            description: 'Join our HR team as a Business Partner. You will work closely with business leaders to develop and implement HR strategies that support organizational goals.',
            requirements: ['3+ years HR experience', 'Business acumen', 'Change management skills', 'Employee relations expertise'],
            benefits: ['Remote work', 'Professional certification support', 'Annual bonus', 'Comprehensive health coverage'],
            posted_date: '2025-12-08',
            application_deadline: '2025-12-25'
        },
        {
            id: 3,
            title: 'Product Manager',
            department: 'Product',
            location: 'Nairobi, Kenya',
            employment_type: 'Full-time',
            salary_range: 'UGX 10M - 15M',
            description: 'Lead product strategy and execution for our flagship HRMS platform. Work with cross-functional teams to deliver exceptional user experiences.',
            requirements: ['4+ years product management', 'Technical background preferred', 'Data-driven decision making', 'Agile methodology experience'],
            benefits: ['Competitive compensation', 'Stock options', 'International travel', 'Learning & development budget'],
            posted_date: '2025-12-05',
            application_deadline: '2025-12-30'
        }
    ];

    const filteredJobs = mockJobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = locationFilter === 'all' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
        return matchesSearch && matchesLocation;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Building className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Lifeline Tech Careers</h1>
                                <p className="text-gray-600">Shape the future with us</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">🌟 We're hiring!</span>
                            <Button variant="outline" className="gap-2">
                                <Users className="h-4 w-4" />
                                About Us
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Join Our Growing Team
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        We're looking for talented individuals who are passionate about technology and innovation.
                        Help us build the future of HR management.
                    </p>
                </div>

                {/* Search and Filter */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[250px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search jobs by title or department..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            >
                                <option value="all">All Locations</option>
                                <option value="kampala">Kampala</option>
                                <option value="nairobi">Nairobi</option>
                                <option value="remote">Remote</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Job Listings */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {filteredJobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                                        <p className="text-sm text-gray-600 mb-2">{job.department}</p>
                                    </div>
                                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                                        {job.employment_type}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        {job.salary_range}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 line-clamp-3">
                                    {job.description}
                                </p>

                                <div className="flex flex-wrap gap-1">
                                    {job.requirements.slice(0, 2).map((req, index) => (
                                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                            {req}
                                        </span>
                                    ))}
                                    {job.requirements.length > 2 && (
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                            +{job.requirements.length - 2} more
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="text-xs text-gray-500">
                                        Posted {new Date(job.posted_date).toLocaleDateString()}
                                    </span>
                                    <Button
                                        onClick={() => handleApply(job)}
                                        className="gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        Apply Now
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredJobs.length === 0 && (
                    <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria</p>
                    </div>
                )}

                {/* Why Join Us Section */}
                <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Join Lifeline Tech?</h3>
                            <p className="text-gray-600">We're more than just a workplace - we're a community</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Award className="h-8 w-8 text-primary-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Innovation</h4>
                                <p className="text-sm text-gray-600">Work on cutting-edge HR technology that impacts businesses worldwide</p>
                            </div>
                            <div className="text-center">
                                <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-primary-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Growth</h4>
                                <p className="text-sm text-gray-600">Continuous learning opportunities and career development support</p>
                            </div>
                            <div className="text-center">
                                <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-primary-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                                <p className="text-sm text-gray-600">Make a real difference in how organizations manage their most valuable asset</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Application Form Modal */}
            <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Apply for {selectedJob?.title}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitApplication} className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={applicationData.first_name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={applicationData.last_name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={applicationData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={applicationData.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Resume/CV *</label>
                            <input
                                type="file"
                                name="resume"
                                onChange={handleInputChange}
                                accept=".pdf,.doc,.docx"
                                className="w-full p-2 border rounded-md"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
                                <input
                                    type="url"
                                    name="linkedin_url"
                                    value={applicationData.linkedin_url}
                                    onChange={handleInputChange}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Portfolio/Website</label>
                                <input
                                    type="url"
                                    name="portfolio_url"
                                    value={applicationData.portfolio_url}
                                    onChange={handleInputChange}
                                    placeholder="https://yourportfolio.com"
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Cover Letter</label>
                            <textarea
                                name="cover_letter"
                                value={applicationData.cover_letter}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Tell us why you're interested in this position..."
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setShowApplicationForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="gap-2">
                                <Send className="h-4 w-4" />
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Footer */}
            <footer className="bg-white border-t mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-600">
                        <p>&copy; 2025 Lifeline Tech. All rights reserved.</p>
                        <p className="mt-2">Building the future of HR management, one innovation at a time.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicCareerPage;
