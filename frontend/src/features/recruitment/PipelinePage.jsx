import React, { useState } from 'react';
import {
    useGetApplicationsQuery,
    useMoveApplicationStageMutation
} from '../../store/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, User, Phone, Briefcase, Mail, Calendar,
    Clock, Star, Eye, MoreVertical, TrendingUp, Users,
    CheckCircle, XCircle, AlertTriangle, ChevronRight, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import CandidateProfileDrawer from './CandidateProfileDrawer';

const PipelinePage = () => {
    const [selectedJob, setSelectedJob] = useState('all');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Pipeline stages definition with colors and icons
    const stages = [
        { id: 'applied', name: 'New Applicants', color: 'primary', icon: Users, description: 'Recently applied' },
        { id: 'screening', name: 'Screening', color: 'warning', icon: Eye, description: 'Under review' },
        { id: 'interview', name: 'Interview', color: 'info', icon: User, description: 'Interview scheduled' },
        { id: 'offer', name: 'Offer Extended', color: 'success', icon: CheckCircle, description: 'Offer sent' },
        { id: 'hired', name: 'Hired', color: 'success', icon: Star, description: 'Successfully hired' },
        { id: 'rejected', name: 'Rejected', color: 'error', icon: XCircle, description: 'Application closed' }
    ];

    const { data: applications = [], isLoading, refetch } = useGetApplicationsQuery({});
    const [moveStage] = useMoveApplicationStageMutation();

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
        acc[stage.id] = Array.isArray(applications)
            ? applications.filter(app => app.stage === stage.id)
            : [];
        return acc;
    }, {});

    const handleViewDetails = (candidate) => {
        setSelectedCandidate(candidate);
        setIsDrawerOpen(true);
    };

    // Calculate pipeline stats
    const totalCandidates = applications.length;
    const activeCandidates = applications.filter(app => ['screening', 'interview', 'offer'].includes(app.stage)).length;
    const hiredCandidates = applications.filter(app => app.stage === 'hired').length;
    const conversionRate = totalCandidates > 0 ? Math.round((hiredCandidates / totalCandidates) * 100) : 0;

    const getImageUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http') || photoPath.startsWith('data:') || photoPath.startsWith('blob:')) return photoPath;
        return `http://localhost:8000${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
    };

    const getStageColor = (stageId) => {
        const stage = stages.find(s => s.id === stageId);
        return stage?.color || 'default';
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in font-sans">
            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-6">
                    <Link
                        to="/recruitment"
                        className="h-14 w-14 flex items-center justify-center bg-slate-900 rounded-[1.5rem] text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                            Tracking Pipeline
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Monitor candidate velocity across strategic recruitment stages.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button className="rounded-xl bg-slate-900 shadow-xl shadow-slate-900/20 font-black uppercase text-[10px] tracking-[0.2em] px-8 h-12">
                        <TrendingUp className="h-4 w-4 mr-2" /> View Analytics
                    </Button>
                </div>
            </div>

            {/* Pipeline Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Apps"
                    value={totalCandidates}
                    icon={<Users className="h-6 w-6 text-indigo-600" />}
                    color="from-indigo-50 to-white"
                />
                <StatCard
                    title="Active Sync"
                    value={activeCandidates}
                    icon={<Clock className="h-6 w-6 text-amber-600" />}
                    color="from-amber-50 to-white"
                />
                <StatCard
                    title="Engaged Stage"
                    value={hiredCandidates}
                    icon={<Star className="h-6 w-6 text-emerald-600" />}
                    color="from-emerald-50 to-white"
                />
                <StatCard
                    title="Conv Rate"
                    value={`${conversionRate}%`}
                    icon={<Zap className="h-6 w-6 text-primary-600" />}
                    color="from-primary-50 to-white"
                />
            </div>

            {/* Kanban Board */}
            {isLoading ? (
                <div className="flex justify-center items-center py-40">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-900 border-t-transparent shadow-2xl shadow-slate-500/20"></div>
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="overflow-x-auto pb-8 -mx-1 px-1">
                        <div className="flex gap-8 min-w-max">
                            {stages.map((stage) => (
                                <div key={stage.id} className="w-80 flex flex-col gap-6">
                                    {/* Stage Header */}
                                    <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-2xl shadow-slate-900/20">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 flex items-center justify-center bg-white/10 rounded-xl">
                                                <stage.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-black italic uppercase text-[11px] tracking-widest leading-none">{stage.name}</h3>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">{stage.description}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-white/10 border-none font-black text-[10px] text-white rounded-lg px-2.5">
                                            {columns[stage.id].length}
                                        </Badge>
                                    </div>

                                    {/* Droppable Area */}
                                    <Droppable droppableId={stage.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={cn(
                                                    "flex-1 min-h-[650px] rounded-[3rem] border-2 border-dashed transition-all duration-500 p-4 space-y-6",
                                                    snapshot.isDraggingOver
                                                        ? 'border-primary-400 bg-primary-50/20 shadow-inner'
                                                        : 'border-slate-100 bg-slate-50/30'
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
                                                                    "group cursor-move transition-all duration-500",
                                                                    snapshot.isDragging ? 'rotate-2 scale-105 z-50' : ''
                                                                )}
                                                            >
                                                                <Card
                                                                    className={cn(
                                                                        "border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white",
                                                                        snapshot.isDragging ? 'shadow-2xl' : ''
                                                                    )}
                                                                >
                                                                    <CardContent className="p-6 space-y-5">
                                                                        {/* Candidate Header */}
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="h-12 w-12 rounded-[1.2rem] bg-slate-900 border-2 border-slate-900 p-0.5 overflow-hidden shadow-lg shadow-slate-900/10">
                                                                                    {application.candidate?.photo ? (
                                                                                        <img
                                                                                            src={getImageUrl(application.candidate.photo)}
                                                                                            alt={application.candidate.full_name}
                                                                                            className="h-full w-full object-cover rounded-[1rem]"
                                                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="h-full w-full flex items-center justify-center text-white font-black italic text-xs">
                                                                                            {application.candidate?.first_name?.[0]}{application.candidate?.last_name?.[0]}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="font-black text-slate-900 uppercase italic text-xs tracking-tight">
                                                                                        {application.candidate?.first_name} {application.candidate?.last_name}
                                                                                    </h4>
                                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                                                        {application.job_title || 'Position Unknown'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Indicators */}
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex gap-2">
                                                                                {application.score > 0 && (
                                                                                    <Badge className="bg-emerald-500 text-white border-none rounded-lg font-black text-[9px] px-2 py-1 uppercase tracking-tighter">
                                                                                        {application.score}% Final Match
                                                                                    </Badge>
                                                                                )}
                                                                                <Badge className="bg-slate-100 text-slate-600 border-none rounded-lg font-black text-[9px] px-2 py-1 uppercase tracking-tighter">
                                                                                    Exp: {application.candidate?.experience_years || '0'}Y
                                                                                </Badge>
                                                                            </div>
                                                                        </div>

                                                                        {/* Skills */}
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {application.candidate?.skills?.slice(0, 3).map((skill, idx) => (
                                                                                <span key={idx} className="bg-slate-50 text-slate-400 border border-slate-100 rounded-lg px-2 py-1 text-[8px] font-black uppercase tracking-widest italic group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                                                    {skill}
                                                                                </span>
                                                                            ))}
                                                                        </div>

                                                                        {/* Footer Actions */}
                                                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                                <Calendar className="h-3 w-3" /> {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'N/A'}
                                                                            </div>
                                                                            <div className="flex gap-1">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 p-0 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-none"
                                                                                    onClick={() => handleViewDetails(application.candidate)}
                                                                                >
                                                                                    <Eye className="h-4 w-4" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-50 transition-all shadow-none">
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
                                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 grayscale saturate-0">
                                                        <div className="p-8 bg-slate-200 rounded-full mb-6">
                                                            <stage.icon className="h-10 w-10 text-slate-400" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                                                            Queue Empty
                                                        </p>
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
    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group hover:-translate-y-1 transition-all">
        <CardContent className={cn("p-8 bg-gradient-to-br", color)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">{value}</h3>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default PipelinePage;
