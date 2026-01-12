import React, { useState } from 'react';
import {
    useGetApplicationsQuery,
    useMoveApplicationStageMutation
} from '../../store/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, User, Briefcase, Calendar,
    Clock, Star, Eye, MoreVertical, TrendingUp, Users,
    CheckCircle, XCircle, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { getMediaUrl } from '../../config/api';
import CandidateProfileDrawer from './CandidateProfileDrawer';

const PipelinePage = () => {
    const [selectedJob, setSelectedJob] = useState('all');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Pipeline stages definition
    const stages = [
        { id: 'applied', name: 'New Applicants', color: 'blue', icon: Users },
        { id: 'screening', name: 'Screening', color: 'orange', icon: Eye },
        { id: 'interview', name: 'Interview', color: 'purple', icon: User },
        { id: 'offer', name: 'Offer Extended', color: 'green', icon: CheckCircle },
        { id: 'hired', name: 'Hired', color: 'emerald', icon: Star },
        { id: 'rejected', name: 'Rejected', color: 'red', icon: XCircle }
    ];

    const { data: applications = [], isLoading, refetch } = useGetApplicationsQuery({});
    const [moveStage] = useMoveApplicationStageMutation();

    const applicationsArray = Array.isArray(applications) ? applications : (applications?.results ? applications.results : []);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStage = destination.droppableId;

        try {
            await moveStage({ id: draggableId, stage: newStage }).unwrap();
            toast.success(`Candidate moved to ${stages.find(s => s.id === newStage)?.name}`);
            refetch();
        } catch (error) {
            console.error("Failed to move candidate", error);
            toast.error("Failed to move candidate. Please try again.");
        }
    };

    // Group applications by stage
    const columns = stages.reduce((acc, stage) => {
        acc[stage.id] = applicationsArray.filter(app => app.stage === stage.id);
        return acc;
    }, {});

    const handleViewDetails = (candidate) => {
        setSelectedCandidate(candidate);
        setIsDrawerOpen(true);
    };

    // Calculate pipeline stats
    const totalCandidates = applicationsArray.length;
    const activeCandidates = applicationsArray.filter(app => ['screening', 'interview', 'offer'].includes(app.stage)).length;
    const hiredCandidates = applicationsArray.filter(app => app.stage === 'hired').length;
    const conversionRate = totalCandidates > 0 ? Math.round((hiredCandidates / totalCandidates) * 100) : 0;

    const getStageColor = (stageId) => {
        const colorMap = {
            blue: 'bg-primary-100 text-primary-700 border-primary-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            red: 'bg-red-100 text-red-700 border-red-200'
        };
        const stage = stages.find(s => s.id === stageId);
        return colorMap[stage?.color] || colorMap.blue;
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/recruitment"
                            className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Recruitment Pipeline
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">Monitor candidate progress across stages</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="border border-gray-200">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                        <Button className="bg-primary-600 hover:bg-primary-700">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Applications"
                    value={totalCandidates}
                    icon={<Users className="h-5 w-5 text-primary-600" />}
                    color="bg-primary-50"
                />
                <StatCard
                    title="Active Candidates"
                    value={activeCandidates}
                    icon={<Clock className="h-5 w-5 text-orange-600" />}
                    color="bg-orange-50"
                />
                <StatCard
                    title="Hired"
                    value={hiredCandidates}
                    icon={<Star className="h-5 w-5 text-green-600" />}
                    color="bg-green-50"
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${conversionRate}%`}
                    icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                    color="bg-purple-50"
                />
            </div>

            {/* Kanban Board */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="h-12 w-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4 min-w-max">
                            {stages.map((stage) => (
                                <div key={stage.id} className="w-80 flex flex-col gap-3">
                                    {/* Stage Header */}
                                    <div className={cn("p-4 rounded-lg border-2", getStageColor(stage.id))}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <stage.icon className="h-5 w-5" />
                                                <div>
                                                    <h3 className="font-semibold text-sm">{stage.name}</h3>
                                                    <p className="text-xs opacity-70 mt-0.5">{columns[stage.id].length} candidates</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Droppable Area */}
                                    <Droppable droppableId={stage.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={cn(
                                                    "flex-1 min-h-[500px] rounded-xl border-2 border-dashed transition-all p-3 space-y-3",
                                                    snapshot.isDraggingOver
                                                        ? 'border-primary-400 bg-primary-50'
                                                        : 'border-gray-200 bg-gray-50'
                                                )}
                                            >
                                                {columns[stage.id].map((application, index) => (
                                                    <Draggable
                                                        key={application.id}
                                                        draggableId={String(application.id)}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={cn(
                                                                    "transition-all",
                                                                    snapshot.isDragging ? 'rotate-2 scale-105' : ''
                                                                )}
                                                            >
                                                                <Card
                                                                    className={cn(
                                                                        "border border-gray-200 hover:shadow-md transition-all bg-white",
                                                                        snapshot.isDragging ? 'shadow-lg' : ''
                                                                    )}
                                                                >
                                                                    <CardContent className="p-4 space-y-3">
                                                                        {/* Candidate Header */}
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="h-10 w-10 rounded-lg bg-primary-100 overflow-hidden">
                                                                                    {application.candidate?.photo ? (
                                                                                        <img
                                                                                            src={getMediaUrl(application.candidate.photo)}
                                                                                            alt={application.candidate.full_name}
                                                                                            className="h-full w-full object-cover"
                                                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="h-full w-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                                                                                            {application.candidate?.first_name?.[0]}{application.candidate?.last_name?.[0]}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="font-semibold text-sm text-gray-900">
                                                                                        {application.candidate?.first_name} {application.candidate?.last_name}
                                                                                    </h4>
                                                                                    <p className="text-xs text-gray-600">
                                                                                        {application.job_title || 'Position Unknown'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Indicators */}
                                                                        <div className="flex items-center gap-2">
                                                                            {application.score > 0 && (
                                                                                <Badge className="bg-green-100 text-green-700 text-xs">
                                                                                    {application.score}% Match
                                                                                </Badge>
                                                                            )}
                                                                            <Badge className="bg-gray-100 text-gray-700 text-xs">
                                                                                {application.candidate?.experience_years || '0'}Y Exp
                                                                            </Badge>
                                                                        </div>

                                                                        {/* Skills */}
                                                                        {application.candidate?.skills && (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {application.candidate.skills.slice(0, 3).map((skill, idx) => (
                                                                                    <span key={idx} className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs">
                                                                                        {skill}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {/* Footer */}
                                                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                                                <Calendar className="h-3 w-3" />
                                                                                {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'N/A'}
                                                                            </div>
                                                                            <div className="flex gap-1">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-7 w-7 p-0 hover:bg-primary-100"
                                                                                    onClick={() => handleViewDetails(application.candidate)}
                                                                                >
                                                                                    <Eye className="h-4 w-4" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100">
                                                                                    <MoreVertical className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}

                                                {/* Empty State */}
                                                {columns[stage.id].length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                                                        <stage.icon className="h-12 w-12 text-gray-400 mb-2" />
                                                        <p className="text-xs text-gray-500">No candidates</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </div>
                </DragDropContext>
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

const StatCard = ({ title, value, icon, color }) => (
    <Card className="border border-gray-200">
        <CardContent className={cn("p-6", color)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-600 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className="p-3 bg-white rounded-lg">
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default PipelinePage;
