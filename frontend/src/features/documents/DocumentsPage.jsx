import React, { useState, useEffect, useMemo } from 'react';
import {
    useGetFoldersQuery,
    useCreateFolderMutation,
    useUpdateFolderMutation,
    useDeleteFolderMutation,
    useGetDocumentsQuery,
    useCreateDocumentMutation,
    useUpdateDocumentMutation,
    useDeleteDocumentMutation,
    useGetEmployeeDocumentsQuery,
    useCreateEmployeeDocumentMutation,
    useUpdateEmployeeDocumentMutation,
    useDeleteEmployeeDocumentMutation,
    useGetCurrentUserQuery,
    useGetStorageStatsQuery
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
    FileText, Download, Upload, Folder as FolderIcon, Search,
    Filter, Edit, Trash2, File, Image, Video, Archive,
    Plus, Cloud, HardDrive, Share2, Grid, List, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentsPage = () => {
    // 1. Core State
    const [activeTab, setActiveTab] = useState('company');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingFolder, setIsEditingFolder] = useState(false);

    // 2. API Data
    const { data: storage } = useGetStorageStatsQuery(undefined, { pollingInterval: 60000 });
    const { data: foldersData, isLoading: foldersLoading } = useGetFoldersQuery();
    const { data: documentsData, isLoading: docsLoading } = useGetDocumentsQuery(
        currentFolderId ? { folder: currentFolderId } : { root: true }
    );
    const { data: employeeDocumentsData, isLoading: empDocsLoading } = useGetEmployeeDocumentsQuery(
        activeTab === 'personal' ? { my_docs: true } : undefined,
        { skip: activeTab !== 'personal' }
    );

    // 3. Normalization
    const folders = useMemo(() => Array.isArray(foldersData) ? foldersData : (foldersData?.results || []), [foldersData]);
    const documents = useMemo(() => Array.isArray(documentsData) ? documentsData : (documentsData?.results || []), [documentsData]);
    const employeeDocuments = useMemo(() => Array.isArray(employeeDocumentsData) ? employeeDocumentsData : (employeeDocumentsData?.results || []), [employeeDocumentsData]);

    const [createDocument] = useCreateDocumentMutation();
    const [updateDocument] = useUpdateDocumentMutation();
    const [deleteDocument] = useDeleteDocumentMutation();
    const [createEmployeeDocument] = useCreateEmployeeDocumentMutation();
    const [updateEmployeeDocument] = useUpdateEmployeeDocumentMutation();
    const [deleteEmployeeDocument] = useDeleteEmployeeDocumentMutation();
    const [createFolder] = useCreateFolderMutation();
    const [updateFolder] = useUpdateFolderMutation();
    const [deleteFolder] = useDeleteFolderMutation();

    const [uploadForm, setUploadForm] = useState({
        title: '',
        category: 'policy',
        file: null,
        description: '',
        is_public: true,
        expiry_date: '',
        version: '1.0'
    });

    const [folderForm, setFolderForm] = useState({
        id: null,
        name: '',
        parent: null
    });

    const categories = [
        { id: 'policy', name: 'Policies', color: 'text-blue-600 bg-blue-50' },
        { id: 'contract', name: 'Contracts', color: 'text-purple-600 bg-purple-50' },
        { id: 'form', name: 'Forms', color: 'text-orange-600 bg-orange-50' },
        { id: 'other', name: 'Other', color: 'text-gray-600 bg-gray-50' }
    ];

    const getFileIcon = (fileName) => {
        const extension = fileName?.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return FileText;
            case 'jpg':
            case 'jpeg':
            case 'png': return Image;
            case 'mp4': return Video;
            case 'zip': return Archive;
            default: return File;
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            if (activeTab === 'company') formData.append('category', uploadForm.category);
            formData.append('file', uploadForm.file);
            formData.append('description', uploadForm.description || '');
            if (activeTab === 'company') formData.append('is_public', uploadForm.is_public.toString());
            if (uploadForm.expiry_date) formData.append('expiry_date', uploadForm.expiry_date);
            if (uploadForm.version) formData.append('version', uploadForm.version);
            if (activeTab === 'company' && currentFolderId) formData.append('folder', currentFolderId);

            if (activeTab === 'personal') {
                await createEmployeeDocument(formData).unwrap();
            } else {
                await createDocument(formData).unwrap();
            }
            toast.success('Document uploaded successfully.');
            setIsUploadDialogOpen(false);
            setUploadForm({ title: '', category: 'policy', file: null, description: '', is_public: true, expiry_date: '', version: '1.0' });
        } catch (error) {
            toast.error(error?.data?.detail || 'Upload failed.');
        }
    };

    const handleFolderSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditingFolder) {
                await updateFolder({ id: folderForm.id, data: { name: folderForm.name } }).unwrap();
            } else {
                await createFolder({ name: folderForm.name, parent: currentFolderId }).unwrap();
            }
            setIsFolderDialogOpen(false);
            setFolderForm({ id: null, name: '', parent: null });
            toast.success('Folder saved.');
        } catch (error) {
            toast.error('Failed to save folder.');
        }
    };

    const handleDeleteDocument = async (id) => {
        if (window.confirm('Delete this document?')) {
            try {
                if (activeTab === 'personal') await deleteEmployeeDocument(id).unwrap();
                else await deleteDocument(id).unwrap();
                toast.success('Document deleted.');
            } catch (error) {
                toast.error('Delete failed.');
            }
        }
    };

    const filteredDocs = useMemo(() => {
        const source = (activeTab === 'company' ? documents : employeeDocuments);
        return source.filter(doc => {
            const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [activeTab, documents, employeeDocuments, searchTerm, selectedCategory]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Documents</h1>
                    <p className="text-gray-500 mt-2">Centralized file storage and document management.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setIsFolderDialogOpen(true); setIsEditingFolder(false); }} className="rounded-xl h-11 border-gray-200">
                        <Plus className="h-4 w-4 mr-2" /> New Folder
                    </Button>
                    <Button onClick={() => setIsUploadDialogOpen(true)} className="rounded-xl h-11 bg-gray-900 text-white font-medium shadow-lg shadow-slate-900/20">
                        <Upload className="h-4 w-4 mr-2" /> Upload File
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-100 p-1.5 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'company' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Company Files
                </button>
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'personal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Personal Files
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                <div className="space-y-6">
                    {/* Folder Tree */}
                    <Card className="rounded-3xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Folders</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <button
                                onClick={() => setCurrentFolderId(null)}
                                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${!currentFolderId ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <HardDrive className="h-4 w-4" /> Root
                            </button>
                            {folders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => setCurrentFolderId(folder.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${currentFolderId === folder.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FolderIcon className="h-4 w-4 text-primary-500" />
                                    {folder.name}
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Storage Stats */}
                    <Card className="rounded-3xl border border-gray-200 shadow-sm bg-gray-50 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Cloud className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Storage Used</p>
                                <p className="text-xs text-gray-500">{storage?.used_display || '0 B'} of 5GB</p>
                            </div>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${storage?.percentage || 0}%` }} />
                        </div>
                    </Card>
                </div>

                <div className="xl:col-span-3 space-y-6">
                    {/* Search Bar */}
                    <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                placeholder="Search filenames..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-transparent border-none text-sm font-medium focus:ring-0 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 pr-2">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}>
                                <Grid className="h-4 w-4" />
                            </button>
                            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}>
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Files Grid */}
                    {docsLoading ? (
                        <div className="py-20 flex justify-center"><div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-slate-900 rounded-full" /></div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                            <File className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No files found</p>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-2"}>
                            {filteredDocs.map((doc, idx) => (
                                <FileCard
                                    key={doc.id}
                                    doc={doc}
                                    viewMode={viewMode}
                                    onDelete={() => handleDeleteDocument(doc.id)}
                                    icon={getFileIcon(doc.file || doc.title)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="max-w-xl bg-white rounded-3xl p-6">
                    <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-slate-100 mb-6 -mx-6 -mt-6">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-slate-100 shadow-sm">
                            <Upload className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">Upload File</DialogTitle>
                            <p className="text-gray-500 mt-1 font-medium text-sm">Add a new document to the registry.</p>
                        </div>
                    </div>
                    <form onSubmit={handleUpload} className="space-y-4 pt-4">
                        <Input
                            placeholder="File Title"
                            value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                            className="bg-white"
                        />
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} />
                            <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-600">{uploadForm.file ? uploadForm.file.name : 'Click to select file'}</p>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-gray-900 text-white">Upload</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Folder Dialog */}
            <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                <DialogContent className="max-w-md bg-white rounded-3xl p-6">
                    <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-slate-100 mb-6 -mx-6 -mt-6">
                        <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                            <FolderIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">New Folder</DialogTitle>
                            <p className="text-gray-500 mt-1 font-medium text-sm">Create a new container for your files.</p>
                        </div>
                    </div>
                    <form onSubmit={handleFolderSubmit} className="space-y-4 pt-4">
                        <Input
                            placeholder="Folder Name"
                            value={folderForm.name} onChange={e => setFolderForm({ ...folderForm, name: e.target.value })}
                            className="bg-white"
                        />
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsFolderDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-gray-900 text-white">Create</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const FileCard = ({ doc, viewMode, onDelete, icon: Icon }) => {
    return (
        <div className={`group bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all rounded-2xl ${viewMode === 'grid' ? 'p-6 flex flex-col gap-4' : 'p-4 flex items-center justify-between'}`}>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{doc.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'mt-auto justify-end' : ''}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-primary-600" onClick={() => window.open(getMediaUrl(doc.file))}>
                    <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-red-600" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default DocumentsPage;
