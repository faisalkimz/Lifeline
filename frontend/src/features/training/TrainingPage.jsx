import React, { useState } from 'react';
import {
    useGetTrainingProgramsQuery,
    useGetTrainingSessionsQuery,
    useGetEnrollmentsQuery,
    useEnrollInTrainingMutation,
    useWithdrawEnrollmentMutation,
    useUpdateProgressMutation,
    useSubmitFeedbackMutation,
    useGetMyStatsQuery,
    useGetMyComplianceQuery,
    useGetCurrentUserQuery,
    useCreateTrainingProgramMutation
} from '../../store/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Progress } from '../../components/ui/Progress';
import {
    BookOpen, GraduationCap, Calendar, Clock, MapPin, CheckCircle,
    Plus, Users, TrendingUp, Award, AlertTriangle, Star, Download,
    FileText, Video, User, BarChart3, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const TrainingPage = () => {
    const { data: user } = useGetCurrentUserQuery();
    const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'super_admin';

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Training & Development
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Enhance your skills and advance your career
                    </p>
                </div>
                {isManagerOrAdmin && <AddProgramDialog />}
            </div>

            <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList className={`bg-slate-100 p-1 w-full max-w-3xl grid ${isManagerOrAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-white">
                        <BarChart3 className="h-4 w-4 mr-2" /> Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="catalog" className="data-[state=active]:bg-white">
                        <BookOpen className="h-4 w-4 mr-2" /> Catalog
                    </TabsTrigger>
                    <TabsTrigger value="my-learning" className="data-[state=active]:bg-white">
                        <GraduationCap className="h-4 w-4 mr-2" /> My Learning
                    </TabsTrigger>
                    <TabsTrigger value="certificates" className="data-[state=active]:bg-white">
                        <Award className="h-4 w-4 mr-2" /> Certificates
                    </TabsTrigger>
                    {isManagerOrAdmin && (
                        <TabsTrigger value="team" className="data-[state=active]:bg-white">
                            <Users className="h-4 w-4 mr-2" /> Team
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="dashboard">
                    <DashboardView />
                </TabsContent>

                <TabsContent value="catalog">
                    <TrainingCatalog />
                </TabsContent>

                <TabsContent value="my-learning">
                    <MyLearning />
                </TabsContent>

                <TabsContent value="certificates">
                    <MyCertificates />
                </TabsContent>

                {isManagerOrAdmin && (
                    <TabsContent value="team">
                        <TeamOverview />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

const DashboardView = () => {
    const { data: stats, isLoading: statsLoading } = useGetMyStatsQuery();
    const { data: compliance, isLoading: complianceLoading } = useGetMyComplianceQuery();
    const { data: enrollmentsData } = useGetEnrollmentsQuery({ my_training: true });

    const enrollments = enrollmentsData?.results || enrollmentsData || [];
    const upcomingSessions = enrollments
        .filter(e => e.status === 'registered' || e.status === 'confirmed')
        .slice(0, 3);

    if (statsLoading || complianceLoading) {
        return <div className="text-center py-10">Loading dashboard...</div>;
    }

    const statCards = [
        { label: 'Completed Trainings', value: stats?.completed || 0, icon: CheckCircle, color: 'text-green-600' },
        { label: 'In Progress', value: stats?.in_progress || 0, icon: TrendingUp, color: 'text-blue-600' },
        { label: 'Training Hours', value: stats?.total_hours || 0, icon: Clock, color: 'text-purple-600' },
        { label: 'Certificates Earned', value: stats?.certificates_earned || 0, icon: Award, color: 'text-yellow-600' },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Compliance Status */}
            {compliance && compliance.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Compliance Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {compliance.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.program?.name}</p>
                                        {item.last_completed && (
                                            <p className="text-sm text-gray-500">
                                                Completed: {new Date(item.last_completed).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        item.status === 'compliant' ? 'bg-green-100 text-green-700' :
                                        item.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {item.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Upcoming Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {upcomingSessions.map((enrollment) => (
                                <div key={enrollment.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{enrollment.program_name || 'Unknown Program'}</p>
                                        <p className="text-sm text-gray-500">
                                            {enrollment.session_date ? (
                                                <>
                                                    {new Date(enrollment.session_date).toLocaleDateString()} at{' '}
                                                    {new Date(enrollment.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </>
                                            ) : 'Date not available'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const TrainingCatalog = () => {
    const { data: programsData, isLoading } = useGetTrainingProgramsQuery();
    const { data: sessionsData } = useGetTrainingSessionsQuery({ upcoming: true });
    const [selectedCategory, setSelectedCategory] = useState('all');

    const programs = programsData?.results || programsData || [];
    const sessions = sessionsData?.results || sessionsData || [];

    const categories = ['all', 'technical', 'soft_skills', 'compliance', 'leadership', 'safety'];

    const filteredPrograms = selectedCategory === 'all' 
        ? programs 
        : programs.filter(p => p.category === selectedCategory);

    if (isLoading) return <div>Loading programs...</div>;

    return (
        <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat.replace('_', ' ').toUpperCase()}
                    </Button>
                ))}
            </div>

            {/* Programs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrograms.map(program => (
                    <ProgramCard key={program.id} program={program} sessions={sessions} />
                ))}
            </div>

            {filteredPrograms.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-gray-500">
                        No programs found in this category.
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const ProgramCard = ({ program, sessions }) => {
    const [showSessions, setShowSessions] = useState(false);
    const programSessions = sessions.filter(s => s.program === program.id);

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        program.is_mandatory ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                        {program.is_mandatory ? 'Mandatory' : program.category}
                    </span>
                    {program.priority === 'high' && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700">
                            HIGH PRIORITY
                        </span>
                    )}
                </div>
                <CardTitle className="text-xl mt-2">{program.name}</CardTitle>
                <p className="text-sm text-gray-500">{program.provider}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Clock className="h-4 w-4" />
                    {program.duration_hours} hours
                </div>

                {program.description && (
                    <p className="text-sm text-gray-700 mb-4">{program.description}</p>
                )}

                <div className="mt-auto space-y-2">
                    {program.external_platform_url && (
                        <Button
                            onClick={() => window.open(program.external_platform_url, '_blank')}
                            className="w-full gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Start Course
                        </Button>
                    )}

                    <Button
                        onClick={() => setShowSessions(!showSessions)}
                        className="w-full"
                        variant="outline"
                    >
                        {showSessions ? 'Hide' : 'View'} Sessions ({programSessions.length})
                    </Button>

                    {showSessions && (
                        <SessionsList sessions={programSessions} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const SessionsList = ({ sessions }) => {
    const [enroll] = useEnrollInTrainingMutation();

    const handleEnroll = async (sessionId) => {
        try {
            await enroll({ session_id: sessionId }).unwrap();
            toast.success('Enrolled successfully!');
        } catch (error) {
            toast.error(error.data?.error || 'Enrollment failed');
        }
    };

    return (
        <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.map(session => (
                <div key={session.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                {session.start_date ? new Date(session.start_date).toLocaleDateString() : 'Date not available'}
                            </p>
                            <p className="text-xs text-gray-500">{session.location || 'Location not specified'}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <MapPin className="h-3 w-3" />
                                {session.delivery_mode || 'Mode not specified'}
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            session.is_full ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                            {session.available_slots !== undefined ? `${session.available_slots} spots` : 'Availability unknown'}
                        </span>
                    </div>
                    <Button
                        size="sm"
                        className="w-full"
                        disabled={session.is_full || !session.enrollment_open}
                        onClick={() => handleEnroll(session.id)}
                    >
                        {session.is_full ? 'Full' : (session.enrollment_open ? 'Enroll Now' : 'Closed')}
                    </Button>
                </div>
            ))}
        </div>
    );
};

const MyLearning = () => {
    const { data: enrollmentsData, isLoading } = useGetEnrollmentsQuery({ my_training: true });
    const [selectedStatus, setSelectedStatus] = useState('all');

    const enrollments = enrollmentsData?.results || enrollmentsData || [];
    const statuses = ['all', 'registered', 'in_progress', 'completed'];

    const filteredEnrollments = selectedStatus === 'all'
        ? enrollments
        : enrollments.filter(e => e.status === selectedStatus);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
                {statuses.map(status => (
                    <Button
                        key={status}
                        variant={selectedStatus === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedStatus(status)}
                    >
                        {status.replace('_', ' ').toUpperCase()}
                    </Button>
                ))}
            </div>

            {/* Enrollments List */}
            <div className="space-y-4">
                {filteredEnrollments.map(enrollment => (
                    <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
            </div>

            {filteredEnrollments.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-gray-500">
                        No enrollments found with this status.
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const EnrollmentCard = ({ enrollment }) => {
    const [updateProgress] = useUpdateProgressMutation();
    const [withdraw] = useWithdrawEnrollmentMutation();
    const [showFeedback, setShowFeedback] = useState(false);

    const handleWithdraw = async () => {
        if (!window.confirm('Are you sure you want to withdraw from this training?')) return;

        try {
            await withdraw({ id: enrollment.id, reason: 'User requested withdrawal' }).unwrap();
            toast.success('Withdrawn successfully');
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to withdraw');
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-3">
                        <div>
                            <h4 className="font-bold text-lg">{enrollment.program_name || 'Unknown Program'}</h4>
                            <p className="text-sm text-gray-500">
                                Session: {enrollment.session_date ? new Date(enrollment.session_date).toLocaleDateString() : 'Date not available'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <span className={`px-3 py-1 rounded-full font-bold ${
                                enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                enrollment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {enrollment.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                            </span>

                            {enrollment.attendance_percentage && (
                                <span className="text-gray-600">
                                    Attendance: {enrollment.attendance_percentage}%
                                </span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {enrollment.status === 'in_progress' && enrollment.progress_percentage !== undefined && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Progress</span>
                                    <span className="font-medium">{enrollment.progress_percentage}%</span>
                                </div>
                                <Progress value={enrollment.progress_percentage} className="h-2" />
                            </div>
                        )}

                        {/* Assessment Score */}
                        {enrollment.assessment_score !== undefined && enrollment.assessment_score !== null && (
                            <div className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>Score: {enrollment.assessment_score}%</span>
                                {enrollment.passed_assessment !== undefined && enrollment.passed_assessment !== null && (
                                    <span className={enrollment.passed_assessment ? 'text-green-600' : 'text-red-600'}>
                                        ({enrollment.passed_assessment ? 'Passed' : 'Failed'})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2 min-w-[150px]">
                        {enrollment.status === 'completed' && enrollment.certificate_issued && (
                            <Button size="sm" variant="outline" className="gap-2">
                                <Download className="h-4 w-4" /> Certificate
                            </Button>
                        )}

                        {enrollment.status === 'completed' && !enrollment.feedback_submitted_at && (
                            <Button size="sm" variant="outline" onClick={() => setShowFeedback(true)}>
                                <Star className="h-4 w-4 mr-2" /> Give Feedback
                            </Button>
                        )}

                        {['registered', 'confirmed'].includes(enrollment.status) && (
                            <Button size="sm" variant="destructive" onClick={handleWithdraw}>
                                Withdraw
                            </Button>
                        )}
                    </div>
                </div>

                {showFeedback && (
                    <FeedbackForm 
                        enrollmentId={enrollment.id} 
                        onClose={() => setShowFeedback(false)} 
                    />
                )}
            </CardContent>
        </Card>
    );
};

const FeedbackForm = ({ enrollmentId, onClose }) => {
    const [submitFeedback] = useSubmitFeedbackMutation();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async () => {
        try {
            await submitFeedback({
                id: enrollmentId,
                feedback_rating: rating,
                feedback_text: feedback
            }).unwrap();
            toast.success('Feedback submitted!');
            onClose();
        } catch (error) {
            toast.error('Failed to submit feedback');
        }
    };

    return (
        <div className="mt-4 p-4 border-t space-y-3">
            <div>
                <p className="text-sm font-medium mb-2">Rate this training:</p>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star
                            key={star}
                            className={`h-6 w-6 cursor-pointer ${
                                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
            </div>
            <div>
                <label className="text-sm font-medium">Feedback:</label>
                <textarea
                    className="w-full mt-1 p-2 border rounded-md"
                    rows="3"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your thoughts..."
                />
            </div>
            <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
                <Button size="sm" onClick={handleSubmit} disabled={rating === 0}>Submit</Button>
            </div>
        </div>
    );
};

const MyCertificates = () => {
    const { data: enrollmentsData } = useGetEnrollmentsQuery({ 
        my_training: true, 
        status: 'completed',
        certificate_issued: true 
    });

    const certificates = (enrollmentsData?.results || enrollmentsData || [])
        .filter(e => e.certificate_issued);

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map(cert => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold">{cert.program_name || 'Unknown Program'}</h4>
                            <p className="text-sm text-gray-500">
                                {cert.completed_at ? new Date(cert.completed_at).toLocaleDateString() : 'Date not available'}
                            </p>
                        </div>
                        <div className="text-xs text-gray-500">
                            Certificate: {cert.certificate_number || 'N/A'}
                        </div>
                        <Button size="sm" className="w-full gap-2">
                            <Download className="h-4 w-4" /> Download Certificate
                        </Button>
                    </CardContent>
                </Card>
            ))}

            {certificates.length === 0 && (
                <Card className="col-span-full border-dashed">
                    <CardContent className="py-10 text-center text-gray-500">
                        No certificates earned yet. Complete your trainings to earn certificates!
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const TeamOverview = () => {
    const { data: enrollmentsData } = useGetEnrollmentsQuery({});
    const enrollments = enrollmentsData?.results || enrollmentsData || [];

    // Group by status
    const statusCounts = enrollments.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-bold">{enrollments.length}</p>
                        <p className="text-sm text-gray-500">Total Enrollments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-bold text-green-600">{statusCounts.completed || 0}</p>
                        <p className="text-sm text-gray-500">Completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-bold text-blue-600">{statusCounts.in_progress || 0}</p>
                        <p className="text-sm text-gray-500">In Progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-bold text-gray-600">{statusCounts.registered || 0}</p>
                        <p className="text-sm text-gray-500">Registered</p>
                    </CardContent>
                </Card>
            </div>

            {/* Team Enrollments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Training Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Employee</th>
                                    <th className="px-4 py-3 text-left">Training</th>
                                    <th className="px-4 py-3 text-left">Progress</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map(enrollment => (
                                    <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{enrollment.employee_name || 'Unknown Employee'}</td>
                                        <td className="px-4 py-3">{enrollment.program_name || 'Unknown Program'}</td>
                                        <td className="px-4 py-3">{enrollment.progress_percentage || 0}%</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                enrollment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {enrollment.status || 'unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const AddProgramDialog = () => {
    const [createProgram] = useCreateTrainingProgramMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        provider: '',
        duration_hours: '',
        category: 'technical',
        description: '',
        is_mandatory: false,
        external_platform_url: '',
        priority: 'medium'
    });

    const categories = [
        'technical', 'soft_skills', 'compliance', 'leadership', 'safety'
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProgram(formData).unwrap();
            toast.success('Training program created successfully!');
            setIsOpen(false);
            setFormData({
                code: '',
                name: '',
                provider: '',
                duration_hours: '',
                category: 'technical',
                description: '',
                is_mandatory: false,
                external_platform_url: '',
                priority: 'medium'
            });
        } catch (error) {
            toast.error(error.data?.error || 'Failed to create training program');
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Training Program
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Training Program</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Program Code *</label>
                                <Input
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="TRN-001"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Program Name *</label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter program name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Provider *</label>
                                <Input
                                    name="provider"
                                    value={formData.provider}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Coursera, LinkedIn Learning"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Duration (hours) *</label>
                                <Input
                                    name="duration_hours"
                                    type="number"
                                    value={formData.duration_hours}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 8"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat.replace('_', ' ').toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Course URL *</label>
                            <Input
                                name="external_platform_url"
                                type="url"
                                value={formData.external_platform_url}
                                onChange={handleInputChange}
                                placeholder="https://example.com/course-link"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Direct link to the training course - users can click to access immediately
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border rounded-md"
                                placeholder="Brief description of the training program"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_mandatory"
                                    checked={formData.is_mandatory}
                                    onChange={handleInputChange}
                                />
                                <span className="text-sm">Mandatory training</span>
                            </label>

                            <div>
                                <label className="text-sm font-medium mr-2">Priority:</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="p-1 border rounded"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Create Program
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TrainingPage;
