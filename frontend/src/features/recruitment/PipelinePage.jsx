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
    CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const PipelinePage = () => {
    const [selectedJob, setSelectedJob] = useState('all');

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
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/recruitment"
                        className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Candidate Pipeline</h1>
                        <p className="text-text-secondary mt-1">Track and manage candidate progress through recruitment stages</p>
                    </div>
                </div>
                <Button>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                </Button>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Total Applications</p>
                                <p className="text-2xl font-bold text-text-primary">{totalCandidates}</p>
                            </div>
                            <Users className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Active Candidates</p>
                                <p className="text-2xl font-bold text-text-primary">{activeCandidates}</p>
                            </div>
                            <Clock className="h-8 w-8 text-warning-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Successfully Hired</p>
                                <p className="text-2xl font-bold text-text-primary">{hiredCandidates}</p>
                            </div>
                            <Star className="h-8 w-8 text-success-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Conversion Rate</p>
                                <p className="text-2xl font-bold text-text-primary">{conversionRate}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Kanban Board */}
            {isLoading ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
                            <p className="text-text-secondary font-medium">Loading pipeline...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-6 min-w-max px-1">
                            {stages.map((stage) => (
                                <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col">
                                    {/* Stage Header */}
                                    <Card className="mb-4">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        stage.color === 'primary' ? 'bg-primary-100' :
                                                        stage.color === 'warning' ? 'bg-warning-100' :
                                                        stage.color === 'info' ? 'bg-primary-100' :
                                                        stage.color === 'success' ? 'bg-success-100' :
                                                        stage.color === 'error' ? 'bg-error-100' : 'bg-neutral-100'
                                                    }`}>
                                                        <stage.icon className={`h-4 w-4 ${
                                                            stage.color === 'primary' ? 'text-primary-600' :
                                                            stage.color === 'warning' ? 'text-warning-600' :
                                                            stage.color === 'info' ? 'text-primary-600' :
                                                            stage.color === 'success' ? 'text-success-600' :
                                                            stage.color === 'error' ? 'text-error-600' : 'text-neutral-600'
                                                        }`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-text-primary">{stage.name}</h3>
                                                        <p className="text-xs text-text-secondary">{stage.description}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={stage.color} size="sm" className="font-bold">
                                                    {columns[stage.id].length}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Droppable Area */}
                                    <Droppable droppableId={stage.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex-1 min-h-[600px] rounded-lg border-2 border-dashed transition-colors p-4 space-y-4 ${
                                                    snapshot.isDraggingOver
                                                        ? 'border-primary-400 bg-primary-50/50'
                                                        : 'border-border-light'
                                                }`}
                                            >
                                                {columns[stage.id].map((application, index) => (
                                                    <Draggable
                                                        key={application.id}
                                                        draggableId={String(application.id)}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <Card
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`cursor-move transition-all duration-200 hover:shadow-lg ${
                                                                    snapshot.isDragging
                                                                        ? 'shadow-2xl rotate-3 scale-105'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <CardContent className="p-4">
                                                                    {/* Candidate Header */}
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                                                                {application.candidate?.photo ? (
                                                                                    <img
                                                                                        src={getImageUrl(application.candidate.photo)}
                                                                                        alt={application.candidate.full_name}
                                                                                        className="h-full w-full object-cover"
                                                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                                                    />
                                                                                ) : (
                                                                                    <span>
                                                                                        {application.candidate?.first_name?.[0] || '?'}
                                                                                        {application.candidate?.last_name?.[0] || ''}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-semibold text-text-primary text-sm">
                                                                                    {application.candidate?.first_name} {application.candidate?.last_name}
                                                                                </h4>
                                                                                <p className="text-xs text-text-secondary">
                                                                                    {application.job_title || 'Position not specified'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        {application.score > 0 && (
                                                                            <Badge
                                                                                variant={application.score >= 80 ? 'success' : application.score >= 60 ? 'warning' : 'error'}
                                                                                size="sm"
                                                                            >
                                                                                {application.score}% match
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    {/* Skills */}
                                                                    {application.candidate?.skills && application.candidate.skills.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mb-3">
                                                                            {application.candidate.skills.slice(0, 3).map((skill, idx) => (
                                                                                <Badge key={idx} variant="outline" size="sm">
                                                                                    {skill}
                                                                                </Badge>
                                                                            ))}
                                                                            {application.candidate.skills.length > 3 && (
                                                                                <Badge variant="outline" size="sm">
                                                                                    +{application.candidate.skills.length - 3}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Contact & Date */}
                                                                    <div className="flex items-center justify-between text-xs text-text-secondary">
                                                                        <div className="flex items-center gap-3">
                                                                            {application.candidate?.email && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Mail className="h-3 w-3" />
                                                                                    <span className="truncate max-w-24">
                                                                                        {application.candidate.email}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {application.candidate?.phone && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Phone className="h-3 w-3" />
                                                                                    <span>{application.candidate.phone}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            <span>
                                                                                {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Action Buttons */}
                                                                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border-light">
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}

                                                {/* Empty State */}
                                                {columns[stage.id].length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                                        <stage.icon className="h-12 w-12 text-neutral-300 mb-3" />
                                                        <p className="text-sm text-text-secondary">
                                                            No candidates in {stage.name.toLowerCase()}
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
        </div>
    );
};

export default PipelinePage;
