import React, { useState, useMemo } from 'react';
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
    CheckCircle, XCircle, Filter, Activity, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { getMediaUrl } from '../../config/api';
import CandidateProfileDrawer from './CandidateProfileDrawer';
import InterviewSchedulerModal from './InterviewSchedulerModal';
import { motion } from 'framer-motion';

const PipelinePage = () => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [pendingApplication, setPendingApplication] = useState(null);

    const stages = [
        { id: 'applied', name: 'New', color: 'blue', icon: Users },
        { id: 'screening', name: 'Screening', color: 'orange', icon: Eye },
        { id: 'interview', name: 'Interview', color: 'purple', icon: User },
        { id: 'offer', name: 'Offer', color: 'yellow', icon: Star },
        { id: 'hired', name: 'Hired', color: 'green', icon: CheckCircle },
        { id: 'rejected', name: 'Rejected', color: 'red', icon: XCircle }
    ];

    const { data: applications = [], isLoading, refetch } = useGetApplicationsQuery({});
    const [moveStage] = useMoveApplicationStageMutation();

    const applicationsArray = useMemo(() => Array.isArray(applications) ? applications : (applications?.results || []), [applications]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStage = destination.droppableId;

        if (newStage === 'interview') {
            const app = applicationsArray.find(a => String(a.id) === draggableId);
            setPendingApplication(app);
            setIsSchedulerOpen(true);
            return;
        }

        try {
            await moveStage({ id: draggableId, stage: newStage }).unwrap();
            toast.success(`Candidate moved to ${stages.find(s => s.id === newStage)?.name}`);
            refetch();
        } catch (error) {
            toast.error("Failed to move candidate.");
        }
    };

    const columns = useMemo(() => stages.reduce((acc, stage) => {
        acc[stage.id] = applicationsArray.filter(app => app.stage === stage.id);
        return acc;
    }, {}), [applicationsArray]);

    const handleViewDetails = (candidate) => {
        setSelectedCandidate(candidate);
        setIsDrawerOpen(true);
    };

    const stats = useMemo(() => {
        const total = applicationsArray.length;
        const active = applicationsArray.filter(app => ['screening', 'interview', 'offer'].includes(app.stage)).length;
        const hired = applicationsArray.filter(app => app.stage === 'hired').length;
        return { total, active, hired };
    }, [applicationsArray]);

    return (
        <div className="space-y-8 pb-12 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link to="/recruitment" className="hover:text-gray-900 flex items-center gap-1">
                            <ArrowLeft className="h-3 w-3" /> Back to Recruitment
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hiring Pipeline</h1>
                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {stats.total} Candidates</span>
                        <span className="flex items-center gap-2"><Activity className="h-4 w-4" /> {stats.active} Active</span>
                        <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary-600" /> {stats.hired} Hired</span>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                    </div>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex gap-6 h-full min-w-max px-1">
                            {stages.map((stage) => (
                                <div key={stage.id} className="w-80 flex flex-col gap-4 h-full">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-700">{stage.name}</h3>
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none px-2 py-0.5 rounded-md text-xs">
                                                {columns[stage.id].length}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex-1 rounded-2xl bg-gray-50 border border-slate-100 p-2 overflow-y-auto w-full">
                                        <Droppable droppableId={stage.id}>
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className={cn(
                                                        "min-h-[150px] space-y-3 transition-colors rounded-xl p-1",
                                                        snapshot.isDraggingOver ? 'bg-gray-100/50 ring-2 ring-slate-200' : ''
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
                                                                    style={{ ...provided.draggableProps.style }}
                                                                >
                                                                    <CandidateCard
                                                                        application={application}
                                                                        onClick={() => handleViewDetails(application.candidate)}
                                                                        isDragging={snapshot.isDragging}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                )}
            </div>

            <CandidateProfileDrawer
                candidate={selectedCandidate}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

            <InterviewSchedulerModal
                isOpen={isSchedulerOpen}
                onClose={() => {
                    setIsSchedulerOpen(false);
                    refetch();
                }}
                application={pendingApplication}
            />
        </div>
    );
};

const CandidateCard = ({ application, onClick, isDragging }) => {
    const candidate = application.candidate;

    return (
        <Card
            onClick={onClick}
            className={cn(
                "cursor-pointer group hover:shadow-md transition-all border-gray-200 shadow-sm",
                isDragging ? "shadow-xl ring-2 ring-primary-500 rotate-2" : "bg-white"
            )}
        >
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {candidate?.photo ? (
                            <img
                                src={getMediaUrl(candidate.photo)}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <span className="text-xs font-bold text-gray-400">
                                {candidate?.first_name?.[0]}{candidate?.last_name?.[0]}
                            </span>
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">{candidate?.first_name} {candidate?.last_name}</h4>
                        <p className="text-xs text-gray-500 truncate max-w-[140px]">{application.job_title}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                    </div>
                    {application.score > 0 && (
                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                            {application.score}%
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PipelinePage;
