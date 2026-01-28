import React, { useState } from 'react';
import {
    Clock, Users, CheckCircle2, PieChart, Send, ShieldCheck,
    Trash2, ExternalLink, HelpCircle, MessageSquare, RefreshCw,
    Edit, Play, Pause, XCircle, Heart, BarChart3, Plus, Search, Filter
} from 'lucide-react';
import {
    useGetSurveysQuery,
    useCreateSurveyMutation,
    useGetSurveyAnalyticsQuery,
    useCreateSurveyResponseMutation,
    useUpdateSurveyMutation,
    useDeleteSurveyMutation
} from '../../store/api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import toast from 'react-hot-toast';

const SurveysPage = () => {
    const user = useSelector(selectCurrentUser);
    const isAdmin = ['super_admin', 'company_admin', 'admin', 'manager', 'hr_manager'].includes(user?.role);
    const [activeTab, setActiveTab] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');

    // Queries
    const { data: surveysData, isLoading } = useGetSurveysQuery();
    const surveysList = surveysData?.results || surveysData || [];

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTakeModalOpen, setIsTakeModalOpen] = useState(false);
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Visual Question Builder State
    const [surveyQuestions, setSurveyQuestions] = useState([
        { id: Date.now(), text: 'How happy are you at work?', type: 'rating', scale: 5 }
    ]);

    const addQuestion = () => {
        setSurveyQuestions([...surveyQuestions, {
            id: Date.now(),
            text: '',
            type: 'rating',
            scale: 5
        }]);
    };

    const removeQuestion = (id) => {
        if (surveyQuestions.length > 1) {
            setSurveyQuestions(surveyQuestions.filter(q => q.id !== id));
        }
    };

    const updateQuestion = (id, key, value) => {
        setSurveyQuestions(surveyQuestions.map(q => q.id === id ? { ...q, [key]: value } : q));
    };

    // Mutations
    const [createSurvey] = useCreateSurveyMutation();
    const [updateSurvey] = useUpdateSurveyMutation();
    const [deleteSurvey] = useDeleteSurveyMutation();
    const [submitResponse] = useCreateSurveyResponseMutation();

    const filteredSurveys = surveysList.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
        const isTabActive = activeTab === 'active' ? s.is_active : !s.is_active;
        return matchesSearch && isTabActive;
    });

    const handleCreateSurvey = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            survey_type: formData.get('survey_type'),
            questions_config: surveyQuestions.map(({ id, ...rest }) => ({ ...rest, id: id.toString() })),
            is_anonymous: formData.get('is_anonymous') === 'on'
        };

        try {
            if (isEditing) {
                await updateSurvey({ id: editId, ...data }).unwrap();
                toast.success('Survey updated!');
            } else {
                await createSurvey(data).unwrap();
                toast.success('Survey launched successfully!');
            }
            closeCreateModal();
        } catch (err) {
            toast.error(isEditing ? 'Failed to update survey' : 'Failed to launch survey');
        }
    };

    const handleDeleteSurvey = async (id) => {
        if (!window.confirm('Delete this survey and all responses?')) return;
        try {
            await deleteSurvey(id).unwrap();
            toast.success('Survey deleted');
        } catch (err) {
            toast.error('Failed to delete survey');
        }
    };

    const handleToggleStatus = async (survey) => {
        try {
            await updateSurvey({
                id: survey.id,
                is_active: !survey.is_active
            }).unwrap();
            toast.success(survey.is_active ? 'Survey paused' : 'Survey reactivated');
        } catch (err) {
            toast.error('Failed to change status');
        }
    };

    const openEditModal = (survey) => {
        setIsEditing(true);
        setEditId(survey.id);
        setSurveyQuestions(survey.questions_config.map(q => ({ ...q, id: q.id.includes('q') ? Date.now() + Math.random() : parseInt(q.id) })));
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setSurveyQuestions([{ id: Date.now(), text: 'How happy are you at work?', type: 'rating', scale: 5 }]);
    };

    const handleTakeSurvey = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const answers = Object.fromEntries(formData.entries());
        try {
            await submitResponse({
                survey: selectedSurvey.id,
                answers_data: answers
            }).unwrap();
            toast.success('Thank you for your feedback!');
            setIsTakeModalOpen(false);
            setSelectedSurvey(null);
        } catch (err) {
            toast.error('Failed to submit survey. You might have already taken it.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Surveys & Pulse <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Track employee sentiment and engagement real-time</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { setIsEditing(false); setIsCreateModalOpen(true); }}
                        className="btn-workpay-primary flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Launch Survey
                    </button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Active Surveys</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{surveysList.filter(s => s.is_active).length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Responses</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{surveysList.reduce((acc, curr) => acc + (curr.response_count || 0), 0)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                        <Heart className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Engagement Score</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">8.4/10</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['active', 'closed'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-md text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                            >
                                {tab} Surveys
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search surveys..."
                            className="pl-10 input-workpay"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12"><RefreshCw className="h-8 w-8 text-primary-500 animate-spin" /></div>
                    ) : filteredSurveys.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-10" />
                            <p className="text-lg">No {activeTab} surveys found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSurveys.map(survey => (
                                <div key={survey.id} className="group p-6 rounded-2xl border border-gray-200 bg-white dark:bg-gray-900/50 hover:shadow-xl hover:border-primary-500/50 transition-all duration-300 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                                                {survey.survey_type}
                                            </div>
                                            {survey.is_anonymous && (
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                                                    <ShieldCheck className="h-3 w-3" /> Anonymous
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-primary-600 transition-colors">{survey.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                            {survey.description || 'Employee pulse survey to gather internal feedback.'}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 font-medium mb-6">
                                            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {survey.response_count || 0} Responses</span>
                                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Created {new Date(survey.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            {survey.is_active && (
                                                <button
                                                    onClick={() => { setSelectedSurvey(survey); setIsTakeModalOpen(true); }}
                                                    className="flex-1 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-900/10"
                                                >
                                                    Take Survey
                                                </button>
                                            )}
                                            {isAdmin && !survey.is_active && (
                                                <button
                                                    onClick={() => handleToggleStatus(survey)}
                                                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Play className="h-4 w-4" /> Activate
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => { setSelectedSurvey(survey); setIsAnalyticsModalOpen(true); }}
                                                    className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-600 transition-all"
                                                    title="Insights"
                                                >
                                                    <PieChart className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>

                                        {isAdmin && (
                                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                                                <button
                                                    onClick={() => openEditModal(survey)}
                                                    className="flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-gray-500 hover:text-primary-600 transition-colors"
                                                >
                                                    <Edit className="h-3 w-3" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(survey)}
                                                    className="flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-gray-500 hover:text-orange-600 transition-colors"
                                                >
                                                    {survey.is_active ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Start</>}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSurvey(survey.id)}
                                                    className="flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-gray-500 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-3 w-3" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Survey Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Survey Settings' : 'Launch New Pulse Survey'}</h2>
                            <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleCreateSurvey} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 block">Title *</label>
                                    <input name="title" required defaultValue={isEditing ? surveysList.find(s => s.id === editId)?.title : ''} className="input-workpay" placeholder="e.g. Q1 Engagement Pulse" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 block">Survey Type</label>
                                    <select name="survey_type" defaultValue={isEditing ? surveysList.find(s => s.id === editId)?.survey_type : 'pulse'} className="input-workpay">
                                        <option value="pulse">Pulse</option>
                                        <option value="enps">eNPS</option>
                                        <option value="satisfaction">Satisfaction</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input type="checkbox" name="is_anonymous" id="anon" defaultChecked={isEditing ? surveysList.find(s => s.id === editId)?.is_anonymous : false} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
                                    <label htmlFor="anon" className="text-sm font-semibold text-gray-700 dark:text-slate-300">Anonymous Responses</label>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 block">Description</label>
                                <textarea name="description" rows="2" defaultValue={isEditing ? surveysList.find(s => s.id === editId)?.description : ''} className="input-workpay" placeholder="Describe the focus area..." />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-bold text-slate-800">Survey Questions</label>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="text-[11px] bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-3 py-1.5 rounded-lg border border-primary-200 dark:border-primary-800 font-black uppercase hover:bg-primary-600 hover:text-white transition-all"
                                    >
                                        + Add Question
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {surveyQuestions.map((question, index) => (
                                        <div key={question.id} className="p-4 rounded-xl border-2 border-slate-100 bg-gray-50/50 dark:bg-gray-900/50 space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Question #{index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(question.id)}
                                                    className="text-gray-400 hover:text-red-500 p-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                <input
                                                    value={question.text}
                                                    onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                                                    className="input-workpay text-sm"
                                                    placeholder="Enter your question (e.g. Rate your manager)"
                                                    required
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <select
                                                        value={question.type}
                                                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                                                        className="input-workpay text-sm"
                                                    >
                                                        <option value="rating">Rating (1-5 Scale)</option>
                                                        <option value="textarea">Open Feedback (Text)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={closeCreateModal} className="btn-workpay-secondary">Discard</button>
                                <button type="submit" className="btn-workpay-primary">{isEditing ? 'Update Survey' : 'Launch Survey'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Take Survey Modal */}
            {isTakeModalOpen && selectedSurvey && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">
                        <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-600">
                            <h2 className="text-xl font-bold text-white">{selectedSurvey.title}</h2>
                            <p className="text-primary-100 text-sm opacity-90">{selectedSurvey.is_anonymous ? 'This survey is anonymous. Be honest!' : 'Your identity will be visible to HR.'}</p>
                        </div>
                        <form onSubmit={handleTakeSurvey} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {selectedSurvey.questions_config.map(q => (
                                <div key={q.id}>
                                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3 block">{q.text}</label>
                                    {q.type === 'rating' ? (
                                        <div className="flex justify-between gap-2">
                                            {[1, 2, 3, 4, 5].map(val => (
                                                <label key={val} className="flex-1 flex flex-col items-center gap-1 cursor-pointer group">
                                                    <input type="radio" name={q.id} value={val} required className="sr-only peer" />
                                                    <div className="w-full py-2 rounded-lg border-2 border-slate-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-gray-50 peer-checked:bg-primary-500 peer-checked:text-white peer-checked:border-primary-500 transition-all">
                                                        {val}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <textarea
                                            name={q.id}
                                            required
                                            rows="3"
                                            className="input-workpay"
                                            placeholder="Type your response here..."
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => { setIsTakeModalOpen(false); setSelectedSurvey(null); }} className="btn-workpay-secondary">Back</button>
                                <button type="submit" className="btn-workpay-primary">Submit Feedback</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {isAnalyticsModalOpen && selectedSurvey && (
                <AnalyticsModal
                    survey={selectedSurvey}
                    onClose={() => { setIsAnalyticsModalOpen(false); setSelectedSurvey(null); }}
                />
            )}
        </div>
    );
};

const AnalyticsModal = ({ survey, onClose }) => {
    const { data: analytics, isLoading } = useGetSurveyAnalyticsQuery(survey.id);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{survey.title} - Analytics</h2>
                        <p className="text-sm text-gray-500">{analytics?.total_responses || 0} Total Responses</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-12"><RefreshCw className="h-8 w-8 text-primary-500 animate-spin" /></div>
                    ) : (
                        survey.questions_config.map(q => {
                            const stats = analytics?.question_stats?.[q.id] || {};
                            const totalResponses = Object.values(stats).reduce((a, b) => a + b, 0);

                            return (
                                <div key={q.id} className="space-y-4">
                                    <h4 className="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                        <HelpCircle className="h-4 w-4 text-primary-500" />
                                        {q.text}
                                    </h4>
                                    {q.type === 'rating' ? (
                                        <div className="grid grid-cols-5 gap-2">
                                            {[1, 2, 3, 4, 5].map(val => {
                                                const count = stats[val] || 0;
                                                const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
                                                return (
                                                    <div key={val} className="text-center">
                                                        <div className="h-24 bg-gray-50/50 rounded-lg relative overflow-hidden flex flex-col justify-end">
                                                            <div
                                                                className="bg-primary-500 w-full transition-all duration-1000"
                                                                style={{ height: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs font-bold mt-2 text-gray-500">{val}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{count} votes</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50/50 p-4 rounded-xl space-y-2 border border-slate-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Open Text Sentiment</p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm italic">Categorized responses and sentiment clusters are generated periodically.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-6 bg-gray-50/50 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-workpay-secondary bg-white dark:bg-gray-900 border-gray-200">Close Window</button>
                    <button className="btn-workpay-primary flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" /> Export CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurveysPage;
