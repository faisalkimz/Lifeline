import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Plus, BookOpen, Users, Award, Clock, Calendar, CheckCircle, PlayCircle, Eye, Search, Filter
} from 'lucide-react';
import {
    useGetTrainingProgramsQuery,
    useGetTrainingSessionsQuery,
    useGetEnrollmentsQuery,
    useCreateTrainingProgramMutation,
    useCreateTrainingSessionMutation,
    useGetCurrentUserQuery
} from '../../store/api';
import toast from 'react-hot-toast';

const TrainingPage = () => {
    const { data: programs, isLoading: programsLoading } = useGetTrainingProgramsQuery();
    const { data: sessions } = useGetTrainingSessionsQuery();
    const { data: enrollments } = useGetEnrollmentsQuery();
    const [createProgram, { isLoading: isCreatingProgram }] = useCreateTrainingProgramMutation();
    const [createSession, { isLoading: isCreatingSession }] = useCreateTrainingSessionMutation();

    const { data: currentUser } = useGetCurrentUserQuery();
    const canManageTraining = ['company_admin', 'hr_manager', 'manager', 'super_admin'].includes(currentUser?.role);

    const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
    const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [programData, setProgramData] = useState({
        name: '',
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
            setProgramData({ name: '', description: '', duration_hours: '', category: 'technical', is_mandatory: false });
        } catch (error) {
            console.error('Create program failed:', error);
            const msg = error?.data?.detail || 'Failed to create program';
            toast.error(typeof msg === 'string' ? msg : 'Error occurred');
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
            console.error('Create session failed:', error);
            const msg = error?.data?.detail || 'Failed to create session';
            toast.error(typeof msg === 'string' ? msg : 'Error occurred');
        }
    };

    const programsArray = Array.isArray(programs) ? programs : (programs?.results || []);
    const sessionsArray = Array.isArray(sessions) ? sessions : (sessions?.results || []);
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : (enrollments?.results || []);

    const completedTrainings = enrollmentsArray.filter(e => e.status === 'completed').length;
    const inProgressTrainings = enrollmentsArray.filter(e => e.status === 'in_progress' || e.status === 'enrolled').length;
    const totalHours = enrollmentsArray.reduce((sum, e) => sum + (e.program?.duration_hours || 0), 0);
    const certificates = enrollmentsArray.filter(e => e.certificate_issued).length;

    const filteredPrograms = programsArray.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Training & Development</h1>
                    <p className="text-gray-600 mt-1">Manage employee learning paths and track progress.</p>
                </div>
                <div className="flex gap-3">
                    {canManageTraining && (
                        <>
                            <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="bg-white hover:bg-gray-50 text-gray-700">
                                        <Calendar className="h-4 w-4 mr-2" /> Schedule Session
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl bg-white rounded-xl shadow-xl border border-gray-100 p-0 overflow-hidden">
                                    <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-gray-100">
                                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                                            <Calendar className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Schedule Session</DialogTitle>
                                            <p className="text-sm text-gray-500 mt-1 font-medium">Plan a new training session for an existing program.</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleCreateSession} className="p-6 space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Program</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none text-sm text-gray-900"
                                                    value={sessionData.program}
                                                    onChange={e => setSessionData({ ...sessionData, program: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select program...</option>
                                                    {programsArray.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <Filter className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Start Date</label>
                                                <Input
                                                    type="date"
                                                    className="bg-white"
                                                    value={sessionData.start_date}
                                                    onChange={e => setSessionData({ ...sessionData, start_date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">End Date</label>
                                                <Input
                                                    type="date"
                                                    className="bg-white"
                                                    value={sessionData.end_date}
                                                    onChange={e => setSessionData({ ...sessionData, end_date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Instructor</label>
                                            <Input
                                                className="bg-white"
                                                value={sessionData.instructor_name}
                                                onChange={e => setSessionData({ ...sessionData, instructor_name: e.target.value })}
                                                required
                                                placeholder="e.g. John Doe, or External Vendor"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Location / Link</label>
                                            <Input
                                                className="bg-white"
                                                value={sessionData.location}
                                                onChange={e => setSessionData({ ...sessionData, location: e.target.value })}
                                                required
                                                placeholder="e.g. Conference Room B or Zoom Link"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="is_virtual"
                                                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                                checked={sessionData.is_virtual}
                                                onChange={e => setSessionData({ ...sessionData, is_virtual: e.target.checked })}
                                            />
                                            <label htmlFor="is_virtual" className="text-sm font-medium text-gray-700 cursor-pointer">Virtual Session</label>
                                        </div>
                                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                            <Button type="button" onClick={() => setIsSessionDialogOpen(false)} variant="ghost" className="text-gray-600 hover:text-gray-900">
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isCreatingSession} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
                                                {isCreatingSession ? 'Scheduling...' : 'Schedule Session'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
                                        <Plus className="h-4 w-4 mr-2" /> New Program
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl bg-white rounded-xl shadow-xl border border-gray-100 p-0 overflow-hidden">
                                    <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-gray-100">
                                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                                            <BookOpen className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Create Training Program</DialogTitle>
                                            <p className="text-sm text-gray-500 mt-1 font-medium">Define a new course or curriculum for employees.</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleCreateProgram} className="p-6 space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Program Name</label>
                                            <Input
                                                className="bg-white"
                                                value={programData.name}
                                                onChange={e => setProgramData({ ...programData, name: e.target.value })}
                                                required
                                                placeholder="e.g. Advanced Leadership Skills"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow resize-none"
                                                rows="3"
                                                value={programData.description}
                                                onChange={e => setProgramData({ ...programData, description: e.target.value })}
                                                required
                                                placeholder="What will employees learn?"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Duration (Hours)</label>
                                                <Input
                                                    type="number"
                                                    className="bg-white"
                                                    value={programData.duration_hours}
                                                    onChange={e => setProgramData({ ...programData, duration_hours: e.target.value })}
                                                    required
                                                    min="1"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Category</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none text-sm text-gray-900"
                                                        value={programData.category}
                                                        onChange={e => setProgramData({ ...programData, category: e.target.value })}
                                                    >
                                                        <option value="technical">Technical</option>
                                                        <option value="soft_skills">Soft Skills</option>
                                                        <option value="compliance">Compliance</option>
                                                        <option value="leadership">Leadership</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <Filter className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="is_mandatory"
                                                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                                checked={programData.is_mandatory}
                                                onChange={e => setProgramData({ ...programData, is_mandatory: e.target.checked })}
                                            />
                                            <label htmlFor="is_mandatory" className="text-sm font-medium text-gray-700 cursor-pointer">Mandatory Training</label>
                                        </div>
                                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                            <Button type="button" onClick={() => setIsProgramDialogOpen(false)} variant="ghost" className="text-gray-600 hover:text-gray-900">
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isCreatingProgram} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
                                                {isCreatingProgram ? 'Creating...' : 'Create Program'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{completedTrainings}</p>
                    </div>
                    <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                </div>
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{inProgressTrainings}</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <PlayCircle className="h-5 w-5" />
                    </div>
                </div>
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Hours</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{totalHours}</p>
                    </div>
                    <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                        <Clock className="h-5 w-5" />
                    </div>
                </div>
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Certificates</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{certificates}</p>
                    </div>
                    <div className="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                        <Award className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Content & Search */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Training Programs</h2>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search programs..."
                            className="bg-white pl-10 h-10 border-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {programsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : filteredPrograms.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                            <BookOpen className="h-7 w-7 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No programs found</h3>
                        <p className="text-gray-500 mb-6">Create a new program to start training your team.</p>
                        <Button onClick={() => setIsProgramDialogOpen(true)} className="bg-primary-600 text-white shadow-sm">
                            <Plus className="h-4 w-4 mr-2" /> Create Program
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPrograms.map(program => (
                            <Card key={program.id} className="cursor-pointer group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 transition-transform group-hover:scale-110">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        {program.is_mandatory && (
                                            <Badge className="bg-red-50 text-red-700 border-red-100 px-2 py-0.5">Required</Badge>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-1 group-hover:text-primary-600 transition-colors">{program.name}</h3>
                                    <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">{program.description}</p>

                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-5">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{program.duration_hours}h</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{program.enrollment_count || 0} enrolled</span>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm group/btn" size="sm">
                                        <Eye className="h-4 w-4 mr-2 text-gray-400 group-hover/btn:text-primary-600 transition-colors" /> View Details
                                    </Button>
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
