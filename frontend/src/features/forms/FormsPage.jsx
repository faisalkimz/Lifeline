import React, { useState } from 'react';
import {
    FileText, Plus, ClipboardList, CheckCircle2, XCircle,
    Clock, Send, Eye, ShieldCheck, ListTodo, Search, RefreshCw,
    Edit, Trash2, MoreVertical
} from 'lucide-react';
import {
    useGetFormTemplatesQuery,
    useCreateFormTemplateMutation,
    useGetFormSubmissionsQuery,
    useCreateFormSubmissionMutation,
    useReviewFormSubmissionMutation,
    useUpdateFormTemplateMutation,
    useDeleteFormTemplateMutation
} from '../../store/api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import toast from 'react-hot-toast';

const FormsPage = () => {
    const user = useSelector(selectCurrentUser);
    const isAdmin = ['super_admin', 'company_admin', 'admin', 'manager', 'hr_manager'].includes(user?.role);
    const [activeTab, setActiveTab] = useState('templates');
    const [searchTerm, setSearchTerm] = useState('');

    // Queries
    const { data: templatesData, isLoading: templatesLoading } = useGetFormTemplatesQuery();
    const { data: submissionsData, isLoading: submissionsLoading } = useGetFormSubmissionsQuery();

    const templatesList = templatesData?.results || templatesData || [];
    const submissionsList = submissionsData?.results || submissionsData || [];

    // Modal States
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [reviewStatus, setReviewStatus] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Visual Field Builder State
    const [formFields, setFormFields] = useState([
        { id: Date.now(), name: 'field_1', label: 'Reason for request', type: 'text', required: true }
    ]);

    const addField = () => {
        setFormFields([...formFields, {
            id: Date.now(),
            name: `field_${formFields.length + 1}`,
            label: '',
            type: 'text',
            required: false
        }]);
    };

    const removeField = (id) => {
        if (formFields.length > 1) {
            setFormFields(formFields.filter(f => f.id !== id));
        }
    };

    const updateField = (id, key, value) => {
        setFormFields(formFields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    // Mutations
    const [createTemplate] = useCreateFormTemplateMutation();
    const [updateTemplate] = useUpdateFormTemplateMutation();
    const [deleteTemplate] = useDeleteFormTemplateMutation();
    const [createSubmission] = useCreateFormSubmissionMutation();
    const [reviewSubmission] = useReviewFormSubmissionMutation();

    const filteredTemplates = templatesList.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSubmissions = submissionsList.filter(s =>
        s.template_details?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employee_details?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employee_details?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            fields_config: formFields.map(({ id, ...rest }) => rest)
        };

        try {
            if (isEditing) {
                await updateTemplate({ id: editId, ...data }).unwrap();
                toast.success('Form Template updated!');
            } else {
                await createTemplate(data).unwrap();
                toast.success('Form Template created!');
            }
            closeTemplateModal();
        } catch (err) {
            toast.error(isEditing ? 'Failed to update template' : 'Failed to create template');
        }
    };

    const handleDeleteTemplate = async (id) => {
        if (!window.confirm('Are you sure you want to delete this form template?')) return;
        try {
            await deleteTemplate(id).unwrap();
            toast.success('Template deleted');
        } catch (err) {
            toast.error('Failed to delete template');
        }
    };

    const openEditModal = (template) => {
        setIsEditing(true);
        setEditId(template.id);
        setFormFields(template.fields_config.map((f, i) => ({ ...f, id: Date.now() + i })));
        setIsTemplateModalOpen(true);
    };

    const closeTemplateModal = () => {
        setIsTemplateModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setFormFields([{ id: Date.now(), name: 'field_1', label: 'Reason for request', type: 'text', required: true }]);
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const submissionData = Object.fromEntries(formData.entries());

        try {
            await createSubmission({
                template: selectedTemplate.id,
                submission_data: submissionData
            }).unwrap();
            toast.success('Form submitted successfully!');
            setIsSubmitModalOpen(false);
            setSelectedTemplate(null);
        } catch (err) {
            toast.error('Failed to submit form');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await reviewSubmission({
                id: selectedSubmission.id,
                status: reviewStatus,
                review_notes: formData.get('review_notes')
            }).unwrap();
            toast.success('Submission reviewed');
            setIsReviewModalOpen(false);
            setSelectedSubmission(null);
            setReviewStatus('');
        } catch (err) {
            toast.error('Failed to review submission');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Digital Forms & Checklists</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage internal requests and compliance forms</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { setIsEditing(false); setIsTemplateModalOpen(true); }}
                        className="btn-workpay-primary flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create Form
                    </button>
                )}
            </div>

            {/* Main Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'templates' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            Available Forms
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'submissions' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            Submissions
                        </button>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search forms..."
                            className="pl-10 input-workpay"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Templates Tab */}
                {activeTab === 'templates' && (
                    <div className="p-6">
                        {templatesLoading ? (
                            <div className="flex justify-center py-12">
                                <RefreshCw className="h-8 w-8 text-primary-500 animate-spin" />
                            </div>
                        ) : filteredTemplates.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No form templates found matching your search.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTemplates.map(template => (
                                    <div key={template.id} className="card-workpay p-5 flex flex-col justify-between hover:ring-2 hover:ring-primary-500 transition-all group">
                                        <div>
                                            <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{template.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                {template.description || 'No description provided.'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-6">
                                            <button
                                                onClick={() => { setSelectedTemplate(template); setIsSubmitModalOpen(true); }}
                                                className="flex-1 btn-workpay-secondary flex items-center justify-center gap-2 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all font-bold"
                                            >
                                                <Send className="h-4 w-4" />
                                                Submit
                                            </button>
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => openEditModal(template)}
                                                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary-600 hover:border-primary-600 transition-all"
                                                        title="Edit Template"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTemplate(template.id)}
                                                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"
                                                        title="Delete Template"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                    <div className="overflow-x-auto">
                        <table className="table-workpay">
                            <thead>
                                <tr>
                                    <th>Form Name</th>
                                    <th>Employee</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissionsLoading ? (
                                    <tr><td colSpan="5" className="text-center py-12">
                                        <RefreshCw className="h-8 w-8 text-primary-500 animate-spin mx-auto" />
                                    </td></tr>
                                ) : filteredSubmissions.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-12 text-slate-500">
                                        No submissions found.
                                    </td></tr>
                                ) : (filteredSubmissions.map(sub => (
                                    <tr key={sub.id} className="group">
                                        <td>
                                            <p className="font-medium text-slate-900 dark:text-white">{sub.template_details?.name}</p>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {sub.employee_details?.first_name[0]}{sub.employee_details?.last_name[0]}
                                                </div>
                                                <span className="text-sm font-medium">{sub.employee_details?.first_name} {sub.employee_details?.last_name}</span>
                                            </div>
                                        </td>
                                        <td className="text-sm text-slate-500">
                                            {new Date(sub.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </td>
                                        <td>
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => { setSelectedSubmission(sub); setIsReviewModalOpen(true); }}
                                                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Template Modal */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit Form Template' : 'Create New Form Template'}</h2>
                            <button onClick={closeTemplateModal} className="text-slate-400 hover:text-slate-600"><XCircle className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleCreateTemplate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Form Name *</label>
                                <input name="name" required defaultValue={isEditing ? templatesList.find(t => t.id === editId)?.name : ''} className="input-workpay" placeholder="e.g. Equipment Request" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Description</label>
                                <textarea name="description" rows="2" defaultValue={isEditing ? templatesList.find(t => t.id === editId)?.description : ''} className="input-workpay" placeholder="Add a brief description..." />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Form Fields</label>
                                    <button
                                        type="button"
                                        onClick={addField}
                                        className="text-[11px] bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-3 py-1.5 rounded-lg border border-primary-200 dark:border-primary-800 font-black uppercase hover:bg-primary-600 hover:text-white transition-all"
                                    >
                                        + Add Field
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formFields.map((field, index) => (
                                        <div key={field.id} className="p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Field #{index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeField(field.id)}
                                                    className="text-slate-400 hover:text-red-500 p-1"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="col-span-2">
                                                    <input
                                                        value={field.label}
                                                        onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                                        className="input-workpay text-sm"
                                                        placeholder="Field Label (e.g. Item Name)"
                                                        required
                                                    />
                                                </div>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateField(field.id, 'type', e.target.value)}
                                                    className="input-workpay text-sm"
                                                >
                                                    <option value="text">Short Text</option>
                                                    <option value="textarea">Long Text</option>
                                                    <option value="number">Number</option>
                                                    <option value="date">Date</option>
                                                    <option value="select">Dropdown</option>
                                                </select>
                                                <div className="flex items-center gap-2 px-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                                                        className="h-4 w-4 rounded text-primary-600"
                                                        id={`req-${field.id}`}
                                                    />
                                                    <label htmlFor={`req-${field.id}`} className="text-xs font-semibold text-slate-500">Required</label>
                                                </div>
                                            </div>
                                            {field.type === 'select' && (
                                                <input
                                                    placeholder="Options (comma separated)"
                                                    className="input-workpay text-xs italic"
                                                    onChange={(e) => updateField(field.id, 'options', e.target.value.split(',').map(o => o.trim()))}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-4">
                                <button type="button" onClick={closeTemplateModal} className="btn-workpay-secondary">Cancel</button>
                                <button type="submit" className="btn-workpay-primary">{isEditing ? 'Update Template' : 'Save Template'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submit Form Modal */}
            {isSubmitModalOpen && selectedTemplate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 bg-primary-600">
                            <h2 className="text-xl font-bold text-white">{selectedTemplate.name}</h2>
                            <p className="text-primary-100 text-sm mt-1 opacity-90">{selectedTemplate.description || 'Fill in the details below.'}</p>
                        </div>
                        <form onSubmit={handleSubmitForm} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            {selectedTemplate.fields_config.map(field => (
                                <div key={field.name}>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.type === 'select' ? (
                                        <select name={field.name} required={field.required} className="input-workpay">
                                            <option value="">Select an option</option>
                                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            required={field.required}
                                            rows="3"
                                            className="input-workpay"
                                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            required={field.required}
                                            className="input-workpay"
                                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => { setIsSubmitModalOpen(false); setSelectedTemplate(null); }} className="btn-workpay-secondary">Back</button>
                                <button type="submit" className="btn-workpay-primary">Submit Form</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {isReviewModalOpen && selectedSubmission && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedSubmission.template_details?.name}</h2>
                                <p className="text-sm text-slate-500">By {selectedSubmission.employee_details?.first_name} {selectedSubmission.employee_details?.last_name}</p>
                            </div>
                            <StatusBadge status={selectedSubmission.status} />
                        </div>

                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 gap-4">
                                {Object.entries(selectedSubmission.submission_data).map(([key, val]) => (
                                    <div key={key} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5">{key.replace('_', ' ')}</p>
                                        <p className="text-slate-900 dark:text-white font-semibold text-lg">{val}</p>
                                    </div>
                                ))}
                            </div>

                            {selectedSubmission.review_notes && (
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-orange-600 mb-1">Review Notes</p>
                                    <p className="text-orange-900 dark:text-orange-100 text-sm italic">"{selectedSubmission.review_notes}"</p>
                                </div>
                            )}

                            {isAdmin && selectedSubmission.status === 'pending' && (
                                <form onSubmit={handleReviewSubmit} className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-5">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-primary-500" />
                                            Admin Final Review
                                        </label>
                                        <textarea
                                            name="review_notes"
                                            rows="2"
                                            placeholder="Add approval or rejection comments..."
                                            className="input-workpay bg-white dark:bg-slate-950"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="submit"
                                            onClick={() => setReviewStatus('approved')}
                                            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                            Approve
                                        </button>
                                        <button
                                            type="submit"
                                            onClick={() => setReviewStatus('rejected')}
                                            className="px-6 py-3 rounded-xl bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="h-5 w-5" />
                                            Reject
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                            <button type="button" onClick={() => { setIsReviewModalOpen(false); setSelectedSubmission(null); }} className="btn-workpay-secondary bg-white dark:bg-slate-900">Close Window</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50',
        approved: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
        rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
        completed: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
            {status}
        </span>
    );
};

export default FormsPage;
