import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Plus, BookOpen, Users, Award, Clock, Calendar, TrendingUp, CheckCircle, PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    useGetTrainingProgramsQuery,
    useGetTrainingSessionsQuery,
    useGetEnrollmentsQuery,
    useCreateTrainingProgramMutation,
    useCreateTrainingSessionMutation,
    useEnrollInTrainingMutation,
} from '../../store/api';
import toast from 'react-hot-toast';

const TrainingPage = () => {
    const { data: programs, isLoading: programsLoading } = useGetTrainingProgramsQuery();
    const { data: sessions } = useGetTrainingSessionsQuery();
    const { data: enrollments } = useGetEnrollmentsQuery();
    const [createProgram] = useCreateTrainingProgramMutation();
    const [createSession] = useCreateTrainingSessionMutation();

    const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
    const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

    const [programData, setProgramData] = useState({
        title: '',
        description: '',
        duration_hours: '',
        category: 'technical',
        is_mandatory: false
    });

    const [sessionData, setSessionData] = useState({
        program: '',
        instructor_name: '',
        start_date: '',
        end_date: '',
        max_participants: '',
        location: '',
        is_virtual: false
    });

    const handleCreateProgram = async (e) => {
        e.preventDefault();
        try {
            await createProgram(programData).unwrap();
            toast.success('Training program created!');
            setIsProgramDialogOpen(false);
            setProgramData({ title: '', description: '', duration_hours: '', category: 'technical', is_mandatory: false });
        } catch (error) {
            toast.error('Failed to create program');
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await createSession(sessionData).unwrap();
            toast.success('Training session created!');
            setIsSessionDialogOpen(false);
            setSessionData({ program: '', instructor_name: '', start_date: '', end_date: '', max_participants: '', location: '', is_virtual: false });
        } catch (error) {
            toast.error('Failed to create session');
        }
    };

    const programsArray = Array.isArray(programs) ? programs : (programs?.results || []);
    const sessionsArray = Array.isArray(sessions) ? sessions : (sessions?.results || []);
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : (enrollments?.results || []);

    const completedTrainings = enrollmentsArray.filter(e => e.status === 'completed').length;
    const inProgressTrainings = enrollmentsArray.filter(e => e.status === 'in_progress' || e.status === 'enrolled').length;
    const totalHours = enrollmentsArray.reduce((sum, e) => sum + (e.program?.duration_hours || 0), 0);
    const certificates = enrollmentsArray.filter(e => e.certificate_issued).length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Training & Development</h1>
                    <p className="text-gray-600 mt-1">Manage employee learning and development</p>
                </div>
                <div className="flex gap-3">
                    <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Calendar className="h-4 w-4 mr-2" /> New Session
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Training Session</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSession} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={sessionData.program}
                                        onChange={e => setSessionData({ ...sessionData, program: e.target.value })}
                                        required
                                    >
                                        <option value="">Select program...</option>
                                        {programsArray.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={sessionData.start_date}
                                            onChange={e => setSessionData({ ...sessionData, start_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={sessionData.end_date}
                                            onChange={e => setSessionData({ ...sessionData, end_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={sessionData.instructor_name}
                                        onChange={e => setSessionData({ ...sessionData, instructor_name: e.target.value })}
                                        required
                                        placeholder="Instructor name"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" onClick={() => setIsSessionDialogOpen(false)} variant="outline" className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">Create Session</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" /> New Program
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Training Program</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateProgram} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Title</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={programData.title}
                                        onChange={e => setProgramData({ ...programData, title: e.target.value })}
                                        required
                                        placeholder="e.g. Leadership Training"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows="3"
                                        value={programData.description}
                                        onChange={e => setProgramData({ ...programData, description: e.target.value })}
                                        required
                                        placeholder="Describe the program..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={programData.duration_hours}
                                            onChange={e => setProgramData({ ...programData, duration_hours: e.target.value })}
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={programData.category}
                                            onChange={e => setProgramData({ ...programData, category: e.target.value })}
                                        >
                                            <option value="technical">Technical</option>
                                            <option value="soft_skills">Soft Skills</option>
                                            <option value="compliance">Compliance</option>
                                            <option value="leadership">Leadership</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_mandatory"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={programData.is_mandatory}
                                        onChange={e => setProgramData({ ...programData, is_mandatory: e.target.checked })}
                                    />
                                    <label htmlFor="is_mandatory" className="text-sm text-gray-700">Mandatory Training</label>
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" onClick={() => setIsProgramDialogOpen(false)} variant="outline" className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">Create Program</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{completedTrainings}</p>
                            <p className="text-sm text-gray-600">Completed</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <PlayCircle className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{inProgressTrainings}</p>
                            <p className="text-sm text-gray-600">In Progress</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
                            <p className="text-sm text-gray-600">Training Hours</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Award className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{certificates}</p>
                            <p className="text-sm text-gray-600">Certificates</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Programs Grid */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Programs</h2>
                {programsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>)}
                    </div>
                ) : programsArray.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs yet</h3>
                        <p className="text-gray-600 mb-4">Create your first training program</p>
                        <Button onClick={() => setIsProgramDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Create Program
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {programsArray.map(program => (
                            <Card key={program.id} className="hover:shadow-md transition-shadow border border-gray-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                        </div>
                                        {program.is_mandatory && (
                                            <Badge className="bg-red-100 text-red-700 border-0">Required</Badge>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{program.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{program.duration_hours}h</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>{program.enrollment_count || 0} enrolled</span>
                                        </div>
                                    </div>
                                    <Button size="sm" className="w-full">View Details</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingPage;
