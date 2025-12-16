import React, { useState } from 'react';
import {
    useGetApplicationsQuery,
    useMoveApplicationStageMutation
} from '../../store/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Briefcase } from 'lucide-react';

const PipelinePage = () => {
    // Pipeline stages definition
    const stages = {
        'applied': 'New Applicants',
        'screening': 'Screening',
        'interview': 'Interview',
        'offer': 'Offer Extended',
        'hired': 'Hired'
    };

    const { data: applications, isLoading } = useGetApplicationsQuery({});
    const [moveStage] = useMoveApplicationStageMutation();

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStage = destination.droppableId;

        // Optimistic update logic would go here ideally
        try {
            await moveStage({ id: draggableId, stage: newStage });
        } catch (error) {
            console.error("Failed to move candidate", error);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading pipeline...</div>;

    // Group applications by stage
    const columns = Object.keys(stages).reduce((acc, stage) => {
        acc[stage] = Array.isArray(applications)
    ? applications.filter(app => app.stage === stage)
    : [];
        return acc;
    }, {});

    return (
        <div className="h-full flex flex-col overflow-hidden pb-4">
            <div className="flex items-center gap-4 mb-6 px-1">
                <Link to="/recruitment" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Pipeline</h1>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 flex gap-4 overflow-x-auto pb-4 px-1">
                    {Object.entries(stages).map(([stageId, stageName]) => (
                        <div key={stageId} className="flex-shrink-0 w-80 flex flex-col bg-gray-100/50 rounded-xl border border-gray-200">
                            <div className="p-4 border-b border-gray-200 bg-white/50 rounded-t-xl backdrop-blur-sm sticky top-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-700">{stageName}</h3>
                                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                        {columns[stageId].length}
                                    </span>
                                </div>
                            </div>

                            <Droppable
                                droppableId={stageId}
                                isDropDisabled={false}
                                isCombineEnabled={false}
                                ignoreContainerClipping={false}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''
                                            }`}
                                    >
                                        {columns[stageId].map((app, index) => (
                                            <Draggable key={app.id} draggableId={String(app.id)} index={index}>
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-white shadow-sm hover:shadow-md border-gray-200 cursor-move ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 rotate-2' : ''
                                                            }`}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                                    {app.candidate.first_name[0]}{app.candidate.last_name[0]}
                                                                </div>
                                                                {app.score > 0 && (
                                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${app.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                                        }`}>
                                                                        {app.score}% Match
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h4 className="font-bold text-gray-900 truncate">
                                                                {app.candidate.first_name} {app.candidate.last_name}
                                                            </h4>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                                                                <Briefcase className="h-3 w-3" /> {app.job_title}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-2 pt-2 border-t flex justify-between">
                                                                <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                                                                {app.candidate.phone && <Phone className="h-3 w-3" />}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default PipelinePage;
