import React, { useState, useEffect } from 'react';
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
    useGetCurrentUserQuery
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
    FileText, Download, Upload, Folder as FolderIcon, Search, Filter,
    Eye, Edit, Trash2, History, User, Building, Calendar,
    File, Image, Video, Archive, Plus, X, CheckCircle, ChevronRight, MoreVertical,
    FolderPlus, ArrowLeft, Info, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../config/api';

const DocumentsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

    const { data: user } = useGetCurrentUserQuery();
    const { data: foldersData = [], isLoading: foldersLoading } = useGetFoldersQuery();
    const { data: documentsData = [], isLoading: docsLoading } = useGetDocumentsQuery(
        currentFolderId ? { folder: currentFolderId } : { root: true }
    );
    const { data: employeeDocumentsData = [], isLoading: empDocsLoading } = useGetEmployeeDocumentsQuery();

    const [createDocument] = useCreateDocumentMutation();
    const [updateDocument] = useUpdateDocumentMutation();
    const [deleteDocument] = useDeleteDocumentMutation();
    const [createEmployeeDocument] = useCreateEmployeeDocumentMutation();
    const [updateEmployeeDocument] = useUpdateEmployeeDocumentMutation();
    const [deleteEmployeeDocument] = useDeleteEmployeeDocumentMutation();
    const [createFolder] = useCreateFolderMutation();
    const [updateFolder] = useUpdateFolderMutation();
    const [deleteFolder] = useDeleteFolderMutation();

    // Data extraction
    const folders = Array.isArray(foldersData) ? foldersData : (foldersData?.results || []);
    const documents = Array.isArray(documentsData) ? documentsData : (documentsData?.results || []);
    const employeeDocuments = Array.isArray(employeeDocumentsData) ? employeeDocumentsData : (employeeDocumentsData?.results || []);

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

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingFolder, setIsEditingFolder] = useState(false);
    const [activeTab, setActiveTab] = useState('company');

    const categories = [
        { id: 'policy', name: 'Company Policies', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'hr', name: 'HR Documents', icon: User, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'legal', name: 'Legal Documents', icon: Building, color: 'text-red-600', bg: 'bg-red-50' },
        { id: 'training', name: 'Training Materials', icon: File, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'forms', name: 'Forms & Templates', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' }
    ];

    const getFileIcon = (fileName) => {
        const extension = fileName?.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return FileText;
            case 'doc':
            case 'docx': return FileText;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return Image;
            case 'mp4':
            case 'avi':
            case 'mov': return Video;
            case 'zip':
            case 'rar': return Archive;
            default: return File;
        }
    };

    const getFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
            toast.success('Document uploaded successfully!');
            setIsUploadDialogOpen(false);
            setUploadForm({ title: '', category: 'policy', file: null, description: '', is_public: true, expiry_date: '', version: '1.0' });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload document.');
        }
    };

    const handleFolderSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditingFolder) {
                await updateFolder({
                    id: folderForm.id,
                    data: { name: folderForm.name, parent: folderForm.parent }
                }).unwrap();
                toast.success('Folder updated successfully!');
            } else {
                await createFolder({
                    name: folderForm.name,
                    parent: currentFolderId
                }).unwrap();
                toast.success('Folder created successfully!');
            }
            setIsFolderDialogOpen(false);
            setFolderForm({ id: null, name: '', parent: null });
            setIsEditingFolder(false);
        } catch (error) {
            toast.error(isEditingFolder ? 'Failed to update folder.' : 'Failed to create folder.');
        }
    };

    const handleEditFolder = (folder, e) => {
        e.stopPropagation();
        setFolderForm({
            id: folder.id,
            name: folder.name,
            parent: folder.parent
        });
        setIsEditingFolder(true);
        setIsFolderDialogOpen(true);
    };

    const handleDeleteFolder = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Delete this folder and all its contents?')) {
            try {
                await deleteFolder(id).unwrap();
                toast.success('Folder deleted.');
                if (currentFolderId === id) setCurrentFolderId(null);
            } catch (error) {
                toast.error('Failed to delete folder.');
            }
        }
    };

    const handleDeleteDocument = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                if (activeTab === 'personal') {
                    await deleteEmployeeDocument(id).unwrap();
                } else {
                    await deleteDocument(id).unwrap();
                }
                toast.success('Document deleted.');
                if (selectedDocument?.id === id) setIsViewerOpen(false);
            } catch (error) {
                toast.error('Failed to delete document.');
            }
        }
    };

    const handleEditDocument = (doc, e) => {
        if (e) e.stopPropagation();
        setUploadForm({
            id: doc.id,
            title: doc.title,
            category: doc.category,
            description: doc.description || '',
            is_public: doc.is_public,
            expiry_date: doc.expiry_date || '',
            version: doc.version || '1.0'
        });
        setIsEditing(true);
        setIsUploadDialogOpen(true);
    };

    const handleUpdateDocument = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            if (activeTab === 'company') formData.append('category', uploadForm.category);
            formData.append('description', uploadForm.description || '');
            if (activeTab === 'company') formData.append('is_public', uploadForm.is_public.toString());
            if (uploadForm.expiry_date) formData.append('expiry_date', uploadForm.expiry_date);
            if (uploadForm.version) formData.append('version', uploadForm.version);

            if (activeTab === 'personal') {
                await updateEmployeeDocument({ id: uploadForm.id, data: formData }).unwrap();
            } else {
                await updateDocument({ id: uploadForm.id, data: formData }).unwrap();
            }
            toast.success('Document updated successfully!');
            setIsUploadDialogOpen(false);
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update document.');
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredEmployeeDocuments = employeeDocuments.filter(doc => {
        const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const Breadcrumbs = () => {
        const currentFolder = folders.find(f => f.id === currentFolderId);
        return (
            <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                <button
                    onClick={() => setCurrentFolderId(null)}
                    className={`hover:text-primary-600 transition-colors ${!currentFolderId ? 'font-bold text-primary-600' : ''}`}
                >
                    Documents
                </button>
                {currentFolder && (
                    <>
                        <ChevronRight className="h-4 w-4" />
                        <span className="font-bold text-primary-600">{currentFolder.name}</span>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Document Library</h1>
                    <p className="text-text-secondary mt-1">Organize and access your company and personal documents</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="bg-neutral-100 p-1 rounded-xl">
                            <TabsTrigger value="company" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Building className="h-4 w-4 mr-2" />
                                Library
                            </TabsTrigger>
                            <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <User className="h-4 w-4 mr-2" />
                                My Files
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button variant="outline" onClick={() => { setIsEditingFolder(false); setFolderForm({ name: '', id: null }); setIsFolderDialogOpen(true); }} className="flex-1 sm:flex-none">
                        <FolderPlus className="h-4 w-4 mr-2" />
                        New Folder
                    </Button>
                    <Button onClick={() => { setIsEditing(false); setUploadForm({ title: '', category: 'policy', file: null, description: '', is_public: true, expiry_date: '', version: '1.0' }); setIsUploadDialogOpen(true); }} className="flex-1 sm:flex-none">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar - Folder Navigation */}
                <aside className="lg:col-span-3 space-y-4">
                    {activeTab === 'company' ? (
                        <>
                            <Card className="overflow-hidden border-none shadow-premium">
                                <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 py-4">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <FolderIcon className="h-4 w-4 text-primary-600" />
                                        Folders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                    <nav className="space-y-1">
                                        <button
                                            onClick={() => setCurrentFolderId(null)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${!currentFolderId ? 'bg-primary-50 text-primary-700 font-medium' : 'text-text-secondary hover:bg-neutral-50'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4" />
                                                Root Directory
                                            </div>
                                        </button>

                                        {foldersLoading ? (
                                            <div className="p-4 text-center text-xs text-text-tertiary">Loading folders...</div>
                                        ) : folders.map(folder => (
                                            <button
                                                key={folder.id}
                                                onClick={() => setCurrentFolderId(folder.id)}
                                                className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${currentFolderId === folder.id ? 'bg-primary-50 text-primary-700 font-medium border-l-4 border-primary-600' : 'text-text-secondary hover:bg-neutral-50'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FolderIcon className={`h-4 w-4 ${currentFolderId === folder.id ? 'text-primary-600' : 'text-neutral-400'}`} />
                                                    <span className="truncate">{folder.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Badge variant="secondary" size="xs">{folder.document_count || 0}</Badge>
                                                    <Edit
                                                        className="h-3 w-3 text-neutral-400 hover:text-primary-600"
                                                        onClick={(e) => handleEditFolder(folder, e)}
                                                    />
                                                    <Trash2
                                                        className="h-3 w-3 text-error-400 hover:text-error-600"
                                                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                                                    />
                                                </div>
                                            </button>
                                        ))}
                                    </nav>

                                    <div className="mt-6 pt-4 border-t border-neutral-100 px-3">
                                        <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-3">Categories</h4>
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => setSelectedCategory('all')}
                                                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${selectedCategory === 'all' ? 'bg-neutral-100 text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                                            >
                                                All Documents
                                            </button>
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${selectedCategory === cat.id ? 'bg-neutral-100 text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card className="overflow-hidden border-none shadow-premium">
                            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 py-4">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary-600" />
                                    Personal Files
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="p-4 bg-primary-50 rounded-xl text-center">
                                    <FileText className="h-8 w-8 text-primary-400 mx-auto mb-2" />
                                    <p className="text-xs text-primary-700 font-medium">My Private Documents</p>
                                    <p className="text-[10px] text-primary-600 opacity-70 mt-1">Only visible to you and your HR manager.</p>
                                </div>
                                <div className="space-y-1">
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-text-secondary hover:text-primary-600 hover:bg-primary-50">
                                        <History className="h-3 w-3 mr-2" /> Recent Uploads
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-text-secondary hover:text-primary-600 hover:bg-primary-50">
                                        <CheckCircle className="h-3 w-3 mr-2" /> Verified Docs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Info className="h-5 w-5 text-white" />
                                </div>
                                <p className="text-xs font-medium opacity-90">Storage Status</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] opacity-80">
                                    <span>Used: 1.2 GB</span>
                                    <span>Limit: 5 GB</span>
                                </div>
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[24%]" />
                                </div>
                                <p className="text-[10px] opacity-70 italic">Beta storage limit</p>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content Area */}
                <main className="lg:col-span-9 space-y-6">
                    <Tabs defaultValue="grid" onValueChange={setViewMode} className="w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <Breadcrumbs />
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                                    <Input
                                        placeholder="Search files..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 h-9 w-64 bg-white shadow-soft text-sm"
                                    />
                                </div>
                                <TabsList className="h-9">
                                    <TabsTrigger value="grid" className="px-3" title="Grid View">
                                        <FolderIcon className="h-4 w-4" />
                                    </TabsTrigger>
                                    <TabsTrigger value="table" className="px-3" title="List View">
                                        <Filter className="h-4 w-4" />
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        {docsLoading || empDocsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-premium border border-neutral-100">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
                                <p className="text-text-secondary font-medium">Scanning directory...</p>
                            </div>
                        ) : (activeTab === 'company' ? filteredDocuments : filteredEmployeeDocuments).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-premium border border-neutral-100 text-center px-6">
                                <div className="p-6 bg-neutral-50 rounded-full mb-6">
                                    <Archive className="h-12 w-12 text-neutral-300" />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">Empty Directory</h3>
                                <p className="text-text-secondary max-w-sm mb-8">
                                    Manage your files by uploading new documents {activeTab === 'company' && 'or creating folders'} to stay organized.
                                </p>
                                <Button onClick={() => { setIsEditing(false); setIsUploadDialogOpen(true); }} className="rounded-xl px-8 py-6 shadow-lg shadow-primary-500/20">
                                    <Upload className="h-5 w-5 mr-3" />
                                    Start Uploading
                                </Button>
                            </div>
                        ) : (
                            <TabsContent value="grid" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {(activeTab === 'company' ? filteredDocuments : filteredEmployeeDocuments).map(doc => {
                                        const FileIcon = getFileIcon(doc.file);
                                        const category = categories.find(c => c.id === doc.category) || categories[0];
                                        return (
                                            <Card
                                                key={doc.id}
                                                className="group border border-neutral-100 hover:border-primary-200 hover:shadow-premium transition-all duration-300 cursor-pointer overflow-hidden"
                                                onClick={() => { setSelectedDocument(doc); setIsViewerOpen(true); }}
                                            >
                                                <div className={`h-2 shadow-inner ${category.bg.replace('50', '500')}`} />
                                                <CardContent className="p-5">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={`p-3 ${category.bg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                                            <FileIcon className={`h-7 w-7 ${category.color}`} />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => { e.stopPropagation(); window.open(getMediaUrl(doc.file)); }}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => handleEditDocument(doc, e)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-error-500 hover:text-error-600 hover:bg-error-50"
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <h3 className="font-bold text-text-primary text-base truncate mb-1 group-hover:text-primary-700 transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-xs text-text-secondary line-clamp-2 min-h-[2rem] mb-4 opacity-80">
                                                        {doc.description || 'No additional details provided.'}
                                                    </p>

                                                    <div className="pt-4 border-t border-neutral-50 flex items-center justify-between text-[10px] text-text-tertiary font-medium">
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex items-center gap-1 capitalize">
                                                                <Badge variant="outline" size="xs" className="px-1">{doc.category}</Badge>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                v{doc.version || '1.0'}
                                                            </span>
                                                        </div>
                                                        <span className="opacity-60">{new Date(doc.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        )}

                        <TabsContent value="table" className="mt-0">
                            <Card className="border-none shadow-premium overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-neutral-50 border-b border-neutral-100">
                                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Version</th>
                                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Updated</th>
                                                <th className="px-3 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right pr-6">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {(activeTab === 'company' ? filteredDocuments : filteredEmployeeDocuments).map(doc => {
                                                const FileIcon = getFileIcon(doc.file);
                                                return (
                                                    <tr
                                                        key={doc.id}
                                                        className="hover:bg-primary-50/30 transition-colors cursor-pointer group"
                                                        onClick={() => { setSelectedDocument(doc); setIsViewerOpen(true); }}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-white transition-colors">
                                                                    <FileIcon className="h-5 w-5 text-text-secondary" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-text-primary">{doc.title}</div>
                                                                    <div className="text-[10px] text-text-tertiary">Modified just now</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant="secondary" size="xs" className="capitalize">{doc.category || 'personal'}</Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-text-secondary">v{doc.version || '1.0'}</td>
                                                        <td className="px-6 py-4 text-sm text-text-secondary">{new Date(doc.created_at).toLocaleDateString()}</td>
                                                        <td className="px-3 py-4 text-right pr-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); window.open(getMediaUrl(doc.file)); }}>
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleEditDocument(doc, e)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-error-500 hover:text-error-600" onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* Folder Dialog */}
            <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditingFolder ? 'Update Folder' : 'Create New Folder'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFolderSubmit} className="space-y-4 pt-4">
                        <Input
                            label="Folder Name"
                            placeholder="e.g. Legal Documents 2024"
                            value={folderForm.name}
                            onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                            required
                            autoFocus
                        />
                        <div className="bg-neutral-50 p-4 rounded-xl flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-warning-500 mt-0.5" />
                            <p className="text-xs text-text-secondary">
                                Folders help you organize company-wide documents. Subfolders will be created inside the current viewed directory.
                            </p>
                        </div>
                        <DialogFooter className="pt-4 border-t border-neutral-100">
                            <Button type="button" variant="outline" onClick={() => setIsFolderDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={!folderForm.name}>Create Folder</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary-600" />
                            {isEditing ? 'Update Document' : `Upload to ${currentFolderId ? folders.find(f => f.id === currentFolderId)?.name : 'Root Directory'}`}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={isEditing ? handleUpdateDocument : handleUpload} className="space-y-5 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Input
                                    label="Document Title"
                                    placeholder="Enter descriptive title"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            {activeTab === 'company' && (
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Category</label>
                                    <select
                                        className="w-full h-11 px-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={uploadForm.category}
                                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                                    >
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className={activeTab === 'company' ? '' : 'col-span-2'}>
                                <Input
                                    label="Version"
                                    value={uploadForm.version}
                                    onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">File Upload</label>
                            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50 hover:bg-neutral-100 hover:border-primary-400 cursor-pointer transition-all duration-300">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <CloudUploadIcon className="h-10 w-10 text-neutral-400 mb-2" />
                                    <p className="text-sm text-text-secondary">
                                        {uploadForm.file ? (
                                            <span className="font-bold text-primary-600">{uploadForm.file.name}</span>
                                        ) : (
                                            <>Click to upload or <span className="font-bold">drag and drop</span></>
                                        )}
                                    </p>
                                    <p className="text-[10px] text-text-tertiary mt-1">PDF, DOCX, PNG OR JPG (Max. 10MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                    required
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Expiry Date"
                                type="date"
                                value={uploadForm.expiry_date}
                                onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })}
                            />
                            {activeTab === 'company' && (
                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="is_public"
                                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                        checked={uploadForm.is_public}
                                        onChange={(e) => setUploadForm({ ...uploadForm, is_public: e.target.checked })}
                                    />
                                    <label htmlFor="is_public" className="text-sm font-medium text-text-secondary">Make public to all employees</label>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-6 border-t border-neutral-100">
                            <Button type="button" variant="outline" className="rounded-xl px-6" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-xl px-8 shadow-lg shadow-primary-500/20" disabled={!uploadForm.file || !uploadForm.title}>
                                Upload Securely
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Document Viewer Modal */}
            <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                    {selectedDocument && (
                        <>
                            <DialogHeader className="p-6 border-b border-neutral-100 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary-100 rounded-lg">
                                            {React.createElement(getFileIcon(selectedDocument.file), { className: "h-6 w-6 text-primary-600" })}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl font-bold">{selectedDocument.title}</DialogTitle>
                                            <div className="flex items-center gap-3 text-xs text-text-tertiary mt-1">
                                                <span className="flex items-center gap-1 uppercase tracking-tighter"><Badge variant="outline" size="xs">{selectedDocument.category}</Badge></span>
                                                <span>•</span>
                                                <span>Added {new Date(selectedDocument.created_at).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>v{selectedDocument.version || '1.0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={() => window.open(getMediaUrl(selectedDocument.file))}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={(e) => { setIsViewerOpen(false); handleEditDocument(selectedDocument, e); }}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/30">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="aspect-[4/5] bg-neutral-100 rounded-2xl flex items-center justify-center border border-neutral-200">
                                            <div className="text-center space-y-4 px-8">
                                                <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-neutral-100">
                                                    {React.createElement(getFileIcon(selectedDocument.file), { className: "h-10 w-10 text-neutral-300" })}
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="font-bold text-text-primary">Preview Not Available</p>
                                                    <p className="text-sm text-text-secondary">
                                                        Direct in-browser preview is restricted for security. Please download the file to view its full contents.
                                                    </p>
                                                </div>
                                                <Button className="rounded-xl px-10 shadow-lg shadow-primary-500/10" onClick={() => window.open(getMediaUrl(selectedDocument.file))}>
                                                    <Download className="h-4 w-4 mr-3" />
                                                    Download Now
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <section className="bg-white p-5 rounded-2xl shadow-premium border border-neutral-100">
                                            <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                                                <Info className="h-4 w-4 text-primary-500" />
                                                File Metdata
                                            </h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Description</p>
                                                    <p className="text-sm text-text-secondary leading-relaxed">
                                                        {selectedDocument.description || 'No description provided for this internal document.'}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Status</p>
                                                        <Badge variant={selectedDocument.is_archived ? 'secondary' : 'success'} size="xs">
                                                            {selectedDocument.is_archived ? 'Archived' : 'Active'}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Visibility</p>
                                                        <Badge variant={selectedDocument.is_public ? 'primary' : 'outline'} size="xs">
                                                            {selectedDocument.is_public ? 'Public' : 'Confidential'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Expiry Date</p>
                                                    <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                                        <Calendar className="h-4 w-4 text-neutral-400" />
                                                        {selectedDocument.expiry_date ? new Date(selectedDocument.expiry_date).toLocaleDateString() : 'No expiry set'}
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-neutral-50">
                                                    <p className="text-[10px] font-bold text-text-tertiary uppercase mb-2">Uploaded By</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-neutral-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                                                            {selectedDocument.uploaded_by_name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div className="text-xs">
                                                            <p className="font-bold text-text-primary">{selectedDocument.uploaded_by_name || 'System Administrator'}</p>
                                                            <p className="text-text-tertiary">Management Team</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="bg-white p-5 rounded-2xl border border-neutral-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                                    <History className="h-4 w-4 text-warning-500" />
                                                    History
                                                </h4>
                                                <Badge variant="secondary" size="xs">Read Only</Badge>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="pl-4 border-l-2 border-primary-100 space-y-1 relative">
                                                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary-500" />
                                                    <p className="text-xs font-bold text-text-primary">Initial Upload</p>
                                                    <p className="text-[10px] text-text-tertiary">{new Date(selectedDocument.created_at).toLocaleDateString()} • v1.0</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Helper component for cloud upload icon
const CloudUploadIcon = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M12 12v9" />
        <path d="m16 16-4-4-4 4" />
    </svg>
);

export default DocumentsPage;
