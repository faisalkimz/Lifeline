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
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Link to="/recruitment" className="hover:text-slate-900 flex items-center gap-1">
                            <ArrowLeft className="h-3 w-3" /> Back to Recruitment
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hiring Pipeline</h1>
                    <div className="flex items-center gap-6 mt-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Pipeline</span>
                            <span className="text-sm font-bold text-slate-800">{stats.total} candidates</span>
                        </div>
                        <div className="flex flex-col border-l border-slate-200 pl-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Stages</span>
                            <span className="text-sm font-bold text-slate-800">{stats.active}</span>
                        </div>
                        <div className="flex flex-col border-l border-slate-200 pl-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hired Total</span>
                            <span className="text-sm font-bold text-[#88B072]">{stats.hired}</span>
                        </div>
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
                                <div key={stage.id} className="w-80 flex flex-col gap-3 h-full">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stage.name}</h3>
                                            <span className="bg-slate-100/50 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                {columns[stage.id].length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 rounded border border-slate-200 bg-slate-50/50 p-2 overflow-y-auto w-full">
                                        <Droppable droppableId={stage.id}>
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className={cn(
                                                        "min-h-[150px] space-y-2 transition-colors rounded p-1",
                                                        snapshot.isDraggingOver ? 'bg-[#88B072]/5 ring-1 ring-[#88B072]/20' : ''
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
                "cursor-pointer group hover:shadow-md transition-all border-slate-100 shadow-sm rounded-lg",
                isDragging ? "shadow-lg ring-1 ring-[#88B072] rotate-1" : "bg-white"
            )}
        >
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {candidate?.photo ? (
                            <img
                                src={getMediaUrl(candidate.photo)}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400">
                                {candidate?.first_name?.[0]}{candidate?.last_name?.[0]}
                            </span>
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-xs group-hover:text-[#88B072] transition-colors">{candidate?.first_name} {candidate?.last_name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[140px] mt-0.5">{application.job_title}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        <Calendar className="h-3 w-3 text-slate-300" />
                        <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                    </div>
                    {application.score > 0 && (
                        <span className="text-[9px] font-bold text-[#88B072] bg-[#88B072]/10 border border-[#88B072]/10 px-1.5 py-0.5 rounded uppercase">
                            Score: {application.score}%
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PipelinePage;
