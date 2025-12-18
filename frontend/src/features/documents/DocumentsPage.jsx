import React, { useState } from 'react';
import {
    useGetDocumentsQuery,
    useCreateDocumentMutation,
    useGetEmployeeDocumentsQuery,
    useCreateEmployeeDocumentMutation,
    useGetCurrentUserQuery
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
    FileText, Download, Upload, Folder, Search, Filter,
    Eye, Edit, Trash2, History, User, Building, Calendar,
    File, Image, Video, Archive, Plus, X, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const DocumentsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const { data: user } = useGetCurrentUserQuery();
    const { data: documents = [], isLoading: docsLoading } = useGetDocumentsQuery();
    const { data: employeeDocuments = [], isLoading: empDocsLoading } = useGetEmployeeDocumentsQuery();
    const [createDocument] = useCreateDocumentMutation();
    const [createEmployeeDocument] = useCreateEmployeeDocumentMutation();

    const [uploadForm, setUploadForm] = useState({
        title: '',
        category: 'policy',
        file: null,
        description: '',
        is_public: true
    });

    const categories = [
        { id: 'policy', name: 'Company Policies', icon: FileText, color: 'text-blue-600' },
        { id: 'hr', name: 'HR Documents', icon: User, color: 'text-green-600' },
        { id: 'legal', name: 'Legal Documents', icon: Building, color: 'text-red-600' },
        { id: 'training', name: 'Training Materials', icon: File, color: 'text-purple-600' },
        { id: 'forms', name: 'Forms & Templates', icon: FileText, color: 'text-orange-600' }
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
            formData.append('category', uploadForm.category);
            formData.append('file', uploadForm.file);
            formData.append('description', uploadForm.description || '');
            formData.append('is_public', uploadForm.is_public.toString());

            await createDocument(formData).unwrap();
            toast.success('Document uploaded successfully!');
            setIsUploadDialogOpen(false);
            setUploadForm({ title: '', category: 'policy', file: null, description: '', is_public: true });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload document. Please try again.');
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredEmployeeDocuments = employeeDocuments.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleViewDocument = (document) => {
        setSelectedDocument(document);
        setIsViewerOpen(true);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Document Management</h1>
                    <p className="text-text-secondary mt-1">Manage company documents and personal files</p>
                </div>
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Total Documents</p>
                                <p className="text-2xl font-bold text-text-primary">{documents.length}</p>
                            </div>
                            <FileText className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Personal Files</p>
                                <p className="text-2xl font-bold text-text-primary">{employeeDocuments.length}</p>
                            </div>
                            <User className="h-8 w-8 text-success-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Categories</p>
                                <p className="text-2xl font-bold text-text-primary">{categories.length}</p>
                            </div>
                            <Folder className="h-8 w-8 text-warning-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Recent Uploads</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {documents.filter(doc => {
                                        const uploadDate = new Date(doc.created_at);
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return uploadDate > weekAgo;
                                    }).length}
                                </p>
                            </div>
                            <Upload className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Document Library */}
            <Tabs defaultValue="company" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="company">Company Documents</TabsTrigger>
                    <TabsTrigger value="personal">My Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="space-y-6">
                    {/* Search and Filters */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="sm:w-48">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full h-11 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Grid */}
                    {docsLoading ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
                                    <p className="text-text-secondary font-medium">Loading documents...</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : filteredDocuments.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <FileText className="h-16 w-16 text-neutral-400" />
                                    <div className="text-center">
                                        <p className="text-text-primary font-semibold text-lg">No documents found</p>
                                        <p className="text-text-secondary">Try adjusting your search or upload new documents.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDocuments.map((doc) => {
                                const FileIcon = getFileIcon(doc.file);
                                const categoryInfo = categories.find(cat => cat.id === doc.category);

                                return (
                                    <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDocument(doc)}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 ${categoryInfo ? 'bg-primary-100' : 'bg-neutral-100'} rounded-xl`}>
                                                    <FileIcon className={`h-6 w-6 ${categoryInfo ? categoryInfo.color : 'text-neutral-600'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-text-primary text-lg truncate mb-1">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                                                        {doc.description || 'No description available'}
                                                    </p>

                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge variant="secondary" size="sm">
                                                            {categoryInfo?.name || doc.category}
                                                        </Badge>
                                                        <span className="text-xs text-text-tertiary">
                                                            {getFileSize(doc.file_size)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-xs text-text-tertiary">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(doc.created_at).toLocaleDateString()}
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="personal" className="space-y-6">
                    {/* Personal Documents */}
                    {empDocsLoading ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
                                    <p className="text-text-secondary font-medium">Loading your documents...</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : filteredEmployeeDocuments.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <User className="h-16 w-16 text-neutral-400" />
                                    <div className="text-center">
                                        <p className="text-text-primary font-semibold text-lg">No personal documents</p>
                                        <p className="text-text-secondary">Documents uploaded specifically for you will appear here.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEmployeeDocuments.map((doc) => {
                                const FileIcon = getFileIcon(doc.file);

                                return (
                                    <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDocument(doc)}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-success-100 rounded-xl">
                                                    <FileIcon className="h-6 w-6 text-success-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-text-primary text-lg truncate mb-1">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                                                        {doc.description || 'Personal document'}
                                                    </p>

                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge variant="success" size="sm">
                                                            Personal
                                                        </Badge>
                                                        <span className="text-xs text-text-tertiary">
                                                            {getFileSize(doc.file_size)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-xs text-text-tertiary">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(doc.created_at).toLocaleDateString()}
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <Input
                            label="Document Title"
                            value={uploadForm.title}
                            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Category <span className="text-error-500">*</span>
                            </label>
                            <select
                                value={uploadForm.category}
                                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                                className="w-full h-11 px-4 py-3 border border-border-medium rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                File <span className="text-error-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-border-light rounded-lg p-4 hover:border-primary-400 transition-colors">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                    required
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                >
                                    <Upload className="h-8 w-8 text-text-tertiary mb-2" />
                                    <p className="text-sm text-text-secondary text-center">
                                        {uploadForm.file ? uploadForm.file.name : 'Click to select file'}
                                    </p>
                                    <p className="text-xs text-text-tertiary mt-1">
                                        PDF, DOC, DOCX, JPG, PNG, XLS up to 10MB
                                    </p>
                                </label>
                            </div>
                        </div>

                        <Input
                            label="Description (Optional)"
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                            placeholder="Brief description of the document"
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsUploadDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!uploadForm.title || !uploadForm.category || !uploadForm.file}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Document
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Document Viewer Dialog */}
            <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    {selectedDocument && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    {selectedDocument.title}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {/* Document Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">Category</p>
                                        <p className="text-sm text-text-secondary">
                                            {categories.find(cat => cat.id === selectedDocument.category)?.name || selectedDocument.category}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">File Size</p>
                                        <p className="text-sm text-text-secondary">{getFileSize(selectedDocument.file_size)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">Uploaded</p>
                                        <p className="text-sm text-text-secondary">
                                            {new Date(selectedDocument.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">Uploaded By</p>
                                        <p className="text-sm text-text-secondary">{selectedDocument.uploaded_by || 'System'}</p>
                                    </div>
                                </div>

                                {/* Document Description */}
                                {selectedDocument.description && (
                                    <div className="p-4 border border-border-light rounded-lg">
                                        <p className="text-sm font-medium text-text-primary mb-2">Description</p>
                                        <p className="text-sm text-text-secondary">{selectedDocument.description}</p>
                                    </div>
                                )}

                                {/* Document Preview */}
                                <div className="border border-border-light rounded-lg p-8 bg-neutral-50">
                                    <div className="flex flex-col items-center gap-4">
                                        <FileText className="h-16 w-16 text-primary-600" />
                                        <div className="text-center">
                                            <p className="text-text-primary font-semibold text-lg">{selectedDocument.title}</p>
                                            <p className="text-text-secondary mt-1">
                                                Document preview is not available in this view.
                                            </p>
                                            <p className="text-sm text-text-tertiary mt-2">
                                                Click download to view the full document.
                                            </p>
                                        </div>
                                        <Button className="mt-4">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Document
                                        </Button>
                                    </div>
                                </div>

                                {/* Version History (Placeholder) */}
                                <div className="border border-border-light rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-text-primary flex items-center gap-2">
                                            <History className="h-4 w-4" />
                                            Version History
                                        </h4>
                                        <Badge variant="secondary" size="sm">Coming Soon</Badge>
                                    </div>
                                    <p className="text-sm text-text-secondary">
                                        Version history and document collaboration features will be available in a future update.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DocumentsPage;
